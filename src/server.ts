import express, { Request, Response } from 'express'
import config from './config';
import { initDB} from './config/db';
import { vehiclesRouter } from './modules/vehicles/vehicle.Route';
import { usersRouter } from './modules/users/user.Route';
import { bookingRoutes } from './modules/bookings/bookings.Routes';
const app = express()
const port = config.port;
app.use(express.json())

initDB();

app.get('/', (req:Request, res:Response) => {
  res.send('Hello World!')
})
app.use('/api/v1/vehicles',vehiclesRouter)
app.use('/api/v1',usersRouter)
app.use('/api/v1/bookings',bookingRoutes)


app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Not Found",
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API NOT FOUND",
      },
    ],
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
