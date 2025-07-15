
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import ProductForm from '@/components/Products/ProductForm';
import ProductCard from '@/components/Products/ProductCard';
import CategoryManager from '@/components/Products/CategoryManager';
import DeleteProductDialog from '@/components/Products/DeleteProductDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  Grid,
  List,
  Tags
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
  created_at: string;
  updated_at: string;
}

interface Category {
  id: string;
  name: string;
  description: string | null;
}

const Products = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchCategories();
    }
  }, [user]);

  const fetchProducts = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleProductSaved = () => {
    fetchProducts();
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleCategoriesUpdated = () => {
    fetchCategories();
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
  };

  const handleProductDeleted = () => {
    fetchProducts();
    setProductToDelete(null);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    lowStock: products.filter(p => 
      p.stock_quantity !== null && 
      p.min_stock_level !== null && 
      p.stock_quantity <= p.min_stock_level
    ).length,
    totalValue: products.reduce((sum, p) => sum + (p.price * (p.stock_quantity || 0)), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-commercial-900">Produtos</h1>
            <p className="text-commercial-600 mt-2">
              Gerencie seu catálogo de produtos e estoque
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button
              variant="outline"
              onClick={() => setShowCategoryManager(true)}
              className="flex items-center gap-2"
            >
              <Tags className="w-4 h-4" />
              Categorias
            </Button>
            <Button
              onClick={() => setShowProductForm(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Novo Produto
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-commercial-600">Total de Produtos</p>
                  <p className="text-2xl font-bold text-commercial-900">{stats.total}</p>
                </div>
                <Package className="w-8 h-8 text-primary-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-commercial-600">Produtos Ativos</p>
                  <p className="text-2xl font-bold text-commercial-900">{stats.active}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-commercial-600">Estoque Baixo</p>
                  <p className="text-2xl font-bold text-commercial-900">{stats.lowStock}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-commercial-600">Valor Total</p>
                  <p className="text-2xl font-bold text-commercial-900">
                    R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <Package className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-commercial-400" />
                  <Input
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="discontinued">Descontinuado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products Grid/List */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="w-12 h-12 text-commercial-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-commercial-900 mb-2">
                {products.length === 0 ? 'Nenhum produto cadastrado' : 'Nenhum produto encontrado'}
              </h3>
              <p className="text-commercial-600 mb-4">
                {products.length === 0 
                  ? 'Comece criando seu primeiro produto.' 
                  : 'Tente ajustar os filtros para encontrar o que procura.'
                }
              </p>
              {products.length === 0 && (
                <Button onClick={() => setShowProductForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Produto
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
          }>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                viewMode={viewMode}
                onEdit={handleEditProduct}
                onDelete={handleDeleteProduct}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showProductForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onSave={handleProductSaved}
          onCancel={() => {
            setShowProductForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      {showCategoryManager && (
        <CategoryManager
          categories={categories}
          onCategoriesUpdated={handleCategoriesUpdated}
          onClose={() => setShowCategoryManager(false)}
        />
      )}

      {productToDelete && (
        <DeleteProductDialog
          product={productToDelete}
          onConfirm={handleProductDeleted}
          onCancel={() => setProductToDelete(null)}
        />
      )}
    </div>
  );
};

export default Products;
