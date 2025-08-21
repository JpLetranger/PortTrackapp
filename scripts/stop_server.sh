# scripts/stop_server.sh
#!/bin/bash
sudo systemctl stop nginx
echo "$(date): PortTrack service stopped" >> /var/log/porttrack-deploy.log