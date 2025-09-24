const WEATHER_API_URL = "http://api.weatherapi.com/v1/forecast.json?key={API key}&q={query}&days=1&aqi=no&alerts=no";
const WEATHER_API_KEY = "itsFreeOnTheirWebsite";
const WEATHER_API_QUERY = "51360";

// WeatherAPI.com Forecast API
function getWeatherForecast() {
    try {
        let url = WEATHER_API_URL;
        url = url.replace("{API key}", WEATHER_API_KEY);
        url = url.replace("{query}", WEATHER_API_QUERY);

        const response = UrlFetchApp.fetch(url);
        const responseData = JSON.parse(response.getContentText());
        const responseForecast = responseData.forecast.forecastday[0].day;

        const todaysForecast = {
            description: responseForecast.condition.text,
            highTemp: responseForecast.maxtemp_f,
            lowTemp: responseForecast.mintemp_f,
            rainChance: responseForecast.daily_chance_of_rain,
            snowChance: responseForecast.daily_chance_of_snow,
            precipMeasure: responseForecast.totalprecip_in,
            windSpeed: responseForecast.maxwind_mph,
        };
        
        return todaysForecast;
    }
    catch (err) {
        Logger.log(`Error Caught: ${err.message}`);
        return err.message;
    }
}



// const LOCATION_KEY = "51360";
// const WEATHER_API_URL = "http://dataservice.accuweather.com/forecasts/v1/daily/1day/";
// const WEATHER_API_KEY = "itsFreeOnTheirWebsite";

// AccuWeather Daily Forecast API
function accuWeatherWeatherForecast() {
    try {
        const parameters = {
            apikey: WEATHER_API_KEY,
            details: true,
        };
        
        const url = buildUrl_(WEATHER_API_URL + LOCATION_KEY, parameters);
        const response = UrlFetchApp.fetch(url);
        const responseData = JSON.parse(response.getContentText());
        
        const todaysForecast = {
            headline: responseData.Headline.Text,
            headlineDate: new Date(responseData.Headline.EffectiveDate),
            highTemp: responseData.DailyForecasts[0].Temperature.Maximum.Value,
            lowTemp: responseData.DailyForecasts[0].Temperature.Minimum.Value,
            description: responseData.DailyForecasts[0].Day.ShortPhrase,
            precipChance: responseData.DailyForecasts[0].Day.PrecipitationProbability,
            rainMeasure: responseData.DailyForecasts[0].Day.Rain.Value,
            snowMeasure: responseData.DailyForecasts[0].Day.Snow.Value,
            iceMeasure: responseData.DailyForecasts[0].Day.Ice.Value,
            windSpeed: responseData.DailyForecasts[0].Day.Wind.Speed.Value,
            windDirection: responseData.DailyForecasts[0].Day.Wind.Direction.English,
        };
        
        return todaysForecast;
    }
    catch (err) {
        Logger.log(`Error Caught: ${err.message}`);
        return err.message;
    }
}


// GoogleWorkspace OAuth2 Library url builder
// https://github.com/googleworkspace/apps-script-oauth2
function buildUrl_(url, params) {
    var paramString = Object.keys(params).map(function(key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + paramString;
}