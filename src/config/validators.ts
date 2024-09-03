import mongoose, { mongo } from 'mongoose';


export class Validators {

  static isMongoID( id: string ) {
    return mongoose.isValidObjectId(id);
  }

  static esRoleValido = (rol:string) => {

   const roles: string[] = ['ADMIN_ROLE','USER_ROLE'];

    const existeRol = roles.find( (valor) => rol === valor);
    if ( !existeRol ) {
        throw new Error(`El rol ${ rol } no está registrado`);
    }
}
}