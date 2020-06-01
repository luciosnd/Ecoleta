import express from 'express';

const app = express();

app.get('/users', (request, response) => {
  console.log('listagem de usuarios');

  response.json([
    'garota branca',
    'eu sou feia',
    'hm kk bjs', 
    'e veio ai'
  ]);
});

app.listen(3333);
