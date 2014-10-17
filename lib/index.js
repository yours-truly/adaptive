var url = require('url')

var debug = require('debug')('adaptive:main')
var express = require('express')
var request = require('request')

var auth = require('./auth')
var crop = require('./crop')

function parseSize(size) {
  var s = size.match(/^(\d+)x(\d+)$/)
  if (!s) return
  return {
    w: +s[1],
    h: +s[2]
  }
}

module.exports = function(opts) {

  var cache = require('./cache')(opts.cache)
  var verify = auth(opts.secret)

  var app = express()

  app.get('/:key/:size/*', function(req, res) {

    var size = parseSize(req.params.size)
    var src = req.params[0]

    if (!size) return res.status(400).send('Invalid size requested.')

    // add the query string (if present)
    var qs = url.parse(req.url).query
    if (qs) src += '?' + qs

    // verify that the key was created with the same shared secret ...
    if (!verify(req.params.key, req.params.size + '/' + src)) {
      return res.status(403).send('Forbidden.')
    }

    // if the url starts with // add the current protocol
    if (src.match('^//')) src = req.protocol + ':' + src

    // default to http if no protocol is specified
    else if (!src.match('://')) src = 'http://' + src

    // serve the image from the cache ...
    cache(req, res, [size, src], function(cb) {

      debug('fetching %s', src)

      // the image is not in the cache yet, fetch it
      request({ url: src, encoding: null }, function(err, response, data) {
        if (err) return cb(err)

        // crop it to the specified size
        crop(data, size, cb)
      })
    })
  })

  return app
}
