
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const WelcomeHeader: React.FC = () => {
  const { user } = useAuth();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const today = new Date();
  const dateString = today.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-commercial-900">
        {getGreeting()}, {user?.name}! 👋
      </h1>
      <p className="text-commercial-600 mt-2">
        {dateString.charAt(0).toUpperCase() + dateString.slice(1)}
      </p>
      <p className="text-commercial-500 text-sm mt-1">
        Aqui está um resumo das suas atividades e performance.
      </p>
    </div>
  );
};

export default WelcomeHeader;
