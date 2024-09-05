import { UserModel  } from '../../data';
import { CustomError, PaginationDto } from '../../domain';


export class UsersService {

  constructor() { }

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

}


