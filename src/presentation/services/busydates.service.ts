import { BusydatesModel  } from '../../data';
import { BusyDatesDto, CustomError, PaginationDto, UserEntity } from '../../domain';


export class BusyDatesService {

  constructor() { }

  async createBusyDate( busyDatesDto: BusyDatesDto ) {

    const busyDateExists = await BusydatesModel.findOne( { name: busyDatesDto.date } );
    if ( busyDateExists ) throw CustomError.badRequest( 'Date already exists' );

    try {

      const busyDates = new BusydatesModel( {
        ...busyDatesDto,
      } );

      await busyDates.save();


      return {
        date: busyDates.date,
      };

    } catch ( error ) {
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
        next: `/api/reservations?page=${ ( page + 1 ) }&limit=${ limit }`,
        prev: (page - 1 > 0) ? `/api/reservations?page=${ ( page - 1 ) }&limit=${ limit }`: null,

        categories: busyDates.map( busyDates => ( {
          date: busyDates.date,
        } ) )
      };

    } catch ( error ) {
      throw CustomError.internalServer( 'Internal Server Error' );
    }

  }

}


