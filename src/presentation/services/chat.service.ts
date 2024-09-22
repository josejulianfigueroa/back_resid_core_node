
interface Cliente {
  id: string;
  idUser: string;
  name: string;
  role: string;
  img: string
}


export class ChatService {

  constructor(){

  }

  private clients: Record<string, Cliente> = {};

  onClientConnected( client: Cliente ) {
    this.clients[ client.id ] = client;
  }

  onClientDisconnected( id: string ) {
    delete this.clients[id];
  }

  
  getClients() {
    return Object.values( this.clients ); // [Client, Client, Client]
  }

}