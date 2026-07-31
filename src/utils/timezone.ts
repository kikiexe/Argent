export function getLocalDateComponents(timezone: string = "UTC") {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false
    });
    
    const parts = formatter.formatToParts(new Date());
    const components: Record<string, string> = {};
    for (const part of parts) {
      components[part.type] = part.value;
    }

    return {
      year: parseInt(components.year, 10),
      month: parseInt(components.month, 10),
      day: parseInt(components.day, 10)
    };
  } catch (error) {
    console.error(`Invalid timezone "${timezone}", falling back to UTC:`, error);
    const now = new Date();
    return {
      year: now.getUTCFullYear(),
      month: now.getUTCMonth() + 1,
      day: now.getUTCDate()
    };
  }
}

export function getLocalDateString(timezone: string = "UTC") {
  const { year, month, day } = getLocalDateComponents(timezone);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
