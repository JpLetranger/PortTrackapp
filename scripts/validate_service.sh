# scripts/validate_service.sh
#!/bin/bash
# Health check validation
HEALTH_CHECK=$(curl -f http://localhost/health 2>/dev/null)

if [ $? -eq 0 ]; then
    echo "$(date): PortTrack health check passed" >> /var/log/porttrack-deploy.log
    exit 0
else
    echo "$(date): PortTrack health check failed" >> /var/log/porttrack-deploy.log
    exit 1
fi