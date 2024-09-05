import { bcryptAdapter } from '../../config';
import { UserModel  } from '../../data';
import { CustomError, PaginationDto, RegisterUserDto } from '../../domain';


export class UsersService {

  constructor() { }

  public async updateUser( userDto: RegisterUserDto ) {

    try {
      // Encriptar la contraseña
      if(userDto.password && userDto.password !== ''){
        userDto.password = bcryptAdapter.hash( userDto.password );
      }
      
      const user = await UserModel.findByIdAndUpdate( userDto.id, userDto );

      if(user){
      return { 
        name: user.name,
        email: user.email,
        emailValidated: user.emailValidated,
        roles: user.role,
        telefono: user.telefono,
        img: user.img,
      };
    }
    } catch (error) {
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
          name: user.name,
          email: user.email,
          emailValidated: user.emailValidated,
          roles: user.role,
          telefono: user.telefono,
          img: user.img,
        } ) )
      };

    } catch ( error ) {
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
      throw CustomError.internalServer( 'Internal Server Error' );
    }
  }
  
}


