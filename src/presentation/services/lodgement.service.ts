import { LodgementModel, ReservationModel } from '../../data';
import { ImagesLodgementModel } from '../../data/mongo';
import { LodgementDto, CustomError, PaginationDto, LogEntity, LogSeverityLevel } from '../../domain';
import { LoadImages } from '../../domain/interfaces/loadImages.interface';
import { FileSystemService } from './fileSystem.service';
import fs from 'fs';

export class LodgementService {

  constructor(private readonly fileSystemService: FileSystemService) { }

  async deleteLodgement(id: string ) {
  
      const reservations = await ReservationModel.find({ lodgement: id});
      if(reservations){
        throw CustomError.internalServer( 'No se puede eliminar el hospedaje, éste se encuentra vinculado a una reservación' );
      }else{
        try {
        const lodgement = await LodgementModel.findByIdAndDelete(id);
        const imgLodge = await ImagesLodgementModel.deleteMany( {lodgement : id});
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
  
  async getImagesLodgementById( idLodgement: string ) {

    try {
      const imageslodgement = await ImagesLodgementModel.find( {lodgement: idLodgement} );
   
      if(imageslodgement){
        
      return { 
        imagesLodgement: imageslodgement.map( lodgeImg => ( {
          id: lodgeImg.id,
          img: lodgeImg.img,
          idLodgement: lodgeImg.lodgement
        } ) )
      };
    } else {
      throw CustomError.badRequest( 'no images for this idLodgement' );
    }
    } catch ( error ) {
      this.fileSystemService.saveLog(
        new LogEntity({
          message: `Ha ocurrido un error inesperado: ${error}, al intentar obtener imagenes del alojamineto con id: ${ idLodgement }`, 
          level: LogSeverityLevel.high,
          origin: 'lodgement.service.ts'
        }));
      throw CustomError.internalServer( 'Internal Server Error' );
    }
  }

  async loadImageLodgement( loadImages: LoadImages[], id: string ) {

    try {

   
    for(let i=0; i<loadImages.length; i++){
      const  filename =loadImages[i].fileName;

      const lodgementExists = await ImagesLodgementModel.findOne( { img: filename, lodgement: id  } );
      if ( lodgementExists ) throw CustomError.badRequest( 'Image Lodgement already exists' );
  
        const lodgementImage = new ImagesLodgementModel( {
          lodgement: id,
          img: filename
        } );
  
        await lodgementImage.save();
    };

     await LodgementModel.findByIdAndUpdate( id, {img: loadImages[0].fileName} );

      this.fileSystemService.saveLog(
        new LogEntity({
        message: `Se ha registrado con éxito la imagen del alojamiento con id: ${id} con data: ${JSON.stringify(loadImages)}`, 
        level: LogSeverityLevel.info,
        origin: 'lodgement.service.ts'
        }));

      return {
        idLodgement: id,
        images : loadImages
      };

    } catch ( error ) {
      this.fileSystemService.saveLog(
        new LogEntity({
          message: `Ha ocurrido un error inesperado: ${error}, al intentar cargar una imagen en el alojamiento con id ${id} con data: ${ JSON.stringify(loadImages)}`, 
          level: LogSeverityLevel.high,
          origin: 'lodgement.service.ts'
        }));
      throw CustomError.internalServer( `${ error }` );
    }

  }
  async deleteImgById(idImg: string ) {
    try {
      const imgLodge = await ImagesLodgementModel.findByIdAndDelete(idImg);
  
    if(imgLodge){

      const lodgement = await LodgementModel.findById( imgLodge.lodgement );

      if(lodgement?.img === imgLodge.img){
        const imgsLodge = await ImagesLodgementModel.find({ lodgement: lodgement.id});
        if(imgsLodge){
          await LodgementModel.findByIdAndUpdate( imgLodge.lodgement, { img : imgsLodge[0].img} );
        } else {
          await LodgementModel.findByIdAndUpdate( imgLodge.lodgement, { img : ''} );
        }

      }

      const path =  `uploads/lodgements/${imgLodge.img}`;

      if ( fs.existsSync( path ) ) {
        fs.unlinkSync( path );
     }

      this.fileSystemService.saveLog(
        new LogEntity({
        message: `Se ha eliminado con éxito la imagen del alojamiento con idImagen: ${idImg}}`, 
        level: LogSeverityLevel.info,
        origin: 'lodgement.service.ts'
        }));

    return {
      id: imgLodge.id,
      img: imgLodge.img,
      dateCreation: imgLodge.dateCreation
    };

  } else {
    throw CustomError.badRequest( 'delete image failed' );
  }
  } catch ( error ) {
    this.fileSystemService.saveLog(
      new LogEntity({
        message: `Ha ocurrido un error inesperado: ${error}, al intentar eliminar una imagen con id: ${ idImg }`, 
        level: LogSeverityLevel.high,
        origin: 'lodgement.service.ts'
      }));
    throw CustomError.internalServer( `${ error }` );
  }

}
}


