from datetime import timedelta
from db import DBConnection
from email_util import close_smtp_connection
from flask import Flask
from celery import Celery
import redis

def create_app():
    app = Flask(__name__)

    
    # Sessione
    app.config['SECRET_KEY'] = 'your_secret_key'
    app.config['SESSION_TYPE'] = 'redis'  
    app.config['SESSION_PERMANENT'] = True
    app.config['SESSION_USE_SIGNER'] = True  
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(hours=1)  
    app.config['SESSION_REDIS'] = redis.StrictRedis(host='redis', port=6379, db=0)
    app.config['SESSION_COOKIE_SECURE'] = False
    app.config['CELERY_BROKER_URL'] = 'amqp://guest:guest@rabbitmq:5672//'
    app.config['result_backend'] = 'redis://redis:6379/0'

    @app.teardown_appcontext
    def close_connections(exception):
        DBConnection.close_connection()
        close_smtp_connection()
        
    return app

def create_celery(app=None):
    celery = Celery(
        app.import_name,
        backend=app.config['result_backend'],
        broker=app.config['CELERY_BROKER_URL'],
        broker_transport_options = {
            'max_retries': 3,
            'interval_start': 0,  
            'interval_step': 0.2,  
            'interval_max': 0.5,  
        }
    )

    celery.conf.update(app.config)

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery
