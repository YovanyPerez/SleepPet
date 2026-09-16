import { AVAILABLE_PETS } from "../constants/PetImages";
import { meetsLevelRequirement } from "./ShopService";

// minLevel: candado de compra por nivel (las poseídas nunca se bloquean).
// Curva: normales 1-5, legendarias 6/8/12.
export const PETS = [

  {
    id: "cat",
    nameKey: "pet_cat",
    price: 0,
    minLevel: 1,
    folder: "cat",
  },

  {
    id: "dog",
    nameKey: "pet_dog",
    price: 100,
    minLevel: 1,
    folder: "dog",
  },

  {
    id: "panda",
    nameKey: "pet_panda",
    price: 250,
    minLevel: 2,
    folder: "panda",
  },

  {
    id: "fox",
    nameKey: "pet_fox",
    price: 450,
    minLevel: 2,
    folder: "fox",
  },

  {
    id: "seal",
    nameKey: "pet_seal",
    price: 600,
    minLevel: 3,
    folder: "seal",
  },

  {
    id: "penguin",
    nameKey: "pet_penguin",
    price: 700,
    minLevel: 3,
    folder: "penguin",
  },

  {
    id: "frog",
    nameKey: "pet_frog",
    price: 1000,
    minLevel: 4,
    folder: "frog",
  },

  {
    id: "bear",
    nameKey: "pet_bear",
    price: 1500,
    minLevel: 5,
    folder: "bear",
  },

  {
    id: "dragon",
    nameKey: "pet_dragon",
    price: 3000,
    minLevel: 6,
    folder: "dragon",
  },

  {
    id: "hippogriff",
    nameKey: "pet_hippogriff",
    price: 5500,
    minLevel: 8,
    folder: "hippogriff",
  },

  {
    id: "unicorn",
    nameKey: "pet_unicorn",
    price: 10000,
    minLevel: 12,
    folder: "unicorn",
  },

].map((pet) => ({

  ...pet,

  available: AVAILABLE_PETS.includes(pet.id),

}));

export function getPet(id) {

  return PETS.find((pet) => pet.id === id);

}

export function canBuyPet(pet, coins, level = 1) {

  return (
    pet.available &&
    coins >= pet.price &&
    meetsLevelRequirement(pet, level)
  );

}
