import { regularExps } from '../../../config';


export class RegisterUserDto {

  private constructor(
    public name: string,
    public email: string,
    public password: string,
    public img?: string,
    public role?: string,
    public telefono?: string,
    public id?: string,
    public emailValidated?: string
  ) {}

  static create( object: { [key:string]:any } ): [string?, RegisterUserDto?] {
    const { name, email, password, img, role, telefono } = object;

    if ( !name ) return ['Missing name'];
    if ( !email ) return ['Missing email'];
    if ( !regularExps.email.test( email ) ) return ['Email is not valid'];
    if ( !password ) return ['Missing password'];
    if ( password.length < 6 ) return ['Password too short'];

    return [undefined, new RegisterUserDto(name, email, password, img, role, telefono)];

  }

  static modify( object: { [key:string]:any } ): [string?, RegisterUserDto?] {
    const { name, email, password, img, role, telefono, id, emailValidated } = object;

    if ( !name ) return ['Missing name'];
    if ( password ){
      if ( password.length < 6 ) return ['Password too short'];
    }

    return [undefined, new RegisterUserDto(name, email, password, img, role, telefono, id, emailValidated)];

  }


}