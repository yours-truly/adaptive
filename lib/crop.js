var Canvas = require('canvas')
var debug = require('debug')('adaptive:crop')
var SmartCrop = require('smartcrop')

module.exports = function(data, op, cb) {
  try {
    debug('options %j', op)

    // create an image from the given buffer
    var img = new Canvas.Image()
    img.src = data

    // options for smartcrop.js
    var opts = {
      width: op.width,
      height: op.height,
      canvasFactory: function(w, h) {
        return new Canvas(w, h)
      }
    }

    SmartCrop.crop(img, opts, function(result) {
      var canvas = new Canvas(op.width, op.height)
      var ctx = canvas.getContext('2d')
      var c = result.topCrop

      ctx.patternQuality = 'best'
      ctx.filter = 'best'
      ctx.drawImage(img, c.x, c.y, c.width, c.height, 0, 0, op.width, op.height)

      // pass image stream to the callback
      cb(null, canvas.jpegStream({
        quality: op.quality,
        progressive: op.progressive
      }))

    })
  }
  catch(err) {
    cb(err)
  }
}
