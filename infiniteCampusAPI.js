const IC_TOKEN_URL = "https://tokenurl.com";
const IC_CLIENT_ID = "123456789";
const IC_CLIENT_SECRET = "sUpErSeCrEt";
const IC_API_URL = "https://iacloud2.infinitecampus.org/more";
const SCHOOL_ID = "school-string";

const TEMPTOKEN = "usedForTesting";

function getICBirthdays(date) {
    try {
        const token = TEMPTOKEN;
        const birthdayIDs = getBirthdayIDs(date, token);
        const studentNames = getSchoolNamesFromID(birthdayIDs, "students", token);
        const teacherNames = getSchoolNamesFromID(birthdayIDs, "teachers", token);

        return [studentNames, teacherNames];
    }
    catch (err) {
        Logger.log("Error Caught: %s", err.message);
        return ["ERROR REQUESTING DEMOGRAPHICS DATA"];
    }
}

function getBirthdayIDs(date, token) {
    const options = {
        headers: {
            Authorization: "Bearer " + token
        }
    };
    const parameters = {
        fields: "sourcedId,birthDate",
        limit: 5000
    };
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

function getSchoolNamesFromID(ids, group, token) {
    const options = {
        headers: {
            Authorization: "Bearer " + token
        }
    };
    const parameters = {
        filter: "sourcedId='" + ids.join("' OR sourcedId='") + "'",
        fields: "givenName,familyName",
        limit: 1
    };
    const baseUrl = API_URL + "rostering/v1p2/schools/" + SCHOOL_ID + '/' + group;
    const url = buildUrl_(baseUrl, parameters);
    const response = UrlFetchApp.fetch(url, options);
    const responseData = JSON.parse(response.getContentText());
    
    const names = [];
    for (user of responseData["users"]) {
        names.push(user["givenName"] + " " + user["familyName"]);
    }
    return names;
}

function getOAuthToken() {
    const options = {
        payload: {
            grant_type: "client_credentials"
        },
        headers: {
            Authorization: "Basic " + Utilities.base64Encode(IC_CLIENT_ID + ':' + IC_CLIENT_SECRET)
        }
    };
    const response = UrlFetchApp.fetch(IC_TOKEN_URL, options);
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