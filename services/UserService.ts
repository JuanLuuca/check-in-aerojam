import { User } from "@/app/types/userTypes";

export const perfilLabels: { [key: number]: string } = {
    1: 'Administrador',
    2: 'Aluno',
};

export const fetchUsers = async (authToken: string) => {
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

export const deleteUser = async (userId: string, authToken: string) => {
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

export const createUser = async (userData: Omit<User, '_id'>, authToken: string) => {
  const response = await fetch('/api/allUsers', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(userData)
  });
  return await response.json();
};

export const updateUser = async (userId: string, updateData: { perfil?: number, qtdAulas?: number }, authToken: string) => {
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

export const fetchUserAdmin = async (authToken: string) => {
  const response = await fetch('/api/users', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  const result = await response.json();
  return result.Perfil;
};