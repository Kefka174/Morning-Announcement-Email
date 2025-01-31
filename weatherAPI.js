const LOCATION_KEY = "51360";
const WEATHER_API_URL = "http://dataservice.accuweather.com/forecasts/v1/daily/1day/";
const WEATHER_API_KEY = "itsFreeOnTheirWebsite";

// AccuWeather Daily Forcast API
function getWeatherForcast() {
    try {
        const parameters = {
            apikey: WEATHER_API_KEY,
            details: true,
        };
        
        const url = buildUrl_(WEATHER_API_URL + LOCATION_KEY, parameters);
        const response = UrlFetchApp.fetch(url);
        const responseData = JSON.parse(response.getContentText());
        
        const todaysForcast = {
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
        
        return todaysForcast;
    }
    catch (err) {
        Logger.log("Error Caught: %s", err.message);
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