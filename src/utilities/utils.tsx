export function toTitleCase(str: String) {
  return str
    .toLowerCase()
    .split(/\s+/) // split on any whitespace
    .filter(Boolean) // remove empty strings
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Safely navigates back if there is a previous page in internal app history;
 * otherwise navigates to fallback (default: "/") if the user entered directly.
 */
export function safeNavigateBack(
  navigate: (to: any, options?: any) => void,
  fallback: string = "/"
) {
  if (typeof window === "undefined") {
    navigate(fallback, { replace: true });
    return;
  }

  const hasInternalHistory =
    (window.history.state &&
      typeof window.history.state.idx === "number" &&
      window.history.state.idx > 0) ||
    (window.history.length > 1 &&
      Boolean(document.referrer) &&
      document.referrer.includes(window.location.host));

  if (hasInternalHistory) {
    navigate(-1);
  } else {
    navigate(fallback, { replace: true });
  }
}
