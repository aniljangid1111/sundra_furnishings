export interface SystemModule {
  id: string;
  name: string;
  key: string;
  column: 1 | 2;
}

export interface ModuleCRUD {
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export interface UserRole {
  id: string;
  name: string;
  code: string;
  description?: string;
  userCount: number;
  isSystem: boolean;
  status: "ACTIVE" | "INACTIVE";
  modules: string[]; // List of enabled module keys
  permissions: Record<string, ModuleCRUD>; // moduleKey -> CRUD permissions
  createdAt: string;
  updatedAt: string;
}
