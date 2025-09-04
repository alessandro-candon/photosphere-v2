from src.file.image.image import PhotosphereImage
from src.file.path import PhotospherePath
from src.file.video.video import PhotosphereVideo
from src.local.local_folders_name import RESULT_FOLDER, SKIPPED_FOLDER, NO_DATETIME_FOLDER
from src.local.utils import create_folder_if_not_exists, loop_on_files_in_folder_decorator, copy_file_to_new_folder


def organize_all_files(source: PhotospherePath, destination: PhotospherePath):
    create_folder_if_not_exists(destination)
    create_folder_if_not_exists(destination.join(RESULT_FOLDER))
    create_folder_if_not_exists(destination.join(SKIPPED_FOLDER))
    create_folder_if_not_exists(destination.join(NO_DATETIME_FOLDER))
    run_on_folder(source, destination)


@loop_on_files_in_folder_decorator
def run_on_folder(file_path: PhotospherePath, destination: PhotospherePath):

    if file_path.is_allowed_extension(PhotosphereImage.ALLOWED_EXTENSIONS):
        ps = PhotosphereImage(file_path)
    elif file_path.is_allowed_extension(PhotosphereVideo.ALLOWED_EXTENSIONS):
        ps = PhotosphereVideo(file_path)
    else:
        copy_file_to_new_folder(file_path, destination.join(SKIPPED_FOLDER))
        return

    if ps.created_at is not None:
        destination_folder = file_path.join(
            destination.get_string(),
            RESULT_FOLDER,
            str(ps.get_created_at_year()),
            str(ps.get_created_at_month()),
            str(ps.get_created_at_day())
        )
        copy_file_to_new_folder(file_path, destination_folder)
    else:
        copy_file_to_new_folder(file_path, destination.join(NO_DATETIME_FOLDER))