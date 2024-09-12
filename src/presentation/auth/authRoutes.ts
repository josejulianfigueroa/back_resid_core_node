import { Router } from 'express';
import { AuthController } from './authController';
import { AuthService, EmailService, UsersService } from '../services';
import { envs, Validators } from '../../config';
import { check } from 'express-validator';
import { FileSystemService } from '../services/fileSystem.service';
import { AuthMiddleware } from '../middlewares/auth.middleware';


export class Authroutes {

  static get routes(): Router {

    const router = Router();
    const emailService = new EmailService(
      envs.MAILER_SERVICE,
      envs.MAILER_EMAIL,
      envs.MAILER_SECRET_KEY,
      envs.SEND_EMAIL,
      new FileSystemService()
    );
    const usersService = new UsersService(new FileSystemService());

    const authService = new AuthService(emailService, usersService, new FileSystemService());

    const controller = new AuthController(authService);
    
    router.post('/login', controller.loginUser );
    router.post('/register', controller.registerUser );
    router.get( '/check-token',[ AuthMiddleware.validateJWT ], controller.checkToken );
    router.post('/reset-clave/:email',[
      check('email', 'El email no es válido').isEmail(),
      check('email').custom( Validators.emailExiste ),
      Validators.validarCampos
     ],  controller.resetClave);

    router.get('/validate-email/:token', controller.validateEmail );

    return router;
  }


}

