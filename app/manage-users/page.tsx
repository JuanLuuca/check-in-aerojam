"use client"

import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import SideBar from '../components/sidebar/Sidebar';
import { User } from '../types/userTypes';
import { ModalCreateUser } from '../components/ModalUsers/ModalCreateUser';
import { ModalEditUser } from '../components/ModalUsers/ModalEditUser';
import { createUser, deleteUser, fetchUsers, perfilLabels, updateUser } from '@/services/UserService';

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

  const handlePerfilChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setNewUser(prev => ({ ...prev, perfil: parseInt(event.target.value) }));
  };

  const handleEditInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEditUser(prev => prev ? { ...prev, [name]: value } : null);
  };
  
  const handleEditPerfilChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setEditUser(prev => prev ? { ...prev, perfil: parseInt(event.target.value) } : null);
  };  

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredUsers = users.filter(user =>
    user.login.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <SideBar userName="Admin" classCount={0} />
      <main className="container mx-auto px-4 pt-20 pb-8 lg:ml-64 lg:max-w-[calc(100%-16rem)]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Buscar usuário..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <svg
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <button
            onClick={() => setOpenCreateModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Novo Usuário</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-zinc-800 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                      Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                      Perfil
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                      Aulas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700">
                  {paginatedUsers.map(user => (
                    <tr key={user._id} className="hover:bg-zinc-700/50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{user.login}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          {perfilLabels[user.perfil]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {user.qtdAulas}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setEditUser(user);
                            setOpenEditModal(true);
                          }}
                          className="text-purple-400 hover:text-purple-300 transition-colors duration-200"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-red-400 hover:text-red-300 transition-colors duration-200"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 flex items-center justify-between border-t border-zinc-700">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-zinc-400">Linhas por página:</span>
                <select
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                  className="bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleChangePage(page - 1)}
                  disabled={page === 0}
                  className="px-3 py-1 rounded-lg bg-zinc-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors duration-200"
                >
                  Anterior
                </button>
                <span className="text-sm text-zinc-400">
                  Página {page + 1} de {Math.ceil(filteredUsers.length / rowsPerPage)}
                </span>
                <button
                  onClick={() => handleChangePage(page + 1)}
                  disabled={page >= Math.ceil(filteredUsers.length / rowsPerPage) - 1}
                  className="px-3 py-1 rounded-lg bg-zinc-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors duration-200"
                >
                  Próxima
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <ModalCreateUser
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSubmit={handleCreateUser}
        loading={formLoading}
        user={newUser}
        onInputChange={handleInputChange}
        onPerfilChange={handlePerfilChange}
      />

      <ModalEditUser
        open={openEditModal}
        onClose={() => setOpenEditModal(false)}
        onSubmit={handleEditUser}
        loading={formLoading}
        user={editUser}
        onInputChange={handleEditInputChange}
        onPerfilChange={handleEditPerfilChange}
      />
    </div>
  );
};

export default ManageUsersPage;