import React, { useState } from 'react';
import { useFirestore } from '../../hooks/useFirestore';
import { Project, ProjectStatus } from '../../types';
import { Card, Button, Input, Badge } from '../ui';
import { Plus, Search, MapPin, Calendar, Trash2, Edit, Briefcase } from 'lucide-react';
import { formatCurrency, formatDate } from '../../lib/utils';

export default function ProjectList() {
  const { data: projects, add, update, remove, loading } = useFirestore<Project>('projects');
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const projectData = {
      name: formData.get('name') as string,
      location: formData.get('location') as string,
      description: formData.get('description') as string,
      startDate: formData.get('startDate') as string,
      endDate: formData.get('endDate') as string,
      status: formData.get('status') as ProjectStatus,
      budget: Number(formData.get('budget')),
      client: formData.get('client') as string,
    };

    if (editingProject) {
      await update(editingProject.id, projectData);
      setEditingProject(null);
    } else {
      await add(projectData);
      setIsAdding(false);
    }
  };

  const statusColors = {
    'En cours': 'info',
    'Terminé': 'success',
    'Suspendu': 'danger'
  } as const;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input 
            placeholder="Rechercher un projet..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsAdding(true)} className="flex items-center">
          <Plus className="mr-2 h-4 w-4" /> Nouveau Projet
        </Button>
      </div>

      {(isAdding || editingProject) && (
        <Card title={editingProject ? "Modifier le Projet" : "Créer un Nouveau Projet"}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input name="name" label="Nom du Projet" defaultValue={editingProject?.name} required />
            <Input name="client" label="Client" defaultValue={editingProject?.client} required />
            <Input name="location" label="Lieu du chantier" defaultValue={editingProject?.location} />
            <Input name="budget" label="Budget" type="number" defaultValue={editingProject?.budget} />
            <Input name="startDate" label="Date de début" type="date" defaultValue={editingProject?.startDate} />
            <Input name="endDate" label="Date de fin" type="date" defaultValue={editingProject?.endDate} />
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea 
                name="description" 
                defaultValue={editingProject?.description}
                className="mt-1 flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Statut</label>
              <select 
                name="status" 
                defaultValue={editingProject?.status || 'En cours'}
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="En cours">En cours</option>
                <option value="Terminé">Terminé</option>
                <option value="Suspendu">Suspendu</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex justify-end space-x-3 mt-4">
              <Button type="button" variant="outline" onClick={() => { setIsAdding(false); setEditingProject(null); }}>Annuler</Button>
              <Button type="submit">Enregistrer</Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="group relative transition-all hover:shadow-md">
            <div className="absolute right-4 top-4 flex space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button 
                onClick={() => setEditingProject(project)}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button 
                onClick={() => remove(project.id)}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            <Badge variant={statusColors[project.status]}>{project.status}</Badge>
            <h3 className="mt-2 text-lg font-bold text-gray-900">{project.name}</h3>
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{project.description || 'Aucune description'}</p>
            
            <div className="mt-6 space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                {project.location}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                {project.startDate ? formatDate(project.startDate) : 'Non planifié'}
              </div>
            </div>

            <div className="mt-6 border-t pt-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-gray-500">Budget</p>
                <p className="text-sm font-bold text-blue-600">{formatCurrency(project.budget || 0)}</p>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                Client: <span className="font-medium text-gray-900">{project.client}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {!loading && filteredProjects.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed bg-gray-50">
          <Briefcase className="mb-2 h-10 w-10 text-gray-300" />
          <p className="text-gray-500">Aucun projet trouvé</p>
          <Button variant="ghost" className="mt-4" onClick={() => setIsAdding(true)}>Créer votre premier projet</Button>
        </div>
      )}
    </div>
  );
}
