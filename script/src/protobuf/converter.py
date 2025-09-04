from src.file.path import PhotospherePath
from tinydb.table import Document
from google.protobuf.internal import encoder
import io
from src.protobuf.dist import photosphere_file_pb2


def _VarintBytes(value):
    buf = io.BytesIO()
    encoder._EncodeVarint(buf.write, value)
    return buf.getvalue()

def create_protobuf_file_list(files: list[Document], out: PhotospherePath) -> None:
    files = sorted(files, key=lambda x: x.get('created_at_timestamp') or 0, reverse=True)
    with open(out.get_string(), 'wb') as f:
        for file in files:
            proto_file = photosphere_file_pb2.PhotosphereFile(
                source_bucket_uri=file["source_bucket_uri"],
                file_type=file["file_type"],
                created_at_timestamp=file["created_at_timestamp"],
                geohash=file["geohash"],
                hash=file["hash"]
            )
            serialized_data = proto_file.SerializeToString()
            f.write(_VarintBytes(len(serialized_data)))
            f.write(serialized_data)