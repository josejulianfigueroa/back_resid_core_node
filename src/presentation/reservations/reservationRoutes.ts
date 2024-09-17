import { Router } from 'express';
import { ReservationController } from './reservationController';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { ReservationService, LodgementService, EmailService } from '../services/';
import { envs, Validators } from './../../config';
import { check } from 'express-validator';
import { FileSystemService } from '../services/fileSystem.service';


export class ReservationRoutes {

  static get routes(): Router {

    const router = Router();
    const emailService = new EmailService(
      envs.MAILER_SERVICE,
      envs.MAILER_EMAIL,
      envs.MAILER_SECRET_KEY,
      envs.SEND_EMAIL,
      new FileSystemService()
    )
    const reservationService = new ReservationService(new LodgementService(new FileSystemService()),emailService, new FileSystemService());
    const controller = new ReservationController(reservationService);

    router.get( '/',[ AuthMiddleware.validateJWT ], controller.getReservations );
    
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

    router.post( '/pay/:id/:monto/fecha:',
          [ AuthMiddleware.validateJWT, 
            check('id').custom( Validators.isMongoID ),
            check('monto').custom( Validators.esNumero ),
            Validators.validarCampos ],
            controller.payReservation );

     router.get( '/pay',
              [ AuthMiddleware.validateJWT ],
                controller.getPayReservations );

    return router;
  }

}

