import moment from 'moment';

export class ReservationDto {

  private constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly customerObservations: string,
    public readonly reasonRejection: string,
    public readonly status: string,
  ) {}


  static create( object: { [key: string]: any } ):[string?, ReservationDto?] {

    const { startDate, endDate, customerObservations, reasonRejection, status } = object;

    if ( !startDate ) return ['Missing startDate'];
    if ( !endDate ) return ['Missing endDate'];
    if(!moment(startDate).isValid() ||!moment(endDate).isValid()) return ['Invalid date format'];
    if(moment(startDate).isAfter(moment(endDate))) return ['startDate date must be before endDate date'];
    if(moment(startDate).isSame(moment(endDate))) return ['startDate and endDate can not be the same'];
    if(moment(startDate).isBefore(moment())) return ['startDate date must be in future'];
    if(moment(endDate).isBefore(moment())) return ['endDate date must be in future'];
    if(moment(endDate).isBefore(moment(startDate))) return ['Start date must be before end date'];
   
    return [undefined, new ReservationDto(startDate, endDate, customerObservations, reasonRejection, status )];

  }


}



