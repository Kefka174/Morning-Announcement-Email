from datetime import date
from email.message import EmailMessage
import smtplib

SMTP_SERVER = "smtp-relay.gmail.com"
SMTP_PORT = 587
SENDER_EMAIL_ADDRESS = "sender@domain.com"
RECIEVER_EMAIL_ADDRESS = "reciever@domain.com"


def main():
    emailSubject = "Announcement Info for " + date.today().strftime("%A, %B %d %Y")
    emailBody = "just testing this out"

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

def todayIsWeekday() -> bool:
    return date.today().weekday() < 5


if __name__ == "__main__":
    main()