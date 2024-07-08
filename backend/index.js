const express = require("express");
require('dotenv').config();

const cors = require("cors");


const rootRouter = require('./routes/index');



const app = express();

app.use(cors({ origin: 'https://pay-pulse-roan.vercel.app' }));
app.use(express.json());

const port = process.env.PORT || 4000;

app.use('/api/v1', rootRouter);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});