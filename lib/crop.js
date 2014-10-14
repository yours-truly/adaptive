var Canvas = require('canvas')
var SmartCrop = require('smartcrop')

module.exports = function(data, size, cb) {

  // create an image from the given buffer
  var img = new Canvas.Image()
  img.src = data

  // options for smartcrop.js
  var opts = {
    width: size.w,
    height: size.h,
    canvasFactory: function(w, h) {
      return new Canvas(w, h)
    }
  }

  try {
    SmartCrop.crop(img, opts, function(result) {
      var canvas = new Canvas(size.w, size.h)
      var ctx = canvas.getContext('2d')
      var c = result.topCrop

      ctx.patternQuality = 'best'
      ctx.filter = 'best'
      ctx.drawImage(img, c.x, c.y, c.width, c.height, 0, 0, size.w, size.h)

      // pass image stream to the callback
      cb(null, canvas.jpegStream({ quality: 90 }))

    })
  }
  catch(err) {
    cb(err)
  }
}
