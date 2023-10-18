#!/bin/bash

# Set the root password for MariaDB
ROOT_PASSWORD="root"

# Database name to create
DB_NAME="cloud_assignment"

# New user information
NEW_USER="admin"
NEW_USER_PASSWORD="admin"

# Specify the path to the zip file
# ZIP_FILE="/BhaktiBharat_Desai_002701264_03.zip"

# Specify the destination directory for extraction
# DEST_DIR="/opt/"

# Update the package list to get the latest package information
sudo apt-get update

sudo apt-get upgrade -y

# Install Node.js and npm
sudo apt-get install -y nodejs npm

# Install MariaDB
sudo apt-get install -y mariadb-server

# Install unzip
sudo apt-get install -y unzip

# Start and enable MariaDB service
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Set the root password for MariaDB
sudo mysqladmin -u root password "$ROOT_PASSWORD"

# Create the "Cloud_db" database
sudo mysql -u root -p"$ROOT_PASSWORD" -e "CREATE DATABASE $DB_NAME;"

# Create a new MariaDB user with administrative privileges
sudo mysql -u root -p"$ROOT_PASSWORD" -e "CREATE USER '$NEW_USER'@'localhost' IDENTIFIED BY '$NEW_USER_PASSWORD';"
sudo mysql -u root -p"$ROOT_PASSWORD" -e "GRANT ALL PRIVILEGES ON *.* TO '$NEW_USER'@'localhost' WITH GRANT OPTION;"
sudo mysql -u root -p"$ROOT_PASSWORD" -e "FLUSH PRIVILEGES;"

sudo mkdir -p /BhaktiBharat_Desai_002701264_03
sudo sudo chmod 755 /BhaktiBharat_Desai_002701264_03
sudo unzip BhaktiBharat_Desai_002701264_03 -d BhaktiBharat_Desai_002701264_03_webapp

# cd ~/BhaktiBharat_Desai_002701264_03

# Unzip the file to the destination directory
# sudo unzip "$ZIP_FILE" -d "DEST_DIR"


sudo npm install

sudo apt-get clean