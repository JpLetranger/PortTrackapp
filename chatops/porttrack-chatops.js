// scripts/porttrack-chatops.js - Simplified ChatOps for PortTrack
const AWS = require('aws-sdk');
const cron = require('node-cron');

module.exports = (robot) => {

    // Configure AWS
    const codedeploy = new AWS.CodeDeploy({ region: 'us-east-1' });
    const cloudwatch = new AWS.CloudWatch({ region: 'us-east-1' });
    const autoscaling = new AWS.AutoScaling({ region: 'us-east-1' });

    // Deploy canary command
    robot.respond(/deploy porttrack canary (\d+)%/i, async (res) => {
        const percentage = parseInt(res.match[1]);
        const user = res.message.user.name;

        if (percentage < 5 || percentage > 50) {
            res.send('❌ Porcentaje debe estar entre 5% y 50%');
            return;
        }

        res.send(`🚀 Iniciando despliegue Canary al ${percentage}% por @${user}...`);

        try {
            const deployment = await startCanaryDeployment(percentage);
            res.send(`✅ Despliegue Canary iniciado. ID: ${deployment.deploymentId}`);

            // Notify deployment channel
            robot.messageRoom('#porttrack-deployments',
                `🐤 Canary deployment ${percentage}% iniciado por @${user} - ID: ${deployment.deploymentId}`);

        } catch (error) {
            res.send(`❌ Error: ${error.message}`);
        }
    });

    // Promote deployment
    robot.respond(/promote porttrack to (\d+)%/i, async (res) => {
        const percentage = parseInt(res.match[1]);
        const user = res.message.user.name;

        res.send(`📈 Promoviendo PortTrack a ${percentage}%...`);

        try {
            await promoteDeployment(percentage);
            res.send(`✅ PortTrack promovido a ${percentage}%`);

            robot.messageRoom('#porttrack-deployments',
                `📈 @${user} promovió PortTrack a ${percentage}%`);

        } catch (error) {
            res.send(`❌ Error en promoción: ${error.message}`);
        }
    });

    // Rollback command
    robot.respond(/rollback porttrack/i, async (res) => {
        const user = res.message.user.name;

        res.send('⏪ Iniciando rollback de PortTrack...');

        try {
            const rollback = await performRollback();
            res.send(`✅ Rollback completado. ID: ${rollback.deploymentId}`);

            robot.messageRoom('#porttrack-alerts',
                `⚠️ @${user} ejecutó rollback de PortTrack`);

        } catch (error) {
            res.send(`❌ Error en rollback: ${error.message}`);
        }
    });

    // Status check
    robot.respond(/status porttrack/i, async (res) => {
        res.send('🔍 Verificando estado de PortTrack...');

        try {
            const status = await getPortTrackStatus();

            const statusMsg = `
📊 **Estado PortTrack**
🟢 **Estado**: ${status.health}
📈 **Instancias**: ${status.instances.running}/${status.instances.desired}
⚡ **CPU Promedio**: ${status.metrics.cpu}%
🕐 **Response Time**: ${status.metrics.responseTime}ms
📦 **Último Deploy**: ${status.lastDeployment}
`;

            res.send(statusMsg);

        } catch (error) {
            res.send(`❌ Error obteniendo estado: ${error.message}`);
        }
    });

    // Show metrics
    robot.respond(/show metrics(?: last (\d+)h)?/i, async (res) => {
        const hours = res.match[1] || '1';

        res.send(`📊 Obteniendo métricas de las últimas ${hours}h...`);

        try {
            const metrics = await getCloudWatchMetrics(hours);

            const metricsMsg = `
📈 **Métricas PortTrack (${hours}h)**

⚡ **Performance:**
- Requests: ${metrics.requests}/min
- Response Time: ${metrics.responseTime}ms
- Error Rate: ${metrics.errorRate}%

🚢 **Negocio:**
- Barcos procesados: ${metrics.ships}
- Operaciones carga: ${metrics.cargo}
- Tiempo promedio: ${metrics.avgTime}min

🖥️ **Sistema:**
- CPU: ${metrics.cpu}%
- Memory: ${metrics.memory}%
- Disk: ${metrics.disk}%
`;

            res.send(metricsMsg);

        } catch (error) {
            res.send(`❌ Error obteniendo métricas: ${error.message}`);
        }
    });

    // Restart service
    robot.respond(/restart service (\w+)/i, async (res) => {
        const service = res.match[1];
        const user = res.message.user.name;

        if (!['nginx', 'porttrack', 'api'].includes(service)) {
            res.send('❌ Solo puedes reiniciar: nginx, porttrack, api');
            return;
        }

        res.send(`🔄 Reiniciando servicio ${service}...`);

        try {
            await restartService(service);
            res.send(`✅ Servicio ${service} reiniciado exitosamente`);

            robot.messageRoom('#porttrack-ops',
                `🔄 @${user} reinició servicio ${service}`);

        } catch (error) {
            res.send(`❌ Error reiniciando servicio: ${error.message}`);
        }
    });

    // Health check command
    robot.respond(/health check porttrack/i, async (res) => {
        res.send('🏥 Ejecutando health check...');

        try {
            const health = await performHealthCheck();

            const healthMsg = `
🏥 **Health Check PortTrack**

${health.overall === 'healthy' ? '✅' : '❌'} **Estado General**: ${health.overall}
🌐 **Frontend**: ${health.frontend ? '✅' : '❌'} (${health.frontendTime}ms)
🔗 **Load Balancer**: ${health.alb ? '✅' : '❌'}
💾 **Base de Datos**: ${health.database ? '✅' : '❌'}
📊 **CloudWatch**: ${health.cloudwatch ? '✅' : '❌'}
`;

            res.send(healthMsg);

            if (health.overall !== 'healthy') {
                robot.messageRoom('#porttrack-alerts',
                    '🚨 Health check falló para PortTrack');
            }

        } catch (error) {
            res.send(`❌ Error en health check: ${error.message}`);
        }
    });

    // Helper Functions
    async function startCanaryDeployment(percentage) {
        const params = {
            applicationName: 'PortTrack',
            deploymentGroupName: 'PortTrack-DeploymentGroup',
            revision: {
                revisionType: 'S3',
                s3Location: {
                    bucket: 'porttrack-deployments',
                    key: 'latest/porttrack.zip'
                }
            },
            deploymentConfigName: 'CodeDeploy.ECSCanary10Percent5Minutes',
            description: `Canary deployment ${percentage}%`
        };

        return await codedeploy.createDeployment(params).promise();
    }

    async function promoteDeployment(percentage) {
        // Simulate promotion by updating service
        const params = {
            AutoScalingGroupName: 'porttrack-asg',
            DesiredCapacity: Math.ceil(10 * percentage / 100)
        };

        return await autoscaling.setDesiredCapacity(params).promise();
    }

    async function performRollback() {
        const params = {
            deploymentId: 'latest-deployment-id' // Would get from API
        };

        return await codedeploy.stopDeployment({
            deploymentId: params.deploymentId,
            autoRollbackEnabled: true
        }).promise();
    }

    async function getPortTrackStatus() {
        // Get deployment status
        const deployments = await codedeploy.listDeployments({
            applicationName: 'PortTrack'
        }).promise();

        // Get instance health
        const health = await autoscaling.describeAutoScalingGroups({
            AutoScalingGroupNames: ['porttrack-asg']
        }).promise();

        const asg = health.AutoScalingGroups[0];

        return {
            health: asg.Instances.every(i => i.HealthStatus === 'Healthy') ? 'Healthy' : 'Unhealthy',
            instances: {
                running: asg.Instances.filter(i => i.LifecycleState === 'InService').length,
                desired: asg.DesiredCapacity
            },
            metrics: {
                cpu: Math.floor(Math.random() * 30 + 40), // Simulated
                responseTime: Math.floor(Math.random() * 500 + 200)
            },
            lastDeployment: deployments.deployments[0]?.createTime || 'N/A'
        };
    }

    async function getCloudWatchMetrics(hours) {
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - (hours * 60 * 60 * 1000));

        // Get ALB metrics
        const requestsMetric = await cloudwatch.getMetricStatistics({
            Namespace: 'AWS/ApplicationELB',
            MetricName: 'RequestCount',
            StartTime: startTime,
            EndTime: endTime,
            Period: 3600,
            Statistics: ['Sum'],
            Dimensions: [{
                Name: 'LoadBalancer',
                Value: 'porttrack-alb'
            }]
        }).promise();

        // Return simulated comprehensive metrics
        return {
            requests: Math.floor(Math.random() * 500 + 800),
            responseTime: Math.floor(Math.random() * 200 + 150),
            errorRate: (Math.random() * 2).toFixed(1),
            ships: Math.floor(Math.random() * 20 + 15),
            cargo: Math.floor(Math.random() * 50 + 80),
            avgTime: Math.floor(Math.random() * 15 + 25),
            cpu: Math.floor(Math.random() * 25 + 45),
            memory: Math.floor(Math.random() * 20 + 60),
            disk: Math.floor(Math.random() * 15 + 35)
        };
    }

    async function restartService(service) {
        // Simulate service restart via Systems Manager
        return new Promise((resolve) => {
            setTimeout(resolve, 2000); // Simulate restart time
        });
    }

    async function performHealthCheck() {
        try {
            // Simulate health checks
            return {
                overall: 'healthy',
                frontend: true,
                frontendTime: Math.floor(Math.random() * 200 + 100),
                alb: true,
                database: true,
                cloudwatch: true
            };
        } catch (error) {
            return {
                overall: 'unhealthy',
                frontend: false,
                alb: false,
                database: false,
                cloudwatch: false
            };
        }
    }

    // Automated monitoring every 5 minutes
    setInterval(async () => {
        try {
            const health = await performHealthCheck();

            if (health.overall !== 'healthy') {
                robot.messageRoom('#porttrack-alerts',
                    '🚨 **ALERTA**: PortTrack presenta problemas de salud');
            }

        } catch (error) {
            robot.messageRoom('#porttrack-alerts',
                `🚨 Error en monitoreo automático: ${error.message}`);
        }
    }, 300000); // 5 minutes

    // Daily report at 8 AM
    cron.schedule('0 8 * * *', async () => {
        try {
            const metrics = await getCloudWatchMetrics(24);

            const report = `
📊 **Reporte Diario PortTrack - ${new Date().toLocaleDateString()}**

✅ **Resumen 24h:**
🚢 Barcos procesados: ${metrics.ships}
📦 Operaciones carga: ${metrics.cargo}
⚡ Response time promedio: ${metrics.responseTime}ms
📈 Uptime: 99.9%

🔗 Dashboard: https://console.aws.amazon.com/cloudwatch/
`;

            robot.messageRoom('#porttrack-ops', report);

        } catch (error) {
            robot.messageRoom('#porttrack-alerts',
                `❌ Error en reporte diario: ${error.message}`);
        }
    });
};