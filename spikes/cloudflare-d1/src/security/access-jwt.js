const base64UrlToBytes = (value) => {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("jwt_encoding_invalid");
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const decodeJsonSegment = (segment) => {
  const bytes = base64UrlToBytes(segment);
  return JSON.parse(new TextDecoder().decode(bytes));
};

const normalizeDomain = (value) => {
  if (typeof value !== "string" || !value.trim()) throw new Error("access_configuration_missing");
  const domain = value.trim().replace(/^https:\/\//i, "").replace(/\/$/, "").toLowerCase();
  if (!/^[a-z0-9.-]+$/.test(domain)) throw new Error("access_configuration_invalid");
  return domain;
};

/**
 * Verifies a Cloudflare Access RS256 JWT. Caller must obtain the token only from
 * CF-Access-Jwt-Assertion and must not trust identity claims before this succeeds.
 * This verifier intentionally does not decide authorization roles.
 */
export async function verifyAccessJwt(token, {
  teamDomain,
  audience,
  fetchImpl = fetch,
  cryptoImpl = crypto,
  nowMs = Date.now(),
} = {}) {
  const domain = normalizeDomain(teamDomain);
  if (typeof audience !== "string" || !audience.trim()) throw new Error("access_configuration_missing");
  if (typeof token !== "string" || token.length < 20 || token.length > 16384) throw new Error("jwt_missing_or_invalid");

  const segments = token.split(".");
  if (segments.length !== 3) throw new Error("jwt_format_invalid");

  let header;
  let claims;
  let signature;
  let signingInput;
  try {
    header = decodeJsonSegment(segments[0]);
    claims = decodeJsonSegment(segments[1]);
    signature = base64UrlToBytes(segments[2]);
    signingInput = new TextEncoder().encode(segments[0] + "." + segments[1]);
  } catch {
    throw new Error("jwt_format_invalid");
  }

  if (header.alg !== "RS256" || typeof header.kid !== "string" || !header.kid) throw new Error("jwt_algorithm_or_key_invalid");
  const issuer = "https://" + domain;
  if (claims.iss !== issuer) throw new Error("jwt_issuer_invalid");
  const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!audiences.includes(audience)) throw new Error("jwt_audience_invalid");
  if (typeof claims.exp !== "number" || !Number.isFinite(claims.exp) || claims.exp <= Math.floor(nowMs / 1000)) {
    throw new Error("jwt_expired_or_exp_invalid");
  }
  if (claims.nbf !== undefined && (typeof claims.nbf !== "number" || !Number.isFinite(claims.nbf) || claims.nbf > Math.floor(nowMs / 1000))) {
    throw new Error("jwt_not_yet_valid");
  }
  if (typeof claims.sub !== "string" || !claims.sub.trim() || claims.sub.length > 255) throw new Error("jwt_subject_invalid");

  let response;
  try {
    response = await fetchImpl("https://" + domain + "/cdn-cgi/access/certs", {
      method: "GET",
      headers: { accept: "application/json" },
    });
  } catch {
    throw new Error("access_jwks_unavailable");
  }
  if (!response?.ok) throw new Error("access_jwks_unavailable");

  let jwks;
  try {
    jwks = await response.json();
  } catch {
    throw new Error("access_jwks_invalid");
  }
  if (!Array.isArray(jwks?.keys)) throw new Error("access_jwks_invalid");
  const jwk = jwks.keys.find((key) => key.kid === header.kid && key.kty === "RSA" && key.use !== "enc" && (!key.alg || key.alg === "RS256"));
  if (!jwk) throw new Error("access_signing_key_not_found");

  let publicKey;
  try {
    publicKey = await cryptoImpl.subtle.importKey("jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]);
    const valid = await cryptoImpl.subtle.verify({ name: "RSASSA-PKCS1-v1_5" }, publicKey, signature, signingInput);
    if (!valid) throw new Error("jwt_signature_invalid");
  } catch (error) {
    if (error?.message === "jwt_signature_invalid") throw error;
    throw new Error("jwt_signature_invalid");
  }

  return Object.freeze({
    subject: claims.sub,
    issuer: claims.iss,
    audience,
    issuedAt: Number.isFinite(claims.iat) ? claims.iat : null,
    expiresAt: claims.exp,
    email: typeof claims.email === "string" ? claims.email : null,
  });
}

export function accessTokenFromRequest(request) {
  const token = request?.headers?.get?.("CF-Access-Jwt-Assertion");
  if (!token) throw new Error("jwt_missing_or_invalid");
  return token;
}
