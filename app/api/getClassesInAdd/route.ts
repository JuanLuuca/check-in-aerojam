import dbConnect from "@/lib/mongodb";
import Class from "@/models/Class";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  try {
    const classes = await Class.find().sort({ time: -1 }).exec();

    return new NextResponse(JSON.stringify({ success: true, data: classes }), { status: 200 });
  } catch (error) {
    return new NextResponse(JSON.stringify({ success: false, message: 'Erro ao buscar aulas' }), { status: 500 });
  }
}