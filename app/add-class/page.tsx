"use client"

import React, { useEffect, useState } from 'react';
import { Container, TextField, Button, Typography, Card, CardContent, Box, Modal, CircularProgress } from '@mui/material';
import { useForm, SubmitHandler } from 'react-hook-form';
import SideBar from '../components/sidebar/Sidebar';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import ReportDialog from '../components/reportDialog/ReportDialog';
import { useRouter } from 'next/navigation';

const MySwal = withReactContent(Swal);

interface IFormInput {
  name: string;
  time: string;
  image: FileList;
  nameModal?: string;
  timeModal?: string;
  imageModal?: FileList;
}

export interface ClassData {
  _id: string;
  name: string;
  time: string;
  image: {
    type: string;
    data: number[];
  };
}

interface Enrollment {
  userId: {
    _id: number
  };
  classId: string;
  userName: string;
  enrollmentDate: string;
}

const fetchClasses = async () => {
  const response = await fetch('/api/classes');
  const result = await response.json();
  return result.data as ClassData[];
};

const fetchUserAdmin = async (authToken: string) => {
  const response = await fetch('/api/users', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  const result = await response.json();
  return result.Perfil;
};

const AddClassPage = () => {
  const router = useRouter();
  const { register: registerAdd, handleSubmit: handleSubmitAdd, formState: { errors: errorsAdd }, reset: resetAdd, setValue: setValueAdd } = useForm<IFormInput>();
  const { register: registerEdit, handleSubmit: handleSubmitEdit, formState: { errors: errorsEdit }, setValue: setValueEdit } = useForm<IFormInput>();

  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editClassData, setEditClassData] = useState<ClassData | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportData, setReportData] = useState<Enrollment[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const classesPerPage = 3;
  const totalPages = Math.ceil(classes.length / classesPerPage);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("authToken") as string;

      const profile = await fetchUserAdmin(token);

      if (profile && profile === 1) {
        setIsAdmin(true);
        fetchClasses().then((data) => {
          setClasses(data);
          setLoading(false);
        });
      } else {
        router.push('/unauthorized');
      }
    };

    init();
  }, [router]);

  const onSubmitAdd: SubmitHandler<IFormInput> = async (data) => {
    setAddLoading(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('datetime', data.time);
  
    if (data.image.length > 0) {
      formData.append('image', data.image[0]);
    }
  
    const response = await fetch('/api/classes', {
      method: 'POST',
      body: formData,
    });
  
    const result = await response.json();
    setAddLoading(false);
  
    if (result.success) {
      MySwal.fire({
        icon: 'success',
        title: 'Aula adicionada com sucesso',
        allowOutsideClick: false,
        showCloseButton: false,
        customClass: {
          popup: 'swal-custom-zindex',
        }
      }).then(() => {
        fetchClasses().then((data) => setClasses(data));
        resetAdd();
        setSelectedFileName(null);
      });
    } else {
      MySwal.fire({
        icon: 'error',
        title: 'Erro ao adicionar aula',
        text: result.message,
        customClass: {
          popup: 'swal-custom-zindex',
        }
      });
    }
  };  

  useEffect(() => {
    fetchClasses().then((data) => {
      setClasses(data);
      setLoading(false);
    });
  }, []);

  const fetchAndSetReportData = async (classId: string) => {
    
    try {
      const response = await fetch(`/api/enrollments?classId=${classId}`);
      const result = await response.json();
  
      console.log("result: ", result);
  
      if (result.success) {
        console.log("result.enrollments: ", result.enrollments);
        setReportData(result.enrollments);
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Erro ao obter dados do relatório',
          text: result.message,
          customClass: {
            popup: 'swal-custom-zindex',
          }
        });
      }
    } catch (error: any) {
      MySwal.fire({
        icon: 'error',
        title: 'Erro ao obter dados do relatório',
        text: error.message,
        customClass: {
          popup: 'swal-custom-zindex',
        }
      });
    }
  };  
  
  const openReportDialog = (classItem: ClassData) => {
    const selectedDate = formatDateTime(classItem.time);
    setSelectedDate(selectedDate);
    fetchAndSetReportData(classItem._id);
    setReportDialogOpen(true);
  };  

  const closeReportDialog = () => {
    setReportDialogOpen(false);
    setReportData([]);
  };

  const openEditModal = (classItem: ClassData) => {
    setEditClassData(classItem);
    setEditModalOpen(true);
    setValueEdit('nameModal', classItem.name);
    setValueEdit('timeModal', classItem.time.slice(0, 16));
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditClassData(null);
    setSelectedFileName(null); 
  };

  const handleEditSubmit: SubmitHandler<IFormInput> = async (data) => {
    if (!editClassData) return;
  
    setEditLoading(true);
  
    const formData = new FormData();
    formData.append('id', editClassData._id);
    formData.append('name', data.nameModal as any);
    formData.append('datetime', data.timeModal as any);
  
    if (data.imageModal && data.imageModal.length > 0) {
      formData.append('image', data.imageModal[0]);
    }
  
    try {
      const response = await fetch(`/api/classes/${editClassData._id}`, {
        method: 'PUT',
        body: formData,
      });
  
      const result = await response.json();
      setEditLoading(false);
  
      if (result.success) {
        closeEditModal();
        MySwal.fire({
          icon: 'success',
          title: 'Aula atualizada com sucesso',
          allowOutsideClick: false,
          showCloseButton: false,
          customClass: {
            popup: 'swal-custom-zindex',
          }
        }).then(() => {
          fetchClasses().then((data) => setClasses(data));
        });
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Erro ao atualizar aula',
          text: result.message,
          customClass: {
            popup: 'swal-custom-zindex',
          }
        });
      }
    } catch (error: any) {
      setEditLoading(false);
      MySwal.fire({
        icon: 'error',
        title: 'Erro na comunicação com o servidor',
        text: error.message,
        customClass: {
          popup: 'swal-custom-zindex',
        }
      });
    }
  };  

  const arrayBufferToBase64 = (buffer: number[]) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; bytes.byteLength > i; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const displayedClasses = classes.slice((currentPage - 1) * classesPerPage, currentPage * classesPerPage);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPageNumbers = 5;
    const halfMaxPageNumbers = Math.floor(maxPageNumbers / 2);

    let startPage = Math.max(currentPage - halfMaxPageNumbers, 1);
    let endPage = Math.min(startPage + maxPageNumbers - 1, totalPages);

    if (endPage - startPage + 1 < maxPageNumbers) {
      startPage = Math.max(endPage - maxPageNumbers + 1, 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          variant={currentPage === i ? 'contained' : 'outlined'}
          color="secondary"
          onClick={() => handlePageChange(i)}
          sx={{
            margin: '0 5px',
            color: currentPage === i ? 'white' : 'purple',
            backgroundColor: currentPage === i ? 'purple' : 'white',
            borderColor: 'purple',
            '&:hover': {
              backgroundColor: 'darkPurple',
              borderColor: 'darkPurple',
              color: 'white',
            },
          }}
        >
          {i}
        </Button>,
      );
    }

    return pageNumbers;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
  
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        MySwal.fire({
          icon: 'error',
          title: 'Atenção',
          text: 'Formato de arquivo não suportado. Apenas JPEG, PNG e JPG são permitidos.',
          customClass: {
            popup: 'swal-custom-zindex',
          }
        });
        return;
      }
  
      const maxSize = 20 * 1024 * 1024;
      if (file.size > maxSize) {
        MySwal.fire({
          icon: 'error',
          title: 'Atenção',
          text: 'O arquivo é muito grande. O tamanho máximo permitido é 20MB.',
          customClass: {
            popup: 'swal-custom-zindex',
          }
        });
        return;
      }
  
      setSelectedFileName(file.name);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="bg-zinc-900">
      <SideBar classCount={0} userName="Admin" />
      <Container sx={{ marginTop: 2 }}>
        <Card sx={{ marginTop: '30px' }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Adicionar Nova Aula
            </Typography>
            <form onSubmit={handleSubmitAdd(onSubmitAdd)} encType="multipart/form-data">
              <TextField
                label="Nome da Aula"
                variant="outlined"
                fullWidth
                margin="normal"
                {...registerAdd('name', { required: true })}
                error={!!errorsAdd.name}
                helperText={errorsAdd.name ? 'Nome é obrigatório' : ''}
              />
              <TextField
                label="Horário/Dia"
                type="datetime-local"
                variant="outlined"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                {...registerAdd('time', { required: true })}
                error={!!errorsAdd.time}
                helperText={errorsAdd.time ? 'Horário é obrigatório' : ''}
              />
              <input type="file" accept="image/jpeg, image/png, image/jpg" {...registerAdd('image', { required: true })} onChange={handleFileChange} />
              {errorsAdd.image && <Typography color="error">Imagem é obrigatória</Typography>}
              {selectedFileName && <Typography>{selectedFileName}</Typography>}
              <Box sx={{ position: 'relative', display: 'inline-flex', marginTop: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ backgroundColor: '#a626a6' }}
                  disabled={addLoading}
                >
                  Adicionar Aula
                </Button>
                {addLoading && (
                  <CircularProgress
                    size={24}
                    sx={{
                      color: 'primary',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                )}
              </Box>
            </form>
          </CardContent>
        </Card>

        <div style={{ marginTop: '20px' }}>
          {!loading && displayedClasses.length > 0 ? (
            displayedClasses.map((classItem) => (
              <Card key={classItem._id} sx={{ marginBottom: 2 }}>
                <CardContent>
                  <Typography variant="h6">{classItem.name}</Typography>
                  <Typography variant="body2" className="mb-2">
                    Horário: {formatDateTime(classItem.time)}
                  </Typography>
                  <img
                    src={`data:image/jpeg;base64,${arrayBufferToBase64(classItem.image.data)}`}
                    alt={classItem.name}
                    style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                  />
                  <Button
                    variant="contained"
                    color="secondary"
                    sx={{ marginTop: 1 }}
                    onClick={() => openReportDialog(classItem)}
                  >
                    Relatório de Inscrições
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ marginTop: 1, marginLeft: 1 }}
                    onClick={() => openEditModal(classItem)}
                  >
                    Editar
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography variant="body2">Nenhuma aula disponível</Typography>
          )}
        </div>

        <Box display="flex" justifyContent="center" mt={2}>
        {currentPage > 1 && (
          <Button
            variant="outlined"
            onClick={() => handlePageChange(currentPage - 1)}
            sx={{
              margin: '0 5px',
              color: 'white',
              backgroundColor: 'purple',
              borderColor: 'purple',
              '&:hover': {
                backgroundColor: 'darkPurple',
                borderColor: 'darkPurple'
              }
            }}
          >
            Anterior
          </Button>
        )}
        {renderPageNumbers()}
        {currentPage < totalPages && (
          <Button
            variant="outlined"
            onClick={() => handlePageChange(currentPage + 1)}
            sx={{
              margin: '0 5px',
              color: 'white',
              backgroundColor: 'purple',
              borderColor: 'purple',
              '&:hover': {
                backgroundColor: 'darkPurple',
                borderColor: 'darkPurple'
              }
            }}
          >
            Próxima
          </Button>
        )}
      </Box>
      </Container>

      <Modal open={editModalOpen} onClose={closeEditModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: 'background.paper',
            border: '2px solid #000',
            boxShadow: 24,
            p: 4,
            zIndex: 5,
          }}
        >
          <Typography variant="h6" component="h2" className='text-black mb-2 font-sans'>
            Editar Aula
          </Typography>
          {editClassData && (
            <form onSubmit={handleSubmitEdit(handleEditSubmit)}>
              <TextField
                label="Nome da Aula"
                variant="outlined"
                fullWidth
                margin="normal"
                defaultValue={editClassData.name}
                {...registerEdit('nameModal', { required: true })}
                error={!!errorsEdit.nameModal}
                helperText={errorsEdit.nameModal ? 'Nome é obrigatório' : ''}
              />
              <TextField
                label="Horário/Dia"
                type="datetime-local"
                variant="outlined"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                defaultValue={editClassData.time.slice(0, 16)}
                {...registerEdit('timeModal', { required: true })}
                error={!!errorsEdit.timeModal}
                helperText={errorsEdit.timeModal ? 'Horário é obrigatório' : ''}
              />
              <input className="text-black" type="file" {...registerEdit('imageModal')} onChange={handleFileChange} />
              {errorsEdit.imageModal && <Typography className='text-black' color="error">Imagem é obrigatória</Typography>}
              {selectedFileName && <Typography className='text-black'>{selectedFileName}</Typography>}
              <Box sx={{ position: 'relative', display: 'inline-flex', marginTop: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ backgroundColor: '#a626a6' }}
                  disabled={editLoading}
                >
                  Atualizar Aula
                </Button>
                {editLoading && (
                  <CircularProgress
                    size={24}
                    sx={{
                      color: 'primary',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      marginTop: '-12px',
                      marginLeft: '-12px',
                    }}
                  />
                )}
              </Box>
            </form>
          )}
        </Box>
      </Modal>

      <ReportDialog reportDialogOpen={reportDialogOpen} closeReportDialog={closeReportDialog} reportData={reportData} />

    </div>
  );
};

export default AddClassPage;