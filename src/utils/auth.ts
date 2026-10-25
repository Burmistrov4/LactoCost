import { UserProfile, UserRole, ViewId } from '../types';

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user-owner',
    name: 'Elena (Dueña & Maestra Artesana)',
    username: 'elena',
    role: 'owner',
    avatarEmoji: '👩‍🍳',
    pin: '1234',
    email: 'elena@deliciasfloramarillo.com',
    createdAt: '2026-01-01T00:00:00.000Z',
    lastLoginAt: '2026-10-21T06:00:00.000Z',
  },
  {
    id: 'user-sales',
    name: 'Sofía (Caja & Despacho)',
    username: 'sofia',
    role: 'sales',
    avatarEmoji: '🛍️',
    pin: '0000',
    email: 'ventas@deliciasfloramarillo.com',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-production',
    name: 'Carlos (Taller & Insumos)',
    username: 'carlos',
    role: 'production',
    avatarEmoji: '🥣',
    pin: '5555',
    email: 'taller@deliciasfloramarillo.com',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

const USERS_STORAGE_KEY = 'flor_amarillo_users_v1';
const CURRENT_USER_ID_KEY = 'flor_amarillo_current_user_id';
const IS_AUTH_KEY = 'flor_amarillo_is_authenticated';

export function getStoredUsers(): UserProfile[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading stored users, using defaults:', e);
  }
  return DEFAULT_USERS;
}

export function saveUsers(users: UserProfile[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Error saving users to storage:', e);
  }
}

export function getInitialAuth(): { currentUser: UserProfile | null; isAuthenticated: boolean } {
  try {
    const users = getStoredUsers();
    const isAuthStored = localStorage.getItem(IS_AUTH_KEY);
    // Explicitly logged out
    if (isAuthStored === 'false') {
      return {
        currentUser: null,
        isAuthenticated: false,
      };
    }
    const currentId = localStorage.getItem(CURRENT_USER_ID_KEY);
    if (currentId) {
      const found = users.find((u) => u.id === currentId);
      if (found) {
        return { currentUser: found, isAuthenticated: true };
      }
    }
    // First time visitor: start as owner by default for immediate preview
    const defaultUser = users[0] || DEFAULT_USERS[0];
    return {
      currentUser: defaultUser,
      isAuthenticated: true,
    };
  } catch (e) {
    return {
      currentUser: DEFAULT_USERS[0],
      isAuthenticated: true,
    };
  }
}

export function saveAuthSession(user: UserProfile | null, isAuthenticated: boolean): void {
  try {
    if (user && isAuthenticated) {
      localStorage.setItem(CURRENT_USER_ID_KEY, user.id);
      localStorage.setItem(IS_AUTH_KEY, 'true');
    } else {
      localStorage.removeItem(CURRENT_USER_ID_KEY);
      localStorage.setItem(IS_AUTH_KEY, 'false');
    }
  } catch (e) {
    console.warn('Error saving auth session:', e);
  }
}

export const ROLE_LABELS: Record<UserRole, { label: string; badge: string; desc: string }> = {
  owner: {
    label: 'Dueña / Administradora General',
    badge: 'ACCESO TOTAL',
    desc: 'Visualiza y edita recetas, costos reales de insumos, fórmulas de CPP, fijación de precios, tasas y márgenes de ganancia.',
  },
  sales: {
    label: 'Ventas, Caja & Atención al Cliente',
    badge: 'OPERACIONES & CAJA',
    desc: 'Registra ventas rápidas, cobra en $ y Bs., calcula vuelto exacto, consulta precios y envía pedidos de WhatsApp.',
  },
  production: {
    label: 'Taller, Recetas & Control de Stock',
    badge: 'PRODUCCIÓN & STOCK',
    desc: 'Registra producción de lotes, recetas, rendimiento de leche y control físico de envases (8oz a 32oz).',
  },
};

export function canAccessView(role: UserRole, view: ViewId): boolean {
  if (role === 'owner') return true;

  if (role === 'sales') {
    // Sales role has access to selling, customer pricing, WhatsApp assistant, daily dashboard, and CSV reports
    return ['dashboard', 'pricing', 'sales', 'growth', 'reports'].includes(view);
  }

  if (role === 'production') {
    // Production role has access to workshop catalog, inventory stock, recipe batches, suggested purchases and dashboard
    return ['dashboard', 'products', 'inventory', 'production', 'purchases', 'reports'].includes(view);
  }

  return true;
}
