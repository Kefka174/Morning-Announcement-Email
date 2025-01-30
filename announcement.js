const RECIEVER_EMAIL_ADDRESS = "reciever@domain.com";
const SENDER_ALIAS = "sender@domain.com";
const ERROR_EMAIL_ADDRESS = "tech@support.com";
const EMAIL_TEMPLATE_FILE = "emailTemplate";

function doGet(e) {
    const todaysDate = new Date();
    const todaysWeather = getTodaysWeather();
    const todaysBirthdays = getBirthdays(todaysDate);
    const todaysLunch = getLunchMenu(todaysDate);
    const todaysSpecialDays = getSpecialDays(todaysDate);

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

function getBirthdays(todaysDate) {
    var [studentNames, teacherNames] = getICBirthdays(todaysDate);
    teacherNames = getSheetBirthdays(todaysDate); // get teachers from sheet that includes associates

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

function getLunchMenu(todaysDate) {
    return "Menu unavailable digitally.";
}

function getSpecialDays(todaysDate) {
    return JSON.stringify({KDG: "2"});
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