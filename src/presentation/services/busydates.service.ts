import { BusydatesModel  } from '../../data';
import { CustomError, LogEntity, LogSeverityLevel, PaginationDto } from '../../domain';
import { FileSystemService } from './fileSystem.service';
import { DateMongoMenorQ } from './reservation.service';
import moment from 'moment';

export class BusyDatesService {

  constructor(private readonly fileSystemService: FileSystemService) { }

  async deleteBusydateByMaintenance() {
    try {
      const dateMongo:DateMongoMenorQ = {$lt : new Date()}; // fechas menores a la fecha actual
      const obj = { date:  dateMongo };
      
      const busydates = await BusydatesModel.deleteMany( obj );
  
    if(busydates){

      this.fileSystemService.saveLog(
        new LogEntity({
        message: `Se ha generado el mantenimiento a la tabla busydates con éxito`, 
        level: LogSeverityLevel.info,
        origin: 'busydates.service.ts'
        }));

  } else {
    throw CustomError.badRequest( 'delete maintenance failed' );
  }
  } catch ( error ) {
    this.fileSystemService.saveLog(
      new LogEntity({
        message: `Ha ocurrido un error inesperado: ${error}, al querer dar mantenimiento a la tabla busydates`, 
        level: LogSeverityLevel.high,
        origin: 'busydates.service.ts'
      }));
    throw CustomError.internalServer( `${ error }` );
  }

}
  async getBusyDates( paginationDto: PaginationDto ) {

    const { page, limit } = paginationDto;

    try {
      const [ total, busyDates ] = await Promise.all( [
        BusydatesModel.countDocuments(),
        BusydatesModel.find()
          .skip( ( page - 1 ) * limit )
          .limit( limit )
      ] );


      return {
        page: page,
        limit: limit,
        total: total,
        next: `/api/busydates?page=${ ( page + 1 ) }&limit=${ limit }`,
        prev: (page - 1 > 0) ? `/api/busydates?page=${ ( page - 1 ) }&limit=${ limit }`: null,

        busydates: busyDates.map( busyDates => ( {
          date: busyDates.date,
        } ) )
      };

    } catch ( error ) {
      throw CustomError.internalServer( 'Internal Server Error' );
    }

  }

}


