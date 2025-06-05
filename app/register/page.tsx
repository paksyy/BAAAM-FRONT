'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser,
  FiLock,
  FiMail,
  FiArrowRight,
  FiX,
  FiEye,
  FiEyeOff,
  FiCheck
} from 'react-icons/fi';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const SignupPage = () => {
  const router = useRouter();
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  /* ------------------------------ Estados ------------------------------ */
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

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  /* --------------------------- Validaciones --------------------------- */
  const validateName = (value: string) => {
    if (!value.trim()) {
      setErrors((p) => ({ ...p, name: 'El nombre es requerido' }));
      return false;
    }
    setErrors((p) => ({ ...p, name: '' }));
    return true;
  };

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value) {
      setErrors((p) => ({ ...p, email: 'El correo es requerido' }));
      return false;
    }
    if (!emailRegex.test(value)) {
      setErrors((p) => ({ ...p, email: 'Ingresa un correo válido' }));
      return false;
    }
    setErrors((p) => ({ ...p, email: '' }));
    return true;
  };

  const validatePassword = (value: string) => {
    if (!value) {
      setErrors((p) => ({ ...p, password: 'La contraseña es requerida' }));
      return false;
    }
    if (value.length < 8) {
      setErrors((p) => ({
        ...p,
        password: 'La contraseña debe tener al menos 8 caracteres'
      }));
      return false;
    }
    setErrors((p) => ({ ...p, password: '' }));
    return true;
  };

  const validateConfirmPassword = (pass: string, conf: string) => {
    if (pass !== conf) {
      setErrors((p) => ({ ...p, confirm: 'Las contraseñas no coinciden' }));
      return false;
    }
    setErrors((p) => ({ ...p, confirm: '' }));
    return true;
  };

  /* ------------------------- Envío de formulario ------------------------ */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({ name: '', email: '', password: '', confirm: '', general: '' });

    const isNameValid = validateName(name);
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmValid = validateConfirmPassword(password, confirm);

    if (
      !isNameValid ||
      !isEmailValid ||
      !isPasswordValid ||
      !isConfirmValid ||
      !acceptedTerms
    ) {
      if (!acceptedTerms) {
        setErrors((p) => ({
          ...p,
          general: 'Debes aceptar los términos y condiciones'
        }));
      }
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          password,
          accepted_terms: acceptedTerms
        })
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/login');
      } else {
        setErrors((p) => ({ ...p, general: data.error || 'Error en el registro' }));
      }
    } catch {
      setErrors((p) => ({
        ...p,
        general: 'Error de conexión. Intenta nuevamente.'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  /* ============================ RENDER ============================ */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      {/* ---------- Modal Términos y Condiciones ---------- */}
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
              className="bg-slate-800 rounded-xl p-6 max-w-4xl max-h-[90vh] overflow-y-auto relative border border-slate-700/50 shadow-2xl text-white"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 text-cyan-400 hover:text-cyan-300 transition-colors p-2"
              >
                <FiX size={24} />
              </button>

              {/* ---------- Encabezado ---------- */}
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                  Términos y Condiciones
                </h2>
                <p className="text-cyan-100/80 mt-2">
                  Última actualización: 21&nbsp;de&nbsp;marzo&nbsp;de&nbsp;2025, 7&nbsp;de&nbsp;mayo&nbsp;de&nbsp;2025
                </p>
              </div>

              {/* ---------- Contenido EXACTO ---------- */}
              <div className="prose prose-invert max-w-none text-white space-y-8">
                <h3 className="text-xl font-semibold text-cyan-400">
                  Lineamientos de uso para usuarios de BAA’AM
                </h3>

                <p>
                  El presente documento describe los términos y condiciones
                  generales (en adelante “TÉRMINOS Y CONDICIONES”) aplicables al
                  uso de los contenidos y servicios ofrecidos a través de la
                  plataforma digital de BAA’AM, del cual son titulares Ivone
                  Giﬀard&nbsp;Mena, asociados, y la Universidad Autónoma de Baja
                  California (UABC). Cualquier persona física que desee acceder o
                  hacer uso de los servicios de la plataforma digital de BAA’AM
                  podrá hacerlo sujetándose a los presentes TÉRMINOS Y
                  CONDICIONES. En caso de no aceptar estos TÉRMINOS Y
                  CONDICIONES, deberá abstenerse de utilizar el servicio.
                </p>

                <p>
                  Bienvenido/a a Base de Datos Amplia para la Pesca y
                  Acuacultura en México (BAA’AM). Antes de los utilizar los
                  servicios de usuario, te pedimos que leas detenidamente los
                  siguientes términos y condiciones. Al acceder y utilizar
                  nuestra plataforma, aceptas cumplir con estos términos.
                </p>

                {/* ---------- 1. Definiciones ---------- */}
                <h4 className="text-lg font-semibold text-cyan-300">1. Definiciones</h4>
                <ul className="space-y-2">
                  <li>
                    <strong>Usuario:</strong> Toda persona que acceda o utilice
                    cualquier servicio dentro y relacionado con la plataforma de
                    BAA’AM.
                  </li>
                  <li>
                    <strong>Usuario Lector:</strong> Toda persona que tenga
                    acceso únicamente a la página web de BAA’AM
                  </li>
                  <li>
                    <strong>Usuario Plus:</strong> Al realizar su registro,
                    accede a la página web y a la plataforma digital de BAA’AM
                    que incluye secciones exclusivas como directorio, foro, bolsa
                    de empleo, donaciones, promoción de conferencias y gráficas
                    y estadísticas, personalizar su perfil y recibir
                    notificaciones. Además, tendrá la opción de realizar
                    donaciones para obtener beneficios adicionales, como promover
                    un producto mensual, dos webinars o dos cursos.
                  </li>
                  <li>
                    <strong>Usuario Patrocinador:</strong> Un Usuario
                    patrocinador puede alcanzar este nivel al realizar
                    aportaciones mensuales de un monto de $1,000&nbsp;MXN (mil
                    pesos mexicanos). El usuario patrocinador podrá promover su
                    empresa y productos, publicar anuncios en la bolsa de
                    trabajo, promover cursos y webinars ilimitados y contribuir
                    económicamente al mantenimiento de la plataforma, acceso a
                    reportes e informes completos.
                  </li>
                  <li>
                    <strong>Plataforma:</strong> Sitio web, aplicación u otro
                    medio digital donde se ofrecen nuestros servicios.
                  </li>
                  <li>
                    <strong>Servicios:</strong> Funcionalidades, productos o
                    información proporcionados por BAA’AM.
                  </li>
                </ul>

                {/* ---------- 2. Uso de los Servicios ---------- */}
                <h4 className="text-lg font-semibold text-cyan-300">2. Uso de los Servicios</h4>
                <ul className="space-y-2">
                  <li>
                    El usuario se compromete a hacer un uso adecuado de la
                    plataforma y a no emplearla para actividades ilegales o que
                    infrinjan derechos de terceros.
                  </li>
                  <li>
                    La plataforma digital de BAA’AM llevará a cabo las acciones
                    de acuerdo con sus facultades que le permitan mantener el
                    buen funcionamiento de dicha plataforma tecnológica.
                  </li>
                  <li>
                    BAA’AM no será responsable de los daños que pudiesen
                    ocasionarse por un uso inadecuado de la plataforma digital
                    de BAA’AM.
                  </li>
                  <li>
                    Está prohibido el uso de bots, scripts o cualquier tecnología
                    para automatizar interacciones en la plataforma sin
                    autorización.
                  </li>
                  <li>
                    No se permite publicar productos en foros y demás secciones
                    interactivas no designadas fuera del apartado “Productos”.
                  </li>
                  <li>
                    No se permite la publicación de cualquier contenido
                    inapropiado o perjuicioso en el foro.
                  </li>
                  <li>
                    Los usuarios patrocinadores deben garantizar que la
                    información de sus anuncios y productos sea verídica y cumpla
                    con las normativas del sector.
                  </li>
                  <li>
                    No se permite el uso de lenguaje ofensivo, discriminatorio o
                    difamatorio en “Foro” y demás secciones interactivas.
                  </li>
                </ul>

                {/* ---------- 3. Registro ---------- */}
                <h4 className="text-lg font-semibold text-cyan-300">3. Registro y Cuenta de Usuario</h4>
                <ul className="space-y-2">
                  <li>
                    Para acceder a ciertos servicios, puede ser necesario crear
                    una cuenta con información veraz y actualizada.
                  </li>
                  <li>
                    El usuario debe proporcionar información veraz y mantener
                    actualizado su perfil.
                  </li>
                  <li>
                    Al registrarse en nuestra plataforma, el usuario acepta
                    cumplir con los siguientes lineamientos y normas de uso. El
                    acceso y uso de la base de datos está sujeto a estos términos,
                    así como a las políticas de privacidad y normas de conducta
                    establecidas.
                  </li>
                  <li>
                    El usuario es responsable de la confidencialidad de sus
                    credenciales y de todas las actividades realizadas en su
                    cuenta.
                  </li>
                </ul>

                {/* ---------- 4. Privacidad ---------- */}
                <h4 className="text-lg font-semibold text-cyan-300">4. Privacidad y seguridad</h4>
                <ul className="space-y-2">
                  <li>
                    La información personal de los usuarios será protegida
                    conforme a nuestra Política de Privacidad.
                  </li>
                  <li>
                    Los usuarios son responsables de la seguridad de sus cuentas
                    y del uso que hagan de ellas.
                  </li>
                  <li>
                    De conformidad con la Ley General de Transparencia, la Ley
                    Federal de Transparencia y otras disposiciones fiscales y
                    legales, BAA’AM se compromete a adoptar las medidas necesarias
                    para asegurar la privacidad de los datos personales recabados
                    de forma que se garantice su seguridad, se evite su
                    alteración, pérdida o tratamiento no autorizado.
                  </li>
                  <li>
                    En todo momento se procurará que los datos personales
                    recabados y que se utilicen para actualizar las bases de
                    datos, expedientes o archivos sean correctos y útiles para los
                    fines para los cuales fueron recabados.
                  </li>
                </ul>

                {/* ---------- 5. Propiedad ---------- */}
                <h4 className="text-lg font-semibold text-cyan-300">5. Propiedad Intelectual</h4>
                <ul className="space-y-2">
                  <li>
                    Todos los derechos sobre el contenido, logotipos, marcas y
                    demás elementos distintivos utilizados en esta plataforma
                    pertenecen a BAA’AM, a la Universidad Autónoma de Baja
                    California (UABC) o a sus respectivos titulares, según
                    corresponda.
                  </li>
                  <li>
                    No se permite copiar, modificar, reproducir, distribuir,
                    transmitir, exhibir, vender o explotar de ningún modo el
                    contenido, ya sea parcial o total, sin la autorización expresa
                    y por escrito de BAA’AM.
                  </li>
                  <li>
                    Cualquier uso no autorizado constituirá una infracción a la
                    legislación aplicable en materia de propiedad intelectual y
                    será objeto de las acciones legales correspondientes.
                  </li>
                </ul>

                {/* ---------- 6. Limitación ---------- */}
                <h4 className="text-lg font-semibold text-cyan-300">6. Limitación de Responsabilidad</h4>
                <ul className="space-y-2">
                  <li>
                    BAA’AM no se hace responsable por daños o pérdidas derivadas
                    del uso de la plataforma, salvo en casos de dolo o negligencia
                    grave.
                  </li>
                  <li>No garantizamos la disponibilidad ininterrumpida del servicio.</li>
                  <li>
                    BAA’AM se exime de toda responsabilidad derivada de cualquier
                    transacción, acuerdo o relación comercial que se lleve a cabo
                    entre vendedores, patrocinadores y usuarios a través de la
                    plataforma.
                  </li>
                </ul>

                {/* ---------- 7. Modificaciones ---------- */}
                <h4 className="text-lg font-semibold text-cyan-300">7. Modificaciones y suspensión de cuentas</h4>
                <ul className="space-y-2">
                  <li>
                    Nos reservamos el derecho de actualizar estos términos en
                    cualquier momento. Se notificará a los usuarios sobre cambios
                    relevantes.
                  </li>
                  <li>
                    La plataforma se reserva el derecho de modificar estos
                    términos en cualquier momento y suspender o eliminar el
                    acceso a usuarios que incumplan con las normas establecidas.
                  </li>
                </ul>

                {/* ---------- 8. Legislación ---------- */}
                <h4 className="text-lg font-semibold text-cyan-300">8. Legislación Aplicable</h4>
                <p>
                  Estos términos se rigen por la Ley de Transparencia y Acceso a
                  la Información Pública para el Estado de Baja California.
                  Cualquier controversia será resuelta en los tribunales de Baja
                  California. BAA’AM se reserva la facultad de presentar las
                  acciones civiles o penales que considere necesarias por la
                  utilización indebida de la plataforma digital de BAA’AM o por el
                  incumplimiento de los presentes TÉRMINOS Y CONDICIONES.
                </p>

                {/* ---------- 9. Contacto ---------- */}
                <h4 className="text-lg font-semibold text-cyan-300">9. Contacto</h4>
                <p>
                  En caso de que haya dudas, comentarios o necesidad de soporte
                  técnico, los usuarios pueden ponerse en contacto con el equipo
                  de administración al correo&nbsp;
                  <a
                    href="mailto:baaam@uabc.edu.mx"
                    className="text-cyan-400 hover:underline"
                  >
                    baaam@uabc.edu.mx
                  </a>
                  . De igual manera, se le informa que usted podrá consultar el
                  Aviso de Privacidad Académico Integral en el portal de la
                  Universidad Autónoma de Baja California (UABC)&nbsp;
                  <a
                    href="https://www.uabc.mx/"
                    target="_blank"
                    className="text-cyan-400 hover:underline"
                  >
                    https://www.uabc.mx/
                  </a>
                  .
                </p>

                <div className="bg-slate-700/30 rounded-lg p-6 mt-8">
                  <p className="text-center text-lg font-medium">
                    Al hacer clic en &quot;Aceptar&quot;, confirmo que he leído y comprendo
                    estos términos y condiciones y acepto cumplirlos.
                  </p>
                </div>
              </div>

              {/* ---------- Botón aceptar ---------- */}
              <div className="flex justify-center mt-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setAcceptedTerms(true);
                    setIsModalOpen(false);
                  }}
                  className="bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
                >
                  <FiCheck size={20} />
                  Aceptar Términos
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------- Formulario de registro ---------- */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="w-full max-w-md bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-slate-700/50"
      >
        {/* ------------- Logo y encabezado ------------- */}
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

        {/* ------------------ Campos ------------------ */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Nombre */}
          <div>
            <label className="block text-cyan-300 text-sm mb-2">Nombre completo</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
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
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-cyan-300 text-sm mb-2">Correo electrónico</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
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
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-cyan-300 text-sm mb-2">Contraseña</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
              <input
                type={showPassword ? 'text' : 'password'}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400"
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirmar */}
          <div>
            <label className="block text-cyan-300 text-sm mb-2">
              Confirmar Contraseña
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
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
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400"
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {errors.confirm && (
              <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>
            )}
          </div>

          {/* Checkbox términos */}
          <div className="flex items-start space-x-3">
            <input
              id="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="h-5 w-5 text-cyan-400 focus:ring-cyan-400 bg-slate-800 border-slate-700 rounded mt-1"
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

          {/* Botón enviar */}
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
            <Link
              href="/login"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Inicia sesión
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default SignupPage;
