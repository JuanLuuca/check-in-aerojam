import { NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongodb';
import Enrollment from '@/models/Enrollment';
import Class from '@/models/Class';
import User from '@/models/User';
import { getCookie } from 'cookies-next';
import { getUserIdFromToken } from '../../../../lib/auth';

const getCurrentTimeInManaus = (): string => {
  const currentTimeUTC = new Date();
  const offset = 4 * 60 * 60 * 1000;
  const currentTimeManaus = new Date(currentTimeUTC.getTime() - offset);
  return currentTimeManaus.toISOString();
};

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  const authToken = getCookie('authToken', { req: request });
  const userId = getUserIdFromToken(authToken);

  if (!userId) {
    return NextResponse.json({ success: false, message: 'Você não está mais logado, por favor reinicie a página' }, { status: 401 });
  }

  const enrollmentId = params.id;

  try {
    const enrollment = await Enrollment.findOne({ _id: enrollmentId, userId });

    if (!enrollment) {
      return NextResponse.json({ success: false, message: 'Inscrição não encontrada' }, { status: 404 });
    }

    const classInfo = await Class.findById(enrollment.classId);
    if (!classInfo) {
      return NextResponse.json({ success: false, message: 'Aula não encontrada' }, { status: 404 });
    }

    const currentTimeInManaus = getCurrentTimeInManaus();
    const currentTimeInManausDate = new Date(currentTimeInManaus);
    const classTimeDate = new Date(classInfo.time.toISOString());

    const timeDifference = classTimeDate.getTime() - currentTimeInManausDate.getTime();
    const differenceInHours = timeDifference / (60 * 60 * 1000);

    if (differenceInHours <= 3) {
      return NextResponse.json({
        success: false,
        message: 'Você só pode cancelar a inscrição até 3 horas antes do horário da aula.',
      }, { status: 400 });
    }

    await Enrollment.deleteOne({ _id: enrollmentId });

    const user = await User.findById(userId);

    if (user) {
      user.qtdAulas += 1;
      await user.save();
    }

    return NextResponse.json({ success: true, message: 'Inscrição removida com sucesso' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
