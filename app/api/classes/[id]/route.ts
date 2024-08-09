import dbConnect from "@/lib/mongodb";
import formidable, { Fields, Files } from 'formidable';
import fs from 'fs';
import { NextResponse } from "next/server";
import Class from "@/models/Class";
import { Binary } from 'mongodb';
import { IncomingMessage } from "http";
import { Readable } from "stream";

function convertToIncomingMessage(req: Request): IncomingMessage {
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

export async function PUT(request: Request) {
    await dbConnect();

    const form = formidable();

    return new Promise<NextResponse>((resolve, reject) => {
        const incomingMessage = convertToIncomingMessage(request);

        form.parse(incomingMessage, async (err: any, fields: Fields, files: Files) => {
            if (err) {
                console.error("Erro no processamento do formulário", err);
                return reject(new NextResponse(JSON.stringify({ success: false, message: 'Erro no processamento do formulário' }), { status: 500 }));
            }

            const id = Array.isArray(fields.id) ? fields.id[0] : fields.id;
            const name = Array.isArray(fields.name) ? fields.name[0] : fields.name;
            const datetime = Array.isArray(fields.datetime) ? fields.datetime[0] : fields.datetime;
            const image = files.image ? files.image[0] : null;

            if (!id || !name || !datetime) {
                console.error("ID, Nome e Horário/Dia são obrigatórios", { id, name, datetime });
                return reject(new NextResponse(JSON.stringify({ success: false, message: 'ID, Nome e Horário/Dia são obrigatórios' }), { status: 400 }));
            }

            const updateData: any = {
                name,
                time: datetime + ":00.000+00:00",
            };

            if (image) {
                try {
                    const imageData = await fs.promises.readFile(image.filepath);
                    const binaryImage = new Binary(imageData);
                    updateData.image = binaryImage;
                } catch (fileError) {
                    console.error("Erro ao ler o arquivo de imagem", fileError);
                    return reject(new NextResponse(JSON.stringify({ success: false, message: 'Erro ao ler o arquivo de imagem' }), { status: 500 }));
                }
            }

            try {
                const updatedClass = await Class.findByIdAndUpdate(id, updateData, { new: true });
                if (!updatedClass) {
                    console.error("Aula não encontrada", { id });
                    return reject(new NextResponse(JSON.stringify({ success: false, message: 'Aula não encontrada' }), { status: 404 }));
                }
                resolve(new NextResponse(JSON.stringify({ success: true }), { status: 200 }));
            } catch (dbError) {
                console.error("Erro ao atualizar a aula no banco de dados", dbError);
                return reject(new NextResponse(JSON.stringify({ success: false, message: 'Erro ao atualizar a aula no banco de dados' }), { status: 500 }));
            }
        });
    });
}
