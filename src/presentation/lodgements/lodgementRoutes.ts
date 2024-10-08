import { Router } from 'express';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { LodgementController } from './lodgementController';
import { LodgementService } from '../services/lodgement.service';
import { envs, Validators } from '../../config';
import { check } from 'express-validator';
import { FileSystemService } from '../services/fileSystem.service';

export class LodgementRoutes {


  static get routes(): Router {

    const router = Router();
    const lodgementService = new LodgementService(new FileSystemService());
    const controller = new LodgementController( lodgementService );


    router.get( '/', controller.getLodgements );
    router.post( '/',[ AuthMiddleware.validateJWT ], controller.createLodgement );
    router.post( '/load/images/:id',[ AuthMiddleware.validateJWT ], controller.loadImagesLodgement );
    router.get( '/get/images/:id',[ AuthMiddleware.validateJWT ], controller.getImagesLodgementById );
    router.get( '/delete/images/:id',[ AuthMiddleware.validateJWT ], controller.deleteImgById );
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

