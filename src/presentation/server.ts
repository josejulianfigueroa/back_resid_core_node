import express, { Router } from 'express';
import fileUpload from 'express-fileupload';
import { CronService } from './services/cron-service';
import { EmailService } from './services';
import { envs } from '../config';
import { FileSystemService, BusyDatesService } from './services';
import { BackupAndRestoreMongo } from './services/backupAndRestoreMongo.service';
const cors = require('cors');

interface Options {
  port: number;
  routes: Router;
  public_path?: string;
}

const emailService = new EmailService(
  envs.MAILER_SERVICE,
  envs.MAILER_EMAIL,
  envs.MAILER_SECRET_KEY,
  envs.SEND_EMAIL,
  new FileSystemService()
)
const busyDatesService = new BusyDatesService(new FileSystemService());
const backupAndRestoreMongo = new BackupAndRestoreMongo();
export class ServerExpress {

  public readonly app = express();
  private serverListener?: any;
  private readonly port: number;
  private readonly publicPath: string;
  private readonly routes: Router;

  constructor(options: Options) {
    const { port, routes, public_path = 'public' } = options;
    this.port = port;
    this.publicPath = public_path;
    this.routes = routes;

    this.configure();
  }


  private configure() {
    
    //* Middlewares
    this.app.use(fileUpload({
      limits: { fileSize: 5000 * 1024 * 1024 },
    }));
    this.app.use( express.json() ); // raw
    this.app.use( express.urlencoded({ extended: true }) ); // x-www-form-urlencoded
    this.app.use( cors({
      origin: '*',
    }) );

    
    //* Public Folder
    this.app.use( express.static( this.publicPath ) );

    //* SPA
 /*   this.app.get('*', (req, res) => {
      const indexPath = path.join( __dirname + `../../../${ this.publicPath }/index.html` );
      res.sendFile(indexPath);
    });*/
    


    // Job para el backup de la base de datos cada 10:10 horas
    if(envs.ENVIO_LOGS){
      CronService.createJob(
        '10 10 * * *',
        () => {
          backupAndRestoreMongo.backupMongoDB()
        }
      );
    }

    // Job para el envío de Logs a las 10:05 horas
    if(envs.ENVIO_LOGS){
    CronService.createJob(
      '5 10 * * *',
      () => {
     
        emailService.sendEmailWithFileSystemLogs( envs.MAILER_SOPORTE )
                    .then(() => new FileSystemService().deleteContentFromFile());
      }
    );
  }
    // Job para el mantenimiento diario de la tabla busydates a las 10:01 horas
   /* if(envs.MANTENIMIENTO_BUSYDATES){
    CronService.createJob(
      '1 10 * * *',
      () => {
        busyDatesService.deleteBusydateByMaintenance();
      }
    );
  }*/
  }

  public close() {
    this.serverListener?.close();
  }

  public setRoutes(  router: Router ) {
    this.app.use(router);
  }
  

  async start() { 

    this.serverListener = this.app.listen(this.port, () => {
      console.log(`Server running on port ${ this.port }`);
    });

  }

}