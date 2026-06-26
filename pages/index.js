import { useEffect, useRef, useState, useCallback } from 'react'
import Head from 'next/head'

const BLOCK_TYPES = {
  policia:    { label: 'Policía / Militar', icon: '🚔', color: '#3b82f6', desc: 'Punto de control, no dejan pasar' },
  derrumbe:   { label: 'Derrumbe',          icon: '🪨', color: '#ef4444', desc: 'Escombros o deslizamiento en vía' },
  accidente:  { label: 'Accidente',         icon: '🚗', color: '#f97316', desc: 'Accidente de tráfico, vía cortada' },
  inundacion: { label: 'Inundación',        icon: '🌊', color: '#06b6d4', desc: 'Vía bajo agua, no transitable' },
  protesta:   { label: 'Protesta / Cierre', icon: '🚧', color: '#a855f7', desc: 'Cierre por manifestación u otro' },
  otro:       { label: 'Otro bloqueo',      icon: '⛔', color: '#f59e0b', desc: 'Otro tipo de bloqueo' },
}

function elapsed(ts) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60)   return 'hace ' + s + 's'
  if (s < 3600) return 'hace ' + Math.floor(s / 60) + 'min'
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60)
  return 'hace ' + h + 'h' + (m ? ' ' + m + 'min' : '')
}
function fmt(ts) {
  const d = new Date(ts)
  return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0')
}

// ── BLOCK CARD ────────────────────────────────────────────
function BlockCard({ b, onFocus, onResolve }) {
  const [timer, setTimer] = useState(() => elapsed(b.ts))
  useEffect(() => {
    const t = setInterval(() => setTimer(elapsed(b.ts)), 20000)
    return () => clearInterval(t)
  }, [b.ts])
  const cfg = BLOCK_TYPES[b.type]
  return (
    <div onClick={() => onFocus(b)} style={{
      background:'#141414', border:'1px solid #2a2a2a',
      borderLeft:`3px solid ${cfg.color}`,
      borderRadius:9, padding:13, marginBottom:8,
      cursor:'pointer', animation:'fadeUp .25s ease',
    }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:5, gap:8 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <span style={{ fontSize:'1.1rem' }}>{cfg.icon}</span>
          <span style={{ fontWeight:600, fontSize:'.87rem' }}>{cfg.label}</span>
        </div>
        <span style={{ fontSize:'.63rem', fontFamily:'monospace', color:'#555', flexShrink:0 }}>{fmt(b.ts)}</span>
      </div>
      {b.via && <div style={{ fontSize:'.72rem', color:'#888', marginBottom:4 }}>🛣️ {b.via}</div>}
      <div style={{ fontSize:'.8rem', lineHeight:1.5, color:'#bbb', marginBottom:8,
        display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
        {b.desc}
      </div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontSize:'.6rem', fontFamily:'monospace', fontWeight:700, padding:'2px 7px', borderRadius:3, background:cfg.color+'22', color:cfg.color }}>BLOQUEADA</span>
          <span style={{ fontSize:'.63rem', fontFamily:'monospace', color:'#555' }}>{timer}</span>
        </div>
        <button onClick={e => { e.stopPropagation(); onResolve(b.id) }}
          style={{ fontSize:'.68rem', padding:'4px 10px', borderRadius:5, border:'1px solid rgba(5,150,105,.35)', background:'rgba(5,150,105,.08)', color:'#059669', cursor:'pointer', fontWeight:600 }}>
          ✅ Libre
        </button>
      </div>
      <div style={{ fontSize:'.62rem', color:'#444', marginTop:5 }}>Reportado por {b.reportedBy}</div>
    </div>
  )
}

// ── HELP SCREEN ───────────────────────────────────────────
function HelpScreen({ onClose }) {
  const steps = [
    { icon:'🔍', title:'Busca tu zona', desc:'Haz zoom en el mapa hasta ver tu calle o avenida exacta. Puedes moverte con el dedo.' },
    { icon:'📍', title:'Marca el punto exacto', desc:'Toca directamente sobre la calle bloqueada en el mapa. Aparecerá el formulario automáticamente.' },
    { icon:'🚔', title:'Elige el tipo de bloqueo', desc:'Selecciona qué está causando el bloqueo: policía, derrumbe, accidente, inundación, protesta u otro.' },
    { icon:'📝', title:'Describe la situación', desc:'Escribe el nombre de la vía y los detalles: si hay paso alternativo, cuántos vehículos bloquean, etc.' },
    { icon:'📡', title:'Se publica al instante', desc:'En menos de 4 segundos tu reporte aparece en el mapa de todos los usuarios conectados.' },
    { icon:'✅', title:'Marca como libre', desc:'Cuando la vía se abra, toca el pin en el mapa y pulsa "Marcar como libre" para avisarle a todos.' },
  ]
  return (
    <div style={{ position:'fixed', inset:0, background:'#0d0d0d', zIndex:400, overflowY:'auto', display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ flexShrink:0, padding:'16px 18px', borderBottom:'1px solid #1e1e1e', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#111', position:'sticky', top:0, zIndex:1 }}>
        <div>
          <div style={{ fontWeight:700, fontSize:'1rem' }}>Cómo usar Vías VE</div>
          <div style={{ fontSize:'.7rem', color:'#555', marginTop:1 }}>Guía rápida</div>
        </div>
        <button onClick={onClose} style={{ background:'#1c1c1c', border:'1px solid #2a2a2a', color:'#aaa', borderRadius:8, padding:'7px 14px', fontSize:'.8rem', fontWeight:600, cursor:'pointer' }}>
          ✕ Cerrar
        </button>
      </div>

      <div style={{ padding:'20px 18px', maxWidth:500, margin:'0 auto', width:'100%' }}>

        {/* Intro */}
        <div style={{ background:'rgba(251,191,36,.08)', border:'1px solid rgba(251,191,36,.2)', borderRadius:10, padding:16, marginBottom:24, textAlign:'center' }}>
          <div style={{ fontSize:'2rem', marginBottom:8 }}>🚫</div>
          <div style={{ fontWeight:700, fontSize:'1rem', color:'#fbbf24', marginBottom:6 }}>Vías VE</div>
          <div style={{ fontSize:'.82rem', lineHeight:1.6, color:'#aaa' }}>
            Mapa colaborativo en tiempo real para reportar calles bloqueadas en Venezuela. Entre todos ayudamos a que nadie pierda tiempo en vías cortadas.
          </div>
        </div>

        {/* Steps */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:'.65rem', fontFamily:'monospace', color:'#555', letterSpacing:'.08em', marginBottom:14 }}>CÓMO REPORTAR UN BLOQUEO</div>
          {steps.map((s,i) => (
            <div key={i} style={{ display:'flex', gap:14, marginBottom:16, alignItems:'flex-start' }}>
              <div style={{ width:40, height:40, borderRadius:10, background:'#1c1c1c', border:'1px solid #2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.3rem', flexShrink:0 }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontWeight:600, fontSize:'.87rem', marginBottom:3 }}>{s.title}</div>
                <div style={{ fontSize:'.78rem', color:'#888', lineHeight:1.55 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Block types */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:'.65rem', fontFamily:'monospace', color:'#555', letterSpacing:'.08em', marginBottom:12 }}>TIPOS DE BLOQUEO</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:7 }}>
            {Object.values(BLOCK_TYPES).map((v,i) => (
              <div key={i} style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:8, padding:'10px 12px', display:'flex', alignItems:'center', gap:9 }}>
                <span style={{ fontSize:'1.2rem' }}>{v.icon}</span>
                <div>
                  <div style={{ fontSize:'.75rem', fontWeight:600, color:v.color }}>{v.label}</div>
                  <div style={{ fontSize:'.65rem', color:'#666', marginTop:1 }}>{v.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PWA install */}
        <div style={{ background:'rgba(37,99,235,.08)', border:'1px solid rgba(37,99,235,.25)', borderRadius:10, padding:16, marginBottom:24 }}>
          <div style={{ fontWeight:700, fontSize:'.9rem', color:'#60a5fa', marginBottom:10, display:'flex', alignItems:'center', gap:7 }}>
            📲 Instala la app en tu móvil
          </div>
          <div style={{ fontSize:'.78rem', color:'#aaa', lineHeight:1.6, marginBottom:12 }}>
            Vías VE funciona como una app nativa en tu teléfono, sin necesidad de ir a ninguna tienda de aplicaciones.
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div style={{ background:'#1c1c1c', border:'1px solid #2a2a2a', borderRadius:8, padding:12 }}>
              <div style={{ fontWeight:600, fontSize:'.8rem', marginBottom:5, color:'#f1f1f1' }}>📱 iPhone (Safari)</div>
              <div style={{ fontSize:'.75rem', color:'#888', lineHeight:1.6 }}>
                1. Abre la app en Safari<br/>
                2. Toca el botón <strong style={{ color:'#aaa' }}>Compartir</strong> (cuadrado con flecha hacia arriba)<br/>
                3. Desplázate y toca <strong style={{ color:'#aaa' }}>"Agregar a pantalla de inicio"</strong><br/>
                4. Toca <strong style={{ color:'#aaa' }}>"Agregar"</strong>
              </div>
            </div>
            <div style={{ background:'#1c1c1c', border:'1px solid #2a2a2a', borderRadius:8, padding:12 }}>
              <div style={{ fontWeight:600, fontSize:'.8rem', marginBottom:5, color:'#f1f1f1' }}>🤖 Android (Chrome)</div>
              <div style={{ fontSize:'.75rem', color:'#888', lineHeight:1.6 }}>
                1. Abre la app en Chrome<br/>
                2. Toca los <strong style={{ color:'#aaa' }}>tres puntos</strong> arriba a la derecha<br/>
                3. Toca <strong style={{ color:'#aaa' }}>"Instalar aplicación"</strong> o <strong style={{ color:'#aaa' }}>"Agregar a pantalla de inicio"</strong><br/>
                4. Toca <strong style={{ color:'#aaa' }}>"Instalar"</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:10, padding:16, marginBottom:24 }}>
          <div style={{ fontSize:'.65rem', fontFamily:'monospace', color:'#555', letterSpacing:'.08em', marginBottom:12 }}>CONSEJOS ÚTILES</div>
          {[
            ['⚡','Es en tiempo real','Todos los usuarios ven tu reporte en menos de 4 segundos.'],
            ['🎯','Sé preciso','Haz el máximo zoom antes de marcar el punto para ser exacto.'],
            ['📝','Más info = más útil','Menciona si hay paso alternativo, cuántos efectivos hay, etc.'],
            ['✅','Cierra el bloqueo','Cuando la vía se abra, márcala como libre para ayudar a otros.'],
            ['📡','Sin internet momentáneo','La app guarda tu posición aunque pierdas señal un momento.'],
          ].map(([icon,title,desc],i) => (
            <div key={i} style={{ display:'flex', gap:10, marginBottom: i<4?12:0 }}>
              <span style={{ fontSize:'1rem', flexShrink:0 }}>{icon}</span>
              <div>
                <span style={{ fontWeight:600, fontSize:'.8rem' }}>{title}: </span>
                <span style={{ fontSize:'.78rem', color:'#888' }}>{desc}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Credits */}
        <div style={{ textAlign:'center', padding:'20px 0 8px', borderTop:'1px solid #1e1e1e' }}>
          <div style={{ fontSize:'1.5rem', marginBottom:8 }}>⚡</div>
          <div style={{ fontSize:'.75rem', color:'#555', marginBottom:4 }}>Creado por</div>
          <div style={{ fontWeight:700, fontSize:'1.1rem', letterSpacing:'.05em', color:'#fbbf24' }}>NIVEL_DI0S</div>
          <div style={{ fontSize:'.7rem', color:'#444', marginTop:8, lineHeight:1.6 }}>
            Hecho para Venezuela 🇻🇪<br/>
            Código abierto · Gratis para siempre
          </div>
        </div>

      </div>
    </div>
  )
}

// ── MAIN ─────────────────────────────────────────────────
export default function Home() {
  const mapRef    = useRef(null)
  const mapObjRef = useRef(null)
  const markerGrp = useRef(null)
  const sseRef    = useRef(null)
  const tempMarkerRef = useRef(null)

  const [blocks, setBlocks]         = useState([])
  const [tab, setTab]               = useState('map')
  const [modal, setModal]           = useState(false)
  const [help, setHelp]             = useState(false)
  const [coord, setCoord]           = useState(null)
  const [clock, setClock]           = useState('')
  const [toast, setToast]           = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter]         = useState('all')
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  // form
  const [fType, setFType] = useState('')
  const [fVia, setFVia]   = useState('')
  const [fDesc, setFDesc] = useState('')
  const [fName, setFName] = useState('')

  // ── Clock ──
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setClock(String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0'))
    }
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t)
  }, [])

  // ── PWA: register SW + install prompt ──
  useEffect(() => {
    if (typeof window === 'undefined') return
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
    const handler = e => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowInstallBanner(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const installApp = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setShowInstallBanner(false)
      showToast('✅ App instalada correctamente', 'ok')
    }
    setInstallPrompt(null)
  }

  // ── Toast ──
  const showToast = useCallback((msg, type = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }, [])

  // ── Map init ──
  useEffect(() => {
    if (typeof window === 'undefined' || mapObjRef.current) return
    const L = window.L
    if (!L) return

    const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false })
      .setView([10.49, -66.93], 11)

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 })
      .addTo(map)
    L.control.zoom({ position: 'topright' }).addTo(map)
    markerGrp.current = L.layerGroup().addTo(map)

    map.on('click', e => {
      const { lat, lng } = e.latlng
      setCoord({ lat, lng })

      // Show temporary crosshair marker
      if (tempMarkerRef.current) map.removeLayer(tempMarkerRef.current)
      tempMarkerRef.current = L.circleMarker([lat, lng], {
        radius: 10, color: '#fbbf24', fillColor: '#fbbf24',
        fillOpacity: .3, weight: 2,
      }).addTo(map)

      // Auto-open modal on map click
      setFType(''); setFVia(''); setFDesc(''); setFName('')
      setModal(true)
    })

    mapObjRef.current = map
  }, [])

  // ── SSE ──
  useEffect(() => {
    const connect = () => {
      if (sseRef.current) sseRef.current.close()
      const es = new EventSource('/api/events')
      es.addEventListener('init',   e => setBlocks(JSON.parse(e.data).blocks || []))
      es.addEventListener('update', e => setBlocks(JSON.parse(e.data).blocks || []))
      es.onerror = () => { es.close(); setTimeout(connect, 5000) }
      sseRef.current = es
    }
    connect()
    return () => sseRef.current?.close()
  }, [])

  // ── Sync markers ──
  useEffect(() => {
    const L = window.L
    if (!L || !markerGrp.current) return
    markerGrp.current.clearLayers()

    blocks.forEach(b => {
      const cfg = BLOCK_TYPES[b.type]
      const icon = L.divIcon({
        html: `<div style="width:36px;height:36px;border-radius:8px;background:${cfg.color};display:flex;align-items:center;justify-content:center;font-size:17px;border:2px solid rgba(255,255,255,.15);box-shadow:0 3px 12px rgba(0,0,0,.6);">${cfg.icon}</div>`,
        className:'', iconSize:[36,36], iconAnchor:[18,18],
      })
      const off = 0.0015
      L.polyline(
        [[b.lat-off, b.lng-off*1.6],[b.lat+off, b.lng+off*1.6]],
        { color:cfg.color, weight:6, opacity:.9, dashArray:'10,6' }
      ).addTo(markerGrp.current)
      L.marker([b.lat, b.lng], { icon }).addTo(markerGrp.current).bindPopup(`
        <div style="font-family:'Inter',system-ui,sans-serif;min-width:210px">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
            <span style="font-size:1.3rem">${cfg.icon}</span>
            <div>
              <div style="font-weight:700;font-size:.9rem">${cfg.label}</div>
              ${b.via?`<div style="font-size:.7rem;color:#888;margin-top:1px">🛣️ ${b.via}</div>`:''}
            </div>
          </div>
          <div style="font-size:.82rem;line-height:1.55;color:#ccc;margin-bottom:8px;border-left:2px solid ${cfg.color};padding-left:8px">${b.desc}</div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
            <span style="font-size:.65rem;font-family:monospace;color:#666">${elapsed(b.ts)} · ${fmt(b.ts)}</span>
            <span style="font-size:.62rem;color:#555">por ${b.reportedBy}</span>
          </div>
          <button onclick="fetch('/api/block',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:'${b.id}'})}).then(()=>{ document.querySelector('.leaflet-popup-close-button')?.click() })"
            style="width:100%;padding:9px;border:1px solid rgba(5,150,105,.4);border-radius:7px;background:rgba(5,150,105,.1);color:#059669;font-size:.8rem;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;">
            ✅ Marcar como libre — vía abierta
          </button>
        </div>`, { maxWidth:280 })
    })
  }, [blocks])

  // ── Submit ──
  const submit = async () => {
    if (!fType) { showToast('Selecciona el tipo de bloqueo', 'err'); return }
    if (!fDesc.trim()) { showToast('Describe el bloqueo', 'err'); return }
    if (!coord) { showToast('Toca el mapa para marcar el punto', 'err'); return }
    setSubmitting(true)
    try {
      const res = await fetch('/api/block', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ lat:coord.lat, lng:coord.lng, type:fType, via:fVia, desc:fDesc, reportedBy:fName||'Anónimo' }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error||'Error al enviar','err'); return }
      // Remove temp marker
      if (tempMarkerRef.current && mapObjRef.current) {
        mapObjRef.current.removeLayer(tempMarkerRef.current)
        tempMarkerRef.current = null
      }
      showToast('🚫 Bloqueo publicado — todos pueden verlo ya','ok')
      setModal(false)
      setCoord(null)
    } catch { showToast('Error de conexión','err') }
    finally { setSubmitting(false) }
  }

  const resolve = async (id) => {
    try {
      await fetch('/api/block', { method:'DELETE', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id}) })
      showToast('✅ Vía marcada como libre','ok')
    } catch { showToast('Error de conexión','err') }
  }

  const focusOnMap = b => {
    setTab('map')
    setTimeout(() => { mapObjRef.current?.setView([b.lat,b.lng],16); mapObjRef.current?.invalidateSize() }, 80)
  }

  const closeModal = () => {
    setModal(false)
    if (tempMarkerRef.current && mapObjRef.current) {
      mapObjRef.current.removeLayer(tempMarkerRef.current)
      tempMarkerRef.current = null
    }
    setCoord(null)
  }

  const filtered = filter==='all' ? blocks : blocks.filter(b=>b.type===filter)
  const total = blocks.length

  return (
    <>
      <Head>
        <title>Vías VE · Calles bloqueadas en tiempo real</title>
        <meta name="description" content="Mapa colaborativo en tiempo real de calles bloqueadas en Venezuela. Creado por NIVEL_DI0S." />
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1" />
        <meta name="theme-color" content="#fbbf24" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Vías VE" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" defer />
      </Head>

      {/* HELP SCREEN */}
      {help && <HelpScreen onClose={() => setHelp(false)} />}

      <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'#0d0d0d', color:'#f1f1f1', fontFamily:"'Inter',system-ui,sans-serif" }}>

        {/* INSTALL BANNER */}
        {showInstallBanner && (
          <div style={{ flexShrink:0, background:'rgba(37,99,235,.15)', borderBottom:'1px solid rgba(37,99,235,.3)', padding:'10px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, animation:'fadeUp .3s ease' }}>
            <div style={{ fontSize:'.78rem', color:'#93c5fd', lineHeight:1.4 }}>
              📲 <strong>Instala Vías VE</strong> en tu móvil para acceso rápido
            </div>
            <div style={{ display:'flex', gap:7', flexShrink:0 }}>
              <button onClick={installApp} style={{ padding:'6px 14px', background:'#2563eb', color:'#fff', border:'none', borderRadius:6, fontSize:'.75rem', fontWeight:700, cursor:'pointer' }}>
                Instalar
              </button>
              <button onClick={() => setShowInstallBanner(false)} style={{ padding:'6px 10px', background:'transparent', color:'#555', border:'none', fontSize:'.75rem', cursor:'pointer' }}>
                ✕
              </button>
            </div>
          </div>
        )}

        {/* HEADER */}
        <div style={{ flexShrink:0, height:52, background:'#111', borderBottom:'1px solid #222', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 14px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            <div style={{ position:'relative', width:10, height:10, flexShrink:0 }}>
              <div style={{ width:10, height:10, borderRadius:'50%', background:'#fbbf24' }} />
              <div style={{ position:'absolute', inset:-3, borderRadius:'50%', border:'1.5px solid #fbbf24', animation:'ripple 2s infinite' }} />
            </div>
            <span style={{ fontWeight:700, fontSize:'.95rem', letterSpacing:'-.02em' }}>
              Vías <span style={{ color:'#fbbf24' }}>VE</span>
            </span>
            <span style={{ fontSize:'.62rem', fontFamily:'monospace', color:'#444' }}>
              {total > 0 ? `${total} bloqueo${total>1?'s':''}` : 'sin bloqueos'}
            </span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:'.63rem', fontFamily:'monospace', color:'#059669', background:'rgba(5,150,105,.1)', border:'1px solid rgba(5,150,105,.2)', padding:'3px 8px', borderRadius:20 }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:'#059669', animation:'blink 1s infinite' }} />
              EN VIVO
            </div>
            <span style={{ fontSize:'.68rem', fontFamily:'monospace', color:'#444' }}>{clock}</span>
            <button onClick={() => setHelp(true)} style={{ background:'#1c1c1c', border:'1px solid #2a2a2a', color:'#aaa', borderRadius:7, padding:'5px 10px', fontSize:'.72rem', fontWeight:600, cursor:'pointer' }}>
              Ayuda
            </button>
          </div>
        </div>

        {/* TABS */}
        <div style={{ flexShrink:0, display:'flex', background:'#111', borderBottom:'1px solid #222' }}>
          {[['map','🗺️ Mapa'],['list','📋 Lista']].map(([id,label]) => (
            <button key={id} onClick={() => {
              setTab(id)
              if (id==='map') setTimeout(() => mapObjRef.current?.invalidateSize(), 80)
            }} style={{
              flex:1, height:42, border:'none', background:'none',
              borderBottom: tab===id ? '2px solid #fbbf24' : '2px solid transparent',
              color: tab===id ? '#fbbf24' : '#555',
              fontSize:'.78rem', fontWeight:600, cursor:'pointer', transition:'all .2s',
              display:'flex', alignItems:'center', justifyContent:'center', gap:6,
            }}>
              {label}
              {id==='list' && total>0 && (
                <span style={{ background:'#fbbf24', color:'#000', fontSize:'.58rem', fontFamily:'monospace', fontWeight:700, padding:'1px 5px', borderRadius:3 }}>{total}</span>
              )}
            </button>
          ))}
        </div>

        {/* PANELS */}
        <div style={{ flex:1, overflow:'hidden', position:'relative' }}>

          {/* MAP */}
          <div style={{ position:'absolute', inset:0, display:tab==='map'?'flex':'none', flexDirection:'column' }}>

            {/* Tap hint */}
            {blocks.length===0 && !coord && (
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:10, textAlign:'center', pointerEvents:'none' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:8 }}>✅</div>
                <div style={{ fontSize:'.85rem', fontWeight:600, color:'#aaa' }}>Sin bloqueos activos</div>
                <div style={{ fontSize:'.72rem', color:'#555', marginTop:4 }}>Toca el mapa para reportar uno</div>
              </div>
            )}

            {/* Coord indicator */}
            {coord && !modal && (
              <div style={{ position:'absolute', top:10, left:'50%', transform:'translateX(-50%)', zIndex:25, background:'rgba(13,13,13,.95)', border:'1px solid rgba(251,191,36,.3)', padding:'7px 14px', borderRadius:8, fontSize:'.72rem', fontFamily:'monospace', color:'#fbbf24', backdropFilter:'blur(8px)', pointerEvents:'none', whiteSpace:'nowrap' }}>
                📍 {coord.lat.toFixed(5)}, {coord.lng.toFixed(5)}
              </div>
            )}

            <div ref={mapRef} style={{ flex:1 }} />

            {/* FAB */}
            <div style={{ position:'absolute', bottom:20, left:'50%', transform:'translateX(-50%)', zIndex:20, display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
              <div style={{ fontSize:'.65rem', color:'rgba(251,191,36,.6)', fontFamily:'monospace', textAlign:'center', pointerEvents:'none' }}>
                Toca la calle bloqueada en el mapa
              </div>
              <button onClick={() => { showToast('📍 Toca directamente sobre la calle bloqueada','info') }} style={{
                display:'flex', alignItems:'center', gap:8, padding:'13px 28px',
                border:'none', borderRadius:30, background:'#fbbf24', color:'#000',
                fontSize:'.88rem', fontWeight:700, cursor:'pointer',
                boxShadow:'0 4px 24px rgba(0,0,0,.5)', animation:'pulse 2.5s infinite',
              }}>
                🚫 Reportar bloqueo
              </button>
            </div>
          </div>

          {/* LIST */}
          <div style={{ position:'absolute', inset:0, display:tab==='list'?'block':'none', overflowY:'auto' }}>
            <div style={{ padding:14, maxWidth:560, margin:'0 auto' }}>
              <div style={{ display:'flex', gap:6, marginBottom:14, overflowX:'auto', paddingBottom:2 }}>
                <button onClick={() => setFilter('all')} style={{ flexShrink:0, padding:'5px 12px', borderRadius:20, border:filter==='all'?'1px solid #fbbf24':'1px solid #2a2a2a', background:filter==='all'?'rgba(251,191,36,.1)':'none', color:filter==='all'?'#fbbf24':'#555', fontSize:'.72rem', cursor:'pointer' }}>
                  Todos ({total})
                </button>
                {Object.entries(BLOCK_TYPES).map(([k,v]) => {
                  const count = blocks.filter(b=>b.type===k).length
                  if (!count) return null
                  return (
                    <button key={k} onClick={() => setFilter(k)} style={{ flexShrink:0, padding:'5px 12px', borderRadius:20, border:filter===k?`1px solid ${v.color}`:'1px solid #2a2a2a', background:filter===k?v.color+'18':'none', color:filter===k?v.color:'#555', fontSize:'.72rem', cursor:'pointer' }}>
                      {v.icon} {v.label} ({count})
                    </button>
                  )
                })}
              </div>

              {filtered.length===0 ? (
                <div style={{ textAlign:'center', padding:'48px 20px', color:'#555' }}>
                  <div style={{ fontSize:'2rem', marginBottom:10 }}>✅</div>
                  <div style={{ fontSize:'.88rem', fontWeight:600, color:'#888', marginBottom:4 }}>Sin bloqueos activos</div>
                  <div style={{ fontSize:'.75rem' }}>Las vías están libres en este momento</div>
                </div>
              ) : filtered.map(b => (
                <BlockCard key={b.id} b={b} onFocus={focusOnMap} onResolve={resolve} />
              ))}

              {/* Footer credits */}
              <div style={{ textAlign:'center', padding:'24px 0 8px', marginTop:8, borderTop:'1px solid #1a1a1a' }}>
                <div style={{ fontSize:'.68rem', color:'#333' }}>Creado por</div>
                <div style={{ fontWeight:700, fontSize:'.9rem', color:'#fbbf24', letterSpacing:'.05em', marginTop:3 }}>NIVEL_DI0S</div>
                <div style={{ fontSize:'.62rem', color:'#2a2a2a', marginTop:4 }}>Venezuela 🇻🇪 · Gratis · Código abierto</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {modal && (
        <div onClick={e => { if(e.target===e.currentTarget) closeModal() }}
          style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.8)', zIndex:300, display:'flex', alignItems:'flex-end', justifyContent:'center', backdropFilter:'blur(3px)', animation:'fadeUp .2s ease' }}>
          <div style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:'16px 16px 0 0', width:'100%', maxWidth:500, maxHeight:'92vh', display:'flex', flexDirection:'column' }}>
            <div style={{ width:36, height:3, background:'#2a2a2a', borderRadius:2, margin:'14px auto 0', flexShrink:0 }} />
            <div style={{ padding:'14px 18px 0', flexShrink:0 }}>
              <h2 style={{ fontSize:'1rem', fontWeight:700, marginBottom:3 }}>🚫 Reportar vía bloqueada</h2>
              <p style={{ fontSize:'.73rem', color:'#059669' }}>
                📍 {coord?.lat.toFixed(5)}, {coord?.lng.toFixed(5)} — punto marcado
              </p>
            </div>
            <div style={{ padding:'14px 18px', overflowY:'auto', flex:1 }}>

              {/* Type */}
              <div style={{ marginBottom:14 }}>
                <div style={{ fontSize:'.65rem', fontFamily:'monospace', color:'#555', marginBottom:7, letterSpacing:'.05em' }}>TIPO DE BLOQUEO</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:7 }}>
                  {Object.entries(BLOCK_TYPES).map(([k,v]) => (
                    <button key={k} onClick={() => setFType(k)} style={{
                      padding:'11px 10px', textAlign:'center', lineHeight:1.4,
                      border:fType===k?`1px solid ${v.color}`:'1px solid #2a2a2a',
                      borderRadius:8, background:fType===k?v.color+'18':'#1c1c1c',
                      color:fType===k?v.color:'#666', fontSize:'.75rem', fontWeight:500, cursor:'pointer',
                    }}>
                      <div style={{ fontSize:'1.2rem', marginBottom:3 }}>{v.icon}</div>
                      <div style={{ fontWeight:600 }}>{v.label}</div>
                      <div style={{ fontSize:'.62rem', marginTop:2, opacity:.7 }}>{v.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Via */}
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:'.65rem', fontFamily:'monospace', color:'#555', marginBottom:5, letterSpacing:'.05em' }}>VÍA O REFERENCIA</div>
                <input value={fVia} onChange={e=>setFVia(e.target.value)} maxLength={80}
                  placeholder="Av. Libertador, Autopista La Guaira km 12..."
                  style={{ width:'100%', background:'#1c1c1c', border:'1px solid #2a2a2a', color:'#f1f1f1', padding:'9px 12px', borderRadius:8, fontSize:'.85rem', outline:'none', fontFamily:'inherit' }} />
              </div>

              {/* Desc */}
              <div style={{ marginBottom:12 }}>
                <div style={{ fontSize:'.65rem', fontFamily:'monospace', color:'#555', marginBottom:5, letterSpacing:'.05em' }}>
                  DESCRIPCIÓN <span style={{ color:fDesc.length>260?'#ef4444':'#333' }}>{fDesc.length}/300</span>
                </div>
                <textarea value={fDesc} onChange={e=>setFDesc(e.target.value)} maxLength={300}
                  placeholder="Qué está pasando, si hay paso alternativo, cuántos vehículos..."
                  style={{ width:'100%', background:'#1c1c1c', border:'1px solid #2a2a2a', color:'#f1f1f1', padding:'9px 12px', borderRadius:8, fontSize:'.85rem', outline:'none', resize:'vertical', minHeight:80, lineHeight:1.5, fontFamily:'inherit' }} />
              </div>

              {/* Name */}
              <div>
                <div style={{ fontSize:'.65rem', fontFamily:'monospace', color:'#555', marginBottom:5, letterSpacing:'.05em' }}>TU NOMBRE (opcional)</div>
                <input value={fName} onChange={e=>setFName(e.target.value)} maxLength={40}
                  placeholder="Para que otros sepan quién reportó"
                  style={{ width:'100%', background:'#1c1c1c', border:'1px solid #2a2a2a', color:'#f1f1f1', padding:'9px 12px', borderRadius:8, fontSize:'.85rem', outline:'none', fontFamily:'inherit' }} />
              </div>
            </div>
            <div style={{ padding:'12px 18px 28px', display:'flex', gap:8, borderTop:'1px solid #1e1e1e', flexShrink:0 }}>
              <button onClick={closeModal} style={{ flex:1, padding:12, background:'#1c1c1c', border:'1px solid #2a2a2a', color:'#666', borderRadius:8, fontSize:'.85rem', fontWeight:600, cursor:'pointer' }}>
                Cancelar
              </button>
              <button onClick={submit} disabled={submitting||!fType} style={{
                flex:2, padding:12, border:'none', borderRadius:8, fontSize:'.85rem', fontWeight:700,
                background:!fType?'#1c1c1c':'#fbbf24', color:!fType?'#444':'#000',
                cursor:submitting||!fType?'not-allowed':'pointer', opacity:submitting?.7:1,
              }}>
                {submitting ? 'Publicando...' : '🚫 Publicar bloqueo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div style={{
          position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)',
          background:'#1c1c1c',
          border:`1px solid ${toast.type==='ok'?'rgba(5,150,105,.4)':toast.type==='err'?'rgba(239,68,68,.4)':'rgba(251,191,36,.4)'}`,
          padding:'10px 18px', borderRadius:8, fontSize:'.8rem',
          color:toast.type==='ok'?'#059669':toast.type==='err'?'#ef4444':'#fbbf24',
          zIndex:500, animation:'fadeUp .2s ease', maxWidth:'calc(100vw - 32px)', textAlign:'center',
        }}>{toast.msg}</div>
      )}
    </>
  )
}
