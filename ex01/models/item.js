var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;


var schema = new Schema({
  cityName: { type: String, trim: true, required: true},
  country: { type: String, trim: true, required: true},
  itemName: { type: String, trim: true, required: true},
  intro: {type: String, trim: true, required: true},
  price: {type: Number, default: 0},
  numReads: {type: Number, default: 0},
  status: {type: Number, default: 0},
  startDay: {type: Date, default: Date.now},
  endDay: {type: Date, default: Date.now},
  img: {type: String},
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Item = mongoose.model('Item', schema);

module.exports = Item;
