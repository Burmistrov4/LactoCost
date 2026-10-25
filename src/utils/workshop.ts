import { WorkshopProfile, ArtisanCategory } from '../types';

export const DEFAULT_WORKSHOP_PROFILE: WorkshopProfile = {
  name: 'CostoProfit',
  tagline: 'Control de Costos, Recetas & Rentabilidad Artesanal',
  category: 'dairy',
  categoryLabel: 'Lácteos & Postres Tradicionales',
  location: 'Valencia Sur, Carabobo',
  phone: '0414-0000000',
  deliveryZones: 'Valencia Sur, Flor Amarillo, La Isabelica y alrededores',
  monogram: 'CP',
  logoEmoji: '📈',
  instagramUser: '@costoprofit',
};

export interface WorkshopPreset {
  id: string;
  name: string;
  tagline: string;
  category: ArtisanCategory;
  categoryLabel: string;
  emoji: string;
  monogram: string;
  sampleLocation: string;
}

export const WORKSHOP_PRESETS: WorkshopPreset[] = [
  {
    id: 'costoprofit-default',
    name: 'CostoProfit',
    tagline: 'Costos Reales (CPP), Precios en $ y Bs., Rendimiento & Margen',
    category: 'dairy',
    categoryLabel: 'Costeo & Rentabilidad Gastronómica',
    emoji: '📈',
    monogram: 'CP',
    sampleLocation: 'Valencia, Venezuela',
  },
  {
    id: 'dairy-sweets',
    name: 'Delicias Flor Amarillo',
    tagline: 'Yogures, Quesillo & Torta de Pan',
    category: 'dairy',
    categoryLabel: 'Lácteos & Postres Tradicionales',
    emoji: '🥛',
    monogram: 'FA',
    sampleLocation: 'Valencia Sur, Carabobo',
  },
  {
    id: 'artisan-bakery',
    name: 'Horno & Masa Artesanal',
    tagline: 'Panes de Masa Madre, Golfeados & Torta de Pan',
    category: 'bakery',
    categoryLabel: 'Panadería & Bollería Criolla',
    emoji: '🍞',
    monogram: 'HM',
    sampleLocation: 'Los Guayos / Valencia',
  },
  {
    id: 'pastry-workshop',
    name: 'Aroma & Vainilla Pastelería',
    tagline: 'Postres por Ración, Tartaletas & Marquesas',
    category: 'pastry',
    categoryLabel: 'Repostería Fina & Postres Fríos',
    emoji: '🧁',
    monogram: 'AV',
    sampleLocation: 'Prebo / El Viñedo, Valencia',
  },
  {
    id: 'flan-quesillo',
    name: 'La Casa del Quesillo',
    tagline: 'Quesillos Tradicionales, Auyama, Coco & Café',
    category: 'flan',
    categoryLabel: 'Flanes & Quesillos Tradicionales',
    emoji: '🍮',
    monogram: 'CQ',
    sampleLocation: 'La Candelaria, Valencia Sur',
  },
  {
    id: 'chocolatier',
    name: 'Cacao Real Taller',
    tagline: 'Bombones Criollos, Tabletas & Untables',
    category: 'chocolate',
    categoryLabel: 'Chocolatería & Cacao Venezolano',
    emoji: '🍫',
    monogram: 'CR',
    sampleLocation: 'Naguanagua, Carabobo',
  },
];

const WORKSHOP_STORAGE_KEY = 'artesano_workshop_profile_v1';
const WORKSHOP_CUSTOMIZED_KEY = 'artesano_workshop_customized_v1';

export function getStoredWorkshopProfile(): WorkshopProfile {
  try {
    const raw = localStorage.getItem(WORKSHOP_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.name === 'string' && parsed.name.trim().length > 0) {
        // If it was the prior default "Delicias Flor Amarillo" without explicit customization, update to CostoProfit
        if (parsed.name === 'Delicias Flor Amarillo' && localStorage.getItem(WORKSHOP_CUSTOMIZED_KEY) !== 'true') {
          return DEFAULT_WORKSHOP_PROFILE;
        }
        return {
          ...DEFAULT_WORKSHOP_PROFILE,
          ...parsed,
        };
      }
    }
  } catch (err) {
    console.warn('Error reading workshop profile from storage:', err);
  }
  return DEFAULT_WORKSHOP_PROFILE;
}

export function saveWorkshopProfile(profile: WorkshopProfile): void {
  try {
    localStorage.setItem(WORKSHOP_STORAGE_KEY, JSON.stringify(profile));
    localStorage.setItem(WORKSHOP_CUSTOMIZED_KEY, 'true');
  } catch (err) {
    console.warn('Error saving workshop profile to storage:', err);
  }
}

export function generateMonogram(name: string): string {
  if (!name || !name.trim()) return 'AT';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  // Take first letters of non-preposition words
  const ignore = ['de', 'del', 'la', 'el', 'los', 'las', 'y', 'en'];
  const significant = parts.filter((w) => !ignore.includes(w.toLowerCase()));
  if (significant.length >= 2) {
    return (significant[0][0] + significant[1][0]).toUpperCase();
  }
  return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
}
