import { Router } from 'express';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { LodgementController } from './controller';
import { LodgementService } from '../services/lodgement.service';


export class LodgementRoutes {


  static get routes(): Router {

    const router = Router();
    const lodgementService = new LodgementService();
    const controller = new LodgementController( lodgementService );


    router.get( '/', controller.getLodgements );
    router.post( '/',[ AuthMiddleware.validateJWT ], controller.createLodgement );

    return router;
  }


}

