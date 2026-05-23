import type { ParsedInvoiceText, LineItem } from "@/types";

function stripCommas(value: string): string {
  return value.replace(/,/g, "");
}

function extractEmail(text: string): string | null {
  const match = text.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  );
  return match ? match[0] : null;
}

function extractClientName(text: string): string | null {
  const beforeFirstComma = text.split(",")[0].trim();
  const words = beforeFirstComma.split(/\s+/);
  if (words.length >= 2) {
    const allCapitalized = words.every((w) => /^[A-Z][a-z]+$/.test(w));
    if (allCapitalized) {
      return beforeFirstComma;
    }
  }
  return null;
}

function extractItems(text: string): LineItem[] {
  // Strategy A — "N hours of X at $Y"
  const strategyA =
    /(\d+)\s+hours?\s+of\s+(.+?)\s+at\s+\$?([\d,]+(?:\.\d+)?)/gi;
  const matchesA = [...text.matchAll(strategyA)];
  if (matchesA.length > 0) {
    return matchesA.map((m) => ({
      description: m[2].trim(),
      quantity: parseInt(m[1], 10),
      rate: parseFloat(stripCommas(m[3])),
    }));
  }

  // Strategy B — "N x X @ $Y" or "N units of X at $Y"
  const strategyB =
    /(\d+)\s*(?:x|units?\s+of)\s+(.+?)\s+(?:at|@)\s+\$?([\d,]+(?:\.\d+)?)/gi;
  const matchesB = [...text.matchAll(strategyB)];
  if (matchesB.length > 0) {
    return matchesB.map((m) => ({
      description: m[2].trim(),
      quantity: parseInt(m[1], 10),
      rate: parseFloat(stripCommas(m[3])),
    }));
  }

  // Strategy C — "$Y for X"
  const strategyC = /\$?([\d,]+(?:\.\d+)?)\s+for\s+(.+)/gi;
  const matchesC = [...text.matchAll(strategyC)];
  if (matchesC.length > 0) {
    return matchesC.map((m) => ({
      description: m[2].trim(),
      quantity: 1,
      rate: parseFloat(stripCommas(m[1])),
    }));
  }

  return [];
}

export function parseInvoiceText(text: string): ParsedInvoiceText {
  return {
    clientName: extractClientName(text),
    clientEmail: extractEmail(text),
    items: extractItems(text),
  };
}