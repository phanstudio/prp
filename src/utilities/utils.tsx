export function toTitleCase(str: String) {
  return str
    .toLowerCase()
    .split(/\s+/) // split on any whitespace
    .filter(Boolean) // remove empty strings
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}