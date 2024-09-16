import mongoose, { Schema } from 'mongoose';


const imagesLodgementSchema = new mongoose.Schema( {

  img: {
    type: String,
    required: [ true, 'img is required' ],
  },
  lodgement: {
    type: Schema.Types.ObjectId,
    ref: 'Lodgement',
    required: true
  },
  dateCreation: {
      type: Date, 
      default: Date.now
    }
  
} );

imagesLodgementSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function( doc, ret, options ) {
    delete ret._id;
  },
})

export const ImagesLodgementModel = mongoose.model('ImagesLodgement', imagesLodgementSchema);

