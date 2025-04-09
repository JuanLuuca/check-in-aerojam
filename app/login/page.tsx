'use client';

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';
import { IFormInputLogin } from '../types/ClassEnrollmentsTypes';
import Image from 'next/image';

const Login = () => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<IFormInputLogin>();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: SubmitHandler<IFormInputLogin> = async (data) => {
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
      localStorage.setItem("qtdAulas", result.qtdAulas);
      localStorage.setItem("firstLogin", "true");
      window.location.href = '/';
    } else {
      toast.error(result.message || 'Login failed');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-zinc-900 to-black p-4">
      <div className="absolute inset-0 bg-[url('/AreojamIMG.jpg')] bg-cover bg-center opacity-20"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-zinc-900/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 space-y-6 border border-purple-500/20">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 mb-4 relative">
              <Image
                src="/AreojamIMG.jpg"
                alt="Logo"
                fill
                className="object-contain rounded-full"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Bem-vindo ao Aerojam</h1>
            <p className="text-zinc-400 text-sm mb-6">Faça login para acessar sua conta</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-zinc-300">
                Login
              </label>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  {...register('username', { required: true })}
                  value={username.toLowerCase()}
                  onChange={(event) => {
                    setUsername(event.target.value);
                    setValue('username', event.target.value);
                  }}
                  className={`w-full px-4 py-3 rounded-lg bg-zinc-800 border ${
                    errors.username ? 'border-red-500' : 'border-zinc-700'
                  } text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                  placeholder="Digite seu login"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500">Login é obrigatório</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  {...register('password', { required: true })}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setValue('password', event.target.value);
                  }}
                  className={`w-full px-4 py-3 rounded-lg bg-zinc-800 border ${
                    errors.password ? 'border-red-500' : 'border-zinc-700'
                  } text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors`}
                  placeholder="Digite sua senha"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">Senha é obrigatória</p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Entrando...</span>
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;