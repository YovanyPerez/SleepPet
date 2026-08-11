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
