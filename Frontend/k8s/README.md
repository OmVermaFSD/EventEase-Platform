# EventEase Kubernetes Deployment

This directory contains Kubernetes manifests for deploying EventEase Frontend in a production-ready environment.

## 📁 Files Overview

### `namespace.yaml`
- **Namespace**: `eventease` - Isolated environment for EventEase services
- **Resource Quota**: CPU and memory limits for cost control
- **Network Policy**: Secure network segmentation and traffic rules

### `deployment.yaml`
- **Replicas**: 2 pods for load balancing and high availability
- **Image**: `eventease-frontend:latest`
- **Resources**: Optimized resource requests and limits
- **Health Checks**: Liveness and readiness probes
- **Security**: Non-root user, read-only filesystem, capabilities dropped
- **Anti-affinity**: Pods spread across different nodes

### `service.yaml`
- **LoadBalancer**: External access via cloud provider load balancer
- **Headless Service**: For internal cluster communication
- **Health Checks**: Integrated with deployment probes
- **SSL/TLS**: HTTPS support with certificate management

## 🚀 Deployment Commands

### Prerequisites
```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Verify cluster access
kubectl cluster-info
```

### Deploy EventEase
```bash
# Create namespace and policies
kubectl apply -f namespace.yaml

# Deploy frontend application
kubectl apply -f deployment.yaml

# Create services for external access
kubectl apply -f service.yaml

# Verify deployment
kubectl get all -n eventease
```

### Monitor Deployment
```bash
# Check pod status
kubectl get pods -n eventease -w

# View logs
kubectl logs -f deployment/eventease-frontend -n eventease

# Check service endpoints
kubectl get endpoints -n eventease

# Get external IP
kubectl get service eventease-frontend-service -n eventease
```

## 🔧 Configuration

### Environment Variables
- `NODE_ENV`: Set to "production"
- `REACT_APP_API_URL`: Backend API endpoint
- `REACT_APP_ENV`: Deployment environment identifier

### Resource Allocation
- **Requests**: 64Mi memory, 50m CPU
- **Limits**: 128Mi memory, 100m CPU
- **Scalable**: Adjust replicas based on traffic

### Health Checks
- **Liveness Probe**: `/health` endpoint, 30s initial delay
- **Readiness Probe**: `/health` endpoint, 5s initial delay
- **Timeout**: 5 seconds for both probes

## 🔒 Security Features

### Pod Security
- **Non-root User**: Runs as user ID 101
- **Read-only Filesystem**: Prevents unauthorized modifications
- **Capabilities**: All Linux capabilities dropped
- **Seccomp**: Default secure profile

### Network Security
- **Network Policy**: Only allows necessary traffic
- **Ingress**: HTTP/HTTPS from authorized namespaces
- **Egress**: DNS, HTTPS, and internal cluster traffic

### Image Security
- **Non-root Base**: Alpine Linux minimal image
- **Vulnerability Scanning**: Integrated in CI/CD pipeline
- **Image Signing**: Verified image integrity

## 📊 Monitoring & Observability

### Metrics
- **Prometheus**: Metrics collection enabled
- **Custom Metrics**: Application-specific metrics
- **Resource Usage**: CPU, memory, network

### Logging
- **Structured Logs**: JSON format for easy parsing
- **Correlation IDs**: Request tracing across services
- **Log Aggregation**: Centralized log collection

### Health Monitoring
- **Probes**: Automatic health checking
- **Auto-restart**: Failed pod recovery
- **Rolling Updates**: Zero-downtime deployments

## 🚀 Scaling & Performance

### Horizontal Scaling
```bash
# Scale to 5 replicas
kubectl scale deployment eventease-frontend --replicas=5 -n eventease

# Enable auto-scaling
kubectl autoscale deployment eventease-frontend --min=2 --max=10 --cpu-percent=70 -n eventease
```

### Vertical Scaling
```bash
# Update resource limits
kubectl patch deployment eventease-frontend -n eventease -p '{"spec":{"template":{"spec":{"containers":[{"name":"eventease-frontend","resources":{"limits":{"memory":"256Mi","cpu":"200m"}}}]}}}'
```

### Load Balancing
- **Round Robin**: Default load distribution
- **Session Affinity**: Disabled for scalability
- **Health Checks**: Automatic failover

## 🔧 Troubleshooting

### Common Issues
```bash
# Pod not starting
kubectl describe pod <pod-name> -n eventease

# Service not accessible
kubectl get service eventease-frontend-service -n eventease -o yaml

# Resource limits exceeded
kubectl top pods -n eventease
kubectl describe namespace eventease
```

### Debug Commands
```bash
# Access pod shell
kubectl exec -it <pod-name> -n eventease -- sh

# Port forward for local testing
kubectl port-forward service/eventease-frontend-service 8080:80 -n eventease

# Check events
kubectl get events -n eventease --sort-by=.metadata.creationTimestamp
```

### Log Analysis
```bash
# Recent logs
kubectl logs --tail=100 deployment/eventease-frontend -n eventease

# Previous pod logs
kubectl logs --previous deployment/eventease-frontend -n eventease

# Filter logs
kubectl logs deployment/eventease-frontend -n eventease | grep ERROR
```

## 🔄 Updates & Maintenance

### Rolling Updates
```bash
# Update image
kubectl set image deployment/eventease-frontend eventease-frontend=eventease-frontend:v2.0.0 -n eventease

# Check update status
kubectl rollout status deployment/eventease-frontend -n eventease

# Rollback if needed
kubectl rollout undo deployment/eventease-frontend -n eventease
```

### Blue-Green Deployment
```bash
# Create new deployment
kubectl apply -f deployment-green.yaml

# Switch traffic
kubectl patch service eventease-frontend-service -n eventease -p '{"spec":{"selector":{"version":"green"}}}'
```

## 🌐 Cloud Provider Integration

### AWS EKS
```bash
# Install AWS Load Balancer Controller
kubectl apply -f https://github.com/kubernetes-sigs/aws-load-balancer-controller/releases/download/v2.5.4/v2.5.4-full.yaml

# Annotate service for ALB
kubectl annotate service eventease-frontend-service service.beta.kubernetes.io/aws-load-balancer-type=nlb -n eventease
```

### Google GKE
```bash
# Enable Cloud Armor
kubectl annotate service eventease-frontend-service cloud.google.com/neg='"ingress":true' -n eventease

# Configure IAP
kubectl annotate service eventease-frontend-service cloud.google.com/backend-config='{"ports":{"80":{"iap":{"enabled":true}}}' -n eventease
```

### Azure AKS
```bash
# Enable Application Gateway
kubectl annotate service eventease-frontend-service service.beta.kubernetes.io/azure-load-balancer-internal=false -n eventease

# Configure WAF
kubectl annotate service eventease-frontend-service service.beta.kubernetes.io/azure-load-balancer-internal=false -n eventease
```

This Kubernetes configuration provides a production-ready, secure, and scalable deployment for the EventEase Frontend application.
