import mongoose, { Schema } from 'mongoose';


const reservationSchema = new mongoose.Schema( {

  startDate: {
    type: Date,
    required: [ true, 'startDate is required' ]
  },
  endDate: {
    type: Date,
    required: [ true, 'endDate is required' ]
  },
  customerObservations: {
    type: String,
  },
  reasonRejection: {
    type: String,
  },
  status: {
    type: String,
    default: 'SOLICITUD'
  },
  costReservation: {
    type: Number,
  },
  dateReservation: {
    type: Date,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lodgement: {
    type: Schema.Types.ObjectId,
    ref: 'Lodgement',
    required: true
  }

} );

reservationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function( doc, ret, options ) {
    delete ret._id;
  },
})


export const ReservationModel = mongoose.model('Reservation', reservationSchema);

