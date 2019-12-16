var mongoose = require('mongoose'),
    mongoosePaginate = require('mongoose-paginate'),
    Schema = mongoose.Schema;

var schema = new Schema({
  cNo: { type: Schema.Types.ObjectId, ref: 'User' },
  name: {type: String, trim: true, required: true},
  itemNo: { type: Schema.Types.ObjectId, ref: 'Item' },
  content: {type: String, trim: true, required: true},
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});
schema.plugin(mongoosePaginate);
var Review = mongoose.model('Review', schema);

module.exports = Review;
