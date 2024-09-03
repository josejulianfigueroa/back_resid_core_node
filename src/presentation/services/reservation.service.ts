import { ReservationModel  } from '../../data';
import { ReservationDto, CustomError, PaginationDto, UserEntity } from '../../domain';


export class ReservationService {

  constructor() { }

  async createReservation( reservationDto: ReservationDto, user: UserEntity ) {

    const reservationExists = await ReservationModel.findOne( { name: reservationDto.startDate } );
    if ( reservationExists ) throw CustomError.badRequest( 'Reservation already exists' );

    try {

      const reservation = new ReservationModel( {
        ...reservationDto,
        user: user.id,
      } );

      await reservation.save();


      return {
        id: reservation.id,
        name: reservation.startDate,
        available: reservation.endDate,
      };

    } catch ( error ) {
      throw CustomError.internalServer( `${ error }` );
    }

  }



  async getReservations( paginationDto: PaginationDto ) {

    const { page, limit } = paginationDto;


    try {

      const [ total, reservations ] = await Promise.all( [
        ReservationModel.countDocuments(),
        ReservationModel.find()
          .skip( ( page - 1 ) * limit )
          .limit( limit )
      ] );


      return {
        page: page,
        limit: limit,
        total: total,
        next: `/api/reservations?page=${ ( page + 1 ) }&limit=${ limit }`,
        prev: (page - 1 > 0) ? `/api/reservations?page=${ ( page - 1 ) }&limit=${ limit }`: null,

        categories: reservations.map( reservation => ( {
          id: reservation.id,
          startDate: reservation.startDate,
          endDate: reservation.endDate
        } ) )
      };

    } catch ( error ) {
      throw CustomError.internalServer( 'Internal Server Error' );
    }

  }

}


