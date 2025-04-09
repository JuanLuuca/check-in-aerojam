import { ClassData } from "@/app/types/ClassEnrollmentsTypes";

export const fetchClasses = async () => {
    try {
    const response = await fetch('/api/classes');
    const result = await response.json();
    return result.data;
    } catch (error) {
    return { success: false, message: 'Erro ao buscar aulas' };
    }
};

export const createClass = async (classData: Omit<ClassData, '_id'>) => {
    try {
        const response = await fetch('/api/classes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(classData),
        });
        const result = await response.json();
        return result;
    } catch (error) {
        return { success: false, message: 'Erro ao criar aula' };
    }
};

export const deleteClass = async (id: string) => {
    try {
        const response = await fetch(`/api/classes/${id}`, { method: 'DELETE' });
        const result = await response.json();
        return result;
    } catch (error) {
        return { success: false, message: 'Erro ao excluir aula' };
    }
};

export const updateClass = async (classData: ClassData) => {
    try {
    const response = await fetch(`/api/classes/${classData._id}`, {
        method: 'PUT',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify(classData),
    });
    const result = await response.json();
    return result;
    } catch (error) {
    return { success: false, message: 'Erro ao atualizar aula' };
    }
};
  