export type ProjectStatus = 'En cours' | 'Terminé' | 'Suspendu';
export type PersonnelStatus = 'Disponible' | 'Occupé' | 'En congé';
export type MachineState = 'Fonctionnel' | 'Panne';
export type FinancialDocType = 'Devis' | 'Facture';
export type FinancialDocStatus = 'Payé' | 'Non payé';

export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  status: ProjectStatus;
  budget: number;
  client: string;
  ownerId: string;
  createdAt: any;
  updatedAt: any;
}

export interface Personnel {
  id: string;
  lastName: string;
  firstName: string;
  specialty: string;
  phone: string;
  email: string;
  status: PersonnelStatus;
  ownerId: string;
  createdAt: any;
  updatedAt: any;
}

export interface Material {
  id: string;
  name: string;
  type: string;
  unitPrice: number;
  stockQuantity: number;
  supplier: string;
  ownerId: string;
  createdAt: any;
  updatedAt: any;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  state: MachineState;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  usageCost: number;
  ownerId: string;
  createdAt: any;
  updatedAt: any;
}

export interface FinancialDoc {
  id: string;
  type: FinancialDocType;
  amount: number;
  date: string;
  status: FinancialDocStatus;
  paymentMode: string;
  projectId: string;
  ownerId: string;
  createdAt: any;
  updatedAt: any;
}

export interface Assignment {
  id: string;
  projectId: string;
  workerId: string;
  role: string;
  startDate: string;
  endDate: string;
  ownerId: string;
  createdAt: any;
  updatedAt: any;
}
