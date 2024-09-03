import mongoose from 'mongoose';


const lodgementSchema = new mongoose.Schema( {

  name: {
    type: String,
    required: [ true, 'name is required' ],
  },
  description: {
    type: String,
    required: [ true, 'descripcion is required' ],
  },
  location: {
    type: String,
  },
  activeStatus: {
    type: Boolean,
    default: false,
  },

} );

lodgementSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function( doc, ret, options ) {
    delete ret._id;
  },
})


export const LodgementModel = mongoose.model('Lodgement', lodgementSchema);

