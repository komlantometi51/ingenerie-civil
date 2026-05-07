import React, { useState } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import { Personnel, PersonnelStatus } from '../../types';
import { Card, Button, Input, Badge } from '../ui';
import { Plus, Search, Phone, Mail, Trash2, Edit, User, Users } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function PersonnelList() {
  const { data: personnel, add, update, remove, loading } = useFirestore<Personnel>('personnel');
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<Personnel | null>(null);

  const filtered = personnel.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      specialty: formData.get('specialty') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      status: formData.get('status') as PersonnelStatus,
    };

    if (editingItem) {
      await update(editingItem.id, itemData);
      setEditingItem(null);
    } else {
      await add(itemData);
      setIsAdding(false);
    }
  };

  const statusVariants = {
    'Disponible': 'success',
    'Occupé': 'warning',
    'En congé': 'danger'
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Rechercher un employé..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAdding(true)} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Ajouter du Personnel
        </Button>
      </div>

      {(isAdding || editingItem) && (
        <Card title={editingItem ? "Modifier l'Employé" : "Nouvel Employé"}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input name="firstName" label="Prénom" defaultValue={editingItem?.firstName} required />
            <Input name="lastName" label="Nom" defaultValue={editingItem?.lastName} required />
            <Input name="specialty" label="Domaine / Spécialité" defaultValue={editingItem?.specialty} />
            <Input name="phone" label="Téléphone" defaultValue={editingItem?.phone} />
            <Input name="email" label="Email" type="email" defaultValue={editingItem?.email} />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Disponibilité</label>
              <select 
                name="status" 
                defaultValue={editingItem?.status || 'Disponible'}
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Disponible">Disponible</option>
                <option value="Occupé">Occupé</option>
                <option value="En congé">En congé</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex justify-end space-x-3 mt-4">
              <Button type="button" variant="outline" onClick={() => { setIsAdding(false); setEditingItem(null); }}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nom Complet</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Domaine</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Contact</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{p.firstName} {p.lastName}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="text-sm text-gray-600">{p.specialty}</span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <Badge variant={statusVariants[p.status]}>{p.status}</Badge>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center text-xs text-gray-500">
                      <Phone className="mr-1 h-3 w-3" /> {p.phone || 'N/A'}
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Mail className="mr-1 h-3 w-3" /> {p.email || 'N/A'}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button onClick={() => setEditingItem(p)} className="mr-3 text-blue-600 hover:text-blue-900"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => remove(p.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && filtered.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-gray-50">
          <Users className="mb-2 h-10 w-10 text-gray-300" />
          <p className="text-gray-500">Personne n'a été trouvé</p>
        </div>
      )}
    </div>
  );
}
