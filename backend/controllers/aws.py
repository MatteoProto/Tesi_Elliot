import os
import boto3 # type: ignore
from botocore.exceptions import NoCredentialsError # type: ignore

s3 = boto3.client(
    's3',
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    region_name=os.getenv("AWS_DEFAULT_REGION")
)

def upload_file_to_s3(file_path, s3_file_name, bucket_name="prova1209876"):
    #Carica un file su S3 e restituisce l'URL pubblico o firmato.
    try:
        # Carica il file su S3
        s3.upload_file(file_path, bucket_name, s3_file_name)
        # Ottieni l'URL pubblico del file
        file_url = f"https://{bucket_name}.s3.amazonaws.com/{s3_file_name}"
        return file_url
    except FileNotFoundError:
        print("Il file non esiste.")
    except NoCredentialsError:
        print("Credenziali AWS non valide.")
    return None
