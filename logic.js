let apiKey = '143618f1ecf17bbf953c258e3bf1cf5b';

var cardType = {
    Header: 0,
    Selected: 1
};

function parseData(txt) {
    let info = [];
    info.push(`${txt.wind.speed} m/s`);
    info.push(txt.weather[0].main);
    info.push(`${txt.main.pressure} hPa`);
    info.push(`${txt.main.humidity}%`);
    info.push(`[${txt.coord.lat}, ${txt.coord.lon}]`);
    info.push(txt.name);
    info.push(txt.weather[0].icon);
    info.push(txt.main.temp);
    return info;
}

function setActualInfoCurrent(txt) {
    console.log(txt);
    let info = parseData(txt);
    let currentCityFields = document.querySelectorAll('#current ul li span.weather_value');
    let i = 0;
    currentCityFields.forEach(element => {
        element.innerHTML =info[i++];
    });

    document.querySelector('#current_name').innerHTML = info[i++];
    document.querySelector('#current_img').src = `http://openweathermap.org/img/wn/${info[i++]}@4x.png`;
    document.querySelector('#current_temp').innerHTML = Math.round(info[i++]) + '&#176C';

    
    document.querySelector('.loading').classList.add('hidden');
    document.querySelector('.current_city').classList.remove('hidden');
}

function setSelected(txt) {
    let newCity = document.querySelector('.selected_cities').lastElementChild;
    let info = parseData(txt);
    let i = 0;
    for (let j = 1; j < 10; j += 2) {
        newCity.childNodes[9].childNodes[j].childNodes[1].innerHTML = info[i++]
    }
    newCity.childNodes[1].innerHTML = info[i++];
    newCity.childNodes[5].src = `http://openweathermap.org/img/wn/${info[i++]}@4x.png`;
    newCity.childNodes[3].innerHTML = Math.round(info[i++]) + '&#176C';
}

function getParsedData(request, type) {
    fetch(request).            
        then(
            res => {
                return res.json()
            }
        ).
        then(
            txt => {
                if (type === cardType.Header) {
                    setActualInfoCurrent(txt);
                }
                else if (type === cardType.Selected) {
                    setSelected(txt);
                }
            }
        ).
        catch(
            err => {
                console.error("API error. Fetch failed: ", err, pos);

                onFail(err);
            }
        );
}

function getAPIDataByCoords(lat, lon) {
    getParsedData(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`, cardType.Header);
}

function getAPIDataByName(cityName) {
    getParsedData(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric`, cardType.Selected);
}

function loadCurrentData() {
    document.querySelector('.loading').classList.remove('hidden');
    document.querySelector('.current_city').classList.add('hidden');

    function success(pos) {
        let crd = pos.coords;
    
        console.log('Ваше текущее местоположение:');
        console.log(`Широта: ${crd.latitude}`);
        console.log(`Долгота: ${crd.longitude}`);
        console.log(`Плюс-минус ${crd.accuracy} метров.`);

        getAPIDataByCoords(crd.latitude, crd.longitude);
    };
    
    function error(err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);

        window.alert("Something went wrong. Trying to load data for default location...");

        getAPIDataByCoords(59.937500, 30.308611);
    };

    console.log(navigator.geolocation.getCurrentPosition(success, error));
}

document.querySelector('.refresh').addEventListener("click", function() { loadCurrentData() });

loadCurrentData();
document.querySelector('form.selected_input').addEventListener("submit", 
    evt => {
        evt.preventDefault();
        document.querySelector('.selected_cities').appendChild(tmpl.content.cloneNode(true));
        getAPIDataByName(document.querySelector('form.selected_input input').value);
        document.querySelector('form.selected_input input').value='';
        console.log("ass ＼(^o^)／"); 
    }
);