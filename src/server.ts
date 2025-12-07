import express from 'express';
import initDB, { pool } from './database/database';
import { authRouter } from './modules/auth/auth.route';
import { userRouter } from './modules/user/user.route';
import config from './config';
import { vehicleRoute } from './modules/vehicle/vehicle.route';
import { bookingRoute } from './modules/booking/booking.route';

const app = express()
const port = config.port;

app.use(express.json());


initDB();

app.get('/', (req, res) => {
    res.send('Assignment API')
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/vehicles', vehicleRoute);
app.use('/api/v1/bookings', bookingRoute);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})