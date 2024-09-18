import { Router } from 'express';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { BusyDatesController } from './busydatesController';
import { BusyDatesService } from '../services/busydates.service';
import { FileSystemService } from '../services/fileSystem.service';


export class BusyDateRoutes {

  static get routes(): Router {

    const router = Router();
    const busyDatesService = new BusyDatesService(new FileSystemService());
    const controller = new BusyDatesController( busyDatesService );

    router.get( '/', controller.getBusyDates );
    router.get( '/statistics', controller.getStatistics );

    return router;
  }


}

