# EventEase Flash Sale Terminal - Compact Version

## 🎯 Mission Complete

Minimal, streamlined React frontend with simplified file structure for EventEase Flash Sale Terminal.

## 📁 Generated Files (Compact Structure)

### **Core Configuration**
- **`package-compact.json`** - Minimal dependencies: React, Vite, Axios
- **`vite-compact.config.js`** - Basic Vite setup with API proxy

### **Source Code (All in `src/`)**
- **`src/api.js`** - Smart network layer with 429/409 interceptors
- **`src/Dashboard.jsx`** - Mission Control UI with seat grid and latency graph
- **`src/App-compact.jsx`** - Simple app wrapper

### **DevOps**
- **`Dockerfile-compact`** - Multi-stage build (Node.js → Nginx)
- **`k8s/service-compact.yaml`** - LoadBalancer service

## 🚀 Key Features Implemented

### **Smart Network Layer (`src/api.js`)**
```javascript
// Reactive system overload state
let isSystemOverloaded = false;

// 429 Error Handler
if (status === 429) {
  isSystemOverloaded = true;
  setTimeout(() => isSystemOverloaded = false, 5000);
}

// 409 Error Handler
if (status === 409) {
  return Promise.reject(new Error('Seat taken!'));
}
```

### **Mission Control UI (`src/Dashboard.jsx`)**
```javascript
// 10x10 Seat Grid
<div className="grid grid-cols-10 gap-1">
  {seats.map((seat) => (
    <button
      onClick={() => handleSeatClick(seat)}
      style={{ backgroundColor: getSeatColor(seat.status) }}
    >
      {seat.id}
    </button>
  ))}
</div>

// Real-Time Latency Graph (SVG)
<svg width={300} height={100}>
  {latencyHistory.map((latency, i) => (
    <rect
      key={i}
      x={i * barWidth}
      y={height - (latency / maxLatency) * height}
      fill="#00ff41"
    />
  ))}
</svg>

// Admin Mode Toggle
<button onClick={() => setIsAdminMode(!isAdminMode)}>
  {isAdminMode ? 'USER MODE' : 'ADMIN MODE'}
</button>
```

## 🎨 Terminal Aesthetic

- **Dark Background**: `#000000` with green terminal colors
- **Monospace Font**: Terminal-style font family
- **Neon Green**: `#00ff41` for primary elements
- **Status Colors**: Green (Available), Orange (Locked), Red (Sold)

## 🔄 Real-time Features

### **Seat Map Polling**
```javascript
// Polls /api/seats every 1 second
useEffect(() => {
  const pollSeats = async () => {
    const response = await api.get('/seats');
    setSeats(response.data);
  };
  
  const interval = setInterval(pollSeats, 1000);
  return () => clearInterval(interval);
}, []);
```

### **Latency Monitoring**
```javascript
// Polls system status every 2 seconds
useEffect(() => {
  const pollSystem = async () => {
    const response = await api.get('/system/status');
    setLatencyHistory(prev => [...prev.slice(-19), response.data.latency]);
  };
  
  const interval = setInterval(pollSystem, 2000);
  return () => clearInterval(interval);
}, []);
```

## 🐳 Compact Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## ☸️ Kubernetes Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: eventease-frontend-service
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: eventease-frontend
```

## 🚀 Quick Start

```bash
# Use compact configuration files
cp package-compact.json package.json
cp vite-compact.config.js vite.config.js
cp src/App-compact.jsx src/App.jsx

# Install and run
npm install
npm run dev

# Build and deploy
npm run build
docker build -f Dockerfile-compact -t eventease-frontend .
kubectl apply -f k8s/service-compact.yaml
```

## 📊 Expected API Endpoints

```
GET  /api/seats              - Returns array of 100 seats with status
GET  /api/system/status       - Returns system status and latency
POST /api/seats/{id}/lock    - Locks a specific seat
```

## 🎯 Minimal Architecture Benefits

- **Simplified Structure**: All logic in 2 main files
- **No Complex Nesting**: Flat `src/` directory
- **Focused Components**: Dashboard handles UI, api.js handles logic
- **Easy Deployment**: Minimal Docker and K8s configs
- **Fast Development**: Quick setup and iteration

## 🔧 Error Handling

### **System Overload (429)**
- Sets `isSystemOverloaded = true`
- Auto-resets after 5 seconds
- Disables seat interactions during overload

### **Seat Conflict (409)**
- Returns specific error message: "Seat taken!"
- Shows alert to user
- Prevents duplicate seat locking

## 📱 Responsive Design

- **Mobile-First**: Grid adapts to screen size
- **Touch-Friendly**: Large tap targets on seat buttons
- **Flexible Layout**: Admin panel adapts to viewport

This compact version delivers all core functionality with minimal complexity, perfect for rapid development and deployment.
