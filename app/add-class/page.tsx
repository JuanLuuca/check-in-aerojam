"use client"

import React, { useEffect, useState } from 'react';
import { Container, TextField, Button, Typography, Card, CardContent, Box, Modal, CircularProgress } from '@mui/material';
import { useForm, SubmitHandler } from 'react-hook-form';
import SideBar from '../components/sidebar/Sidebar';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import ReportDialog from '../components/reportDialog/ReportDialog';
import { useRouter } from 'next/navigation';
import { fetchUserAdmin } from '@/services/UserService';
import { fetchClasses } from '@/services/classService';
import { ClassData, EnrollmentAddClass, IFormInput } from '../types/ClassEnrollmentsTypes';
import { toast } from 'react-toastify';
import { ModalCreateClass } from '../components/ModalClasses/ModalCreateClass';

const MySwal = withReactContent(Swal);

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
  const [reportData, setReportData] = useState<EnrollmentAddClass[]>([]);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [newClass, setNewClass] = useState<Omit<ClassData, '_id'>>({
    name: '',
    time: '',
    image: {
      type: '',
      data: [],
    },
  });

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
      toast.success('Aula criada com sucesso!');
      router.push('/manage-classes');
    } else {
      toast.error(result.message || 'Erro ao criar aula');
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

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = event.target;
    if (name === 'image' && files) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        setNewClass({
          ...newClass,
          image: {
            type: file.type,
            data: Array.from(uint8Array),
          },
        });
      };
      reader.readAsArrayBuffer(file);
    } else {
      setNewClass({ ...newClass, [name]: value });
    }
  };

  const handleCreateClass = async () => {
    setFormLoading(true);
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClass),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Aula criada com sucesso!');
        setOpenCreateModal(false);
        setNewClass({
          name: '',
          time: '',
          image: {
            type: '',
            data: [],
          },
        });
        fetchClasses().then((data) => {
          setClasses(data);
        });
      } else {
        toast.error(result.message || 'Erro ao criar aula');
      }
    } catch (error) {
      toast.error('Erro ao criar aula');
      console.error('Erro ao criar aula:', error);
    } finally {
      setFormLoading(false);
    }
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <SideBar userName="Admin" classCount={0} />
      <main className="container mx-auto px-4 pt-20 pb-8 lg:ml-64 lg:max-w-[calc(100%-16rem)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col space-y-4 mb-8">
            <button
              onClick={() => setOpenCreateModal(true)}
              className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Adicionar Aula</span>
            </button>
            <h1 className="text-2xl font-bold text-white text-center">Aulas Cadastradas</h1>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : displayedClasses.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedClasses.map((classItem) => (
                  <div
                    key={classItem._id}
                    className="bg-zinc-800 rounded-lg shadow-lg overflow-hidden"
                  >
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-white mb-2">
                        {classItem.name}
                      </h3>
                      <p className="text-zinc-400 mb-4">
                        Horário: {formatDateTime(classItem.time)}
                      </p>
                      <div className="relative w-full h-48 mb-4">
                        <img
                          src={`data:image/jpeg;base64,${arrayBufferToBase64(
                            classItem.image.data
                          )}`}
                          alt={classItem.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div className="flex justify-between space-x-2">
                        <button
                          onClick={() => openReportDialog(classItem)}
                          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span>Relatório</span>
                        </button>
                        <button
                          onClick={() => openEditModal(classItem)}
                          className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          <span>Editar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginação */}
              <div className="flex justify-center items-center space-x-2 mt-6">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                        currentPage === page
                          ? 'bg-purple-600 text-white'
                          : 'bg-zinc-800 text-white hover:bg-zinc-700'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-400">Nenhuma aula cadastrada</p>
            </div>
          )}
        </div>
      </main>

      <ModalCreateClass
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSubmit={handleCreateClass}
        loading={formLoading}
        classData={newClass}
        onInputChange={handleInputChange}
      />

      <Modal open={editModalOpen} onClose={closeEditModal}>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Editar Aula</h2>
              <button
                onClick={closeEditModal}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {editClassData && (
              <form onSubmit={handleSubmitEdit(handleEditSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="nameModal" className="block text-sm font-medium text-zinc-300 mb-1">
                    Nome da Aula
                  </label>
                  <input
                    type="text"
                    id="nameModal"
                    {...registerEdit('nameModal', { required: true })}
                    className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Digite o nome da aula"
                  />
                  {errorsEdit.nameModal && (
                    <p className="mt-1 text-sm text-red-500">Nome é obrigatório</p>
                  )}
                </div>

                <div>
                  <label htmlFor="timeModal" className="block text-sm font-medium text-zinc-300 mb-1">
                    Horário
                  </label>
                  <input
                    type="datetime-local"
                    id="timeModal"
                    {...registerEdit('timeModal', { required: true })}
                    className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {errorsEdit.timeModal && (
                    <p className="mt-1 text-sm text-red-500">Horário é obrigatório</p>
                  )}
                </div>

                <div>
                  <label htmlFor="imageModal" className="block text-sm font-medium text-zinc-300 mb-1">
                    Imagem da Aula
                  </label>
                  <input
                    type="file"
                    id="imageModal"
                    {...registerEdit('imageModal')}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  {selectedFileName && (
                    <p className="mt-2 text-sm text-zinc-400">{selectedFileName}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {editLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Atualizando...</span>
                      </>
                    ) : (
                      'Atualizar Aula'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </Modal>

      <ReportDialog reportDialogOpen={reportDialogOpen} closeReportDialog={closeReportDialog} reportData={reportData} />

    </div>
  );
};

export default AddClassPage;