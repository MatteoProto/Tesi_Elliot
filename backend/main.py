from datetime import timedelta
from backend.controllers.app_factory import create_app, create_celery
from controllers.create_model_config_dict import create_model_config_dict
from controllers.create_evaluation_config_dict import create_evaluation_config_dict
from controllers.create_config_dict import create_config_dict
from flask import Flask, json, render_template, request, jsonify, send_file, session
from flask_session import Session
from flask_cors import CORS 
import os
from celery_config import make_celery
from celery.result import AsyncResult 
from tasks import run_preprocessing_task, run_evaluation_task, run_recommendation_task, save_task_status
from backend.controllers.db import DBConnection
from werkzeug.security import check_password_hash, generate_password_hash
import mysql.connector
from mysql.connector import IntegrityError


app = create_app()
celery = create_celery(app)

# Configura CORS per supportare le credenziali (cookie)
CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

Session(app)

with open(os.path.join(os.path.dirname(__file__),'static','js','models2.json')) as f:
    file = json.load(f)

# API per effettuare il preprocessing con una richiesta asincrona
@app.route("/api/v1/preprocessing-json", methods=['POST'])
def preprocess_json():    
    print("received a preprocessing request!")
    print("trying to create a dataframe with pandas ")
    
    # Ottieni i dettagli dell'utente
    cursor = DBConnection.get_cursor()
    cursor.execute('SELECT * FROM user WHERE id = %s', (session['user_id'],))
    user = cursor.fetchone()
    cursor.close()
        
        
    # Crea il config per il task
    config = create_config_dict(request)
        
    # Invia il task a Celery 
    task = run_preprocessing_task.apply_async(args=[config, user])
        
    # Restituisci immediatamente il task_id al frontend
    return jsonify({"task_id": task_id}), 202
        
# API per l'evaluation
@app.route("/api/v1/evaluation", methods=['POST'])
def evaluationApi():
    print("richiesta in elaborazione ")
    
    # Ottieni i dettagli dell'utente
    cursor = DBConnection.get_cursor()
    cursor.execute('SELECT * FROM user WHERE id = %s', (session['user_id'],))
    user = cursor.fetchone()
    cursor.close()
    
    # Crea il config per il task
    config, path = create_evaluation_config_dict(request)
    
    # Invia il task a Celery 
    task = run_evaluation_task.apply_async(args=[config, path, user])
    
    return jsonify({"task_id": task.id}), 202

# API per il modello di raccomandazione con task asincrono
@app.route("/api/v1/recommendationmodel-json", methods=['GET', 'POST'])
def recommendationmodel_json():
    print("received a recommendations model!")
        
    # Ottieni i dettagli dell'utente
    cursor = DBConnection.get_cursor()
    cursor.execute('SELECT * FROM user WHERE id = %s', (session['user_id'],))
    user = cursor.fetchone()
    cursor.close()
    
    # Crea il config per il task
    config, path = create_model_config_dict(request)
    
    # Invia il task a Celery 
    task = run_recommendation_task.apply_async(args=[config, path, user])
    
    return jsonify({"task_id": task.id}), 202

@app.route('/api/v1/task_status/<task_id>', methods=['GET'])
def get_task_status(task_id):
    """Recupera lo stato di un task dal database."""
    
    cursor = DBConnection.get_cursor()
    cursor.execute('SELECT * FROM task WHERE task_id = %s', (task_id,))
    task = cursor.fetchone()
    
    if task is None:
        return jsonify({'error': 'Task non trovato'}), 404
    cursor.close()
    
    
    return jsonify({
        'task_id': task['task_id'],
        'status': task['status'],
        'task_type': task['task_type'],
        'result': task['result'],
        'error': task['error']
    })

@app.route("/api/v1/user/", methods=['GET'])
def get_user_tasks():
    if 'user_id' not in session:
        return jsonify({'error': 'User not authenticated'}), 401  # Restituisce un errore se l'utente non è autenticato
    """Recupera tutti i task associati a un utente specifico."""
    user_id = session['user_id']
    
    cursor = DBConnection.get_cursor()
    cursor.execute('SELECT * FROM task WHERE user_id = %s', (user_id,))
    tasks = cursor.fetchall()
    
    cursor.close()
    
    
    return jsonify([{
        'task_id': task['task_id'],
        'status': task['status'],
        'task_type': task['task_type'],
        'result': task['result'],
        'error': task['error'],
        'created': task['created'],
    } for task in tasks]), 200


@app.route('/register', methods=['POST'])
def register():
    if request.method == 'POST':
        
        cursor = DBConnection.get_cursor()
        email=request.json['email']
        password=request.json['password']
        try:
            cursor.execute(
                "INSERT INTO user (email, password) VALUES (%s, %s)", 
                (email, generate_password_hash(password)),
            )
            DBConnection.get_connection().commit()
        except IntegrityError:
            error = f"User {email} is already registered."
            response = {'ans': False, 'error':error}
        else:
            response = {'ans': True}
        finally:
            cursor.close()
            
        return jsonify(response)

@app.route('/login', methods=['POST'])
def login():
    if request.method == 'POST':
        email = request.json['email']
        password = request.json['password']
        
        cursor = DBConnection.get_cursor()
        error = None
        cursor.execute(
            'SELECT * FROM user WHERE email = %s', (email,)
        )
        user = cursor.fetchone()

        if user is None:
            error = 'Incorrect email.'
        elif not check_password_hash(user['password'], password):
            error = 'Incorrect password.'

        if error is None:
            session['user_id'] = user['id']
            session.permanent = True
            print(f"Sessione impostata durante il login: {session.get('user_id')}")
            response = {'ans': True, 'user_id':user['id'], 'email':user['email']}
        else:
            response = {'ans': False, 'error':error}

        cursor.close()
        
        return jsonify(response)

@app.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)  # Rimuovi l'user_id dalla sessione
    return jsonify({"message": "Logged out"}), 200

@app.route('/get-user-id', methods=['GET'])
def get_user_id():
    if 'user_id' in session:
        return jsonify({"user_id": session['user_id']}), 200
    else:
        return jsonify({"message": "User not authenticated"}), 401

if __name__ == "__main__":
    app.run(debug=True)