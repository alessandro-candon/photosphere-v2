# Photosphere v2

Photosphere v2 is a web application that allows users to upload photos, videos and some files and view them in everyware. 
The application is built using modern web technologies and is designed to be user-friendly, responsive, secure and cheaper!

![photosphere experience.gif](doc/photosphere%20experience.gif)


**Really cheaper, from 6 to 20 times less then google photos!**

## Project deploy
We are using all serverless solution to deploy the full project based on Firebase services.
1. Make sure you have the Firebase CLI installed. If you haven't installed it yet, you could check the official documentation [here](https://firebase.google.com/docs/cli#install_the_firebase_cli).
2. Make sure you have GCloud CLI installed. If you haven't installed it yet, you could check the official documentation [here](https://cloud.google.com/sdk/docs/install).
3. Login to your Firebase account using the command:
```sh
firebase login
```
or if you are already logged 
```
firebase login --reauth
```
4. Login to your GCloud account using the command:
```sh
gcloud auth login
glocud auth application-default login
```

5. Create the firebase project using the command and add the project id 6-30 characters, I suggest you to use
   the name **photosphere-v2-** suffixed with 5 chars random string (es. photosphere-v2-x1y2z):
```sh
firebase projects:create --display-name photosphere-v2
```

6. Select the project using the command:
```sh
firebase use <project-id>
gcloud config set project <project-id>
```

7. Add firebase app data to the project using the command:
```bash
./firebase_sdk_setup.sh
```

8. Select payment plan for the project using the firebase console:
    * Go to the [Firebase Console](https://console.firebase.google.com/).
    * Select your project.
    * Go to the settings (gear icon) next to "Project Overview" in the left sidebar.
    * Select Spark plan (free plan) and confirm the link with the service account

![link_billing_account.png](doc/assets/link_billing_account.png)

9. Create a storage in firebase project with using the firebase console:
    * Go to the [Firebase Console](https://console.firebase.google.com/).
    * Select your project
    * Select "Storage" from the left-hand menu
    * Click on "Get Started" and select all the options
![bucket-options.png](doc/assets/bucket-options.png)

   I suggest you:
    * Select the location closest to you
    * Choose a single region for less cost ex. EUROPE-WEST8
    * Set Archive as the default storage class to save costs

Then click on "Production mode".

10. Change in the file `storage.rules` the email with your email to be able to login, upload and download files.

11. Set the CORS configuration for the storage bucket using the command:
```sh
gcloud storage buckets update gs://<project-id>.firebasestorage.app --cors-file=cors.json
```

12. Deploy the project using the command:
```sh
./deploy.sh
```