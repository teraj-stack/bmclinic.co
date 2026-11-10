export type Specialty = "proktologia" | "flebologia";
export type Arm = { title: string; text: string; prompts: string[] };
export type Topic = {
  id: string;
  label: string;
  description: string;
  timing: string[];
  features: string[];
  prepare: string;
  group: number;
};
export type TopicGroup = {
  title: string;
  description: string;
  topics: Topic[];
};
export type SymptomContent = {
  specialty: Specialty;
  title: string;
  lead: string;
  groups: TopicGroup[];
  emergency: string[];
  sources: { label: string; url: string }[];
};
export type Selection = Record<string, { features: string[]; note: string }>;
export type Point = { x: number; y: number };
export type Camera = Point & { scale: number };
export type Bounds = Point & { width: number; height: number };
export const MIN_SCALE = 0.14,
  MAX_SCALE = 1.8;
export const GROUP_POSITIONS = [
  { x: 40, y: 220 },
  { x: 530, y: 50 },
  { x: 1020, y: 220 },
];
export const OVERVIEW: Bounds = { x: 10, y: 20, width: 1400, height: 920 };
export const GROUP_WIDTH = 370;
export function topicPoint(group: number, index: number): Point {
  const p = GROUP_POSITIONS[group];
  return { x: p.x + 185, y: p.y + 176 + index * 62 };
}
export function topicBounds(point: Point): Bounds {
  return { x: point.x - 620, y: point.y - 470, width: 1240, height: 940 };
}
export function clampScale(scale: number) {
  return Math.max(
    MIN_SCALE,
    Math.min(MAX_SCALE, Number.isFinite(scale) ? scale : 1),
  );
}
export function fitCamera(
  bounds: Bounds,
  viewport: { width: number; height: number },
  padding = 24,
): Camera {
  const scale = clampScale(
    Math.min(
      Math.max(1, viewport.width - padding * 2) / bounds.width,
      Math.max(1, viewport.height - padding * 2) / bounds.height,
    ),
  );
  return {
    scale,
    x: viewport.width / 2 - (bounds.x + bounds.width / 2) * scale,
    y: viewport.height / 2 - (bounds.y + bounds.height / 2) * scale,
  };
}
export function zoomAt(camera: Camera, anchor: Point, scale: number): Camera {
  const next = clampScale(scale),
    ratio = next / camera.scale;
  return {
    scale: next,
    x: anchor.x - (anchor.x - camera.x) * ratio,
    y: anchor.y - (anchor.y - camera.y) * ratio,
  };
}
export function easeInOutQuad(t: number) {
  const n = Math.max(0, Math.min(1, t));
  return n < 0.5 ? 2 * n * n : 1 - Math.pow(-2 * n + 2, 2) / 2;
}
export function topicArms(topic: Topic): Arm[] {
  return [
    { title: "Jak to opisać?", text: topic.description, prompts: [] },
    {
      title: "Kiedy i gdzie?",
      text: "Zaznacz określenia pasujące do Twojej sytuacji. Możesz wybrać kilka albo nie wybierać żadnego.",
      prompts: topic.timing,
    },
    {
      title: "Co jeszcze zauważasz?",
      text: "Równocześnie mogą występować inne objawy. Dodaj je do wspólnego obrazu, zamiast szukać jednej nazwy choroby.",
      prompts: topic.features,
    },
    { title: "Co powiedzieć lekarzowi?", text: topic.prepare, prompts: [] },
  ];
}
export function summaryText(
  content: SymptomContent,
  selection: Selection,
): string {
  const lines = [
    "BM Clinic — moje tematy do rozmowy",
    content.title,
    "To opis wybranych tematów, nie rozpoznanie ani kwalifikacja do zabiegu.",
    "",
  ];
  for (const topic of content.groups.flatMap((g) => g.topics)) {
    const value = selection[topic.id];
    if (!value) continue;
    lines.push(
      topic.label,
      ...(value.features.length
        ? ["Określenia: " + value.features.join("; ")]
        : []),
      ...(value.note.trim() ? ["Moja notatka: " + value.note.trim()] : []),
      "",
    );
  }
  if (!Object.keys(selection).length) lines.push("Nie wybrano tematów.");
  return lines.join("\n");
}
export function toggleTopic(selection: Selection, id: string): Selection {
  const next = { ...selection };
  if (next[id]) delete next[id];
  else next[id] = { features: [], note: "" };
  return next;
}
export function toggleFeature(
  selection: Selection,
  id: string,
  feature: string,
): Selection {
  const previous = selection[id] ?? { features: [], note: "" };
  return {
    ...selection,
    [id]: {
      ...previous,
      features: previous.features.includes(feature)
        ? previous.features.filter((x) => x !== feature)
        : [...previous.features, feature],
    },
  };
}
