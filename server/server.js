require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dbcon = require("./db");
const userRouter = require("./router/userRouter");
const adminRouter = require("./router/adminRouter");
const categoryRouter = require("./router/categoryRouter");
const productRouter = require("./router/productRouter");
const storeRouter = require("./router/storeRouter");
const multer = require("multer");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const path = require("path");



const corsOption = {
  origin: process.env.FRONT_URL,
  method: "GET, POST, PATCH, PUT, DELETE, HEAD",
  Credentials: true,
};

const app = express();
app.use(cors(corsOption));
app.use(express.json());



app.set('view engine', 'ejs')
// app.set('views', path.join(__dirname, 'views'))
app.set('views', path.resolve("./views"))


// app.use(express.static(path.join(__dirname, 'public')))
app.use('/public', express.static('public'))
// for static path of public folder
// app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// app.get('/', (req, res) => {
//     res.send('hello ecom')
// })
app.get('/views', (req, res) => {
  res.render('home')
})
app.use("/", userRouter);
app.use("/admin", adminRouter);
app.use("/category", categoryRouter);
app.use("/products", productRouter);
app.use("/store", storeRouter);

// sslcommerz
const store_id = process.env.STORE_ID
const store_passwd = process.env.STORE_PASS
const is_live = false //true for live, false for sandbox



//============ error middleware
app.use((err, req, res, next) => {
  if (err) {
   res.status(501).send(err.message);
  } else {
    res.send('success')
  }
})


let port= process.env.PORT || 8080

dbcon().then(() => {
  app.listen(port, () => {
    console.log(`server running on ${process.env.MODE} mode on ${port}`);
  });
});
