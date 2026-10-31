export interface UserAccount {
  id: string;
  name: string;
  mobile: string;
  email: string;
  role: string;
  roleId: string;
  status: "ACTIVE" | "INACTIVE";
  initials: string;
  avatarBg?: string;
  createdAt?: string;
  password?: string;
  requirePasswordChange?: boolean;
}
