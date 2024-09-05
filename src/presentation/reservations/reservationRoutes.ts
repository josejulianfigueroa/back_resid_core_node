import { Router } from 'express';
import { ReservationController } from './reservationController';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { ReservationService, LodgementService, EmailService } from '../services/';
import { envs, Validators } from './../../config';
import { check } from 'express-validator';


export class ReservationRoutes {

  static get routes(): Router {

    const router = Router();
    const emailService = new EmailService(
      envs.MAILER_SERVICE,
      envs.MAILER_EMAIL,
      envs.MAILER_SECRET_KEY,
      envs.SEND_EMAIL,
    )
    const reservationService = new ReservationService(new LodgementService(),emailService);
    const controller = new ReservationController(reservationService);

    router.get( '/', controller.getReservations );
    
    router.post( '/',[ AuthMiddleware.validateJWT ],controller.createReservation );

    router.post( '/delete/:id',
      [ AuthMiddleware.validateJWT,
      check('id').custom( Validators.isMongoID ),
      Validators.validarCampos 
     ], controller.deleteReservation );

    router.post( '/change/:id/:status',
      [ AuthMiddleware.validateJWT, 
        check('id').custom( Validators.isMongoID ),
        check('status').custom( Validators.esStatusValido ),
        Validators.validarCampos ],
        controller.changeStatusReservation );

    router.post( '/pay/:id/:monto',
          [ AuthMiddleware.validateJWT, 
            check('id').custom( Validators.isMongoID ),
            check('monto').custom( Validators.esNumero ),
            Validators.validarCampos ],
            controller.payReservation );

    return router;
  }

}

