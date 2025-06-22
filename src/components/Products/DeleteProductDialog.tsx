
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  sku: string | null;
  price: number;
  cost_price: number | null;
  stock_quantity: number | null;
  min_stock_level: number | null;
  unit: string | null;
  status: string | null;
}

interface DeleteProductDialogProps {
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteProductDialog: React.FC<DeleteProductDialogProps> = ({ 
  product, 
  onConfirm, 
  onCancel 
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso!",
      });

      onConfirm();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o produto.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Confirmar Exclusão
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-commercial-700">
              Tem certeza que deseja excluir o produto:
            </p>
            <div className="p-3 bg-commercial-50 rounded-lg">
              <p className="font-semibold text-commercial-900">{product.name}</p>
              {product.sku && (
                <p className="text-sm text-commercial-600">SKU: {product.sku}</p>
              )}
              <p className="text-sm text-commercial-600">
                Preço: R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-700">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita. O produto será permanentemente removido do sistema.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                'Excluir Produto'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteProductDialog;
