const { and, author, type } = require('ssb-db2/operators')

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

function querywarmup(cb) {
  SSB.db.getLog().onDrain(() => {
    console.time("db query warmup")
    SSB.db.getJITDB().all(author('@C6fAmdXgqTDbmZGAohUaYuyKdz3m6GBoLLtml3fUn+o=.ed25519'), 0, false, false, (err, results) => {
      console.log(results.length)
      console.timeEnd("db query warmup")
      if (cb) cb()
    })
  })
}

function queryAll(cb) {
  SSB.db.getLog().onDrain(() => {
    console.time("db query author all")
    SSB.db.getJITDB().all(author('@6CAxOI3f+LUOVrbAl0IemqiS7ATpQvr9Mdw9LC4+Uv0=.ed25519'), 0, false, false, (err, results) => {
      console.log(results.length)
      console.timeEnd("db query author all")
      if (cb) cb()
    })
  })
}

function queryAuthorPosts(cb) {
  SSB.db.getLog().onDrain(() => {
    console.time("db query author post msgs")
    // and(author('@LVL4qjvmws3Cxavfi4iCQI6dSOqWqOyq5/5CHImILA8=.ed25519'), type('post'))
    SSB.db.getJITDB().all(and(type('post'), author('@LVL4qjvmws3Cxavfi4iCQI6dSOqWqOyq5/5CHImILA8=.ed25519'))(), 0, false, false, (err, results) => {
      console.log(results.length)
      console.timeEnd("db query author post msgs")
      if (cb) cb()
    })
  })
}

function query10(cb) {
  SSB.db.getLog().onDrain(() => {
    console.time("db query author 10 msgs")
    SSB.db.getJITDB().paginate(author('@LVL4qjvmws3Cxavfi4iCQI6dSOqWqOyq5/5CHImILA8=.ed25519'), 0, 10, false, false, (err, answer) => {
      console.log(answer.results.length)
      console.timeEnd("db query author 10 msgs")
      if (cb) cb()
    })
  })
}

SSB.events.on('SSB: loaded', function() {
  querywarmup(() => queryAll(() => queryAuthorPosts(query10)))

  console.log("server is ready net:localhost:8888")
})
