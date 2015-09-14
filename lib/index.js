var url = require('url')

var debug = require('debug')('adaptive:main')
var express = require('express')
var request = require('request')

var auth = require('./auth')
var crop = require('./crop')

function parseOps(ops) {
  var o = ops.match(/^(\d+)x(\d+)(?::(\d+)?(p)?)?$/)
  if (!o) return
  return {
    width: +o[1],
    height: +o[2],
    quality: +(o[3]||90),
    progressive: !!o[4]
  }
}

module.exports = function(opts) {

  var cache = require('./cache')(opts.cache)
  var verify = auth(opts.secret)

  var app = express()

  app.get('/:key/:ops/*', function(req, res) {

    var ops = parseOps(req.params.ops)
    var src = req.params[0]

    if (!ops) return res.status(400).send('Invalid operation requested.')

    // add the query string (if present)
    var qs = url.parse(req.url).query
    if (qs) src += '?' + qs

    // verify that the key was created with the same shared secret ...
    if (!verify(req.params.key, req.params.ops + '/' + src)) {
      return res.status(403).send('Forbidden.')
    }

    // if the url starts with // add the current protocol
    if (src.match('^//')) src = req.protocol + ':' + src

    // default to http if no protocol is specified
    else if (!src.match('://')) src = 'http://' + src

    // serve the image from the cache ...
    cache(req, res, [req.params.ops, src], function(cb) {

      debug('fetching %s', src)

      // the image is not in the cache yet, fetch it
      request({ url: src, encoding: null }, function(err, response, data) {
        if (err) return cb(err)

        debug('cropping %s', src)
        // crop it to the specified size
        crop(data, ops, cb)
      })
    })
  })

  app.get('/status', function(req, res) { res.json(process.memoryUsage()); });

  return app
}
