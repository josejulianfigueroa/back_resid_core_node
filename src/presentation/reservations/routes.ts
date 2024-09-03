import { Router } from 'express';
import { ReservationController } from './controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { ReservationService } from '../services/reservation.service';


export class ReservationRoutes {


  static get routes(): Router {

    const router = Router();
    const reservationService = new ReservationService();
    const controller = new ReservationController(reservationService);

    router.get( '/', controller.getReservations );
    router.post( '/',[ AuthMiddleware.validateJWT ],controller.createReservation );

    return router;
  }


}

