import { Router } from 'express';
import { AuthController } from './authController';
import { AuthService, EmailService } from '../services';
import { envs } from './../../config';

export class Authroutes {

  static get routes(): Router {

    const router = Router();
    const emailService = new EmailService(
      envs.MAILER_SERVICE,
      envs.MAILER_EMAIL,
      envs.MAILER_SECRET_KEY,
      envs.SEND_EMAIL,
    );

    const authService = new AuthService(emailService);

    const controller = new AuthController(authService);
    
    router.post('/login', controller.loginUser );
    router.post('/register', controller.registerUser );
    router.post('/reset-clave/:email', controller.resetClave);
    router.get('/validate-email/:token', controller.validateEmail );

    return router;
  }


}

