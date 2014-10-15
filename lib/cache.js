var EventEmitter = require('events').EventEmitter
var fs = require('fs')
var os = require('os')
var path = require('path')

var debug = require('debug')('adaptive:cache')
var mkdirp = require('mkdirp')
var send = require('send')

module.exports = function(dir) {

  if (!dir) dir = path.join(os.tmpdir(), 'adaptive')

  var updating = {}

  mkdirp.sync(dir)

  return function(req, res, id, fn) {

    var f = path.join(dir, new Buffer(id).toString('base64') + '.jpg')

    function serve(err) {
      if (err) {
        console.log(err)
        return res.status(500).send(''+err)
      }

      debug('serving %s', req.url)
      send(req, f).pipe(res)
    }

    debug('request %s', req.url)

    fs.exists(f, function(exists) {
      if (exists) {
        return serve()
      }

      var emitter = updating[f]

      if (emitter) {
        // file is currently being updated
        debug('waitfor %s', req.url)
      }
      else {
        // flag as being updated by creating a new emitter
        emitter = updating[f] = new EventEmitter()

        debug('process %s', req.url)

        // invoke the passed function to load and process the image
        fn(function(err, img) {
          if (err) return emitter.emit('done', err)

          // pipe the result stream into a file
          img.pipe(fs.createWriteStream(f)).on('close', function() {
            emitter.emit('done')
          })

        })

        // remove the emitter once the image is ready
        emitter.on('done', function() {
          updating[f] = undefined
        })
      }

      // serve the image once it is ready
      emitter.on('done', serve)

    })
  }
}
