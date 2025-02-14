const SPECIAL_DAYS_CONFIG = {
    startDateStr: "Jan 6, 2025",
    dayTypes: [
        { name: "1st-4th", startVal: 4, maxVal: 5 },
        { name: "KG", startVal: 5, maxVal: 6 },
    ]
};

function getSpecialDays(date, skipdates) {
    const startDate = new Date(SPECIAL_DAYS_CONFIG.startDateStr);
    const weekdaysSinceStart = weekdaysBetweenDates(startDate, date);
    const validDaysSinceStart = weekdaysSinceStart - skipdatesBetweenDates(startDate, date, skipdates);

    const specialDays = [];
    for (const dayType of SPECIAL_DAYS_CONFIG.dayTypes) {
        let dayVal = (dayType.startVal + validDaysSinceStart) % dayType.maxVal;
        if (dayVal === 0) {
            dayVal = dayType.maxVal;
        }
        specialDays.push([dayType.name, dayVal]);
    }
    return specialDays;
}

function weekdaysBetweenDates(startDate, endDate) {
    const millisecondsInADay = 1000 * 60 * 60 * 24;
    const totalDaysBetween = Math.abs(Math.floor((endDate - startDate) / millisecondsInADay));
    const fullWeeksBetween = Math.floor(totalDaysBetween / 7);
    const remainingDays = totalDaysBetween % 7;
    let weekdaysBetween = fullWeeksBetween * 5;

    const iDate = new Date(startDate);
    for (let i = 0; i <= remainingDays; i++) {
        if (isWeekday(iDate)) {
            weekdaysBetween++;
        }
        iDate.setDate(iDate.getDate() + 1);
    }
    return weekdaysBetween;
}

function skipdatesBetweenDates(startDate, endDate, skipdates) {
    let numSkipdatesBetween = 0;
    for (const skipdate of skipdates) {
        if (skipdate.length === 1) {
            if (startDate <= skipdate[0] && skipdate[0] <= endDate && isWeekday(skipdate[0])) {
                numSkipdatesBetween++;
            }
        }
        else if (skipdate.length === 2) {
            const intervalsOverlap = (startDate <= skipdate[1] && endDate >= skipdate[0])
                || datesAreSameDay(startDate, skipdate[0]) || datesAreSameDay(startDate, skipdate[1])
                || datesAreSameDay(endDate, skipdate[0]) || datesAreSameDay(endDate, skipdate[1]);
            if (intervalsOverlap) {
                const overlapStartDate = Math.max(startDate, skipdate[0]);
                const overlapEndDate = Math.min(endDate, skipdate[1]);
                numSkipdatesBetween += weekdaysBetweenDates(overlapStartDate, overlapEndDate);
            }
        }
    }
    return numSkipdatesBetween;
}