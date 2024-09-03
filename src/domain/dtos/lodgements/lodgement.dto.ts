import { regularExps } from '../../../config';

export class LodgementDto {

  private constructor(
    public name: string,
    public description: string,
    public location: string,
    public activeStatus: string,
  ) {}

  static create( object: { [key:string]:any } ): [string?, LodgementDto?] {
    const { name, description, location, activeStatus } = object;

    if ( !name ) return ['Missing name'];
    if ( !description ) return ['Missing nadescriptionme'];

    return [undefined, new LodgementDto(name, description, location, activeStatus)];

  }


}