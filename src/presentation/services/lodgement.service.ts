import { LodgementModel } from '../../data';
import { LodgementDto, CustomError, PaginationDto, LogEntity, LogSeverityLevel } from '../../domain';
import { FileSystemService } from './fileSystem.service';


export class LodgementService {

  constructor(private readonly fileSystemService: FileSystemService) { }

  async deleteLodgement(id: string ) {
    try {
      const lodgement = await LodgementModel.findByIdAndDelete(id);
  
    if(lodgement){

      this.fileSystemService.saveLog(
        new LogEntity({
        message: `Se ha eliminado con éxito el alojamiento con id: ${lodgement.name} con data: ${JSON.stringify(lodgement)}`, 
        level: LogSeverityLevel.info,
        origin: 'lodgement.service.ts'
        }));

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
    this.fileSystemService.saveLog(
      new LogEntity({
        message: `Ha ocurrido un error inesperado: ${error}, al querer eliminar un alojamiento con id: ${ id }`, 
        level: LogSeverityLevel.high,
        origin: 'lodgement.service.ts'
      }));
    throw CustomError.internalServer( `${ error }` );
  }

}

  async updateLodgement( createLodgementDto: LodgementDto, id: string ) {
    try {
    const lodgement = await LodgementModel.findByIdAndUpdate( id, createLodgementDto );
  
    if(lodgement){

      this.fileSystemService.saveLog(
        new LogEntity({
        message: `Se ha actualizado con éxito el alojamiento con id: ${lodgement.name} con data: ${JSON.stringify(lodgement)}`, 
        level: LogSeverityLevel.info,
        origin: 'lodgement.service.ts'
        }));

    return {
      id: id,
      name: createLodgementDto.name,
      description: createLodgementDto.description,
      location: createLodgementDto.location,
      activeStatus: createLodgementDto.activeStatus,
      cost: createLodgementDto.cost,
    };

  } else {
    throw CustomError.badRequest( 'update failed' );
  }
  } catch ( error ) {
    this.fileSystemService.saveLog(
      new LogEntity({
        message: `Ha ocurrido un error inesperado: ${error}, al querer actualizar un alojamiento con id: ${ id } y data: ${ JSON.stringify(createLodgementDto)}`, 
        level: LogSeverityLevel.high,
        origin: 'lodgement.service.ts'
      }));
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

      this.fileSystemService.saveLog(
        new LogEntity({
        message: `Se ha registrado con éxito el alojamiento con id: ${lodgement.name} con data: ${JSON.stringify(lodgement)}`, 
        level: LogSeverityLevel.info,
        origin: 'lodgement.service.ts'
        }));

      return {
        id: lodgement.id,
        name: lodgement.name,
        description: lodgement.description,
        location: lodgement.location,
        activeStatus: lodgement.activeStatus,
        cost: lodgement.cost,
      };

    } catch ( error ) {
      this.fileSystemService.saveLog(
        new LogEntity({
          message: `Ha ocurrido un error inesperado: ${error}, al querer crear un alojamiento con data: ${ JSON.stringify(createLodgementDto)}`, 
          level: LogSeverityLevel.high,
          origin: 'lodgement.service.ts'
        }));
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
          img: lodge.img
        } ) )
      };

    } catch ( error ) {
      this.fileSystemService.saveLog(
        new LogEntity({
          message: `Ha ocurrido un error inesperado: ${error}, al querer obtener los alojamientos`, 
          level: LogSeverityLevel.high,
          origin: 'lodgement.service.ts'
        }));
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
      this.fileSystemService.saveLog(
        new LogEntity({
          message: `Ha ocurrido un error inesperado: ${error}, al querer obtener el alojamineto con id: ${ idLodgement }`, 
          level: LogSeverityLevel.high,
          origin: 'lodgement.service.ts'
        }));
      throw CustomError.internalServer( 'Internal Server Error' );
    }
  }
  
}


