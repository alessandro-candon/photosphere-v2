import os
from unittest import TestCase

from src.file.path import PhotospherePath
from src.file.video.video import PhotosphereVideo

class TestPhotosphereVideo(TestCase):

    current_dir = os.path.dirname(__file__)

    def test_video_metadata_hash(self):
        path = os.path.abspath(
            os.path.join(
                self.current_dir, '../../../resources/original_videos/video_hash.mp4'
            )
        )
        psVideo = PhotosphereVideo(PhotospherePath(path))
        print(psVideo.average_hash)
        assert psVideo.average_hash == "0b0100000101010111000110010111101001001111010100000100000111110000"

        path = os.path.abspath(
            os.path.join(
                self.current_dir, '../../../resources/original_videos/video.mp4'
            )
        )
        psVideo = PhotosphereVideo(PhotospherePath(path))
        assert psVideo.average_hash == "0b1111111111111010111011001100100001010001111100111000000011000000"

    def test_video_metadata(self):
        path = os.path.abspath(
            os.path.join(
                self.current_dir, '../../../resources/original_videos/video.mp4'
            )
        )
        psVideo = PhotosphereVideo(PhotospherePath(path))
        assert psVideo.created_at.isoformat() == '2015-08-07T09:13:02'

    def test_video_gps_hash(self):
        path = os.path.abspath(
            os.path.join(
                self.current_dir, '../../../resources/original_videos/video.mp4'
            )
        )
        psVideo = PhotosphereVideo(PhotospherePath(path))
        assert psVideo.geohash is None

    def test_video_thumbnail(self):
        path = os.path.abspath(
            os.path.join(
                self.current_dir, '../../../resources/original_videos/video.mp4'
            )
        )
        psVideo = PhotosphereVideo(PhotospherePath(path))
        psVideo.generate_thumbnail()
        thumbnail = psVideo.thumbnail_local_path.get_string()
        psVideo.generate_thumbnail()
        assert thumbnail is not None
        assert thumbnail.endswith('.thumbnail.jpg')
        psVideo.__del__()
        assert not os.path.exists(thumbnail)

    def test_video_hash(self):
        path = os.path.abspath(
            os.path.join(
                self.current_dir, '../../../resources/original_videos/video.mp4'
            )
        )
        psVideo = PhotosphereVideo(PhotospherePath(path))
        assert psVideo.hash == "55508bc98a00f615dbe9bd4c84a253ba4238b021"

    def test_video_m4v_extension(self):
        path = os.path.abspath(
            os.path.join(
                self.current_dir, '../../../resources/original_videos/sample_960x540.m4v'
            )
        )
        psVideo = PhotosphereVideo(PhotospherePath(path))
        assert psVideo.hash == "015f72d916d06428baf9b6cc3a031ae47c596cb4"
        assert psVideo.TYPE == "VIDEO"
        assert psVideo.file_path.get_string().endswith('.m4v')
        psVideo.generate_thumbnail()
        thumbnail = psVideo.thumbnail_local_path.get_string()
        assert thumbnail is not None
        assert thumbnail.endswith('.thumbnail.jpg')
        psVideo.__del__()
        assert not os.path.exists(thumbnail)


    def test_video_mov_extension(self):
        path = os.path.abspath(
            os.path.join(
                self.current_dir, '../../../resources/original_videos/file_example_MOV.mov'
            )
        )

        psVideo = PhotosphereVideo(PhotospherePath(path))
        assert psVideo.hash == "64bbbe58aa61c4d5966a8247b675256b12401819"
        assert psVideo.TYPE == "VIDEO"
        assert psVideo.file_path.get_string().endswith('.mov')
        psVideo.generate_thumbnail()
        thumbnail = psVideo.thumbnail_local_path.get_string()
        assert thumbnail is not None
        assert thumbnail.endswith('.thumbnail.jpg')
        psVideo.__del__()
        assert not os.path.exists(thumbnail)
