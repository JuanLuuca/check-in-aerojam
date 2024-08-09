import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Enrollment from '@/models/Enrollment';
import User from '@/models/User';
import { getCookie } from 'cookies-next';
import { getUserIdFromToken } from '../../../lib/auth';

const MAX_ENROLLMENTS_PER_CLASS = 6;

export async function GET(request: Request) {
  await dbConnect();

  const authToken = getCookie('authToken', { req: request });
  const userId = getUserIdFromToken(authToken);

  if (!userId) {
    return NextResponse.json({ success: false, message: 'Você não está mais logado, por favor reinicie a página' }, { status: 401 });
  }

  const url = new URL(request.url);
  const classId = url.searchParams.get('classId');

  if (classId) {
    try {
      const enrollments = await Enrollment.find({ classId }).exec();

      if (enrollments.length === 0) {
        return NextResponse.json({ success: false, message: 'Nenhuma inscrição encontrada para esta aula.' }, { status: 404 });
      }

      const userIds = enrollments.map(enrollment => enrollment.userId);

      const users = await User.find({ _id: { $in: userIds } }).exec();

      const userMap = users.reduce((map, user) => {
        map[user._id.toString()] = user.login; 
        return map;
      }, {} as Record<string, string>);

      console.log("userIds: ", userIds);
      console.log("userMap: ", userMap);

      const result = enrollments.map(enrollment => ({
        ...enrollment.toObject(),
        userName: userMap[enrollment.userId.toString()] || 'Nome não disponível',
      }));

      return NextResponse.json({ success: true, enrollments: result });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  } else {
    try {
      const enrollments = await Enrollment.find({ userId }).exec();

      return NextResponse.json({ success: true, data: enrollments });
    } catch (error: any) {
      return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
  }
}

export async function POST(request: Request) {
  await dbConnect();

  const authToken = getCookie('authToken', { req: request });
  const userId = getUserIdFromToken(authToken);

  if (!userId) {
    return NextResponse.json({ success: false, message: 'Você não está mais logado, por favor reinicie a pagina' }, { status: 401 });
  }

  const { classId } = await request.json();

  try {
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Usuário não encontrado' }, { status: 404 });
    }

    if (user.qtdAulas <= 0) {
      return NextResponse.json({ success: false, message: 'Suas aulas se esgotaram.' }, { status: 400 });
    }

    const enrollmentsCount = await Enrollment.countDocuments({ classId });
    if (enrollmentsCount >= MAX_ENROLLMENTS_PER_CLASS) {
      return NextResponse.json({ success: false, message: 'Está aula já atingiu o número maximo de inscrições.' }, { status: 400 });
    }

    const existingEnrollment = await Enrollment.findOne({ userId, classId });
    if (existingEnrollment) {
      return NextResponse.json({ success: false, message: 'Você já está cadastrado nesta aula.' }, { status: 400 });
    }

    user.qtdAulas -= 1;
    await user.save();

    const newEnrollment = new Enrollment({ userId, classId });
    await newEnrollment.save();

    return NextResponse.json({ success: true, data: newEnrollment });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  await dbConnect();

  const authToken = getCookie('authToken', { req: request });
  const userId = getUserIdFromToken(authToken);

  if (!userId) {
    return NextResponse.json({ success: false, message: 'Você não está mais logado, por favor reinicie a página' }, { status: 401 });
  }

  const url = new URL(request.url);
  const classId = url.searchParams.get('classId');

  if (!classId) {
    return NextResponse.json({ success: false, message: 'Class ID não fornecido' }, { status: 400 });
  }

  try {
    const result = await Enrollment.deleteMany({ classId });

    return NextResponse.json({ success: true, message: 'Relatório limpo com sucesso' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}