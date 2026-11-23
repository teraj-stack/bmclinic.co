import { NextResponse } from 'next/server';
import {
  addPatientToFlow,
  addPostOpPatient,
  adjustConsumableStock,
  advanceInstrumentStatus,
  advancePostOpMilestone,
  getUnifiedAnalyticsDbSnapshot,
  setPostOpAlert,
  updatePatientStage,
  type AcquisitionChannel,
  type PatientFlowStage,
  type PatientPriority,
  type PostOpAlertLevel,
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
      action?:
        | 'add-patient'
        | 'advance-stage'
        | 'set-stage'
        | 'advance-instrument'
        | 'adjust-consumable'
        | 'advance-postop'
        | 'set-postop-alert'
        | 'add-postop';
      id?: string;
      stage?: PatientFlowStage;
      patientCode?: string;
      departmentSlug?: string;
      departmentName?: string;
      procedureTitle?: string;
      notes?: string;
      channel?: AcquisitionChannel;
      priority?: PatientPriority;
      waitMinutes?: number;
      delta?: number;
      alertLevel?: PostOpAlertLevel;
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

    if (body.action === 'advance-instrument' && body.id) {
      const snapshot = advanceInstrumentStatus(body.id);
      return NextResponse.json({ ok: true, snapshot });
    }

    if (body.action === 'adjust-consumable' && body.id && typeof body.delta === 'number') {
      const snapshot = adjustConsumableStock(body.id, body.delta);
      return NextResponse.json({ ok: true, snapshot });
    }

    if (body.action === 'advance-postop' && body.id) {
      const snapshot = advancePostOpMilestone(body.id);
      return NextResponse.json({ ok: true, snapshot });
    }

    if (body.action === 'set-postop-alert' && body.id && body.alertLevel) {
      const snapshot = setPostOpAlert(body.id, body.alertLevel);
      return NextResponse.json({ ok: true, snapshot });
    }

    if (body.action === 'add-postop') {
      const snapshot = addPostOpPatient({
        patientCode: body.patientCode ?? '',
        departmentName: body.departmentName ?? 'Flebologia',
        procedureTitle: body.procedureTitle ?? 'Zabieg ambulatoryjny',
        notes: body.notes,
      });
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
