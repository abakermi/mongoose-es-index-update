const MongodbMemoryServer = require('mongodb-memory-server').default;
const mongoose = require('mongoose');
const {Client} = require('@elastic/elasticsearch');

// Your models and server

const User = require('./fixtures/user');

const mongod = new MongodbMemoryServer();
const client = new Client({
	node: 'http://localhost:9200'

});
const model = {email: 'one@example.com', name: 'One', country: 'en', createdAt: Date.now()};
// Create connection to mongoose before all tests
exports.before = async t => {
	mongoose.connect(await mongod.getConnectionString(), {useNewUrlParser: true, useUnifiedTopology: true});

	await client.indices.create({
		index: 'user'
	});
	client.indices.putMapping({
		index: 'users',
		type: 'staff',
		body: {
			properties: {
				country: {type: 'text'},
				name: {type: 'text'},
				createdAt: {type: 'date',
			 format: 'basic_date_time||epoch_millis||yyyyMMdd’T’HHmmss.SSSZ'}
			}}});
	t.context.client = client;
};

exports.beforeEach = async () => {
	const user = new User(model);
	await user.save();
	await client.indices.refresh({index: 'user'});
};

exports.afterEach = async () => {
	await User.remove({});
	await client.deleteByQuery({
		index: 'user',
		body: {
			query: {
				match: {email: 'one@example.com'}
			}

		}
	});
};

exports.after = async () => {
	mongoose.disconnect();
	mongod.stop();
	await client.indices.delete({
		index: 'user'
	});
	await client.close();
};

