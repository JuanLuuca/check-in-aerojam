"use client"

import React, { useEffect, useState } from 'react';
import { Container, Typography, Button, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem, InputLabel, FormControl, useMediaQuery, useTheme, SelectChangeEvent } from '@mui/material';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import SideBar from '../components/sidebar/Sidebar';

const MySwal = withReactContent(Swal);

interface User {
  _id: string;
  login: string;
  perfil: number;
  qtdAulas: number;
  password?: string; 
}

const perfilLabels: { [key: number]: string } = {
  1: 'Administrador',
  2: 'Aluno',
};

const fetchUsers = async (authToken: string) => {
  const response = await fetch('/api/allUsers', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  const result = await response.json();
  if (result.success) {
    return result.data as User[];
  }
  throw new Error(result.message || 'Erro ao buscar usuários.');
};

const deleteUser = async (userId: string, authToken: string) => {
  const response = await fetch('/api/allUsers', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ userId })
  });

  return await response.json();
};
const createUser = async (userData: Omit<User, '_id'>, authToken: string) => {
  const response = await fetch('/api/allUsers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(userData)
  });
  return await response.json();
};

const updateUser = async (userId: string, updateData: { perfil?: number, qtdAulas?: number }, authToken: string) => {
  const response = await fetch('/api/allUsers', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({ userId, ...updateData })
  });

  return await response.json();
};

const ManageUsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string>("");
  const [newUser, setNewUser] = useState<Omit<User, '_id'>>({ login: '', perfil: 1, qtdAulas: 0, password: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [editUser, setEditUser] = useState<Partial<User> | null>(null);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        setNewUser({ login: '', perfil: 1, qtdAulas: 0 });
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

  return (
    <div className="bg-zinc-900 font-inconsolata">
      <SideBar userName="Admin" classCount={0} />
      <Container sx={{ marginTop: 2 }}>
        <Box mt={4}>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setOpenCreateModal(true)}
            sx={{ marginBottom: 2 }}
          >
            Criar Novo Usuário
          </Button>

          {loading ? (
            <Typography variant="body1" color="white">
              Carregando usuários... <CircularProgress size={24} style={{ color: 'white' }} />
            </Typography>
          ) : (
            <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Login</TableCell>
                    <TableCell>Perfil</TableCell>
                    <TableCell>Aulas</TableCell>
                    <TableCell>Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map(user => (
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
          )}
        </Box>

        {/* Modal para criar usuário */}
        <Dialog sx={{ zIndex: 5 }} open={openCreateModal} onClose={() => setOpenCreateModal(false)} fullWidth maxWidth="sm">
          <DialogTitle>Criar Novo Usuário</DialogTitle>
          <DialogContent>
            <TextField
              label="Login"
              name="login"
              value={newUser.login.toLowerCase()}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Senha"
              name="password"
              type="password"
              value={newUser.password || ''}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Perfil</InputLabel>
              <Select
                name="perfil"
                value={newUser.perfil}
                onChange={handlePerfilChange}
                inputProps={{ 'aria-label': 'perfil' }}
              >
                <MenuItem value={1}>Administrador</MenuItem>
                <MenuItem value={2}>Aluno</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Aulas"
              name="qtdAulas"
              value={newUser.qtdAulas}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
              type="number"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreateModal(false)}>Cancelar</Button>
            <Button
              onClick={handleCreateUser}
              color="primary"
              disabled={formLoading}
            >
              {formLoading ? <CircularProgress size={24} color="inherit" /> : 'Criar Usuário'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal para editar usuário */}
        <Dialog sx={{ zIndex: 5 }} open={!!editUser} onClose={() => {
          setEditUser(null);
          setOpenEditModal(false);
        }} fullWidth maxWidth="sm">
          <DialogTitle>Editar Usuário</DialogTitle>
          <DialogContent>
            {editUser && (
              <>
                <TextField
                  label="Login"
                  name="login"
                  disabled
                  value={editUser.login || ''}
                  onChange={handleEditInputChange}
                  fullWidth
                  margin="normal"
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel>Perfil</InputLabel>
                  <Select
                    name="perfil"
                    value={editUser.perfil || 1}
                    onChange={handleEditPerfilChange}
                    inputProps={{ 'aria-label': 'perfil' }}
                  >
                    <MenuItem value={1}>Administrador</MenuItem>
                    <MenuItem value={2}>Aluno</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Aulas"
                  name="qtdAulas"
                  value={editUser.qtdAulas || ''}
                  onChange={handleEditInputChange}
                  fullWidth
                  margin="normal"
                  type="number"
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setEditUser(null);
              setOpenEditModal(false);
            }}>Cancelar</Button>
            <Button
              onClick={handleEditUser}
              color="primary"
              disabled={formLoading}
            >
              {formLoading ? <CircularProgress size={24} color="inherit" /> : 'Salvar Alterações'}
            </Button>
          </DialogActions>
        </Dialog>

      </Container>
    </div>
  );
};

export default ManageUsersPage;