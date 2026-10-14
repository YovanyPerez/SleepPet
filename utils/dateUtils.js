export function toDateKey(date) {

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;

}

// El dia de sueno va de 12:00 a 12:00: la noche del 4 al 5 cuenta como dia 4.
// Asi una siesta de tarde y la noche siguiente son el MISMO dia de sueno, y
// acostarse a las 22:00 o a las 00:30 no cambia nada.
export const SLEEP_DAY_OFFSET_HOURS = 12;

// ponytail: restar 12h cruza el cambio de hora dos veces al ano; una sesion que
// termine en la franja de 1h alrededor del mediodio local puede atribuirse al
// dia anterior. Ventana de 1h, dos veces al ano: se acepta.
export function toSleepDayKey(date) {

  return toDateKey(
    new Date(date.getTime() - SLEEP_DAY_OFFSET_HOURS * 3600000)
  );

}

export function getWeekDates(reference = new Date()) {

  const day = reference.getDay();

  const diffToMonday =
    day === 0 ? 6 : day - 1;

  const monday = new Date(reference);

  monday.setDate(
    reference.getDate() - diffToMonday
  );

  monday.setHours(0, 0, 0, 0);

  const days = [];

  for (let i = 0; i < 7; i++) {

    const date = new Date(monday);

    date.setDate(monday.getDate() + i);

    days.push(date);

  }

  return days;

}
