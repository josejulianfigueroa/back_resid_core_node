import { Router } from 'express';
import { ImageController } from './ImagesController';


export class ImageRoutes {


  static get routes():Router {

    const router = Router();
    const controller = new ImageController();

    router.get('/:type/:img', controller.getImage )

    return router;

  }


}

