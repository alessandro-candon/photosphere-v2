from src.file.image.image import PhotosphereImage
from src.file.local_file import PhotosphereFile
from src.file.path import PhotospherePath
from src.file.video.video import PhotosphereVideo
from src.local.utils import loop_on_files_in_folder_decorator
from tinydb import TinyDB, Query


LOCAL_DATABASE_FILE = "local_database.json"

def generate_local_database(folder_path: PhotospherePath, out_path: PhotospherePath):
    db = TinyDB(LOCAL_DATABASE_FILE)
    loop_on_files(folder_path, db)
    db.insert_multiple(buffer_list)

buffer_list = []

@loop_on_files_in_folder_decorator
def loop_on_files(file_path: PhotospherePath, db: TinyDB):
    if file_path.is_allowed_extension(PhotosphereImage.ALLOWED_EXTENSIONS):
        ps = PhotosphereImage(file_path)
    elif file_path.is_allowed_extension(PhotosphereVideo.ALLOWED_EXTENSIONS):
        ps = PhotosphereVideo(file_path)
    elif file_path.is_allowed_extension(PhotosphereFile.ALLOWED_EXTENSIONS):
        ps = PhotosphereFile(file_path)
    else:
        return
    if not db.contains(Query().hash == ps.get_hash()):
        buffer_list.append(ps.get_dic())
        if len(buffer_list) >= 100:
            db.insert_multiple(buffer_list)
            buffer_list.clear()
    else:
        return



