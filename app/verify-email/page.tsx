'use client';
import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiRefreshCw, FiCheckCircle, FiArrowRight, FiMail } from 'react-icons/fi';

export default function VerifyEmail() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get('email') ?? '';
  
  const [code, setCode] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false); // Nuevo estado para éxito

  const submit = async () => {
    setLoading(true);
    setMsg('');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setIsVerified(true); // Mostrar pantalla de éxito
      } else {
        setMsg(data.error || 'Código inválido o expirado');
      }
    } catch (error) {
      setMsg('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setLoading(true);
    setMsg('');
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMsg('✅ Código reenviado a tu correo');
      } else {
        setMsg(data.error || 'Error al reenviar código');
      }
    } catch (error) {
      setMsg('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    router.push('/login');
  };

  const fade = { 
    hidden: { opacity: 0, y: 20 }, 
    visible: { opacity: 1, y: 0 } 
  };

  const success = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {!isVerified ? (
          // Pantalla de verificación
          <motion.div
            key="verify"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={fade}
            className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-700/50"
          >
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img
                src="/baaam-logo.png"
                alt="Logo Baaam"
                className="w-24 h-24 object-contain"
              />
            </div>

            {/* Encabezado */}
            <div className="text-center mb-8">
              <div className="mb-4">
                <FiMail className="mx-auto text-cyan-400 text-4xl mb-3" />
              </div>
              <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                Verifica tu correo
              </h1>
              <p className="text-cyan-100/80">
                Ingresa el código de 6 dígitos enviado a
              </p>
              <p className="text-cyan-300 font-semibold mt-1">{email}</p>
            </div>

            {/* Formulario */}
            <div className="space-y-6">
              <div>
                <input
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))} // Solo números
                  placeholder="123456"
                  className="w-full text-center tracking-widest text-2xl py-4 bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white border border-slate-700 focus:border-cyan-400 transition-colors"
                />
              </div>

              {msg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-center p-3 rounded-lg ${
                    msg.includes('✅') 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}
                >
                  {msg}
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading || code.length !== 6}
                onClick={submit}
                className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                    Verificando...
                  </>
                ) : (
                  <>
                    <FiCheckCircle />
                    Confirmar código
                  </>
                )}
              </motion.button>

              <div className="text-center">
                <p className="text-cyan-100/60 text-sm mb-3">
                  ¿No recibiste el código?
                </p>
                <button
                  onClick={resend}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 text-cyan-400 hover:text-cyan-300 disabled:opacity-50 mx-auto transition-colors"
                >
                  <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                  Reenviar código
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          // Pantalla de éxito
          <motion.div
            key="success"
            initial="hidden"
            animate="visible"
            variants={success}
            className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-700/50"
          >
            {/* Icono de éxito */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
                className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6"
              >
                <FiCheckCircle className="text-green-400 text-4xl" />
              </motion.div>
              
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-cyan-400"
              >
                ¡Verificación exitosa!
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-3"
              >
                <p className="text-cyan-100/80 text-lg">
                  Tu cuenta ha sido verificada correctamente
                </p>
                <p className="text-cyan-300/70">
                  Ahora puedes iniciar sesión y acceder a todas las funcionalidades de BAA'AM
                </p>
              </motion.div>
            </div>

            {/* Botón para ir al login */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToLogin}
              className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 py-4 rounded-lg font-semibold flex items-center justify-center gap-3 text-lg"
            >
              Ir a Iniciar Sesión
              <FiArrowRight className="text-xl" />
            </motion.button>

            {/* Mensaje adicional */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center text-cyan-100/60 text-sm mt-6"
            >
              ¡Bienvenido a la comunidad BAA'AM! 🎉
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}