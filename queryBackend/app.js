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
            //var salutation = representative['salutation'];
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
                name: ` ${firstName} ${lastName}`,
                position: position,
                photoURL: photoURL,
                web: website,
                social: socials
            });
        });
    });
    res.json(result);
});

app.post('/bills', (req,res)=> {
    Axios.defaults.headers.common['X-API-KEY']  = pAPIKey;
    var result = {
        "bills": []
    };


    const topic = req.body["topic"];
    var endpoint = `https://api.propublica.org/congress/v1/bills/subjects/${topic}.json`;

    Axios.get(endpoint)
        .then(function(response) {


            result["bills"].push(response.data.results[0]);
            result["bills"].push(response.data.results[1]);
            res.json(result);
        });
});

app.post('/upload', (req,res)=>{
    var name = req.body["name"];
    var state = req.body["state"];
    var zip = req.body["zip"];
    var rep = req.body["rep"];
    var repPos = req.body["reppos"];
    var sen1 = req.body["sen1"];
    var sen1Pos = req.body["sen1pos"];
    var sen2 = req.body["sen2"];
    var sen2Pos = req.body["sen2pos"];
    var topics = req.body["topics"];

    var userRef = db.ref("/Users");
    userRef.set({
        "Name": name,
        "State": state,
        "Zip": zip,
        "Representative": {
            "Name": rep,
            "Position": repPos
        },
        "Senators": {
            0: {
                "Name": sen1,
                "Position": sen1Pos
            },
            1: {
                "Name": sen2,
                "Position": sen2Pos
            }
        },
        "Topics":{
            0: topics[0],
            1: topics[1],
            2: topics[2]
        }
    });
    res.status(200);
    res.end();
});

app.post('/get',(req,res)=>{
    var ref = db.ref("/Users");
    ref.once("value",(snapshot)=>{
        res.json(snapshot);
    })
});


app.post('/test',async (req,res)=>{
    
    var phrase = "Updating your loop. ";
    
    var endpoint = 'https://loopedin-backend.herokuapp.com/get';

   await Axios.post(endpoint)
        .then(async function(response){
            var data = response.data;
            var name = data["Name"];
            var rep = data["Representative"];
            var senators = [ data["Senators"]["0"], data["Senators"]["1"]];
            var topicsTemp = data["Topics"];
            var topics = [topicsTemp["0"], topicsTemp["1"], topicsTemp["2"]];
            var bills = [];
            var index =  Math.floor(Math.random() * Math.floor(topics.length));
            var index2 = Math.floor(Math.random() * Math.floor(2));


            await Axios.post('https://loopedin-backend.herokuapp.com/bills', {"topic": `${topics[index]}`})
                .then(function (response1) {
                    var data1 = response1.data["bills"];
                    var temp = {};
                    temp["short_title"] = data1[index2]["short_title"];
                    if(data1[index2]["sponsor_party"] == "D"){
                        temp["party"] = "Democrat";
                    }else if(data1[index2]["sponsor_party"] == "R"){
                        temp["party"] = "Republican";
                    }else{
                        temp["party"] = "Independent";
                    }
                    if (String(data1[index2]["committees"]).includes("House")) {
                        temp["area"] = "House of Representatives";
                    } else {
                        temp["area"] = "Senate";
                    }
                    temp["description"] = data1[index2]["summary_short"];


                    phrase += (`Ok ${name}, here is a bill that is currently being debated in Congress that you might be interested in. `);
                    phrase += (`The ${temp["party"]} group has introduced the ${temp["short_title"]} bill and it is currently being debated in the ${temp["area"]}. `);
                    phrase += (`Here is a description of this bill: ${temp["description"]}. `);
                    if(temp["area"] == "House of Representatives"){
                        if(rep["Position"] == temp["party"]){
                            phrase += (`It seems that your representative supports this bill. Would you like to thank Representative ${rep["Name"]} or voice your opinion to Representative ${rep["Name"]}. `);
                        }else{
                            phrase += (`It seems that your representative does not support this bill. Would you like to thank Representative ${rep["Name"]} or voice your opinion to Representative ${rep["Name"]}. `);
                        }
                    }else{
                        if(senators[0]["Position"] != temp["party"] && senators[1]["Position"] != temp["party"]){
                            phrase += (`It seems that none of your senators support this bill. Would you like to thank Senators ${senators[0]["Name"]} and ${senators[1]["Name"]} or voice your opinion to them? `)
                        }else if(senators[0]["Position"] == temp["party"] && senators[1]["Position"] != temp["party"]){
                            phrase += (`It seems that Senator ${senators[0]["Name"]} supports this bill while Senator ${senators[1]["Name"]} does not. Would you like to speak to one? `);
                        }else if(senators[0]["Position"] != temp["party"] && senators[1]["Position"] == temp["party"]){
                            phrase += (`It seems that Senator ${senators[1]["Name"]} supports this bill while Senator ${senators[0]["Name"]} does not. Would you like to speak to one? `);
                        }else{
                            phrase += (`Ift seems that none of your senators support this bill. Would you like to thank Senators ${senators[0]["Name"]} and Senator ${senators[1]["Name"]} or voice your opnion to them? `);

                        }
                    }

                });
        });
   res.json({"Result": phrase});

});




app.listen(process.env.PORT);
module.exports = app;
