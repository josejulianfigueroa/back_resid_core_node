import mongoose, { mongo } from 'mongoose';
import { validationResult } from 'express-validator';
import { regularExps } from './regular-exp';
import { UserModel } from '../data';

export class Validators {

  static isMongoID( id: string ) {
    const isOK = mongoose.isValidObjectId(id);
    if ( !isOK ) {
      throw new Error(`El id ${ id } no es válido`);
  }
    return true;
  }

  static esRoleValido = (rol:string) => {

   const roles: string[] = ['ADMIN_ROLE','USER_ROLE'];

    const existeRol = roles.find( (valor) => rol === valor);
    if ( !existeRol ) {
        throw new Error(`El rol ${ rol } no está registrado`);
    }
    return true;
}
static esStatusValido = (status:string) => {

  const statusArray: string[] = ['CONFIRMADA','CANCELADA','PAGADA','ABONO'];

   const existeStatus = statusArray.find( (valor) => status === valor);
   if ( !existeStatus ) {
       throw new Error(`El status ${ status } no está registrado`);
   }
   return true;
}

static esNumero = (monto:string) => {
   if ( !Number(monto) ) {
       throw new Error(`Monto de pago: ${ monto } inválido`);
   }
   if ( Number(monto) <= 0) {
    throw new Error(`Monto de pago no puede ser negativo o cero`);
}
   return true;
}

static emailExiste = async( email = '' ) => {

  // Verificar si el correo existe
  const userExist = await UserModel.findOne( { email: email} );
  if ( !userExist ) {
      throw new Error(`El email: ${ email }, no existe en la base de datos`);
  }
}
static validarCampos = ( req:any, res:any, next:any ) => {

  const errors = validationResult(req);
  if( !errors.isEmpty() ){
      return res.status(400).json(errors);
  }

  next();
}

}