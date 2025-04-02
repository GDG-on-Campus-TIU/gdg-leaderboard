resource "google_storage_bucket" "images_bucket" {
  name                        = var.bucket_name
  location                    = var.region
  force_destroy               = true
  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }
}

resource "google_storage_bucket_iam_binding" "service_account_access" {
  bucket = google_storage_bucket.images_bucket.name
  role   = "roles/storage.objectViewer"
  members = [
    "serviceAccount:your-service-account@${var.project_id}.iam.gserviceaccount.com"
  ]
}

resource "google_storage_bucket_iam_binding" "no_public_access" {
  bucket = google_storage_bucket.images_bucket.name
  role   = "roles/storage.legacyBucketReader"
  members = [
    "allUsers"
  ]
}
