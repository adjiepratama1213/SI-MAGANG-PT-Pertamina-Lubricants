## DOCKER

### Build

```bash
# build
$ docker buildx build --platform=linux/amd64 -t asia-southeast2-docker.pkg.dev/ptpl-quality-prd/docker/lube-connect-api-gcr -f ./devops/production/Dockerfile .

# push
$ docker push asia-southeast2-docker.pkg.dev/ptpl-quality-prd/docker/lube-connect-api-gcr
```

# GCP

## Service Account

`ptpl-qlubemark@ptpl-quality-prd.iam.gserviceaccount.com`

## Setup Database

`ptpl-database-prd:asia-southeast2:psql`

- u: lube-connect-user
- p: Ng0m0ngD00nG
- db: lube-connect

auth SA to gcp database project as:

- Cloud SQL Client
- Service Account Token Creator

## Setup Bucket

ptpl-quality-lab/retained-sample
set proper permission

## Deploy to Cloud Run

```bash
# update gcloud component
$ gcloud components update

# set project
$ gcloud config set project ptpl-quality-prd

# deploy to google cloud run
$ gcloud run deploy lube-connect-api \
--image=asia-southeast2-docker.pkg.dev/ptpl-quality-prd/docker/lube-connect-api-gcr \
--platform=managed \
--region=asia-southeast2 \
--service-account=ptpl-qlubemark@ptpl-quality-prd.iam.gserviceaccount.com \
--add-cloudsql-instances=ptpl-database-prd:asia-southeast2:psql \
--allow-unauthenticated \
--set-env-vars DATABASE_URL='postgres://lube-connect-user:Ng0m0ngD00nG@localhost:5432/lube-connect?schema=public&host=/cloudsql/ptpl-database-prd:asia-southeast2:psql&sslmode=disable' \
--set-env-vars FRONTEND_URL='https://lube-connect.lubes.id/' \
--set-env-vars JWT_ACCESS_SECRET='yGaOyMZ8DqprzPQKMx4mILaANJpyT3pDEZGL7NvWVDw=',JWT_REFRESH_SECRET='rpey5sfyf4hSM7lng09BG0h5b1qhRewaNQoNcXfGE6M=' \
--set-env-vars IDAMAN_URL='https://login.idaman.pertamina.com/connect/token',IDAMAN_REST_URL='https://rest.idaman.pertamina.com/',IDAMAN_CLIENT_ID='797a0cdc-440b-4e28-8882-a4d903ee2a8f',IDAMAN_CLIENT_SECRET='882c6982-77df-4050-814a-842bd6d4508e',IDAMAN_GRANT_TYPE='client_credentials' \
--set-env-vars GCP_BUCKET_NAME='ptpl-quality-qi' \
--set-env-vars EMAIL_HOST='mail.lubes.id',EMAIL_USER='notif.lubemark@lubes.id',EMAIL_PASS='K3luarga#SelaluDiHat!',EMAIL_PORT='465' \
--set-env-vars API_KEYS="m4sdLZwsrOrNqb9sE2I17LA=,UrO689sC8DmKH3EmNa5F5Mc=,1NxmgWcTcUXy1EDDSy+/yEQ="


# add service account annotation
$ gcloud run services describe lube-connect-api --region asia-southeast2 --format='value(spec.template.spec.serviceAccountName)'
```

## Seed DB

seed db from local using cloud-sql-proxy
