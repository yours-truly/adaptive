/**
 * Parse <width>x<height> expressions.
 *
 * This is currently the only operation that is supported.
 * When adding further ops please try to stay compatible with
 * https://github.com/thumbor/thumbor/wiki
 */
exports.size = function(op) {
  var size = op.match(/^(\d+)x(\d+)/)
  if (!size) return
  return {
    w: +size[1],
    h: +size[2]
  }
}
