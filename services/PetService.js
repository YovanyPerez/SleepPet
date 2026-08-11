export const PETS = [

  {
    id: "cat",
    nameKey: "pet_cat",
    emoji: "🐱",
    price: 0,
    folder: "cat",
    available: true,
  },

  {
    id: "dog",
    nameKey: "pet_dog",
    emoji: "🐶",
    price: 100,
    folder: "dog",
    available: true,
  },

  {
    id: "panda",
    nameKey: "pet_panda",
    emoji: "🐼",
    price: 250,
    folder: "panda",
    available: false,
  },

  {
    id: "fox",
    nameKey: "pet_fox",
    emoji: "🦊",
    price: 450,
    folder: "fox",
    available: false,
  },

  {
    id: "penguin",
    nameKey: "pet_penguin",
    emoji: "🐧",
    price: 700,
    folder: "penguin",
    available: false,
  },

  {
    id: "frog",
    nameKey: "pet_frog",
    emoji: "🐸",
    price: 1000,
    folder: "frog",
    available: false,
  },

  {
    id: "bear",
    nameKey: "pet_bear",
    emoji: "🐻",
    price: 1500,
    folder: "bear",
    available: false,
  },

  {
    id: "dragon",
    nameKey: "pet_dragon",
    emoji: "🐉",
    price: 3000,
    folder: "dragon",
    available: false,
  },

];

export function getPet(id) {

  return PETS.find((pet) => pet.id === id);

}

export function isPetOwned(id, ownedPets) {

  return ownedPets.includes(id);

}

export function canBuyPet(pet, coins) {

  return pet.available && coins >= pet.price;

}