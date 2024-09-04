import { LodgementModel } from '../../data';
import { LodgementDto, CustomError, PaginationDto } from '../../domain';


export class LodgementService {

  constructor() { }

  async deleteLodgement(id: string ) {
    try {
      const lodgement = await LodgementModel.findByIdAndDelete(id);
  
    if(lodgement){

    return {
      id: lodgement.id,
      name: lodgement.name,
      description: lodgement.description,
      location: lodgement.location,
      activeStatus: lodgement.activeStatus,
      cost: lodgement.cost,
    };

  } else {
    throw CustomError.badRequest( 'delete failed' );
  }
  } catch ( error ) {
    throw CustomError.internalServer( `${ error }` );
  }

}

  async updateLodgement( createLodgementDto: LodgementDto, id: string ) {
    try {
    const lodgement = await LodgementModel.findByIdAndUpdate( id, createLodgementDto );
  
    if(lodgement){

    return {
      id: lodgement.id,
      name: lodgement.name,
      description: lodgement.description,
      location: lodgement.location,
      activeStatus: lodgement.activeStatus,
      cost: lodgement.cost,
    };

  } else {
    throw CustomError.badRequest( 'update failed' );
  }
  } catch ( error ) {
    throw CustomError.internalServer( `${ error }` );
  }

}

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
        description: lodgement.description,
        cost: lodgement.cost,
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

        lodgements: lodgements.map( lodge => ( {
          id: lodge.id,
          name: lodge.name,
          description: lodge.description,
          activeStatus: lodge.activeStatus,
          cost: lodge.cost,
        } ) )
      };

    } catch ( error ) {
      throw CustomError.internalServer( 'Internal Server Error' );
    }
  }

  async getLodgementById( idLodgement: string ) {

    try {
      const lodgement = await LodgementModel.findById( idLodgement );
   
      if(lodgement){
        
      return {
          id: lodgement.id,
          name: lodgement.name,
          description: lodgement.description,
          location: lodgement.location,
          activeStatus: lodgement.activeStatus, 
          cost: lodgement.cost,
      };
    } else {
      throw CustomError.badRequest( 'no record for this idLodgement' );
    }
    } catch ( error ) {
      throw CustomError.internalServer( 'Internal Server Error' );
    }
  }
  
}


