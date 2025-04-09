import React from 'react';
import { EnrollmentAddClass } from '../../types/ClassEnrollmentsTypes';

interface ReportDialogProps {
  reportDialogOpen: boolean;
  closeReportDialog: () => void;
  reportData: EnrollmentAddClass[];
}

const ReportDialog: React.FC<ReportDialogProps> = ({
  reportDialogOpen,
  closeReportDialog,
  reportData,
}) => {
  if (!reportDialogOpen) return null;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    };
    const formattedDate = new Intl.DateTimeFormat('pt-BR', options).format(date);
    return formattedDate.replace(',', '');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-zinc-700">
          <h2 className="text-2xl font-bold text-white">Relatório de Inscrições</h2>
          <button
            onClick={closeReportDialog}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
          {reportData.length > 0 ? (
            <div className="space-y-4">
              {reportData.map((enrollment, index) => (
                <div
                  key={index}
                  className="bg-zinc-700 rounded-lg p-4 hover:bg-zinc-600 transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-zinc-400">Usuário</p>
                      <p className="text-white font-medium">{enrollment.userName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-zinc-400">Data da Inscrição</p>
                      <p className="text-white font-medium">{formatDateTime(enrollment.enrollmentDate)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-400">Nenhuma inscrição encontrada</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-zinc-700 flex justify-end">
          <button
            onClick={closeReportDialog}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDialog;