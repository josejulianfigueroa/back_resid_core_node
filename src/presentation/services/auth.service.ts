import { UsersService } from '.';
import { JwtAdapter, bcryptAdapter, envs } from '../../config';
import { UserModel } from '../../data';
import { MensajeModel } from '../../data/mongo/models/mensajes.model';
import { CustomError, LogEntity, LoginUserDto, LogSeverityLevel, RegisterUserDto, UserEntity } from '../../domain';
import { EmailService } from './email.service';
import { FileSystemService } from './fileSystem.service';
import moment from 'moment';

export class AuthService {

  constructor(
    private readonly emailService: EmailService,
    private readonly usersService: UsersService,
    private readonly fileSystemService: FileSystemService
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

      this.fileSystemService.saveLog(
        new LogEntity({
        message: `Se ha registrado con éxito el usuario: ${user.name} con data: ${JSON.stringify(user)}`, 
        level: LogSeverityLevel.info,
        origin: 'auth.service.ts'
        }));

      return { 
        user: userEntity, 
        token: token,
      };

    } catch (error) {
      this.fileSystemService.saveLog(
        new LogEntity({
          message: `Ha ocurrido un error inesperado: ${error}, al registar usuario con data: ${ JSON.stringify(registerUserDto)}`, 
          level: LogSeverityLevel.high,
          origin: 'auth.service.ts'
        }));
      throw CustomError.internalServer(`${ error }`);
    }

  }

  public async loginUser( loginUserDto: LoginUserDto ) {

    const user = await UserModel.findOne({ email: loginUserDto.email });
    if (!user) throw CustomError.badRequest('Email not exist');

    const msg =  await MensajeModel.find();

    const isMatching = bcryptAdapter.compare( loginUserDto.password, user.password );
    if ( !isMatching ) throw CustomError.badRequest('Password is not valid');

    const { password, ...userEntity} = UserEntity.fromObject( user );
    
    const token = await JwtAdapter.generateToken({ id: user.id });
    if ( !token ) throw CustomError.internalServer('Error while creating JWT');

    const userMensajesJson: any =  
       {
      user: {id: userEntity.id,
      name: userEntity.name,
      email: userEntity.email,
      emailValidated: userEntity.emailValidated,
      role: userEntity.role,
      telefono: userEntity.telefono,
      img: userEntity.img,
      mensajes: null
      },
      token: token,
      };

      if(userMensajesJson){
          const msg =  await MensajeModel.find();
          userMensajesJson.user.mensajes = msg.map( msg => ({
            id: msg.id,
            msg: msg.msg,
            fechaRegistro: moment(msg.dateCreation).format('DD-MM-YYYY').toString()
          }))

      }
    return userMensajesJson;

  }

  private sendEmailValidationLink = async( email: string ) => {

      try{
    const token = await JwtAdapter.generateToken({ email });
    if ( !token ) throw CustomError.internalServer('Error getting token');

    const link = `${ envs.WEBSERVICE_URL }/auth/validate-email/${ token }`;
    const html = `
      <h1>Valida tu email</h1>
      <p>Click en el siguiente enlace para validar tu email</p>
      <a href="${ link }">Validar email: ${ email }</a>
    `;

    const options = {
      to: email,
      subject: 'Valida tu email',
      htmlBody: html,
    }

    const isSent = await this.emailService.sendEmail(options);
    if ( !isSent ) throw CustomError.internalServer('Error sending email');

  }catch (error) {
    this.fileSystemService.saveLog(
      new LogEntity({
        message: `Ha ocurrido un error inesperado: ${error}, al enviar email para la validación del correo con email: ${ JSON.stringify(email)}`, 
        level: LogSeverityLevel.high,
        origin: 'auth.service.ts'
      }));
  }
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
    
      try {
    
        const isSent = await this.emailService.sendEmail(options);
    
        if ( !isSent ) throw CustomError.internalServer('Error sending email');
    
      }catch (error) {
        this.fileSystemService.saveLog(
          new LogEntity({
            message: `Ha ocurrido un error inesperado: ${error}, al enviar email para el reset de la clave con data: ${ JSON.stringify(registerDto)}`, 
            level: LogSeverityLevel.high,
            origin: 'auth.service.ts'
          }));
      }
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