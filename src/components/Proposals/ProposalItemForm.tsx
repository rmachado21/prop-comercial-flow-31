
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Package, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ProposalItem } from '@/hooks/useProposals';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const itemSchema = z.object({
  product_name: z.string().min(1, 'Nome do produto é obrigatório'),
  product_description: z.string().optional(),
  quantity: z.number().min(0.01, 'Quantidade deve ser maior que 0'),
  unit_price: z.number().min(0, 'Preço unitário deve ser maior ou igual a 0'),
});

type ItemFormData = z.infer<typeof itemSchema>;

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  sku: string | null;
}

interface ProposalItemFormProps {
  item?: ProposalItem | null;
  onSave: (itemData: any) => void;
  onClose: () => void;
}

const ProposalItemForm: React.FC<ProposalItemFormProps> = ({ item, onSave, onClose }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProducts, setShowProducts] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      product_name: item?.product_name || '',
      product_description: item?.product_description || '',
      quantity: item?.quantity || 1,
      unit_price: item?.unit_price || 0,
    },
  });

  useEffect(() => {
    if (user) {
      fetchProducts();
    }
  }, [user]);

  const fetchProducts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price, sku')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProductSelect = (product: Product) => {
    form.setValue('product_name', product.name);
    form.setValue('product_description', product.description || '');
    form.setValue('unit_price', product.price);
    setSearchTerm('');
    setShowProducts(false);
  };

  const onSubmit = async (data: ItemFormData) => {
    setIsSubmitting(true);
    try {
      const itemData = {
        ...data,
        total_price: data.quantity * data.unit_price,
        id: item?.id || `temp-${Date.now()}`, // Temporary ID for new items
      };

      await onSave(itemData);
      onClose();
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const total = form.watch('quantity') * form.watch('unit_price');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {item ? 'Editar Item' : 'Adicionar Item'}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Product Search */}
            <div>
              <Label>Buscar Produto do Catálogo</Label>
              <div className="relative">
                <Input
                  placeholder="Buscar por nome ou SKU..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowProducts(true);
                  }}
                  onFocus={() => setShowProducts(true)}
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-commercial-400 w-4 h-4" />
              </div>

              {showProducts && searchTerm && (
                <Card className="absolute z-10 w-full mt-1 shadow-lg">
                  <CardContent className="p-3">
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {filteredProducts.length === 0 ? (
                        <p className="text-center text-commercial-600 py-2">
                          Nenhum produto encontrado
                        </p>
                      ) : (
                        filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-commercial-50"
                            onClick={() => handleProductSelect(product)}
                          >
                            <div>
                              <p className="font-medium text-commercial-900">{product.name}</p>
                              {product.sku && (
                                <p className="text-sm text-commercial-600">SKU: {product.sku}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-medium">
                                R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Manual Product Entry */}
            <div className="border-t pt-4">
              <div>
                <Label htmlFor="product_name">Nome do Produto *</Label>
                <Input
                  id="product_name"
                  {...form.register('product_name')}
                  placeholder="Digite o nome do produto"
                />
                {form.formState.errors.product_name && (
                  <p className="text-sm text-red-600 mt-1">
                    {form.formState.errors.product_name.message}
                  </p>
                )}
              </div>

              <div className="mt-4">
                <Label htmlFor="product_description">Descrição</Label>
                <Textarea
                  id="product_description"
                  {...form.register('product_description')}
                  placeholder="Descrição detalhada do produto/serviço"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Label htmlFor="quantity">Quantidade *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    {...form.register('quantity', { valueAsNumber: true })}
                    placeholder="1"
                  />
                  {form.formState.errors.quantity && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.quantity.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="unit_price">Preço Unitário *</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    {...form.register('unit_price', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {form.formState.errors.unit_price && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.unit_price.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Total */}
              <div className="mt-4 p-4 bg-commercial-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-commercial-900">Total do Item:</span>
                  <span className="text-xl font-bold text-commercial-900">
                    R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Package className="w-4 h-4 mr-2" />
                {item ? 'Atualizar' : 'Adicionar'} Item
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalItemForm;
