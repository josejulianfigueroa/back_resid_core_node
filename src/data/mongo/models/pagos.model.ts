import mongoose, { Schema } from 'mongoose';


const pagosSchema = new mongoose.Schema( {

  fechaPago: {
    type: Date,
  },
  monto: {
    type: Number,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reservation: {
    type: Schema.Types.ObjectId,
    ref: 'Reservation',
    required: true
  }
} );

pagosSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function( doc, ret, options ) {
    delete ret._id;
  },
})


export const PagosModel = mongoose.model('Pagos', pagosSchema);

