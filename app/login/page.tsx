'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button, TextField, Typography, Container, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';

interface IFormInput {
  username: string;
  password: string;
}

const Login = () => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<IFormInput>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setIsLoading(true);
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      localStorage.setItem("authToken", result.authToken);
      localStorage.setItem("userName", result.userName);
      window.location.href = '/';
    } else {
      toast.error(result.message || 'Login failed');
    }

    setIsLoading(false);
  };

  return (
    <section className="min-h-screen flex items-center justify-center bg-cover bg-center p-4" style={{ backgroundImage: "url('/AreojamIMG.jpg')" }}>
      <Container component="main" maxWidth="xs" className="bg-black bg-opacity-95 rounded-lg shadow p-8 space-y-6">
        <div className="flex flex-col items-center">
          <Typography component="h1" variant="h5" className="text-white mb-6">
            Check-in
          </Typography>
          <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
            <div>
              <label htmlFor="username" className="block mb-2 text-sm font-medium text-white">Login</label>
              <TextField
                variant="outlined"
                fullWidth
                autoComplete='off'
                id="username"
                {...register('username', { required: true })}
                error={!!errors.username}
                helperText={errors.username ? 'Login é obrigatório' : ''}
                value={username.toLowerCase()}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setValue('username', event.target.value);
                }}
                InputProps={{
                  style: {
                    height: '40px',
                    color: 'white'
                  },
                }}
                className="bg-gray-800 border border-gray-700 text-white sm:text-sm rounded-md focus:ring-primary-600 focus:border-primary-600"
              />
            </div>
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-white">Senha</label>
              <TextField
                variant="outlined"
                fullWidth
                type="password"
                autoComplete='off'
                id="password"
                {...register('password', { required: true })}
                error={!!errors.password}
                helperText={errors.password ? 'Senha é obrigatório' : ''}
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setValue('password', event.target.value);
                }}
                InputProps={{
                  style: {
                    height: '40px',
                    color: 'white'
                  },
                }}
                className="bg-gray-800 border border-gray-700 text-white sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600"
              />
            </div>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              className="bg-primary-600 hover:bg-primary-700 focus:ring-primary-800"
              style={{ backgroundColor: '#a626a6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} style={{ color: 'white' }} /> : 'Entrar'}
            </Button>
          </form>
        </div>
      </Container>
    </section>
  );
};

export default Login;