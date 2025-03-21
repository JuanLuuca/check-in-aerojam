import { Button, TextField, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import { ModalCreateUserProps } from '@/app/types/userTypes';

export function ModalCreateUser({ openCreateModal, setOpenCreateModal, handleInputChange, handleCreateUser, newUser, handlePerfilChange, formLoading }: ModalCreateUserProps) {
    return (
        <>
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
        </>
    );
}