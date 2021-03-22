//get current locaton start

let crd;
document.querySelector('.loading').classList.remove('hidden');
document.querySelector('.current_city').classList.add('hidden');

function success(pos) {
    crd = pos.coords;
  
    console.log('Ваше текущее местоположение:');
    console.log(`Широта: ${crd.latitude}`);
    console.log(`Долгота: ${crd.longitude}`);
    console.log(`Плюс-минус ${crd.accuracy} метров.`);

    fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${crd.latitude}&lon=${crd.longitude}&appid=143618f1ecf17bbf953c258e3bf1cf5b&units=metric`).
            then(
                res => {
                    return res.json()
                }).
            then(
                txt => {
                    console.log(txt);
                    let info = [];
                    info.push(`${txt.wind.speed} m/s`);
                    info.push(txt.weather[0].main);
                    info.push(`${txt.main.pressure} hPa`);
                    info.push(`${txt.main.humidity}%`);
                    info.push(`[${txt.coord.lat}, ${txt.coord.lon}]`)
                    let currentCityFields = document.querySelectorAll('#current ul li span.weather_value');
                    let i = 0;
                    currentCityFields.forEach(element => {
                        element.innerHTML =info[i++];
                    });

                    document.querySelector('#current_name').innerHTML = txt.name;
                    document.querySelector('#current_temp').innerHTML = Math.round(txt.main.temp) + '&#176C';

                    document.querySelector('.loading').classList.add('hidden');
                    document.querySelector('.current_city').classList.remove('hidden');
                });
};
  
function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
};

console.log(navigator.geolocation.getCurrentPosition(success, error));

//get current location end
//get weather data start



//get weather data end

let currentCityFields = document.querySelectorAll('#current ul li span.weather_value');
currentCityFields.forEach(element => {
    element.innerHTML = "hello"
});