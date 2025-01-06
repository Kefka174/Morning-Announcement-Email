from datetime import date
from email.message import EmailMessage
import smtplib

SMTP_SERVER = "smtp-relay.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL_ADDRESS = "sender@domain.com"
RECIEVER_EMAIL_ADDRESS = "reciever@domain.com"


def main():
    todaysDate = date.today()
    todaysWeather = getWeather(todaysDate)
    todaysBirthdays = getBirthdays(todaysDate)
    todaysLunch = getLunchMenu(todaysDate)
    todaysSpecialDays = getSpecialDays(todaysDate)

    emailSubject = "Announcement Info for " + todaysDate.strftime("%A, %B %d %Y")
    emailBody = compileAnnouncementEmail(todaysDate, todaysWeather, todaysBirthdays, todaysLunch, todaysSpecialDays)

    print("Sending email to '" + RECIEVER_EMAIL_ADDRESS + "'\nSubject:\n\t" + emailSubject + "\nEmail Body:\n" + emailBody)
    # sendEmail(SENDER_EMAIL_ADDRESS, RECIEVER_EMAIL_ADDRESS, emailSubject, emailBody)



def sendEmail(senderAddress, recieverAddress, subject, body) -> None:
    print("Sending email to '" + recieverAddress + "'\nSubject:\n\t" + subject + "\nEmail Body:\n" + body)
    message = EmailMessage()
    message['Subject'] = subject
    message['From'] = senderAddress
    message['To'] = recieverAddress
    message.set_content(body)

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.send_message(message)
    except Exception as e:
        print("Error Sending email.")
        print(e)
    finally:
        server.quit()


def getWeather(todaysDate: date) -> str:
    return "Sunny, I promise"

def getBirthdays(todaysDate: date) -> list[str]:
    return ["Jess"]

def getLunchMenu(todaysDate: date) -> str:
    return "Menu unavailable."

def getSpecialDays(todaysDate: date) -> dict[str, str]:
    return {"KDG": "2"}

def compileAnnouncementEmail(todaysDate: date, todaysWeather: str, todaysBirthdays: list[str], todaysLunch: str, todaysSpecialDays: dict[str, str]) -> str:
    body = "<h1>Good morning Spirit Lake Elementary School.</h1><ol>"
    body += "<li>Today's date is <b>" + todaysDate.strftime("%A, %B %d %Y") + "</b>.<br>The weather forcast for today will be <b>" + todaysWeather + '</b>.</li><br>'

    body += "<li>Happy birthday to the following students: <ul><b>"
    for name in todaysBirthdays:
        body += "<li>" + name + "</li>"
    body += "</b></ul></li><br>"

    body += "<li>Today's lunch menu is: <b>" + todaysLunch + "</b></li><br>"

    body += "<li>Special days:<ol><b>"
    for grade, specialValue in todaysSpecialDays.items():
        body += "<li>" + grade + ": " + specialValue + "</li>"
    body += "</b></ol></li><br>"

    body += "<li>Please stand for the pledge of allegiance:<br><i><b>"
    body += "I pledge allegiance to the Flag of the United States of America, and to the Republic for which it stands, one Nation under God, indivisible, with liberty and justice for all."
    body += "</i></b></li><br>"

    body += "</ol>"

    body += "<h3>Have a great day today, SLES.<br>The choice is yours!</h3>"
    return body


if __name__ == "__main__":
    main()