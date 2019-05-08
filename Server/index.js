let express = require('express')
let app = express();
const TicketsList = new Array();

let http = require('http');
let server = http.Server(app);
var amqp = require('amqplib/callback_api');
let socketIO = require('socket.io');
let io = socketIO(server);


/**
* API to handel serving 
*
*/


app.get("/serveTicket", (req, res) => {
    try {
      
        

      amqp.connect('amqp://localhost', function(error0, connection) {
        if (error0) {
          throw error0;
        }
        connection.createChannel(function(error1, channel) {
          if (error1) {
            throw error1;
          }
          var exchange = 'Tickets';
      
          channel.assertExchange(exchange, 'fanout', {
            durable: false
          });
      
          channel.assertQueue('', {
            exclusive: true
          }, function(error2, q) {
            if (error2) {
              throw error2;
            }
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", q.queue);
            channel.bindQueue(q.queue, exchange, '');
         
      
            channel.consume(q.queue, function(msg) {
              if(msg.content) {
                  console.log(" [x] %s", msg.content.toString());
                  TicketsList.push(msg);
                }
            }, {
              noAck: true
            });
          });
        });
      });

      io.emit("UpadteList", TicketsList); }
    catch (err) {
        console.log(err);
    }
});







/**
 *Port Number
 *
 */
const port = process.env.PORT || 8124;
/**
 *event fires when user connect 
 *
 */
io.on('connection', (socket) => {
    try {
    console.log('Emplyee connected');
      
   
   io.emit("UpadteList", TicketsList);
 
    }
    catch(err)
    {
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
    catch(err)
    {
        console.log(err);
    }
});




/**
 *update tickets List and notify all connected user 
 *
 
function updateTickitsList() {
    try {
    //notify all about update 
    io.emit("UpadteList", TicketsList);
    //to do :
    // sent to rabit  to store ticket in MQ
    }
    catch (err)
    {
        console.log(err);
    }
}*/