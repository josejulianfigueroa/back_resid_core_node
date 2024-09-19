import { BusydatesModel, LodgementModel  } from '../../data';
import { PagosModel } from '../../data/mongo';
import { CustomError, LogEntity, LogSeverityLevel, PaginationDto } from '../../domain';
import { DateFechaPagoResponse, PagoDateResponse } from '../../domain/interfaces/reservations.interface';
import { FileSystemService } from './fileSystem.service';

import { DateMongoMayorQ, DateMongoMenorQ } from './reservation.service';
import moment from 'moment';
const _ = require("lodash");

export class BusyDatesService {

  constructor(private readonly fileSystemService: FileSystemService) { }

  async deleteBusydateByMaintenance() {
    try {
      const dateMongo:DateMongoMenorQ = {$lt : new Date()}; // fechas menores a la fecha actual
      const obj = { date:  dateMongo };
      
      const busydates = await BusydatesModel.deleteMany( obj );
  
    if(busydates){

      this.fileSystemService.saveLog(
        new LogEntity({
        message: `Se ha generado el mantenimiento a la tabla busydates con éxito`, 
        level: LogSeverityLevel.info,
        origin: 'busydates.service.ts'
        }));

  } else {
    throw CustomError.badRequest( 'delete maintenance failed' );
  }
  } catch ( error ) {
    this.fileSystemService.saveLog(
      new LogEntity({
        message: `Ha ocurrido un error inesperado: ${error}, al querer dar mantenimiento a la tabla busydates`, 
        level: LogSeverityLevel.high,
        origin: 'busydates.service.ts'
      }));
    throw CustomError.internalServer( `${ error }` );
  }

}
async getStatistics(){

const yearActual = new Date().getFullYear();

const yearLast= yearActual -1;
const startDate = yearLast +'-01-01';
const endDate = yearActual +'-12-31';

let dataActual: DataAnual = {
                       ano:  yearActual.toString(),
                       meses: []
                };
let dataHistorica: DataAnual = {
                  ano:  yearLast.toString(),
                  meses: []
           };
let responseStat: ResponseStatByLodgeDates = {
  statsByLodgeDates: []
}

      try {

      return await LodgementModel.find().then( lodges => {

        const listLodges = lodges.map( ( lodge ) => ( {
          id: lodge.id,
          name: lodge.name,
        }));
 
      return BusydatesModel.find({ date: {
                                  $gte : new Date(startDate),
                                  $lt : new Date(endDate) 
                                        }
      }).then( (data) => {
       const busydateResponse = data.map( busyDates => ( {
          date: busyDates.date,
          lodgement: busyDates.lodgement.valueOf(),
        }));


        listLodges.forEach ( (lodge) => {
        const datesLodge =  busydateResponse.filter( (val) => val.lodgement === lodge.id);

        // Data Actual
          for(let i = 1; i <= 12; i++){
            dataActual.meses[i-1] = datesLodge.filter( (val) => val.date.getMonth()+1 === i && val.date.getFullYear() === yearActual).length;
          }
            console.log('dataActual',dataActual);
        // Data Historica
          for(let i = 1; i <= 12; i++){
            dataHistorica.meses[i-1] = datesLodge.filter( (val) => val.date.getMonth()+1 === i && val.date.getFullYear() === yearLast).length;
          }
          console.log('dataHistorica', dataHistorica);

          dataHistorica.suma= _.sumBy(dataHistorica.meses);
          dataActual.suma = _.sumBy(dataActual.meses);
          
         const stat:StatisticsBusyDates = {
            historico : dataHistorica,
            actual :  dataActual
        };
        const lodgeStat: StatisticsByLodge ={
          lodgeName: lodge.name,
          lodgeId: lodge.id,
          statistics : stat
        };
            responseStat.statsByLodgeDates.push(lodgeStat);
            dataActual = {
              ano:  yearActual.toString(),
              meses: []
             };
           dataHistorica = {
           ano:  yearLast.toString(),
           meses: []
          };
      });

        return {
          ...responseStat
        }

    });

  });

  } catch ( error ) {
    throw CustomError.internalServer( 'Internal Server Error' );
  }
}

async getStatisticsSales(){

  const yearActual = new Date().getFullYear();
  
  const yearLast= yearActual -1;
  const startDate = yearLast +'-01-01';
  const endDate = yearActual +'-12-31';
  
  let dataActual: DataAnual = {
                         ano:  yearActual.toString(),
                         meses: [],
                         suma: 0
                  };
  let dataHistorica: DataAnual = {
                    ano:  yearLast.toString(),
                    meses: [],
                    suma: 0
             };
  let responseStat: ResponseStatByLodgeDates = {
    statsByLodgeDates: []
  }
  
        try {
  
        return await LodgementModel.find().then( lodges => {
  
          const listLodges = lodges.map( ( lodge ) => ( {
            id: lodge.id,
            name: lodge.name,
          }));
   
        return PagosModel.find({ fechaPago: {
                                    $gte : new Date(startDate),
                                    $lt : new Date(endDate) 
                                          }
        }).populate("reservation").then( (data: any) => {

         const busydateResponse = data.map( (busyDates: any)  => ( {
            date: busyDates.fechaPago,
            monto: busyDates.monto,
            reservation: busyDates.reservation,
          }));
     
          const pagosResponse: PagoDateResponse[] = busydateResponse.map( (resp: DateFechaPagoResponse) => ( {
            date: resp.date,
            lodgement: resp.reservation.lodgement.valueOf(),
            monto: resp.monto
          }));
  
 
          listLodges.forEach ( (lodge) => {
          const datesLodge =  pagosResponse.filter( (val) => val.lodgement === lodge.id);
  
          // Data Actual
            for(let i = 1; i <= 12; i++){
              dataActual.meses[i-1] = _.sumBy((datesLodge.filter( (val) => val.date.getMonth()+1 === i && val.date.getFullYear() === yearActual)), (item: PagoDateResponse) => item.monto);
            }
          
          // Data Historica
            for(let i = 1; i <= 12; i++){
              dataHistorica.meses[i-1] = _.sumBy((datesLodge.filter( (val) => val.date.getMonth()+1 === i && val.date.getFullYear() === yearLast)), (item: PagoDateResponse) => item.monto);
            }

            dataHistorica.suma= _.sumBy(dataHistorica.meses);
            dataActual.suma = _.sumBy(dataActual.meses);
  
           const stat:StatisticsBusyDates = {
              historico : dataHistorica,
              actual :  dataActual
          };
          const lodgeStat: StatisticsByLodge ={
            lodgeName: lodge.name,
            lodgeId: lodge.id,
            statistics : stat
          };
              responseStat.statsByLodgeDates.push(lodgeStat);
              dataActual = {
                ano:  yearActual.toString(),
                meses: [],
                suma: 0
               };
             dataHistorica = {
             ano:  yearLast.toString(),
             meses: [],
             suma: 0
            };
        });
  
          return {
            ...responseStat
          }
  
      });
  
    });
  
    } catch ( error ) {
      throw CustomError.internalServer( 'Internal Server Error' );
    }
  }

  
  async getBusyDates( paginationDto: PaginationDto ) {

    const { page, limit } = paginationDto;

    try {
      const [ total, busyDates ] = await Promise.all( [
        BusydatesModel.countDocuments(),
        BusydatesModel.find()
          .skip( ( page - 1 ) * limit )
          .limit( limit )
      ] );


      return {
        page: page,
        limit: limit,
        total: total,
        next: `/api/busydates?page=${ ( page + 1 ) }&limit=${ limit }`,
        prev: (page - 1 > 0) ? `/api/busydates?page=${ ( page - 1 ) }&limit=${ limit }`: null,

        busydates: busyDates.map( busyDates => ( {
          date: busyDates.date,
          lodgement: busyDates.lodgement,
          reservation: busyDates.reservation,
        } ) )
      };

    } catch ( error ) {
      throw CustomError.internalServer( 'Internal Server Error' );
    }

  }

}

export interface ResponseStatByLodgeDates {
  statsByLodgeDates: StatisticsByLodge[];
}

export interface StatisticsByLodge {
  lodgeName: string;
  lodgeId: string;
  statistics : StatisticsBusyDates;
}

export interface StatisticsBusyDates  {
    historico : DataAnual;
    actual : DataAnual;
}

export interface DataAnual {
   ano: string;
   meses : number[];
   suma?: number;
}


