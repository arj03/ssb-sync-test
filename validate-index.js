// DON'T TRY TO RUN THIS FILE, big hack

const { and, author, type } = require('ssb-db2/operators')
const pull = require('pull-stream')

function createSSB(dir, config, extraModules) {
  const FeedSyncer = require('./node_modules/ssb-browser-core/feed-syncer')

  const EventEmitter = require('events')
  let SSB = {
    events: new EventEmitter(),
    dbOperators: require('ssb-db2/operators')
  }
  SSB.dbOperators.mentions = require('ssb-db2/operators/full-mentions')

  const s = require('sodium-browserify')
  s.events.on('sodium-browserify:wasm loaded', function() {

    console.log("wasm loaded")

    var net = require('./node_modules/ssb-browser-core/net').init(dir, config, extraModules)

    console.log("my id: ", net.id)

    var helpers = require('./node_modules/ssb-browser-core/core-helpers')

    const Partial = require('./node_modules/ssb-browser-core/partial')
    const partial = Partial(dir)

    SSB = Object.assign(SSB, {
      db: net.db,
      net,
      dir,
      feedSyncer: FeedSyncer(net, partial),

      getPeer: helpers.getPeer,

      removeDB: helpers.removeDB,
      removeIndexes: helpers.removeIndexes,
      removeBlobs: helpers.removeBlobs,

      getGraph: helpers.getGraph,
      getGraphSync: helpers.getGraphSync,
      getGraphForFeed: helpers.getGraphForFeed,

      box: require('ssb-keys').box,
      blobFiles: require('ssb-blob-files'),

      partial,
    })

    SSB.events.emit("SSB: loaded")
  })

  return SSB
}

const fullSSB = createSSB('/home/arj/.ssb', {
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

const indexSSB = createSSB('/tmp/index-test', {
  connections: {
    outgoing: {
      net: [{ transform: 'shs' }],
    }
  },
  core: {
    startOffline: true
  }
})

function queryAuthorContact(SSB, indexSSB, cb) {
  SSB.db.getLog().onDrain(() => {
    console.time("db query author contact msgs")
    SSB.db.getJITDB().all(and(type('contact'), author('@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.ed25519'))(),
                          0, false, false, (err, results) => {
      console.log(results.length)
      console.timeEnd("db query author contact msgs")
      console.log(indexSSB.db)

      /*
      pull(
        pull.values(results),
        pull.asyncMap((msg, cb) => {
          indexSSB.db.publish({
            type: 'index',
            key: msg.key
          }, cb)
        }),
        pull.collect((err) => {
          if (err) console.error("ERROR" + err)

          cb()
        })
      )
      */
    })
  })
}

function queryAuthorAbout(SSB, cb) {
  SSB.db.getLog().onDrain(() => {
    console.time("db query author about msgs")
    SSB.db.getJITDB().all(and(type('about'), author('@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.ed25519'))(),
                          0, false, false, (err, results) => {
      const selfAssigned = results.filter(x => x.value.author == x.value.content.about)
      console.log(selfAssigned.length)

      console.timeEnd("db query author about msgs")
      if (cb) cb()
    })
  })
}

function queryIndexSSB(indexSSB, cb) {
  indexSSB.db.getLog().onDrain(() => {
    indexSSB.db.getJITDB().all(author(indexSSB.net.id), 0, false, false, (err, results) => {
      const validate = require('ssb-validate')
      let state = validate.initial()

      results = results.sort((x, y) => x.value.sequence - y.value.sequence)
      
      console.time("validate index")
      
      pull(
        pull.values(results),
        pull.map((msg) => {
          state = validate.append(state, null, msg.value)
        }),
        pull.collect((err) => {
          if (err) console.error(err)

          console.timeEnd("validate index")
        })
      )
      console.log(results.length)
      if (cb) cb()
    })
  })
}

fullSSB.events.on('SSB: loaded', function() {
  indexSSB.events.on('SSB: loaded', function() {
    console.log("index", indexSSB.net.id)
    console.log("full", fullSSB.net.id)
    queryIndexSSB(indexSSB)
    //queryAuthorContact(fullSSB, indexSSB, (cb) => queryAuthorAbout(fullSSB))
  })
})

return

console.log("waiting for ready")

fullSSB.events.on('SSB: loaded', function() {
  indexSSB.events.on('SSB: loaded', function() {
    console.log("index", indexSSB)
    console.log("full", fullSSB)
    
    queryAuthorContact(queryAuthorAbout)
  })
})
