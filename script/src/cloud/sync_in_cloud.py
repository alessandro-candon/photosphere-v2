import os.path
from src.cloud.bucket.storage_firebase import exists_bucket, download_file_to_local, upload_blob, \
    upload_blob_if_not_exist
from src.file.image.image import PhotosphereImage
from src.file.local_file import PhotosphereFile
from src.file.path import PhotospherePath
from tinydb import TinyDB, Query
from src.file.video.video import PhotosphereVideo
from src.local.utils import loop_on_files_in_folder_decorator, from_source_directory_to_nested_file_path
from src.protobuf.converter import create_protobuf_file_list

MOD_FOR_UPLOAD = 20
CLOUD_DB_JSON_FILE = 'photosphere_database_cloud.json'
CLOUD_DB_PB_FILE = 'photosphere_database_cloud.pb'

def copy_in_cloud(source_path: PhotospherePath, bucket_name: str):

    if exists_bucket(bucket_name):
        print(f"Bucket {bucket_name} already exists, continuing...")
    else:
        print(f"Please create new bucket in your cloud storage")

    try:
        local_db_file = download_file_to_local(CLOUD_DB_JSON_FILE, bucket_name, PhotospherePath(CLOUD_DB_JSON_FILE))
        db = TinyDB(local_db_file.get_string())
    except:
        print(f"Creating new database file {CLOUD_DB_JSON_FILE} in bucket {bucket_name}")
        db = TinyDB(CLOUD_DB_JSON_FILE)

    loop_on_files(source_path, source_path, bucket_name, db)
    db.insert_multiple(buffer_list)
    buffer_list.clear()
    upload_blob(CLOUD_DB_JSON_FILE, CLOUD_DB_JSON_FILE, bucket_name)
    create_protobuf_file_list(db.all(), PhotospherePath(CLOUD_DB_PB_FILE))
    upload_blob(CLOUD_DB_PB_FILE, CLOUD_DB_PB_FILE, bucket_name)


buffer_list = []

@loop_on_files_in_folder_decorator
def loop_on_files(
        file_path: PhotospherePath,
        source_path: PhotospherePath,
        bucket_name: str,
        db: TinyDB
    ):

    if file_path.is_allowed_extension(PhotosphereImage.ALLOWED_EXTENSIONS):
        ps = PhotosphereImage(file_path)
        if db.contains(Query().hash == ps.get_hash()):
            return
        ps.generate_thumbnail()
        ps.set_thumbnail_bucket_uri(upload_blob_if_not_exist(
            ps.thumbnail_local_path.get_string(),
            'thumbnails/' + os.path.basename(ps.thumbnail_local_path.get_string()),
            bucket_name)
        )
    elif file_path.is_allowed_extension(PhotosphereVideo.ALLOWED_EXTENSIONS):
        ps = PhotosphereVideo(file_path)
        if db.contains(Query().hash == ps.get_hash()):
            return
        ps.generate_thumbnail()
        ps.set_thumbnail_bucket_uri(upload_blob_if_not_exist(
            ps.thumbnail_local_path.get_string(),
            'thumbnails/' + os.path.basename(ps.thumbnail_local_path.get_string()),
            bucket_name))
    elif file_path.is_allowed_extension(PhotosphereFile.ALLOWED_EXTENSIONS):
        ps = PhotosphereFile(file_path)
        if db.contains(Query().hash == ps.get_hash()):
            return
    else:
        return

    storage_path = from_source_directory_to_nested_file_path(source_path.get_string(), file_path.get_string())
    source_bucket_uri = upload_blob_if_not_exist(file_path.get_string(), storage_path, bucket_name)
    ps.set_source_bucket_uri(source_bucket_uri)

    if not db.contains(Query().hash == ps.get_hash()):
        buffer_list.append(ps.get_dic())
        if len(buffer_list) >= 100:
            db.insert_multiple(buffer_list)
            buffer_list.clear()
            upload_blob(CLOUD_DB_JSON_FILE, CLOUD_DB_JSON_FILE, bucket_name)
            print(f"Uploading to {storage_path} the database...")

    else:
        print(f"Element with bucket_uri {ps.get_source_bucket_uri()} already exists in db, skipping insert.")


