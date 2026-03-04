export interface IReqestPlayload {
    id: string;
    reason?: string
    status?: 'active' | 'suspend';
}
