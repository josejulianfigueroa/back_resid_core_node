import { envs } from '../../config';
import { ReservationModel, MongoDatabase, LodgementModel, BusydatesModel, UserModel } from '../mongo/';
import { seedData } from './data';


(async()=> {
  await MongoDatabase.connect({
    dbName: envs.MONGO_DB_NAME,
    mongoUrl: envs.MONGO_URL
  })

  await main();
  await MongoDatabase.disconnect();
})();


const randomBetween0AndX = ( x: number ) => {
  return Math.floor( Math.random() * x );
}


async function main() {
  // 0. Borrar todo!
  await Promise.all([
    BusydatesModel.deleteMany(),
    ReservationModel.deleteMany(),
    LodgementModel.deleteMany(),
    UserModel.deleteMany(),
  ])


  // 1. Crear usuarios
  const users = await UserModel.insertMany( seedData.users );

  // 1. Crear Hospedajes
  const hospedajes = await LodgementModel.insertMany( seedData.lodgements );

  // 2. Crear Reservaciones Hospadaje 1
  const reservaciones = await ReservationModel.insertMany(
    seedData.reservaciones.map( hosp => {

      return {
        ...hosp,
        user: users[ randomBetween0AndX( seedData.users.length - 1 ) ]._id,
        lodgement: hospedajes[0]._id
      }

    })
  );

  // 3. Crear Fechas Ocupadas 1

  const busyDates = await BusydatesModel.insertMany(
    seedData.busyDates1.map( busyDates => {
      return {
        ...busyDates,
        lodgement: hospedajes[0]._id
      }
    })
  );

    // 2. Crear Reservaciones Hospadaje 2
    const reservaciones2 = await ReservationModel.insertMany(
      seedData.reservaciones.map( hosp => {
  
        return {
          ...hosp,
          user: users[ randomBetween0AndX( seedData.users.length - 1 ) ]._id,
          lodgement: hospedajes[1]._id
        }
  
      })
    );
  
    // 3. Crear Fechas Ocupadas 1
  
    const busyDates2 = await BusydatesModel.insertMany(
      seedData.busyDates1.map( busyDates => {
        return {
          ...busyDates,
          lodgement: hospedajes[1]._id
        }
      })
    );


  console.log('SEEDED');

}
