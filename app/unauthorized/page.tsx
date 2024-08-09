"use client"

import { Container, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

const UnauthorizedPage = () => {
  const router = useRouter();

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Acesso Negado
      </Typography>
      <Typography variant="body1" gutterBottom>
        Você não tem permissão para acessar esta página.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={() => router.push('/')}
      >
        Voltar para a Página Inicial
      </Button>
    </Container>
  );
};

export default UnauthorizedPage;