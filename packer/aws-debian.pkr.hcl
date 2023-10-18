packer {
  required_plugins {
    amazon = {
      version = "~> 1"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

source "amazon-ebs" "debian" {
  ami_name      = "db_${formatdate("YYYY_MM_DD_hh_mm_ss", timestamp())}"
  source_ami    = "ami-06db4d78cb1d3bbf9" # Replace with the correct Debian 12 AMI ID
  instance_type = "t2.micro"
  region        = "us-east-1"
  ssh_username  = "admin"
  profile       = "dev"
}

build {
  sources = [
    "source.amazon-ebs.debian"
  ]
  provisioner "shell" {
    script = "./setup.sh"
  }
  provisioner "file" {
    source      = "BhaktiBharat_Desai_002701264_03.zip"
    destination = "~/BhaktiBharat_Desai_002701264_03"
  }

}