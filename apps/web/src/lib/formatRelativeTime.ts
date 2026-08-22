export function formatRelativeTime(isoDate: string): string {
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 60) return "just now";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60)
    return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24)
    return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30)
    return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12)
    return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} ${diffYears === 1 ? "year" : "years"} ago`;
}
