#!/bin/bash

# Download script for IP2Location and IP2Proxy databases
# This script downloads the LITE databases from https://lite.ip2location.com/
# and extracts them to the data/ directory.

# Configuration
TOKEN=""
DATA_DIR="data"
LOCATION_DB="IP2LOCATION-LITE-DB11.CSV"
PROXY_DB="IP2PROXY-LITE-PX12.CSV"

# Create data directory if it doesn't exist
mkdir -p "$DATA_DIR"

echo "Downloading IP2Location database..."
curl -o "$DATA_DIR/$LOCATION_DB.zip" "https://www.ip2location.com/download/?token=$TOKEN&file=$LOCATION_DB"

echo "Extracting IP2Location database..."
unzip -o "$DATA_DIR/$LOCATION_DB.zip" -d "$DATA_DIR"
rm "$DATA_DIR/$LOCATION_DB.zip"

echo "Downloading IP2Proxy database..."
curl -o "$DATA_DIR/$PROXY_DB.zip" "https://www.ip2location.com/download/?token=$TOKEN&file=$PROXY_DB"

echo "Extracting IP2Proxy database..."
unzip -o "$DATA_DIR/$PROXY_DB.zip" -d "$DATA_DIR"
rm "$DATA_DIR/$PROXY_DB.zip"

echo "Database download and extraction completed!"
echo "Files placed in:"
echo "  - $DATA_DIR/$LOCATION_DB/"
echo "  - $DATA_DIR/$PROXY_DB/"