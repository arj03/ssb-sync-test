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
