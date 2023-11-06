packer {
  required_plugins {
    amazon = {
      source  = "github.com/hashicorp/amazon"
      version = ">= 1.0.0"
    }
  }
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "source_ami" {
  type    = string
  default = "ami-06db4d78cb1d3bbf9" 
}

variable "ssh_username" {
  type    = string
  default = "admin"
}

variable "subnet_id" {
  type    = string
  default = "subnet-0e9aaeaee7a506d3e"
}

variable "ami_description" {
  type    = string
  default = "ami for csye6225"
}

variable "profile" {
  type    = string
  default = "db-dev"
}

variable "instance_type" {
  type    = string
  default = "t2.micro"
}

source "amazon-ebs" "debian" {
  ami_name        = "db_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  ami_description = "${var.ami_description}"
  region          = "${var.aws_region}"

  ami_users = [310794324007, 607251300885]
  ami_regions = [ "us-east-1",
  ]

  aws_polling {
    delay_seconds = 120
    max_attempts  = 50
  }

  instance_type = "${var.instance_type}"
  source_ami    = "${var.source_ami}"
  ssh_username  = "${var.ssh_username}"
  subnet_id     = "${var.subnet_id}"

  launch_block_device_mappings {
    delete_on_termination = true
    device_name           = "/dev/xvdh"
    volume_size           = 8
    volume_type           = "gp2"
  }
}

build {
  sources = ["source.amazon-ebs.debian"]
  provisioner "file" {
    source      = "./bhaktidesai_002701264_05.zip"
    destination = "/tmp/bhaktidesai_002701264_05.zip"
  }
  provisioner "shell" {
    environment_vars = [
      "DEBIAN_FRONTEND= noninteractive",
      "CHECKPOINT_DISABLE=1"
    ]
    script = ["./setup.sh","./cloudsetup.sh"]
  }
}