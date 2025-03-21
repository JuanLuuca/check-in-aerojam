import { ModalEditUserProps } from '@/app/types/userTypes';
import { Button, TextField, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

export function ModalEditUser({ editUser, setEditUser, setOpenEditModal, handleEditInputChange, handleEditPerfilChange, handleEditUser, formLoading }: ModalEditUserProps) {
    return (
        <>
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
        </>
    )
}