from pathlib import Path
import click
from src.cloud.sync_in_cloud import copy_in_cloud
from src.file.path import PhotospherePath
from src.local.generate_local_database import generate_local_database
from src.local.organize_files import organize_all_files
from importlib.metadata import version as pkg_version



@click.group()
@click.version_option(version=pkg_version("photosphere"), prog_name="photosphere")
def cli() -> click.Group:
    """Photosphere Project"""
    pass


@cli.command("organize")
@click.option('--source', required=True,
              type=click.Path(
                  exists=True,
                  dir_okay=True,
                  readable=True,
                  resolve_path=True
              ),
              help='Source directory from where the photos will be taken.')
@click.option('--out', required=True,
              type=click.Path(
                  resolve_path=True,
                  writable=True
              ),
              help='Destination directory where the photos will be moved.')
def organize(source: Path, out: Path):

    """Organize the photos in the directory according to the date and time of the photo taken."""

    print('Organizing photos in {}'.format(source))
    print('Moving photos to {}'.format(out))

    organize_all_files(PhotospherePath(source), PhotospherePath(out))

@cli.command('generate')
@click.option('--source', required=True,
              type=click.Path(
                  exists=True,
                  dir_okay=True,
                  readable=True,
                  resolve_path=True
              ),
              help='Source directory from where the photos will be taken.'
              )
@click.option('--out', required=True,
              type=click.Path(
                  exists=False,
                  dir_okay=True,
                  readable=True,
                  resolve_path=True
              ),
              help='Generate CSV file of all files in the direcory'
              )
def generate(source: Path, out: Path):
    """ Create CSV database of files in this directory """

    print('Generating database from {}'.format(source))
    print('Outputting database to {}'.format(out))

    generate_local_database(PhotospherePath(source), PhotospherePath(out))


# create a command called "sync-in-cloud" that will copy files in the cloud and save all references in a CSV file
@cli.command('sync-in-cloud')
@click.option('--source', required=True,
              type=click.Path(
                  exists=True,
                  dir_okay=True,
                  readable=True,
                  resolve_path=True
              ),
              help='Source directory from where the photos will be taken.'
              )
@click.option('--bucket', required=True,
              type=str,
              help='Name of the bucket where the files will be uploaded.'
              )
@click.option(
    '--subfolder',
    required=False,
    type=str,
    help='Subfolder in the bucket where the files will be uploaded (if source is "result" will be ignored)'
)
def sync_in_cloud(source: Path, bucket: str, subfolder: str = None):

    print('Syncing files in the cloud from {}'.format(source))
    print('Uploading files to bucket {}'.format(bucket))
    if subfolder is not None: print('Uploading files in subfolder {}'.format(subfolder))

    copy_in_cloud(PhotospherePath(source), bucket, subfolder)


@cli.command('convert-db-to-protobuf')
@click.option('--source', required=True,
                type=click.Path(
                    exists=True,
                    dir_okay=False,
                    readable=True,
                    resolve_path=True
                ),
                help='Source database file in TinyDB (jdon) format.'
                )
@click.option('--out', required=True,
                type=click.Path(
                    exists=False,
                    dir_okay=False,
                    readable=True,
                    resolve_path=True
                ),
                help='Output protobuf file.'
                )
def convert_db_to_protobuf(source: Path, out: Path):
    """ Convert TinyDB database to Protobuf file format """

    from src.protobuf.converter import create_protobuf_file_list
    from tinydb import TinyDB

    print('Loading database from {}'.format(source))
    db = TinyDB(PhotospherePath(source).get_string())
    print('Creating protobuf file at {}'.format(out))
    create_protobuf_file_list(db.all(), PhotospherePath(out))


if __name__ == "__main__":
    cli()
