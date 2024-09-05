import fs from 'fs';
import { LogEntity, LogSeverityLevel } from '../../domain/entities/log.entity';


export class FileSystemService {

  logPath = 'logs/';
  allLogsPath    = 'logs/logs-info.log';
  mediumLogsPath = 'logs/logs-medium.log';
  highLogsPath   = 'logs/logs-high.log';

  constructor() {
    this.createLogsFiles();
  }

  private createLogsFiles = () => {
    if ( !fs.existsSync( this.logPath ) ) {
      fs.mkdirSync( this.logPath );
    }

    [
      this.allLogsPath,
      this.mediumLogsPath,
      this.highLogsPath,
    ].forEach( path => {
      if ( fs.existsSync( path ) ) return;

      fs.writeFileSync( path, '' );
    });
  }

  async saveLog( newLog: LogEntity ): Promise<void> {
    
    const logAsJson = `${ JSON.stringify(newLog) }\n`;

    fs.appendFileSync( this.allLogsPath, logAsJson );

    if ( newLog.level === LogSeverityLevel.info ) return;

    if ( newLog.level === LogSeverityLevel.medium ) {
      fs.appendFileSync( this.mediumLogsPath, logAsJson );
    } else { 
      fs.appendFileSync( this.highLogsPath, logAsJson );
    }

  }

  public deleteContentFromFile = () => {
          fs.writeFileSync( this.allLogsPath, '' );
          fs.writeFileSync( this.mediumLogsPath, '' );
          fs.writeFileSync( this.highLogsPath, '' );
  }

  private getLogsFromFile = ( path: string ): LogEntity[] => {
    const content = fs.readFileSync( path, 'utf-8' );
    const logs = content.split('\n').map(LogEntity.fromJson);
    return logs;
  }

  async getLogs( severityLevel: LogSeverityLevel ): Promise<LogEntity[]> {

    switch( severityLevel ) {
      case LogSeverityLevel.info:
        return this.getLogsFromFile(this.allLogsPath);
      
      case LogSeverityLevel.medium:
        return this.getLogsFromFile(this.mediumLogsPath);

      case LogSeverityLevel.high:
        return this.getLogsFromFile(this.highLogsPath);

      default:
        throw new Error(`${ severityLevel } not implemented`);
    }
  } 
}

