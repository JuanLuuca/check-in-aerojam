import { NextRequest, NextResponse } from 'next/server';
import { deleteCookie } from 'cookies-next';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json({ success: true, message: 'Logout realizado com sucesso' });

    deleteCookie('authToken', { req: request, res: response, path: '/' });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}
