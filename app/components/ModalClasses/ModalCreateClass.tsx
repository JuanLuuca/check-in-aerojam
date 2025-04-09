import React from 'react';
import { ClassData } from '@/app/types/ClassEnrollmentsTypes';

interface ModalCreateClassProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
  classData: Omit<ClassData, '_id'>;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ModalCreateClass({
  open,
  onClose,
  onSubmit,
  loading,
  classData,
  onInputChange,
}: ModalCreateClassProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-zinc-900 opacity-75" onClick={onClose}></div>
        </div>

        <div className="inline-block align-bottom bg-zinc-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 className="text-lg font-medium text-white mb-4">Nova Aula</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-1">
                  Nome da Aula
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={classData.name}
                  onChange={onInputChange}
                  className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Digite o nome da aula"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-zinc-300 mb-1">
                  Horário
                </label>
                <input
                  type="datetime-local"
                  id="time"
                  name="time"
                  value={classData.time}
                  onChange={onInputChange}
                  className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="image" className="block text-sm font-medium text-zinc-300 mb-1">
                  Imagem
                </label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={onInputChange}
                  className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  accept="image/*"
                />
              </div>
            </div>
          </div>

          <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Criando...</span>
                </div>
              ) : (
                'Criar Aula'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-zinc-600 shadow-sm px-4 py-2 bg-zinc-700 text-base font-medium text-white hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 