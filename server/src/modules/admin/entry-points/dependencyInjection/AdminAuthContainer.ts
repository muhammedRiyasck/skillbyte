import {AdminAuthContainer} from '../controllers/AuthController'
import {MongoAdminRepository} from '../../infrastructure/repositories/MongoAdminRepository';

import {LoginAdminUseCase} from '../../application/use-cases/LoginAdminUseCase';

const adminRepo = new MongoAdminRepository();
const loginAdminUC = new LoginAdminUseCase(adminRepo);

export const adminAuthContainer = new AdminAuthContainer(
    loginAdminUC
 );  
