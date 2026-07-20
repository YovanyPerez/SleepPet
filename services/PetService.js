export const PETS = [

  {
    id: "cat",
    name: "Cat",
    emoji: "🐱",
    price: 0,
    folder: "cat",
    available: true,
  },

  {
    id: "dog",
    name: "Dog",
    emoji: "🐶",
    price: 100,
    folder: "dog",
    available: true,
  },

  {
    id: "panda",
    name: "Panda",
    emoji: "🐼",
    price: 250,
    folder: "panda",
    available: false,
  },

  {
    id: "fox",
    name: "Fox",
    emoji: "🦊",
    price: 450,
    folder: "fox",
    available: false,
  },

  {
    id: "penguin",
    name: "Penguin",
    emoji: "🐧",
    price: 700,
    folder: "penguin",
    available: false,
  },

  {
    id: "frog",
    name: "Frog",
    emoji: "🐸",
    price: 1000,
    folder: "frog",
    available: false,
  },

  {
    id: "bear",
    name: "Bear",
    emoji: "🐻",
    price: 1500,
    folder: "bear",
    available: false,
  },

  {
    id: "dragon",
    name: "Dragon",
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