## Version V2 of photosphere

Images file support : '.png', '.jpg', '.jpeg', '.tiff'

### Library
* videohash : we use a fork : https://github.com/Demmenie/videohash2 do tue an error with PIL

### Command list

**organize** : This command will organize the photos in the directory according to the date and time of the photo taken.
* --source : This is the source directory from where the photos will be taken.
* --destination: This is the destination directory where the photos will be moved.
* --suffix-to-exclude: This is the suffix of the file which will be excluded from the organization.

**geneate**: This command will generate a CSV file with all data of your folders
* --source : This is the source directory from where the photos/videos will be taken.
* --out: This is the destination directory where the CSV file will be created.


**cloud_copy**: 
This command will copy the photos/videos to a cloud storage, the folder on cloud should not exists. 
Will be also created a CSV file with the data of the photos/videos.
* --source : This is the source directory from where the photos/videos will be taken.
* --destination: This is the destination directory where the photos/videos will be copied, if the folder exists, thrown an error.


### CORS ERROR ON STORAGE

If you have a CORS error on the storage, you can add the following headers to your storage bucket:

```shell
gsutil cors set cors.json gs://your-bucket-name
```

Where `cors.json` is a file with the following content:

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "PUT", "POST", "DELETE", "HEAD", "OPTIONS"],
    "responseHeader": ["*"],
    "maxAgeSeconds": 60
  }
]
```


### Installation

To install the dependencies and devDependencies:

```sh
pip install -r requirements.txt
```

and export the cli command:

```sh
pip install --editable .
```

Check if it works:

```sh
photosphere --help
photosphere version
```