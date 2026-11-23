export type ReservedSlotId = 'tools-inventory' | 'post-op-care';

export interface ControlCenterSlotDefinition {
  id: ReservedSlotId;
  title: string;
  shortLabel: string;
  status: 'ACTIVE';
  routePlaceholder: string;
  description: string;
  plannedCapabilities: string[];
  dataContract: {
    moduleOwner: 'data-analytics';
    expectedTables: string[];
  };
}

/**
 * Aktywne moduły wpięte w zarezerwowane sloty po pierwszym pushu na gałąź feat/control-center.
 */
export const RESERVED_CONTROL_SLOTS: readonly ControlCenterSlotDefinition[] = [
  {
    id: 'tools-inventory',
    title: 'Obrót narzędzi i zużyć',
    shortLabel: 'Narzędzia i zużycia',
    status: 'ACTIVE',
    routePlaceholder: '/sterowanie?slot=tools-inventory',
    description:
      'Aktywny ekran obiegu zestawów narzędzi, cykli sterylizacji oraz rozchodu materiałów zużywalnych z automatycznymi alertami do panelu CEO.',
    plannedCapabilities: [
      'Obieg zestawów: STERYLNY → W_UZYCIU → DO_STERYLIZACJI → W_AUTOKLAWIE → STERYLNY',
      'Rozchód i uzupełnianie materiałów zużywalnych powiązanych z zabiegami',
      'Alerty niskiego stanu magazynowego w panelu CEO',
    ],
    dataContract: {
      moduleOwner: 'data-analytics',
      expectedTables: ['instrument_sets', 'sterilization_cycles', 'consumables_ledger'],
    },
  },
  {
    id: 'post-op-care',
    title: 'Prowadzenie pooperacyjne',
    shortLabel: 'Prowadzenie pooperacyjne',
    status: 'ACTIVE',
    routePlaceholder: '/sterowanie?slot=post-op-care',
    description:
      'Aktywny ekran prowadzenia pacjenta po zabiegu: automatyczne przejęcie z etapu WYPIS, harmonogram kontroli D+1 / D+7 / D+30 oraz eskalacja alertów do lekarza.',
    plannedCapabilities: [
      'Automatyczne przejęcie pacjenta po kliknięciu WYPIS w Ruchu Pacjentów',
      'Ścieżka kontroli D+1 → D+7 → D+30 → ZAKONCZONO z koordynacją Opiekuna Pacjenta',
      'Eskalacja alertów PILNY_KONTAKT do panelu CEO',
    ],
    dataContract: {
      moduleOwner: 'data-analytics',
      expectedTables: ['post_op_care_plans', 'post_op_checkins', 'post_op_alerts'],
    },
  },
] as const;
