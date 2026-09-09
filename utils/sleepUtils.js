export function calculateGoalHours(age) {

  if (!age || age <= 0) return 8;

  if (age <= 12) return 10;

  if (age <= 18) return 9;

  if (age <= 64) return 8;

  return 7;

}

// Solo dígitos (para sanitizar el TextInput de edad)
export function sanitizeAgeDigits(value) {
  return String(value ?? "").replace(/[^0-9]/g, "");
}

// Edad válida: entero de 1 a 99
export function isValidAge(value) {
  const digits = sanitizeAgeDigits(value);
  if (!/^[0-9]{1,2}$/.test(digits)) return false;
  const n = Number(digits);
  return n >= 1 && n <= 99;
}
