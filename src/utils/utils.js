export const UTCTimestampToLocal = (utcTimestamp) => {
  // Convert UTC timestamp to milliseconds
  const utcMilliseconds = utcTimestamp * 1000;

  // Create a new Date object with the UTC milliseconds
  const utcDate = new Date(utcMilliseconds);

  // Get the local date and time components
  const year = utcDate.getFullYear();
  const month = String(utcDate.getMonth() + 1).padStart(2, "0");
  const day = String(utcDate.getDate()).padStart(2, "0");
  const hours = String(utcDate.getHours()).padStart(2, "0");
  const minutes = String(utcDate.getMinutes()).padStart(2, "0");
  const seconds = String(utcDate.getSeconds()).padStart(2, "0");
  const milliseconds = String(utcDate.getMilliseconds()).padStart(3, "0");

  const localTimestampString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;

  return localTimestampString;
};
