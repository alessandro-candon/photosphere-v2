# from pathlib import Path
# from tinydb import TinyDB
# from tqdm import tqdm
# from src.file.path import PhotospherePath
# from src.protobuf.converter import create_protobuf_file_list
#
#
# def create_load_test_data(num_files: int = 1000, output_dir: str = "tests/load_test_data"):
#     """
#     Create load test data with X PhotosphereFiles
#
#     Args:
#         num_files: Number of PhotosphereFile objects to generate
#         output_dir: Directory to save the output files
#     """
#     output_path = Path(output_dir)
#     if not output_path.exists():
#         output_path.mkdir(parents=True, exist_ok=True)
#     db = TinyDB(output_path.joinpath("db_" + str(num_files) + ".json"))
#
#     psList = []
#
#     with tqdm(total=num_files, desc="Creating files", unit="files") as pbar:
#         for i in range(num_files):
#             psList.append({
#                 "local_file_path": "/Users/mac-ACANDO14/Site/personal/photosphere/photosphere-v2-monorepo/script/out/result/2022/5/29/Sauzet_-_Chemin_de_Ronde_-_Portail_Blanc_-_Plaque_de_distances_le\u0301gales.jpg",
#                 "source_bucket_uri": "gs://photosphere-v2-72be3.firebasestorage.app/result/2022/5/29/Sauzet_-_Chemin_de_Ronde_-_Portail_Blanc_-_Plaque_de_distances_le\u0301gales.jpg",
#                 "thumbnail_bucket_uri": "gs://photosphere-v2-72be3.firebasestorage.app/thumbnails/Sauzet_-_Chemin_de_Ronde_-_Portail_Blanc_-_Plaque_de_distances_le\u0301gales.jpg.fcd88431bfa5f2453d958e86756a8796bf8570e8.thumbnail.jpg",
#                 "file_type": "IMAGE",
#                 "created_at": "2022-05-29T15:52:29",
#                 "created_at_timestamp": 1653832349,
#                 "latitude": 52.08274899991836,
#                 "longitude": -1.7985969999226785,
#                 "geohash": "gcq8r16k18hg",
#                 "hash": "fcd88431bfa5f2453d958e86756a8796bf8570e8",
#                 "average_hash": "fffffffff81ff00ff00ff00fe007c003c003c003c003e007e007e007ff7fffff"
#             })
#             pbar.update(1)
#             if (i + 1) % 1000 == 0:
#                 db.insert_multiple(psList)
#                 psList = []
#
#     if psList:
#         db.insert_multiple(psList)
#
#     all_files = db.all()
#     db.close()
#     create_protobuf_file_list(all_files, PhotospherePath(output_path / ("photosphere_files_" + str(num_files) + ".pb")))
#
#
# if __name__ == "__main__":
#     create_load_test_data(num_files=100000)
