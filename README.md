# Creazione docker container
docker-compose build

# Avvio del container
docker-compose up --scale celery_worker=n (n numero di worker celery che si vuole avviare contemporaneamente)
    file per i test in ./backend/tests 

# Controllo dati nel database
mysql -h database-1.czoq4wkie1hv.eu-north-1.rds.amazonaws.com -P 3306 -u admin -p
USE database-1;
SHOW TABLES;
SELECT * FROM (tabella);  

# Connessione alla console redis
docker exec -it tesimia-redis-1 redis-cli