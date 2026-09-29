// Harness alerta de mascota triste (decisión pura, sin RN)
// Uso: node tools/testPetAlert.js
import {
  shouldSchedulePetAlert,
  PET_ALERT_DELAY_SEC,
} from "../services/PetHappinessService.js";

let failures = 0;
function check(name, cond) {
  console.log(`${cond ? "OK  " : "FAIL"} | ${name}`);
  if (!cond) failures++;
}

const T = "2026-09-28";

check("delay +4h", PET_ALERT_DELAY_SEC === 14400);
check(
  "felicidad baja + despierto + sin aviso hoy => agenda",
  shouldSchedulePetAlert({ happiness: 10, sleepSessionActive: false, lastAlertDateKey: null, todayKey: T }) === true
);
check(
  "felicidad >=25 no agenda",
  shouldSchedulePetAlert({ happiness: 25, sleepSessionActive: false, lastAlertDateKey: null, todayKey: T }) === false
);
check(
  "durmiendo no agenda",
  shouldSchedulePetAlert({ happiness: 10, sleepSessionActive: true, lastAlertDateKey: null, todayKey: T }) === false
);
check(
  "ya avisado hoy no reagenda",
  shouldSchedulePetAlert({ happiness: 10, sleepSessionActive: false, lastAlertDateKey: T, todayKey: T }) === false
);
check(
  "avisado ayer sí reagenda hoy",
  shouldSchedulePetAlert({ happiness: 10, sleepSessionActive: false, lastAlertDateKey: "2026-09-27", todayKey: T }) === true
);

const TOTAL = 6;
console.log(failures === 0 ? `=== ${TOTAL}/${TOTAL} OK ===` : `=== ${TOTAL - failures}/${TOTAL} OK, ${failures} FAIL ===`);
process.exit(failures === 0 ? 0 : 1);
