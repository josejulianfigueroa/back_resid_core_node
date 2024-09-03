import { Response, Request } from 'express';
import { LodgementDto, CustomError, PaginationDto } from '../../domain';
import { LodgementService } from '../services/lodgement.service';


export class LodgementController {

  constructor(
    private readonly lodgementService: LodgementService,
  ) { }


  private handleError = ( error: unknown, res: Response ) => {
    if ( error instanceof CustomError ) {
      return res.status( error.statusCode ).json( { error: error.message } );
    }

    console.log( `${ error }` );
    return res.status( 500 ).json( { error: 'Internal server error' } );
  };


  createLodgement = ( req: Request, res: Response ) => {

    const [ error, createProductDto ] = LodgementDto.create({ 
      ...req.body,
      user: req.body.user.id,
    });
    if ( error ) return res.status( 400 ).json( { error } );


    this.lodgementService.createLodgement( createProductDto! )
      .then( category => res.status( 201 ).json( category ) )
      .catch( error => this.handleError( error, res ) );

  };

  getLodgements = async ( req: Request, res: Response ) => {

    const { page = 1, limit = 10 } = req.query;
    const [ error, paginationDto ] = PaginationDto.create( +page, +limit );
    if ( error ) return res.status(400).json({ error });

    
    this.lodgementService.getLodgements( paginationDto! )
      .then( products => res.json( products ))
      .catch( error => this.handleError( error, res ) );

  };


}