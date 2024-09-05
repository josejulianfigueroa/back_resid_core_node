import { Router } from 'express';
import { Authroutes } from './auth/routes';
import { ReservationRoutes } from './reservations/routes';
import { LodgementRoutes } from './lodgements/lodgementRoutes';
import { BusyDateRoutes } from './busydates/busydatesRoutes';


export class AppRoutes {

  static get routes(): Router {

    const router = Router();
    
   router.use('/api/auth', Authroutes.routes );
   router.use('/api/reservations', ReservationRoutes.routes );
   router.use('/api/busydates', BusyDateRoutes.routes )
   router.use('/api/lodgements', LodgementRoutes.routes )

    return router;
  }

}