import express, { Request, Response } from 'express';
import initDB, { pool } from './database/database';
import { authRouter } from './modules/auth/auth.route';
import { userRouter } from './modules/user/user.route';
import auth from './middleware/auth';

const app = express()
const port = 3000;

app.use(express.json());


initDB();

app.get('/', (req, res) => {
    res.send('Hello World!')
});


app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})