var crypto = require('crypto')
var debug = require('debug')('app:auth')

module.exports = function(secret) {
  return function verifyKey(key, id) {
    if (!secret) return true
    var pass = crypto
      .createHmac('sha1', secret)
      .update(id)
      .digest('base64')

    if (key == pass) return true
    debug('invalid key %s (expected %s)', key, pass)
  }
}
