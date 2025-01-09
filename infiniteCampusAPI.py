from datetime import date
import requests

TOKEN_URL = "https://iacloud2.infinitecampus.org/campus/oauth2/token?appName=***********"
CLIENT_ID = "***********"
CLIENT_SECRET = "***********"
API_URL = "https://iacloud2.infinitecampus.org/campus/api/oneroster/v1p2/***********/ims/oneroster/"

def main():
    birthdayIDs = getBirthdayIDs(date.today())
    names = getNamesFromID(birthdayIDs)
    print(names)


# Pulls data from local Davis WeatherLink sensor
def getBirthdayIDs(givenDate: date) -> list[str]:
    try:
        url = API_URL + "rostering/v1p2/demographics"
        parameters = {
            "fields": "sourcedId,birthDate",
            "limit": 5000
        }
        headers = {"Authorization": "Bearer " + getOAuthToken}
        response = requests.get(url, parameters, headers=headers)

        dateStr = givenDate.strftime("%m-%d")
        birthdayIDs = []
        for responseDict in response.json()["demographics"]:
            if ("birthDate" in responseDict and "sourcedId" in responseDict
                and responseDict["birthDate"][5:] == dateStr):
                birthdayIDs.append(responseDict["sourcedId"])
        return birthdayIDs
    except Exception as e:
        print("Error with request: ", e)
        return ["ERROR REQUESTING DEMOGRAPHICS DATA"]

def getNamesFromID(ids: list[str]) -> list[str]:
    try:
        url = API_URL + "rostering/v1p2/users/"
        parameters = {
            "fields": "givenName,familyName", # TODO: limit to students
            "limit": 1
        }
        headers = {"Authorization": "Bearer " + getOAuthToken} # TODO: Use existing token

        names = []
        for id in ids:
            idURL = url + id
            response = requests.get(idURL, parameters, headers=headers)
            print(response.json())
        return names
    except Exception as e:
        print("Error with request: ", e)
        return ["ERROR REQUESTING USER DATA"]


def getOAuthToken() -> str:
    tokenReqPayload = {"grant_type": "client_credentials"}
    tokenResponse = requests.post(TOKEN_URL, tokenReqPayload, auth=(CLIENT_ID, CLIENT_SECRET))
    if tokenResponse.status_code != 200:
        print("ERROR FETCHING OAUTH2 TOKEN")
        raise Exception("ERROR FETCHING OAUTH2 TOKEN")
    return tokenResponse.json()["access_token"]

if __name__ == "__main__":
    main()