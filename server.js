const { author } = require('ssb-db2/operators')

const dir = '/home/arj/.ssb'

//require('rimraf').sync(dir)

require('ssb-browser-core/core.js').init(dir, {
  connections: {
    incoming: {
      net: [{ scope: 'public', host: "localhost", port: 8888, transform: 'shs' }],
    },
    outgoing: {
      net: [{ transform: 'shs' }],
    }
  },
  core: {
    startOffline: true
  }
})

function query(cb) {
  SSB.db.getLog().onDrain(() => {
    console.time("db query")
    SSB.db.getJITDB().all(author('@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.ed25519'), 0, false, false, (err, results) => {
      console.timeEnd("db query")
      if (cb) cb()
    })
  })
}

SSB.events.on('SSB: loaded', function() {
  // twice to warm up cache
  query(query)

  console.log("server is ready net:localhost:8888")
})
