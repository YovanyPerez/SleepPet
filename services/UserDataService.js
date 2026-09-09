// Detección centralizada de usuario nuevo vs existente (REGLA CRÍTICA onboarding).
//
// Un usuario es NUEVO solo cuando la app no tiene información previa real.
// Ninguna señal decide sola: las FUERTES bastan por sí mismas, las DÉBILES
// solo suman contexto (ej. nombre recién creado sin progreso sigue siendo nuevo).
//
// - FUERTES (cualquiera → existente): historial, xp/coins/streak/level sobre
//   iniciales, logros, mascotas extra, lastStreakDateKey.
// - DÉBILES (no bastan): userName, goalType.
// - `hasCompletedOnboarding` NO decide solo JAMÁS: solo suma como fuerte cuando
//   ya hay al menos un dato débil real (nombre u objetivo). El flag solo, con
//   todo lo demás vacío, sigue siendo usuario nuevo (REGLA CRÍTICA).
// - Entrada: estado ya cargado por AppContext (no lee AsyncStorage, no crea
//   segunda fuente de verdad). Robusta a parciales/null/undefined.

const INITIAL = {
  level: 1,
  xp: 0,
  coins: 0,
  streak: 0,
  ownedPets: ["cat"],
};

function normStr(v) {
  return typeof v === "string" ? v.trim() : "";
}

export function hasExistingUserData(s = {}) {
  const history = Array.isArray(s.sleepHistory) ? s.sleepHistory : [];
  if (history.length > 0) return true;

  const achievements = Array.isArray(s.unlockedAchievements) ? s.unlockedAchievements : [];
  if (achievements.length > 0) return true;

  const pets = Array.isArray(s.ownedPets) ? s.ownedPets : INITIAL.ownedPets;
  if (pets.length > INITIAL.ownedPets.length) return true;

  if ((s.level ?? INITIAL.level) > INITIAL.level) return true;
  if ((s.xp ?? INITIAL.xp) > INITIAL.xp) return true;
  if ((s.coins ?? INITIAL.coins) > INITIAL.coins) return true;
  if ((s.streak ?? INITIAL.streak) > INITIAL.streak) return true;

  if (normStr(s.lastStreakDateKey) !== "") return true;

  // Flag + dato real: quien completó/omitió la guía pasó por Crear perfil
  // (siempre deja al menos nombre). Sin ningún dato, el flag solo no vale.
  if (s.hasCompletedOnboarding === true) {
    if (normStr(s.userName) !== "" || normStr(s.goalType) !== "") return true;
  }

  return false;
}

export function isNewUser(s = {}) {
  return !hasExistingUserData(s);
}
