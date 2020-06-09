const express = require("express")
const responseTime = require("response-time")
const errorhandler = require("errorhandler")
const morgan = require("morgan")
const mongoose = require("mongoose")
const session = require("express-session")
const bodyParser = require("body-parser")
const ejs = require("ejs")
mongoose.Promise = require("bluebird")

let app = express()

// Where to find the view files
app.set("views", "./views")
app.engine("html", ejs.renderFile)

app.use(morgan("dev"))
app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })) // support encoded bodies
app.use(express.static("./app"))
app.use(express.static("./app/assets"))
app.use(express.static("./app/assets/node_modules"))
app.use(responseTime())
app.use(session({resave: true, saveUninitialized: true, secret: "SOMERANDOMSECRETHERE", cookie: { maxAge: 60000 }}))
app.use(errorhandler())

let models  = require("./server_app/models")
let routes  = require("./server_app/routes")(app)

let port = Number(process.env.PORT || 3000)

let mongoport = process.env.PROD_MONGODB || "mongodb://localhost:27017/brmodeloDB"
// https://mlab.com/

mongoose.set("debug", true)
mongoose.connect(mongoport, {useNewUrlParser: true, useUnifiedTopology: true}, function (err) {
 if (err) throw err
  app.listen(port, function () {
    console.log(`
---------------------------------------------------
--------------- APPLICATION RUNNING ---------------
---------------------------------------------------
App: http://localhost:${port}
MongoDB: ${mongoport}
---------------------------------------------------
    `)
  })
})
