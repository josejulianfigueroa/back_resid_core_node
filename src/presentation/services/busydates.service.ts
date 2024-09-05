import { BusydatesModel  } from '../../data';
import { CustomError, PaginationDto } from '../../domain';


export class BusyDatesService {

  constructor() { }

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


