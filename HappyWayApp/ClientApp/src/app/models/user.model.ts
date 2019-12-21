export class UserModel {
  id: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  token?: string;
}

export enum Role {
  User = 'User',
  Admin = 'Admin'
}
