const RECIEVER_EMAIL_ADDRESS = "reciever@domain.com";
const SENDER_ALIAS = "sender@domain.com";
const ERROR_EMAIL_ADDRESS = "tech@support.com";
const EMAIL_TEMPLATE_FILE = "emailTemplate";

const DATES_TO_SKIP = [ // weekends are automatically skipped
    "Jan 20, 2025",
    "Feb 17, 2025",
    "Mar 14, 2025 - Mar 17, 2025",
    "Apr 17, 2025 - Apr 21, 2025",
];

function doGet(e) {
    const todaysDate = new Date();
    const skipdates = skipdateStringsToDates(DATES_TO_SKIP);
    if (dateIsNotAWeekendOrSkipDay(todaysDate, skipdates)) {
        const todaysWeather = getTodaysWeatherString(todaysDate);
        const todaysBirthdays = getBirthdaysString(todaysDate);
        const todaysLunch = getLunchMenuString(todaysDate);
        const todaysSpecialDays = getSpecialDaysString(todaysDate, skipdates);
        
        const emailSubject = "Announcement Info for " + Utilities.formatDate(todaysDate, "GMT-6", "EEEE, MMMM d y");
        var emailBody = compileAnnouncementEmail(todaysDate, todaysWeather, todaysBirthdays, todaysLunch, todaysSpecialDays);
        
        Logger.log("Sending email to '%s'\nSubject:\n\t%s\nEmail Body:\n%s", RECIEVER_EMAIL_ADDRESS, emailSubject, emailBody);
        GmailApp.sendEmail(RECIEVER_EMAIL_ADDRESS, emailSubject, emailBody, {htmlBody: emailBody, from: SENDER_ALIAS});
    }
}

function skipdateStringsToDates(skipdateStrings) {
    const datePattern = /^[A-Z][a-z]{2,3} \d{1,2}, \d{4}$/;
    const dateRangePattern = /^[A-Z][a-z]{2,3} \d{1,2}, \d{4} - [A-Z][a-z]{2,3} \d{1,2}, \d{4}$/;

    const skipdates = [];
    for (const skipdateString of skipdateStrings) {
        if (datePattern.test(skipdateString)) {
            skipdates.push([new Date(skipdateString)]);
        }
        else if (dateRangePattern.test(skipdateString)) {
            const [startStr, endStr] = skipdateString.split(" - ");
            skipdates.push([new Date(startStr), new Date(endStr)]);
        }
        else {
            Logger.log("Invalid format on date to skip: %s", skipdateString);
        }
    }
    return skipdates;
}

function dateIsNotAWeekendOrSkipDay(date, skipdates) {
    if (date.getDay() < 1 || date.getDay() > 5) {
        return false;
    }

    for (const skipdate of skipdates) {
        if (datesAreSameDay(date, skipdate[0])) {
            return false;
        }
        if (skipdate.length == 2 
            && (datesAreSameDay(date, skipdate[1]) || (skipdate[0] < date && date < skipdate[1]))) {
            return false;
        }
    }
    return true;
}

function datesAreSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() 
        && date1.getMonth() === date2.getMonth() 
        && date1.getDate() === date2.getDate();
}

function getTodaysWeatherString(todaysDate) {
    const todaysForcast = getWeatherForcast();
    var weatherString = "";
    if (typeof todaysForcast === 'object') {
        weatherString += todaysForcast.description + ".<ul>";
        weatherString += "<li>High: " + todaysForcast.highTemp + "°F</li>";
        weatherString += "<li>Low: " + todaysForcast.lowTemp + "°F</li>";

        if (todaysForcast.precipChance > 30) {
            weatherString += "<li>Precipitation: " + todaysForcast.precipChance + "% ";
            if (todaysForcast.rainMeasure > 0.5) {
                weatherString += todaysForcast.rainMeasure.toFixed(1) + "in rain<br></li>";
            }
            else if (todaysForcast.snowMeasure > 0.5) {
                weatherString += todaysForcast.snowMeasure.toFixed(1) + "in snow<br></li>";
            }
            else if (todaysForcast.iceMeasure > 0.5) {
                weatherString += todaysForcast.iceMeasure.toFixed(1) + "in ice<br></li>";
            }
            else {
                weatherString += "</li>";
            }
        }
        if (todaysForcast.windSpeed > 10) {
            weatherString += "<li>Wind: Up to " + todaysForcast.windSpeed + "mi/h from " + todaysForcast.windDirection + "</li>";
        }
        if (datesAreSameDay(todaysForcast.headlineDate, todaysDate)) {
            weatherString += "<li>" + todaysForcast.headline + "</li>";
        }
        weatherString += "</ul>";
    }
    else { // encountered an error
        weatherString = todaysForcast;
        GmailApp.sendEmail(ERROR_EMAIL_ADDRESS, "Error in Morning Announcement Generation", weatherString, {from: SENDER_ALIAS});
    }
    return weatherString;
}

function getBirthdaysString(date) {
    var [studentNames, teacherNames] = getICBirthdays(date);
    teacherNames = getSheetBirthdays(date); // get teachers from sheet that includes associates

    var birthdayString = "";
    if (Array.isArray(studentNames) && studentNames.length > 0) {
        birthdayString += "Students:<ul><li>" + studentNames.join("</li><li>") + "</li></ul>";
    }
    if (Array.isArray(teacherNames) && teacherNames.length > 0) {
        birthdayString += "Teachers:<ul><li>" + teacherNames.join("</li><li>") + "</li></ul>";
    }
    
    if (birthdayString === "") { 
        if (studentNames !== "" || teacherNames !== "") { // encountered an error
            birthdayString = studentNames + "\n<br>" + teacherNames;
            GmailApp.sendEmail(ERROR_EMAIL_ADDRESS, "Error in Morning Announcement Generation", birthdayString, {from: SENDER_ALIAS});
        }
        else {
            birthdayString += "No birthdays today.";
        }
    }
    return birthdayString;
}

function getLunchMenuString(date) {
    return "Menu unavailable digitally.";
}

function getSpecialDaysString(date, skipdates) {
    const specialDays = getSpecialDays(date, skipdates);

    var specialDaysString = "<ul>";
    for (const dayType of specialDays) {
        specialDaysString += "<li>" + dayType[0] + ": " + dayType[1] + "</li>"
    }
    specialDaysString += "</ul>"
    return specialDaysString;
}

function compileAnnouncementEmail(date, weather, birthdays, lunch, specialDays) {
    var emailBody = HtmlService.createHtmlOutputFromFile(EMAIL_TEMPLATE_FILE).getContent();
    emailBody = emailBody.replace("%date", Utilities.formatDate(date, "GMT-6", "EEEE, MMMM d y"));
    emailBody = emailBody.replace("%weather", weather);
    emailBody = emailBody.replace("%birthdays", birthdays);
    emailBody = emailBody.replace("%lunch", lunch);
    emailBody = emailBody.replace("%specialDays", specialDays);
    return emailBody;
}