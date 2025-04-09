"use client"

import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box, Card, CardContent, CircularProgress } from '@mui/material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import SideBar from './components/sidebar/Sidebar';
import { ClassData, Enrollment } from './types/ClassEnrollmentsTypes';
import { fetchClassesFilter, fetchEnrollments } from '@/services/ClassEnrollmentsService';
import { useRouter } from 'next/navigation';

const MySwal = withReactContent(Swal);

const HomePage = () => {
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [classCount, setClassCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [enrollmentLoading, setEnrollmentLoading] = useState<{ [key: string]: boolean }>({});
  const [unenrollmentLoading, setUnenrollmentLoading] = useState<{ [key: string]: boolean }>({});

  const [authToken, setAuthToken] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [isFirstLogin, setIsFirstLogin] = useState(true);
  const router = useRouter();

  const classesPerPage = 4;

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const storedUserName = localStorage.getItem('userName');
    const firstLogin = localStorage.getItem('firstLogin') === 'true';

    if (!token) {
      router.push('/login');
      return;
    }

    if (storedUserName) {
      setUserName(storedUserName);
      setIsFirstLogin(firstLogin);
      if (firstLogin) {
        localStorage.setItem('firstLogin', 'false');
      }
    }

    const fetchData = async () => {
      try {
        const fetchedClasses = await fetchClassesFilter();
        const fetchedEnrollments = await fetchEnrollments(authToken);
        const fetchedClassCountString = await localStorage.getItem("qtdAulas");

        const fetchedClassCount = fetchedClassCountString !== null 
          ? parseInt(fetchedClassCountString, 10) || 0
          : 0;
        
        setClasses(fetchedClasses);
        setEnrollments(fetchedEnrollments);
        setClassCount(fetchedClassCount);
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
      setLoading(false);
    };
  
    fetchData();
  }, [authToken, router]);

  const handleEnrollment = async (classId: string) => {
    setEnrollmentLoading({ ...enrollmentLoading, [classId]: true });

    const response = await fetch('/api/enrollments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ classId }),
    });

    const result = await response.json();

    setEnrollmentLoading({ ...enrollmentLoading, [classId]: false });

    if (result.success) {
      setEnrollments([...enrollments, result.data]);
      setClassCount(prevCount => {
        const newCount = prevCount - 1;
        localStorage.setItem("qtdAulas", newCount.toString());
        return newCount;
      });
      MySwal.fire({
        icon: 'success',
        title: 'Inscrito com sucesso',
        text: 'Você se inscreveu na aula com sucesso.',
      });
    } else {
      MySwal.fire({
        icon: 'error',
        title: 'Atenção',
        text: result.message,
      });
    }
  };

  const handleUnenrollment = async (classId: string) => {
    const enrollment = enrollments.find(e => e.classId === classId);
    if (!enrollment) return;

    setUnenrollmentLoading({ ...unenrollmentLoading, [classId]: true });

    const response = await fetch(`/api/enrollments/${enrollment._id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
    });

    const result = await response.json();

    setUnenrollmentLoading({ ...unenrollmentLoading, [classId]: false });

    if (result.success) {
      setEnrollments(enrollments.filter(e => e._id !== enrollment._id));
      setClassCount(prevCount => {
        const newCount = prevCount + 1;
        localStorage.setItem("qtdAulas", newCount.toString());
        return newCount;
      });
      MySwal.fire({
        icon: 'success',
        title: 'Inscrição cancelada',
        text: 'Você cancelou a inscrição com sucesso.',
      });
    } else {
      MySwal.fire({
        icon: 'error',
        title: 'Erro ao cancelar inscrição',
        text: result.message,
      });
    }
  };

  const arrayBufferToBase64 = (buffer: number[]) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
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
      hour12: false
    };
    
    const formattedDate = new Intl.DateTimeFormat('pt-BR', options).format(date);
    return formattedDate.replace(',', '');
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const oneWeekFromNow = new Date();
  oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

  const filteredClasses = classes.filter(c => {
    const classDate = new Date(c.time);
    return classDate <= oneWeekFromNow;
  });

  const totalPages = Math.ceil(filteredClasses.length / classesPerPage);
  const displayedClasses = filteredClasses.slice((currentPage - 1) * classesPerPage, currentPage * classesPerPage);

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
        </Button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <SideBar userName={userName} classCount={classCount} />
      <main className="container mx-auto px-4 pt-20 pb-8 lg:ml-64 lg:max-w-[calc(100%-16rem)]">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isFirstLogin ? `Bem-vindo, ${userName}!` : `Bem-vindo de volta, ${userName}!`}
          </h1>
          <p className="text-zinc-400">
            {isFirstLogin 
              ? 'Estamos felizes em tê-lo conosco! Aqui estão suas aulas disponíveis.'
              : 'Aqui estão suas aulas disponíveis.'}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Carregando aulas...</span>
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400 text-lg">Nenhuma aula disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedClasses.map(c => {
              const isEnrolled = enrollments.some(e => e.classId === c._id);
              const isEnrollmentLoading = enrollmentLoading[c._id];
              const isUnenrollmentLoading = unenrollmentLoading[c._id];
              return (
                <div key={c._id} className="bg-zinc-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="p-4">
                    <h3 className="text-xl font-semibold mb-2">{c.name}</h3>
                    <p className="text-zinc-400 mb-4">Horário: {formatDateTime(c.time)}</p>
                    <img
                      src={`data:image/jpeg;base64,${arrayBufferToBase64(c.image.data)}`}
                      alt={c.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                    {isEnrolled ? (
                      <button
                        onClick={() => handleUnenrollment(c._id)}
                        disabled={isUnenrollmentLoading}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2"
                      >
                        {isUnenrollmentLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          'Cancelar Inscrição'
                        )}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnrollment(c._id)}
                        disabled={isEnrollmentLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2"
                      >
                        {isEnrollmentLoading ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          'Inscrever-se'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-zinc-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors duration-300"
            >
              Anterior
            </button>
            {renderPageNumbers()}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-zinc-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors duration-300"
            >
              Próxima
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;