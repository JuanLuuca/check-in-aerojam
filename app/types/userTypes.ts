import { SelectChangeEvent } from "@mui/material";

export interface User {
    _id: string;
    login: string;
    perfil: number;
    qtdAulas: number;
    password?: string; 
}

export interface ModalCreateUserProps {
    openCreateModal: boolean;
    setOpenCreateModal: (open: boolean) => void;
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleCreateUser: () => void;
    handlePerfilChange: (event: SelectChangeEvent<number>) => void;
    newUser: Omit<User, '_id'>
    formLoading: boolean;
}

export interface ModalEditUserProps {
    editUser: Partial<User> | null;
    setEditUser: (open: Partial<User> | null) => void;
    setOpenEditModal: (open: boolean) => void;
    handleEditInputChange: (open: React.ChangeEvent<HTMLInputElement>) => void;
    handleEditPerfilChange: (event: SelectChangeEvent<number>) => void;
    handleEditUser: () => void;
    formLoading: boolean;
}