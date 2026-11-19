import { NextResponse } from 'next/server';
import {
  addPatientToFlow,
  getUnifiedAnalyticsDbSnapshot,
  updatePatientStage,
  type AcquisitionChannel,
  type PatientFlowStage,
  type PatientPriority,
} from '@/modules/data-analytics';
import { RESERVED_CONTROL_SLOTS } from '@/modules/control-center/slots';

export async function GET() {
  const snapshot = getUnifiedAnalyticsDbSnapshot();
  return NextResponse.json({
    ok: true,
    snapshot,
    reservedSlots: RESERVED_CONTROL_SLOTS,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      action?: 'add-patient' | 'advance-stage' | 'set-stage';
      id?: string;
      stage?: PatientFlowStage;
      patientCode?: string;
      departmentSlug?: string;
      channel?: AcquisitionChannel;
      priority?: PatientPriority;
      waitMinutes?: number;
    };

    if (body.action === 'add-patient') {
      const snapshot = addPatientToFlow({
        patientCode: body.patientCode ?? '',
        departmentSlug: body.departmentSlug ?? 'medycyna-estetyczna',
        channel: body.channel ?? 'AEO_AI_OVERVIEW',
        priority: body.priority ?? 'STANDARD',
        waitMinutes: body.waitMinutes ?? 10,
      });
      return NextResponse.json({ ok: true, snapshot });
    }

    if (
      (body.action === 'advance-stage' || body.action === 'set-stage') &&
      body.id
    ) {
      const snapshot = updatePatientStage(
        body.id,
        body.action === 'set-stage' ? body.stage : undefined,
      );
      return NextResponse.json({ ok: true, snapshot });
    }

    return NextResponse.json(
      { ok: false, error: 'Nieprawidłowa akcja modułu sterującego.' },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Błąd przetwarzania operacji w module sterującym.',
      },
      { status: 500 },
    );
  }
}
