import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Class from '@/models/Class';
import formidable, { File, Fields, Files } from 'formidable';
import { Readable } from 'stream';
import { IncomingMessage } from 'http';
import fs from 'fs';

// function convertToIncomingMessage(req: Request): IncomingMessage {
//   const readable = new Readable();
//   readable._read = () => {};

//   req.arrayBuffer().then(buffer => {
//     readable.push(Buffer.from(buffer));
//     readable.push(null);
//   });

//   const incomingMessage = readable as IncomingMessage;

//   incomingMessage.headers = Object.fromEntries(req.headers.entries());
//   incomingMessage.method = req.method || 'POST';
//   incomingMessage.url = req.url || '';

//   return incomingMessage;
// }

const getCurrentTimeInManaus = (): string => {
  const currentTimeUTC = new Date();
  const offset = 4 * 60 * 60 * 1000;
  const currentTimeManaus = new Date(currentTimeUTC.getTime() - offset);
  return currentTimeManaus.toISOString();
};

export async function GET() {
  await dbConnect();

  try {
    const currentTimeInManaus = getCurrentTimeInManaus();

    const today = new Date(currentTimeInManaus);
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 6);

    const classes = await Class.find({
      time: {
        $gte: today, 
        $lte: endDate 
      }
    }).sort({ time: -1 }).exec();

    return new NextResponse(
      JSON.stringify({ success: true, data: classes }), 
      { status: 200 }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Erro ao buscar aulas' }), 
      { status: 500 }
    );
  }
}

// export async function POST(request: Request) {
//   await dbConnect();

//   const form = formidable();

//   return new Promise<string>((resolve, reject) => {
//     const incomingMessage = convertToIncomingMessage(request);

//     form.parse(incomingMessage, async (err: any, fields: Fields, files: Files) => {
//       if (err) {
//         return reject(new NextResponse('Erro no upload da imagem', { status: 500 }));
//       }

//       const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
//       const datetime = Array.isArray(fields.datetime) ? fields.datetime[0] : fields.datetime;

//       if (!name || !datetime) {
//         return reject(new NextResponse('Nome e Horário/Dia são obrigatórios', { status: 400 }));
//       }

//       if (!files.image || !(files.image instanceof Array) || files.image.length === 0) {
//         return reject(new NextResponse('Imagem é obrigatória', { status: 400 }));
//       }

//       const file = files.image[0] as File;

//       fs.readFile(file.filepath, async (err: any, data: Buffer) => {
//         if (err) {
//           return reject(new NextResponse('Erro ao ler a imagem', { status: 500 }));
//         }

//         try {
//           const newClass = new Class({
//             name,
//             time: datetime + ":00.000+00:00",
//             isEnrolled: false,
//             status: true,
//             image: data
//           });

//           await newClass.save();
//           resolve(JSON.stringify({ success: true }));
//         } catch (error) {
//           return reject(new NextResponse('Erro ao salvar a aula no banco de dados', { status: 500 }));
//         }
//       });
//     });
//   })
//   .then(
//     (json) => new NextResponse(json, { status: 201 }),
//     (error) => new NextResponse(error, { status: 500 })
//   );
// }


const form = formidable({
  multiples: true,
  uploadDir: './public',
  keepExtensions: true 
});

export async function POST(request: Request) {
  await dbConnect();

  const incomingMessage = await convertToIncomingMessage(request);

  return new Promise<NextResponse>((resolve, reject) => {
    form.parse(incomingMessage, async (err: any, fields: Fields, files: Files) => {
      if (err) {
        console.error('Error parsing form:', err);
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

      fs.readFile(file.filepath, async (err: any, data: Buffer) => {
        if (err) {
          console.error('Error reading file:', err);
          return reject(new NextResponse('Erro ao ler a imagem', { status: 500 }));
        }

        try {
          const newClass = new Class({
            name,
            time: new Date(datetime).toISOString(),
            isEnrolled: false,
            status: true,
            image: data
          });

          await newClass.save();
          resolve(new NextResponse(JSON.stringify({ success: true }), { status: 201 }));
        } catch (error) {
          console.error('Error saving class:', error);
          reject(new NextResponse('Erro ao salvar a aula no banco de dados', { status: 500 }));
        }
      });
    });
  });
}

function convertToIncomingMessage(req: Request): Promise<IncomingMessage> {
  return new Promise((resolve, reject) => {
    const readable = new Readable();
    readable._read = () => {};

    req.arrayBuffer().then(buffer => {
      readable.push(Buffer.from(buffer));
      readable.push(null);

      const incomingMessage = readable as IncomingMessage;
      incomingMessage.headers = Object.fromEntries(req.headers.entries());
      incomingMessage.method = req.method || 'POST';
      incomingMessage.url = req.url || '';

      resolve(incomingMessage);
    }).catch(err => reject(err));
  });
}
