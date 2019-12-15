var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var schema = new Schema({
  itemNo: { type: Schema.Types.ObjectId,  ref: 'Item'},
  itemName: {type: String, required: true},
  cNo: { type: Schema.Types.ObjectId,  ref: 'User'},
  perNum: {type: Number, required: true}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Reservation = mongoose.model('Reservation', schema);

module.exports = Reservation;
