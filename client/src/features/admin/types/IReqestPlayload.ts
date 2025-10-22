export interface IReqestPlayload {
    instructorId:string;
    reason?:string
    status?: 'active' | 'suspend';
}
