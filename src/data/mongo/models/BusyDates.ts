import mongoose, { Schema } from 'mongoose';


const busyDatesSchema = new mongoose.Schema( {

  date: {
    type: Date,
    required: [ true, 'date is required' ],
  },
  lodgement: {
    type: Schema.Types.ObjectId,
    ref: 'Lodgement',
    required: true
  }

} );

busyDatesSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function( doc, ret, options ) {
    delete ret._id;
  },
})

export const BusyDatesModel = mongoose.model('BusyDates', busyDatesSchema);

