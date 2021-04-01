const express = require("express");
const app = express();
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.json());
const url = "mongodb://localhost:27017/";
//const mongoClient = new MongoClient(url, { useUnifiedTopology: true, useNewUrlParser: true });

let apiKey = '143618f1ecf17bbf953c258e3bf1cf5b';

function processQuery(query, response) {
    fetch(query).            
    then(
        res => {
            if (!res.ok) {
                throw new Error("Failed to get API data.");
            }

            return res.json()
        }
    ).
    then(
        txt => {
            response.status(200).send(txt);
        }
    ).
    catch(
        err => {
            response.status(500).send('Sorry, now response available');
        }
    );
}

app.get("/weather/city", function(request, response){
    let cityName = request.query.q;
    processQuery(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`, response);
});
app.get("/weather/coordinates", function(request, response){
    let lat = request.query.lat;
    let lon = request.query.lon;
    processQuery(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`, response);
});
app.get("/favourites", function(request, response){
    MongoClient.connect("mongodb://localhost:27017/", { useNewUrlParser: true, useUnifiedTopology: true }, function(err, client){
        const db = client.db("citiesdb");
        const collection = db.collection("cities");
        
        collection.find().toArray(function(err, results){
            let result = [];
            results.forEach(elem => {result.push(elem.name)});
            console.log(results);
            response.status(200).send(JSON.stringify(result));
            

            if(err){
                response.status(500).send("Loading from DB failed");
                return console.log(err);
            }
        });

        if(err){
            response.status(500).send("Loading from DB failed");
            return console.log(err);
        }
        //client.close();
    });
    
});
app.post("/favourites", function(request, response){
    let newCity = request.body.cityName;
    MongoClient.connect("mongodb://localhost:27017/", { useNewUrlParser: true, useUnifiedTopology: true }, function(err, client){
        //const db = client.db("citiesdb");
        //const collection = db.collection("cities");

        client.db("citiesdb").collection("cities").insertOne({'name': newCity}, function(err, results){
            console.log(results);

            /*if(err){
                response.status(500).send("Adding to DB failed");
                return console.log(err);
            }*/
        });

        if(err){
            response.status(500).send("Adding to DB failed");
            return console.log(err);
        }

        //client.close();
    });
    response.status(200).send("Added succesfully");
});
app.delete("/favourites", function(request, response){
    let cityToDelete = "";                              //how to get from delete??
    mongoClient.connect(function(err, client){
        const db = client.db("citiesdb");

        if(err) 
        {
            response.status(500).send("Deleting failed");
            return console.log(err);
        }
          
        db.collection("cities").deleteOne({name: cityToDelete}, function(err, result){
                  
            console.log(result);
            client.close();
            if(err) 
            {
                response.status(500).send("Deleting failed");
                return console.log(err);
            }
        });
    });
    response.status(200).send("Deleted succesfully");
});

app.listen(3000);
