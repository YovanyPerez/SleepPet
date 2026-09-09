// Harness TDD para detección de usuario nuevo/existente
// Uso: node tools/testUserData.js
// RED: debe FALLAR hasta implementar services/UserDataService.js
import { hasExistingUserData, isNewUser } from "../services/UserDataService.js";

const FRESH = {
  userName: "",
  sleepHistory: [],
  level: 1,
  xp: 0,
  coins: 0,
  streak: 0,
  ownedPets: ["cat"],
  unlockedAchievements: [],
  lastStreakDateKey: null,
  goalType: "",
};

let failures = 0;
function check(name, cond) {
  console.log(`${cond ? "OK  " : "FAIL"} | ${name}`);
  if (!cond) failures++;
}

// 1. Estado completamente nuevo → nuevo
check("nuevo total → isNewUser", isNewUser(FRESH) === true);
check("nuevo total → !hasExisting", hasExistingUserData(FRESH) === false);

// 2. Existente con historial → existente
check("con historial → existente", hasExistingUserData({ ...FRESH, userName: "Ana", sleepHistory: [{ hours: 7 }] }) === true);

// 3. Existente con hasCompletedOnboarding=false → el flag NO decide (datos mandan)
check("datos + flag false → existente", hasExistingUserData({ ...FRESH, userName: "Ana", xp: 40 }) === true);

// 4. Parcial: solo nombre, resto inicial → sigue nuevo (recién creado)
check("solo nombre → nuevo", isNewUser({ ...FRESH, userName: "Ana" }) === true);

// 5. Nombre + level>1 → existente
check("level 2 → existente", hasExistingUserData({ ...FRESH, userName: "Ana", level: 2 }) === true);

// 6. Post-reset → nuevo
check("post-reset → nuevo", isNewUser({ ...FRESH }) === true);

// Señales fuertes aisladas → existente
check("xp>0 → existente", hasExistingUserData({ ...FRESH, xp: 10 }) === true);
check("coins>0 → existente", hasExistingUserData({ ...FRESH, coins: 5 }) === true);
check("streak>0 → existente", hasExistingUserData({ ...FRESH, streak: 1 }) === true);
check("logros → existente", hasExistingUserData({ ...FRESH, unlockedAchievements: ["a1"] }) === true);
check("lastStreakDateKey → existente", hasExistingUserData({ ...FRESH, lastStreakDateKey: "2026-09-08" }) === true);
check("mascota extra → existente", hasExistingUserData({ ...FRESH, ownedPets: ["cat", "dog"] }) === true);

// Solo débiles (nombre + objetivo, sin progreso) → nuevo
check("nombre+objetivo sin progreso → nuevo", isNewUser({ ...FRESH, userName: "Ana", goalType: "habits" }) === true);

// Flag + dato real → existente (el flag NUNCA decide solo)
check("flag + nombre → existente", hasExistingUserData({ ...FRESH, userName: "Ana", hasCompletedOnboarding: true }) === true);
check("flag solo sin nada → nuevo", isNewUser({ ...FRESH, hasCompletedOnboarding: true }) === true);

const total = 15;
console.log(failures === 0 ? `=== ${total}/${total} OK ===` : `=== ${total - failures}/${total} OK, ${failures} FAIL ===`);
process.exit(failures === 0 ? 0 : 1);
