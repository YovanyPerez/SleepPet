// Cat y dog usan require estáticos (base segura: funcionan siempre,
// incluso si el escaneo dinámico no estuviera disponible).
// El resto de mascotas se detectan dinámicamente: si existe una carpeta
// assets/pets/<id>/ con los 4 moods (happy, normal, sleepy, sad), se usan
// esas imágenes; si no, se muestra comingsoon.png.
// Requiere `unstable_allowRequireContext` en metro.config.js.

const MOODS = ["happy", "normal", "sleepy", "sad"];

const STATIC_BASE = {
  cat: {
    happy: require("../assets/pets/cat/happy.png"),
    normal: require("../assets/pets/cat/normal.png"),
    sleepy: require("../assets/pets/cat/sleepy.png"),
    sad: require("../assets/pets/cat/sad.png"),
  },
  dog: {
    happy: require("../assets/pets/dog/happy.png"),
    normal: require("../assets/pets/dog/normal.png"),
    sleepy: require("../assets/pets/dog/sleepy.png"),
    sad: require("../assets/pets/dog/sad.png"),
  },
};

const COMING_SOON = require("../assets/pets/comingsoon.png");

const PET_IDS = [
  "cat",
  "dog",
  "panda",
  "fox",
  "seal",
  "penguin",
  "frog",
  "bear",
  "dragon",
];

let found = {};

try {

  const ctx = require.context("../assets/pets", true, /\.png$/);

  for (const key of ctx.keys()) {

    const parts = key.replace(/^\.\//, "").split("/");

    if (parts.length !== 2) continue;

    const [id, file] = parts;

    const mood = file.replace(/\.png$/, "");

    if (MOODS.includes(mood)) {

      found[id] = found[id] || {};

      found[id][mood] = ctx(key);

    }

  }

} catch (e) {

  found = {};

}

export const PET_IMAGES = {};

for (const id of PET_IDS) {

  PET_IMAGES[id] = {};

  for (const mood of MOODS) {

    PET_IMAGES[id][mood] =
      found[id]?.[mood] ??
      STATIC_BASE[id]?.[mood] ??
      COMING_SOON;

  }

}

// Mascotas que tienen los 4 moods: se muestran como disponibles en la tienda.
export const AVAILABLE_PETS = PET_IDS.filter(
  (id) => MOODS.every((m) => PET_IMAGES[id][m] !== COMING_SOON)
);