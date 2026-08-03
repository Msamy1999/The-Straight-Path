/** Removes internal workflow language from public-facing category descriptions. */
export function readerDescription(value: string) {
  const cleaned = value
    .replace(/^(?:A\s+)?(?:draft|planned)\s+/i, "")
    .replace(
      /\b(?:draft|planned)\s+(?=(?:study|article|topic|framework|comparison|beginner|careful|Christian-facing|historical|Islamic|bridge|collection|guide|reflection|outline|path))/gi,
      "",
    )
    .replace(/\bsource[- ]status\b/gi, "sources")
    .replace(/\bsource[- ]conscious\b/gi, "evidence-based")
    .replace(/\bsource[- ]aware\b/gi, "evidence-based")
    .replace(/\bsource[- ]pending\b/gi, "")
    .replace(/\bsource placeholders?\b/gi, "sources")
    .replace(/\bscripture placeholders?\b/gi, "scripture references")
    .replace(/\bplaceholders?\b/gi, "details")
    .replace(/\s+kept visible\b/gi, "")
    .replace(/\s+until sourced content is ready\b/gi, "")
    .replace(/\s+Add [^.]+ before publishing claims\.?$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned.replace(/^([a-z])/, (_, first) => first.toUpperCase());
}
