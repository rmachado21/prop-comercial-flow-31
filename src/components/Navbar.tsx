
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/button';
import { 
  FileText,
  Users, 
  Package, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  Settings,
  Shield
} from 'lucide-react';
import { useState } from 'react';
import logo from '@/assets/proposta-online-logo.png';

const Navbar = () => {
  const { logout } = useAuth();
  const { profile } = useUserProfile();
  const { isSuperAdmin } = useRole();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { href: '/', label: 'Dashboard', icon: BarChart3 },
    { href: '/propostas', label: 'Propostas', icon: FileText },
    { href: '/clientes', label: 'Clientes', icon: Users },
    { href: '/produtos', label: 'Produtos', icon: Package },
    ...(isSuperAdmin ? [{ href: '/admin', label: 'Admin', icon: Shield }] : []),
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-commercial-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo e navegação principal */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src={logo} 
                alt="Proposta Online" 
                className="h-8 w-auto"
              />
            </Link>

            {/* Navegação desktop */}
            <div className="hidden md:flex items-center space-x-8 ml-10">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-commercial-600 hover:text-commercial-900 hover:bg-commercial-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Menu do usuário */}
          <div className="flex items-center space-x-4">
            {/* Info do usuário desktop */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-commercial-900">{profile?.name || 'Usuário'}</p>
                <p className="text-xs text-commercial-500">{profile?.company || 'Sem empresa'}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Link to="/configuracoes">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2"
                    title="Configurações"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </Button>
              </div>
            </div>

            {/* Botão menu mobile */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-commercial-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-commercial-600 hover:text-commercial-900 hover:bg-commercial-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {/* Info do usuário mobile */}
            <div className="border-t border-commercial-200 pt-4 mt-4">
              <div className="px-3 py-2">
                <p className="text-base font-medium text-commercial-900">{profile?.name || 'Usuário'}</p>
                <p className="text-sm text-commercial-500">{profile?.company || 'Sem empresa'}</p>
              </div>
              <div className="space-y-2 mx-3 mt-2">
                <Link to="/configuracoes">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center space-x-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Configurações</span>
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
