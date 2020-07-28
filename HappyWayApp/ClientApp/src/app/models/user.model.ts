export class UserModel {
  id: number;
  username: string;
  password: string;
  displayName: string;
  phoneNumber: string;
  role: Role;
  token?: string;
}

export enum Role {
  User = 'User',
  Admin = 'Admin'
}
