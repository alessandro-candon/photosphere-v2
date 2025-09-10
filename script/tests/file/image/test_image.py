import os
from unittest import TestCase
from src.file.image.image import PhotosphereImage
from src.file.path import PhotospherePath


class TestPhotosphereImage(TestCase):

    current_dir = os.path.dirname(__file__)

    def test_image_metadata_with_skipped_error(self):
        path = os.path.abspath(
            os.path.join(
                self.current_dir, '../../../resources/original_images/Sauzet_-_Chemin_de_Ronde_-_Portail_Blanc_-_Plaque_de_distances_légales.jpg'
            )
        )
        psImage = PhotosphereImage(PhotospherePath(path))
        assert psImage.file_path.get_string() == path
        assert psImage.get_file_type() == 'IMAGE'

    # add a test here to create a ImageClass and view metadata
    def test_image_metadata_gps(self):
        path = os.path.abspath(
            os.path.join(
                self.current_dir, '../../../resources/original_images/7122_series_train_(9).JPG'
            )
        )
        psImage = PhotosphereImage(PhotospherePath(path))
        assert round(psImage.latitude, 4) == 42.0028
        assert round(psImage.longitude, 4) == -88.6973
        assert psImage.geohash == "dp2yvwkeu"
        del psImage

    def test_image_metadata_create_at(self):
        path = os.path.abspath(
            os.path.join(
                self.current_dir, '../../../resources/original_images/Car_moving.jpg'
            )
        )
        psImage = PhotosphereImage(PhotospherePath(path))
        assert psImage.created_at.isoformat() == '2014-10-20T17:18:53'
        assert psImage.get_created_at_year() == 2014
        assert psImage.get_created_at_month() == 10
        assert psImage.get_created_at_day() == 20

        path = os.path.abspath(
            os.path.join(
                self.current_dir, '../../../resources/original_images/7122_series_train_(9).JPG'
            )
        )
        psImage = PhotosphereImage(PhotospherePath(path))
        assert psImage.created_at is None

        del psImage

    def test_image_metadata_hash(self):
        path = os.path.abspath(
            os.path.join(
                self.current_dir, '../../../resources/original_images/Car_moving.jpg'
            )
        )
        psImage = PhotosphereImage(PhotospherePath(path))
        assert psImage.average_hash == "fe90fa90f991fc80f800f820f820f800f802f800fc00fe00ff00fc00fc00fc00"

    def test_load_images_without_error(self):
        path = os.path.abspath(
            os.path.join(
                self.current_dir, '../../../resources/original_images'
            )
        )
        for root, dirs, files in os.walk(path):
            for file in files:
                path = os.path.normpath(os.path.join(root, file))
                print(path)
                img = PhotosphereImage(PhotospherePath(path))
                assert img.file_path is not None
                del img

    def test_image_thumbnail(self):
        path = os.path.abspath(
            os.path.join(
                self.current_dir, '../../../resources/original_images/Car_moving.jpg'
            )
        )
        psImage = PhotosphereImage(PhotospherePath(path))
        psImage.generate_thumbnail()
        thumbnail = psImage.thumbnail_local_path.get_string()
        assert thumbnail is not None
        assert thumbnail.endswith('.thumbnail.jpg')
        assert os.path.exists(thumbnail)
        psImage.__del__()
        assert not os.path.exists(thumbnail)

    def test_image_thumbnail_with_conversion_error(self):

        path = os.path.abspath(
            os.path.join(
                self.current_dir, '../../../resources/original_images/Aurige._Musée_Delphes._Grèce.png'
            )
        )
        psImage = PhotosphereImage(PhotospherePath(path))
        psImage.generate_thumbnail()
        thumbnail = psImage.thumbnail_local_path.get_string()
        assert thumbnail is not None
        psImage.__del__()

    def test_image_heic_format(self):
        path = os.path.abspath(
            os.path.join(
                self.current_dir, '../../../resources/original_images/landscape_macos.HEIC'
            )
        )
        psImage = PhotosphereImage(PhotospherePath(path))
        assert psImage.file_path.get_string() == path
        assert psImage.get_file_type() == 'IMAGE'
        assert psImage.created_at.isoformat() == '2020-07-11T10:17:23'
        assert psImage.average_hash == "fff8cffc0ff807f907f803f803f003f803f803f90fb99f089fc0c1e000fc03fe"