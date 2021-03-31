const express = require("express");
const app = express();
const fetch = require("node-fetch");
app.use(express.static('public'));

let apiKey = '143618f1ecf17bbf953c258e3bf1cf5b';

app.get("/weather/city", function(request, response){
    let cityName = request.query.q;
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`).            
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
});
app.get("/weather/coordinates", function(request, response){
    response.send("<h2>Suck, Express!</h2>");
});
app.get("/favourites", function(request, response){
     
    
    response.send("<h2>Suck, Express!</h2>");
});
app.post("/favourites", function(request, response){
     
    
    response.send("<h2>Suck, Express!</h2>");
});
app.delete("/favourites", function(request, response){
     
    
    response.send("<h2>Suck, Express!</h2>");
});

app.listen(3000);