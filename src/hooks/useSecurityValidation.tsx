import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { useToast } from '@/components/ui/use-toast';

export const useSecurityValidation = () => {
  const { user } = useAuth();
  const { isSuperAdmin } = useRole();
  const { toast } = useToast();

  const validateUserAccess = (resourceUserId: string) => {
    if (!user) {
      toast({
        title: "Erro de Segurança",
        description: "Você não está autenticado",
        variant: "destructive",
      });
      return false;
    }

    // Super admins podem acessar qualquer recurso
    if (isSuperAdmin) {
      return true;
    }

    // Usuários normais só podem acessar seus próprios recursos
    if (user.id !== resourceUserId) {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão para acessar este recurso",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const validateAdminAccess = () => {
    if (!user) {
      toast({
        title: "Erro de Segurança",
        description: "Você não está autenticado",
        variant: "destructive",
      });
      return false;
    }

    if (!isSuperAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Você não tem permissão de administrador",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const getCurrentUserId = () => {
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    return user.id;
  };

  const isOwnResource = (resourceUserId: string) => {
    return user?.id === resourceUserId;
  };

  const canAccessResource = (resourceUserId: string) => {
    return isSuperAdmin || isOwnResource(resourceUserId);
  };

  return {
    validateUserAccess,
    validateAdminAccess,
    getCurrentUserId,
    isOwnResource,
    canAccessResource,
    isSuperAdmin,
    isAuthenticated: !!user,
  };
};