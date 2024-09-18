import mongoose, { Schema } from 'mongoose';


const mensajeSchema = new mongoose.Schema( {

  msg: {
    type: String,
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateCreation: {
    type: Date, 
    default: Date.now
  }
} );

mensajeSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function( doc, ret, options ) {
    delete ret._id;
  },
})


export const MensajeModel = mongoose.model('Mensaje', mensajeSchema);

