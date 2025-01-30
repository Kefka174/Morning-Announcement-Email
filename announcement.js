const RECIEVER_EMAIL_ADDRESS = "reciever@domain.com";
const SENDER_ALIAS = "sender@domain.com";
const ERROR_EMAIL_ADDRESS = "tech@support.com";
const EMAIL_TEMPLATE_FILE = "emailTemplate";

const DATES_TO_SKIP = [ // weekends are automatically skipped
    "Jan 20, 2025",
    "Feb 17, 2025",
    "Mar 14, 2025 - Mar 17, 2025",
    "Apr 17, 2025 - Apr 21, 2025"
];

function doGet(e) {
    const todaysDate = new Date();
    const todaysWeather = getTodaysWeather();
    const todaysBirthdays = getBirthdaysString(todaysDate);
    const todaysLunch = getLunchMenu(todaysDate);
    const todaysSpecialDays = getSpecialDaysString(todaysDate);

    const emailSubject = "Announcement Info for " + Utilities.formatDate(todaysDate, "GMT-6", "EEEE, MMMM d y");
    var emailBody = compileAnnouncementEmail(todaysDate, todaysWeather, todaysBirthdays, todaysLunch, todaysSpecialDays);

    Logger.log("Sending email to '%s'\nSubject:\n\t%s\nEmail Body:\n%s", RECIEVER_EMAIL_ADDRESS, emailSubject, emailBody);
    // GmailApp.sendEmail(RECIEVER_EMAIL_ADDRESS, emailSubject, emailBody, {from: SENDER_ALIAS});
}

function getTodaysWeather() {
    const todaysForcast = getWeatherForcast();
    var weatherString = "";
    if (typeof todaysForcast === 'object') {
        weatherString += todaysForcast.iconPhrase + ".<br>";
        weatherString += "High: " + todaysForcast.highTemp + "°F<br>";
        weatherString += "Low: " + todaysForcast.lowTemp + "°F<br>";
        weatherString += todaysForcast.headline;
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

function getLunchMenu(date) {
    return "Menu unavailable digitally.";
}

function getSpecialDaysString(date) {
    const specialDays = getSpecialDays(date, DATES_TO_SKIP);

    var specialDaysString = "<ul>";
    for (dayType of specialDays) {
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