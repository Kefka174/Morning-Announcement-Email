const SPECIAL_DAYS_CONFIG = {
    startDateStr: "Jan 6, 2025",
    dayTypes: [
        { name: "1st-4th", startVal: 5, maxVal: 5 },
        { name: "KG", startVal: 1, maxVal: 6 }
    ]
};

function getSpecialDays(date, skipDates) {
    const startDate = new Date(SPECIAL_DAYS_CONFIG.startDateStr);

    const weekdaysSinceStart = weekdaysBetweenDates(startDate, date);
    const validDaysSinceStart = weekdaysSinceStart - skipDatesBetweenDates(startDate, date, skipDates);

    const specialDays = [];
    for (dayType of SPECIAL_DAYS_CONFIG.dayTypes) {
        var dayVal = (dayType.startVal + validDaysSinceStart) % dayType.maxVal;
        if (dayVal === 0) {
            dayVal = dayType.maxVal;
        }
        specialDays.push([dayType.name, dayVal]);
    }
    return specialDays;
}

function weekdaysBetweenDates(startDate, endDate) {
    const millisecondsInADay = 1000 * 60 * 60 * 24;
    const totalDaysBetween = Math.floor((endDate - startDate) / millisecondsInADay);
    const fullWeeksBetween = Math.floor(totalDaysBetween / 7);
    const remainingDays = totalDaysBetween % 7;
    var weekdaysBetween = fullWeeksBetween * 5;

    const iDate = new Date(startDate);
    for (let i = 0; i < remainingDays; i++) {
        if (isWeekday(iDate)) {
            weekdaysBetween++;
        }
        iDate.setDate(iDate.getDate() + 1);
    }
    return weekdaysBetween;
}

function skipDatesBetweenDates(startDate, endDate, skipDates) {
    const datePattern = /^[A-Z][a-z]{2,3} \d{1,2}, \d{4}$/;
    const dateRangePattern = /^[A-Z][a-z]{2,3} \d{1,2}, \d{4} - [A-Z][a-z]{2,3} \d{1,2}, \d{4}$/;
    var numSkipDatesBetween = 0;
    for (skipDateString of skipDates) {
        if (datePattern.test(skipDateString)) {
            const skipDate = new Date(skipDateString);
            if (skipDate > startDate && skipDate < endDate && isWeekday(skipDate)) {
                numSkipDatesBetween++;
            }
        }
        else if (dateRangePattern.test(skipDateString)) {
            const [startStr, endStr] = skipDateString.split(" - ");
            var skipRangeStartDate = new Date(startStr);
            var skipRangeEndDate = new Date(endStr);

            if (startDate <= skipRangeEndDate && endDate >= skipRangeStartDate) {
                skipRangeStartDate = Math.max(startDate, skipRangeStartDate);
                skipRangeEndDate = Math.min(endDate, skipRangeEndDate);
                numSkipDatesBetween += weekdaysBetweenDates(skipRangeStartDate, skipRangeEndDate);
            }
        }
        else {
            Logger.log("Invalid format on date to skip: %s", skipDateString);
        }
    }
    return numSkipDatesBetween;
}

function isWeekday(date) {
    return (date.getDay() >= 1 && date.getDay() <= 5);
}