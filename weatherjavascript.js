Chart.register(ChartDataLabels);
const searchInput=document.querySelector('.search-input');
const apiKey="ceb51712fadce81c320fa8bf6ae2c630";
let favourites = JSON.parse(localStorage.getItem("favourites")) || [];
let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
searchInput.addEventListener("keydown", function (event){
    if(event.key==='Enter'){
        const city=searchInput.value.trim();
        if(city!=''){
            console.log("Searching for:",city);
            getWeather(city);
        }
    }
})
async function getWeather(city) {
city = city.trim();
const stateMap = {
"andhra pradesh":"Visakhapatnam",
"telangana":"Hyderabad",
"karnataka":"Bengaluru",
"tamil nadu":"Chennai",
"kerala":"Thiruvananthapuram",
"maharashtra":"Mumbai",
"gujarat":"Ahmedabad",
"rajasthan":"Jaipur",
"punjab":"Chandigarh",
"haryana":"Chandigarh",
"delhi":"New Delhi",
"uttar pradesh":"Lucknow",
"madhya pradesh":"Bhopal",
"west bengal":"Kolkata",
"odisha":"Bhubaneswar",
"bihar":"Patna",
"jharkhand":"Ranchi",
"assam":"Guwahati",
"goa":"Panaji",
"himachal pradesh":"Shimla",
"uttarakhand":"Dehradun",
"chhattisgarh":"Raipur"
};
if(stateMap[city.toLowerCase()]){
    city = stateMap[city.toLowerCase()];
}
const url = `https://api.openweathermap.org/data/2.5/weather?q=${city},IN&appid=${apiKey}&units=metric`;
const response = await fetch(url);
const data = await response.json();
if(data.cod !== 200){
    alert("City not found!");
    return;
}
console.log(data);
showCurrentWeather(data);
showCurrentCity(data);
addFavourite(data);
addRecentSearch(data);
updateWeatherNews(data);
getAirQuality(data.coord.lat, data.coord.lon);
getForecast(data.coord.lat, data.coord.lon);
updateMap(data.coord.lat, data.coord.lon, data.name);
}
function showCurrentWeather(data){
    document.querySelector(".temperature").textContent =
        `${Math.round(data.main.temp)}°C`;
    document.querySelector(".condition").innerHTML =
        `${data.weather[0].main} <i class="fa-solid fa-${getWeatherSymbol(data.weather[0].main)}"></i>`;
    document.querySelector(".feels-like").textContent =
        `${Math.round(data.main.feels_like)}°C`;
    document.querySelector(".max").textContent =
        `↑ ${Math.round(data.main.temp_max)}°C`;
    document.querySelector(".min").textContent =
        `↓ ${Math.round(data.main.temp_min)}°C`;
    document.querySelector(".humidity-value").textContent =
        `${data.main.humidity}%`;
    document.querySelector(".wind-value").textContent =
        `${Math.round(data.wind.speed*3.6)} km/h`;
    document.querySelector(".pressure-value").textContent =
        `${data.main.pressure} hPa`;
    document.querySelector(".visibility-value").textContent =
        `${(data.visibility/1000).toFixed(1)} km`;
    const visibility = (data.visibility / 1000).toFixed(1);
document.querySelector(".visibility-distance").textContent =
`${visibility} km`;
let status = "";
if (visibility >= 10) {
    status = "Excellent";
}
else if (visibility >= 5) {
    status = "Clear View";
}
else if (visibility >= 2) {
    status = "Moderate";
}
else {
    status = "Poor Visibility";
}
document.querySelector(".visibility-status").textContent = status;
    document.querySelector(".location-name").textContent =
        `${data.name}, ${data.sys.country}`;
    document.querySelector(".sunrise").textContent =
        new Date(data.sys.sunrise*1000).toLocaleTimeString([],{
            hour:"2-digit",
            minute:"2-digit"
        });
    document.querySelector(".sunset").textContent =
        new Date(data.sys.sunset*1000).toLocaleTimeString([],{
            hour:"2-digit",
            minute:"2-digit"
        });
    const deg = data.wind.deg || 0;
const directions = [
    "N", "NE", "E", "SE",
    "S", "SW", "W", "NW"
];
const dir = directions[Math.round(deg / 45) % 8];
document.querySelector(".wind-dir").textContent = dir;
document.querySelector(".wind-deg").textContent = `${deg}°`;
document.querySelector(".wind-speed").textContent =
`${Math.round(data.wind.speed * 3.6)} km/h`;
    updateAlerts(
        data.weather[0].main,
        Math.round(data.main.temp)
    );
}
async function getAirQuality(lat, lon){
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    const aqi = data.list[0].main.aqi;
const quality = document.querySelector(".quality");
let status = "";
if(aqi === 1){
    status = "Good";
}
else if(aqi === 2){
    status = "Fair";
}
else if(aqi === 3){
    status = "Moderate";
}
else if(aqi === 4){
    status = "Poor";
}
else if(aqi === 5){
    status = "Very Poor";
}
quality.textContent = `${status} (${aqi} AQI)`;
const aqui=document.querySelector(".aqui");
aqui.textContent=data.list[0].main.aqi;
const aqiStatus=document.querySelector(".aqi-status");
aqiStatus.textContent=status;
const pma=document.querySelector(".pma");
const pmb=document.querySelector(".pmb");
const o3 = document.querySelector(".O3");
pma.textContent = Math.round(data.list[0].components.pm2_5);
pmb.textContent = Math.round(data.list[0].components.pm10);
o3.textContent = `O₃ : ${Math.round(data.list[0].components.o3)}`;
}
function getWeatherCondition(code) {
    if (code === 0) return "Clear";
    if (code >= 1 && code <= 3) return "Cloudy";
    if (code >= 45 && code <= 48) return "Fog";
    if (code >= 51 && code <= 67) return "Drizzle";
    if (code >= 71 && code <= 77) return "Snow";
    if (code >= 80 && code <= 82) return "Rain";
    if (code >= 95) return "Storm";
 return "Unknown";
}
function getWeatherIcon(code) {
    if (code === 0) return "fa-solid fa-sun";
    if (code >= 1 && code <= 3) return "fa-solid fa-cloud-sun";
    if (code >= 45 && code <= 48) return "fa-solid fa-smog";
    if (code >= 51 && code <= 67) return "fa-solid fa-cloud-rain";
    if (code >= 71 && code <= 77) return "fa-solid fa-snowflake";
    if (code >= 80 && code <= 82) return "fa-solid fa-cloud-showers-heavy";
    if (code >= 95) return "fa-solid fa-bolt";
    return "fa-solid fa-cloud";
}
function updateAlerts(weather, temp){
    const alertTitles=document.querySelectorAll(".alert-content h3");
    const alertDesc=document.querySelectorAll(".alert-content p");
    const alertDate=document.querySelectorAll(".alert-content span");
    const today=new Date();
    const tomorrow=new Date(today);
    tomorrow.setDate(today.getDate()+1);
    const end=new Date(today);
    end.setDate(today.getDate()+3);
    const format=(date)=>{
        return date.toLocaleDateString("en-US",{
            day:"numeric",
            month:"short",
            year:"numeric"
        });
    };
    if(weather==="Rain" || weather==="Drizzle" || weather==="Thunderstorm"){
        alertTitles[0].textContent="Heavy Rain Alert";
        alertDesc[0].textContent="Rain expected in your area.";
        alertDate[0].textContent=format(tomorrow);
    }else{

        alertTitles[0].textContent="No Rain Alert";
        alertDesc[0].textContent="No significant rainfall expected.";
        alertDate[0].textContent="Today";

    }
    if(temp>=38){
        alertTitles[1].textContent="Heat Wave";
        alertDesc[1].textContent="Avoid outdoor activity during afternoon.";
        alertDate[1].textContent=`${format(today)} - ${format(end)}`;

    }
    else if(temp<=10){

        alertTitles[1].textContent="Cold Wave";
        alertDesc[1].textContent="Very low temperature expected.";
        alertDate[1].textContent=`${format(today)} - ${format(end)}`;

    }
    else{

        alertTitles[1].textContent="Normal Weather";
        alertDesc[1].textContent="No temperature warnings.";
        alertDate[1].textContent="Today";

    }

}
function updateWeatherNews(data){
    const title=document.querySelector(".news-title");
    const date=document.querySelector(".news-date");
    const image=document.querySelector(".news-image");
    const weather=data.weather[0].main;
    const temp=Math.round(data.main.temp);
    const city=data.name;
    let headlines=[];
    if(weather==="Clear"){
    headlines=[
        {
            text:`Bright sunshine continues across ${city}. Temperature around ${temp}°C with clear skies.`,
            image:"https://images.unsplash.com/photo-1501973801540-537f08ccae7b?auto=format&fit=crop&w=600&q=80"
        },
        {
            text:`Excellent conditions for outdoor activities throughout the day in ${city}.`,
            image:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80"
        },
        {
            text:`No significant weather disturbances are expected today.`,
            image:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80"
        }
    ];

}
else if(weather==="Clouds"){
    headlines=[
        {
            text:`Cloud cover remains over ${city} with pleasant temperatures.`,
            image:"https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=600&q=80"
        },
        {
            text:`Partly cloudy skies expected for most of the day.`,
            image:"https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=600&q=80"
        },
        {
            text:`Comfortable weather continues with low chances of rainfall.`,
            image:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80"
        }
    ];

}
else if(weather==="Rain" || weather==="Drizzle"){
    headlines=[
        {
            text:`Rain showers are affecting ${city}. Carry an umbrella before heading outside.`,
            image:"https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80"
        },
        {
            text:`Wet roads may slow traffic during the next few hours.`,
            image:"https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80"
        },
        {
            text:`Residents are advised to avoid waterlogged areas if rainfall increases.`,
            image:"https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&w=600&q=80"
        }
    ];

}
else if(weather==="Thunderstorm"){
    headlines=[
        {
            text:`Thunderstorms are developing around ${city}.`,
            image:"https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=600&q=80"
        },
        {
            text:`Lightning activity may continue during the evening.`,
            image:"https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=600&q=80"
        },
        {
            text:`Stay indoors until severe weather conditions improve.`,
            image:"https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?auto=format&fit=crop&w=600&q=80"
        }
    ];

}

else if(weather==="Snow"){
    headlines=[
        {
            text:`Snowfall continues across ${city}.`,
            image:"https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=600&q=80"
        },
        {
            text:`Roads may become slippery because of snow accumulation.`,
            image:"https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=600&q=80"
        },
        {
            text:`Residents are advised to wear warm clothing while travelling.`,
            image:"https://images.unsplash.com/photo-1517299321609-52687d1bc55a?auto=format&fit=crop&w=600&q=80"
        }
    ];
}
else if(weather==="Fog" || weather==="Mist"){
    headlines=[
        {
            text:`Dense fog has reduced visibility in ${city}.`,
            image:"https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=600&q=80"
        },
        {
            text:`Drivers should use low-beam headlights while travelling.`,
            image:"https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=600&q=80"
        },
        {
            text:`Morning travel may experience slight delays because of fog.`,
            image:"https://images.unsplash.com/photo-1487621167305-5d248087c724?auto=format&fit=crop&w=600&q=80"
        }
    ];
}
else{
    headlines=[
        {
            text:`Current weather in ${city} remains stable at ${temp}°C.`,
            image:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80"
        },
        {
            text:`No major weather changes are expected today.`,
            image:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80"
        },
        {
            text:`Keep checking the dashboard for live updates.`,
            image:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=600&q=80"
        }
    ];
}
    let index = Math.floor(Math.random() * headlines.length);
if(index === window.lastNewsIndex){
    index = (index + 1) % headlines.length;
}
window.lastNewsIndex = index;
const random = headlines[index];
    title.textContent=random.text;
    image.src=random.image;
date.textContent = `Updated Today • ${new Date().toLocaleTimeString([],{
    hour:"2-digit",
    minute:"2-digit"
})}`;
}
async function getForecast(lat, lon) {
    try {

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weathercode,dew_point_2m&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max&forecast_days=7&timezone=auto`;

        const response = await fetch(url);
        const data = await response.json();

        console.log(data);
    const forecastTimes = document.querySelectorAll(".hourly-forecast .forecast-time");
    const forecastTemps = document.querySelectorAll(".hourly-forecast .forecast-temp");
    const forecastConditions = document.querySelectorAll(".hourly-forecast .forecast-condition");
    const forecastIcons = document.querySelectorAll(".hourly-forecast .forecast-icon");
    const currentTime = new Date();
let startIndex = 0;

for (let i = 0; i < data.hourly.time.length; i++) {
    const forecastTime = new Date(data.hourly.time[i]);

    if (forecastTime >= currentTime) {
        startIndex = i;
        break;
    }
}
for (let i = 0; i < 7; i++) {

    const index = startIndex + i;

    const time = new Date(data.hourly.time[index]);

    forecastTemps[i].textContent =
        `${Math.round(data.hourly.temperature_2m[index])}°C`;

    forecastTimes[i].textContent =
        time.toLocaleTimeString("en-US", {
            hour: "numeric",
            hour12: true
        });

    forecastConditions[i].textContent =
        getWeatherCondition(data.hourly.weathercode[index]);

    forecastIcons[i].className =
        getWeatherIcon(data.hourly.weathercode[index]) + " forecast-icon";
}
    const dayTimes = document.querySelectorAll(".weekly-forecast .forecast-time");
    const dayIcons = document.querySelectorAll(".weekly-forecast .forecast-icon");
    const dayMax = document.querySelectorAll(".weekly-forecast .day-max");
    const dayMin = document.querySelectorAll(".weekly-forecast .day-min");
    const dayConditions = document.querySelectorAll(".weekly-forecast .day-condition");
    const dayRain = document.querySelectorAll(".weekly-forecast .day-rain");
    for (let i = 0; i < 7; i++) {
       const date = new Date(data.daily.time[i]);
        dayTimes[i].textContent = date.toLocaleDateString("en-US", {
        weekday: "short"
});
       dayMax[i].textContent = `↑ ${Math.round(data.daily.temperature_2m_max[i])}°C`;
       dayMin[i].textContent = `↓ ${Math.round(data.daily.temperature_2m_min[i])}°C`;    
       dayRain[i].textContent =`${data.daily.precipitation_probability_max[i]}%`;
       dayConditions[i].textContent =getWeatherCondition(data.daily.weathercode[i]);
       dayIcons[i].className = getWeatherIcon(data.daily.weathercode[i]) + " forecast-icon";
    }
    const uvValue = document.querySelector(".uv-value");
    const uvStatus = document.querySelector(".uv-status");

    const uv = Math.round(data.daily.uv_index_max[0]);

    uvValue.textContent = uv;

    if (uv <= 2)
        uvStatus.textContent = "Low";
    else if (uv <= 5)
        uvStatus.textContent = "Moderate";
    else if (uv <= 7)
        uvStatus.textContent = "High";
    else if (uv <= 10)
        uvStatus.textContent = "Very High";
    else
        uvStatus.textContent = "Extreme";

const dewValue = document.querySelector(".dew-value");
const dewStatus = document.querySelector(".dew-status");

const dew = Math.round(data.hourly.dew_point_2m[0]);

dewValue.textContent = `${dew}°C`;

if (dew < 10)
    dewStatus.textContent = "Dry";
else if (dew < 16)
    dewStatus.textContent = "Pleasant";
else if (dew < 20)
    dewStatus.textContent = "Comfortable";
else if (dew < 24)
    dewStatus.textContent = "Humid";
else
    dewStatus.textContent = "Very Humid";
const rainValue = document.querySelector(".rain-value");
const rainExpected = document.querySelector(".rain-expected");

const rain = data.daily.precipitation_probability_max[0];

rainValue.textContent = `${rain}%`;

if (rain >= 70)
    rainExpected.textContent = "Heavy Rain";
else if (rain >= 40)
    rainExpected.textContent = "Moderate Rain";
else if (rain >= 20)
    rainExpected.textContent = "Light Rain";
else
    rainExpected.textContent = "No Rain";
const labels=[];
const temperatures=[];

for(let i=0;i<8;i++){
    const index=startIndex+i;
    const time=new Date(data.hourly.time[index]);

    labels.push(
        time.toLocaleTimeString("en-US",{
            hour:"numeric",
            hour12:true
        })
    );

    temperatures.push(data.hourly.temperature_2m[index]);
}
temperatureChart.data.labels=labels;
temperatureChart.data.datasets[0].data=temperatures;
temperatureChart.update();
const rainLabels=[];
const rainData=[];

for(let i=0;i<7;i++){
    const date=new Date(data.daily.time[i]);

    rainLabels.push(
        date.toLocaleDateString("en-US",{
            weekday:"short"
        })
    );

    rainData.push(data.daily.precipitation_probability_max[i]);
}

rainChart.data.labels=rainLabels;
rainChart.data.datasets[0].data=rainData;
rainChart.update();
    } catch (error) {
        console.error(error);
    }
}
const ctx = document.querySelector("#temperatureChart").getContext("2d");
const gradient = ctx.createLinearGradient(0, 0, 0, 250);
gradient.addColorStop(0, "rgba(77,163,255,0.45)");
gradient.addColorStop(1, "rgba(77,163,255,0)");
const temperatureChart = new Chart(ctx, {
    type: "line",

    data: {
        labels: [
            "12 AM", "3 AM", "6 AM", "9 AM",
            "12 PM", "3 PM", "6 PM", "9 PM"
        ],
        datasets: [{
            data: [25, 26, 28, 30, 31, 29, 27, 26],
            borderColor: "#4fc3ff",
            backgroundColor: gradient,
            fill: true,
            tension: 0.55,
            pointRadius: 6,
            pointHoverRadius: 8,
            pointBackgroundColor: "#4fc3ff",
            borderWidth: 4,
            borderCapStyle: "round",
            borderJoinStyle: "round",
            pointBorderColor: "#ffffff",
            pointBorderWidth: 2
        }]
    },

    options: {
        layout: {
        padding: {
            top: 30
        }
    },
        responsive: true,
        maintainAspectRatio: false,

        animation: {
            duration: 1500,
            easing: "easeOutQuart"
        },

        plugins: {
            legend: {
                display: false
            },

            datalabels: {
                color: "#6B7280",
                anchor: "end",
                align: "top",
                formatter: (value) => value + "°",
                font: {
                    size: 12,
                    weight: "bold"
                }
            },

            tooltip: {
                backgroundColor: "#1F2937",
                titleColor: "#ffffff",
                bodyColor: "#ffffff",
                displayColors: false,
                cornerRadius: 10
            }
        },

        scales: {
            y: {
                display: false,
                grid: {
                    display: false
                }
            },

            x: {
                ticks: {
                    color: "#6B7280"
                },

                grid: {
                    display: false
                },

                border: {
                    display: false
                }
            }
        }
    }
});
const rainCtx=document.querySelector("#rainChart").getContext("2d");
const rainChart = new Chart(rainCtx, {
    type: "bar",

    data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],

        datasets: [{
            data: [20, 35, 60, 45, 30, 80, 25],
            backgroundColor: "#4fc3ff",
            borderRadius: 10,
            borderSkipped: false
        }]
    },

    options: {
        layout: {
            padding: {
                top: 20
            }
        },

        responsive: true,
        maintainAspectRatio: false,

        plugins: {
            legend: {
                display: false
            },

            datalabels: {
                color: "#555555",
                anchor: "end",
                align: "top",
                formatter: (value) => value + "%",
                font: {
                    weight: "bold",
                    size: 11
                }
            }
        },

        scales: {
            y: {
                display: false,
                beginAtZero: true,
                max: 100,
                grid: {
                    display: false
                }
            },

            x: {
                ticks: {
                    color: "#555555"
                },

                grid: {
                    display: false
                },

                border: {
                    display: false
                }
            }
        }
    }
});
let weatherMap;
let locationMarker;
let weatherLayer;

function initMap(lat = 17.6868, lon = 83.2185){

    weatherMap = L.map("weatherMap").setView([lat, lon], 6);

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: "&copy; OpenStreetMap"
        }
    ).addTo(weatherMap);

    weatherLayer = L.tileLayer(
        `https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`,
        {
            opacity:0.7
        }
    ).addTo(weatherMap);

    locationMarker = L.marker([lat,lon]).addTo(weatherMap);
}
function changeLayer(type){

    if(weatherLayer){
        weatherMap.removeLayer(weatherLayer);
    }

    let layer="clouds_new";

    if(type==="rain")
        layer="precipitation_new";

    if(type==="temp")
        layer="temp_new";

    if(type==="wind")
        layer="wind_new";

    weatherLayer=L.tileLayer(
        `https://tile.openweathermap.org/map/${layer}/{z}/{x}/{y}.png?appid=${apiKey}`,
        {
            opacity:0.7
        }
    ).addTo(weatherMap);
}
initMap();
renderFavourites();
renderRecentSearches();
getCurrentLocation();
function updateMap(lat, lon, city) {
    weatherMap.flyTo([lat, lon], 8);
    locationMarker.setLatLng([lat, lon]);
    locationMarker.setTooltipContent(city);
}
function showCurrentCity(data){
    const fav = document.getElementById("favCities");
    fav.innerHTML = `
        <div class="city-item">
            <h4>${data.name}</h4>
            <i class="fa-solid fa-${getWeatherSymbol(data.weather[0].main)}"></i>
            <span>${Math.round(data.main.temp)}°</span>
        </div>
    `;
}
function getWeatherSymbol(weather){
    switch(weather){
        case "Clear":
            return "sun";
        case "Clouds":
            return "cloud";
        case "Rain":
            return "cloud-rain";
        case "Thunderstorm":
            return "bolt";
        case "Snow":
            return "snowflake";
        case "Mist":
        case "Fog":
            return "smog";
        default:
            return "cloud";
    }
}
function addFavourite(data){
    const cityName = data.name;
    const existingIndex = favourites.findIndex(
        city => city.name === cityName
    );
    if(existingIndex !== -1){
        favourites.splice(existingIndex,1);
    }
    favourites.push({
        name: cityName,
        temp: Math.round(data.main.temp),
        weather: data.weather[0].main
    });
    if(favourites.length > 5){
        favourites.shift();
    }
    localStorage.setItem(
        "favourites",
        JSON.stringify(favourites)
    );
    renderFavourites();
}
function renderFavourites(){
    const fav=document.getElementById("favCities");
    fav.innerHTML="";
    favourites.forEach(city=>{
        fav.innerHTML += `
        <div class="city-item" onclick="getWeather('${city.name}')">
            <h4>${city.name}</h4>
            <i class="fa-solid fa-${getWeatherSymbol(city.weather)}"></i>
            <span>${city.temp}°</span>
        </div>`;
    });

}
function focusSection(id){
    const section = document.getElementById(id);
    section.classList.add("section-focus");
    setTimeout(() => {
        section.classList.remove("section-focus");
    }, 500);

}
function updateDateTime() {
    const now = new Date();
    const date = now.toLocaleDateString("en-US", {
        weekday:"long",
        day:"numeric",
        month:"long",
        year:"numeric"
    });
    const time = now.toLocaleTimeString("en-US", {
        hour:"2-digit",
        minute:"2-digit",
        hour12:true
    });
    const currentDate = document.querySelector("#current-date");
    const currentTime = document.querySelector("#current-time");
    if(currentDate){
        currentDate.textContent = date;
    }
    if(currentTime){
        currentTime.textContent = time;
    }
}
updateDateTime();
setInterval(updateDateTime, 1000);
function addRecentSearch(data){
    const city = {
        name: data.name,
        country: data.sys.country,
        temp: Math.round(data.main.temp),
        weather: data.weather[0].main
    };
    recentSearches = recentSearches.filter(
        item => item.name !== city.name
    );
    recentSearches.unshift(city);
    if(recentSearches.length > 5){
        recentSearches.pop();
    }
    localStorage.setItem(
        "recentSearches",
        JSON.stringify(recentSearches)
    );
    renderRecentSearches();
}
function renderRecentSearches(){
    const recentBox = document.getElementById("recentSearches");
    recentBox.innerHTML = "";
    recentSearches.forEach(city => {
        recentBox.innerHTML += `
        <div class="city-item" onclick="getWeather('${city.name}')">
            <h4>${city.name}, ${city.country}</h4>
            <i class="fa-solid fa-${getWeatherSymbol(city.weather)}"></i>
            <span>${city.temp}°C</span>
        </div>`;
    });

}
const sunButton = document.querySelector(".theme-btn:nth-child(1)");
const moonButton = document.querySelector(".theme-btn:nth-child(2)");
if(sunButton){
    sunButton.addEventListener("click",()=>{
        document.body.classList.add("light-theme");
    });
}
if(moonButton){
    moonButton.addEventListener("click",()=>{
        document.body.classList.remove("light-theme");
    });
}
function getCurrentLocation(){
    if(!navigator.geolocation){
        alert("Geolocation is not supported.");
        return;
    }
    navigator.geolocation.getCurrentPosition(
        async(position)=>{
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const url =
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
            const response = await fetch(url);
            const data = await response.json();
            showCurrentWeather(data);
            showCurrentCity(data);
            addFavourite(data);
            addRecentSearch(data);
            updateWeatherNews(data);
            getAirQuality(lat,lon);
            getForecast(lat,lon);
            updateMap(lat,lon,data.name);
        },
        ()=>{
            getWeather("Visakhapatnam");

        }
    );
}