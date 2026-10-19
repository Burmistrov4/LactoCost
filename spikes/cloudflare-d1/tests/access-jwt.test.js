import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { accessTokenFromRequest, verifyAccessJwt } from "../src/security/access-jwt.js";

const domain = "example.cloudflareaccess.com";
const audience = "expected-app-aud";
const nowMs = Date.parse("2026-10-09T12:00:00Z");
const enc = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
const makeToken = async (privateKey, claims, header = { alg: "RS256", kid: "key-1", typ: "JWT" }) => {
  const first = enc(header);
  const second = enc(claims);
  const signingInput = first + "." + second;
  const signature = await webcrypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" }, privateKey, new TextEncoder().encode(signingInput),
  );
  return signingInput + "." + Buffer.from(signature).toString("base64url");
};

async function fixture(overrides = {}) {
  const pair = await webcrypto.subtle.generateKey({
    name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256",
  }, true, ["sign", "verify"]);
  const jwk = await webcrypto.subtle.exportKey("jwk", pair.publicKey);
  Object.assign(jwk, { kid: "key-1", use: "sig", alg: "RS256" });
  const claims = {
    iss: "https://" + domain, aud: audience, sub: "stable-subject-123",
    iat: Math.floor(nowMs / 1000) - 30, nbf: Math.floor(nowMs / 1000) - 10,
    exp: Math.floor(nowMs / 1000) + 300, email: "user@example.test", ...overrides,
  };
  const token = await makeToken(pair.privateKey, claims);
  const fetchImpl = async (url) => {
    assert.equal(String(url), "https://" + domain + "/cdn-cgi/access/certs");
    return { ok: true, async json() { return { keys: [jwk] }; } };
  };
  return { token, pair, claims, jwk, fetchImpl };
}

test("verifica firma RS256 y claims y devuelve sujeto estable", async () => {
  const f = await fixture();
  const result = await verifyAccessJwt(f.token, { teamDomain: domain, audience, fetchImpl: f.fetchImpl, cryptoImpl: webcrypto, nowMs });
  assert.equal(result.subject, "stable-subject-123");
  assert.equal(result.issuer, "https://" + domain);
  assert.equal(result.email, "user@example.test");
  assert.ok(Object.isFrozen(result));
});

test("rechaza token ausente, formato inválido y algoritmo distinto", async () => {
  await assert.rejects(() => verifyAccessJwt("", { teamDomain: domain, audience }), /jwt_missing_or_invalid/);
  await assert.rejects(() => verifyAccessJwt("not-a-real-jwt-token.string", { teamDomain: domain, audience }), /jwt_format_invalid/);
  const f = await fixture();
  const token = await makeToken(f.pair.privateKey, f.claims, { alg: "none", kid: "key-1" });
  await assert.rejects(() => verifyAccessJwt(token, { teamDomain: domain, audience, fetchImpl: f.fetchImpl, cryptoImpl: webcrypto, nowMs }), /jwt_algorithm_or_key_invalid/);
});

test("rechaza issuer, audience, expiración, nbf y subject inválidos", async () => {
  for (const [override, error] of [
    [{ iss: "https://attacker.invalid" }, /jwt_issuer_invalid/],
    [{ aud: "other-aud" }, /jwt_audience_invalid/],
    [{ exp: Math.floor(nowMs / 1000) }, /jwt_expired_or_exp_invalid/],
    [{ nbf: Math.floor(nowMs / 1000) + 100 }, /jwt_not_yet_valid/],
    [{ sub: "" }, /jwt_subject_invalid/],
  ]) {
    const f = await fixture(override);
    await assert.rejects(() => verifyAccessJwt(f.token, { teamDomain: domain, audience, fetchImpl: f.fetchImpl, cryptoImpl: webcrypto, nowMs }), error);
  }
});

test("rechaza firma alterada y clave de firma ausente", async () => {
  const f = await fixture();
  const segments = f.token.split(".");
  segments[1] = enc({ ...f.claims, sub: "forged-subject" });
  await assert.rejects(() => verifyAccessJwt(segments.join("."), { teamDomain: domain, audience, fetchImpl: f.fetchImpl, cryptoImpl: webcrypto, nowMs }), /jwt_signature_invalid/);
  const noKeyFetch = async () => ({ ok: true, async json() { return { keys: [] }; } });
  await assert.rejects(() => verifyAccessJwt(f.token, { teamDomain: domain, audience, fetchImpl: noKeyFetch, cryptoImpl: webcrypto, nowMs }), /access_signing_key_not_found/);
});

test("falla cerrado si no se puede obtener JWKS o falta configuración", async () => {
  const f = await fixture();
  await assert.rejects(() => verifyAccessJwt(f.token, { teamDomain: domain, audience, fetchImpl: async () => { throw new Error("network"); }, cryptoImpl: webcrypto, nowMs }), /access_jwks_unavailable/);
  await assert.rejects(() => verifyAccessJwt(f.token, { teamDomain: domain, audience: "", fetchImpl: f.fetchImpl, cryptoImpl: webcrypto, nowMs }), /access_configuration_missing/);
});

test("solo extrae la aserción de Access de su cabecera dedicada", () => {
  const request = new Request("https://local.invalid", { headers: { "CF-Access-Jwt-Assertion": "signed.jwt.token" } });
  assert.equal(accessTokenFromRequest(request), "signed.jwt.token");
  assert.throws(() => accessTokenFromRequest(new Request("https://local.invalid")), /jwt_missing_or_invalid/);
});
