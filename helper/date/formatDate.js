export function utcToJakartaISO(utcString) {
  const date = new Date(utcString);
  const jakartaOffsetMs = 7 * 60 * 60 * 1000; // +7 jam
  const jakartaDate = new Date(date.getTime() + jakartaOffsetMs);
  return jakartaDate.toISOString();
}

export const dateDifference = (end, start) => {
    let diff = end - start;
    let minutes = Math.floor(diff / 60000);
    let seconds = Math.floor((diff % 60000) / 1000);

    let result = `${minutes} min ${seconds} sec`;

    if (minutes === 0) result = `${seconds} sec`;

    return result;
}
