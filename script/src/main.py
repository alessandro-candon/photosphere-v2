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
@click.option('--destination', required=True,
              type=click.Path(
                  resolve_path=True,
                  writable=True
              ),
              help='Destination directory where the photos will be moved.')
def organize(source: Path, destination: Path):

    """Organize the photos in the directory according to the date and time of the photo taken."""

    print('Organizing photos in {}'.format(source))
    print('Moving photos to {}'.format(destination))

    organize_all_files(PhotospherePath(source), PhotospherePath(destination))

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
def sync_in_cloud(source: Path, bucket: str):

    print('Syncing files in the cloud from {}'.format(source))
    print('Uploading files to bucket {}'.format(bucket))

    copy_in_cloud(PhotospherePath(source), bucket)



if __name__ == "__main__":
    cli()
