import { UsersService } from '.';
import { JwtAdapter, bcryptAdapter, envs } from '../../config';
import { UserModel } from '../../data';
import { CustomError, LoginUserDto, RegisterUserDto, UserEntity } from '../../domain';
import { EmailService } from './email.service';


export class AuthService {

  constructor(
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
  ) {}

  public async registerUser( registerUserDto: RegisterUserDto ) {

    const existUser = await UserModel.findOne({ email: registerUserDto.email });
    if ( existUser ) throw CustomError.badRequest('Email already exist');

    try {
      const user = new UserModel(registerUserDto);
      
      // Encriptar la contraseña
      user.password = bcryptAdapter.hash( registerUserDto.password );
      
      await user.save();

      // Email de confirmación
      await this.sendEmailValidationLink( user.email );

      const { password, ...userEntity } = UserEntity.fromObject(user);

      const token = await JwtAdapter.generateToken({ id: user.id });
      if ( !token ) throw CustomError.internalServer('Error while creating JWT');

      return { 
        user: userEntity, 
        token: token,
      };

    } catch (error) {
      throw CustomError.internalServer(`${ error }`);
    }

  }

  public async loginUser( loginUserDto: LoginUserDto ) {

    const user = await UserModel.findOne({ email: loginUserDto.email });
    if (!user) throw CustomError.badRequest('Email not exist');

    const isMatching = bcryptAdapter.compare( loginUserDto.password, user.password );
    if ( !isMatching ) throw CustomError.badRequest('Password is not valid');

    const { password, ...userEntity} = UserEntity.fromObject( user );
    
    const token = await JwtAdapter.generateToken({ id: user.id });
    if ( !token ) throw CustomError.internalServer('Error while creating JWT');

    return {
      user: userEntity,
      token: token,
    }

  }

  private sendEmailValidationLink = async( email: string ) => {

    const token = await JwtAdapter.generateToken({ email });
    if ( !token ) throw CustomError.internalServer('Error getting token');

    const link = `${ envs.WEBSERVICE_URL }/auth/validate-email/${ token }`;
    const html = `
      <h1>Validate your email</h1>
      <p>Click on the following link to validate your email</p>
      <a href="${ link }">Validate your email: ${ email }</a>
    `;

    const options = {
      to: email,
      subject: 'Validate your email',
      htmlBody: html,
    }

    const isSent = await this.emailService.sendEmail(options);
    if ( !isSent ) throw CustomError.internalServer('Error sending email');

    return true;
  }

  public sendEmailResetClave = async( email: string ) => {

    let user = await this.usersService.getUserByEmail(email, true);

    user.password = '123456';

    const html = `
      <h1>${ user.name}, aquí tienes tu nueva clave temporal</h1>
      <hr>
      <p><strong>Password: 123456</strong></p>
      <br>
      <hr>
      <p><strong>Recuerda, ésta clave es temporal. 
      Después de hacer login en la aplicación, debes cambiar tu clave secreta por una más segura.</strong></p>
    `;

    const options = {
      to: email,
      subject: 'Reset Password',
      htmlBody: html,
    }
    
    const [error, registerDto] = RegisterUserDto.modify(user);
    
    if(registerDto){
      await this.usersService.updateUser(registerDto);
    }

    const isSent = await this.emailService.sendEmail(options);
    if ( !isSent ) throw CustomError.internalServer('Error sending email');

    return true;
  }

  public validateEmail = async(token:string) => {

    const payload = await JwtAdapter.validateToken(token);
    if ( !payload ) throw CustomError.unauthorized('Invalid token');

    const { email } = payload as { email: string };
    if ( !email ) throw CustomError.internalServer('Email not in token');

    const user = await UserModel.findOne({ email });
    if ( !user ) throw CustomError.internalServer('Email not exists');

    user.emailValidated = true;
    await user.save();

    return true;
  }


}