import { envs } from '../../config';
import { BusydatesModel, LodgementModel, ReservationModel, UserModel } from '../../data';
import fs from 'fs';
import moment from 'moment';


export class BackupAndRestoreMongo {

    backupPath = 'backup/'
    backupLodgementsPath = `backup/backupLodgements_${moment().format('DD-MM-YYYY').toString()}.json`;
    backupLodgementsPathDayBefore = `backup/backupLodgements_${moment().subtract(1, 'days').format('DD-MM-YYYY').toString()}.json`;

    constructor() {
        this.createLogsFiles();
      }
    
      private createLogsFiles = () => {
        if ( !fs.existsSync( this.backupPath ) ) {
          fs.mkdirSync( this.backupPath );
        }
    
        [
          this.backupLodgementsPath
        ].forEach( path => {
          if ( fs.existsSync( path ) ) return;
    
          fs.writeFileSync( path, '' );
        });
      }

    async backupMongoDB(): Promise<void> {
    
        const lodgements = await LodgementModel.find();
       // const reservations = ReservationModel.find();
      //  const busydates = BusydatesModel.find();
     //   const users = UserModel.find();
     console.log("epa2aaaaaaaaaaa", this.backupLodgementsPath);
     if ( !fs.existsSync( this.backupLodgementsPath ) ) {
        console.log("epa2");
     const lodgementsEntity = lodgements.map( lodge => ( {
        _id: { $oid: lodge.id },
        name: lodge.name,
        description: lodge.description,
        cost: lodge.cost,
        activeStatus: lodge.activeStatus,
        __v : 0,
        location: lodge.location,
      }));
        const objAsJson = `${ JSON.stringify(lodgementsEntity) }\n`;
    
        fs.appendFileSync( this.backupLodgementsPath, objAsJson );
    }
      // Eliminamos el archivo del día anterior si existe
      console.log("epa", this.backupLodgementsPathDayBefore);
      if ( fs.existsSync( this.backupLodgementsPathDayBefore ) ) {
        console.log(this.backupLodgementsPathDayBefore);
            fs.unlinkSync( this.backupLodgementsPathDayBefore );
        }
      }
  
}
