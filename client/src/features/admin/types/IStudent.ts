export interface IStudent {
  studentId:string
  name: string;
  email: string;
  profilePictureUrl: string;
  registeredVia: string
  accountStatus:   "active" |'blocked'
}
