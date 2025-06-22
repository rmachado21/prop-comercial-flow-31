
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Trash2, 
  Package, 
  AlertTriangle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

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

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  viewMode, 
  onEdit, 
  onDelete 
}) => {
  const isLowStock = product.stock_quantity !== null && 
                    product.min_stock_level !== null && 
                    product.stock_quantity <= product.min_stock_level;

  const marginPercentage = product.cost_price && product.cost_price > 0 
    ? ((product.price - product.cost_price) / product.cost_price) * 100 
    : null;

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case 'inactive':
        return <Badge className="bg-yellow-100 text-yellow-800">Inativo</Badge>;
      case 'discontinued':
        return <Badge className="bg-red-100 text-red-800">Descontinuado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">N/A</Badge>;
    }
  };

  if (viewMode === 'list') {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
              {/* Product Info */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-commercial-900">{product.name}</h3>
                    {product.sku && (
                      <p className="text-sm text-commercial-500">SKU: {product.sku}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <p className="text-sm text-commercial-600">Categoria</p>
                <p className="font-medium">{product.category || 'Sem categoria'}</p>
              </div>

              {/* Price */}
              <div>
                <p className="text-sm text-commercial-600">Preço</p>
                <p className="font-bold text-lg text-commercial-900">
                  R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Stock */}
              <div>
                <p className="text-sm text-commercial-600">Estoque</p>
                <div className="flex items-center gap-1">
                  <span className="font-medium">
                    {product.stock_quantity ?? 'N/A'} {product.unit}
                  </span>
                  {isLowStock && (
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
              </div>

              {/* Status */}
              <div>
                {getStatusBadge(product.status)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(product)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(product)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-commercial-900 line-clamp-1">{product.name}</h3>
              {product.sku && (
                <p className="text-sm text-commercial-500">SKU: {product.sku}</p>
              )}
            </div>
          </div>
          {getStatusBadge(product.status)}
        </div>

        {product.description && (
          <p className="text-sm text-commercial-600 mb-4 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="space-y-3 mb-4">
          {product.category && (
            <div className="flex justify-between text-sm">
              <span className="text-commercial-500">Categoria:</span>
              <span className="font-medium">{product.category}</span>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-commercial-500">Preço:</span>
            <span className="font-bold text-lg text-commercial-900">
              R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {product.cost_price && (
            <div className="flex justify-between text-sm">
              <span className="text-commercial-500">Custo:</span>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  R$ {product.cost_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
                {marginPercentage !== null && (
                  <div className="flex items-center gap-1">
                    {marginPercentage > 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                    <span className={`text-xs ${marginPercentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {marginPercentage.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between text-sm">
            <span className="text-commercial-500">Estoque:</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">
                {product.stock_quantity ?? 'N/A'} {product.unit}
              </span>
              {isLowStock && (
                <AlertTriangle className="w-4 h-4 text-yellow-500" title="Estoque baixo" />
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(product)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(product)}
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
