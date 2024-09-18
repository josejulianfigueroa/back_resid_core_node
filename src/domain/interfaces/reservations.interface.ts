export interface Reservation {
    id?:             string;
    startDate?:       string;
    endDate?:         string;
    status?:          string;
    user?:            string;
    lodgement:       string;
    reasonRejection?: string;
    customerObservations?: string;
    dateReservation?: Date;
    costReservation?: number;
  }

  export interface DateFechaPagoResponse {
    reservation: Reservation;
    date: Date;
    monto: number;
  }

  export interface PagoDateResponse {
    lodgement: string;
    date: Date;
    monto: number;
  }