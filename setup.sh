#!/bin/bash

# Install the CloudWatch Agent
curl -O https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
sudo rpm -U ./amazon-cloudwatch-agent.rpm
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c ssm:AmazonCloudWatch-linux -s

# Clean up the downloaded RPM file
rm -f amazon-cloudwatch-agent.rpm

# Continue with your other commands
sudo apt-get clean

# Update the package list to get the latest package information
sudo apt-get update

# Remove Git 
sudo apt remove git -y

# Upgrade packages
sudo apt-get upgrade -y

# Install Node.js and npm
sudo apt-get install -y nodejs npm

# Install MariaDB
# sudo apt-get install -y mariadb-server
# sudo apt-get install -y mariadb-server

# Install unzip
sudo apt-get install -y unzip

# Create a group and user
sudo groupadd csye6225
sudo useradd -s /bin/false -g csye6225 -d /opt/csye6225 -m csye6225

# Create a directory and unzip the application
sudo mkdir "/opt/csye6225/bhaktidesai_002701264_05"
sudo unzip "/tmp/bhaktidesai_002701264_05" -d "/opt/csye6225/bhaktidesai_002701264_05/"

# sudo chmod 655 "/opt/webapp"
# Change to the application directory
cd "/opt/csye6225/bhaktidesai_002701264_05"

# Install application dependencies
sudo npm install

# Set permissions
sudo chown -R csye6225:csye6225 .
sudo chmod -R 755 .

# Move systemd service unit file to the correct location
sudo mv "/opt/csye6225/bhaktidesai_002701264_05/autosys.service" "/etc/systemd/system/"
 
# Enable and start the systemd service
sudo systemctl enable autosys
sudo systemctl start autosys

# Clean up
sudo apt-get clean