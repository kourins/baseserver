# `baseserver.js` Documentation

## Overview

`baseserver.js` is a Node.js server that uses Express and Socket.IO to create a real-time, event-driven backend for a stock charting application. It acts as a central message broker, receiving data from various sources (like data servers and chart servers) and broadcasting it to all connected web clients.

## Server Status

The server maintains a simple status object, `jsonStatusList`, to track the state of different components of the system:

```javascript
var  jsonStatusList = {'webserver':'ON','chartserver':'OFF','dataserver':'OFF','rssserver':'OFF','webclient':'OFF'};
```

- `webserver`: The status of the main web server (`baseserver.js` itself).
- `chartserver`: The status of the chart data provider.
- `dataserver`: The status of the market data provider.
- `rssserver`: The status of the RSS feed provider.
- `webclient`: The status of a connected web client.

The server updates these statuses in response to `rStatusOn` and `rStatusOff` events and broadcasts the updated status list to all clients via the `sStatus` event.

## Socket.IO Events

The server uses a simple naming convention for its socket events:
- Events prefixed with `r` (`rYesterdaySignal`, `rPriceList`, etc.) are **received** by the server.
- Events prefixed with `s` (`sYesterdaySignal`, `sPriceList`, etc.) are **sent** (emitted) by the server.

In almost all cases, the server simply receives an event and then immediately emits a corresponding event with the same data to all connected clients.

### Event Reference

| Receiving Event      | Emitted Event        | Data Payload                                  | Description                                                                                                                              |
| -------------------- | -------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `rYesterdaySignal`   | `sYesterdaySignal`   | `any`                                         | Relays yesterday's trading signal.                                                                                                       |
| `rAggregateList`     | `sAggregateList`     | `any`                                         | Relays an aggregate list of data.                                                                                                        |
| `rSignalList`        | `sSignalList`        | `any`                                         | Relays a list of trading signals.                                                                                                        |
| `rStatusOn`          | `sStatus`            | `string` (e.g., "chartserver")                | Sets the status of the specified component to "ON" and broadcasts the updated `jsonStatusList`.                                        |
| `rStatusOff`         | `sStatus`            | `string` (e.g., "chartserver")                | Sets the status of the specified component to "OFF" and broadcasts the updated `jsonStatusList`.                                       |
| `rBreakTimeInfo`     | `sBreakTimeInfo`     | `string` (JSON)                               | Relays break time information for a stock.                                                                                               |
| `rSendChartInfo`     | `sSendChartInfo`     | `string` (JSON)                               | Relays chart data for the main display.                                                                                                  |
| `rPriceList`         | `sPriceList`         | `string` (JSON)                               | Relays a list of current stock prices.                                                                                                   |
| `rDetailInfoOpen`    | `sDetailInfoOpen`    | `string`                                      | Signals that a client has opened the detailed view for a specific stock.                                                                 |
| `rDetailInfoClose`   | `sDetailInfoClose`   | `string`                                      | Signals that a client has closed the detailed view for a specific stock.                                                                 |
| `rSendDetailInfo`    | `sSendDetailInfo`    | `string` (JSON)                               | Relays chart data for the detailed view.                                                                                                 |
| `console`            | N/A                  | `string`                                      | Triggers various server-side actions based on the message content (see below).                                                           |

### The `console` Event

The `console` event is a special case that allows clients to send commands to the server.

| Command            | Emitted Event          | Description                                                                |
| ------------------ | ---------------------- | -------------------------------------------------------------------------- |
| `status`           | `sStatus`              | Requests the current `jsonStatusList`, which is then broadcast to all clients. |
| `min01`, `min05`, `min30`, `min60`, `min300` | `sChangeChart` | Instructs clients to change the time interval of the charts.      |
| `end` / `dataserverclose` | `sSaveDataInfo` | Instructs the data server to save its data.                                |
| `chartserverclose` | `sChartControlClose`   | Instructs the chart server to close.                                       |
| `webserverclose`   | `sStatus`              | Sets the `webserver` status to "OFF", broadcasts the new status, shuts down the Socket.IO server, and terminates the Node.js process. |

Any other command sent via the `console` event is logged as an "undefined command".
