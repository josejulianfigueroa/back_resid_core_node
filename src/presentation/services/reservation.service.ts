import { BusydatesModel, ReservationModel  } from '../../data';
import { ReservationDto, CustomError, PaginationDto, UserEntity } from '../../domain';
import moment from 'moment';

export class ReservationService {

  constructor() { }

  
  async deleteReservation(id: string ) {
    try {
      await BusydatesModel.deleteMany( {reservation: id} );

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

  async createReservation( reservationDto: ReservationDto, user: UserEntity, idLodgement: string ) {

    const reservationExists = await ReservationModel.findOne( { startDate: reservationDto.startDate ,
                                                                endDate: reservationDto.endDate,
                                                                lodgement: idLodgement
                                                                } );
    if ( reservationExists ) throw CustomError.badRequest( 'Reservation already exists' );

    try {

// Detemrinar cantidad de noches y verificar disponibilidad
const daysNight: number = moment(reservationDto.endDate).diff(moment(reservationDto.startDate), 'days');
let i: number = 0;

  for(i=0; i < daysNight; i++)
    {
      const dateToEvaluate = moment(reservationDto.startDate,'YYYY-MM-DD').add(i, 'days').format('YYYY-MM-DD').toString();
      const dateExist = await BusydatesModel.findOne( { date: dateToEvaluate,
                                                        lodgement: idLodgement
                                                       } );
     if ( dateExist ) throw CustomError.badRequest( 'No Availability' );

    }

    // Crear la reserva en la tabla de reservaciones
    const reservation = new ReservationModel( {
      ...reservationDto,
      user: user.id,
      lodgement: idLodgement
    } );

    await reservation.save();

// Insertar las fechas generadas en la tabla de ocupaciones busydates
    for(i=0; i < daysNight; i++)
      {
        const dateToEvaluate = moment(reservationDto.startDate,'YYYY-MM-DD').add(i, 'days').format('YYYY-MM-DD').toString();
  
     const busyDate = new BusydatesModel({ 
        date: dateToEvaluate,
        lodgement: idLodgement,
        reservation: reservation.id
      });

      await busyDate.save();
  
      }

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


