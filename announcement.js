const RECIEVER_EMAIL_ADDRESS = "reciever@domain.com";
const SENDER_ALIAS = "sender@domain.com";
const ERROR_EMAIL_ADDRESS = "tech@support.com";
const EMAIL_TEMPLATE_FILE = "emailTemplate";
const TIME_ZONE = Session.getScriptTimeZone();

const DATES_TO_SKIP = [ // Weekends are automatically skipped
    "Sep 1, 2025",
    "Sep 22, 2025",
    "Oct 13, 2025",
    "Nov 14, 2025",
    "Nov 26, 2025 - Nov 28, 2025",
    "Dec 22, 2025 - Jan 2, 2026",
    "Jan 19, 2026",
    "Feb 16, 2026",
    "Mar 13, 2026 - Mar 16, 2026",
    "Apr 2, 2026 - Apr 6, 2026",
];
const END_DATE = "May 22, 2026";

function generateAnnouncement() {
    const todaysDate = new Date();
    const skipdates = skipdateStringsToDates(DATES_TO_SKIP);

    const dateIsBeforeEndDate = todaysDate < new Date(END_DATE);
    if (dateIsBeforeEndDate && !dateIsASkipdate(todaysDate, skipdates)) {
        const todaysWeather = getTodaysWeatherString(todaysDate);
        const todaysBirthdays = getBirthdaysString(todaysDate, skipdates);
        const todaysLunch = getLunchMenuString(todaysDate);
        const todaysSpecialDays = getSpecialDaysString(todaysDate, skipdates);
        const upcommingSkipdate = getUpcommingSkipdateString(todaysDate, skipdates);
        
        const emailSubject = "Announcement Info for " + Utilities.formatDate(todaysDate, TIME_ZONE, "EEEE, MMMM d y");
        let emailBody = compileAnnouncementEmail(todaysDate, todaysWeather, todaysBirthdays, todaysLunch, todaysSpecialDays, upcommingSkipdate);
        
        Logger.log(`Sending email to '${RECIEVER_EMAIL_ADDRESS}'\nSubject:\n\t${emailSubject}\nEmail Body:\n${emailBody}`);
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
            Logger.log(`Invalid format on date to skip: ${skipdateString}`);
        }
    }
    return skipdates;
}

function dateIsASkipdate(date, skipdates) {
    if (!isWeekday(date)) {
        return true;
    }

    for (const skipdate of skipdates) {
        const dateMatchesFirstSkipdate = datesAreSameDay(date, skipdate[0]);
        const dateIsWithinRange = skipdate.length == 2 
                            && (datesAreSameDay(date, skipdate[1]) || (skipdate[0] < date && date < skipdate[1]));
        if (dateMatchesFirstSkipdate || dateIsWithinRange) {
            return true;
        }
    }
    return false;
}

function isWeekday(date) {
    return (date.getDay() >= 1 && date.getDay() <= 5);
}

function datesAreSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() 
        && date1.getMonth() === date2.getMonth() 
        && date1.getDate() === date2.getDate();
}

function getTodaysWeatherString(todaysDate) {
    const todaysForecast = getWeatherForecast();
    let weatherString = "";
    if (typeof todaysForecast === 'object') {
        weatherString += `${todaysForecast.description}<ul>`;
        weatherString += `<li>High: ${todaysForecast.highTemp.toFixed()}°F</li>`;
        weatherString += `<li>Low: ${todaysForecast.lowTemp.toFixed()}°F</li>`;

        if (todaysForecast.rainChance > 30) {
            weatherString += `<li>Precipitation: ${todaysForecast.rainChance}% chance of ${todaysForecast.precipMeasure}in rain</li>`;
        }
        if (todaysForecast.snowChance > 30) {
            weatherString += `<li>Precipitation: ${todaysForecast.snowChance}% chance of ${todaysForecast.precipMeasure}in snow</li>`;
        }
        if (todaysForecast.windSpeed > 15) {
            weatherString += `<li>Wind: Up to ${todaysForecast.windSpeed}mi/h</li>`;
        }
        weatherString += "</ul>";
    }
    else { // encountered an error
        weatherString = "ERROR in Weather API, should be cleared up by tomorrow";
        GmailApp.sendEmail(ERROR_EMAIL_ADDRESS, "Error in Morning Announcement Generation", weatherString, {from: SENDER_ALIAS});
    }
    return weatherString;
}

function getBirthdaysString(date, skipdates) {
    const birthdaysByDate = [];
    const birthdayDate = new Date(date);
    let maxNumDatesCollected = 7;
    let nextDateModifier = -1;

    // True if today is Monday and last Friday was not a skipdate
    const needYesterdaysBirthdays = date.getDay() === 1 && !dateIsASkipdate(new Date(new Date().setDate(date.getDate() - 3)), skipdates);
    // True if today is Friday and next Monday is not a skipdate
    const needTomorrowsBirthdays = date.getDay() === 5 && !dateIsASkipdate(new Date(new Date().setDate(date.getDate() + 3)), skipdates);
    if (needYesterdaysBirthdays) {
        maxNumDatesCollected = 2;
    }
    else if (needTomorrowsBirthdays) {
        maxNumDatesCollected = 2;
        nextDateModifier = 1;
    } 
    // Else get birthdays from the last stretch of skipdates

    do {
        const birthdayInfo = getICBirthdays(birthdayDate);
        birthdayInfo.staffNames = getSheetBirthdays(birthdayDate); // replaces staff birthdays with google sheet that includes associates
        
        birthdaysByDate.push(birthdayInfo);
        birthdayDate.setDate(birthdayDate.getDate() + nextDateModifier);
    } while (dateIsASkipdate(birthdayDate, skipdates) && birthdaysByDate.length < maxNumDatesCollected);
    
    if (maxNumDatesCollected > 2 && birthdaysByDate.length === maxNumDatesCollected) {
        birthdaysByDate.length = 1;
    }
        
    return generateBirthDayString(date, birthdaysByDate);
}

function generateBirthDayString(todaysDate, birthdaysByDate) {
    let birthdayString = "";
    for (const birthdays of birthdaysByDate) {
        if (birthdays.studentNames.length > 0 || birthdays.staffNames.length > 0) {
            if (datesAreSameDay(birthdays.date, todaysDate)) {
                birthdayString += "Today - ";
            }
            birthdayString += `${Utilities.formatDate(birthdays.date, TIME_ZONE, "EEEE")}<ul>`;
            
            if (Array.isArray(birthdays.studentNames) && birthdays.studentNames.length > 0) {
                birthdayString += `Students:<ul><li>${birthdays.studentNames.join("</li><li>")}</li></ul>`;
            }
            if (Array.isArray(birthdays.staffNames) && birthdays.staffNames.length > 0) {
                birthdayString += `Staff:<ul><li>${birthdays.staffNames.join("</li><li>")}</li></ul>`;
            }
            birthdayString += "</ul>";
        }
    }

    if (birthdayString === "") { 
        if (birthdaysByDate[0].studentNames.length > 0 || birthdaysByDate[0].staffNames.length > 0) { // encountered an error
            birthdayString = `${birthdaysByDate[0].studentNames}\n<br>${birthdaysByDate[0].staffNames}`;
            GmailApp.sendEmail(ERROR_EMAIL_ADDRESS, "Error in Morning Announcement Generation", birthdayString, {from: SENDER_ALIAS});
        }
        else {
            birthdayString += "No birthdays today.";
        }
    }
    return birthdayString;
}

function getLunchMenuString(date) {
    return "Menu unavailable digitally. Check PDF copy.";
}

function getSpecialDaysString(date, skipdates) {
    const specialDays = getSpecialDays(date, skipdates);

    let specialDaysString = "<ul>";
    for (const [dayType, dayVal] of specialDays) {
        specialDaysString += `<li>${dayType}: ${dayVal}</li>`;
    }
    specialDaysString += "</ul>";
    return specialDaysString;
}

function getUpcommingSkipdateString(date, skipdates) {
    const nextWeekday = new Date(date);
    if (date.getDay() < 5) {
        nextWeekday.setDate(nextWeekday.getDate() + 1);
    }
    else {
        nextWeekday.setDate(nextWeekday.getDate() + 3);
    }

    let upcommingSkipdate = [];
    for (const skipdate of skipdates) {
        if (datesAreSameDay(nextWeekday, skipdate[0])) {
            upcommingSkipdate = skipdate;
        }
    }

    let skipdateString = "";
    if (upcommingSkipdate.length === 1) {
        skipdateString = "There will be no school on " + Utilities.formatDate(upcommingSkipdate[0], TIME_ZONE, "EEEE, MMMM d");
    }
    else if (upcommingSkipdate.length === 2) {
        skipdateString = "There will be no school on " + Utilities.formatDate(upcommingSkipdate[0], TIME_ZONE, "EEEE, MMMM d") 
        + " through " + Utilities.formatDate(upcommingSkipdate[1], TIME_ZONE, "EEEE, MMMM d");
    }
    return skipdateString;
}

function compileAnnouncementEmail(date, weather, birthdays, lunch, specialDays, upcommingSkipdate) {
    let emailBody = HtmlService.createHtmlOutputFromFile(EMAIL_TEMPLATE_FILE).getContent();
    emailBody = emailBody.replace("%date", Utilities.formatDate(date, TIME_ZONE, "EEEE, MMMM d y"));
    emailBody = emailBody.replace("%weather", weather);
    emailBody = emailBody.replace("%birthdays", birthdays);
    emailBody = emailBody.replace("%lunch", lunch);
    emailBody = emailBody.replace("%specialDays", specialDays);
    emailBody = emailBody.replace("%skipdate", upcommingSkipdate);
    return emailBody;
}