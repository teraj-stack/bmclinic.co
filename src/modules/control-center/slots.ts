export type ReservedSlotId = 'tools-inventory' | 'post-op-care';

export interface ControlCenterSlotDefinition {
  id: ReservedSlotId;
  title: string;
  shortLabel: string;
  status: 'RESERVED_POST_PUSH';
  routePlaceholder: string;
  description: string;
  plannedCapabilities: string[];
  dataContract: {
    moduleOwner: 'data-analytics';
    expectedTables: string[];
  };
}

/**
 * Zarezerwowane sloty na dodatkowe ekrany.
 * Zgodnie z BUILD_RULES.md dodatkowe moduły instalujemy dopiero po pierwszym pushu na Gita
 * i po uzyskaniu osobnej pisemnej zgody.
 */
export const RESERVED_CONTROL_SLOTS: readonly ControlCenterSlotDefinition[] = [
  {
    id: 'tools-inventory',
    title: 'Obrót narzędzi i zużyć',
    shortLabel: 'Slot 1: Narzędzia i zużycia',
    status: 'RESERVED_POST_PUSH',
    routePlaceholder: '/sterowanie?slot=tools-inventory',
    description:
      'Zarezerwowany ekran do śledzenia obiegu zestawów narzędzi, cykli sterylizacji oraz rozchodu materiałów zużywalnych przypisanych do procedur.',
    plannedCapabilities: [
      'Rejestr pakietów sterylnych i terminów ważności',
      'Automatyczne zdejmowanie materiałów zużywalnych ze stanu po etapie ZABIEG',
      'Alerty niskiego stanu magazynowego przekazywane do panelu CEO',
    ],
    dataContract: {
      moduleOwner: 'data-analytics',
      expectedTables: ['instrument_sets', 'sterilization_cycles', 'consumables_ledger'],
    },
  },
  {
    id: 'post-op-care',
    title: 'Prowadzenie pooperacyjne',
    shortLabel: 'Slot 2: Prowadzenie pooperacyjne',
    status: 'RESERVED_POST_PUSH',
    routePlaceholder: '/sterowanie?slot=post-op-care',
    description:
      'Zarezerwowany ekran do prowadzenia pacjenta po zabiegu: harmonogram kontroli, checklisty zaleceń i szybka eskalacja objawów niepokojących.',
    plannedCapabilities: [
      'Automatyczne przejęcie pacjenta z etapu WYPIS na ścieżkę kontroli pooperacyjnych',
      'Harmonogram wizyt kontrolnych (D+1, D+7, D+30) i checklisty gojenia',
      'Alerty pooperacyjne widoczne dla lekarza prowadzącego oraz w panelu sterującym',
    ],
    dataContract: {
      moduleOwner: 'data-analytics',
      expectedTables: ['post_op_care_plans', 'post_op_checkins', 'post_op_alerts'],
    },
  },
] as const;
