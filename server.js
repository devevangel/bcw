import express from 'express';

const app = express();

app.use(express.static('client', { extensions: ['html'] }));

app.listen(8080, () => console.log(`listening on port 8080`));