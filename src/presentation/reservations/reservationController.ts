import { Response, Request } from 'express';
import { ReservationDto, CustomError, PaginationDto } from '../../domain';
import { ReservationService } from '../services/reservation.service';
import mongoose from 'mongoose';
import moment from 'moment';

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
    const { id: idReservation, monto, fecha } = req.params;
    let montoNumber: number = 0;
    if(monto){
      montoNumber = parseInt(monto);
    }
    this.reservationService.payReservation( idReservation, montoNumber,fecha, req.body.user)
      .then( reservation => res.status( 201 ).json( reservation ) )
      .catch( error => this.handleError( error, res ) );

  };

  getPayReservations = ( req: Request, res: Response ) => {
    let { page = 1, limit = 10 } = req.query;

    const [ error, paginationDto ] = PaginationDto.create( +page, +limit );

    if ( error ) return res.status(400).json({ error });

    if ( !paginationDto ) return res.status(400).json({ error });

    this.reservationService.getPayReservations( paginationDto)
      .then( reservationsPay => res.status( 201 ).json( reservationsPay ) )
      .catch( error => this.handleError( error, res ) );

  };

  changeStatusReservation= ( req: Request, res: Response ) => {
    const { id: idReservation, status } = req.params;

    this.reservationService.changeStatusReservation( idReservation,  status, req.body.user)
      .then( reservation => res.status( 201 ).json( reservation ) )
      .catch( error => this.handleError( error, res ) );

  };

  deletePay= ( req: Request, res: Response ) => {
    const { id } = req.params;

    this.reservationService.deletePay( id )
      .then( pay => res.status( 201 ).json( pay ) )
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

    let { page = 1, limit = 10, status = '', idUser = '', idLodgement = '', startDate = '', endDate = '' } = req.query;

    const [ error, paginationDto ] = PaginationDto.create( +page, +limit );

    if ( error ) return res.status(400).json({ error });

    if ( !paginationDto ) return res.status(400).json({ error });

    if ( status != '' ){
      const statusArray: string[] = ['CONFIRMADA','CANCELADA','PAGADA','ABONO'];

      const existeStatus = statusArray.find( (valor) => status === valor);
      if ( !existeStatus ) {
        return res.status( 400 ).json( { error: `El status ${ status } no está registrado` } );
      }
    } 
    if ( idUser != ''  ){
      const isOK = mongoose.isValidObjectId(idUser);
      if ( !isOK ) {
        return res.status( 400 ).json( { error: `El id ${ idUser } no es válido` } );
      }
    } 
    if ( idLodgement != ''  ){
      const isOK = mongoose.isValidObjectId(idLodgement);
      if ( !isOK ) {
        return res.status( 400 ).json( { error: `El id ${ idLodgement } no es válido` } );
      }
    } 

     if ( startDate  != ''  && (!moment(startDate.toString()).isValid() 
                                  || startDate.toString().length !== 10
                                  )) {
      return res.status( 400 ).json( { error: `startDate inválida` } );
     }
     if ( endDate != ''  && (!moment(endDate.toString()).isValid() 
                                  || endDate.toString().length !== 10
      )) {
      return res.status( 400 ).json( { error: `endtDate inválida` } );
     }
    
    this.reservationService.getReservations( paginationDto, status.toString(), idUser.toString(), idLodgement.toString(), startDate.toString(), endDate.toString() )
      .then( reservations => res.json( reservations ))
      .catch( error => this.handleError( error, res ) );

  };
}