export interface IStudent {
  id: string
  name: string;
  email: string;
  profilePicture: string;
  registeredVia: string
  accountStatus: "active" | 'blocked'
}
