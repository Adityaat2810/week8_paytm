const express = require("express");
const rootRouter = require("./router/index");
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express();
app.use(cors())
app.use(bodyParser.json())

app.use("/api/v1", rootRouter);

app.listen(4000,()=>{
    console.log(`server started at port 4000`);
})