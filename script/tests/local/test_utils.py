import os
import shutil
from unittest import TestCase

from src.file.path import PhotospherePath
from src.local.utils import create_folder_if_not_exists, copy_file_to_new_folder, \
    from_source_directory_to_nested_file_path


class TestPhotosphereImage(TestCase):

    def test_create_folder_if_not_exists(self):
        new_folder_path = os.path.dirname(__file__) + "/test"
        assert not os.path.exists(new_folder_path)
        create_folder_if_not_exists(PhotospherePath(new_folder_path))
        assert os.path.exists(new_folder_path)
        os.rmdir(new_folder_path)

    def test_copy_file_to_new_folder_path(self):
        new_folder_path = os.path.dirname(__file__) + "/test"
        copy_file_to_new_folder(PhotospherePath(__file__), PhotospherePath(new_folder_path))
        assert os.path.exists(__file__)
        shutil.rmtree(new_folder_path)

    def test_from_source_directory_to_nested_file_path(self):
        source_dir = '/tmp/test/test2/test3'
        file_path = '/tmp/test/test2/test3/test4/test5/test.txt'
        actual = from_source_directory_to_nested_file_path(source_dir, file_path)
        assert actual == 'test4/test5/test.txt'

    def test_from_source_directory_to_nested_file_path_with_different_paths(self):
        source_dir = '/Users/mac-ACANDO14/Site/personal/photosphere/photosphere-v2/out'
        file_path = '/Users/mac-ACANDO14/Site/personal/photosphere/photosphere-v2/out/no_datetime/Capitol_Building_Full_View.jpg'
        actual = from_source_directory_to_nested_file_path(source_dir, file_path)
        assert actual == 'no_datetime/Capitol_Building_Full_View.jpg'

    def test_hash_file(self):
        from src.local.utils import file_hash
        actual = file_hash(PhotospherePath(os.path.dirname(__file__) + "/test.txt"))
        expected = "e05fcb614ab36fdee72ee1f2754ed85e2bd0e8d0"
        assert actual == expected