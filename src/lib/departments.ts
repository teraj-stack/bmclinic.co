export const departments = [
  {
    id: "proktologia",
    name: "Proktologia",
    theme: "petrol",
    mark: "01",
    lead: "Spokojnie porozmawiajmy o tym, co Cię niepokoi.",
    description:
      "Gdy ból, krwawienie lub wypadanie tkanek utrudniają codzienność. Rozmowa, badanie i indywidualny plan leczenia.",
    problems: ["Krwawienie", "Ból", "Świąd", "Pieczenie", "Guzek", "Wyciek"],
  },
  {
    id: "flebologia",
    name: "Flebologia",
    theme: "lavender",
    mark: "02",
    lead: "Zadbaj o lekkość swoich nóg.",
    description:
      "Konsultacje dotyczące żylaków, widocznych naczynek i dolegliwości nóg.",
    problems: [
      "Żylaki",
      "Pajączki",
      "Obrzęki",
      "Ciężkość nóg",
      "Widoczne naczynka",
      "Diagnostyka Doppler",
    ],
  },
  {
    id: "chirurgia-ogolna",
    name: "Chirurgia ogólna",
    theme: "porcelain",
    mark: "03",
    lead: "Zadbamy o to, co Ci dokucza.",
    description:
      "Konsultacje chirurgiczne, kwalifikacja do zabiegów operacyjnych, leczenie ambulatoryjne i opieka pooperacyjna.",
    problems: [
      "Wrastający paznokieć",
      "Leczenie ran",
      "Zmiany skórne",
      "Leczenie operacyjne",
      "Kontrola gojenia",
      "Opieka po zabiegu",
    ],
  },
  {
    id: "medycyna-estetyczna",
    name: "Medycyna estetyczna",
    theme: "amethyst",
    mark: "04",
    lead: "Świadoma pielęgnacja. Indywidualne podejście.",
    description:
      "Rozmowa o potrzebach skóry, możliwościach zabiegowych i realistycznych oczekiwaniach.",
    problems: [
      "Jakość skóry",
      "Przebarwienia",
      "Naczynka",
      "Blizny",
      "Kontur twarzy",
      "Konsultacja zabiegowa",
    ],
  },
] as const;
export function departmentById(id: string) {
  return departments.find((d) => d.id === id);
}
export function siteUrl() {
  return process.env.SITE_URL ?? "http://localhost:3000";
}
export function bookingUrl() {
  try {
    const u = new URL(process.env.BOOKING_URL ?? "");
    return u.protocol === "https:" ? u.href : undefined;
  } catch {
    return undefined;
  }
}
