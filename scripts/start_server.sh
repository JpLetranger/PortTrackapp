# scripts/start_server.sh
#!/bin/bash
sudo systemctl start nginx
sudo systemctl enable nginx

# Wait for service to be ready
sleep 5

# Log deployment
echo "$(date): PortTrack deployment started" >> /var/log/porttrack-deploy.log