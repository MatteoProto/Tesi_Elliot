import mysql.connector
from mysql.connector import Error
import os
from flask import current_app

class DBConnection:
    _instance = None

    def __init__(self):
        """Costruttore privato per gestire la connessione singleton."""
        if DBConnection._instance is None:
            try:
                # Creazione della connessione al database
                DBConnection._instance = mysql.connector.connect(
                    host=os.getenv('MYSQL_HOST', current_app.config.get('MYSQL_HOST')),
                    user=os.getenv('MYSQL_USER', current_app.config.get('MYSQL_USER')),
                    password=os.getenv('MYSQL_PASSWORD', current_app.config.get('MYSQL_PASSWORD')),
                    database=os.getenv('MYSQL_DATABASE', current_app.config.get('MYSQL_DATABASE')),
                    port=int(os.getenv('MYSQL_PORT', 3306))
                )
            except Error as e:
                print(f"Errore durante la connessione al database: {e}")
                DBConnection._instance = None
                raise e  # Rilancia l'eccezione per una migliore gestione a livello superiore

    @classmethod
    def get_connection(cls):
        """Restituisce l'istanza della connessione, creandola se necessario."""
        if cls._instance is None or not cls._instance.is_connected():
            cls()  # Chiama il costruttore per creare la connessione
        return cls._instance

    @classmethod
    def close_connection(cls):
        """Chiude la connessione al database."""
        if cls._instance is not None and cls._instance.is_connected():
            cls._instance.close()
            cls._instance = None

    @classmethod
    def get_cursor(cls):
        """Restituisce un cursore per la connessione corrente, con risultati in formato dizionario."""
        connection = cls.get_connection()
        if connection:
            return connection.cursor(dictionary=True)
        else:
            raise Error("Impossibile ottenere il cursore: connessione al database non disponibile.")
