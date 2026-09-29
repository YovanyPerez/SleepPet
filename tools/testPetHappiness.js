// Harness felicidad→mood de la mascota
// Uso: node tools/testPetHappiness.js
import {
  calculatePetHappiness,
  decayPetHappiness,
  moodForHappiness,
  HAPPINESS_SAD_BELOW,
} from "../services/PetHappinessService.js";

let failures = 0;
function check(name, cond) {
  console.log(`${cond ? "OK  " : "FAIL"} | ${name}`);
  if (!cond) failures++;
}

// 1. Mala noche resta 12
check("score<60 resta 12", calculatePetHappiness(50, { score: 40, hours: 5 }) === 38);
// 2. Buena noche suma y bonus 7h
check("score>=90 + bonus 7h suma 12", calculatePetHappiness(50, { score: 95, hours: 7 }) === 62);
// 3. Clamp 0-100
check("clamp inferior", calculatePetHappiness(5, { score: 10, hours: 1 }) === 0);
check("clamp superior", calculatePetHappiness(95, { score: 95, hours: 8 }) === 100);
// 4. Decaimiento con gracia 6h
check("sin decaimiento en gracia", decayPetHappiness(80, 5) === 80);
check("decae 1/h tras gracia", decayPetHappiness(80, 10) === 76);
// 5. Mood: felicidad baja pisa a triste aunque el score diga happy
check("umbral exportado 25", HAPPINESS_SAD_BELOW === 25);
check("h<25 => sad aunque happy", moodForHappiness(10, "happy") === "sad");
check("h<25 => sad aunque normal", moodForHappiness(24.9, "normal") === "sad");
check("h=25 respeta score", moodForHappiness(25, "happy") === "happy");
check("h alta respeta score", moodForHappiness(80, "sleepy") === "sleepy");
// 6. Solo degrada: si ya es sad, queda sad
check("sad + h baja sigue sad", moodForHappiness(5, "sad") === "sad");

const TOTAL = 12;
console.log(failures === 0 ? `=== ${TOTAL}/${TOTAL} OK ===` : `=== ${TOTAL - failures}/${TOTAL} OK, ${failures} FAIL ===`);
process.exit(failures === 0 ? 0 : 1);
