import os
import shutil
from tqdm import tqdm
from src.file.path import PhotospherePath
import sys
import hashlib

def create_folder_if_not_exists(path: PhotospherePath) -> PhotospherePath:
    if not os.path.exists(path.get_string()):
        os.makedirs(path.get_string(), exist_ok=True)
    return path


def loop_on_files_in_folder_decorator(func):
    """
    Decorator to loop on files in a folder, using tqdm to show progress
    and return the file path as argument to the function
    """
    def wrapper(folder: PhotospherePath, *args, **kwargs):
        for root, dirs, files in tqdm(os.walk(folder.get_string())):
            for file in tqdm(files, leave=False, desc=f"Processing {root}"):
                func(PhotospherePath(root).join(file), *args, **kwargs)
    return wrapper

def copy_file_to_new_folder(file_path: PhotospherePath, destination_folder: PhotospherePath) -> PhotospherePath:
    """
    :param file_path: the original localtion of hte file
    :param destination_folder: the destination where copy the file
    :return: new file path
    """
    create_folder_if_not_exists(destination_folder)
    new_file_path = destination_folder.join(file_path.get_basename())
    shutil.copy2(file_path.get_string(), new_file_path.get_string())
    return new_file_path

def from_source_directory_to_nested_file_path(source_dir: str, file_path: str) -> str:
    """
    :param source_dir: the source directory
    :param file_path: the file path
    :return: the file path nested in the source directory
    """
    return os.path.relpath(file_path, source_dir)


def file_hash(file_path: PhotospherePath, buffer_size=65536) -> str:
    """
    :param file_path: the file path
    :param hash_func: the hash function to use
    :return: the hash of the file
    """
    sha1 = hashlib.sha1()
    with open(file_path.get_string(), 'rb') as f:
        while True:
            data = f.read(buffer_size)
            if not data:
                break
            sha1.update(data)
    return sha1.hexdigest()