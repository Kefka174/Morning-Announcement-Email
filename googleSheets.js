const BIRTHDAY_SHEET_ID = "birthdaySheetID";
const BIRTHDAY_SHEET_NAME = "Birthdays";

function getSheetBirthdays(date) {
    try {
        const sheet = SpreadsheetApp.openById(BIRTHDAY_SHEET_ID).getSheetByName(BIRTHDAY_SHEET_NAME);
        const sheetData = sheet.getDataRange().getValues();

        const dateString = Utilities.formatDate(date, "GMT-6", "MMMM d");
        const names = [];
        for (row of sheetData) { // TODO: decouple cell ordering
            if (row[2] === dateString) {
                names.push(row[1] + ' ' + row[0]);
            }
        }
        return names;
    }
    catch (err) {
        Logger.log("Error Caught: %s", err.message);
        return "ERROR REQUESTING GOOGLE SHEET DATA";
    }
}