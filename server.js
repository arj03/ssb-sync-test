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
  }
})

SSB.events.on('SSB: loaded', function() {
  console.log("server is ready net:localhost:8888")
})
