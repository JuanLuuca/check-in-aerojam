// types/global.d.ts
import mongoose from 'mongoose';

declare global {
  namespace NodeJS {
    interface Global {
      mongoose: {
        conn: mongoose.Connection | null;
        promise: Promise<mongoose.Connection> | null;
      };
    }
  }
}

// Para garantir que o arquivo seja tratado como um módulo
export {};
