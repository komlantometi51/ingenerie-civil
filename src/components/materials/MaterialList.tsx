import React, { useState } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import { Material } from '../../types';
import { Card, Button, Input, Badge } from '../ui';
import { Plus, Search, Box, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { formatCurrency, cn } from '../../lib/utils';

export default function MaterialList() {
  const { data: materials, add, update, remove, loading } = useFirestore<Material>('materials');
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<Material | null>(null);

  const filtered = materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      unitPrice: Number(formData.get('unitPrice')),
      stockQuantity: Number(formData.get('stockQuantity')),
      supplier: formData.get('supplier') as string,
    };

    if (editingItem) {
      await update(editingItem.id, itemData);
      setEditingItem(null);
    } else {
      await add(itemData);
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Rechercher un matériau..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAdding(true)} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Ajouter un Matériau
        </Button>
      </div>

      {(isAdding || editingItem) && (
        <Card title={editingItem ? "Modifier le Matériau" : "Nouveau Matériau"}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input name="name" label="Nom du Matériau" defaultValue={editingItem?.name} required />
            <Input name="type" label="Nature / Type" defaultValue={editingItem?.type} placeholder="ex: Ciment, Sable..." />
            <Input name="unitPrice" label="Prix Unitaire" type="number" defaultValue={editingItem?.unitPrice} />
            <Input name="stockQuantity" label="Quantité en Stock" type="number" defaultValue={editingItem?.stockQuantity} required />
            <Input name="supplier" label="Fournisseur" defaultValue={editingItem?.supplier} />
            <div className="sm:col-span-2 flex justify-end space-x-3 mt-4">
              <Button type="button" variant="outline" onClick={() => { setIsAdding(false); setEditingItem(null); }}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m) => (
          <Card key={m.id} className="group relative">
            <div className="absolute right-4 top-4 flex space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button 
                onClick={() => setEditingItem(m)}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button 
                onClick={() => remove(m.id)}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">{m.type}</p>
                <h3 className="mt-1 text-lg font-bold text-gray-900">{m.name}</h3>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Stock Disponible</p>
                <p className={cn(
                  "text-xl font-bold",
                  m.stockQuantity < 10 ? "text-red-600" : "text-gray-900"
                )}>
                  {m.stockQuantity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Prix Unitaire</p>
                <p className="text-sm font-semibold text-blue-600">{formatCurrency(m.unitPrice || 0)}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <p className="text-xs text-gray-500">Fournisseur: <span className="font-medium text-gray-700">{m.supplier || 'N/A'}</span></p>
              {m.stockQuantity < 10 && (
                <div className="flex items-center text-xs font-medium text-red-600">
                  <AlertTriangle className="mr-1 h-3 w-3" /> Stock Faible
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-gray-50">
          <Box className="mb-2 h-10 w-10 text-gray-300" />
          <p className="text-gray-500">Aucun matériau en stock</p>
        </div>
      )}
    </div>
  );
}
