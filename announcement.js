const RECIEVER_EMAIL_ADDRESS = "reciever@domain.com"
const SENDER_ALIAS = "sender@domain.com"
const EMAIL_TEMPLATE_FILE = "emailTemplate"

function doGet(e) {
    const todaysDate = new Date();
    const todaysWeather = getWeather(todaysDate);
    const todaysBirthdays = getBirthdays(todaysDate);
    const todaysLunch = getLunchMenu(todaysDate);
    const todaysSpecialDays = getSpecialDays(todaysDate);

    const emailSubject = "Announcement Info for " + Utilities.formatDate(todaysDate, "GMT-6", "EEEE, MMMM d y");
    var emailBody = compileAnnouncementEmail(todaysDate, todaysWeather, todaysBirthdays, todaysLunch, todaysSpecialDays);

    Logger.log("Sending email to '%s'\nSubject:\n\t%s\nEmail Body:\n%s", RECIEVER_EMAIL_ADDRESS, emailSubject, emailBody);
    // GmailApp.sendEmail(RECIEVER_EMAIL_ADDRESS, emailSubject, emailBody, {from: SENDER_ALIAS});
}

function getWeather(todaysDate) {
    return "Sunny, I promise";
}

function getBirthdays(todaysDate) {
    return ["Jess"];
}

function getLunchMenu(todaysDate) {
    return "Menu unavailable.";
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