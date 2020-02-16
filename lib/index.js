const {Client} = require('@elastic/elasticsearch');

function updateEsPlugin(schema, options) {
	if (!options.index) {
		throw new Error('you must provide elasticsearch index for your model ');
	}

	const {index} = options;
	const esclient = createClient(options.es || {});

	schema.post('save', async doc => {
		const esres = await esSaveDoc(esclient, index, doc._doc);
		// Console.log(esres);
		if (esres.result !== 'created') {
			throw new Error('es index not created', esres);
		}
	});
	schema.post('updateOne', async function () {
		console.log('pre update hooks');
		const filters = this.getQuery();
		const update = this.getUpdate();

		const res = await esUpdateOne(esclient, index, filters, update.$set);
		if (!res.updated || res.updated !== 1) {
			throw new Error('es document not updated');
		}
	});
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
		inline += `ctx._source.${key}='${update[key]}'`;
	});
	scripts.source = inline;
	const {body} = await esclient.updateByQuery({
		index, body: {
			query: {match},
			script: scripts
		}
	});

	return body;
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

	const {body} = await esclient.index({
		index,
		body: b
	});
	return body;
}

module.exports = updateEsPlugin;
