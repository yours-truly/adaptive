var minimist = require('minimist')

// read options from command-line
module.exports = minimist(process.argv.slice(2), {
  alias: { p: 'port', s: 'secret', c: 'cache' },
  default: {
    port: process.env.PORT || 3000,
    secret: process.env.ADAPTIVE_SECRET,
    cache: process.env.ADAPTIVE_CACHE
  }
})
