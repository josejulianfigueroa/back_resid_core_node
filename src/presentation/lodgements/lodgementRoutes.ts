import { Router } from 'express';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { LodgementController } from './lodgementController';
import { LodgementService } from '../services/lodgement.service';
import { envs, Validators } from '../../config';
import { check } from 'express-validator';

export class LodgementRoutes {


  static get routes(): Router {

    const router = Router();
    const lodgementService = new LodgementService();
    const controller = new LodgementController( lodgementService );


    router.get( '/', controller.getLodgements );
    router.post( '/',[ AuthMiddleware.validateJWT ], controller.createLodgement );
    router.post( '/update/:id',
       [AuthMiddleware.validateJWT,
       check('id').custom( Validators.isMongoID ),
       Validators.validarCampos ], controller.updateLodgement );
    router.post( '/delete/:id',
      [ AuthMiddleware.validateJWT,
        check('id').custom( Validators.isMongoID ),
        Validators.validarCampos
       ], controller.deleteLodgement );

    return router;
  }


}

