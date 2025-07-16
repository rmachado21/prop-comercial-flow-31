import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Mail, Lock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
const Login = () => {
  const {
    user,
    login,
    isLoading
  } = useAuth();
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  if (user) {
    return <Navigate to="/" replace />;
  }
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const success = await login(formData.email, formData.password);
    if (success) {
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao PropostasPro"
      });
    } else {
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: "Email ou senha incorretos"
      });
    }
  };
  return <div className="min-h-screen gradient-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-commercial-900">PropostaOnline</h1>
          <p className="mt-2 text-commercial-600">
            Entre na sua conta para gerenciar suas propostas
          </p>
        </div>

        {/* Login Form */}
        <Card className="card-shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-xl font-semibold text-commercial-900">
              Fazer Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-commercial-700">
                  Email
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-commercial-400" />
                  </div>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className={`pl-10 ${errors.email ? 'border-red-500' : ''}`} placeholder="seu@email.com" />
                </div>
                {errors.email && <div className="flex items-center space-x-1 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.email}</span>
                  </div>}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-commercial-700">
                  Senha
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-commercial-400" />
                  </div>
                  <Input id="password" name="password" type="password" value={formData.password} onChange={handleInputChange} className={`pl-10 ${errors.password ? 'border-red-500' : ''}`} placeholder="••••••••" />
                </div>
                {errors.password && <div className="flex items-center space-x-1 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{errors.password}</span>
                  </div>}
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full bg-gradient-primary hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-all duration-200" disabled={isLoading}>
                {isLoading ? <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Entrando...</span>
                  </div> : 'Entrar'}
              </Button>
            </form>

            {/* Register Link */}
            <div className="mt-6 text-center">
              <p className="text-commercial-600">
                Não tem uma conta?{' '}
                <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700 transition-colors">
                  Cadastre-se aqui
                </Link>
              </p>
            </div>

            {/* Demo Info */}
            
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default Login;