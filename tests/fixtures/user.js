const mongoose = require('mongoose');

const {Schema} = mongoose;
const plugins = require('../../lib');

mongoose.Promise = global.Promise;

const userSchema = new Schema({
	email: {
		type: String
	},
	name: {
		type: String
	},
	country: {
		type: String
	}
});
userSchema.plugin(plugins, {index: 'user'});
module.exports = mongoose.model('User', userSchema);
