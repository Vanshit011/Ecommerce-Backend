# Docker + Socket.IO Setup Guide

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Node.js 20+ (for local development)

### Running with Docker

1. **Start all services:**

   ```bash
   cd "d:\HP Data\solguruz\Ecommerce-Backend"
   docker-compose up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - Swagger Docs: http://localhost:3000/api

3. **Stop services:**
   ```bash
   docker-compose down
   ```

## 📦 What's Included

### Backend (NestJS)

- ✅ Socket.IO Gateway (`src/events/events.gateway.ts`)
- ✅ WebSocket support with CORS configured
- ✅ Example events: order status, cart updates, admin notifications
- ✅ Multi-stage Docker build
- ✅ PostgreSQL + Redis containers

### Frontend (React + Vite)

- ✅ Socket.IO client service (`src/services/socketService.js`)
- ✅ Example component (`src/components/SocketExample.jsx`)
- ✅ Nginx production server
- ✅ Environment variables for Docker networking

## 🔌 Socket.IO Events

### Backend Events (Listen)

- `orderStatusUpdate` - Update order status
- `cartUpdate` - Update cart data
- `adminNotification` - Send admin notifications

### Frontend Events (Emit)

- `orderStatusChanged` - Order status changed
- `cartUpdated` - Cart was updated
- `adminAlert` - Admin alert notification

## 🛠️ Development Setup

### Local Development (Without Docker)

**Backend:**

```bash
cd "d:\HP Data\solguruz\Ecommerce-Backend"
npm install
npm run start:dev
```

**Frontend:**

```bash
cd "d:\HP Data\solguruz\Ecommerce Frontend\ecommerce-frontend"
npm install
npm run dev
```

### Using Socket.IO in Your Components

```javascript
import { useEffect } from 'react';
import socketService from '../services/socketService';

function MyComponent() {
  useEffect(() => {
    // Connect to Socket.IO
    socketService.connect();

    // Listen for events
    socketService.on('orderStatusChanged', (data) => {
      console.log('Order updated:', data);
    });

    // Cleanup
    return () => socketService.disconnect();
  }, []);

  // Emit events
  const updateOrder = () => {
    socketService.updateOrderStatus('order-123', 'SHIPPED');
  };

  return <button onClick={updateOrder}>Update Order</button>;
}
```

## 🐳 Docker Architecture

```
┌─────────────────────────────────────────────┐
│           ecommerce-network (bridge)        │
│                                             │
│  ┌──────────────┐      ┌─────────────────┐ │
│  │   Frontend   │─────▶│   Backend API   │ │
│  │  (Nginx:80)  │      │   (Node:3000)   │ │
│  │              │◀─────│  Socket.IO ✓    │ │
│  └──────────────┘      └─────────────────┘ │
│                              │              │
│                    ┌─────────┴─────────┐    │
│                    │                   │    │
│              ┌─────▼─────┐      ┌─────▼────┐│
│              │ PostgreSQL │      │  Redis   ││
│              │   :5432    │      │  :6379   ││
│              └────────────┘      └──────────┘│
└─────────────────────────────────────────────┘
```

## 📝 Environment Variables

### Backend (.env.development)

- `PORT=3000`
- `REDIS_HOST=redis` (Docker) / `localhost` (local)
- `DB_HOST=postgres` (Docker) / `localhost` (local)

### Frontend

- **Local (.env):** `VITE_SOCKET_URL=http://localhost:3000`
- **Docker (.env.docker):** `VITE_SOCKET_URL=http://api:3000`

## 🔍 Troubleshooting

### Socket.IO not connecting?

1. Check browser console for connection errors
2. Verify CORS settings in `main.ts`
3. Ensure backend is running and accessible
4. Check Docker network: `docker network inspect ecommerce-backend_ecommerce-network`

### Docker build fails?

1. Clear Docker cache: `docker-compose build --no-cache`
2. Remove old containers: `docker-compose down -v`
3. Check Docker logs: `docker-compose logs -f`

### Frontend can't reach backend?

1. Verify services are on same network
2. Check environment variables in docker-compose.yml
3. Use service names (e.g., `http://api:3000`) not `localhost`

## 📚 Next Steps

1. **Install dependencies:**

   ```bash
   # Backend
   cd "d:\HP Data\solguruz\Ecommerce-Backend"
   npm install

   # Frontend
   cd "d:\HP Data\solguruz\Ecommerce Frontend\ecommerce-frontend"
   npm install
   ```

2. **Test Socket.IO locally:**
   - Start backend: `npm run start:dev`
   - Start frontend: `npm run dev`
   - Import `SocketExample` component in your App.jsx
   - Open browser console to see connection logs

3. **Test with Docker:**

   ```bash
   docker-compose up --build
   ```

4. **Customize events:**
   - Edit `src/events/events.gateway.ts` (backend)
   - Edit `src/services/socketService.js` (frontend)
   - Add your own event handlers and emitters

## 🎯 Example Use Cases

- **Real-time order tracking:** Update order status from admin panel
- **Live cart sync:** Sync cart across multiple devices
- **Admin notifications:** Alert admins of new orders/issues
- **Inventory updates:** Notify users when products are back in stock
- **Chat support:** Real-time customer support messaging
