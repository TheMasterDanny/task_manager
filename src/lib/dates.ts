/** "Today, 11:00", "Tomorrow", "Friday", "Oct 30"... `urgent` when due today or earlier. */
export function formatDue(date: string, time: string) {
  if (!date) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(`${date}T00:00`);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);

  let label;
  if (diff === 0) label = "Today";
  else if (diff === 1) label = "Tomorrow";
  else if (diff === -1) label = "Yesterday";
  else if (diff > 1 && diff < 7)
    label = d.toLocaleDateString("en-US", { weekday: "long" });
  else label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return { text: time ? `${label}, ${time}` : label, urgent: diff <= 0 };
}
