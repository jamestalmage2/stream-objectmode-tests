import test from 'ava';
import through2 from 'through2';

test.cb('objectMode:false - you get Buffers *within* the stream', t => {
	through2(function (chunk) {
		t.true(Buffer.isBuffer(chunk));
		t.is(chunk.length, 3);
		t.end();
	}).write('foo');
});

test.cb('objectMode:true - whatever is written is unmodified *within* the stream', t => {
	t.plan(2);
	through2({objectMode: true}, function (chunk) {
		t.is(chunk, 'foo');
	}).write('foo');

	through2({objectMode: true}, function (chunk) {
		t.deepEqual(chunk, {foo: 'bar'});
		t.end();
	}).write({foo: 'bar'});
});

test('objectMode:false - data events will be buffers - even if handler pushes a string', t => {
	t.plan(1);

	const stream = through2(function (chunk, enc, cb) {
		this.push(chunk.toString('utf8'));
		cb();
	});

	stream.on('data', function (chunk) {
		t.true(Buffer.isBuffer(chunk));
	});

	stream.write('foo');
});

test.cb('no setEncoding - data listeners receive buffers', t => {
	t.plan(4);

	const stream = through2(function (chunk, encoding, cb) {
		t.true(Buffer.isBuffer(chunk));
		t.is(chunk.length, 3);
		this.push(chunk);
		cb();
	});

	stream.on('data', chunk => {
		t.true(Buffer.isBuffer(chunk));
		t.is(chunk.length, 3);
		t.end();
	});

	stream.write('foo');
});

test.cb('setEncoding(enc) - strings received in data events ', t => {
	t.plan(3);

	const stream = through2(function (chunk, encoding, cb) {
		t.true(Buffer.isBuffer(chunk));
		t.is(chunk.length, 3);
		this.push(chunk);
		cb();
	});

	stream.setEncoding('utf8');

	stream.on('data', function (chunk) {
		t.is(chunk, 'foo');
		t.end();
	});

	stream.write('foo');
});

test('objectMode:true - Strings received in data events if Strings are pushed', t => {
	t.plan(1);

	const stream = through2({objectMode: true}, (chunk, enc, cb) => cb(null, chunk));

	stream.on('data', chunk => t.is(chunk, 'foo'));

	stream.write('foo');
});

test('objectMode:true - Buffer received in data events if Buffers are pushed', t => {
	t.plan(2);

	const stream = through2({objectMode: true}, (chunk, enc, cb) => {
		t.is(chunk, 'foo');
		cb(null, new Buffer(chunk));
	});

	stream.on('data', chunk => t.true(Buffer.isBuffer(chunk)));

	stream.write('foo');
});

test('objectMode:true, setEncoding(utf8) - String received in data events (even when buffers are pushed)', t => {
	t.plan(1);

	const stream = through2({objectMode: true}, (chunk, enc, cb) => cb(null, new Buffer(chunk)));

	stream.setEncoding('utf8');

	stream.on('data', chunk => t.is(chunk, 'foo'));

	stream.write('foo');
});

test.cb('ObjectMode stream piped to non-ObjectMode stream: Second stream receives Buffers.', t => {
	t.plan(2);

	const stream = through2({objectMode: true}, function (chunk, encoding, cb) {
		t.is(chunk, 'foo');
		this.push(chunk);
		cb();
	});

	stream.pipe(through2(chunk => {
		t.true(Buffer.isBuffer(chunk));
		t.end();
	}));

	stream.write('foo');
});

test.cb('ObjectMode stream piped to non-ObjectMode stream: Second stream receives Buffers (even with encoding set).', t => {
	t.plan(2);

	const stream = through2({objectMode: true}, function (chunk, encoding, cb) {
		t.is(chunk, 'foo');
		this.push(chunk);
		cb();
	});

	stream.setEncoding('utf8');

	stream.pipe(through2(chunk => {
		t.true(Buffer.isBuffer(chunk));
		t.end();
	}));

	stream.write('foo');
});

test.cb('ObjectMode stream piped to non-ObjectMode stream: Error if first stream emits non-string/buffer', t => {
	t.plan(2);

	const stream = through2({objectMode: true}, function (chunk, encoding, cb) {
		t.is(chunk, 'foo');
		t.throws(() => {
			this.push({notString: 'norBuffer'});
			cb();
		}, /Invalid non-string\/buffer chunk/);
		t.end();
	});

	stream.pipe(through2(() => {
		t.fail();
	}));

	stream.write('foo');
});

