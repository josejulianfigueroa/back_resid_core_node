import { Router } from 'express';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { UserController } from './userController';
import { UsersService } from '../services/users.service';
import { FileSystemService } from '../services';


export class UserRoutes {

  static get routes(): Router {

    const router = Router();
    const usersService = new UsersService(new FileSystemService());
    const controller = new UserController(usersService);

    router.get( '/',[ AuthMiddleware.validateJWT ], controller.getUsers );

    return router;
  }


}

