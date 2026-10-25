import { ColorPaletteId, ColorPaletteInfo } from '../types';

export const COLOR_PALETTES: ColorPaletteInfo[] = [
  {
    id: 'vanilla',
    name: 'Vainilla & Nieve',
    emoji: '🥛',
    description: 'Fresco, limpio y natural para yogures y lácteos frescos',
    previewColors: ['#1b4332', '#26785c', '#c6f157', '#f8faf7'],
  },
  {
    id: 'caramel',
    name: 'Quesillo & Caramelo',
    emoji: '🍮',
    description: 'Cálido, dorado y acaramelado para postres horneados',
    previewColors: ['#78350f', '#b45309', '#fde68a', '#fbf8f3'],
  },
  {
    id: 'berry',
    name: 'Mora & Frambuesa',
    emoji: '🍓',
    description: 'Dulce, vivo y distinguido para mermeladas y yogures frutados',
    previewColors: ['#701a75', '#be185d', '#fbcfe8', '#fcf8fa'],
  },
  {
    id: 'coffee',
    name: 'Torta de Pan & Café',
    emoji: '☕',
    description: 'Tradición criolla, panela, canela y calidez hogareña',
    previewColors: ['#431407', '#9a3412', '#fed7aa', '#f7f4ee'],
  },
  {
    id: 'midnight',
    name: 'Taller Nocturno (Oscuro)',
    emoji: '🌙',
    description: 'Modo oscuro elegante y de alto contraste para descansar la vista',
    previewColors: ['#0c1412', '#14211d', '#34d399', '#f1f6f2'],
  },
];

const THEME_STORAGE_KEY = 'flor_amarillo_color_palette';

export function getSavedTheme(): ColorPaletteId {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && COLOR_PALETTES.some((p) => p.id === saved)) {
      return saved as ColorPaletteId;
    }
  } catch (e) {
    // ignore
  }
  return 'vanilla';
}

export function applyTheme(paletteId: ColorPaletteId): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, paletteId);
  } catch (e) {
    // ignore
  }

  const root = document.documentElement;
  root.setAttribute('data-theme', paletteId);
}
