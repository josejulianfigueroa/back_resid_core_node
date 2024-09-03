

export class ReservationDto {

  private constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly customerObservations: string,
    public readonly reasonRejection: string,
    public readonly status: string,
    public readonly userId: string,
  ) {}


  static create( object: { [key: string]: any } ):[string?, ReservationDto?] {

    const { startDate, endDate, customerObservations, reasonRejection, status, userId } = object;


    if ( !startDate ) return ['Missing startDate'];
    if ( !endDate ) return ['Missing endDate'];
   
    return [undefined, new ReservationDto(startDate, endDate, customerObservations, reasonRejection, status, userId )];

  }


}



