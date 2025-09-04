import os
import firebase_admin
from firebase_admin import credentials, storage

from src.file.path import PhotospherePath

# Initialize Firebase Admin SDK
if not firebase_admin._apps:
    firebase_config_path = os.environ.get("FIREBASE_CONFIG_PATH", None)
    if firebase_config_path and os.path.exists(firebase_config_path):
        cred = credentials.Certificate(firebase_config_path)
        firebase_admin.initialize_app(cred)
    else:
        firebase_admin.initialize_app()

def create_bucket(bucket_name: str):
    """
    :param bucket_name: without the gs://
    :return: if created return True, else False
    """
    bucket = storage.bucket(bucket_name)
    list(bucket.list_blobs(max_results=1))
    return True

def delete_bucket(bucket_name: str):
    """
    :param bucket_name: without the gs://
    :return: if deleted return True, else False
    """
    bucket = storage.bucket(bucket_name)
    return True

def delete_file(storage_path: str, bucket_name: str):
    """
    :param storage_path: path to the file in the bucket
    :param bucket_name: without the gs://
    :return: if deleted return True, else False
    """
    bucket = storage.bucket(bucket_name)
    blob = bucket.blob(storage_path)
    blob.delete()
    return True

def exists_bucket(bucket_name: str):
    """
    :param bucket_name: without the gs://
    :return: if exists return True, else False
    """
    bucket = storage.bucket(bucket_name)
    list(bucket.list_blobs(max_results=1))
    return True

def exists_file_on_bucket(storage_path: str, bucket_name: str):
    """
    :param bucket_name: without the gs://
    :param storage_path: path to the file in the bucket
    :return: True if file exists, False otherwise
    """
    try:
        bucket = storage.bucket(bucket_name)
        blob = bucket.blob(storage_path)
        return blob.exists()
    except Exception:
        return False

def upload_blob(source_file: str, storage_path: str, bucket_name: str):
    """
    :param source_file: local file path
    :param storage_path: path to the file in the bucket
    :param bucket_name: without the gs://
    :return: gs path to the file
    """
    bucket = storage.bucket(bucket_name)
    blob = bucket.blob(storage_path)
    blob.upload_from_filename(source_file)
    gs_path = f"gs://{bucket_name}/{storage_path}"
    return gs_path

def upload_blob_if_not_exist(source_file: str, storage_path: str, bucket_name: str):
    """
    :param source_file: local file path
    :param storage_path: path to the file in the bucket
    :param bucket_name: without the gs://
    :return: gs path to the file
    """
    if not exists_file_on_bucket(storage_path, bucket_name):
        return upload_blob(source_file, storage_path, bucket_name)
    else:
        return f"gs://{bucket_name}/{storage_path}"

def download_file_as_str(storage_path: str, bucket_name: str):
    """
    :param storage_path: path to the file in the bucket
    :param bucket_name: without the gs://
    :return: file content as string
    """
    bucket = storage.bucket(bucket_name)
    blob = bucket.blob(storage_path)
    return blob.download_as_bytes().decode('utf-8')

def download_file_to_local(storage_path: str, bucket_name: str, local_path: PhotospherePath):
    """
    :param storage_path: path to the file in the bucket
    :param bucket_name: without the gs://
    :param local_path: local path to save the file
    :return: True if downloaded successfully, False otherwise
    """
    bucket = storage.bucket(bucket_name)
    blob = bucket.blob(storage_path)
    blob.download_to_filename(local_path.get_string())
    return True

def list_all_files_in_bucket_folder(folder: str, bucket_name: str):
    """
    :param folder: folder path/prefix to search in
    :param bucket_name: without the gs://
    :return: list of file names in the folder
    """
    bucket = storage.bucket(bucket_name)
    blobs = bucket.list_blobs(prefix=folder, delimiter='/')
    return [blob.name for blob in blobs]
