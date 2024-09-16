import mongoose, { Schema } from 'mongoose';


const busydatesSchema = new mongoose.Schema( {

  date: {
    type: Date,
    required: [ true, 'date is required' ],
  },
  lodgement: {
    type: Schema.Types.ObjectId,
    ref: 'Lodgement',
    required: true
  },
  reservation: {
    type: Schema.Types.ObjectId,
    ref: 'Reservation',
    required: true
  },
  dateCreation: {
    type: Date, 
    default: Date.now
  }
} );

busydatesSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function( doc, ret, options ) {
    delete ret._id;
  },
})

export const BusydatesModel = mongoose.model('Busydates', busydatesSchema);

