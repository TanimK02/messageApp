import express from 'express';
import cors from 'cors';
import passport from './src/config/passport.js';
import userRouter from './src/routes/userRoute.js';
import chatRouter from './src/routes/chatRoute.js';
import messageRouter from './src/routes/messageRoute.js';
const app = express();
const PORT = process.env.PORT || 3000;
const corsOptions = {
    origin: 'https://message-app-coral.vercel.app', // Frontend URL
    optionsSuccessStatus: 200
};
app.use(express.json());
app.use(cors(corsOptions));
app.set('trust proxy', 1); // Trust first proxy if behind one
app.use(passport.initialize());
app.use('/users', userRouter);
app.use('/chats', chatRouter);
app.use('/messages', messageRouter);


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});