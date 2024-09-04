import { Response, Request } from 'express';
import { ReservationDto, CustomError, PaginationDto } from '../../domain';
import { ReservationService } from '../services/reservation.service';


export class ReservationController {

  constructor(
    private readonly reservationService: ReservationService,
  ) { }


  private handleError = ( error: unknown, res: Response ) => {
    if ( error instanceof CustomError ) {
      return res.status( error.statusCode ).json( { error: error.message } );
    }

    console.log( `${ error }` );
    return res.status( 500 ).json( { error: 'Internal server error' } );
  };

  
  payReservation= ( req: Request, res: Response ) => {
    const { id: idReservation, monto } = req.params;
    let montoNumber: number = 0;
    if(monto){
      montoNumber = parseInt(monto);
    }
 
    this.reservationService.payReservation( idReservation, montoNumber, req.body.user)
      .then( reservation => res.status( 201 ).json( reservation ) )
      .catch( error => this.handleError( error, res ) );

  };

  changeStatusReservation= ( req: Request, res: Response ) => {
    const { id: idReservation, status } = req.params;

    this.reservationService.changeStatusReservation( idReservation,  status, req.body.user)
      .then( reservation => res.status( 201 ).json( reservation ) )
      .catch( error => this.handleError( error, res ) );

  };

  deleteReservation= ( req: Request, res: Response ) => {
    const { id } = req.params;

    this.reservationService.deleteReservation( id )
      .then( reservation => res.status( 201 ).json( reservation ) )
      .catch( error => this.handleError( error, res ) );

  };

  createReservation = ( req: Request, res: Response ) => {

    if(!req.body.lodgement){
      return res.status( 400 ).json( { error: 'Lodgement is required' } );
    }
    const [ error, reservationDto ] = ReservationDto.create( req.body );
    if ( error ) return res.status( 400 ).json( { error } );

    this.reservationService.createReservation( reservationDto!, req.body.user, req.body.lodgement )
      .then( reservation => res.status( 201 ).json( reservation ) )
      .catch( error => this.handleError( error, res ) );


  };

  getReservations = async ( req: Request, res: Response ) => {

    const { page = 1, limit = 10 } = req.query;
    const [ error, paginationDto ] = PaginationDto.create( +page, +limit );
    if ( error ) return res.status(400).json({ error });
    
    this.reservationService.getReservations( paginationDto! )
      .then( reservations => res.json( reservations ))
      .catch( error => this.handleError( error, res ) );

  };


}