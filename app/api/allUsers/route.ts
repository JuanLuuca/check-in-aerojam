// app/api/allUsers/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '../../../models/User';
import crypto from 'crypto';

export async function GET(request: Request) {
  await dbConnect();

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Token não fornecido.' }, { status: 401 });
    }

    const users = await User.find();

    if (!users) {
      return NextResponse.json({ success: false, message: 'Nenhum usuário encontrado.' }, { status: 404 });
    }

    const sanitizedUsers = users.map(user => {
      const { password, authToken, ...sanitizedUser } = user.toObject();
      return sanitizedUser;
    });

    return NextResponse.json({ success: true, data: sanitizedUsers });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  await dbConnect();

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Token não fornecido.' }, { status: 401 });
    }

    const { login, password, perfil, qtdAulas } = await request.json();

    if (!login || !password || perfil === undefined || qtdAulas === undefined) {
      return NextResponse.json({ success: false, message: 'Dados incompletos.' }, { status: 400 });
    }

    const authToken = crypto.randomBytes(32).toString('hex');

    const newUser = new User({ login, password, perfil, qtdAulas, authToken });
    await newUser.save();

    const { password: _, ...sanitizedUser } = newUser.toObject();

    return NextResponse.json({ success: true, data: sanitizedUser }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  await dbConnect();

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Token não fornecido.' }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ success: false, message: 'ID do usuário não fornecido.' }, { status: 400 });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return NextResponse.json({ success: false, message: 'Usuário não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Usuário excluído com sucesso.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  await dbConnect();

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Token não fornecido.' }, { status: 401 });
    }

    const { userId, perfil, qtdAulas } = await request.json();

    if (!userId || perfil === undefined || qtdAulas === undefined) {
      return NextResponse.json({ success: false, message: 'Dados incompletos.' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { perfil, qtdAulas },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'Usuário não encontrado.' }, { status: 404 });
    }

    const { password: _, ...sanitizedUser } = updatedUser.toObject();

    return NextResponse.json({ success: true, data: sanitizedUser });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}