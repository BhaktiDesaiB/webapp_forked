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
sudo apt-get clean

# Update the package list to get the latest package information
sudo apt-get update

sudo apt remove git -y

sudo apt-get upgrade -y

# Install Node.js and npm
sudo apt-get install -y nodejs npm

# Install MariaDB
# sudo apt-get install -y mariadb-server
# sudo apt-get install -y mariadb-server

# Install unzip
sudo apt-get install -y unzip

sudo groupadd csye6225
sudo useradd -s /bin/false -g csye6225 -d /opt/csye6225 -m csye6225

# Unzip the file to the destination directory
# sudo mkdir "/opt/webapp"

sudo mkdir "/opt/csye6225/webapp"
sudo unzip "/tmp/bhaktidesai_002701264_05" -d "/opt/csye6225/webapp/"
# sudo chmod 655 "/opt/webapp"
cd /opt/csye6225/webapp/

sudo npm install

sudo chown -R csye6225:csye6225 .
sudo chmod -R 755 .

# Move systemd service unit file to the correct location
sudo mv /opt/csye6225/webapp/autosys.service /etc/systemd/system/
 
# Enable and start the systemd service
sudo systemctl enable autosys
sudo systemctl start autosys

sudo apt-get clean