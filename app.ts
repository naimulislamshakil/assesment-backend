import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import admin, { ServiceAccount } from 'firebase-admin';
import errorMiddleware from './middlewares/error';
import userRoute from './router/userRoute';
import productRoute from './router/productRoute';

config({ path: './config.env' });
export const app = express();
admin.initializeApp({
	credential: admin.credential.cert({
		projectId: process.env.FIREBASE_PROJECT_ID,
		privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
		clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
	}),
});

app.use(
	cors({
		origin: process.env.FRONTEND_URL,
		methods: ['GET', 'POST', 'PUT', 'DELETE'],
		credentials: true,
	})
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// database
export const db = admin.firestore();

// route call
app.use('/api/v1/user', userRoute);
app.use('/api/v1/product', productRoute);

// error handler
app.use(errorMiddleware);
