import { ControlCenterClient } from '@/modules/control-center/ControlCenterClient';
import { RESERVED_CONTROL_SLOTS } from '@/modules/control-center/slots';
import { getUnifiedAnalyticsDbSnapshot } from '@/modules/data-analytics';

export const dynamic = 'force-dynamic';

export default function SterowaniePage() {
  const initialSnapshot = getUnifiedAnalyticsDbSnapshot();
  return (
    <ControlCenterClient
      initialSnapshot={initialSnapshot}
      reservedSlots={RESERVED_CONTROL_SLOTS}
    />
  );
}
