import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useFirestore } from '../hooks/useFirestore';
import { Project, Material, Personnel, FinancialDoc } from '../types';
import { Card } from './ui';
import { Briefcase, Users, Box, Wallet, TrendingUp, AlertCircle } from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';

export default function Dashboard() {
  const { data: projects } = useFirestore<Project>('projects');
  const { data: personnel } = useFirestore<Personnel>('personnel');
  const { data: materials } = useFirestore<Material>('materials');
  const { data: financials } = useFirestore<FinancialDoc>('financials');

  const stats = [
    { label: 'Projets Actifs', value: projects.filter(p => p.status === 'En cours').length, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Personnel', value: personnel.length, icon: Users, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Matériaux en stock', value: materials.length, icon: Box, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Revenu Total', value: formatCurrency(financials.filter(f => f.type === 'Facture').reduce((acc, current) => acc + current.amount, 0)), icon: Wallet, color: 'text-purple-600', bg: 'bg-purple-100' },
  ];

  const projectStatusData = [
    { name: 'En cours', value: projects.filter(p => p.status === 'En cours').length },
    { name: 'Terminés', value: projects.filter(p => p.status === 'Terminé').length },
    { name: 'Suspendus', value: projects.filter(p => p.status === 'Suspendu').length },
  ].filter(d => d.value > 0);

  const COLORS = ['#2563eb', '#16a34a', '#dc2626'];

  const recentFinancials = [...financials].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm">
            <div className="flex items-center space-x-4">
              <div className={`${stat.bg} rounded-xl p-3`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Project Charts */}
        <Card title="Répartition des Projets">
          <div className="h-64 w-full">
            {projectStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-gray-400">
                <AlertCircle className="mb-2 h-8 w-8" />
                <p>Pas assez de données</p>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-center space-x-6 text-sm">
            {projectStatusData.map((d, i) => (
              <div key={d.name} className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span>{d.name}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Financial Overview */}
        <Card title="Dernières Transactions">
          <div className="space-y-4">
            {recentFinancials.length > 0 ? (
              recentFinancials.map((fin) => (
                <div key={fin.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "rounded-full p-2",
                      fin.type === 'Facture' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                    )}>
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{fin.type}</p>
                      <p className="text-xs text-gray-500">{new Date(fin.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(fin.amount)}</p>
                    <p className={cn(
                      "text-xs font-medium",
                      fin.status === 'Payé' ? "text-green-600" : "text-red-600"
                    )}>{fin.status}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex h-48 flex-col items-center justify-center text-gray-400">
                <Wallet className="mb-2 h-8 w-8" />
                <p>Aucune transaction enregistrée</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
