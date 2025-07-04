import {config} from 'dotenv';
config({ path: `.env.${process.env.NODE_ENV}` });
import express from "express";
import routes from './routes';

const app = express();
app.use(express.json());
app.use(express.static(__dirname + '/public'));

app.use('/v1', routes);
app.listen(process.env.PORT, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
