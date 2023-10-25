#!/bin/bash

# Set the root password for MariaDB
# ROOT_PASSWORD="root"
# DB_NAME="cloud_assignment"

# New user information
# NEW_USER="admin"
# NEW_USER_PASSWORD="admin@123"

# Specify the path to the zip file
# ZIP_FILE="/tmp/bhaktidesai_002701264_05.zip"

# Specify the destination directory for extraction
# DEST_DIR="/opt/"

# Update the package list to get the latest package information
sudo apt-get update

sudo apt-get upgrade -y

# Install Node.js and npm
sudo apt-get install -y nodejs npm

# Install MariaDB
# sudo apt-get install -y mariadb-server

# Install unzip
sudo apt-get install -y unzip

# Unzip the file to the destination directory
# sudo mkdir "/opt/webapp"
sudo unzip "/tmp/bhaktidesai_002701264_05.zip" -d "/opt/webapp/"
sudo chmod 655 "/opt/webapp"
cd /opt/webapp/

sudo npm install

# Move systemd service unit file to the correct location
# sudo mv /opt/webapp/autosys.service /etc/systemd/system/
 
# Enable and start the systemd service
sudo systemctl enable autosys
sudo systemctl start autosys

sudo apt-get clean
