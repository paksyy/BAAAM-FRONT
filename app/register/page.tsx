'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiLock, FiMail, FiArrowRight, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SignupPage = () => {
  const router = useRouter();
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Estados para formulario
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    general: ''
  });

  // Validaciones
  const validateName = (name: string) => {
    if (!name.trim()) {
      setErrors(prev => ({ ...prev, name: 'El nombre es requerido' }));
      return false;
    }
    setErrors(prev => ({ ...prev, name: '' }));
    return true;
  };

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

  const validatePassword = (password: string) => {
    if (!password) {
      setErrors(prev => ({ ...prev, password: 'La contraseña es requerida' }));
      return false;
    }
    if (password.length < 8) {
      setErrors(prev => ({ ...prev, password: 'La contraseña debe tener al menos 8 caracteres' }));
      return false;
    }
    setErrors(prev => ({ ...prev, password: '' }));
    return true;
  };

  const validateConfirmPassword = (password: string, confirm: string) => {
    if (password !== confirm) {
      setErrors(prev => ({ ...prev, confirm: 'Las contraseñas no coinciden' }));
      return false;
    }
    setErrors(prev => ({ ...prev, confirm: '' }));
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ name: '', email: '', password: '', confirm: '', general: '' });

    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmValid = validateConfirmPassword(password, confirm);

    if (!isNameValid || !isEmailValid || !isPasswordValid || !isConfirmValid || !acceptedTerms) {
      if (!acceptedTerms) {
        setErrors(prev => ({ ...prev, general: 'Debes aceptar los términos y condiciones' }));
      }
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          password,
          accepted_terms: acceptedTerms,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/login');
      } else {
        setErrors(prev => ({ ...prev, general: data.error || 'Error en el registro' }));
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, general: 'Error de conexión. Intenta nuevamente.' }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto relative"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
              <h2 className="text-2xl font-bold mb-4 text-gray-800">Términos y Condiciones</h2>
              <div className="prose prose-sm text-gray-600">
                <p>Lineamientos de uso para usuarios de BAA'AM</p>
                <p>Última actualización: 21 de Marzo, 2025</p>
                {/* Aquí va el contenido de los términos y condiciones */}
                <p>Bienvenido/a a BAA'AM. Antes de los utilizar los servicios de usuario, te pedimos que leas detenidamente los siguientes términos y condiciones...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
            Crear Cuenta
          </h1>
          <p className="text-cyan-100/80">Comienza a explorar el directorio</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Nombre */}
          <div>
            <label className="block text-cyan-300 text-sm mb-2">Nombre completo</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  validateName(e.target.value);
                }}
                className={`w-full pl-10 pr-4 py-3 bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white ${
                  errors.name ? 'border border-red-500' : ''
                }`}
                placeholder="Tu nombre"
              />
            </div>
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-cyan-300 text-sm mb-2">Correo electrónico</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
                className={`w-full pl-10 pr-4 py-3 bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white ${
                  errors.email ? 'border border-red-500' : ''
                }`}
                placeholder="tu@email.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-cyan-300 text-sm mb-2">Contraseña</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
                className={`w-full pl-10 pr-12 py-3 bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white ${
                  errors.password ? 'border border-red-500' : ''
                }`}
                placeholder="••••••••"
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

          {/* Confirmar Contraseña */}
          <div>
            <label className="block text-cyan-300 text-sm mb-2">Confirmar Contraseña</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  validateConfirmPassword(password, e.target.value);
                }}
                className={`w-full pl-10 pr-12 py-3 bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white ${
                  errors.confirm ? 'border border-red-500' : ''
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cyan-400"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.confirm && (
              <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>
            )}
          </div>

          {/* Checkbox Términos y Condiciones */}
          <div className="flex items-center space-x-2">
            <input
              id="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="h-5 w-5 text-cyan-400 focus:ring-cyan-400 bg-slate-800 border-slate-700"
            />
            <label htmlFor="terms" className="text-cyan-300 text-sm">
              Acepto los{' '}
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="text-cyan-400 hover:text-cyan-300 underline"
              >
                Términos y Condiciones
              </button>
            </label>
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
            {isLoading ? 'Registrando...' : 'Registrarse'}
            <FiArrowRight className="text-lg" />
          </motion.button>

          <p className="text-center text-cyan-100/80 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Inicia sesión
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default SignupPage;