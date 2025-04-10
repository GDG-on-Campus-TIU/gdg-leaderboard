# ----------------------------
# NETWORKING: VPC + Subnets
# ----------------------------
resource "google_compute_network" "vpc_network" {
  name                    = "gdg-leaderboard-swarm-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "public_subnet" {
  name          = "gdg-leaderboard-public-subnet"
  ip_cidr_range = "10.0.1.0/24"
  region        = var.region
  network       = google_compute_network.vpc_network.id
}

resource "google_compute_subnetwork" "private_subnet" {
  name                     = "gdg-leaderboard-private-subnet"
  ip_cidr_range            = "10.0.2.0/24"
  region                   = var.region
  network                  = google_compute_network.vpc_network.id
  private_ip_google_access = true
}

# ----------------------------
# PUBLIC IP for NAT Gateway
# ----------------------------
resource "google_compute_address" "nat_ip" {
  name   = "gdg-leaderboard-nat-ip"
  region = var.region
}

resource "google_compute_router" "nat_router" {
  name    = "gdg-leaderboard-nat-router"
  region  = var.region
  network = google_compute_network.vpc_network.id
}

resource "google_compute_router_nat" "nat" {
  name                               = "gdg-leaderboard-nat-config"
  router                             = google_compute_router.nat_router.name
  region                             = var.region
  nat_ip_allocate_option             = "MANUAL_ONLY"
  nat_ips                            = [google_compute_address.nat_ip.id]
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}

resource "google_compute_router_nat" "additional_nat" {
  name                               = "gdg-leaderboard-additional-nat-config"
  router                             = google_compute_router.nat_router.name
  region                             = var.region
  nat_ip_allocate_option             = "MANUAL_ONLY"
  nat_ips                            = [google_compute_address.nat_ip.id]
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}

# ----------------------------
# FIREWALL RULES
# ----------------------------
resource "google_compute_firewall" "allow_ssh" {
  name    = "gdg-leaderboard-allow-ssh"
  network = google_compute_network.vpc_network.name
  project = var.project_id

  allow {
    protocol = "tcp"
    ports    = ["22"]
  }

  source_ranges = ["0.0.0.0/0"]
  target_tags   = ["swarm-node"]
}

# ----------------------------
# VM INSTANCES
# ----------------------------
resource "google_compute_instance" "public_vm" {
  name         = "public-vm"
  machine_type = "n2-custom-2-6144"
  zone         = var.zone
  tags         = ["swarm-node"]

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
      size  = "20"
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.public_subnet.name
    access_config {} # This gives public IP
  }
}

resource "google_compute_instance" "private_vm" {
  name         = "private-vm"
  machine_type = "n2-custom-2-6144"
  zone         = var.zone

  boot_disk {
    initialize_params {
      image = "debian-cloud/debian-11"
      size  = "20"
    }
  }

  network_interface {
    subnetwork = google_compute_subnetwork.private_subnet.name
  }
}

# # ----------------------------
# # STORAGE BUCKET
# # ----------------------------
# resource "google_storage_bucket" "images_bucket" {
#   name                        = var.bucket_name
#   location                    = var.region
#   force_destroy               = true
#   uniform_bucket_level_access = true

#   versioning {
#     enabled = true
#   }
# }

# resource "google_storage_bucket_iam_binding" "public_access" {
#   bucket = google_storage_bucket.images_bucket.name
#   role   = "roles/storage.objectViewer"
#   members = [
#     "allUsers"
#   ]
# }
