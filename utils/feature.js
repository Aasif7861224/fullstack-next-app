export function getFeaturedTill(durationDays) {
  const till = new Date();
  till.setDate(till.getDate() + durationDays);
  return till;
}

