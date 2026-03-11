import type { IdElement } from "@/types";

export function generateCustomId(elements: IdElement[], seq: number): string {
  return elements
    .map((el) => {
      switch (el.type) {
        case "fixed":
          return el.value ?? "";
        case "rand20":
          // 20-bit random: 0 to 1048575
          return Math.floor(Math.random() * 1048576)
            .toString(2)
            .padStart(20, "0");
        case "rand32":
          return Math.floor(Math.random() * 0xffffffff)
            .toString(16)
            .padStart(8, "0")
            .toUpperCase();
        case "rand6":
          return String(Math.floor(Math.random() * 900000) + 100000);
        case "rand9":
          return String(Math.floor(Math.random() * 900000000) + 100000000);
        case "guid":
          return generateUUID();
        case "date":
          return new Date().toISOString().slice(0, 10).replace(/-/g, "");
        case "time":
          return new Date().toTimeString().slice(0, 8).replace(/:/g, "");
        case "sequence":
          return String(seq + 1).padStart(6, "0");
        default:
          return "";
      }
    })
    .join("");
}

export function previewCustomId(elements: IdElement[], seq: number): string {
  return generateCustomId(elements, seq);
}

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const ID_ELEMENT_LABELS: Record<string, string> = {
  fixed: "Fixed Text",
  rand20: "Random 20-bit",
  rand32: "Random 32-bit",
  rand6: "6-Digit Number",
  rand9: "9-Digit Number",
  guid: "GUID",
  date: "Date (YYYYMMDD)",
  time: "Time (HHMMSS)",
  sequence: "Sequence",
};

export const ID_ELEMENT_EXAMPLES: Record<string, string> = {
  fixed: "PREFIX-",
  rand20: "10110101010110101010",
  rand32: "A3F2B891",
  rand6: "847291",
  rand9: "384729183",
  guid: "550e8400-e29b-41d4-a716",
  date: "20250115",
  time: "143022",
  sequence: "000001",
};