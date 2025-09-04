import json
import os
import re
import subprocess
from datetime import datetime
from videohash2 import VideoHash
from src.file.local_file import PhotosphereFile
from src.file.path import PhotospherePath
from src.util.dict_utils import is_path
import ffmpeg

class PhotosphereVideo(PhotosphereFile):

    TYPE = "VIDEO"
    ALLOWED_EXTENSIONS: set[str] = {'.mp4', '.m4v', '.mov'}

    def __init__(self, local_file_path: PhotospherePath):
        super().__init__(local_file_path)
        if not local_file_path.is_allowed_extension(self.ALLOWED_EXTENSIONS):
            raise ValueError("We don't support this video file format")
        self.__set_metadata()
        self._set_geohash()
        self.__set_average_hash()

    def __set_metadata(self):
        cmd = ['ffprobe', '-v', 'quiet', '-print_format', 'json', '-show_format', '-show_streams', self.file_path.get_string()]
        result = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if result.returncode == 0:
            metadata = json.loads(result.stdout.decode('utf-8'))
            if is_path(metadata, 'format.tags.creation_time'):
                self.created_at = datetime.strptime(metadata['format']['tags']['creation_time'], "%Y-%m-%dT%H:%M:%S.%fZ")
            if is_path(metadata, "format.tags.location"):
                location = metadata["format"]["tags"]["location"]
                match = re.match(r'([+-]\d+\.\d+)([+-]\d+\.\d+)', location)
                self.latitude = float(match.group(1))
                self.longitude = float(match.group(2))

    def __set_average_hash(self):
        videohash = VideoHash(self.file_path.get_string())
        self.average_hash = videohash.__str__()
        videohash.delete_storage_path()

    def generate_thumbnail(self):
        thumbnail_path = f"{self.LOCAL_TMP_FOLDER}{os.path.basename(self.file_path.get_string())}.{self.hash}.thumbnail.jpg"
        try:
            (
                ffmpeg
                .input(self.file_path.get_string(), ss=0)  # The 'ss' flag is the start time, set to 0 for the first frame
                .output(thumbnail_path, vframes=1)  # The 'vframes' flag ensures only one frame is captured
                .run(overwrite_output=True, quiet=True)
            )
            self.thumbnail_local_path = PhotospherePath(thumbnail_path)
        except Exception as e:
            print(f"An error occurred while generating thumbnail : {e}")
            self.thumbnail_local_path = None

    def __del__(self):
        if self.thumbnail_local_path and self.thumbnail_local_path.exists():
            self.thumbnail_local_path.remove()