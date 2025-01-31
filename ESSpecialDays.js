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
    for (const dayType of SPECIAL_DAYS_CONFIG.dayTypes) {
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
    var numSkipDatesBetween = 0;
    for (const skipDate of skipDates) {
        if (skipDate.length === 1) {
            if (startDate < skipDate[0] && skipDate[0] < endDate && isWeekday(skipDate[0])) {
                numSkipDatesBetween++;
            }
        }
        else if (skipDate.length === 2) {
            const intervalsOverlap = startDate <= skipDate[1] && endDate >= skipDate[0];
            if (intervalsOverlap) {
                const overlapStartDate = Math.max(startDate, skipDate[0]);
                const overlapEndDate = Math.min(endDate, skipDate[1]);
                numSkipDatesBetween += weekdaysBetweenDates(overlapStartDate, overlapEndDate);
            }
        }
    }
    return numSkipDatesBetween;
}

function isWeekday(date) {
    return (date.getDay() >= 1 && date.getDay() <= 5);
}