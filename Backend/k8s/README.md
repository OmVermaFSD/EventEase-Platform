# Kubernetes Deployment for EventEase Backend

This directory contains Kubernetes manifests for deploying the EventEase Backend system on any Kubernetes cluster (Minikube, EKS, GKE, AKS).

## Architecture

- **Backend**: 3 replicas with LoadBalancer service
- **PostgreSQL**: 1 replica with persistent storage
- **Redis**: 1 replica with persistent storage
- **Ingress**: External access with rate limiting

## Quick Start

### Minikube

```bash
# Start Minikube
minikube start

# Enable ingress addon
minikube addons enable ingress

# Deploy all resources
kubectl apply -f .

# Check deployment status
kubectl get pods,svc,pvc

# Get external IP
minikube service eventease-backend-service --url
```

### AWS EKS

```bash
# Update kubeconfig
aws eks update-kubeconfig --region <region> --name <cluster-name>

# Deploy
kubectl apply -f .

# Get LoadBalancer IP
kubectl get service eventease-backend-service
```

## Files

- `deployment.yaml`: Deployments for backend, PostgreSQL, and Redis
- `service.yaml`: Services, PVCs, and Ingress configuration

## Configuration

### Environment Variables

Backend containers are configured with:
- `SPRING_PROFILES_ACTIVE=production`
- `SPRING_DATASOURCE_URL=postgresql://postgres-service:5432/eventease`
- `SPRING_REDIS_HOST=redis-service`

### Resource Limits

- **Backend**: 256Mi-512Mi memory, 250m-500m CPU
- **PostgreSQL**: 256Mi-512Mi memory, 250m-500m CPU
- **Redis**: 128Mi-256Mi memory, 100m-200m CPU

### Storage

- **PostgreSQL**: 1Gi persistent volume
- **Redis**: 512Mi persistent volume

## Monitoring

### Health Checks

All pods include liveness and readiness probes:

```bash
# Check pod health
kubectl get pods
kubectl describe pod <pod-name>

# Check logs
kubectl logs -f deployment/eventease-backend
```

### Scaling

```bash
# Scale backend
kubectl scale deployment eventease-backend --replicas=5

# Scale database (read replicas)
kubectl scale deployment postgres --replicas=2
```

## Security

- **Network Policies**: Services communicate within cluster only
- **Secrets**: Use Kubernetes secrets for production passwords
- **Ingress TLS**: Configure SSL certificates for production

## Troubleshooting

### Common Issues

1. **Pods not starting**: Check resource limits and PVC status
2. **Database connection**: Verify service names and credentials
3. **Ingress not working**: Ensure ingress addon is enabled

### Debug Commands

```bash
# Check everything
kubectl get all

# Check events
kubectl get events --sort-by=.metadata.creationTimestamp

# Port forward for debugging
kubectl port-forward service/eventease-backend-service 8080:80
```

## Production Considerations

1. **Use Helm**: Package application as Helm chart
2. **Monitoring**: Add Prometheus and Grafana
3. **Logging**: Add ELK stack or similar
4. **Backup**: Configure database backups
5. **Security**: Implement RBAC and network policies
