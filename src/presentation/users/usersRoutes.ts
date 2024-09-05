import { Router } from 'express';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { UserController } from './userController';
import { UsersService } from '../services/users.service';


export class BusyDateRoutes {

  static get routes(): Router {

    const router = Router();
    const usersService = new UsersService();
    const controller = new UserController(usersService);

    router.get( '/', controller.getUsers );

    return router;
  }


}

