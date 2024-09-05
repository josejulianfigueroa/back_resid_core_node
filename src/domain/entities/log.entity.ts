import moment from 'moment';

export enum LogSeverityLevel {
  info = 'info',
  medium = 'medium',
  high = 'high',
}

export interface LogEntityOptions {
  level: LogSeverityLevel;
  message: string;
  origin: string;
  createdAt?: string;
}


export class LogEntity {

  public level: LogSeverityLevel; // Enum
  public message: string;
  public createdAt: string;
  public origin: string;

  constructor( options: LogEntityOptions ) {
    
    const { message, level, origin, createdAt = moment().format('DD-MM-YYYY').toString() } = options;
    this.message = message;
    this.level = level;
    this.createdAt = createdAt;
    this.origin = origin;
  }

  //"{ "level": "high", "message":"Hola Mundo", "createdAt":"128937TZ12378123" }"
  static fromJson = ( json: string ): LogEntity => {
    const { message, level, createdAt, origin } = JSON.parse( json );

    const log = new LogEntity({ 
      message,
      level,
      createdAt,
      origin,
    });

    return log;
  };

}
