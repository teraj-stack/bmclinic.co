export type RutaNodeType = 'symptom' | 'question' | 'information' | 'action';
export type RutaNode = {
  id: string;
  parentId: string | null;
  type: RutaNodeType;
  label: string;
  description: string;
  options?: string[];
  urgent?: boolean;
  links?: string[];
};

export const RUTA_PROKTOLOGIA: RutaNode[] = [
  { id: 'krwawienie', parentId: null, type: 'symptom', label: 'Krwawienie', description: 'Zauważasz krew podczas wypróżnienia lub na papierze?', links: ['krwawienie-pytania'] },
  { id: 'bol', parentId: null, type: 'symptom', label: 'Ból', description: 'Ból podczas wypróżniania, po nim lub niezależnie od niego.', links: ['bol-pytania'] },
  { id: 'swiad', parentId: null, type: 'symptom', label: 'Świąd', description: 'Swędzenie lub podrażnienie okolicy odbytu.', links: ['swiad-pytania'] },
  { id: 'pieczenie', parentId: null, type: 'symptom', label: 'Pieczenie', description: 'Pieczenie skóry lub kanału odbytu.', links: ['pieczenie-pytania'] },
  { id: 'guzek', parentId: null, type: 'symptom', label: 'Guzek', description: 'Wyczuwalna lub widoczna zmiana w okolicy odbytu.', links: ['guzek-pytania'] },
  { id: 'wyciek', parentId: null, type: 'symptom', label: 'Wyciek', description: 'Wydzielina, wilgotność lub zabrudzenie bielizny.', links: ['wyciek-pytania'] },
  { id: 'krwawienie-pytania', parentId: 'krwawienie', type: 'question', label: 'Jak wygląda krwawienie?', description: 'Zwróć uwagę na kolor, ilość, częstość i związek z wypróżnieniem.', options: ['Jasnoczerwona krew na papierze', 'Krew zmieszana ze stolcem', 'Ciemny lub smolisty stolec', 'Krwawienie jest obfite'], links: ['co-dalej'] },
  { id: 'bol-pytania', parentId: 'bol', type: 'question', label: 'Kiedy i jak boli?', description: 'Określ lokalizację, czas trwania oraz charakter bólu.', options: ['Podczas wypróżnienia', 'Po wypróżnieniu', 'Ból stały lub narastający', 'Nagły, bardzo silny ból'], links: ['co-dalej'] },
  { id: 'swiad-pytania', parentId: 'swiad', type: 'question', label: 'Kiedy występuje świąd?', description: 'Czy występuje w nocy, po higienie albo po wypróżnieniu?', options: ['Głównie wieczorem lub nocą', 'Po wypróżnieniu', 'Po użyciu kosmetyków', 'Przez większą część dnia'], links: ['co-dalej'] },
  { id: 'pieczenie-pytania', parentId: 'pieczenie', type: 'question', label: 'Co nasila pieczenie?', description: 'Przyjrzyj się czynnikom wyzwalającym.', options: ['Wypróżnienie', 'Mycie i pielęgnacja', 'Długie siedzenie', 'Nie potrafię określić'], links: ['co-dalej'] },
  { id: 'guzek-pytania', parentId: 'guzek', type: 'question', label: 'Jak zachowuje się guzek?', description: 'Ważny jest czas pojawienia się, bolesność i zmiana wielkości.', options: ['Pojawił się nagle i boli', 'Powiększa się przy wypróżnieniu', 'Jest od dawna, bez bólu', 'Towarzyszy mu gorączka'], links: ['co-dalej'] },
  { id: 'wyciek-pytania', parentId: 'wyciek', type: 'question', label: 'Jaki to rodzaj wydzieliny?', description: 'Zwróć uwagę na barwę, zapach, częstotliwość i objawy towarzyszące.', options: ['Śluz', 'Ropna lub nieprzyjemnie pachnąca', 'Krew lub podbarwiona krwią', 'Trudno określić'], links: ['co-dalej'] },
  { id: 'co-dalej', parentId: null, type: 'information', label: 'Co zrobić dalej?', description: 'Podobne dolegliwości mogą mieć różne przyczyny. Sama mapa nie pozwala ustalić rozpoznania. Wybór objawów ma pomóc przygotować się do konsultacji.', links: ['kontakt'] },
  { id: 'kontakt', parentId: 'co-dalej', type: 'action', label: 'Kontakt z kliniką', description: 'Przejdź do informacji o konsultacji proktologicznej.', links: [] },
];

export function rutaChildren(nodeId: string): RutaNode[] {
  const parent = RUTA_PROKTOLOGIA.find((node) => node.id === nodeId);
  return (parent?.links || [])
    .map((id) => RUTA_PROKTOLOGIA.find((node) => node.id === id))
    .filter((node): node is RutaNode => Boolean(node));
}
