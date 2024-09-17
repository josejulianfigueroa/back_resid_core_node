import { bcryptAdapter } from '../../config';
import { UserModel  } from '../../data';
import { CustomError, LogEntity, LogSeverityLevel, PaginationDto, RegisterUserDto } from '../../domain';
import { LoadImages } from '../../domain/interfaces/loadImages.interface';
import { FileSystemService } from './fileSystem.service';
import fs from 'fs';

export class UsersService {

  constructor(private readonly fileSystemService: FileSystemService) { }

  public async updateUser( userDto: RegisterUserDto) {

    try {
      // Encriptar la contraseña
      if(userDto.password && userDto.password !== ''){
        userDto.password = bcryptAdapter.hash( userDto.password );
      }
      
      //Comparando imagenes
      UserModel.findById( userDto.id )
      .then( userData => {

        if(userData){

           if(userData.img !== userDto.img && userData.img !== ''
              && userData.img !== null  && userData.img !== undefined
           ){
             //Eliminar Img Anterior
             const path =  `uploads/users/${userData.img}`;
     
             if ( fs.existsSync( path ) ) {
               fs.unlinkSync( path );
            }
     
           }
         }
      })

      const user = await UserModel.findByIdAndUpdate( userDto.id, userDto );

      if(user){
        this.fileSystemService.saveLog(
          new LogEntity({
          message: `Se ha actualizado con éxito el usuario: ${user.name} con data: ${JSON.stringify(user)}`, 
          level: LogSeverityLevel.info,
          origin: 'users.service.ts'
          }));

      return { 
        id: userDto.id,
        name: userDto.name,
        email: userDto.email,
        emailValidated: userDto.emailValidated,
        roles: userDto.role,
        telefono: userDto.telefono,
        img: userDto.img,
      };
    }
    } catch (error) {
      this.fileSystemService.saveLog(
        new LogEntity({
          message: `Ha ocurrido un error inesperado: ${error}, al actualizar usuario con data: ${ JSON.stringify(userDto)}`, 
          level: LogSeverityLevel.high,
          origin: 'users.service.ts'
        }));
      throw CustomError.internalServer(`${ error }`);
    }

  }

  async getUsers( paginationDto: PaginationDto ) {

    const { page, limit } = paginationDto;

    try {

      const [ total, users ] = await Promise.all( [
        UserModel.countDocuments(),
        UserModel.find()
          .skip( ( page - 1 ) * limit )
          .limit( limit )
      ] );

      return {
        page: page,
        limit: limit,
        total: total,
        next: `/api/users?page=${ ( page + 1 ) }&limit=${ limit }`,
        prev: (page - 1 > 0) ? `/api/users?page=${ ( page - 1 ) }&limit=${ limit }`: null,

        users: users.map( user => ( {
          id: user.id,
          name: user.name,
          email: user.email,
          emailValidated: user.emailValidated,
          roles: user.role,
          telefono: user.telefono,
          img: user.img,
        } ) )
      };

    } catch ( error ) {
      this.fileSystemService.saveLog(
        new LogEntity({
          message: `Ha ocurrido un error inesperado: ${error}, al obtener los usuarios`, 
          level: LogSeverityLevel.high,
          origin: 'users.service.ts'
        }));
      throw CustomError.internalServer( 'Internal Server Error' );
    }

  }
  async getUserByEmail( email: string, passwordFlag: boolean = false) {

    try {
      const user = await UserModel.findOne( { email: email} );
   
      if(user){
        if(passwordFlag){   
          return {
          id: user.id,
          name: user.name,
          email: user.email,
          emailValidated: user.emailValidated,
          roles: user.role,     
          telefono: user.telefono,
          img: user.img,
          password: user.password,
        };
      } else {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            emailValidated: user.emailValidated,
            roles: user.role,     
            telefono: user.telefono,
            img: user.img,
          };
        }
   
    } else {
      throw CustomError.badRequest( 'no record for this email user' );
    }
    } catch ( error ) {
      this.fileSystemService.saveLog(
        new LogEntity({
          message: `Ha ocurrido un error inesperado: ${error}, al obtener el usuario por email`, 
          level: LogSeverityLevel.high,
          origin: 'users.service.ts'
        }));
      throw CustomError.internalServer( 'Internal Server Error' );
    }
  }
 
}


