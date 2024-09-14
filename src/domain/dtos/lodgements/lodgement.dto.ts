import { regularExps } from '../../../config';

export class LodgementDto {

  private constructor(
    public name: string,
    public description: string,
    public location: string,
    public activeStatus: string,
    public cost: Number,
  ) {}

  static create( object: { [key:string]:any } ): [string?, LodgementDto?] {
    const { name, description, location, activeStatus, cost } = object;

    if ( !Number(cost) ) return ['Cost Invalid'];
    if ( !name ) return ['Missing name'];
    if ( !description ) return ['Missing Description'];

    return [undefined, new LodgementDto(name, description, location, activeStatus, cost)];

  }


}