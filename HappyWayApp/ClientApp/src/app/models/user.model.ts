export class UserModel {
  id: number;
  username: string;
  password: string;
  displayName: string;
  city: string;
  role: Role;
  token?: string;
}

export enum Role {
  User = 'User',
  Admin = 'Admin'
}
