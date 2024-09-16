import { BusydatesModel, ReservationModel, UserModel  } from '../../data';
import { PagosModel, LodgementModel } from '../../data/mongo';
import { ReservationDto, CustomError, PaginationDto, UserEntity, LogEntity, LogSeverityLevel } from '../../domain';
import { LodgementService, EmailService } from './';
import moment from 'moment';
import { FileSystemService } from './fileSystem.service';
import { envs } from '../../config';


export class ReservationService {

  constructor(  private readonly lodgementService: LodgementService,
                private readonly emailService: EmailService,
                private readonly fileSystemService: FileSystemService
  ) { }

  async payReservation(idReservation: string, monto: number, user: UserEntity  ) {

    const reservation = await ReservationModel.findById( idReservation );
    if ( !reservation ) throw CustomError.badRequest( 'Reservation no exists' );
    if ( !reservation.costReservation ) throw CustomError.badRequest( 'Reservation have not a cost' );

    // Sumar el monto pagado a la reserva acumulado
    const pagos = await PagosModel.find({ reservation: idReservation });
    
    let suma: number = 0;
    pagos.forEach( pago => { if(pago.monto) suma += pago.monto });

    const sumaTotal: number = suma + monto;

    if( sumaTotal > reservation.costReservation) {
       await this.fileSystemService.saveLog(
        new LogEntity({
        message: `${user.name}, intento realializar un pago mayor al total de su reservación con id: ${idReservation}`, 
        level: LogSeverityLevel.medium,
        origin: 'reservation.service.ts'
        }));
      throw CustomError.badRequest( 'The total payments are greater than the reservation amount' );
    }else {
      const payModel = new PagosModel({ 
        fechaPago: new Date(),
        monto: monto,
        user: user.id,
        reservation: idReservation
      });
      await payModel.save();
    }
   
    if(sumaTotal === reservation.costReservation) {
      this.changeStatusReservation(idReservation, 'PAGADA', user, monto, sumaTotal);
    }else {
      this.changeStatusReservation(idReservation, 'ABONO', user, monto, sumaTotal);
    }
    
    // Se guarda log de Pago con exito
      await this.fileSystemService.saveLog(
            new LogEntity({
            message: `${user.name}, ha realizado un pago por ${monto.toLocaleString(["es-VE"])} Bs. en la reservación con id: ${idReservation}`, 
            level: LogSeverityLevel.info,
            origin: 'reservation.service.ts'
            }));

    return {
      fechaPago: moment().format('DD-MM-YYYY').toString(),
      monto: monto,
      user: user.id,
      reservation: idReservation
    };

  }
  async changeStatusReservation(idReservation: string, status: string, user: UserEntity, monto?: number, suma?: number) {
    
    const reservation = await ReservationModel.findById( idReservation );
    if ( !reservation ) throw CustomError.badRequest( 'Reservation no exists' );

    const costReservation = reservation.costReservation;

    reservation.status = status;
    reservation.save();

    await this.fileSystemService.saveLog(
      new LogEntity({
      message: `Ha cambiado el status a: ${status}, de la reservación con id: ${idReservation}`, 
      level: LogSeverityLevel.info,
      origin: 'reservation.service.ts'
      }));

    this.lodgementService.getLodgementById(reservation.lodgement.toString())
                    .then( lodge => { 
                       // Enviar email de confirmación al cliente con nuevo status
                       if(status.endsWith('CONFIRMADA') && costReservation){
                          this.sentEmailToClientStatusConfirmada(reservation.startDate.toString(),
                                                       reservation.endDate.toString(),
                                                       user,
                                                       lodge.name,
                                                       costReservation,
                                                       lodge.cost);
                       }
                       if(status.endsWith('CANCELADA') && costReservation){
                        this.deleteReservation(idReservation) 
                        this.sentEmailToClientStatusCancelada(reservation.startDate.toString(),
                                                     reservation.endDate.toString(),
                                                     user,
                                                     lodge.name,
                                                     costReservation,
                                                     lodge.cost);
                      }
                      if(status.endsWith('PAGADA') && monto && suma && costReservation){
                        this.sentEmailToClientStatusPagada(reservation.startDate.toString(),
                                                   reservation.endDate.toString(),
                                                   user,
                                                   lodge.name,
                                                   monto,
                                                   suma,
                                                   costReservation,
                                                   lodge.cost);
                      }
                      if(status.endsWith('ABONO') && monto && suma && costReservation){
                        this.sentEmailToClientStatusAbono(reservation.startDate.toString(),
                                                   reservation.endDate.toString(),
                                                   user,
                                                   lodge.name,
                                                   monto,
                                                   suma,
                                                   costReservation,
                                                   lodge.cost);
                      }
                      }).catch(error => {
                         this.fileSystemService.saveLog(
                          new LogEntity({
                          message: `Ha ocurrido un error inesperado: ${error}, al obtener el alojamiento en el cambio de status de la reservación con id: ${idReservation}`, 
                          level: LogSeverityLevel.high,
                          origin: 'reservation.service.ts'
                          }));
                      });

    return {
      id: reservation.id,
      startDate: reservation.startDate,
      endDate: reservation.endDate,
      status: reservation.status,
      user: reservation.user,
      lodgement: reservation.lodgement
    };

  }

  async deleteReservation(idReservation: string ) {
    try {

      const reservationExists = await ReservationModel.findById( idReservation );
      if ( !reservationExists ) throw CustomError.badRequest( 'Reservation no exists' );

      await BusydatesModel.deleteMany( {reservation: idReservation} );

      await PagosModel.deleteMany( {reservation: idReservation} );

      const reservation = await ReservationModel.findByIdAndDelete(idReservation);
  
    if(reservation){

      return {
        id: reservation.id,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        status: reservationExists.status,
        user: reservation.user,
        lodgement: reservation.lodgement
      };

  } else {
    throw CustomError.badRequest( 'delete failed' );
  }
  } catch ( error ) {
    this.fileSystemService.saveLog(
      new LogEntity({
      message: `Ha ocurrido un error inesperado: ${error}, al eliminar la reservación con id: ${idReservation}`, 
      level: LogSeverityLevel.high,
      origin: 'reservation.service.ts'
      }));
    throw CustomError.internalServer( `${ error }` );
  }

  }

  async createReservation( reservationDto: ReservationDto, user: UserEntity, idLodgement: string ) {

    const idLodgementExist = await LodgementModel.findById( idLodgement );
    if ( !idLodgementExist ) throw CustomError.badRequest( 'Lodgement no exists' );

    const reservationExists = await ReservationModel.findOne( { startDate: reservationDto.startDate ,
                                                                endDate: reservationDto.endDate,
                                                                lodgement: idLodgement
                                                                } );
    if ( reservationExists ) throw CustomError.badRequest( 'Reservation already exists' );

    try {

// Detemrinar cantidad de noches y verificar disponibilidad
const daysNight: number = moment(reservationDto.endDate).diff(moment(reservationDto.startDate), 'days');
let i: number = 0;

  for(i=0; i < daysNight; i++)
    {
      const dateToEvaluate = moment(reservationDto.startDate,'YYYY-MM-DD').add(i, 'days').format('YYYY-MM-DD').toString();
      const dateExist = await BusydatesModel.findOne( { date: dateToEvaluate,
                                                        lodgement: idLodgement
                                                       } );
     if ( dateExist ) throw CustomError.badRequest( 'No Availability' );

    }
    // Obtener el nombre del alojamiento para enviar email
    return this.lodgementService.getLodgementById(idLodgement)
                    .then( async lodge => { 
    // Crear la reserva en la tabla de reservaciones
    const reservation = new ReservationModel( {
      ...reservationDto,
      user: user.id,
      lodgement: idLodgement,
      costReservation: lodge.cost * daysNight,
      dateReservation: moment().format('YYYY-MM-DD').toString(),
    } );

    reservation.save();
// Insertar las fechas generadas en la tabla de ocupaciones busydates
    for(i=0; i < daysNight; i++)
      {
        const dateToEvaluate = moment(reservationDto.startDate,'YYYY-MM-DD').add(i, 'days').format('YYYY-MM-DD').toString();
  
     const busyDate = new BusydatesModel({ 
        date: dateToEvaluate,
        lodgement: idLodgement,
        reservation: reservation.id
      });

      busyDate.save();

      }

    // Enviar email de confirmación al cliente
    this.sentEmailToClient(reservationDto, user, lodge.name, lodge.cost, (lodge.cost * daysNight));
    // Enviar email de confirmación al Administrador
    this.sentEmailToAdmin(reservationDto, user, lodge.name );
    
    this.fileSystemService.saveLog(
      new LogEntity({
      message: `${user.name}, ha registrado con éxito la reservación con id: ${reservation.id} con data: ${JSON.stringify(reservationDto)}`, 
      level: LogSeverityLevel.info,
      origin: 'reservation.service.ts'
      }));

      const reservationNew = await ReservationModel.findById( reservation.id )
      .populate('user')
      .populate('lodgement');
       
    
        return {
            id: reservation.id,
            startDate: reservation.startDate,
            endDate: reservation.endDate,
            dateReservation: reservation.dateReservation,
            status: reservation.status,
            user: await UserModel.findById( reservation.user ),
            lodgement: await LodgementModel.findById( reservation.lodgement ),
            costReservation: reservation.costReservation
      }
         
                     } );

    } catch ( error ) {
      this.fileSystemService.saveLog(
        new LogEntity({
          message: `Ha ocurrido un error inesperado: ${error}, al registrar una reservación con el usuario: ${ user }, con datos de reserva: ${ JSON.stringify(reservationDto)}`, 
          level: LogSeverityLevel.high,
          origin: 'reservation.service.ts'
        }));
      throw CustomError.internalServer( `${ error }` );
    }

  }

  async getReservations( paginationDto: PaginationDto, status: string, idUser: string, idLodgement: string, startDate: string, endDate: string ) {

    const { page, limit } = paginationDto;

    let obj: BusquedaReservacion = {};
   
  if(status) {
    obj.status = status;
  }
  if(idLodgement) {
    obj.lodgement = idLodgement;
  }
  if(idUser) {
    obj.user = idUser;
  }
  if(startDate) {
    const dateMongo:DateMongoMayorQ = {$gte : new Date(moment(startDate,'YYYY-MM-DD').subtract(1, 'days').format('YYYY-MM-DD').toString()) };
    obj.startDate = dateMongo;
  }
  if(endDate) {
    const dateMongo:DateMongoMenorQ = {$lt : new Date(moment(endDate,'YYYY-MM-DD').add(1, 'days').format('YYYY-MM-DD').toString()) };
    obj.endDate = dateMongo;
  }

    try {

      const [ total, reservations ] = await Promise.all( [
        ReservationModel.countDocuments(),
        ReservationModel.find(obj)
          .populate("user")
          .populate("lodgement")
          .skip( ( page - 1 ) * limit )
          .limit( limit )
      ] );

      return {
        page: page,
        limit: limit,
        total: total,
        next: `/api/reservations?page=${ ( page + 1 ) }&limit=${ limit }`,
        prev: (page - 1 > 0) ? `/api/reservations?page=${ ( page - 1 ) }&limit=${ limit }`: null,

        reservations: reservations.map( reservation => ( {
          id: reservation.id,
          startDate: reservation.startDate,
          endDate: reservation.endDate,
          status: reservation.status,
          user: reservation.user,
          lodgement: reservation.lodgement,
          dateReservation: reservation.dateReservation,
          costReservation: reservation.costReservation
        } ) )
      };

    } catch ( error ) {
      this.fileSystemService.saveLog(
        new LogEntity({
          message: `Ha ocurrido un error inesperado: ${error}, al obtener datos de las reservaciones con los filtros: ${ JSON.stringify(obj) }`, 
          level: LogSeverityLevel.high,
          origin: 'reservation.service.ts'
        }));
      throw CustomError.internalServer( 'Internal Server Error' );
    }

  }




async sentEmailToClient(reservationDto: ReservationDto, user: UserEntity, nameLodgement: string, costLodge: number, costReservation: number) {
    const htmlClient = `
    <h1>Su reserva está en proceso de confirmación</h1>
    <div><hr><p>
    <strong>¡Gracias por tu Reserva! Bienvenido a Residencias el Cristo del Buen Viaje</strong>
    </p><p>Estimado/a: ${ user.name },</p>
    <p>¡Estamos encantados de darte la bienvenida!,
     Queremos agradecerte sinceramente por elegirnos para tu próxima estancia.</p>
     <p>Tu reserva está en proceso de confirmación y estamos emocionados de tener la oportunidad de ofrecerte
      una experiencia inolvidable. En Residencias El Cristo del Buen Viaje, nos esforzamos por brindarte el 
      mejor servicio posible y asegurarnos de que tu estadía sea cómoda y placentera.</p>
      <p>Aquí tienes los detalles de tu reserva:</p>
      <ul><li><strong>Fecha de Llegada:</strong> ${ moment(reservationDto.startDate,'YYYY-MM-DD').format('DD-MM-YYYY').toString() }</li>
      <li><strong>Fecha de Salida:</strong> ${ moment(reservationDto.endDate,'YYYY-MM-DD').format('DD-MM-YYYY').toString() }</li>
      <li><strong>Tipo de Hospedaje:</strong>: ${ nameLodgement }</li>
      <li><strong>Hora Check-in:</strong>: 14:00 horas</li>
      <li><strong>Hora Check-out:</strong>: 12:00 horas</li>
         <li><strong>Costo por Noche:</strong> ${ costLodge.toLocaleString(["es-VE"]) } Bs.</li>
     <li><strong>Costo Total de la Estadía:</strong> ${ costReservation.toLocaleString(["es-VE"]) } Bs.</li>
      </ul>
      <p>Si necesitas cualquier asistencia adicional o tienes solicitudes especiales, 
      no dudes en contactarnos antes de tu llegada. 
      Nuestro equipo está a tu disposición para asegurarse de que todo esté listo para tu llegada.</p>
      <p>Una vez más, gracias por elegirnos. Esperamos darte la bienvenida en persona y 
      hacer que tu estadía sea excepcional.</p>
      <p>¡Nos vemos pronto!</p>
      <p>Atentamente,</p>
      <p>Veruska Figueroa<br>Gerente de Operaciones<br>
      Residencias El Cristo del Buen Viaje<br>+58 412 3540572
      <br>${envs.MAILER_ADMIN_SITE}<br>
    <a href="${envs.SITE_NAME_URL}">www.residenciaselcristo.com</a>
      <br></p><hr></div>
  `;

  const optionsClient = {
    to: user.email,
    subject: `${user.name}, ¡Gracias por tu Reserva! Bienvenido a Residencias el Cristo del Buen Viaje`,
    htmlBody: htmlClient,
  }

  const isSentClient = await this.emailService.sendEmail(optionsClient);
  if ( !isSentClient ) throw CustomError.internalServer('Error sending email Client');
}
async sentEmailToClientStatusConfirmada(startDate:string, endDate:string,  user: UserEntity, nameLodgement: string, costReservation: number, costLodge: number) {
  const htmlClientStatus = `
  <h1>Enhorabuena ${ user.name }, su reserva ha sido confirmada con éxito</h1>
  <div><hr>
        <p><strong>Datos de la Reserva:</strong></p>
    <ul><li><strong>Fecha de Llegada:</strong> ${ moment(startDate,'YYYY-MM-DD').format('DD-MM-YYYY').toString() }</li>
    <li><strong>Fecha de Salida:</strong> ${ moment(endDate,'YYYY-MM-DD').format('DD-MM-YYYY').toString() }</li>
    <li><strong>Tipo de Hospedaje:</strong>: ${ nameLodgement }</li>
    <li><strong>Hora Check-in:</strong>: 14:00 horas</li>
    <li><strong>Hora Check-out:</strong>: 12:00 horas</li>
     <li><strong>Costo por Noche:</strong> ${ costLodge.toLocaleString(["es-VE"]) } Bs.</li>
     <li><strong>Costo Total de la Estadía:</strong> ${ costReservation.toLocaleString(["es-VE"]) } Bs.</li>
    </ul>
    <p>Si necesitas cualquier asistencia adicional o tienes solicitudes especiales, 
    no dudes en contactarnos antes de tu llegada. 
    Nuestro equipo está a tu disposición para asegurarse de que todo esté listo para tu llegada.</p>
    <p>Una vez más, gracias por elegirnos. Esperamos darte la bienvenida en persona y 
    hacer que tu estadía sea excepcional.</p>
    <p>¡Nos vemos pronto!</p>
    <p>Atentamente,</p>
    <p>Veruska Figueroa<br>Gerente de Operaciones<br>
    Residencias El Cristo del Buen Viaje<br>+58 412 3540572
    <br>${envs.MAILER_ADMIN_SITE}<br>
  <a href="${envs.SITE_NAME_URL}">www.residenciaselcristo.com</a>
    <br></p><hr></div>
`;

const optionsClientStatus = {
  to: user.email,
  subject: `${user.name}, su reserva ha sido confirmada`,
  htmlBody: htmlClientStatus,
}

const isSentClientStatus = await this.emailService.sendEmail(optionsClientStatus);
if ( !isSentClientStatus ) throw CustomError.internalServer('Error sending email Client Status');
}
async sentEmailToClientStatusCancelada(startDate:string, endDate:string,  user: UserEntity, nameLodgement: string, costReservation: number, costLodge: number) {
  const htmlClientStatus = `
  <h1> ${ user.name }, su reserva ha sido cancelada</h1>
  <div><hr>
     <p>Lamentamos informarle que por motivos de ocupación de nuestros alojamientos nos hemos
      quedado sin disponibilidad para las fechas indicadas en su reservación.</p>
  <br>
    <p><strong>Datos de la Reserva:</strong></p>
    <ul><li><strong>Fecha de Llegada:</strong> ${ moment(startDate,'YYYY-MM-DD').format('DD-MM-YYYY').toString() }</li>
    <li><strong>Fecha de Salida:</strong> ${ moment(endDate,'YYYY-MM-DD').format('DD-MM-YYYY').toString() }</li>
    <li><strong>Tipo de Hospedaje:</strong>: ${ nameLodgement }</li>
    <li><strong>Hora Check-in:</strong>: 14:00 horas</li>
    <li><strong>Hora Check-out:</strong>: 12:00 horas</li>
      <li><strong>Costo por Noche:</strong> ${ costLodge.toLocaleString(["es-VE"]) } Bs.</li>
     <li><strong>Costo Total de la Estadía:</strong> ${ costReservation.toLocaleString(["es-VE"]) } Bs.</li>
    </ul>
    <p>Si áun lo desea, lo invitamos a realizar una nueva reservación en nuestra página web</p>
    <p>Atentamente,</p>
    <p>Veruska Figueroa<br>Gerente de Operaciones<br>
    Residencias El Cristo del Buen Viaje<br>+58 412 3540572
    <br>${envs.MAILER_ADMIN_SITE}<br>
  <a href="${envs.SITE_NAME_URL}">www.residenciaselcristo.com</a>
    <br></p><hr></div>
`;

const optionsClientStatus = {
  to: user.email,
  subject: `${user.name}, su reserva ha sido cancelada`,
  htmlBody: htmlClientStatus,
}

const isSentClientStatus = await this.emailService.sendEmail(optionsClientStatus);
if ( !isSentClientStatus ) throw CustomError.internalServer('Error sending email Client Status');
}
async sentEmailToClientStatusPagada(startDate:string,
                                    endDate:string,
                                    user: UserEntity, 
                                    nameLodgement:string,
                                    monto: number,
                                    suma: number,
                                    costReservation: number,
                                    costLodge: number) {
  const htmlClientStatus = `
  <h1> ${ user.name }, se ha registrado el pago total de tu reservación</h1>
  <div><hr>
       <p><strong>Detalle del Pago:</strong></p>
    <ul><li><strong>Fecha:</strong> ${ moment().format('DD-MM-YYYY').toString() }</li>
    <li><strong>Monto:</strong> ${ monto.toLocaleString(["es-VE"]) } Bs.</li></ul>
<br>
          <p><strong>Estado del Pago:</strong></p>
    <ul>
      <li><strong>Estado de la Reserva: </strong>PAGADA</li>
    <li><strong>Total Pagado a la fecha:</strong> ${ suma.toLocaleString(["es-VE"]) } Bs.</li>
      <li><strong>Costo por Noche:</strong> ${ costLodge.toLocaleString(["es-VE"]) } Bs.</li>
     <li><strong>Costo Total de la Estadía:</strong> ${ costReservation.toLocaleString(["es-VE"]) } Bs.</li> </ul>
<br>
     <p><strong>Datos de la Reserva:</strong></p>
    <ul><li><strong>Fecha de Llegada:</strong> ${ moment(startDate,'YYYY-MM-DD').format('DD-MM-YYYY').toString() }</li>
    <li><strong>Fecha de Salida:</strong> ${ moment(endDate,'YYYY-MM-DD').format('DD-MM-YYYY').toString() }</li>
    <li><strong>Tipo de Hospedaje:</strong>: ${ nameLodgement }</li>
    <li><strong>Hora Check-in:</strong>: 14:00 horas</li>
    <li><strong>Hora Check-out:</strong>: 12:00 horas</li>
    </ul>
    <br>
    <p>Veruska Figueroa<br>Gerente de Operaciones<br>
    Residencias El Cristo del Buen Viaje<br>+58 412 3540572
    <br>${envs.MAILER_ADMIN_SITE}<br>
  <a href="${envs.SITE_NAME_URL}">www.residenciaselcristo.com</a>
    <br></p><hr></div>
`;

const optionsClientStatus = {
  to: user.email,
  subject: `${user.name}, has pagado el total de tu reserva `,
  htmlBody: htmlClientStatus,
}

const isSentClientStatus = await this.emailService.sendEmail(optionsClientStatus);
if ( !isSentClientStatus ) throw CustomError.internalServer('Error sending email Client Status');
}
async sentEmailToClientStatusAbono(startDate:string,
                                  endDate:string, 
                                  user: UserEntity,
                                  nameLodgement: string,
                                  monto: number,
                                  suma: number,
                                  costReservation: number,
                                  costLodge: number  ) {

  const htmlClientStatus = `
  <h1> ${ user.name }, se ha registrado un abono parcial del total de tu reservación</h1>
  <div><hr>
         <p><strong>Detalle del Abono:</strong></p>
    <ul><li><strong>Fecha:</strong> ${ moment().format('DD-MM-YYYY').toString() }</li>
    <li><strong>Monto:</strong> ${ monto.toLocaleString(["es-VE"]) } Bs.</li></ul>
<br>
          <p><strong>Estado del Pago:</strong></p>
    <ul>
      <li><strong>Modalidad de Pago: </strong>PARCIAL</li>
    <li><strong>Total Pagado a la fecha:</strong> ${ suma.toLocaleString(["es-VE"]) } Bs.</li>
      <li><strong>Costo por Noche:</strong> ${ costLodge.toLocaleString(["es-VE"]) } Bs.</li>
     <li><strong>Costo Total de la Estadía:</strong> ${ costReservation.toLocaleString(["es-VE"]) } Bs.</li> </ul>
<br>

    <p><strong>Datos de la Reserva:</strong></p>
    <ul><li><strong>Fecha de Llegada:</strong> ${ moment(startDate,'YYYY-MM-DD').format('DD-MM-YYYY').toString() }</li>
    <li><strong>Fecha de Salida:</strong> ${ moment(endDate,'YYYY-MM-DD').format('DD-MM-YYYY').toString() }</li>
    <li><strong>Tipo de Hospedaje:</strong>: ${ nameLodgement }</li>
    <li><strong>Hora Check-in:</strong>: 14:00 horas</li>
    <li><strong>Hora Check-out:</strong>: 12:00 horas</li>
    </ul><br>
    <p>Veruska Figueroa<br>Gerente de Operaciones<br>
    Residencias El Cristo del Buen Viaje<br>+58 412 3540572
    <br>${envs.MAILER_ADMIN_SITE}<br>
  <a href="${envs.SITE_NAME_URL}">www.residenciaselcristo.com</a>
    <br></p><hr></div>
`;

const optionsClientStatus = {
  to: user.email,
  subject: `${user.name}, Pago Registrado`,
  htmlBody: htmlClientStatus,
}

const isSentClientStatus = await this.emailService.sendEmail(optionsClientStatus);
if ( !isSentClientStatus ) throw CustomError.internalServer('Error sending email Client Status');
}
async sentEmailToAdmin(reservationDto: ReservationDto, user: UserEntity, nameLodgement: string ) {
    const htmlAdmin = `
  <h1>El cliente ${ user.name } ha realizado una reserva</h1>
  <div><hr><p>
  <strong>Enhorabuena, han realizado una solicitud para reservar el Alojamiento: ${ nameLodgement } </strong>
  </p>   <p><strong>Datos de la Reserva:</strong></p>
    <ul><li><strong>Fecha de Llegada:</strong> ${ moment(reservationDto.startDate,'YYYY-MM-DD').format('DD-MM-YYYY').toString() }</li>
    <li><strong>Fecha de Salida:</strong> ${ moment(reservationDto.endDate,'YYYY-MM-DD').format('DD-MM-YYYY').toString() }</li>
    <li><strong>Hospedaje:</strong> ${ nameLodgement }</li>
    </ul>
    <p>Veruska Figueroa<br>Gerente de Operaciones<br>
    Residencias El Cristo del Buen Viaje<br>+58 412 3540572
    <br>${envs.MAILER_ADMIN_SITE}<br>
  <a href="${envs.SITE_NAME_URL}">www.residenciaselcristo.com</a>
    <br></p><hr></div>
`;

const optionsAdmin = {
  to: `${envs.MAILER_ADMIN_SITE}`,
  subject: 'Nueva Reserva en Residencias el Cristo del Buen Viaje',
  htmlBody: htmlAdmin,
}

const isSentAdmin = await this.emailService.sendEmail(optionsAdmin);
if ( !isSentAdmin ) throw CustomError.internalServer('Error sending email Admin');
}

}

export interface BusquedaReservacion {
    lodgement?: string;
    user?: string;
    startDate?: DateMongoMayorQ;
    endDate?: DateMongoMenorQ;
    status?:string;
}

export interface DateMongoMayorQ {
  $gte: Date;
}
export interface DateMongoMenorQ {
  $lt: Date;
}