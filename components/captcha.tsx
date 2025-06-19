'use client';
import { useEffect, useRef, useState } from 'react';

interface CaptchaProps {
  onChange: (token: string | null) => void;
}

const Captcha: React.FC<CaptchaProps> = ({ onChange }) => {
  const captchaRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [widgetId, setWidgetId] = useState<number | null>(null);

  useEffect(() => {
    // Verificar si el script ya está cargado
    if (window.grecaptcha && window.grecaptcha.ready) {
      window.grecaptcha.ready(() => {
        renderCaptcha();
      });
      return;
    }

    // Cargar el script de reCAPTCHA si no está presente
    const existingScript = document.querySelector('script[src*="recaptcha"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (window.grecaptcha && window.grecaptcha.ready) {
          window.grecaptcha.ready(() => {
            renderCaptcha();
          });
        }
      };
      
      script.onerror = () => {
        console.error('Error loading reCAPTCHA script');
        setIsLoaded(true); // Ocultar mensaje de carga incluso si falla
      };
      
      document.head.appendChild(script);
    } else {
      // Si el script ya existe, intentar renderizar directamente
      setTimeout(() => {
        if (window.grecaptcha && window.grecaptcha.ready) {
          window.grecaptcha.ready(() => {
            renderCaptcha();
          });
        } else {
          setIsLoaded(true); // Ocultar mensaje si no se puede cargar
        }
      }, 100);
    }

    return () => {
      // Limpiar el widget al desmontar
      if (widgetId !== null && window.grecaptcha && window.grecaptcha.reset) {
        try {
          window.grecaptcha.reset(widgetId);
        } catch (error) {
          console.log('Error resetting captcha:', error);
        }
      }
    };
  }, []);

  const renderCaptcha = () => {
    if (!captchaRef.current) return;
    
    // Verificar si ya hay un widget renderizado
    if (captchaRef.current.innerHTML.trim() !== '') {
      setIsLoaded(true); // Marcar como cargado si ya existe contenido
      return;
    }

    if (window.grecaptcha && window.grecaptcha.render) {
      try {
        const id = window.grecaptcha.render(captchaRef.current, {
          sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
          theme: 'dark',
          callback: (token: string) => {
            onChange(token);
          },
          'expired-callback': () => {
            onChange(null);
          },
          'error-callback': () => {
            onChange(null);
          }
        });
        setWidgetId(id);
        setIsLoaded(true); // Marcar como cargado cuando se renderiza exitosamente
      } catch (error) {
        console.error('Error rendering reCAPTCHA:', error);
        setIsLoaded(true); // Ocultar el mensaje incluso si hay error
      }
    }
  };

  return (
    <div className="flex justify-center">
      <div ref={captchaRef}></div>
      {!isLoaded && (
        <div className="text-cyan-300 text-sm">
          Cargando CAPTCHA...
        </div>
      )}
    </div>
  );
};

// Extender el objeto Window para incluir grecaptcha
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      render: (container: HTMLElement, parameters: any) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
    };
  }
}

export default Captcha;