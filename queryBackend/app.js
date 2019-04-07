var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var dotenv = require('dotenv').config();
var Axios = require('axios');

var app = express();

const xAPIKey = process.env.X_API_KEY;
Axios.defaults.header.common['X-API-KEY'] = xAPIKey;

const endpoint = 'https://fmrrixuk32.execute-api.us-east-1.amazonaws.com/hacktj/legislators'

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.post('/representatives',(req,res)=>{
    const state = req.body.state;
    const zip = req.body.zip;
    var result = {
        "Representatives":[
        ],
        "Senators":{
            "":{

            }
        }
    };
    var params = {
        level: 'NATIONAL_LOWER',
        address: `${state} ${zip}`
    };
    Axios.get(endpoint,{
        params: params
    }).then(function (response) {
        var reps = response.data.officials;
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
    };
    params = {
        level: "NATIONAL_UPPER",
        address: `${address} ${zip}`;
}
    Axios.get(endpoint,{
        params: params
    }).then((representative) =>{
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
                    socials["identifier_type"] = platform['identifier_value'];
                }
            });
            result["Senators"].push({
                name: `${salutation} ${firstName} ${lastName}`
                position: position,
                photoURL: photoURL,
                web: website,
                social: socials
            });
        });
    });
    res.json(result);
});


app.use(function(req, res, next) {
    next(createError(404));
});



module.exports = app;
