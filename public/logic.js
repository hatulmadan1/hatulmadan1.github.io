let apiKey = '143618f1ecf17bbf953c258e3bf1cf5b';
let selectedLog = [];

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
    //console.log(txt);
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

function setSelected(txt, obj, startup) {
    let newCity = obj;
    let info = parseData(txt);
    let i = 0;
    for (let j = 1; j < 10; j += 2) {
        newCity.childNodes[9].childNodes[j].childNodes[1].innerHTML = info[i++]
    }
    //let userCityName = newCity.childNodes[1].innerHTML;
    newCity.childNodes[1].innerHTML = info[i++];
    newCity.childNodes[5].src = `http://openweathermap.org/img/wn/${info[i++]}@4x.png`;
    newCity.childNodes[3].innerHTML = Math.round(info[i++]) + '&#176C';
    newCity.childNodes[7].addEventListener("click", 
        evt =>
        {
            let concreteButtonParent = evt.currentTarget.parentElement;
            evt.currentTarget.disabled = true;
            //let position = selectedLog.indexOf(concreteButtonParent.childNodes[1].innerHTML);
            //selectedLog.splice(position, 1);
            //localStorage.setItem('selected', JSON.stringify(selectedLog));
            fetch(`http://localhost:3000/favourites`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                    },
                body: JSON.stringify({ cityName: concreteButtonParent.childNodes[1].innerHTML})
            }).then(res => {
                if(!res.ok) {
                    throw new Error();
                }

                concreteButtonParent.parentElement.removeChild(concreteButtonParent);
            })
            .catch(err => {
                console.error("Delete from DB failed", err);
                window.alert("Sorry, deleting DB failed. Check your internet connection");
            });
        }
    );

    newCity.childNodes[11].classList.add('hidden');
    newCity.childNodes[9].classList.remove('hidden');

    selectedLog.push(newCity.childNodes[1].innerHTML);

    //localStorage.setItem('selected', JSON.stringify(selectedLog));
    if (!startup) {
        //console.log(newCity.childNodes[1].innerHTML);
        fetch(`http://localhost:3000/favourites`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json;charset=utf-8"
                    },
                body: JSON.stringify({ cityName: newCity.childNodes[1].innerHTML})
            }).then(res => {
                if(!res.ok) {
                    throw new Error();
                }
            })
            .catch(err => {
                console.error("Add to DB failed", err);
                window.alert("Sorry, adding to DB failed. Check your internet connection");
                if (obj != undefined) {
                    obj.remove();
                }
            });
    }
    
    //console.log(localStorage.getItem('selected'));
}

function getParsedData(request, type, obj, startup) {
    console.log(request);
    fetch(request).            
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
                if (type === cardType.Header) {
                    setActualInfoCurrent(txt);
                }
                else if (type === cardType.Selected) {
                    setSelected(txt, obj, startup);
                }
            }
        ).
        catch(
            err => {
                console.error("API error. Fetch failed: ", err);
                window.alert("Sorry, fetch failed. Check your internet connection or city name");
                if (obj != undefined) {
                    obj.remove();
                }
            }
        );
}

function getAPIDataByCoords(lat, lon) {
    getParsedData(`http://localhost:3000/weather/coordinates?lat=${lat}&lon=${lon}`, cardType.Header);
}

function getAPIDataByName(cityName, startup) {
    console.log(cityName);
    getParsedData(`http://localhost:3000/weather/city?q=${cityName}`, 
    cardType.Selected, 
    document.querySelector('.selected_cities').lastElementChild,
    startup
    );
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

document.querySelector('form.selected_input').addEventListener("submit", 
    evt => {
        evt.preventDefault();
        document.querySelector('.selected_cities').appendChild(tmpl.content.cloneNode(true));

        let cityName = document.querySelector('form.selected_input input').value;
        document.querySelector('.selected_cities').lastElementChild.childNodes[1].innerHTML = cityName;
        getAPIDataByName(cityName, false);
        document.querySelector('form.selected_input input').value='';
    }
);

function loadFromDB() {
    startup = true;
    fetch(`http://localhost:3000/favourites`).            
        then(
            res => {
                if (!res.ok) {
                    throw new Error("Failed to get DB data");
                }

                return res.json()
            }
        ).
        then(
            txt => {
                //console.log(txt);
                txt.forEach(element => {
                    document.querySelector('.selected_cities').appendChild(tmpl.content.cloneNode(true));
                    document.querySelector('.selected_cities').lastElementChild.childNodes[1].innerHTML = element;
                    //console.log(element);
                    getAPIDataByName(element, true);
                });
            }
        ).
        catch(
            err => {
                console.error("DB error. Fetch failed: ", err);
                window.alert("Sorry, fetch failed. Troubles with DB");
            }
        );
    startup = false;
}

loadCurrentData();
loadFromDB();
