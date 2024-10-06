DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS post;

CREATE TABLE user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE task (
  task_id INT PRIMARY KEY AUTO_INCREMENT,  -- task_id è ora di tipo INT per supportare AUTO_INCREMENT
  user_id INT NOT NULL,  -- Collega il task all'utente, non permette NULL
  status VARCHAR(255) NOT NULL,  -- Stato del task (pending, started, completed, failed, ecc.)
  task_type VARCHAR(255) NOT NULL,  -- Tipo di task (preprocessing, evaluation, ecc.)
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  result VARCHAR(255),  -- Facoltativo: il risultato del task
  error VARCHAR(255),  -- Facoltativo: dettagli sull'errore, se presente
  FOREIGN KEY (user_id) REFERENCES user (id)  -- Collega l'utente, vincolo di chiave esterna
);
