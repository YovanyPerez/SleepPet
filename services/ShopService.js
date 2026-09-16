// Tienda: consumibles y gastos recurrentes para usuarios veteranos.
// Lógica pura (sin React Native) — harness en tools/testShop.js.
// Los precios son el sumidero de monedas: ingreso ~5-50/noche.

export const CONSUMABLES = [
  {
    id: "snack",
    icon: "cake",
    nameKey: "shopSnack",
    descKey: "shopSnackDesc",
    price: 50,
    happiness: 15,
  },
  {
    id: "feast",
    icon: "heart",
    nameKey: "shopFeast",
    descKey: "shopFeastDesc",
    price: 120,
    happiness: 30,
  },
  {
    id: "toy",
    icon: "sparkles",
    nameKey: "shopToy",
    descKey: "shopToyDesc",
    price: 200,
    happiness: 50,
  },
];

export const SHIELD_PRICE = 300;

export const RENAME_PRICE = 100;

const MIN_HAPPINESS = 0;
const MAX_HAPPINESS = 100;

// Aplica la ganancia de felicidad de un consumible con clamp 0..100.
export function applyConsumable(current, happiness) {
  return Math.max(
    MIN_HAPPINESS,
    Math.min(MAX_HAPPINESS, current + happiness)
  );
}

// Candado de nivel para comprar mascotas (minLevel default 1).
export function meetsLevelRequirement(pet, level) {
  return level >= (pet.minLevel ?? 1);
}
