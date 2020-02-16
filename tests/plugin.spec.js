import test from 'ava';
import User from './fixtures/user';

import {before, after, beforeEach, afterEach} from './hooks';

test.before(before);
test.beforeEach(beforeEach);
test.afterEach(afterEach);
test.after.always(after);

test.serial('post save hook ', async t => {
	const {client} = t.context;
	const {body} = await client.search({
		index: 'user',
		body: {
			query: {
				match_all: {}
			}
		}
	});

	t.is(body.hits.total.value, 1);
});
test.serial('post updateone hook ', async t => {
	const {client} = t.context;
	await User.updateOne({email: 'one@example.com'}, {name: 'Two'});
	await client.indices.refresh({index: 'user'});
	const {body} = await client.search({
		index: 'user',
		body: {
			query: {
				match_all: {}
			}
		}
	});
	const _doc = body.hits.hits[0]._source;
	t.is(body.hits.hits.length, 1);
	t.is(_doc.name, 'Two');
});
