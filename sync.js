const pull = require('pull-stream')

const dir = '/tmp/ssb-sync-test'

require('rimraf').sync(dir)

require('ssb-browser-core/core.js').init(dir)

SSB.events.on('SSB: loaded', function() {
  var remoteAddress = 'net:localhost:8888~shs:6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0='

  SSB.net.connect(remoteAddress, (err, rpc) => {
    if (err) console.error("connection err", err)
    console.time("downloading messages")

    pull(
      rpc.partialReplication.getFeed({
        id: "@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.ed25519",
        seq: 0, keys: false
      }),
      pull.asyncMap(SSB.db.validateAndAddOOO),
      pull.collect((err, msgs) => {
        if (err) throw err
        
        console.timeEnd("downloading messages")
        console.log("number of messages", msgs.length)
      })
    )
  })
})
