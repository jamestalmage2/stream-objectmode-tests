# stream-object-mode-tests

> Testing how objectMode:true and setEncoding affect transform streams

Just for my own personal education. Published for posterity.

You should look in `test.js` and read the lessons learned below.

Note that all the tests were written using `through2`. I don't believe that makes a difference, and that the rules below hold true regardless.

If you find this useful, please share it. If you have something to add, or find an inaccuracy - please open an issue or PR.

## Running The Tests

1. Clone the repo
2. `npm install`
3. `npm test`

## Lessons Learned

### ObjectMode

Affects the data type seen *internally* (i.e. within it's handler/transform method).

- `objectMode:true`

  - Handler receives whatever is written to the stream without modification (or piped in).

  - It can receive data from any stream (you can pipe anything into an objectMode stream).

- `objectMode:false`

  - Handler *always* receives Buffers.

  - It can only receive `String`s or `Buffer`s data

  - You *can* pipe an ObjectMode stream into a non-ObjectMode stream, but that first stream needs to always emit `String`s or `Buffer`s


### Encoding

Affects the data type seen by `data` event listeners.

- `setEncoding` is *not* called: `data` events sees Buffers.
- `setEncoding` *is* called: `data` events sees Strings.

## License

MIT © [James Talmage](http://github.com/jamestalmage)
