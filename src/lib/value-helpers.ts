import { valuesList } from "@/src/config/values";

export function resolveValueId(input: unknown) {
  if (typeof input === "number" && Number.isInteger(input)) {
    return input >= 0 ? input : null;
  }

  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) {
      return null;
    }

    const asNumber = Number(trimmed);
    if (Number.isInteger(asNumber) && asNumber >= 0) {
      return asNumber;
    }

    const index = valuesList.indexOf(trimmed);
    if (index >= 0) {
      return index;
    }
  }

  return null;
}

export function getValueLabel(valueId: number) {
  const index = valueId;
  if (index < 0 || index >= valuesList.length) {
    return null;
  }
  return valuesList[index];
}
