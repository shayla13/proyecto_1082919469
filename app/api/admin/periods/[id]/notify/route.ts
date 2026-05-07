import { NextRequest, NextResponse } from 'next/server';
import { getPeriodById, getActiveStudents } from '@/lib/dataService';
import { sendPeriodOpenNotification } from '@/lib/emailService';
import { requireAuth } from '@/lib/withAuth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación y rol admin
    const session = await requireAuth(request);
    if (!session || session.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 401 }
      );
    }

    // Verificar que el período existe
    const period = await getPeriodById(params.id);
    if (!period) {
      return NextResponse.json(
        { error: 'Período no encontrado' },
        { status: 404 }
      );
    }

    // Obtener estudiantes activos
    const students = await getActiveStudents();

    let sent = 0;
    let failed = 0;

    // Enviar notificaciones con delay de 100ms para respetar rate limits de Resend
    for (const student of students) {
      try {
        await sendPeriodOpenNotification(student.email, period.name);
        sent++;
      } catch (error) {
        console.error(`Error sending notification to ${student.email}:`, error);
        failed++;
      }

      // Delay de 100ms entre envíos
      if (students.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return NextResponse.json({
      sent,
      failed,
      message: `Notificaciones enviadas: ${sent} exitosas, ${failed} fallidas`
    });
  } catch (error) {
    console.error('Error sending period notifications:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}