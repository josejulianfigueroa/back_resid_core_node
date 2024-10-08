import { Response, Request } from 'express';
import { LodgementDto, CustomError, PaginationDto } from '../../domain';
import { LodgementService } from '../services/lodgement.service';
import { LoadImages } from '../../domain/interfaces/loadImages.interface';

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

  updateLodgement = ( req: Request, res: Response ) => {
    const { id } = req.params;

    const [ error, updateLodgement ] = LodgementDto.create({ 
      ...req.body,
    });
    if ( error ) return res.status( 400 ).json( { error } );


    this.lodgementService.updateLodgement( updateLodgement!, id )
      .then( lodgement => res.status( 201 ).json( lodgement ) )
      .catch( error => this.handleError( error, res ) );

  };

  deleteLodgement = ( req: Request, res: Response ) => {
    const { id } = req.params;

    this.lodgementService.deleteLodgement( id )
      .then( lodgement => res.status( 201 ).json( lodgement ) )
      .catch( error => this.handleError( error, res ) );

  };

  
  deleteImgById = ( req: Request, res: Response ) => {
    const { id } = req.params;

    this.lodgementService.deleteImgById( id )
      .then( lodgement => res.status( 201 ).json( lodgement ) )
      .catch( error => this.handleError( error, res ) );

  };

  createLodgement = ( req: Request, res: Response ) => {

    const [ error, createProductDto ] = LodgementDto.create({ 
      ...req.body,
      user: req.body.user.id,
    });
    if ( error ) return res.status( 400 ).json( { error } );


    this.lodgementService.createLodgement( createProductDto! )
      .then( lodgement => res.status( 201 ).json( lodgement ) )
      .catch( error => this.handleError( error, res ) );

  };

  loadImagesLodgement = ( req: Request, res: Response ) => {
    const { id } = req.params;
    const loadImages: LoadImages[] = req.body.images;

   if(loadImages.length > 0 ){

    this.lodgementService.loadImageLodgement( loadImages, id )
      .then( lodgement => res.status( 201 ).json( lodgement ) )
      .catch( error => this.handleError( error, res ) );

   } else {
    return res.status( 400 ).json( 'No hay imagenes para cargar' );
   }

  };
  
  getLodgements = async ( req: Request, res: Response ) => {

    const { page = 1, limit = 10 } = req.query;
    const [ error, paginationDto ] = PaginationDto.create( +page, +limit );
    if ( error ) return res.status(400).json({ error });

    
    this.lodgementService.getLodgements( paginationDto! )
      .then( lodgements => res.json( lodgements ))
      .catch( error => this.handleError( error, res ) );

  };

  getImagesLodgementById = async ( req: Request, res: Response ) => {

    const { id } = req.params;

    this.lodgementService.getImagesLodgementById( id )
      .then( lodgements => res.json( lodgements ))
      .catch( error => this.handleError( error, res ) );

  };
}