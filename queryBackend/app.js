var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var dotenv = require('dotenv').config();
var Axios = require('axios');
var cookieParser = require('cookie-parser');
var admin  = require('firebase-admin');

var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://loopedin.firebaseio.com"
});

var db = admin.database();
var app = express();

const xAPIKey = process.env.X_API_KEY;
const pAPIKey = process.env.PROPUBLICA_API_KEY;


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

/*app.use(function(req, res, next) {
    next(createError(404));
});*/

app.post('/reps', async (req,res)=>{
    const state = req.body["state"];
    const zip = req.body["zip"];
    Axios.defaults.headers.common['X-API-KEY'] = xAPIKey;
    const p2aendpoint = 'https://fmrrixuk32.execute-api.us-east-1.amazonaws.com/hacktj/legislators';

    var result = {
        "Representatives": [],
        "Senators": []
    };
    var params = {
        level: 'NATIONAL_LOWER',
        address: `${state} ${zip}`
    };
    await Axios.get(p2aendpoint,{
        params: params
    }).then(function (response) {
        var reps = response.data.officials;
        console.log(reps);
        reps.forEach(function (representative) {
            var firstName = representative['first_name'];
            var lastName = representative['last_name'];
            var salutation = representative['salutation'];
            var position = representative['party'];
            var photoURL = representative['photo'];
            var website = representative['websites'][0];
            var temp = representative['socials'];
            var socials = {};
            temp.forEach(function (platform) {
                if (platform['identifier_type'] === "INSTAGRAM" || platform['identifier_type'] === "TWITTER" || platform["identifier_type"] === "FACEBOOK-CAMPAIGN") {
                    socials["identifier_type"] = platform['identifier_value'];
                }
            });
            result["Representatives"].push({
                name: `${salutation} ${firstName} ${lastName}`,
                position: position,
                photoURL: photoURL,
                web: website,
                social: socials
            });
        });
    });
    params = {
        level: "NATIONAL_UPPER",
        address: `${state} ${zip}`
    };
    await Axios.get(p2aendpoint,{
        params: params
    }).then((response) =>{
        var reps = response.data.officials;
        console.log(reps.length);
        reps.forEach(function (representative) {
            var firstName = representative['first_name'];
            var lastName = representative['last_name'];
            var salutation = representative['salutation'];
            var position  = representative['party'];
            var photoURL = representative['photo'];
            var website = representative['websites'][0];
            var temp = representative['socials'];
            var socials = {};
            temp.forEach(function (platform) {
                if(platform['identifier_type'] === "INSTAGRAM" || platform['identifier_type'] === "TWITTER" || platform["identifier_type"] === "FACEBOOK-CAMPAIGN" ){
                    socials[`${platform['identifier_type']}`] = platform['identifier_value'];
                }
            });
            result["Senators"].push({
                name: `${salutation} ${firstName} ${lastName}`,
                position: position,
                photoURL: photoURL,
                web: website,
                social: socials
            });
        });
    });
    res.json(result);
});

app.post('/bills', async (req,res)=> {
    Axios.defaults.headers.common['X-API-KEY']  = pAPIKey;

    const topic = req.body["topic"];

});

app.post('/upload', (req,res)=>{
    var name = req.body["name"];
    var state = req.body["state"];
    var zip = req.body["zip"];
    var rep = req.body["rep"];
    var sen1 = req.body["sen1"];
    var sen2 = req.body["sen2"];

    var userRef = db.ref("/Users").child(`${name}`);
    userRef.set({
        "State": state,
        "Zip": zip,
        "Representative": rep,
        "Senators": {
            1: sen1,
            2: sen2
        }
    });
    res.status(200);
});


app.listen(process.env.PORT);
module.exports = app;
