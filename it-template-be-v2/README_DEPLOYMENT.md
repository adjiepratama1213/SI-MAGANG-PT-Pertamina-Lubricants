<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

## Description

Flow to create deployment

## Installation

1. Create devops folder
2. Create Dockefile
3. Buat Service account di GCP -> Iam.
4. Check Project Name & ID, e.g. devops-prod
5. Create CloudSQL User & Database
6. Grant Service Account to GCP -> Cloud SQL Client
7. Build Docker & Push to Artifact Registry
8. Create bucket for GCS with permission for the SA: Storage Admin
9. Setup Kubernetes Konteks in Docker Dashboard
10. Create GKE SA with command
11. Create permission & binding to GKE
12. Ke Service Account -> Buat Key Baru JSON
13. Make sure JSON dimasukkan ke dalam folder devops namun di ignore agar tidak masuk ke github
14. Create File GKE: deploy.yaml, secret.yaml
15. Setup Cloud Build Yaml
16. Create Repositories Connection & Trigger in Cloud Build
