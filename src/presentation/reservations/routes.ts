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
    router.post( '/update/:id',[ AuthMiddleware.validateJWT ], controller.updateReservation );
    router.post( '/delete/:id',[ AuthMiddleware.validateJWT ], controller.deleteReservation );

    return router;
  }

}

