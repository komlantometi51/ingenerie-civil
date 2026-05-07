import React, { useState } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import { Machine, MachineState } from '../../types';
import { Card, Button, Input, Badge } from '../ui';
import { Plus, Search, Truck, Trash2, Edit, Calendar, Settings } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

export default function MachineList() {
  const { data: machines, add, update, remove, loading } = useFirestore<Machine>('machines');
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<Machine | null>(null);

  const filtered = machines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      state: formData.get('state') as MachineState,
      lastMaintenanceDate: formData.get('lastMaintenanceDate') as string,
      nextMaintenanceDate: formData.get('nextMaintenanceDate') as string,
      usageCost: Number(formData.get('usageCost')),
    };

    if (editingItem) {
      await update(editingItem.id, itemData);
      setEditingItem(null);
    } else {
      await add(itemData);
      setIsAdding(false);
    }
  };

  const stateVariants = {
    'Fonctionnel': 'success',
    'Panne': 'danger'
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Rechercher une machine..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAdding(true)} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Nouvelle Machine
        </Button>
      </div>

      {(isAdding || editingItem) && (
        <Card title={editingItem ? "Modifier la Machine" : "Nouveau Matériel"}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input name="name" label="Nom" defaultValue={editingItem?.name} required />
            <Input name="type" label="Type de machine" defaultValue={editingItem?.type} />
            <Input name="usageCost" label="Coût d'utilisation" type="number" defaultValue={editingItem?.usageCost} />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">État</label>
              <select 
                name="state" 
                defaultValue={editingItem?.state || 'Fonctionnel'}
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Fonctionnel">Fonctionnel</option>
                <option value="Panne">Panne</option>
              </select>
            </div>
            <Input name="lastMaintenanceDate" label="Dernière maintenance" type="date" defaultValue={editingItem?.lastMaintenanceDate} />
            <Input name="nextMaintenanceDate" label="Prochaine maintenance" type="date" defaultValue={editingItem?.nextMaintenanceDate} />
            
            <div className="sm:col-span-2 flex justify-end space-x-3 mt-4">
              <Button type="button" variant="outline" onClick={() => { setIsAdding(false); setEditingItem(null); }}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {filtered.map((m) => (
          <Card key={m.id} className="group relative">
            <div className="absolute right-4 top-4 flex space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button onClick={() => setEditingItem(m)} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"><Edit className="h-4 w-4" /></button>
              <button onClick={() => remove(m.id)} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="rounded-xl bg-gray-100 p-4">
                <Truck className="h-8 w-8 text-gray-600" />
              </div>
              <div>
                <Badge variant={stateVariants[m.state]}>{m.state}</Badge>
                <h3 className="text-lg font-bold text-gray-900">{m.name}</h3>
                <p className="text-sm text-gray-500">{m.type}</p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-4">
              <div className="space-y-1">
                <p className="flex items-center text-xs text-gray-500"><Calendar className="mr-1 h-3 w-3" /> Dernière Maint.</p>
                <p className="text-sm font-medium">{m.lastMaintenanceDate ? formatDate(m.lastMaintenanceDate) : '-'}</p>
              </div>
              <div className="space-y-1">
                <p className="flex items-center text-xs text-gray-500"><Settings className="mr-1 h-3 w-3" /> Prochaine Maint.</p>
                <p className="text-sm font-medium text-blue-600">{m.nextMaintenanceDate ? formatDate(m.nextMaintenanceDate) : '-'}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <p className="text-xs text-gray-500">Coût d'utilisation par jour</p>
              <p className="text-sm font-bold text-gray-900">{formatCurrency(m.usageCost || 0)}</p>
            </div>
          </Card>
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-gray-50">
          <Truck className="mb-2 h-10 w-10 text-gray-300" />
          <p className="text-gray-500">Aucune machine enregistrée</p>
        </div>
      )}
    </div>
  );
}
