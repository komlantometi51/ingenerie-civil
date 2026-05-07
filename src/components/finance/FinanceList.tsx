import React, { useState } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import { FinancialDoc, FinancialDocType, FinancialDocStatus, Project } from '../../types';
import { Card, Button, Input, Badge } from '../ui';
import { Plus, Search, Wallet, Trash2, Edit, FileText, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '../../lib/utils';

export default function FinanceList() {
  const { data: financials, add, update, remove, loading } = useFirestore<FinancialDoc>('financials');
  const { data: projects } = useFirestore<Project>('projects');
  
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState<FinancialDoc | null>(null);

  const filtered = financials.filter(f => 
    f.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemData = {
      type: formData.get('type') as FinancialDocType,
      amount: Number(formData.get('amount')),
      date: formData.get('date') as string,
      status: formData.get('status') as FinancialDocStatus,
      paymentMode: formData.get('paymentMode') as string,
      projectId: formData.get('projectId') as string,
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
            placeholder="Rechercher une transaction..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAdding(true)} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Nouveau Document
        </Button>
      </div>

      {(isAdding || editingItem) && (
        <Card title={editingItem ? "Modifier le Document" : "Nouvelle Transaction"}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Type de Document</label>
              <select name="type" defaultValue={editingItem?.type || 'Facture'} className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                <option value="Devis">Devis</option>
                <option value="Facture">Facture</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Projet Associé</label>
              <select name="projectId" defaultValue={editingItem?.projectId} className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" required>
                <option value="">Sélectionner un projet</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <Input name="amount" label="Montant" type="number" defaultValue={editingItem?.amount} required />
            <Input name="date" label="Date d'émission" type="date" defaultValue={editingItem?.date} required />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Statut</label>
              <select name="status" defaultValue={editingItem?.status || 'Non payé'} className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm">
                <option value="Non payé">Non payé</option>
                <option value="Payé">Payé</option>
              </select>
            </div>
            <Input name="paymentMode" label="Mode de paiement" defaultValue={editingItem?.paymentMode} placeholder="Espèces, Virement..." />
            
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
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Document</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Projet</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Montant</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filtered.map((f) => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-100 text-gray-500">
                      <FileText className="h-4 w-4" />
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-900">{f.type}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="text-sm text-gray-600">
                    {projects.find(p => p.id === f.projectId)?.name || 'Projet inconnu'}
                  </span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="text-sm text-gray-500">{formatDate(f.date)}</span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(f.amount)}</span>
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  <Badge variant={f.status === 'Payé' ? 'success' : 'warning'}>
                    <div className="flex items-center space-x-1">
                      {f.status === 'Payé' ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      <span>{f.status}</span>
                    </div>
                  </Badge>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button onClick={() => setEditingItem(f)} className="mr-3 text-blue-600 hover:text-blue-900"><Edit className="h-4 w-4" /></button>
                  <button onClick={() => remove(f.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!loading && filtered.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-gray-50">
          <Wallet className="mb-2 h-10 w-10 text-gray-300" />
          <p className="text-gray-500">Aucune transaction enregistrée</p>
        </div>
      )}
    </div>
  );
}
