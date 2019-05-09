let express = require('express')
let app = express();
var TicketsList = new Array();

const ticketsnumber = "A00";
let http = require('http');
let server = http.Server(app);
var amqp = require('amqplib/callback_api');

let socketIO = require('socket.io');
let io = socketIO(server);

var connection;

var conn = require('amqplib/callback_api');
conn.connect('amqp://localhost', function (err, conn) {
  if (err != null) bail(err);
  connection=conn;
  consumer(conn);
});
/**
* API to handel customet request 
*
*/

app.get("/serveTicket", (req, res) => {
  try {
    TicketsList=TicketsList.splice(0,1);
    if (connection) {
      publisher(connection);
    }
    else
      console.log("error no conn");

  }
  catch (err) {
    console.log(err);
  }
});
/**
 *Port Number
 *
 */
const port = process.env.PORT || 4000;

/**
 *event fires when user connect 
 *
 */

io.on('connection', (socket) => {
  try {
    console.log('user connected');

    io.emit("UpadteList", TicketsList);

  }
  catch (err) {
    console.log(err.message);
  }

});

/**
 *listen to the request  
 *
 */
server.listen(port, () => {
  try {
    console.log(`started on port: ${port}`);
  }
  catch (err) {
    console.log(err);
  }
});

function bail(err) {
  console.error(err);
  process.exit(1);
}

// Publisher
function publisher(conn) {
  try{
    conn.createChannel(on_open);
    function on_open(err, ch) {
      if (err != null) bail(err);
      ch.assertQueue(q);
      ch.sendToQueue(q, Buffer.from(JSON.stringify(TicketsList)));
      console.log("raye7 ")
    }
  }catch (err) {
    console.log(err);
  }
  
}
var q = 'tasks';

// Consumer
function consumer(conn) {
  
  var ok = conn.createChannel(on_open);
  function on_open(err, ch) {
    if (err != null) bail(err);
    ch.assertQueue(q);
    ch.consume(q, function (pTicketsList) {
      console.log("Consume ^^")
      if (pTicketsList !== null) {
        console.log(pTicketsList.content.toString('utf8'));
        TicketsList=JSON.parse(pTicketsList.content.toString('utf8'));
        //io.emit("onListUpdate", pTicketsList);
        ch.ack(pTicketsList);
      }
    });
  }
}


