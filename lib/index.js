const {Client} = require('@elastic/elasticsearch');

function updateEsPlugin(schema, options) {
	if (!options.index) {
		throw new Error('you must provide elasticsearch index for your model ');
	}

	const {index} = options;
	const esclient = createClient(options.es || {});

	schema.post('save', async doc => {
		try {
			await esSaveDoc(esclient, index, doc._doc);
		} catch (error) {
			throw new Error(`es document could not be saved ${error.meta.body.error}`);
		}
	});
	schema.post('updateOne', async function () {
		const filters = this.getQuery();
		const update = this.getUpdate();
		try {
			await esUpdateOne(esclient, index, filters, update.$set);
		} catch (error) {
		
			throw new Error(`es document could not be update d${error.meta.body.failures}`);
		}
	}
	);
}

/**
 * Create new es client
 * @param {*} options
 */

function createClient(options) {
	if (!options.host) {
		console.warn('connection to es instance on localhost:9200');
	}

	const client = new Client({
		node: `${(options.host || 'http://localhost:9200')}`
	});
	return client;
}

/**
 * Save document
 * @param {*} esclient
 */
async function esUpdateOne(esclient, index, filters, update) {
	const match = {};
	const scripts = {};
	let inline = '';
	Object.keys(filters).forEach(key => {
		match[key] = filters[key];
	});
	Object.keys(update).forEach(key => {
	
		if(Object.prototype.toString.call(update[key]) !== '[object Date]'){
			inline += `ctx._source.${key}='${update[key]}';`;
		}
	});
	scripts.source = inline;
	 await esclient.updateByQuery({
		index, body: {
			query: {match},
			script: scripts
		}
	});
}

/**
 * Update  one document in es
 * @param {*} esclient
 * @param {*} index
 * @param {*} doc
 */
async function esSaveDoc(esclient, index, doc) {
	const b = {};

	Object.keys(doc).forEach(k => {
		if (k !== '_id' && k !== '__v') {
			b[k] = doc[k];
		}
	});

	await esclient.index({
		index,
		body: b
	});
}

module.exports = updateEsPlugin;
