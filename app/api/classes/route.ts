import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Class from '@/models/Class';
import formidable, { File, Fields, Files } from 'formidable';
import { Readable } from 'stream';
import { IncomingMessage } from 'http';

export const config = {
  runtime: 'edge',
};

export async function GET() {
  await dbConnect();

    try {
      const classes = await Class.find().exec();
      return new NextResponse(JSON.stringify({ success: true, data: classes }), { status: 200 });
    } catch (error) {
      return new NextResponse(JSON.stringify({ success: false, message: 'Erro ao buscar aulas' }), { status: 500 });
    }
}

export async function POST(request: Request) {
  await dbConnect();

  const form = formidable();

  return new Promise<string>((resolve, reject) => {
    const incomingMessage = convertToIncomingMessage(request);

    form.parse(incomingMessage, async (err: any, fields: Fields, files: Files) => {
      if (err) {
        return reject(new NextResponse('Erro no upload da imagem', { status: 500 }));
      }

      const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
      const datetime = Array.isArray(fields.datetime) ? fields.datetime[0] : fields.datetime;

      if (!name || !datetime) {
        return reject(new NextResponse('Nome e Horário/Dia são obrigatórios', { status: 400 }));
      }

      if (!files.image || !(files.image instanceof Array) || files.image.length === 0) {
        return reject(new NextResponse('Imagem é obrigatória', { status: 400 }));
      }

      const file = files.image[0] as File;

      const fs = require('fs');
      fs.readFile(file.filepath, async (err: any, data: Buffer) => {
        if (err) {
          return reject(new NextResponse('Erro ao ler a imagem', { status: 500 }));
        }

        try {
          const newClass = new Class({
            name,
            time: datetime + ":00.000+00:00",
            isEnrolled: false,
            status: true,
            image: data
          });

          await newClass.save();
          resolve(JSON.stringify({ success: true }));
        } catch (error) {
          return reject(new NextResponse('Erro ao salvar a aula no banco de dados', { status: 500 }));
        }
      });
    });
  })
  .then(
    (json) => new NextResponse(json, { status: 201 }),
    (error) => new NextResponse(error, { status: 500 })
  );
}

export function convertToIncomingMessage(req: Request): IncomingMessage {
  const readable = new Readable();
  readable._read = () => {};

  req.arrayBuffer().then(buffer => {
    readable.push(Buffer.from(buffer));
    readable.push(null);
  });

  const incomingMessage = readable as IncomingMessage;

  incomingMessage.headers = Object.fromEntries(req.headers.entries());
  incomingMessage.method = req.method || 'POST';
  incomingMessage.url = req.url || '';

  return incomingMessage;
}
