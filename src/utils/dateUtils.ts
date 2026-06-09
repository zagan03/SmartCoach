export const todayStr = () => new Date().toISOString().split("T")[0];

export const formatDate = (date: string | Date): string => {
  const parsedDate = typeof date === "string" ? new Date(date) : date;

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("ro-RO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
