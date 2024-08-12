'use client';

import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box, Card, CardContent, CircularProgress } from '@mui/material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import SideBar from './components/sidebar/Sidebar';

const MySwal = withReactContent(Swal);

interface ClassData {
  _id: string;
  name: string;
  time: string;
  image: {
    type: string;
    data: number[];
  };
}

interface Enrollment {
  _id: string;
  userId: string;
  classId: string;
}

const fetchClasses = async () => {
  const response = await fetch('/api/classes');
  const result = await response.json();
  return result.data as ClassData[];
};

const fetchEnrollments = async (authToken: string) => {
  const response = await fetch('/api/enrollments', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  const result = await response.json();
  return result.data as Enrollment[];
};

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

  const classesPerPage = 4;
  const totalPages = Math.ceil(classes.length / classesPerPage);

  useEffect(() => {
    const token = localStorage.getItem('authToken') || 'authToken';
    const name = localStorage.getItem('userName') || 'Usuário';

    setAuthToken(token);
    setUserName(name);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedClasses = await fetchClasses();
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
  }, [authToken]);

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
        </Button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="bg-zinc-900 font-sans">
      <SideBar userName={userName} classCount={classCount} />
      <Container sx={{ marginTop: 2 }}>
        <Box mt={4}>
          {loading ? (
            <Typography variant="body1" color="white">Carregando aulas... <CircularProgress size={24} style={{ color: 'white' }} /> </Typography>
          ) : (
            displayedClasses.map(c => {
              const isEnrolled = enrollments.some(e => e.classId === c._id);
              const isEnrollmentLoading = enrollmentLoading[c._id];
              const isUnenrollmentLoading = unenrollmentLoading[c._id];
              return (
                <Card key={c._id} sx={{ marginBottom: 2 }}>
                  <CardContent>
                    <Typography variant="h6">{c.name}</Typography>
                    <Typography variant="body2" className='mb-2'>Horário: {formatDateTime(c.time)}</Typography>
                    <img
                      src={`data:image/jpeg;base64,${arrayBufferToBase64(c.image.data)}`}
                      alt={c.name}
                      style={{ width: '100%', height: 'auto', objectFit: 'cover', marginTop: '3px' }}
                    />
                    {isEnrolled ? (
                      <Button
                        variant="contained"
                        color="secondary"
                        sx={{ marginTop: 1 }}
                        onClick={() => handleUnenrollment(c._id)}
                        disabled={isUnenrollmentLoading}
                      >
                        {isUnenrollmentLoading ? <CircularProgress size={24} color="inherit" /> : 'Cancelar Inscrição'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ marginTop: 1 }}
                        onClick={() => handleEnrollment(c._id)}
                        disabled={isEnrollmentLoading}
                      >
                        {isEnrollmentLoading ? <CircularProgress size={24} color="inherit" /> : 'Inscrever-se'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </Box>

        <Box display="flex" justifyContent="center" mt={2}>
          {currentPage > 1 && (
            <Button
              variant="outlined"
              color="primary"
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
              color="primary"
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
    </div>
  );
};

export default HomePage;