#!/bin/bash

# Download and install CloudWatch Agent
wget https://amazoncloudwatch-agent.s3.amazonaws.com/debian/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E amazon-cloudwatch-agent.deb

# Create the directory for CloudWatch Agent config
# sudo mkdir -p /opt/aws/amazon-cloudwatch-agent/etc/
 
# Configure the CloudWatch Agent
cat <<EOL | sudo tee /opt/csye6225/bhaktidesai_002701264_05/amazon-cloudwatch-agent.json
{
  "agent": {
    "metrics_collection_interval": 10,
    "logfile": "/var/logs/amazon-cloudwatch-agent.log"
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/opt/csye6225/bhaktidesai_002701264_05/var/log/csye6225.log", 
            "log_group_name": "csye6225",
            "log_stream_name": "webapp"
          }
        ]
      }
    },
    "log_stream_name": "cloudwatch_log_stream"
  },
  "metrics": {
    "metrics_collected": {
      "statsd": {
        "service_address": ":8125",
        "metrics_collection_interval": 15,
        "metrics_aggregation_interval": 60
      }
    }
  }
}
EOL

sudo chown csye6225:csye6225 /opt/csye6225/bhaktidesai_002701264_05/amazon-cloudwatch-agent.json