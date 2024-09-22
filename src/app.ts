import { envs } from './config';
import { MongoDatabase } from './data/mongo';
import { AppRoutes } from './presentation/routes';
import { ServerExpress } from './presentation/server';
import { ChatService } from './presentation/services/chat.service';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
const chalk = require('chalk');


(async()=> {
  main();
})();



async function main() {


  await MongoDatabase.connect({
    dbName: envs.MONGO_DB_NAME,
    mongoUrl: envs.MONGO_URL,
  });

  const server = new ServerExpress({
    port: envs.PORT,
    routes: AppRoutes.routes,
  });


  const httpServer = createServer( server.app );
//  WssService.initWss({ server: httpServer });

const io = new Server(httpServer, {
  cors: {
    origin: '*',
  }
});

const chatService = new ChatService();


  server.setRoutes( AppRoutes.routes );


  io.on('connection', (socket: Socket) => {
    
     let { name, idUser, role, img } = socket.handshake.query;

  
    if(!name && !idUser){
      socket.disconnect();
      return;
    }

    console.log(`${chalk.green(`Cliente Conectado idSocket: ${socket.id}`)}, con name ${name} y role ${role}`);
  
  // Agregar cliente al listado
  if(name && idUser && typeof name === 'string' && typeof idUser === 'string'  && typeof role === 'string' && typeof img === 'string'){
  chatService.onClientConnected({ id: socket.id, idUser: idUser , name: name , role: role, img: img});
  }
  io.emit('on-clients-changed', chatService.getClients() );





  socket.on('send-message', (res: ClienteMessage) => {
      // Emite el mensaje a todos lo miembros de las sala menos a la persona que envia el mensaje   
   console.log(res);
       io.emit('on-message',  res);
  
    })

    socket.on('send-refresh', (res) => {
      // Refresh Socket
      io.emit('on-clients-changed', chatService.getClients() );
  
    })



    socket.on('disconnect', () => { 
      console.log(`Cliente Desconectado con idSocket: ${socket.id}`);
      chatService.onClientDisconnected( socket.id );
      io.emit('on-clients-changed', chatService.getClients() );
    });

    //Mesaje de Bienvenida Solo al cliente que se acaba de conectar
       socket.emit('welcome-message', 'Binevenido al servidor');
});




  httpServer.listen( envs.PORT, () => {
    console.log(`Server running on port: ${ envs.PORT }`);
  })


}


interface ClienteMessage {
  fromIdUser: string;
  toIdUser: string
  toName: string;
  fromName: string;
  fromRole: string;
  toRole: string;
  fromImg: string;
  toImg: string;
  mensaje?: string;

}
