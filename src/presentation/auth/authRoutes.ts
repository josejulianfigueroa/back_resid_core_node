import { Router } from 'express';
import { AuthController } from './authController';
import { AuthService, EmailService, UsersService } from '../services';
import { envs, Validators } from '../../config';
import { check } from 'express-validator';


export class Authroutes {

  static get routes(): Router {

    const router = Router();
    const emailService = new EmailService(
      envs.MAILER_SERVICE,
      envs.MAILER_EMAIL,
      envs.MAILER_SECRET_KEY,
      envs.SEND_EMAIL,
    );
    const usersService = new UsersService();

    const authService = new AuthService(emailService, usersService);

    const controller = new AuthController(authService);
    
    router.post('/login', controller.loginUser );
    router.post('/register', controller.registerUser );
    router.post('/reset-clave/:email',[
      check('email', 'El email no es válido').isEmail(),
      check('email').custom( Validators.emailExiste ),
      Validators.validarCampos
     ],  controller.resetClave);

    router.get('/validate-email/:token', controller.validateEmail );

    return router;
  }


}

