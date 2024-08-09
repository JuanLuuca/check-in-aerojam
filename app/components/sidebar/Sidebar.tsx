import { useRouter } from 'next/navigation';
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useEffect, useState } from 'react';
import { Home, Logout } from '@mui/icons-material';

interface SidebarProps {
  userName: string;
  classCount: number;
}

const fetchUserAdmin = async (authToken: string) => {
  const response = await fetch('/api/users', {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  const result = await response.json();
  return result.Perfil;
};

const Sidebar: React.FC<SidebarProps> = ({ userName, classCount }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [getProfile, setGetProfile] = useState(0);
  const router = useRouter();

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = async () => {
    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      localStorage.clear();
      router.push('/login');
    } else {
      console.error('Logout failed');
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("authToken") as string;

      const profile = await fetchUserAdmin(token);

      setGetProfile(profile);
    };

    init();
  }, [getProfile]);

  return (
    <div>
      <AppBar position="fixed" sx={{ backgroundColor: '#a626a6' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleMenu}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Olá {userName}
          </Typography>
          <Typography variant="h6">
            {classCount} Aulas
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={menuOpen}
        onClose={toggleMenu}
        PaperProps={{
          sx: { width: '60%', backgroundColor: '#18181b', position: 'fixed' },
        }}
      >
        <IconButton onClick={toggleMenu} sx={{ marginLeft: 'auto', padding: 1 }}>
          <CloseIcon sx={{ color: 'white' }} />
        </IconButton>
        <List>
          <ListItem button onClick={() => router.push('/')}>
            <ListItemIcon sx={{ minWidth: '35px', color: 'white' }}>
              <Home />
            </ListItemIcon>
            <ListItemText primary="Página principal" sx={{ color: 'white' }} />
          </ListItem>
          {getProfile === 1 && (
            <>
              <ListItem button onClick={() => router.push('/manage-users')}>
                <ListItemIcon sx={{ minWidth: '35px', color: 'white' }}>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Gerenciar Usuários" sx={{ color: 'white' }} />
              </ListItem>
              <ListItem button onClick={() => router.push('/add-class')}>
                <ListItemIcon sx={{ minWidth: '35px', color: 'white' }}>
                  <AddCircleIcon />
                </ListItemIcon>
                <ListItemText primary="Gerenciar Aulas" sx={{ color: 'white' }} />
              </ListItem>
            </>
          )}
          
          <ListItem button onClick={handleLogout}>
            <ListItemIcon sx={{ minWidth: '35px', color: 'white' }}>
              <Logout />
            </ListItemIcon>
            <ListItemText primary="Sair" sx={{ color: 'white' }} />
          </ListItem>
        </List>
      </Drawer>
      <div style={{ paddingTop: '40px' }}>
      </div>
    </div>
  );
};

export default Sidebar;