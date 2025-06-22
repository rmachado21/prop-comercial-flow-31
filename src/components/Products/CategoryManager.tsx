
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { X, Plus, Edit, Trash2, Tags, Save } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface CategoryManagerProps {
  categories: Category[];
  onCategoriesUpdated: () => void;
  onClose: () => void;
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ 
  categories, 
  onCategoriesUpdated, 
  onClose 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const categoryData = {
        user_id: user.id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        updated_at: new Date().toISOString()
      };

      let error;

      if (editingCategory) {
        const { error: updateError } = await supabase
          .from('product_categories')
          .update(categoryData)
          .eq('id', editingCategory.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('product_categories')
          .insert([{ ...categoryData, created_at: new Date().toISOString() }]);
        error = insertError;
      }

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Categoria ${editingCategory ? 'atualizada' : 'criada'} com sucesso!`,
      });

      setFormData({ name: '', description: '' });
      setEditingCategory(null);
      onCategoriesUpdated();
    } catch (error) {
      console.error('Error saving category:', error);
      toast({
        title: "Erro",
        description: `Não foi possível ${editingCategory ? 'atualizar' : 'criar'} a categoria.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
  };

  const handleDelete = async (category: Category) => {
    if (!user) return;

    if (!confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', category.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso!",
      });

      onCategoriesUpdated();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a categoria.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle className="flex items-center gap-2">
            <Tags className="w-5 h-5" />
            Gerenciar Categorias
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-commercial-50 rounded-lg">
            <h3 className="text-lg font-medium text-commercial-900">
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Categoria *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome da categoria"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição da categoria"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              {editingCategory && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : editingCategory ? (
                  <Save className="w-4 h-4 mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                {editingCategory ? 'Atualizar' : 'Criar'} Categoria
              </Button>
            </div>
          </form>

          {/* Categories List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-commercial-900">
              Categorias Existentes ({categories.length})
            </h3>
            
            {categories.length === 0 ? (
              <div className="text-center py-8 text-commercial-500">
                <Tags className="w-12 h-12 mx-auto mb-4 text-commercial-300" />
                <p>Nenhuma categoria criada ainda.</p>
                <p className="text-sm">Crie sua primeira categoria acima.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category) => (
                  <Card key={category.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-commercial-900">{category.name}</h4>
                        {category.description && (
                          <p className="text-sm text-commercial-600 mt-1">{category.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(category)}
                          disabled={isLoading}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(category)}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryManager;
