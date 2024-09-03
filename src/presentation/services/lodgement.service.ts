import { LodgementModel } from '../../data';
import { LodgementDto, CustomError, PaginationDto } from '../../domain';


export class LodgementService {

  constructor() { }

  async createLodgement( createLodgementDto: LodgementDto ) {

    const lodgementExists = await LodgementModel.findOne( { name: createLodgementDto.name } );
    if ( lodgementExists ) throw CustomError.badRequest( 'Lodgement already exists' );

    try {

      const lodgement = new LodgementModel( {
        ...createLodgementDto
      } );

      await lodgement.save();

      return {
        id: lodgement.id,
        name: lodgement.name,
        available: lodgement.description,
      };

    } catch ( error ) {
      throw CustomError.internalServer( `${ error }` );
    }

  }


  async getLodgements( paginationDto: PaginationDto ) {

    const { page, limit } = paginationDto;

    try {

      const [ total, lodgements ] = await Promise.all( [
        LodgementModel.countDocuments(),
        LodgementModel.find()
          .skip( ( page - 1 ) * limit )
          .limit( limit )
      ] );

      return {
        page: page,
        limit: limit,
        total: total,
        next: `/api/lodgements?page=${ ( page + 1 ) }&limit=${ limit }`,
        prev: (page - 1 > 0) ? `/api/lodgements?page=${ ( page - 1 ) }&limit=${ limit }`: null,

        categories: lodgements.map( lodge => ( {
          id: lodge.id,
          name: lodge.name,
          available: lodge.description,
        } ) )
      };

    } catch ( error ) {
      throw CustomError.internalServer( 'Internal Server Error' );
    }
  }
}


