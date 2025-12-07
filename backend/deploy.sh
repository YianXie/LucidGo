#!/bin/bash
set -euxo pipefail

echo "==== [deploy.sh] Starting deploy steps on EC2 ===="

# 1. Go to backend directory
cd /home/ubuntu/lucid-go/app/backend

# 2. Activate the virtual environment
source /home/ubuntu/lucid-go/app/env/bin/activate

# 3. Run the migrations
python manage.py migrate --no-input

# 4. Collect static files
python manage.py collectstatic --no-input

# 5. Restart services
echo "Restarting services"
sudo systemctl restart lucidgo-django.service
sudo systemctl restart lucidgo-fastapi.service

echo "Checking status of services"
sudo systemctl status lucidgo-django.service
sudo systemctl status lucidgo-fastapi.service

echo "==== [deploy.sh] Deploy completed ===="