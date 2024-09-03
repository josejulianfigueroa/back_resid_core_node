import { Response, Request } from 'express';
import { BusyDatesDto, CustomError, PaginationDto } from '../../domain';
import { BusyDatesService } from '../services/busydates.service';




export class BusyDatesController {

  // DI
  constructor(
    private readonly busyDatesService: BusyDatesService,
  ) { }


  private handleError = ( error: unknown, res: Response ) => {
    if ( error instanceof CustomError ) {
      return res.status( error.statusCode ).json( { error: error.message } );
    }

    console.log( `${ error }` );
    return res.status( 500 ).json( { error: 'Internal server error' } );
  };


  createBusyDate = ( req: Request, res: Response ) => {

    const [ error, create ] = BusyDatesDto.create({ 
      ...req.body,
      user: req.body.user.id,
    });
    if ( error ) return res.status( 400 ).json( { error } );

if(create) {
  this.busyDatesService.createBusyDate( create )
  .then( category => res.status( 201 ).json( category ) )
  .catch( error => this.handleError( error, res ) );
}

  };

  getBusyDates = async ( req: Request, res: Response ) => {

    const { page = 1, limit = 10 } = req.query;
    const [ error, paginationDto ] = PaginationDto.create( +page, +limit );
    if ( error ) return res.status(400).json({ error });

    
    this.busyDatesService.getBusyDates( paginationDto! )
      .then( products => res.json( products ))
      .catch( error => this.handleError( error, res ) );

  };


}