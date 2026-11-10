export const departmentIds = [
  "proktologia",
  "flebologia",
  "chirurgia-ogolna",
  "medycyna-estetyczna",
] as const;
export type DepartmentId = (typeof departmentIds)[number];
export type ContentInput = {
  id?: number;
  title: string;
  department: DepartmentId;
  summary: string;
  body: string;
  status: "draft" | "published";
  reviewer: string;
  sources: string;
  preparation: string;
  aftercare: string;
};
export function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/ł/g, "l")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  if (!slug) throw new Error("Nazwa musi zawierać litery lub cyfry.");
  return slug.slice(0, 120);
}
function text(v: unknown, max: number, required = false) {
  if (typeof v !== "string" || v.length > max || (required && !v.trim()))
    throw new Error("Nieprawidłowe lub zbyt długie pole.");
  return v.trim();
}
export function parseContent(raw: unknown): ContentInput {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new Error("Nieprawidłowa treść.");
  const p = raw as Record<string, unknown>;
  if (
    !departmentIds.includes(p.department as DepartmentId) ||
    !["draft", "published"].includes(p.status as string)
  )
    throw new Error("Nieprawidłowy dział lub status.");
  if (p.id !== undefined && (!Number.isSafeInteger(p.id) || Number(p.id) < 1))
    throw new Error("Nieprawidłowy identyfikator.");
  const result: ContentInput = {
    id: p.id as number | undefined,
    title: text(p.title, 160, true),
    department: p.department as DepartmentId,
    summary: text(p.summary, 600, true),
    body: text(p.body, 30000, true),
    status: p.status as "draft" | "published",
    reviewer: text(p.reviewer ?? "", 160),
    sources: text(p.sources ?? "", 6000),
    preparation: text(p.preparation ?? "", 6000),
    aftercare: text(p.aftercare ?? "", 6000),
  };
  slugify(result.title);
  if (result.status === "published" && !result.reviewer)
    throw new Error("Publikacja wymaga podania lekarza zatwierdzającego.");
  for (const line of result.sources.split("\n").filter(Boolean)) {
    const u = new URL(line);
    if (u.protocol !== "https:")
      throw new Error("Źródła muszą być adresami HTTPS, po jednym w wierszu.");
  }
  return result;
}
export type EventInput = { id: string; consent: true } & (
  | { event: "booking_opened" | "contact_opened" }
  | { event: "web_vital"; metric: "LCP" | "INP" | "CLS"; value: number }
);
export function parseEvent(raw: unknown): EventInput {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new Error("Nieprawidłowe zdarzenie.");
  const p = raw as Record<string, unknown>;
  const vital = p.event === "web_vital";
  const keys = vital
    ? ["id", "event", "consent", "metric", "value"]
    : ["id", "event", "consent"];
  if (
    Object.keys(p).some((k) => !keys.includes(k)) ||
    p.consent !== true ||
    !["booking_opened", "contact_opened", "web_vital"].includes(
      p.event as string,
    ) ||
    typeof p.id !== "string" ||
    !/^[a-zA-Z0-9-]{10,80}$/.test(p.id)
  )
    throw new Error("Zdarzenie wymaga zgody i dozwolonego typu.");
  if (
    vital &&
    (!["LCP", "INP", "CLS"].includes(p.metric as string) ||
      typeof p.value !== "number" ||
      !Number.isFinite(p.value) ||
      p.value < 0 ||
      p.value > 3600000)
  )
    throw new Error("Nieprawidłowy pomiar wydajności.");
  return p as EventInput;
}
