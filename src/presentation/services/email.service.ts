import nodemailer, { Transporter } from 'nodemailer';
import moment from 'moment';
import { FileSystemService } from './fileSystem.service';
import { LogEntity, LogSeverityLevel } from '../../domain';


export interface SendMailOptions {
  to: string | string[];
  subject: string;
  htmlBody: string;
  attachements?: Attachement[];
}

export interface Attachement {
  filename: string;
  path: string;
}

export class EmailService {

  private transporter: Transporter;


  constructor(
    mailerService: string,
    mailerEmail: string,
    senderEmailPassword: string,
    private readonly postToProvider: boolean,
    private readonly fileSystemService: FileSystemService
  ) {

    this.transporter = nodemailer.createTransport( {
      service: mailerService,
      auth: {
        user: mailerEmail,
        pass: senderEmailPassword,
      }
    });
  }

  async sendEmail( options: SendMailOptions ): Promise<boolean> {

    const { to, subject, htmlBody, attachements = [] } = options;

    try {

      if ( !this.postToProvider ) return true;

       await this.transporter.sendMail( {
        to: to,
        subject: subject,
        html: htmlBody,
        attachments: attachements,
      });


      return true;
    } catch ( error ) {
      await this.fileSystemService.saveLog(
        new LogEntity({
        message: `Ha ocurrido un error: ${error}, al intentar enviar un email a: ${to}, con el asunto: ${subject} y html: ${htmlBody}`, 
        level: LogSeverityLevel.high,
        origin: 'email.service.ts'
        }));
      return false;
    }

  }

  async sendEmailWithFileSystemLogs( to: string | string[] ) {
    const subject = `Logs del servidor - Fecha: ${moment().format('DD-MM-YYYY').toString()}`;
    const htmlBody = `
    <h3>Logs - App Resid</h3>
    <br>
    <p>Se adjuntan archivos con información de Logs - Fecha: ${moment().format('DD-MM-YYYY').toString()}</p>
    `;

    const attachements:Attachement[] = [
      { filename: 'logs-info.log', path: './logs/logs-info.log' }, // Modo Info
      { filename: 'logs-high.log', path: './logs/logs-high.log' }, // Errores Inesperados
      { filename: 'logs-medium.log', path: './logs/logs-medium.log' }, // Errores Esperados
    ];

    return this.sendEmail({
      to, subject, attachements, htmlBody
    });
  }
}