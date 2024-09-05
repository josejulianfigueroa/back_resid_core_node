import { Router } from 'express';
import { FileUploadController } from './fileUploadController';
import { FileUploadService } from '../services/file-upload.service';
import { FileUploadMiddleware } from '../middlewares/file-upload.middleware';
import { TypeMiddleware } from '../middlewares/type.middleware';
import { Uuid } from '../../config';
import { FileSystemService } from '../services/fileSystem.service';


export class FileUploadRoutes {

  static get routes(): Router {

    const router = Router();
    const controller = new FileUploadController(
      new FileUploadService(Uuid.v4, new FileSystemService())
    );

    router.use( FileUploadMiddleware.containFiles );
    router.use( TypeMiddleware.validTypes(['users','lodgements']) );

    // Definir las rutas
    // api/upload/single/<users|lodgements>/
    // api/upload/multiple/<users|lodgements>/
    router.post( '/single/:type', controller.uploadFile );
    router.post( '/multiple/:type',controller.uploadMultileFiles );

    return router;
  }


}

