export function prepareDocumentUrl(input: string): string {
  const trimmed = input.trim();

  if (!trimmed) return "";

  if (/[?&]download=1(?:&|$)/i.test(trimmed)) {
    return trimmed;
  }

  if (/[?&]download=[^&]*/i.test(trimmed)) {
    return trimmed.replace(
      /([?&])download=[^&]*/i,
      "$1download=1"
    );
  }

  return trimmed.includes("?")
    ? `${trimmed}&download=1`
    : `${trimmed}?download=1`;
}
