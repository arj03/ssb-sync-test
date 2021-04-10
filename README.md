# SSB sync test

Test the performance of a simple server and client.

```
Streaming 8k messages as json: 1.4s
Streaming 8k messages as bipf: 1.17s
DB query 8k messages as json: 0.6s
DB query 8k messages as bipf: 0.5s
```

Basically I'm interested in seeing what the overhead of [json
stringify](https://github.com/ssbc/packet-stream-codec/blob/b206128ddcad1c65fc16a0c2259ab7f8ce7e8fd0/index.js#L35)
in packet-stream-codec is.

## Overhead of validating index feeds

I have tested the overhead of validating [index
feeds](https://github.com/ssb-ngi-pointer/ssb-secure-partial-replication#indexes)
and on my laptop valiating an index feed of 514 messages takes
114 ms. Meaning 0.222 ms per message.

My main profile has 514 contact messages and 13 self assigned about messages.

Doing partial replication on 448 feeds I got:

abouts: 11281
contacts: 61776
latest 25: 10988

The contact messages are probably a bit too high as it's not only
self-assigned messages. With 70k messages the overhead is around 15.5
seconds.
