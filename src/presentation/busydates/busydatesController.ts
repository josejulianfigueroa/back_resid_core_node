import { Response, Request } from 'express';
import { CustomError, PaginationDto } from '../../domain';
import { BusyDatesService } from '../services/busydates.service';



export class BusyDatesController {

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



  getBusyDates = async ( req: Request, res: Response ) => {

    const { page = 1, limit = 10 } = req.query;
    const [ error, paginationDto ] = PaginationDto.create( +page, +limit );
    if ( error ) return res.status(400).json({ error });

    
    this.busyDatesService.getBusyDates( paginationDto! )
      .then( busydates => res.json( busydates ))
      .catch( error => this.handleError( error, res ) );

  };

  getStatistics = async ( req: Request, res: Response ) => {
    
    this.busyDatesService.getStatistics()
      .then( statistics => res.json( statistics ))
      .catch( error => this.handleError( error, res ) );

  };

  getStatisticsSales = async ( req: Request, res: Response ) => {
    
    this.busyDatesService.getStatisticsSales()
      .then( statistics => res.json( statistics ))
      .catch( error => this.handleError( error, res ) );

  };

}