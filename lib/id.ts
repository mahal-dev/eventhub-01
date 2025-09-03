export function uid(prefix = ""): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    // @ts-ignore
    return `${prefix}${crypto.randomUUID()}`
  }
  return `${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}
