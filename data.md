# Venue Server Log Format

Log files from the Venue Server are plain text files comprised of [serialized JSON objects](http://json.org/), one per line.

A typical message might contain data like this:

```JSON
{
  "chan": "network.data",
  "data": {
    "msg": {
      "kind": "bike",
      "vers": "v0.3.0",
      "uid": 27805,
      "ms": 6558947,
      "i": 64491,
      "v": 27.936,
      "c_out": 2.311
    },
    "address": "10.0.0.121",
    "size": 107
  },
  "time": "2014-05-19T13:05:51.545Z"
}
```

Note that [you can use pretty printing](http://json.parser.online.fr/beta/) to help understand the structure and content of messages, and almost every programming language has a good JSON parser.

## Message Wrapper

The server deals with a number of different kinds of messages. At the top level, each log message has  the `data`, plus two attributes :  `time` and `chan`.

### Time

**`time` (string)**

An [ISO 8601](https://xkcd.com/1179/)-formatted timestamp, which is the moment when the venue server wrote the message.

(Note that the absolute date/time might be wrong if the clock got reset between power cycles.)

### Channel

**`chan` (string)**

The channel to which the data belongs, or the 'type' of message. This is used for both publish/subscribe routing and for specifying what sort of content is in the `data` object.

The current possible values of `chan` are:

 * `network.data`
 * `network.stats`
 * `server.stats`
 * `logger.state`

### Data

**`data` (object or array)**

An object containing the actual message data, which will vary in structure and content based on the channel.

## Network Data

**when `chan == "network.data"`, `data` is an object**

This is the most common message type. Each sensor on the network sends at least 10 of these per second to the Venue Server.

Each `data` object includes three members: `address`, `message`, and `size`.

### Address

**`address` (string)**

This string represents where the venue server got this data from. Typical values are an IP address or the string "serial port". Note that these values may not uniquely define a particular sensor over long periods of time because IP addresses change when the system loses power.

### Size

**`size` (integer)**

The size in bytes of the original message, as it was sent over the wire.

### Message

**`msg` (object)**

This object contains the decoded information sent by the sensor. Its members vary, but a few are important:

 * `kind` (string): Possible values are `"bike"` (for bicycle sensors) and `"ctrl"` (for the charge controller unit).
 * `uid` (integer): A unique value representing this sensor. Stays the same even if the IP address changes.
 * `ms` (integer): Number of milliseconds the sensor has been running
 * `i` (integer): Incrementing per-sensor message counter. Helpful for counting lost messages.
 * `v` (float): Voltage (in volts) measured by the sensor.
 * `c_out` (float): For bikes, current (in amps) being generated. For the charge controller, total current (in amps) being consumed.

The following members only exist in charge controller data:

 * `c_in` (float): Total current (in amps) flowing in from the bikes.
 * `inv` (bool): Whether the inverter is turned on.
 * `tiers` (integer): How many tiers are on.
 * `shunts` (integer): How many shunts are on.


## Server Stats

**when `chan == "server.stats"`, `data` is an object**

These messages periodically log the health of the Venue Server. They include information such as CPU usage and available memory, as described below.


### Memory

**`totalmem` and `freemem` (integers)**

Total and free RAM, measured in KBytes.

### Disk Space

**`totaldisk` and `freedisk` (integers)**

Total and free disk space, measured in KBytes.

### CPU Load Averages

**`loadavg` (array of floats)**

CPU load is the amount of computational work that the server is performing. The three numbers represent the average system load over the last one, five, and fifteen minutes.

Note: [CPU load](http://www.linuxjournal.com/article/9001) is related to - but different from - percent CPU utilization.


### Uptime

**`uptime` (integer)**

How long the server hardware has been running, in seconds.

**`appUptime` (integer)**

How long the server software has been running, in seconds.


### Logging Overload Flag

**`logs_overloaded` (bool)**

This value indicates whether log data is being buffered in memory due to throughput issues. This flag is returned by the node.js stream [`write()`](http://nodejs.org/api/stream.html#stream_writable_write_chunk_encoding_callback) function.

Note that when the logs are overloaded, the server will *not* try to write `network.data` messages to disk.

## Network Stats and Logger State

These message channels are used primarily to drive the live Venue Server, and are not particularly important for post-event analysis.

**when `chan == "network.stats"`, `data`  is an array**

Each element of the `data` array is an object that contains aggregated information over a short window of time.

**when `chan == "logger.state"`, `data` is an object**

This object contains information about the data being logged to disk.
