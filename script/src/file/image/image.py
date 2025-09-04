import os
import re
from datetime import datetime
import PIL
from PIL import Image
from src.file.local_file import PhotosphereFile
from src.file.path import PhotospherePath
from src.gps.gps import dms_to_decimal
import imagehash


class PhotosphereImage(PhotosphereFile):
    TYPE = "IMAGE"
    ALLOWED_EXTENSIONS: set[str] = {'.png', '.jpg', '.jpeg', '.tiff'}
    HASH_SIZE = 16

    def __init__(self, local_file_path: PhotospherePath):
        super().__init__(local_file_path)
        if not local_file_path.is_allowed_extension(self.ALLOWED_EXTENSIONS):
            raise ValueError("We don't support this image file format")
        self.pilImage = Image.open(local_file_path.get_string())
        self.__set_metadata()
        self._set_geohash()
        self.__set_average_hash()

    def __set_metadata(self):
        exif = self.pilImage._getexif()
        if exif is None:
            return None
        for k, v in exif.items():
            try:
                tag = PIL.ExifTags.TAGS[k]
                if tag == "GPSInfo":
                    self.__set_gps_info(v)
                elif tag == "DateTimeOriginal" or tag == "date_time_original":
                    self.__set_create_datetime(v)
                elif tag == "DateTime" and self.created_at is None:
                        self.__set_create_datetime(v)
            except:
                pass

    def __set_gps_info(self, gps_info):
        if 1 in gps_info and 2 in gps_info and 3 in gps_info and 4 in gps_info:
            latitude_direction = gps_info[1]
            latitude_dms = gps_info[2]
            longitude_direction = gps_info[3]
            longitude_dms = gps_info[4]
            self.latitude = dms_to_decimal(
                latitude_dms[0],
                latitude_dms[1],
                latitude_dms[2],
                latitude_direction
            )
            self.longitude = dms_to_decimal(
                longitude_dms[0],
                longitude_dms[1],
                longitude_dms[2],
                longitude_direction
            )

    def __set_average_hash(self):
        self.average_hash = imagehash.average_hash(self.pilImage, self.HASH_SIZE).__str__()

    def generate_thumbnail(self):
        thumbnail_path = f"{self.LOCAL_TMP_FOLDER}{os.path.basename(self.file_path.get_string())}.{self.hash}.thumbnail.jpg"
        self.pilImage.thumbnail((self.THUMBNAIL_PIXEL_SIZE, self.THUMBNAIL_PIXEL_SIZE))
        # Convert RGBA to RGB if necessary
        if self.pilImage.mode == "RGBA":
            self.pilImage = self.pilImage.convert("RGB")
        self.pilImage.save(thumbnail_path, "JPEG")
        self.thumbnail_local_path = PhotospherePath(thumbnail_path)

    def __set_create_datetime(self, date: str):
        if "0000:00:00" in date:
            return None
        if re.match(r'\d{2}/\d{2}/\d{4}\d{1}:\d{2}', date):
            date = date[6:10] + '-' + date[3:5] + '-' + date[0:2] + ' 0' + date[10:]
        elif re.match(r'\d{2}/\d{2}/\d{4}\d{2}:\d{2}', date):
            date = date[6:10] + '-' + date[3:5] + '-' + date[0:2] + ' ' + date[10:]
        elif re.match(r'\d{4}:\d{2}:\d{2}\d{2}:\d{2}:\d{2}', date):
            date = date[0:4] + '-' + date[5:7] + '-' + date[8:10] + ' ' + date[10:]
        elif re.match(r'\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}', date):
            date = date[0:4] + '-' + date[5:7] + '-' + date[8:10] + ' ' + date[11:]
        self.created_at = datetime.strptime(date, "%Y-%m-%d %H:%M:%S")

    def __del__(self):
        if self.pilImage is not None:
            self.pilImage.close()
        if self.thumbnail_local_path and self.thumbnail_local_path.exists():
            self.thumbnail_local_path.remove()

    def __str__(self):
        return f"PhotosphereImage(file_path={self.file_path}, created_at={self.created_at}, latitude={self.latitude}, longitude={self.longitude}, hash={self.average_hash})"
