
export interface IResetPasswordUseCase {
 execute(token:string,password:string,role:string):Promise<void>
}
