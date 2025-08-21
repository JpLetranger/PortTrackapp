# 🚢 PortTrack

<div align="center">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge&logo=docker" alt="Status" />
  <img src="https://img.shields.io/badge/AWS-CodeDeploy-orange?style=for-the-badge&logo=amazon-aws" alt="AWS" />
  <img src="https://img.shields.io/badge/Deployment-Canary-blue?style=for-the-badge&logo=kubernetes" alt="Canary" />
  <img src="https://img.shields.io/badge/Monitoring-CloudWatch-red?style=for-the-badge&logo=amazon-cloudwatch" alt="CloudWatch" />
</div>

<div align="center">
  <h3>🎯 Plataforma Portuaria con Despliegue Continuo y Monitoreo Avanzado</h3>
  <p><strong>DevOps · CI/CD · Canary Deployment · Real-time Monitoring</strong></p>
</div>

---

## 📖 **Acerca del Proyecto**

**PortTrack** es una demostración de implementación DevOps para gestión portuaria, incluyendo despliegue continuo con estrategia Canary y monitoreo en tiempo real usando servicios nativos de AWS.

### ✨ **Características Principales**

- 🚀 **Despliegue Canary Automático** - Rollouts graduales con AWS CodeDeploy
- 📊 **Monitoreo CloudWatch** - Dashboards y alertas configurables
- 🤖 **ChatOps con Hubot** - Control desde Slack
- 🔄 **Auto-rollback** - Reversión automática basada en métricas
- 🐳 **Containerizado** - Nginx optimizado para CloudWatch

---

## 🏗️ **Arquitectura**

```mermaid
graph LR
    A[GitHub] --> B[AWS CodeBuild]
    B --> C[AWS CodeDeploy]
    C --> D[Canary 10%]
    D --> E[Canary 50%] 
    E --> F[Production 100%]
    
    G[CloudWatch] --> H[Slack Alerts]
    D --> G
    E --> G  
    F --> G
    
    I[Hubot ChatOps] --> C
    I --> G
```

<div align="center">
  <strong>Pipeline CI/CD con Monitoreo Integrado</strong>
</div>

---

## 🚀 **Quick Start**

### **Prerequisitos**

- AWS CLI configurado
- Docker (opcional, para desarrollo local)
- Node.js 16+ (para ChatOps)
- Slack Workspace con bot token

### **1. Configuración AWS**

```bash
# Crear aplicación CodeDeploy
aws deploy create-application --application-name PortTrack

# Crear grupo de despliegue
aws deploy create-deployment-group \
  --application-name PortTrack \
  --deployment-group-name PortTrack-Production \
  --deployment-config-name CodeDeploy.EC2LinuxCanary10Percent5Minutes

# Crear bucket S3 para artefactos
aws s3 mb s3://porttrack-deployments-$(date +%s)
```

### **2. Configurar CloudWatch**

```bash
# Crear log group
aws logs create-log-group --log-group-name /aws/ec2/porttrack

# Aplicar configuración de métricas
aws logs put-metric-filter \
  --log-group-name /aws/ec2/porttrack \
  --filter-name ErrorCount \
  --filter-pattern "ERROR" \
  --metric-transformations \
    metricName=ErrorCount,metricNamespace=PortTrack,metricValue=1
```

### **3. Despliegue Local (Desarrollo)**

```bash
# Clonar repositorio
git clone https://github.com/JpLetranger/PortTrackapp.git
cd PortTrackapp

# Ejecutar con Docker
docker build -t porttrack .
docker run -p 8080:80 porttrack

# O servir directamente con nginx local
nginx -c $(pwd)/nginx.conf -p $(pwd)
```

### **4. ChatOps Setup**

```bash
# Instalar dependencias del bot
npm install

# Configurar variables de entorno
export HUBOT_SLACK_TOKEN=xoxb-your-bot-token
export HUBOT_AWS_ACCESS_KEY_ID=your-access-key
export HUBOT_AWS_SECRET_ACCESS_KEY=your-secret-key

# Iniciar bot
npm start
```

---

## 🤖 **Comandos ChatOps**

<table>
  <tr>
    <th width="250px">Comando</th>
    <th width="300px">Descripción</th>
    <th>Ejemplo</th>
  </tr>
  <tr>
    <td><code>@hubot deploy porttrack</code></td>
    <td>Inicia despliegue canary</td>
    <td><code>@hubot deploy porttrack canary</code></td>
  </tr>
  <tr>
    <td><code>@hubot promote porttrack</code></td>
    <td>Promociona canary deployment</td>
    <td><code>@hubot promote porttrack to 50%</code></td>
  </tr>
  <tr>
    <td><code>@hubot status porttrack</code></td>
    <td>Estado actual del sistema</td>
    <td><code>@hubot status porttrack --verbose</code></td>
  </tr>
  <tr>
    <td><code>@hubot rollback porttrack</code></td>
    <td>Rollback a versión anterior</td>
    <td><code>@hubot rollback porttrack now</code></td>
  </tr>
  <tr>
    <td><code>@hubot health check</code></td>
    <td>Verificación de salud</td>
    <td><code>@hubot health check all</code></td>
  </tr>
  <tr>
    <td><code>@hubot metrics last 1h</code></td>
    <td>Métricas recientes</td>
    <td><code>@hubot metrics porttrack errors</code></td>
  </tr>
</table>

---

## 📊 **Monitoreo y Métricas**

### **KPIs Principales**
- ⚡ **Response Time**: < 2 segundos
- 🎯 **Uptime**: > 99.9% 
- 🚨 **Error Rate**: < 1%
- 📈 **Throughput**: 1000+ requests/min

### **Dashboards CloudWatch**

<details>
<summary><strong>📊 Operations Dashboard</strong></summary>

- **Request Metrics**: Count, response time, status codes
- **Error Tracking**: 4xx/5xx rates con trending
- **Infrastructure Health**: CPU, memory, network I/O
- **Deployment Status**: Canary progression y health checks

</details>

<details>
<summary><strong>💼 Business Metrics</strong></summary>

- **Barcos Procesados**: 15-25 por día target
- **Operaciones Completadas**: Success rate > 95%
- **Tiempo de Procesamiento**: < 45 minutos promedio
- **Utilización del Sistema**: Efficiency tracking

</details>

---

## 🚨 **Sistema de Alertas**

<div align="center">

| 🔔 **Alerta** | ⚠️ **Threshold** | 🎯 **Acción** | 📱 **Canal** |
|---------------|------------------|---------------|-------------|
| High Error Rate | > 5% en 5min | Auto-rollback | #alerts-critical |
| High Latency | > 3s promedio | Scale notification | #alerts-warning |
| Service Down | Health check fail | Immediate alert | #alerts-critical |
| Low Throughput | < 100 req/min | Investigation trigger | #alerts-info |

</div>

---

## 🔄 **Flujo de Despliegue**

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GH as GitHub
    participant CB as CodeBuild  
    participant CD as CodeDeploy
    participant CW as CloudWatch
    participant SL as Slack

    Dev->>GH: git push
    GH->>CB: Trigger build
    CB->>CB: Run buildspec.yml
    CB->>CD: Deploy with appspec.yml
    CD->>CD: Canary 10%
    CD->>CW: Health metrics
    CW->>SL: Status update
    
    alt Metrics OK
        CD->>CD: Promote to 50%
        CD->>CD: Final deployment
        CW->>SL: Success notification
    else Metrics Failed
        CD->>CD: Auto-rollback
        CW->>SL: Failure alert
    end
```

---

## 📁 **Estructura del Proyecto**

```
PortTrackapp/
├── 📄 index.html                    # Aplicación web principal
├── ⚙️ appspec.yml                   # Configuración AWS CodeDeploy
├── 🏗️ buildspec.yml                # Especificación CodeBuild
├── ☁️ cloudwatch-config.json       # Configuración CloudWatch
├── 📂 scripts/                      # Scripts de deployment
│   ├── 🚀 start_server.sh          # Inicio de servicios
│   ├── ⏹️ stop_server.sh            # Parada controlada  
│   └── ✅ validate_service.sh       # Validación health checks
├── 📂 chatops/                      # ChatOps con Hubot
│   └── 🤖 porttrack-chatops.js     # Bot principal
├── 📂 docker/                       # Containerización
│   ├── 🐳 Dockerfile               # Container definition
│   ├── ⚙️ nginx.conf               # Nginx config optimizado
│   ├── 📦 package.json             # Dependencias Node.js
│   └── 🔧 external-scripts.json    # Scripts externos Hubot
└── 📖 README.md                     # Este archivo
```

---

## 🛠️ **Tecnologías**

<div align="center">

| **Componente** | **Tecnología** | **Propósito** |
|----------------|----------------|---------------|
| 🚀 **CI/CD** | AWS CodeBuild + CodeDeploy | Pipeline automatizado |
| 📊 **Monitoring** | AWS CloudWatch | Métricas y alertas |
| 🤖 **ChatOps** | Hubot + Slack | Automatización conversacional |
| 🐳 **Runtime** | Nginx + Docker | Web server optimizado |
| 📈 **Deployment** | Canary Strategy | Despliegues graduales seguros |

</div>

---

## 🎯 **Archivos Clave**

<details>
<summary><strong>📄 appspec.yml - Configuración CodeDeploy</strong></summary>

Define el proceso de deployment incluyendo hooks para:
- Pre-deployment validation
- Service stop/start procedures  
- Post-deployment health checks
- Rollback triggers basados en métricas

</details>

<details>
<summary><strong>🏗️ buildspec.yml - Pipeline de Build</strong></summary>

Especifica las fases de build:
- Environment setup y dependencias
- Testing y validación de código
- Artifact generation y packaging
- CloudWatch metrics publishing

</details>

<details>
<summary><strong>🤖 porttrack-chatops.js - Bot de Slack</strong></summary>

Implementa comandos para:
- Deployment management y control
- Real-time status monitoring
- Metric querying y alerting
- Emergency rollback procedures

</details>

<details>
<summary><strong>☁️ cloudwatch-config.json - Monitoreo</strong></summary>

Configuración de:
- Custom metrics y dashboards
- Alertas automáticas con thresholds
- Log aggregation y parsing
- Business KPI tracking

</details>

---

## 🚀 **Deployment Commands**

```bash
# Build y deploy manual
aws codebuild start-build --project-name PortTrack-Build

# Deploy directo con CodeDeploy
aws deploy create-deployment \
  --application-name PortTrack \
  --deployment-group-name PortTrack-Production \
  --deployment-config-name CodeDeploy.EC2LinuxCanary10Percent5Minutes \
  --github-location repository=JpLetranger/PortTrackapp,commitId=$(git rev-parse HEAD)

# Monitorear deployment
aws deploy get-deployment --deployment-id d-XXXXXXXXX

# Health check manual
curl http://your-app-url/health
```

---

## 📈 **Métricas Personalizadas**

El proyecto incluye métricas específicas para operaciones portuarias:

- **Barcos por Hora**: Throughput de procesamiento
- **Tiempo de Muelle**: Duración promedio de operaciones
- **Eficiencia de Carga**: Porcentaje de operaciones exitosas
- **Alertas de Negocio**: KPIs críticos para el puerto

---

## 👥 **Contributing**

1. Fork el proyecto
2. Crear feature branch (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push al branch (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

### **Estándares**
- Seguir [Conventional Commits](https://www.conventionalcommits.org/)
- Actualizar tests y documentación
- Validar métricas de CloudWatch

---

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para detalles.

---

## 🤝 **Soporte**

<div align="center">

**¿Necesitas ayuda?**

[![GitHub Issues](https://img.shields.io/badge/GitHub-Issues-red?style=for-the-badge&logo=github)](https://github.com/JpLetranger/PortTrackapp/issues)
[![Slack](https://img.shields.io/badge/Slack-ChatOps-blue?style=for-the-badge&logo=slack)](#chatops-setup)

</div>

---

<div align="center">
  <p><strong>Demostración DevOps CI/CD con monitoreo continuo</strong></p>
  <p><sub>PortTrack © 2025 - DevOps Demo Project - Talento Digital para Chile - Adalid</sub></p>
</div>