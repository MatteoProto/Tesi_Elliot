import os
import shutil
import pandas as pd
from flask import app, request
from backend.controllers.aws import upload_file_to_s3
from backend.controllers.db import DBConnection
from celery import shared_task, Celery
from controllers.run_experiment import run_preprocessing, run_evaluation, run_recommendation
from backend.controllers.email_util import send_email


def save_task_status(task_id, user_id, status, task_type, result=None, error=None):
    """Salva o aggiorna lo stato di un task nel database utilizzando task_id come chiave primaria."""
    cursor = DBConnection.get_cursor()
    cursor.execute(
        '''
        INSERT INTO task (task_id, user_id, status, task_type, result, error)
        VALUES (%s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            status=VALUES(status),
            result=VALUES(result),
            error=VALUES(error)
        ''',
        (task_id, user_id, status, task_type, result, error)
    )
    DBConnection.get_connection().commit()
    cursor.close()


# Task di preprocessing
@shared_task(bind=True)
def run_preprocessing_task(self, config, user):
    task_id = self.request.id  # Celery genera il task_id
    user_id = user['id'] 
    task_type = 'preprocessing'
    
    try:
        # Registra che il task è stato avviato
        save_task_status(task_id, user_id, 'started', task_type)  
        
        # Esegue task     
        preprocessed_dataset = run_preprocessing(config)
        
        # Recupera i risultati del task   
        request_no = config['experiment']['splitting']['save_folder'].split('splitted_data/')[1]
        dir_path = 'splitted_data/' + request_no
        output_filename = 'zipped_data/' + task_id
        
        #Crea il file zip, se il processo non ha creato il file con i risultati ci salva all'interno preprocessed
        try:
            shutil.make_archive(output_filename, 'zip', dir_path)
        except:
            os.makedirs(dir_path, exist_ok=True)
            pd.DataFrame(preprocessed_dataset).to_csv(f'{dir_path}/preprocessed_dataset.csv', index=False)
            shutil.make_archive(output_filename, 'zip', dir_path)
        
        shutil.rmtree(f'data/{request_no}', ignore_errors=True)
        shutil.rmtree(f'{dir_path}', ignore_errors=True)
        
        # Carica il file su s3
        file_url = upload_file_to_s3(f'{output_filename}.zip', f'results/{task_id}.zip')
        if file_url:
            print(f"File caricato con successo: {file_url}")
        os.remove(f'{output_filename}.zip')
            
        # Invia email dopo il completamento del task
        send_email(user['email'], file_url)
        
        # Registra il completamento del task e il risultato
        save_task_status(task_id, user_id, 'completed', task_type, result=file_url)

        return {'status': 'completed', 'task': task_id}
    
    except Exception as e:
        # Registra l'errore nel database
        save_task_status(task_id, user_id, 'failed', task_type, error=str(e))
        return {'status': 'failed', 'error': str(e)}

# Task per l'evaluation
@shared_task(bind=True)
def run_evaluation_task(self, config, path, user):
    task_id = self.request.id  # Celery genera il task_id
    user_id = user['id']
    task_type = 'evaluetion'
    
    try:
        # Registra che il task è stato avviato
        save_task_status(task_id, user_id, 'started', task_type)
        
        # Esegue task
        result = run_evaluation(config, path)
        
        # Recupera i risultati del task   
        request_no = config['experiment']['splitting']['save_folder'].split('splitted_data/')[1]
        path = request.args.get('path')
        output_filename = 'zipped_data/' + task_id
        
        #Crea il file zip, se il processo non ha creato il file con i risultati ci salva all'interno preprocessed
        try:
            shutil.make_archive(output_filename, 'zip', path)
        except:
            os.makedirs(path, exist_ok=True)
            pd.DataFrame(result).to_csv(f'{path}/preprocessed_dataset.csv', index=False)
            shutil.make_archive(output_filename, 'zip', path)
            
        shutil.rmtree(f'data/{request_no}', ignore_errors=True)
        shutil.rmtree(f'{path}', ignore_errors=True)
                        
        # Carica il file su s3
        file_url = upload_file_to_s3(f'{output_filename}.zip', f'results/{task_id}.zip')
        if file_url:
            print(f"File caricato con successo: {file_url}")
        os.remove(f'{output_filename}.zip')
                
        # Invia email dopo il completamento del task
        send_email(user['email'], file_url)
        
        # Registra il completamento del task e il risultato
        save_task_status(task_id, user_id, 'completed', task_type, result=file_url)

        return {'status': 'completed', 'task': task_id}
    
    except Exception as e:
        # Registra l'errore nel database
        save_task_status(task_id, user_id, 'failed', task_type, error=str(e))
        return {'status': 'failed', 'error': str(e)}

# Task per la raccomandazione
@shared_task(bind=True)
def run_recommendation_task(self, config, path, user):
    task_id = self.request.id  # Celery genera il task_id
    user_id = user['id'] 
    task_type = 'recommendetion'
    
    try:
         # Registra che il task è stato avviato
        save_task_status(task_id, user_id, 'started', task_type) 
        
        # Esegue task
        result = run_recommendation(config, path)
        
        # Recupera i risultati del task   
        request_no = config['experiment']['save_folder'].split('results/')[1]
        dir_path = 'resuts/' + request_no
        output_filename = 'zipped_data/' + task_id     
        
        #Crea il file zip, se il processo non ha creato il file con i risultati ci salva all'interno preprocessed
        try:
            shutil.make_archive(output_filename, 'zip', dir_path)
        except:
            os.makedirs(dir_path, exist_ok=True)
            pd.DataFrame(result).to_csv(f'{dir_path}/preprocessed_dataset.csv', index=False)
            shutil.make_archive(output_filename, 'zip', dir_path)
        
        shutil.rmtree(f'data/{request_no}', ignore_errors=True)
        shutil.rmtree(f'{dir_path}', ignore_errors=True)
        
        # Carica il file su s3
        file_url = upload_file_to_s3(f'{output_filename}.zip', f'results/{task_id}.zip')
        if file_url:
            print(f"File caricato con successo: {file_url}")
        os.remove(f'{output_filename}.zip')
        
        # Invia email dopo il completamento del task
        send_email(user['email'], file_url)
        
        # Registra il completamento del task e il risultato
        save_task_status(task_id, user_id, 'completed', task_type, result=file_url)
        
        return {'status': 'completed', 'task': task_id}
    
    except Exception as e:
        # Registra l'errore nel database
        save_task_status(task_id, user_id, 'failed', task_type, error=str(e))
        return {'status': 'failed', 'error': str(e)}