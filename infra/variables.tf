variable "project_id" {
  description = "Google Cloud project ID"
  type        = string
}

variable "region" {
  description = "Region to create resources in"
  type        = string
  default     = "asia-south1"
}

variable "zone" {
  description = "Zone to create resources in"
  type        = string
  default     = "asia-south1-a"
}

variable "bucket_name" {
  description = "The name of the storage bucket"
  type        = string
}
