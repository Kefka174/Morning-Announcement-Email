# Morning Announcement Email Generator
Generates an email with morning announcement information for small school use.

It consolidates:
1. Daily weather forecast
	- Using AccuWeather's forecast API
2. Student and staff birthdays
	- Using Infinite Campus' OneRoster API and Google Sheets integration
3. School Lunch Menu
	- Unimplemented
4. Scheduled day rotation
5. Pledge of Allegiance
6. Upcoming Holidays

Runs as a **Google Apps Script** to take advantage of their Google Sheets integration, execution scheduling, and configuration access sharing.

# Configuration
## Skipdates and End-Date
Dates to be skipped are defined near the top of announcement.js.<sup>*</sup> They can be added as individual dates, or as date ranges (inclusive).\
Weekends are automatically considered to be skipdates.
```js
const DATES_TO_SKIP = [ // Weekends are automatically skipped
    "Jan 20, 2025",
    "Feb 17, 2025",
    "Mar 14, 2025 - Mar 17, 2025",
    "Apr 17, 2025 - Apr 21, 2025",
];
```
- Announcements will not be generated on skipdates.
- Skipdates, like weekends, are not included in scheduled day rotation calculations.
- Upcoming skipdates are included at the bottom of the announcement.

The End-Date is the date on and after which announcements will no longer be generated. Should be set to the first day after the season/semester/year ends.

<sub>\*may be moved to a Google Sheet in the future for further ease of access.</sub>

## Weather API
The daily weather forecast is generated using [AccuWeather's Forecast API](https://developer.accuweather.com/apis).

Some forecast values are only included in the announcement if they are above a threshold.
- Precipitation is only included if the precipitation chance is above 30%
- Individual precipitation types (rain, snow, or ice) are only included if there's more than half an inch forecasted
- Wind speed and direction are only included if the wind speed is above 10mi/h

## Infinite Campus OneRoster API
Student and Staff birthdays are pulled from Infinite Campus using the [OneRoster API](https://campuslearning.com/developers/home). Within Infinite Campus it can be set up and configured through the Digital Learning Applications Configuration tool.

Results are limited to a singular school using a `schoolSourceId` that can be taken from OneRoster's getAllSchools call (callable from the Troubleshooting Documentation list of calls by clicking **_Try it out_**).\
![Screenshot 2025-02-12 120532](https://github.com/user-attachments/assets/586d1458-ee60-4db4-acab-5aeaa5f4b4ad)


**OneRoster returns results for teachers only.** Associates and Support Staff are not included in the API response.

## Google Sheet Integration
Because Infinite Campus OneRoster limits results to teachers only, not including associates or support staff, a google sheet is used to supply a complete list of Staff birthdays.

The expected coloumn format is Last name, First name, Birthdate with the date having the month string followed by the number. Row ordering does not matter.\
![Screenshot 2025-02-12 123150](https://github.com/user-attachments/assets/c7ae588a-b2ae-44ad-92dc-4545dd0b76a3)

