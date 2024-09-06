import { envs } from '../../config';
import { BusydatesModel, LodgementModel, ReservationModel, UserModel } from '../../data';
import fs from 'fs';
import moment from 'moment';
import { PagosModel } from '../../data/mongo';


export class BackupAndRestoreMongo {

    backupPath = 'backup/'

    backupLodgementsPath = `backup/backupLodgements_${moment().format('DD-MM-YYYY').toString()}.json`;
    backupLodgementsPathDayBefore = `backup/backupLodgements_${moment().subtract(1, 'days').format('DD-MM-YYYY').toString()}.json`;

    backupBusydatesPath = `backup/backupBusydates_${moment().format('DD-MM-YYYY').toString()}.json`;
    backupBusydatesPathDayBefore = `backup/backupBusyDates_${moment().subtract(1, 'days').format('DD-MM-YYYY').toString()}.json`;

    backupPagosPath = `backup/backupPagos_${moment().format('DD-MM-YYYY').toString()}.json`;
    backupPagosPathDayBefore = `backup/backupPagos_${moment().subtract(1, 'days').format('DD-MM-YYYY').toString()}.json`;

    backupReservationsPath = `backup/backupReservations_${moment().format('DD-MM-YYYY').toString()}.json`;
    backupReservationsPathDayBefore = `backup/backupReservations_${moment().subtract(1, 'days').format('DD-MM-YYYY').toString()}.json`;

    backupUsersPath = `backup/backupUsers_${moment().format('DD-MM-YYYY').toString()}.json`;
    backupUsersPathDayBefore = `backup/backupUsers_${moment().subtract(1, 'days').format('DD-MM-YYYY').toString()}.json`;


    constructor() {
        this.createLogsFiles();
      }
    
      private createLogsFiles = () => {
        if ( !fs.existsSync( this.backupPath ) ) {
          fs.mkdirSync( this.backupPath );
        }
    
        [
          this.backupLodgementsPath,
          this.backupBusydatesPath,
          this.backupReservationsPath,
          this.backupUsersPath,
          this.backupPagosPath
        ].forEach( path => {
          if ( fs.existsSync( path ) ) return;
    
          fs.writeFileSync( path, '' );
        });
      }

    async backupMongoDB(): Promise<void> {
    
    if (fs.readFileSync( this.backupLodgementsPath, 'utf-8' ).toString().length <= 0) {
    
    const lodgements = await LodgementModel.find();     
  
     const lodgementsEntity = lodgements.map( lodge => ( {
      _id: { $oid: lodge.id },
      name: lodge.name,
      description: lodge.description,
      cost: lodge.cost,
      activeStatus: lodge.activeStatus,
      __v : 0,
      location: lodge.location,
    }));

    const objAsJsonLodge = `${ JSON.stringify(lodgementsEntity) }\n`;
    
    fs.appendFileSync( this.backupLodgementsPath, objAsJsonLodge );
    
      if ( fs.existsSync( this.backupLodgementsPathDayBefore ) ) {
        fs.unlinkSync( this.backupLodgementsPathDayBefore );
        }
      }

      if (fs.readFileSync( this.backupReservationsPath, 'utf-8' ).toString().length <= 0) {

        const reservations = await ReservationModel.find();

        const reservationsEntity = reservations.map( r => ( {
          _id: { $oid: r.id },
          startDate: { $date: r.startDate },
          endDate: { $date: r.endDate },
          customerObservations: r.customerObservations,
          reasonRejection: r.reasonRejection,
          status: r.status,
          costReservation: r.costReservation,
          user: { $oid: r.user },
          lodgement: { $oid: r.lodgement },
          __v : 0,
        }));

        const objAsJsonReservation = `${ JSON.stringify(reservationsEntity) }\n`;

        fs.appendFileSync( this.backupReservationsPath, objAsJsonReservation );

        if ( fs.existsSync( this.backupReservationsPathDayBefore ) ) {
          fs.unlinkSync( this.backupReservationsPathDayBefore );
       }
      }
      if (fs.readFileSync( this.backupBusydatesPath, 'utf-8' ).toString().length <= 0) {

        const busydates = await BusydatesModel.find();

        const busydatesEntity = busydates.map( b => ( {
          _id: { $oid: b.id },
          date: { $date: b.date },
          lodgement: { $oid: b.lodgement },
          reservation: { $oid: b.reservation },
          __v : 0
        }));

        const objAsJsonBusyDates = `${ JSON.stringify(busydatesEntity) }\n`;

        fs.appendFileSync( this.backupBusydatesPath, objAsJsonBusyDates );

        if ( fs.existsSync( this.backupBusydatesPathDayBefore ) ) {
          fs.unlinkSync( this.backupBusydatesPathDayBefore );
       }
      }
      
          if (fs.readFileSync( this.backupUsersPath, 'utf-8' ).toString().length <= 0) {

            const users = await UserModel.find();

            const usersEntity = users.map( u => ( {
              _id: { $oid: u.id },
              name: u.name,
              email: u.email,
              emailValidated: u.emailValidated,
              password: u.password,
              role: u.role,
              __v : 0,
            }));
            const objAsJsonUsers = `${ JSON.stringify(usersEntity) }\n`;

            fs.appendFileSync( this.backupUsersPath, objAsJsonUsers );

            if ( fs.existsSync( this.backupUsersPathDayBefore ) ) {
              fs.unlinkSync( this.backupUsersPathDayBefore );
           }
          }
          if (fs.readFileSync( this.backupPagosPath, 'utf-8' ).toString().length <= 0) {
            
            const pagos = await PagosModel.find();

            const pagosEntity = pagos.map( p => ( {
              _id: { $oid: p.id },
              fechaPago: { $date: p.fechaPago },
              monto: p.monto,
              user: { $oid: p.user },
              reservation: { $oid: p.reservation },
              __v : 0,
            }));

            const objAsJsonPagos = `${ JSON.stringify(pagosEntity) }\n`;

            fs.appendFileSync( this.backupPagosPath, objAsJsonPagos );

            if ( fs.existsSync( this.backupPagosPathDayBefore ) ) {
              fs.unlinkSync( this.backupPagosPathDayBefore );
           } 
          }     
      }
}
