import { Response, Request } from 'express';
import { CustomError, PaginationDto, RegisterUserDto } from '../../domain';
import { UsersService } from '../services/users.service';
import { LoadImages } from '../../domain/interfaces/loadImages.interface';


export class UserController {

  constructor(
    private readonly usersService: UsersService,
  ) { }


  private handleError = ( error: unknown, res: Response ) => {
    if ( error instanceof CustomError ) {
      return res.status( error.statusCode ).json( { error: error.message } );
    }

    console.log( `${ error }` );
    return res.status( 500 ).json( { error: 'Internal server error' } );
  };



  getUsers = async ( req: Request, res: Response ) => {

    const { page = 1, limit = 10 } = req.query;
    const [ error, paginationDto ] = PaginationDto.create( +page, +limit );
    if ( error ) return res.status(400).json({ error });

    
    this.usersService.getUsers( paginationDto! )
      .then( users => res.json( users ))
      .catch( error => this.handleError( error, res ) );

  };
  updateUser = ( req: Request, res: Response ) => {
    const { id } = req.params;

    const [ error, updateUser ] = RegisterUserDto.modify({ 
      ...req.body,
    });
    if ( error ) return res.status( 400 ).json( { error } );


    this.usersService.updateUser( updateUser! )
      .then( user => res.status( 201 ).json( user ) )
      .catch( error => this.handleError( error, res ) );

  };
}