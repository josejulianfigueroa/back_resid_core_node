import { bcryptAdapter } from '../../config';


export const seedData = {

  users: [
    { name: 'julia', email: 'test1@google.com', password: bcryptAdapter.hash( '123456') },
    { name: 'Veruska', email: 'test2@google.com', password: bcryptAdapter.hash( '123456') },
    { name: 'Orcar', email: 'test3@google.com', password: bcryptAdapter.hash( '123456') },
    { name: 'Carlos', email: 'test4@google.com', password: bcryptAdapter.hash( '123456') },
    { name: 'Andreina', email: 'test5@google.com', password: bcryptAdapter.hash( '123456') },
    { name: 'Maria', email: 'test6@google.com', password: bcryptAdapter.hash( '123456') },
  ],

  lodgements: [
    { name: 'Apartamento1', description:'Apto 3 Habitaciones' },
    { name: 'Apartamento2', description:'Apto 2 Habitaciones' },
  ],

  reservaciones: [
    { startDate: '2024-10-10', endDate: '2024-10-14', },
    { startDate: '2024-09-10', endDate: '2024-09-14', },
    { startDate: '2024-08-10', endDate: '2024-08-14', },
    { startDate: '2024-07-10', endDate: '2024-07-14', },
    { startDate: '2024-06-10', endDate: '2024-06-14', },
  ],
busyDates1: [
    { date: '2024-10-10',  },
    { date: '2024-10-11',  },
    { date: '2024-10-12',  },
    { date: '2024-10-13',  },
  ],


}