import { Router } from 'express';
import { Authroutes } from './auth/authRoutes';
import { ReservationRoutes } from './reservations/reservationRoutes';
import { LodgementRoutes } from './lodgements/lodgementRoutes';
import { BusyDateRoutes } from './busydates/busydatesRoutes';
import { FileUploadRoutes } from './file-upload/fileUploadRoutes';
import { ImageRoutes } from './images/imagesRoutes';
import { UserRoutes } from './users/usersRoutes';


export class AppRoutes {

  static get routes(): Router {

    const router = Router();
    
   router.use('/api/auth', Authroutes.routes );
   router.use('/api/reservations', ReservationRoutes.routes );
   router.use('/api/users', UserRoutes.routes );
   router.use('/api/busydates', BusyDateRoutes.routes )
   router.use('/api/lodgements', LodgementRoutes.routes )
   router.use('/api/upload', FileUploadRoutes.routes );
   router.use('/api/images', ImageRoutes.routes );
   
    return router;
  }

}