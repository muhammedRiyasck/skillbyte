import {AdminAuthController} from '../controllers/AuthController'
import {AdminRepository} from '../../infrastructure/repositories/AdminRepository';

import {LoginAdminUseCase} from '../../application/use-cases/LoginAdminUseCase';

const adminRepo = new AdminRepository();
const loginAdminUC = new LoginAdminUseCase(adminRepo);

export const adminAuthContainer = new AdminAuthController(
    loginAdminUC
 );  
