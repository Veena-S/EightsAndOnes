import express from 'express';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';

import routes from './routes.mjs';

const app = express();

app.use(cookieParser());

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: false }));

app.use(express.static('public'));
app.use(express.static('public/tokenImages'));
app.use(express.static('public/misc-Images'));

app.use(methodOverride('_method'));

app.use(express.json());

// set the routes
routes(app);
app.use(express.static('js/dist'));

const PORT = process.env.PORT || 3004;

app.listen(PORT);
