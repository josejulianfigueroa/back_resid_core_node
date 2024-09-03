import { Router } from 'express';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { BusyDatesController } from './controller';
import { BusyDatesService } from '../services/busydates.service';


export class BusyDateRoutes {

  static get routes(): Router {

    const router = Router();
    const busyDatesService = new BusyDatesService();
    const controller = new BusyDatesController( busyDatesService );

    router.get( '/', controller.getBusyDates );
    router.post( '/',[ AuthMiddleware.validateJWT ], controller.createBusyDate );

    return router;
  }


}

