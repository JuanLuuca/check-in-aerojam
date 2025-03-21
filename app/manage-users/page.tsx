"use client"

import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, CircularProgress, SelectChangeEvent, TablePagination, } from '@mui/material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import SideBar from '../components/sidebar/Sidebar';
import { User } from '../types/userTypes';
import { fetchUsers, createUser, deleteUser, updateUser, perfilLabels } from '../services/UserService';
import { ModalCreateUser } from '../components/ModalUsers/ModalCreateUser';
import { ModalEditUser } from '../components/ModalUsers/ModalEditUser';

const MySwal = withReactContent(Swal);

const ManageUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string>("");
  const [newUser, setNewUser] = useState<Omit<User, '_id'>>({ login: '', perfil: 1, qtdAulas: 0, password: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [editUser, setEditUser] = useState<Partial<User> | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [search, setSearch] = useState("");
  const [openEditModal, setOpenEditModal] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  useEffect(() => {
    const token = localStorage.getItem('authToken') || '';
    setAuthToken(token);

    const fetchData = async () => {
      try {
        setUsers(await fetchUsers(token));
      } catch (error) {
        MySwal.fire({
          icon: 'error',
          title: 'Erro',
          text: (error as Error).message,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken]);

  const handleDelete = async (userId: string) => {
    try {
      const result = await deleteUser(userId, authToken);
      if (result.success) {
        setUsers(users.filter(user => user._id !== userId));
        MySwal.fire({
          icon: 'success',
          title: 'Usuário excluído',
          text: 'O usuário foi excluído com sucesso.',
        });
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Erro',
          text: result.message,
        });
      }
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: (error as Error).message,
      });
    }
  };

  const handleCreateUser = async () => {
    setFormLoading(true);
    try {
      const result = await createUser(newUser, authToken);
      if (result.success) {
        setUsers([...users, result.data]);
        setNewUser({ login: '', perfil: 1, qtdAulas: 0, password: '' });
        setOpenCreateModal(false);
        MySwal.fire({
          icon: 'success',
          title: 'Usuário criado',
          text: 'O novo usuário foi criado com sucesso.',
        });
      } else {
        MySwal.fire({
          icon: 'error',
          title: 'Erro',
          text: result.message,
        });
      }
    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'Erro',
        text: (error as Error).message,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (editUser && editUser._id) {
      setFormLoading(true);
      try {
        const result = await updateUser(editUser._id, editUser, authToken);
        if (result.success) {
          setUsers(users.map(user => (user._id === editUser._id ? result.data : user)));
          setEditUser(null);
          setOpenEditModal(false);
          MySwal.fire({
            icon: 'success',
            title: 'Usuário atualizado',
            text: 'As informações do usuário foram atualizadas com sucesso.',
          });
        } else {
          MySwal.fire({
            icon: 'error',
            title: 'Erro',
            text: result.message,
          });
        }
      } catch (error) {
        MySwal.fire({
          icon: 'error',
          title: 'Erro',
          text: (error as Error).message,
        });
      } finally {
        setFormLoading(false);
      }
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = event.target as HTMLInputElement;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handlePerfilChange = (event: SelectChangeEvent<number>) => {
    setNewUser(prev => ({ ...prev, perfil: event.target.value as number }));
  };

  const handleEditInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEditUser(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  const handleEditPerfilChange = (event: SelectChangeEvent<number>) => {
    setEditUser(prev => prev ? { ...prev, perfil: event.target.value as number } : null);
  };  

  const handleChangePage = (event: React.MouseEvent<HTMLButtonElement> | null, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement | { value: unknown }>) => {
    setRowsPerPage(parseInt(event.target.value as string, 10));
    setPage(0);
  };

  const filteredUsers = users.filter(user =>
    user.login.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="bg-zinc-900 font-sans">
      <SideBar userName="Admin" classCount={0} />
      <Container sx={{ marginTop: 2 }}>
        <Box mt={4}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, marginBottom: 2 }}>
            <TextField
              placeholder="Insira o login do usuário"
              variant="outlined"
              color="success"
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                input: { color: "#fff" }, 
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: "#9c27b0" },
                  "&:hover fieldset": { borderColor: "purple" },
                  "&.Mui-focused fieldset": { borderColor: "purple" },
                },
                backgroundColor: "#222",
                borderRadius: 1,
              }}
            />
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setOpenCreateModal(true)}
            >
              Novo Usuário
            </Button>
          </Box>

          {loading ? (
            <Typography variant="body1" color="white">
              Carregando usuários... <CircularProgress size={24} style={{ color: 'white' }} />
            </Typography>
          ) : (
            <>
              <TableContainer component={Paper} sx={{ color: 'white', maxWidth: '100%', overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ color: 'black' }}>Login</TableCell>
                      <TableCell style={{ color: 'black' }}>Perfil</TableCell>
                      <TableCell style={{ color: 'black' }}>Aulas</TableCell>
                      <TableCell style={{ color: 'black' }}>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedUsers.map(user => (
                      <TableRow key={user._id}>
                        <TableCell>{user.login}</TableCell>
                        <TableCell>{perfilLabels[user.perfil]}</TableCell>
                        <TableCell>{user.qtdAulas}</TableCell>
                        <TableCell>
                          <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => {
                              setEditUser(user);
                              setOpenEditModal(true);
                            }}
                            sx={{ marginRight: 1, marginBottom: 1 }}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            onClick={() => handleDelete(user._id)}
                          >
                            Excluir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredUsers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                sx={{ color: 'white', backgroundColor: '#9c27b0', marginTop: 2 }}
              />
            </>
          )}
        </Box>

        <ModalCreateUser 
          openCreateModal={openCreateModal} 
          setOpenCreateModal={setOpenCreateModal} 
          handleInputChange={handleInputChange} 
          handleCreateUser={handleCreateUser} 
          newUser={newUser} 
          handlePerfilChange={handlePerfilChange}
          formLoading={formLoading}
        />

        <ModalEditUser 
          editUser={editUser} 
          setEditUser={setEditUser} 
          setOpenEditModal={setOpenEditModal} 
          handleEditInputChange={handleEditInputChange} 
          handleEditPerfilChange={handleEditPerfilChange} 
          handleEditUser={handleEditUser}
          formLoading={formLoading}
        />

      </Container>
    </div>
  );
};

export default ManageUsersPage;