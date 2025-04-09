import { SelectChangeEvent } from "@mui/material";

export interface User {
    _id: string;
    login: string;
    perfil: number;
    qtdAulas: number;
    password?: string; 
}

export interface ModalCreateUserProps {
    open: boolean;
    onClose: () => void;
    onSubmit: () => void;
    loading: boolean;
    user: Omit<User, '_id'>;
    onInputChange: (event: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => void;
    onPerfilChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export interface ModalEditUserProps {
    open: boolean;
    onClose: () => void;
    onSubmit: () => void;
    loading: boolean;
    user: Partial<User> | null;
    onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onPerfilChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

export interface ModalDeleteUserProps {
    open: boolean;
    onClose: () => void;
    onDelete: () => void;
    loading: boolean;
    user: User | null;
}