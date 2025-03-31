'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import baaamLogo from '../../public/baaam-logo.png';

const Navbar = () => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (showProfileMenu) setShowProfileMenu(false);
  };

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleLogout = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:4000/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok) {
        router.push('/login');
      } else {
        console.error('Error al cerrar sesión');
      }
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  return (
    <nav className="bg-white sticky top-0 z-40 border-b border-gray-200 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left side: Logo and navigation links */}
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="relative h-12 w-12 mr-3">
                <Image 
                  src={baaamLogo} 
                  alt="BAA'AM Logo"
                  width={48}
                  height={48}
                  className="object-contain"
                />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600">
                BAA&apos;AM
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center ml-10">
              <div className="flex items-center space-x-8">
                <Link 
                  href="/directorio" 
                  className="text-gray-800 hover:text-cyan-600 px-4 py-2 rounded-md text-base font-medium transition-colors"
                >
                  Directorio
                </Link>
                <Link 
                  href="/estadisticas" 
                  className="text-gray-800 hover:text-cyan-600 px-4 py-2 rounded-md text-base font-medium transition-colors"
                >
                  Estadísticas
                </Link>
                <Link 
                  href="/foro" 
                  className="text-gray-800 hover:text-cyan-600 px-4 py-2 rounded-md text-base font-medium transition-colors"
                >
                  Foro
                </Link>
              </div>
            </div>
          </div>
          
          {/* Right side: User profile icon */}
          <div className="flex items-center">
            <div className="hidden md:block relative">
              <button
                onClick={toggleProfileMenu}
                className="p-2 bg-cyan-100 hover:bg-cyan-200 rounded-full text-cyan-600 transition-colors"
                aria-expanded={showProfileMenu}
                aria-haspopup="true"
              >
                <FiUser size={24} />
              </button>
              
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-lg border border-gray-200 py-1 z-50"
                  >
                    {/* Al hacer clic en "Perfil" se redirige a "/" */}
                    <Link
                      href="/"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <FiUser className="mr-2" size={16} />
                      Perfil
                    </Link>
                    <Link
                      href="/configuracion"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <FiSettings className="mr-2" size={16} />
                      Configuración
                    </Link>
                    <div className="border-t border-gray-200 my-1"></div>
                    <a
                      href="/logout"
                      onClick={handleLogout}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                    >
                      <FiLogOut className="mr-2" size={16} />
                      Cerrar sesión
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMenu}
                className="p-2 bg-cyan-100 hover:bg-cyan-200 rounded-lg text-cyan-600 transition-colors"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-200"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                href="/directorio"
                className="block px-3 py-3 rounded-lg text-gray-800 hover:bg-gray-100 hover:text-cyan-600 transition-colors text-base"
                onClick={toggleMenu}
              >
                Directorio
              </Link>
              <Link
                href="/estadisticas"
                className="block px-3 py-3 rounded-lg text-gray-800 hover:bg-gray-100 hover:text-cyan-600 transition-colors text-base"
                onClick={toggleMenu}
              >
                Estadísticas
              </Link>
              <Link
                href="/foro"
                className="block px-3 py-3 rounded-lg text-gray-800 hover:bg-gray-100 hover:text-cyan-600 transition-colors text-base"
                onClick={toggleMenu}
              >
                Foro
              </Link>
              <div className="border-t border-gray-200 my-2"></div>
              <Link
                href="/"
                className="flex items-center px-3 py-3 rounded-lg text-gray-800 hover:bg-gray-100 hover:text-cyan-600 transition-colors text-base"
                onClick={toggleMenu}
              >
                <FiUser className="mr-2" size={18} />
                Perfil
              </Link>
              <Link
                href="/configuracion"
                className="flex items-center px-3 py-3 rounded-lg text-gray-800 hover:bg-gray-100 hover:text-cyan-600 transition-colors text-base"
                onClick={toggleMenu}
              >
                <FiSettings className="mr-2" size={18} />
                Configuración
              </Link>
              <a
                href="/logout"
                onClick={handleLogout}
                className="flex items-center px-3 py-3 rounded-lg text-red-600 hover:bg-gray-100 transition-colors text-base"
              >
                <FiLogOut className="mr-2" size={18} />
                Cerrar sesión
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
