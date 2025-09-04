from src.file.path import PhotospherePath
from src.gps.gps import encode_geohash
from tinydb import TinyDB

from src.local.utils import create_folder_if_not_exists, file_hash


class PhotosphereFile:

    TYPE = "FILE"
    ALLOWED_EXTENSIONS: set[str] = {'.txt', '.pdf'}
    LOCAL_TMP_FOLDER = '/tmp/photosphere/'
    THUMBNAIL_PIXEL_SIZE = 280

    def __init__(self, local_file_path: PhotospherePath):
        self.file_path = local_file_path
        if not local_file_path.exists():
            raise FileNotFoundError(f"The file {local_file_path} does not exist.")
        self.hash = file_hash(self.file_path)
        self.average_hash = None
        self.created_at = None
        self.latitude = None
        self.longitude = None
        self.geohash = None
        self.source_bucket_uri = None
        self.thumbnail_local_path = None
        self.thumbnail_bucket_uri = None
        create_folder_if_not_exists(PhotospherePath(self.LOCAL_TMP_FOLDER))

    def _set_geohash(self):
        if self.latitude and self.longitude:
            self.geohash = encode_geohash(self.latitude, self.longitude)

    def get_local_file_path(self) -> PhotospherePath:
        return self.file_path

    def set_source_bucket_uri(self, bucket_uri: str):
        self.source_bucket_uri = bucket_uri

    def get_source_bucket_uri(self) -> str:
        return self.source_bucket_uri

    def set_thumbnail_bucket_uri(self, bucket_uri: str):
        self.thumbnail_bucket_uri = bucket_uri

    def get_thumbnail_bucket_uri(self) -> str:
        return self.thumbnail_bucket_uri

    def get_file_type(self) -> str:
        return self.TYPE

    def get_created_at(self) -> str | None:
        if self.created_at:
            return self.created_at.isoformat()
        return None

    def get_created_at_year(self) -> int | None:
        return self.created_at.year if self.created_at else None

    def get_created_at_month(self) -> int | None:
        return self.created_at.month if self.created_at else None

    def get_created_at_day(self) -> int | None:
        return self.created_at.day if self.created_at else None

    def get_created_at_timestamp(self) -> int | None:
        return self.created_at.timestamp() if self.created_at else None

    def get_latitude(self) -> int | None:
        if self.latitude:
            return self.latitude
        return None

    def get_longitude(self) -> int | None:
        if self.longitude:
            return self.longitude
        return None

    def get_geohash(self) -> str | None:
        if self.geohash:
            return self.geohash
        return None

    def get_average_hash(self) -> str | None:
        if hasattr(self, 'average_hash') and self.average_hash:
            return self.average_hash
        return None

    def get_hash(self) -> str:
        return self.hash

    @staticmethod
    def get_static_field_list() -> list[str]:
        """
        Returns a list of static field names for the PhotosphereFile class.
        These fields are used for serialization and database storage.
            local_file_path: The local path to the file.
            source_bucket_uri: The URI of the source bucket where the file is stored.
            thumbnail_bucket_uri: The URI of the thumbnail bucket where the thumbnail is stored.
            file_type: The type of the file (e.g., "FILE").
            created_at: The creation date and time of the file.
            created_at_timestamp: The creation date and time of the file as a Unix timestamp.
            latitude: The latitude where the file was created (if available).
            longitude: The longitude where the file was created (if available).
            geohash: The geohash representing the location where the file was created (if available).
            hash: The hash of the file
            average_hash: The average hash (only for videos and photos) of the file to find duplicates (if available)
        """
        return [
            "local_file_path",
            "source_bucket_uri",
            "thumbnail_bucket_uri",
            "file_type",
            "created_at",
            "created_at_timestamp",
            "latitude",
            "longitude",
            "geohash",
            "hash",
            "average_hash"
        ]

    def get_dic(self) -> dict:
        dic = {}
        for field in self.get_static_field_list():
            if field == "local_file_path":
                dic[field] = self.file_path.get_string()
            elif field == "file_type":
                dic[field] = self.__class__.TYPE
            elif field == "created_at" and self.created_at:
                dic[field] = self.created_at.isoformat()
            elif field == "created_at_timestamp" and self.created_at:
                dic[field] = int(self.created_at.timestamp())
            else:
                value = getattr(self, field, None)
                dic[field] = value
        return dic

    def persist(self, db: TinyDB) -> None:
        """
        Appends the current PhotosphereLocalFile instance to the TinyDB database passed as db.
        """
        db.insert(self.get_dic())