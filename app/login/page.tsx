'use client';
import { motion } from 'framer-motion';
import { FiLock, FiMail, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const LoginPage = () => {
  const router = useRouter();
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Estados para formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '', general: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Validación de email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'El correo es requerido' }));
      return false;
    }
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Ingresa un correo válido' }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: '' }));
    return true;
  };

  // Validación de contraseña
  const validatePassword = (password: string) => {
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'La contraseña es requerida' }));
      return false;
    }
    if (password.length < 4) {
      setErrors(prev => ({ ...prev, password: 'La contraseña debe tener al menos 4 caracteres' }));
      return false;
    }
    setErrors(prev => ({ ...prev, password: '' }));
    return true;
  };

  // Función para manejar el login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ email: '', password: '', general: '' });
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        router.push('/');
      } else {
        setErrors(prev => ({ 
          ...prev, 
          general: data.error || 'Credenciales incorrectas'
        }));
      }
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        general: 'Error de conexión. Intenta nuevamente.'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-700/50"
      >
        <div className="flex justify-center mb-6">
          <img
            src="/baaam-logo.png"
            alt="Logo Baaam"
            className="w-32 h-32 object-contain"
          />
        </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            Bienvenido
          </h1>
          <p className="text-cyan-100/80">Inicia sesión para continuar</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label className="block text-cyan-300 text-sm mb-2">Correo electrónico</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400" />
              <input
                type="email"
                className={`w-full pl-10 pr-4 py-3 bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white ${
                  errors.email ? 'border border-red-500' : ''
                }`}
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="block text-cyan-300 text-sm mb-2">Contraseña</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400" />
              <input
                type={showPassword ? "text" : "password"}
                className={`w-full pl-10 pr-12 py-3 bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white ${
                  errors.password ? 'border border-red-500' : ''
                }`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>
          {errors.general && (
            <p className="text-red-500 text-sm text-center">{errors.general}</p>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
            <FiArrowRight className="text-lg" />
          </motion.button>
          <p className="text-center text-cyan-100/80 mt-6">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Regístrate
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage;