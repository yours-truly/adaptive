var url = require('url')

var express = require('express')
var request = require('request')

var auth = require('./auth')
var cfg = require('./cfg')
var crop = require('./crop')
var ops = require('./ops')

var cache = require('./cache')(cfg.cache)
var verify = auth(cfg.secret)
var app = express()

app.get('/:key/:op/*', function(req, res) {

  var src = req.params[0]

  // add the query string (if present)
  var qs = url.parse(req.url).query
  if (qs) src += '?' + qs

  // verify that the key was created with the same shared secret ...
  if (!verify(req.params.key, req.params.op + src)) {
    return res.status(403).send('Forbidden.')
  }

  // if the url starts with // add the current protocol
  if (src.match('^//')) src = req.protocol + ':' + src

  // default to http if no protocol is specified
  else if (!src.match('://')) src = 'http://' + src

  // parse the op-string (currently only <width>x<height> is supported)
  var size = ops.size(req.params.op)
  if (!size) return res.status(400).send('Invalid operation.')

  // each image is uniquely identified by its src and the operation(s)
  var cacheKey = req.params.op + src

  // serve the image from the cache ...
  cache(req, res, cacheKey, function(cb) {

    // the image is not in the cache yet, fetch it
    request({ url: src, encoding: null }, function(err, response, data) {
      if (err) return cb(err)

      // crop it to the specified size
      crop(data, size, cb)
    })
  })
})

app.listen(cfg.port)
