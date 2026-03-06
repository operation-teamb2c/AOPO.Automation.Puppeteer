export function utcToJakartaISO(utcString) {
  const date = new Date(utcString);
  const jakartaOffsetMs = 7 * 60 * 60 * 1000; // +7 jam
  const jakartaDate = new Date(date.getTime() + jakartaOffsetMs);
  return jakartaDate.toISOString();
}