
export class BusyDatesDto {

  private constructor(
    public date: Date,
  ) {}

  static create( object: { [key:string]:any } ): [string?, BusyDatesDto?] {
    const { date} = object;

    if ( !date ) return ['Missing date'];
   
    return [undefined, new BusyDatesDto(date)];

  }

}