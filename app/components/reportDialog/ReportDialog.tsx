import React from 'react';
import { Dialog, DialogContent, DialogActions, Button, Typography, List, ListItem, ListItemText, Divider } from '@mui/material';
import Swal from 'sweetalert2';

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

const ReportDialog = ({ reportDialogOpen, closeReportDialog, reportData }: any) => {

    const handleClearReport = async () => {
        const classId = reportData[0]?.classId;
    
        if (!classId) {
            Swal.fire(
                'Erro!',
                'Não foi possível identificar o ID da aula.',
                'error'
            );
            return;
        }
    
        const result = await Swal.fire({
            title: 'Tem certeza?',
            text: 'Ao limpar o relatório, a ação não pode ser revertida!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Apagar',
            cancelButtonText: 'Cancelar',
            customClass: {
                popup: 'swal-custom-zindex',
            }
        });
    
        if (result.isConfirmed) {
            try {
                const response = await fetch(`/api/enrollments?classId=${classId}`, {
                    method: 'DELETE',
                });
    
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
    
                const responseData = await response.json();
    
                if (responseData.success) {
                    Swal.fire(
                        'Sucesso!',
                        'O relatório foi limpo com sucesso.',
                        'success'
                    );
                    closeReportDialog();
                } else {
                    Swal.fire(
                        'Erro!',
                        'Não foi possível limpar o relatório.',
                        'error'
                    );
                    console.error('Erro ao limpar o relatório:', responseData.message);
                }
            } catch (error: any) {
                Swal.fire(
                    'Erro!',
                    `Ocorreu um erro ao limpar o relatório: ${error.message}`,
                    'error'
                );
                console.error('Erro ao limpar o relatório:', error);
            }
        }
    };    

  return (
    <Dialog sx={{ zIndex: 5 }} open={reportDialogOpen} onClose={closeReportDialog} maxWidth="sm" fullWidth>
      <DialogContent>
        {reportData.length > 0 ? (
          <div>
            <Typography variant="h6" gutterBottom>
              Pessoas que se inscreveram nesta aula:
            </Typography>
            <List>
              {reportData.map((enrollment: any, index: any) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText
                      primary={`Usuário: ${enrollment.userName}`}
                      secondary={`Data da Inscrição: ${formatDateTime(enrollment.enrollmentDate)}`}
                    />
                  </ListItem>
                  {index < reportData.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </div>
        ) : (
          <Typography variant="body2">Nenhuma inscrição encontrada para esta aula.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClearReport} color="secondary">
          Limpar Relatório
        </Button>
        <Button onClick={closeReportDialog} color="primary">
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDialog;