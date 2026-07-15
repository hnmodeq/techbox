const postDateFormatter = new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
  dateStyle: "long",
  timeZone: "Asia/Tehran",
});

export function formatPostDateFa(date: Date | string) {
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "";
  return postDateFormatter.format(value);
}

export function isPublicPostDate(date: Date | string, now = new Date()) {
  const value = typeof date === "string" ? new Date(date) : date;
  return !Number.isNaN(value.getTime()) && value.getTime() <= now.getTime();
}

export function publicPostDateWhere(now = new Date()) {
  return { lte: now };
}
