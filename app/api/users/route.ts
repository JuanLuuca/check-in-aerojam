// api/users.ts
import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { setCookie } from 'cookies-next';

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'PLRPr6wp';

export async function GET(request: Request) {
  await dbConnect();

  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, message: 'Token não fornecido.' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, SECRET_KEY);

    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json({ success: false, message: 'Usuário não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, classCount: user.qtdAulas, Perfil: user.perfil });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  await dbConnect();

  const { username, password } = await request.json();

  try {
    const user = await User.findOne({ login: username, password });

    if (!user) {
      return NextResponse.json({ success: false, message: 'Usuário ou senha incorretos.' }, { status: 401 });
    }

    const authToken = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '30m' });

    const response = NextResponse.json({ success: true, message: 'Logado com sucesso', userName: username, authToken: authToken, qtdAulas: user.qtdAulas });

    setCookie('authToken', authToken, { req: request, res: response, httpOnly: true, maxAge: 30 * 60 });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}