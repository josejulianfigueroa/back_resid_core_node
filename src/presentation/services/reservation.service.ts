import { ReservationModel  } from '../../data';
import { ReservationDto, CustomError, PaginationDto, UserEntity } from '../../domain';


export class ReservationService {

  constructor() { }

  
  async deleteReservation(id: string ) {
    try {
      const reservation = await ReservationModel.findByIdAndDelete(id);
  
    if(reservation){

      return {
        id: reservation.id,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        user: reservation.user,
        lodgement: reservation.lodgement
      };

  } else {
    throw CustomError.badRequest( 'delete failed' );
  }
  } catch ( error ) {
    throw CustomError.internalServer( `${ error }` );
  }

}

  async updateReservation( createReservationtDto: ReservationDto, id: string ) {
    try {
    const reservation = await ReservationModel.findByIdAndUpdate( id, createReservationtDto );
  
    if(reservation){

      return {
        id: reservation.id,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        user: reservation.user,
        lodgement: reservation.lodgement
      };

  } else {
    throw CustomError.badRequest( 'update failed' );
  }
  } catch ( error ) {
    throw CustomError.internalServer( `${ error }` );
  }

}
  async createReservation( reservationDto: ReservationDto, user: UserEntity, idLodgement: string ) {

    const reservationExists = await ReservationModel.findOne( { startDate: reservationDto.startDate ,
                                                                endDate: reservationDto.endDate 
                                                                } );
    if ( reservationExists ) throw CustomError.badRequest( 'Reservation already exists' );

    try {

      const reservation = new ReservationModel( {
        ...reservationDto,
        user: user.id,
        lodgement: idLodgement
      } );

      await reservation.save();

      return {
        id: reservation.id,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        user: reservation.user,
        lodgement: reservation.lodgement,
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

        reservations: reservations.map( reservation => ( {
          id: reservation.id,
          startDate: reservation.startDate,
          endDate: reservation.endDate,
          user: reservation.user,
          lodgement: reservation.lodgement,
        } ) )
      };

    } catch ( error ) {
      throw CustomError.internalServer( 'Internal Server Error' );
    }

  }

}


