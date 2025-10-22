export interface IStudent {
  _id:string
  name: string;
  email: string;
  profilePictureUrl: string;
  registeredVia: string
  accountStatus:   "active" |'blocked'
}
