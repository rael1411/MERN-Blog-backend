require("dotenv").config()

const express = require("express");
const mongoose = require("mongoose")
const cors = require("cors");
const corsOptions = require("./config/corsOptions")
const cookieParser = require("cookie-parser")


const app = express();

app.use (express.json())
//cross origin resource sharing
app.use(cors(corsOptions))
app.use(cors({credentials: true, origin: 'http://localhost:3000'}));

//midddleware for cookies
app.use(cookieParser());

//adding routers
const indexRouter = require("./routes/index");
const postsRouter = require("./routes/posts");
const refreshRouter = require("./routes/refresh")

//setting database via mongoose

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', (error) => console.error(error))
db.once('open', () => console.log('Connected to Database'))

//ROUTES
app.use("/", indexRouter);
app.use("/posts", postsRouter)
app.use('/refresh', refreshRouter);


const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server started on port ${PORT}`));