import dotenv from 'dotenv';
import prismaClient from './cricvoice-backend/config/db.config.js';
//import { createDummyUser } from './cricvoice-backend/models/users.model.js';
import cors from 'cors';
import bodyParser from 'body-parser';
import express from 'express';
import setUserRouter from './cricvoice-backend/routes/users.routes.js';
import setAuthRouter from './cricvoice-backend/routes/auth.routes.js';
import cookie_parser from 'cookie-parser';
import { verifyToken } from './cricvoice-backend/middleware/authJwt.js';
import pkg from 'morgan';
import setPreferenceRouter from './cricvoice-backend/routes/preference.route.js';
import path from 'path';
import setMatchesRouter from './cricvoice-backend/routes/cricket/match.routes.js';

async function getAllRoutes() {
    const userRoutes = await setUserRouter(),
        authRoutes = await setAuthRouter(),
        preferenceRoutes = await setPreferenceRouter(),
        matchRoutes = await setMatchesRouter();

    return {
        userRoutes: userRoutes,
        authRoutes: authRoutes,
        preferenceRoutes: preferenceRoutes,
        matchRoutes: matchRoutes
    };
}

async function setup() {
    try {
        console.log('Starting Setup');

        // dotenv config
        dotenv.config();
        
        //connect database
        await prismaClient.$connect()
        //await createDummyUser();
    
        const app = express();
        const corsOptions = {
            origin: [process.env.FRONT_END_URL, process.env.ADMIN_URL, process.env.ASSETS_PATH],
            credentials: true,
            allowedHeaders: ['Authorization', 'Content-Type', 'Origin', 'Accept']
        };

        // use cors for specifying origin from where request could me made.
        app.use(cors(corsOptions));

        // make static files public
        app.use('/static', express.static(path.join(path.resolve(path.dirname('')), process.env.ASSETS_PATH)));

        // sign response cookies and get signed cookies from request.
        const cookieParser = cookie_parser;
        app.use(cookieParser(process.env.COOKIES_SECRET));

        // parse requests of content-type - application/json
        app.use(bodyParser.json());

        // parse requests of content-type - application/x-www-form-urlencoded
        app.use(bodyParser.urlencoded({ extended: true }));

        // add morgan middleware for tracking requests.
        const morgan = pkg;
        app.use(morgan('dev'));

        // get all the routes and map them to url patterns.
        const routes = await getAllRoutes();
        app.use('/', routes.authRoutes);
        app.use('/users', [verifyToken], routes.userRoutes);
        app.use('/preference', [verifyToken], routes.preferenceRoutes);
        app.use('/cricket/match', routes.matchRoutes);
    
        const PORT = process.env.PORT || 4200
    
        //listen to port for any requests
        app.listen(PORT, console.log(`App is running in ${process.env.NODE_ENV} mode on port ${PORT}`));
        
    } catch(error) {
        console.log(error);
    }
}

setup()