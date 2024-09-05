import express, { Router } from 'express';
import fileUpload from 'express-fileupload';
import { CronService } from './services/cron-service';
import { EmailService } from './services';
import { envs } from '../config';
import { FileSystemService } from './services/fileSystem.service';
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

export class Server {

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
  }


  async start() {
    
    //* Middlewares
    this.app.use(fileUpload({
      limits: { fileSize: 5000 * 1024 * 1024 },
    }));
    this.app.use( express.json() ); // raw
    this.app.use( express.urlencoded({ extended: true }) ); // x-www-form-urlencoded
    this.app.use( cors() );

    
    //* Public Folder
    this.app.use( express.static( this.publicPath ) );

    //* Routes
    this.app.use( this.routes );

    //* SPA
 /*   this.app.get('*', (req, res) => {
      const indexPath = path.join( __dirname + `../../../${ this.publicPath }/index.html` );
      res.sendFile(indexPath);
    });*/
    
    this.serverListener = this.app.listen(this.port, () => {
      console.log(`Server running on port ${ this.port }`);
    });
    
    CronService.createJob(
      '3 16 * * *',
      () => {
        emailService.sendEmailWithFileSystemLogs( envs.MAILER_SOPORTE )
                    .then(() => new FileSystemService().deleteContentFromFile());
      }
    );
  }

  public close() {
    this.serverListener?.close();
  }

}