import React, { createContext, useState, useEffect } from 'react';
import Vapi from '@vapi-ai/web';

export const VapiContext = createContext(null);

export const VapiProvider = ({ children }) => {
  const [vapi, setVapi] = useState(null);

  useEffect(() => {
    try {
      const vapiInstance = new Vapi(import.meta.env.VITE_VAPI_PUBLIC_KEY);
      setVapi(vapiInstance);
    } catch (error) {
      console.error('Error initializing Vapi:', error);
    }
  }, []);

  return (
    <VapiContext.Provider value={{ vapi }}>
      {children}
    </VapiContext.Provider>
  );
};