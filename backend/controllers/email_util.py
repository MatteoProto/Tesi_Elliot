from email.mime.text import MIMEText
import smtplib
import os
import time

# Credenziali email, aggiungere variabili d'ambiente
sender_address = os.getenv("EMAIL_SENDER")
password = os.getenv("EMAIL_PASSWORD")

# Inizializzazione della connessione SMTP
smtp_connection = None

def init_smtp_connection():
    #Inizializza la connessione SMTP con il server
    global smtp_connection

    # Verifica che le variabili d'ambiente siano definite
    if not sender_address or not password:
        raise ValueError("Le credenziali SMTP non sono state configurate correttamente. Verifica EMAIL_SENDER e EMAIL_PASSWORD.")

    try:
        smtp_connection = smtplib.SMTP("smtp.gmail.com", 587)
        smtp_connection.ehlo()
        smtp_connection.starttls()
        smtp_connection.login(sender_address, password)
        print("Connessione SMTP stabilita")
    except smtplib.SMTPException as e:
        print(f"Errore durante il login SMTP: {e}")
        smtp_connection = None

def close_smtp_connection():
    """Chiude la connessione SMTP"""
    global smtp_connection
    if smtp_connection:
        smtp_connection.quit()
        smtp_connection = None

def send_email(user, string, retries=3):
    """Invia un'email e tenta la riconnessione se necessario"""
    global smtp_connection
    attempt = 0
    while attempt < retries:
        try:
            # Se la connessione SMTP non esiste o è stata chiusa, riconnettiti
            if smtp_connection is None:
                print(f"Tentativo di riconnessione SMTP ({attempt + 1}/{retries})...")
                init_smtp_connection()

            # Verifica se la connessione SMTP è stata stabilita correttamente
            if smtp_connection is None:
                raise ValueError("Connessione SMTP non disponibile. Verifica le credenziali.")

            # Crea e invia l'email
            subject = "Test Elliot completato"
            body = f"Gentile utente, il task da lei avviato è stato completato: {string}"

            message = MIMEText(body, 'plain', 'utf-8')
            message['Subject'] = subject
            message['From'] = sender_address
            message['To'] = user

            smtp_connection.sendmail(sender_address, user, message.as_string())
            print("Email inviata con successo")
            break  # Uscita dal ciclo se l'email viene inviata correttamente

        except (smtplib.SMTPException, smtplib.SMTPServerDisconnected) as e:
            print(f"Errore durante l'invio dell'email: {e}")
            close_smtp_connection()  # Chiudi la connessione non valida
            attempt += 1
            time.sleep(1) 
        except Exception as e:
            print(f"Errore generico durante l'invio dell'email: {e}")
            break

    if attempt == retries:
        print("Tutti i tentativi di invio dell'email sono falliti.")

