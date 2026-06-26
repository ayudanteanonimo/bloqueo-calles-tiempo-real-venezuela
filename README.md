# Vías VE 🚫

Mapa en tiempo real de calles bloqueadas en Venezuela. La gente reporta bloqueos (policía, derrumbes, accidentes, inundaciones) y todos los ven al instante.

## Stack
- **Next.js 14** — frontend + API
- **Vercel KV** — base de datos (Redis)
- **SSE** — tiempo real sin WebSockets
- **Leaflet + CartoDB Dark** — mapa oscuro sin API key

---

## Deploy en 5 minutos

### 1. Sube a GitHub
```bash
git init
git add .
git commit -m "Vías VE"
git remote add origin https://github.com/TU_USUARIO/vias-ve.git
git push -u origin main
```

### 2. Deploy en Vercel
1. [vercel.com](https://vercel.com) → **Add New Project**
2. Importa el repo → **Deploy**

### 3. Activa Vercel KV
1. Proyecto en Vercel → pestaña **Storage**
2. **Create Database** → **KV** → nombre: `vias-kv`
3. **Connect to Project** → selecciona tu proyecto
4. Vercel añade las variables de entorno automáticamente

### 4. Redeploy
Vercel → **Deployments** → tres puntos → **Redeploy**

---

## Capacidad del plan gratuito

| Recurso | Límite | Uso estimado |
|---|---|---|
| Vercel requests/mes | 100,000 | ~3,000 usuarios activos |
| Bandwidth | 100 GB | ~2M visitas (app pesa ~40KB) |
| Vercel KV storage | 256 MB | ~50,000 reportes guardados |
| Vercel KV requests/día | 30,000 | ~700 usuarios simultáneos |
| SSE (tiempo real) | 25s/función | Reconecta automático |

**Usuarios simultáneos cómodos: 200-500**
**Con Cloudflare gratis por delante: 1,000-3,000**

## Desarrollo local
```bash
npm install
# Crea .env.local con tus credenciales de Vercel KV:
# KV_REST_API_URL=...
# KV_REST_API_TOKEN=...
npm run dev
```
