import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";
// const {readdirSync} = require('fs')

import clientRoutes from "./routes/client.js";
import generalRoutes from "./routes/general.js";
import managementRoutes from "./routes/management.js";
import salesRoutes from "./routes/sales.js";
import userRoutes from "./routes/user.js";
import expenseRoutes from "./routes/expenses.js";
import { pushInitData } from "./data/utils.js";

/* CONFIGURATION */
dotenv.config();
const app = express();

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */

// readdirSync('./routes').map((route) => app.use('/api/v1', require('./routes/' + route)))

app.use("/api/client", clientRoutes);
app.use("/api/general", generalRoutes);
app.use("/api/management", managementRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/user", userRoutes);
app.use("/api/expenses", expenseRoutes);

/* MONGOOSE SETUP */

const PORT = process.env.PORT || 9000;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Server started at http://localhost/${PORT}`)
    );
    /* Sample Data */
    pushInitData();
  })
  .catch((err) => console.log("mongodb connection failed...\n", err));
