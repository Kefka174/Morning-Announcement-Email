const TOKEN_URL = "https://tokenurl.com";
const CLIENT_ID = "123456789";
const CLIENT_SECRET = "sUpErSeCrEt";
const API_URL = "https://iacloud2.infinitecampus.org/more";

const TEMPTOKEN = "NothingYet";

function getICBirthdays(date) {
    try {
        var date = new Date();
        const ICToken = TEMPTOKEN; //////////////////////////
        const birthdayIDs = getBirthdayIDs(date);
        const names = getNamesFromID(birthdayIDs);
        return names;
    }
    catch (err) {
        Logger.log("Error Caught: %s", err.message);
        return ["ERROR REQUESTING DEMOGRAPHICS DATA"];
    }
}

function getBirthdayIDs(date) {
    const options = {
        headers: {
            Authorization: "Bearer " + TEMPTOKEN
        }
    };
    const parameters = {
        fields: "sourcedId,birthDate",
        limit: 5000
    }
    const url = buildUrl_(API_URL + "rostering/v1p2/demographics", parameters);
    const response = UrlFetchApp.fetch(url, options);
    const responseData = JSON.parse(response.getContentText());
    
    const dateStr = Utilities.formatDate(date, "GMT-6", "MM-dd");
    const birthdayIDs = [];
    for (person of responseData["demographics"]) {
        if (person["birthDate"]?.includes(dateStr)) {
            birthdayIDs.push(person["sourcedId"]);
        }
    }
    return birthdayIDs;
}

function getNamesFromID(ids) {
    const options = {
        headers: {
            Authorization: "Bearer " + TEMPTOKEN
        }
    };
    const parameters = {
        fields: "givenName,familyName", // TODO: limit to students
        limit: 1
    }
    const baseUrl = API_URL + "rostering/v1p2/users/";
    
    const names = [];
    for (id of ids) {
        const url = buildUrl_(baseUrl + id, parameters);
        const response = UrlFetchApp.fetch(url, options);
        const responseData = JSON.parse(response.getContentText());
        names.push(responseData["user"]["givenName"] + " " + responseData["user"]["familyName"]);
    }
    return names;
}

function getOAuthToken() {
    const options = {
        payload: {
            grant_type: "client_credentials"
        },
        headers: {
            Authorization: "Basic " + Utilities.base64Encode(CLIENT_ID + ':' + CLIENT_SECRET)
        }
    };
    const response = UrlFetchApp.fetch(TOKEN_URL, options);
    const responseData = JSON.parse(response.getContentText());

    return responseData["access_token"];
}


// GoogleWorkspace OAuth2 Library url builder
// https://github.com/googleworkspace/apps-script-oauth2
function buildUrl_(url, params) {
    var paramString = Object.keys(params).map(function(key) {
        return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
    }).join('&');
    return url + (url.indexOf('?') >= 0 ? '&' : '?') + paramString;
}