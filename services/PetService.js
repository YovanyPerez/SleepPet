import { AVAILABLE_PETS } from "../constants/PetImages";

export const PETS = [

  {
    id: "cat",
    nameKey: "pet_cat",
    price: 0,
    folder: "cat",
  },

  {
    id: "dog",
    nameKey: "pet_dog",
    price: 100,
    folder: "dog",
  },

  {
    id: "panda",
    nameKey: "pet_panda",
    price: 250,
    folder: "panda",
  },

  {
    id: "fox",
    nameKey: "pet_fox",
    price: 450,
    folder: "fox",
  },

  {
    id: "seal",
    nameKey: "pet_seal",
    price: 600,
    folder: "seal",
  },

  {
    id: "penguin",
    nameKey: "pet_penguin",
    price: 700,
    folder: "penguin",
  },

  {
    id: "frog",
    nameKey: "pet_frog",
    price: 1000,
    folder: "frog",
  },

  {
    id: "bear",
    nameKey: "pet_bear",
    price: 1500,
    folder: "bear",
  },

  {
    id: "dragon",
    nameKey: "pet_dragon",
    price: 3000,
    folder: "dragon",
  },

].map((pet) => ({

  ...pet,

  available: AVAILABLE_PETS.includes(pet.id),

}));

export function getPet(id) {

  return PETS.find((pet) => pet.id === id);

}

export function isPetOwned(id, ownedPets) {

  return ownedPets.includes(id);

}

export function canBuyPet(pet, coins) {

  return pet.available && coins >= pet.price;

}