import { Request, Response } from 'express';
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from '../../domain';
import { AuthService } from '../services/auth.service';
import { JwtAdapter } from '../../config';
import { UserModel } from '../../data';


export class AuthController {

  constructor(
    public readonly authService: AuthService,
  ) {}

  private handleError = (error: unknown, res: Response ) => {
    if ( error instanceof CustomError ) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.log(`${ error }`);
    return res.status(500).json({ error: 'Internal server error' })
  } 

  resetClave = (req: Request, res: Response) => {
    const { email } = req.params;
    
    this.authService.sendEmailResetClave( email )
      .then( () => res.json('Password reset Ok') )
      .catch( error => this.handleError(error, res) );

      
  }

  registerUser = (req: Request, res: Response) => {
    const [error, registerDto] = RegisterUserDto.create(req.body);
    if ( error ) return res.status(400).json({error})


    this.authService.registerUser(registerDto!)
      .then( (user) => res.json(user) )
      .catch( error => this.handleError(error, res) );
      
  }

  loginUser = (req: Request, res: Response) => {

    const [error, loginUserDto] = LoginUserDto.create(req.body);
    if ( error ) return res.status(400).json({error})


    this.authService.loginUser(loginUserDto!)
      .then( (user) => res.json(user) )
      .catch( error => this.handleError(error, res) );
      
  }

  checkToken = (req: Request, res: Response) => {
      return res.json({
        user: {
          "id": req.body.user.id,
          "name": req.body.user.name,
          "email": req.body.user.email,
          "emailValidated": req.body.user.emailValidated,
          "role": req.body.user.role,
          "telefono": req.body.user.telefono,
          "img": req.body.user.img
      } ,
        token: req.header('Authorization')!.split(' ').at(1) || '',
      });
  }

  validateEmail = (req: Request, res: Response) => {
    const { token } = req.params;
    
    this.authService.validateEmail( token )
      .then( () => res.json('Email was validated properly') )
      .catch( error => this.handleError(error, res) );

  }
  
}