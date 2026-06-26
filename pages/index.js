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
function fmtTime(ts) {
  const d = new Date(ts)
  return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0')
}

// Shared input style
const INPUT = {
  width: '100%',
  background: '#1c1c1c',
  border: '1px solid #333',
  color: '#f1f1f1',
  padding: '10px 12px',
  borderRadius: 8,
  fontSize: '.88rem',
  outline: 'none',
  fontFamily: 'inherit',
  display: 'block',
}
const LABEL = {
  display: 'block',
  fontSize: '.65rem',
  fontFamily: 'monospace',
  color: '#555',
  marginBottom: 6,
  letterSpacing: '.05em',
}

// ── BLOCK CARD ───────────────────────────────────────────
function BlockCard({ b, onFocus, onResolve }) {
  const [timer, setTimer] = useState(() => elapsed(b.ts))
  useEffect(() => {
    const t = setInterval(() => setTimer(elapsed(b.ts)), 15000)
    return () => clearInterval(t)
  }, [b.ts])
  const cfg = BLOCK_TYPES[b.type] || BLOCK_TYPES.otro
  return (
    <div
      onClick={() => onFocus(b)}
      style={{
        background: '#141414',
        border: '1px solid #2a2a2a',
        borderLeft: '3px solid ' + cfg.color,
        borderRadius: 9,
        padding: '12px 14px',
        marginBottom: 10,
        cursor: 'pointer',
      }}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:4 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7 }}>
          <span style={{ fontSize:'1rem' }}>{cfg.icon}</span>
          <span style={{ fontWeight:600, fontSize:'.87rem' }}>{cfg.label}</span>
        </div>
        <span style={{ fontSize:'.63rem', fontFamily:'monospace', color:'#555', flexShrink:0 }}>{fmtTime(b.ts)}</span>
      </div>
      {b.via ? <div style={{ fontSize:'.72rem', color:'#888', marginBottom:4 }}>🛣️ {b.via}</div> : null}
      <div style={{ fontSize:'.8rem', lineHeight:1.5, color:'#bbb', marginBottom:10 }}>{b.desc}</div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{
            fontSize:'.6rem', fontFamily:'monospace', fontWeight:700,
            padding:'2px 7px', borderRadius:3,
            background: cfg.color + '22', color: cfg.color,
          }}>BLOQUEADA</span>
          <span style={{ fontSize:'.63rem', fontFamily:'monospace', color:'#555' }}>{timer}</span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onResolve(b.id) }}
          style={{
            fontSize:'.7rem', padding:'5px 11px', borderRadius:6,
            border:'1px solid rgba(5,150,105,.4)',
            background:'rgba(5,150,105,.1)', color:'#059669',
            cursor:'pointer', fontWeight:600,
          }}
        >✅ Libre</button>
      </div>
      <div style={{ fontSize:'.62rem', color:'#444', marginTop:6 }}>por {b.reportedBy}</div>
    </div>
  )
}

// ── HELP SCREEN ──────────────────────────────────────────
function HelpScreen({ onClose }) {
  const steps = [
    { icon:'1️⃣', title:'Toca "Reportar bloqueo"', desc:'El mapa entra en modo selección. Verás el aviso azul en la parte superior.' },
    { icon:'2️⃣', title:'Haz zoom y marca el punto', desc:'Acércate a la calle bloqueada y tócala exactamente. Aparecerá un círculo amarillo.' },
    { icon:'3️⃣', title:'Toca "Continuar con este punto"', desc:'El botón aparece en la parte inferior del mapa tras marcar el punto.' },
    { icon:'4️⃣', title:'Rellena el formulario', desc:'Elige el tipo de bloqueo, escribe la vía y describe la situación.' },
    { icon:'5️⃣', title:'Publica', desc:'Tu reporte aparece en el mapa de todos en menos de 4 segundos.' },
    { icon:'✅', title:'Cuando se abra la vía', desc:'Toca el pin en el mapa y pulsa "Marcar como libre" para avisar a todos.' },
  ]
  return (
    <div style={{ position:'fixed', inset:0, background:'#0d0d0d', zIndex:400, display:'flex', flexDirection:'column' }}>
      <div style={{ flexShrink:0, padding:'14px 18px', borderBottom:'1px solid #1e1e1e', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#111' }}>
        <div>
          <div style={{ fontWeight:700, fontSize:'1rem' }}>Cómo usar Vías VE</div>
          <div style={{ fontSize:'.7rem', color:'#555', marginTop:1 }}>Guía paso a paso</div>
        </div>
        <button onClick={onClose} style={{ background:'#1c1c1c', border:'1px solid #2a2a2a', color:'#aaa', borderRadius:8, padding:'7px 14px', fontSize:'.8rem', fontWeight:600, cursor:'pointer' }}>
          ✕ Cerrar
        </button>
      </div>
      <div style={{ flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch' }}>
        <div style={{ padding:'20px 18px', maxWidth:500, margin:'0 auto' }}>

          <div style={{ background:'rgba(251,191,36,.08)', border:'1px solid rgba(251,191,36,.2)', borderRadius:10, padding:16, marginBottom:24, textAlign:'center' }}>
            <div style={{ fontSize:'2rem', marginBottom:8 }}>🚫</div>
            <div style={{ fontWeight:700, fontSize:'1rem', color:'#fbbf24', marginBottom:6 }}>Vías VE</div>
            <div style={{ fontSize:'.82rem', lineHeight:1.6, color:'#aaa' }}>
              Mapa colaborativo en tiempo real para reportar calles bloqueadas en Venezuela. Entre todos ayudamos a que nadie pierda tiempo en vías cortadas.
            </div>
          </div>

          <div style={{ fontSize:'.65rem', fontFamily:'monospace', color:'#555', letterSpacing:'.08em', marginBottom:14 }}>CÓMO REPORTAR UN BLOQUEO</div>
          {steps.map((s, i) => (
            <div key={i} style={{ display:'flex', gap:14, marginBottom:16, alignItems:'flex-start' }}>
              <div style={{ width:40, height:40, borderRadius:10, flexShrink:0, background:'#1c1c1c', border:'1px solid #2a2a2a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>{s.icon}</div>
              <div>
                <div style={{ fontWeight:600, fontSize:'.87rem', marginBottom:3 }}>{s.title}</div>
                <div style={{ fontSize:'.78rem', color:'#888', lineHeight:1.55 }}>{s.desc}</div>
              </div>
            </div>
          ))}

          <div style={{ marginTop:8, marginBottom:24 }}>
            <div style={{ fontSize:'.65rem', fontFamily:'monospace', color:'#555', letterSpacing:'.08em', marginBottom:12 }}>TIPOS DE BLOQUEO</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:7 }}>
              {Object.values(BLOCK_TYPES).map((v, i) => (
                <div key={i} style={{ background:'#141414', border:'1px solid #2a2a2a', borderRadius:8, padding:'10px 12px', display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:'1.1rem', flexShrink:0 }}>{v.icon}</span>
                  <div>
                    <div style={{ fontSize:'.75rem', fontWeight:600, color:v.color }}>{v.label}</div>
                    <div style={{ fontSize:'.65rem', color:'#555', marginTop:1 }}>{v.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:'rgba(37,99,235,.08)', border:'1px solid rgba(37,99,235,.25)', borderRadius:10, padding:16, marginBottom:24 }}>
            <div style={{ fontWeight:700, fontSize:'.9rem', color:'#60a5fa', marginBottom:10 }}>📲 Instala la app en tu móvil</div>
            <div style={{ fontSize:'.78rem', color:'#aaa', lineHeight:1.6, marginBottom:10 }}>Funciona como app nativa sin pasar por ninguna tienda.</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ background:'#1c1c1c', border:'1px solid #2a2a2a', borderRadius:8, padding:12 }}>
                <div style={{ fontWeight:600, fontSize:'.8rem', marginBottom:5 }}>📱 iPhone (Safari)</div>
                <div style={{ fontSize:'.75rem', color:'#888', lineHeight:1.7 }}>
                  1. Abre en Safari<br/>
                  2. Toca <strong style={{ color:'#aaa' }}>Compartir</strong> (cuadrado con flecha)<br/>
                  3. Toca <strong style={{ color:'#aaa' }}>"Agregar a pantalla de inicio"</strong><br/>
                  4. Toca <strong style={{ color:'#aaa' }}>"Agregar"</strong>
                </div>
              </div>
              <div style={{ background:'#1c1c1c', border:'1px solid #2a2a2a', borderRadius:8, padding:12 }}>
                <div style={{ fontWeight:600, fontSize:'.8rem', marginBottom:5 }}>🤖 Android (Chrome)</div>
                <div style={{ fontSize:'.75rem', color:'#888', lineHeight:1.7 }}>
                  1. Abre en Chrome<br/>
                  2. Toca los <strong style={{ color:'#aaa' }}>tres puntos</strong> (menú)<br/>
                  3. Toca <strong style={{ color:'#aaa' }}>"Instalar aplicación"</strong><br/>
                  4. Toca <strong style={{ color:'#aaa' }}>"Instalar"</strong>
                </div>
              </div>
            </div>
          </div>

          <div style={{ textAlign:'center', padding:'20px 0 8px', borderTop:'1px solid #1e1e1e' }}>
            <div style={{ fontSize:'.75rem', color:'#555', marginBottom:4 }}>Creado por</div>
            <div style={{ fontWeight:700, fontSize:'1.1rem', letterSpacing:'.05em', color:'#fbbf24' }}>NIVEL_DI0S</div>
            <div style={{ fontSize:'.7rem', color:'#333', marginTop:8, lineHeight:1.6 }}>Hecho para Venezuela 🇻🇪 · Gratis para siempre</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── MAIN ─────────────────────────────────────────────────
export default function Home() {
  const mapRef        = useRef(null)
  const mapObjRef     = useRef(null)
  const markerGrpRef  = useRef(null)
  const tempMarkerRef = useRef(null)
  const sseRef        = useRef(null)

  const [blocks, setBlocks]           = useState([])
  // tab: 'map' | 'list' | 'pick' | 'form'
  // 'pick' = map in selection mode
  // 'form' = report form (no map visible)
  const [tab, setTab]                 = useState('map')
  const [help, setHelp]               = useState(false)
  const [coord, setCoord]             = useState(null)
  const [clock, setClock]             = useState('')
  const [toast, setToast]             = useState(null)
  const [submitting, setSubmitting]   = useState(false)
  const [filter, setFilter]           = useState('all')
  const [installPrompt, setInstallPrompt]         = useState(null)
  const [showInstallBanner, setShowInstallBanner] = useState(false)

  // form fields
  const [fType, setFType] = useState('')
  const [fVia,  setFVia]  = useState('')
  const [fDesc, setFDesc] = useState('')
  const [fName, setFName] = useState('')

  // ── Clock ──
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setClock(String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0'))
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  // ── Toast ──
  const showToast = useCallback((msg, type = 'ok') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }, [])

  // ── PWA ──
  useEffect(() => {
    if (typeof window === 'undefined') return
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {})
    const handler = e => { e.preventDefault(); setInstallPrompt(e); setShowInstallBanner(true) }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const installApp = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') { setShowInstallBanner(false); showToast('✅ App instalada', 'ok') }
    setInstallPrompt(null)
  }

  // ── Map init ──
  useEffect(() => {
    if (typeof window === 'undefined' || mapObjRef.current) return
    const L = window.L
    if (!L) return

    const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false })
      .setView([10.49, -66.93], 11)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map)
    L.control.zoom({ position: 'topright' }).addTo(map)
    markerGrpRef.current = L.layerGroup().addTo(map)

    map.on('click', e => {
      // Only register clicks when in pick mode
      if (mapRef._pickMode) {
        const { lat, lng } = e.latlng
        setCoord({ lat, lng })
        if (tempMarkerRef.current) map.removeLayer(tempMarkerRef.current)
        tempMarkerRef.current = L.circleMarker([lat, lng], {
          radius: 12, color: '#fbbf24', fillColor: '#fbbf24', fillOpacity: .3, weight: 3,
        }).addTo(map)
      }
    })

    mapObjRef.current = map
  }, [])

  // Use a ref flag for pick mode so the map click handler can read it
  // without needing to re-register the handler
  useEffect(() => {
    mapRef._pickMode = (tab === 'pick')
  }, [tab])

  // Invalidate map size whenever the map div becomes visible
  useEffect(() => {
    if (tab === 'map' || tab === 'pick') {
      setTimeout(() => mapObjRef.current?.invalidateSize(), 60)
    }
  }, [tab])

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
    if (!L || !markerGrpRef.current) return
    markerGrpRef.current.clearLayers()
    blocks.forEach(b => {
      const cfg = BLOCK_TYPES[b.type] || BLOCK_TYPES.otro
      const off = 0.0015
      L.polyline(
        [[b.lat - off, b.lng - off * 1.5],[b.lat + off, b.lng + off * 1.5]],
        { color: cfg.color, weight: 6, opacity: .85, dashArray: '10,6' }
      ).addTo(markerGrpRef.current)
      const icon = L.divIcon({
        html: '<div style="width:36px;height:36px;border-radius:8px;background:' + cfg.color + ';display:flex;align-items:center;justify-content:center;font-size:17px;border:2px solid rgba(255,255,255,.15);box-shadow:0 3px 12px rgba(0,0,0,.6);">' + cfg.icon + '</div>',
        className: '', iconSize: [36,36], iconAnchor: [18,18],
      })
      L.marker([b.lat, b.lng], { icon }).addTo(markerGrpRef.current).bindPopup(
        '<div style="font-family:system-ui,sans-serif;min-width:210px">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
        '<span style="font-size:1.3rem">' + cfg.icon + '</span>' +
        '<div><div style="font-weight:700;font-size:.9rem">' + cfg.label + '</div>' +
        (b.via ? '<div style="font-size:.7rem;color:#888;margin-top:1px">🛣️ ' + b.via + '</div>' : '') +
        '</div></div>' +
        '<div style="font-size:.82rem;line-height:1.55;color:#ccc;margin-bottom:8px;border-left:2px solid ' + cfg.color + ';padding-left:8px">' + b.desc + '</div>' +
        '<div style="font-size:.65rem;font-family:monospace;color:#666;margin-bottom:10px">' + elapsed(b.ts) + ' · ' + fmtTime(b.ts) + ' · por ' + b.reportedBy + '</div>' +
        '<button onclick="fetch(\'/api/block\',{method:\'DELETE\',headers:{\'Content-Type\':\'application/json\'},body:JSON.stringify({id:\'' + b.id + '\'})}).then(()=>document.querySelector(\'.leaflet-popup-close-button\')?.click())" ' +
        'style="width:100%;padding:9px;border:1px solid rgba(5,150,105,.4);border-radius:7px;background:rgba(5,150,105,.1);color:#059669;font-size:.8rem;font-weight:600;cursor:pointer;">' +
        '✅ Marcar como libre — vía abierta</button></div>',
        { maxWidth: 280 }
      )
    })
  }, [blocks])

  // ── Actions ──
  const startPicking = () => {
    setCoord(null)
    if (tempMarkerRef.current && mapObjRef.current) {
      mapObjRef.current.removeLayer(tempMarkerRef.current)
      tempMarkerRef.current = null
    }
    setTab('pick')
  }

  const confirmPoint = () => {
    if (!coord) { showToast('Toca la calle bloqueada en el mapa primero', 'err'); return }
    setFType(''); setFVia(''); setFDesc(''); setFName('')
    setTab('form')
  }

  const cancelReport = () => {
    if (tempMarkerRef.current && mapObjRef.current) {
      mapObjRef.current.removeLayer(tempMarkerRef.current)
      tempMarkerRef.current = null
    }
    setCoord(null)
    setTab('map')
  }

  const submit = async () => {
    if (!fType)        { showToast('Selecciona el tipo de bloqueo', 'err'); return }
    if (!fDesc.trim()) { showToast('Escribe una descripción', 'err'); return }
    if (!coord)        { showToast('No hay punto marcado, vuelve atrás', 'err'); return }

    // Snapshot coord before any state changes
    const savedLat = coord.lat
    const savedLng = coord.lng

    setSubmitting(true)
    try {
      const res = await fetch('/api/block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: savedLat,
          lng: savedLng,
          type: fType,
          via: fVia.trim(),
          desc: fDesc.trim(),
          reportedBy: (fName || 'Anónimo').trim(),
        }),
      })

      let data = {}
      try { data = await res.json() } catch { data = {} }

      if (!res.ok) {
        showToast(data.error || 'Error al enviar (código ' + res.status + ')', 'err')
        return
      }

      // Clean up temp marker
      if (tempMarkerRef.current && mapObjRef.current) {
        mapObjRef.current.removeLayer(tempMarkerRef.current)
        tempMarkerRef.current = null
      }

      // Reset state
      setCoord(null)
      setFType(''); setFVia(''); setFDesc(''); setFName('')

      // Navigate to map and center on new block
      setTab('map')
      showToast('🚫 Bloqueo publicado — ya aparece en el mapa', 'ok')
      setTimeout(() => {
        if (mapObjRef.current) {
          mapObjRef.current.invalidateSize()
          mapObjRef.current.setView([savedLat, savedLng], 16)
        }
      }, 150)

    } catch (err) {
      console.error('[submit]', err)
      showToast('Error de conexión — verifica tu internet', 'err')
    } finally {
      setSubmitting(false)
    }
  }

  const resolve = async id => {
    try {
      const res = await fetch('/api/block', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) { showToast('Error al marcar como libre', 'err'); return }
      showToast('✅ Vía marcada como libre', 'ok')
    } catch {
      showToast('Error de conexión', 'err')
    }
  }

  const focusOnMap = b => {
    setTab('map')
    setTimeout(() => mapObjRef.current?.setView([b.lat, b.lng], 16), 80)
  }

  const filtered = filter === 'all' ? blocks : blocks.filter(b => b.type === filter)
  const total = blocks.length
  const isMapVisible = tab === 'map' || tab === 'pick'

  // Tab bar config — only show map + list in normal mode
  const navTabs = [
    { id: 'map',  label: '🗺️ Mapa' },
    { id: 'list', label: '📋 Lista' },
  ]

  return (
    <>
      <Head>
        <title>Vías VE · Calles bloqueadas en tiempo real</title>
        <meta name="description" content="Mapa colaborativo de calles bloqueadas en Venezuela. Creado por NIVEL_DI0S." />
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
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
        <style>{`
          @keyframes ripple{0%{transform:scale(1);opacity:.5}100%{transform:scale(2.8);opacity:0}}
          @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
          @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,.5)}70%{box-shadow:0 0 0 14px rgba(251,191,36,0)}}
        `}</style>
      </Head>

      {help && <HelpScreen onClose={() => setHelp(false)} />}

      <div style={{ display:'flex', flexDirection:'column', height:'100dvh', background:'#0d0d0d', color:'#f1f1f1', fontFamily:"'Inter',system-ui,sans-serif", overflow:'hidden' }}>

        {/* INSTALL BANNER */}
        {showInstallBanner && (
          <div style={{ flexShrink:0, background:'rgba(37,99,235,.15)', borderBottom:'1px solid rgba(37,99,235,.3)', padding:'9px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
            <span style={{ fontSize:'.77rem', color:'#93c5fd' }}>📲 <strong>Instala Vías VE</strong> en tu móvil</span>
            <div style={{ display:'flex', gap:6, flexShrink:0 }}>
              <button onClick={installApp} style={{ padding:'5px 12px', background:'#2563eb', color:'#fff', border:'none', borderRadius:6, fontSize:'.73rem', fontWeight:700, cursor:'pointer' }}>Instalar</button>
              <button onClick={() => setShowInstallBanner(false)} style={{ padding:'5px 8px', background:'transparent', color:'#555', border:'none', cursor:'pointer' }}>✕</button>
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
              {total > 0 ? total + ' bloqueo' + (total > 1 ? 's' : '') : 'sin bloqueos'}
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

        {/* TABS — only show in map/list mode, not during report flow */}
        {(tab === 'map' || tab === 'list') && (
          <div style={{ flexShrink:0, display:'flex', background:'#111', borderBottom:'1px solid #222' }}>
            {navTabs.map(({ id, label }) => (
              <button key={id} onClick={() => setTab(id)} style={{
                flex:1, height:42, border:'none', background:'none',
                borderBottom: tab === id ? '2px solid #fbbf24' : '2px solid transparent',
                color: tab === id ? '#fbbf24' : '#555',
                fontSize:'.78rem', fontWeight:600, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:6,
              }}>
                {label}
                {id === 'list' && total > 0 && (
                  <span style={{ background:'#fbbf24', color:'#000', fontSize:'.58rem', fontFamily:'monospace', fontWeight:700, padding:'1px 5px', borderRadius:3 }}>{total}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════════════
            CONTENT — flex:1 + overflow:hidden
            Each child fills this area independently.
        ═══════════════════════════════════════════ */}
        <div style={{ flex:1, minHeight:0, overflow:'hidden', position:'relative' }}>

          {/* ── MAP (normal view) ── */}
          <div style={{
            position:'absolute', inset:0,
            display: tab === 'map' ? 'flex' : 'none',
            flexDirection:'column',
          }}>
            {blocks.length === 0 && (
              <div style={{ position:'absolute', top:'42%', left:'50%', transform:'translate(-50%,-50%)', zIndex:10, textAlign:'center', pointerEvents:'none' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:8 }}>✅</div>
                <div style={{ fontSize:'.85rem', fontWeight:600, color:'#aaa' }}>Sin bloqueos activos</div>
                <div style={{ fontSize:'.72rem', color:'#555', marginTop:4 }}>Pulsa el botón para reportar uno</div>
              </div>
            )}
            <div ref={mapRef} style={{ flex:1, minHeight:0 }} />
            <div style={{ flexShrink:0, padding:'14px 16px', background:'#111', borderTop:'1px solid #222', display:'flex', justifyContent:'center' }}>
              <button onClick={startPicking} style={{
                width:'100%', maxWidth:400, padding:'14px 0',
                background:'#fbbf24', color:'#000', border:'none', borderRadius:12,
                fontSize:'.92rem', fontWeight:700, cursor:'pointer',
                animation:'pulse 2.5s infinite',
              }}>
                🚫 Reportar vía bloqueada
              </button>
            </div>
          </div>

          {/* ── PICK MODE (map in selection mode) ── */}
          <div style={{
            position:'absolute', inset:0,
            display: tab === 'pick' ? 'flex' : 'none',
            flexDirection:'column',
          }}>
            {/* Top instruction bar */}
            <div style={{ flexShrink:0, background:'rgba(37,99,235,.95)', padding:'10px 16px', display:'flex', alignItems:'center', gap:10, zIndex:20 }}>
              <span style={{ fontSize:'1rem' }}>📍</span>
              <span style={{ fontSize:'.82rem', fontWeight:600, color:'#fff', flex:1 }}>
                {coord ? 'Punto marcado. Ajusta si quieres o pulsa Continuar.' : 'Toca exactamente donde está el bloqueo en el mapa'}
              </span>
            </div>

            {/* Map fills middle */}
            <div ref={mapRef} style={{ flex:1, minHeight:0 }} />

            {/* Bottom action bar */}
            <div style={{ flexShrink:0, padding:'12px 16px', background:'#111', borderTop:'1px solid #222', display:'flex', gap:10 }}>
              <button onClick={cancelReport} style={{ flex:1, padding:'12px 0', background:'#1c1c1c', border:'1px solid #2a2a2a', color:'#aaa', borderRadius:10, fontSize:'.85rem', fontWeight:600, cursor:'pointer' }}>
                ✕ Cancelar
              </button>
              <button onClick={confirmPoint} disabled={!coord} style={{
                flex:2, padding:'12px 0', border:'none', borderRadius:10,
                fontSize:'.85rem', fontWeight:700,
                background: coord ? '#fbbf24' : '#2a2a2a',
                color: coord ? '#000' : '#555',
                cursor: coord ? 'pointer' : 'not-allowed',
              }}>
                {coord ? '✅ Continuar con este punto →' : 'Toca el mapa primero'}
              </button>
            </div>
          </div>

          {/* ── FORM (completely separate, no map) ── */}
          <div style={{
            position:'absolute', inset:0,
            display: tab === 'form' ? 'flex' : 'none',
            flexDirection:'column',
            background:'#0d0d0d',
          }}>
            {/* Form header */}
            <div style={{ flexShrink:0, padding:'14px 16px', background:'#111', borderBottom:'1px solid #222', display:'flex', alignItems:'center', gap:12 }}>
              <button onClick={() => setTab('pick')} style={{ background:'#1c1c1c', border:'1px solid #2a2a2a', color:'#aaa', borderRadius:8, padding:'6px 12px', fontSize:'.8rem', fontWeight:600, cursor:'pointer', flexShrink:0 }}>
                ← Volver
              </button>
              <div>
                <div style={{ fontWeight:700, fontSize:'.92rem' }}>🚫 Datos del bloqueo</div>
                {coord && <div style={{ fontSize:'.65rem', fontFamily:'monospace', color:'#059669', marginTop:1 }}>📍 {coord.lat.toFixed(5)}, {coord.lng.toFixed(5)}</div>}
              </div>
            </div>

            {/* Scrollable form body */}
            <div style={{ flex:1, minHeight:0, overflowY:'auto', WebkitOverflowScrolling:'touch' }}>
              <div style={{ padding:'16px', maxWidth:520, margin:'0 auto' }}>

                {/* Type selector */}
                <div style={{ marginBottom:16 }}>
                  <div style={LABEL}>TIPO DE BLOQUEO *</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
                    {Object.entries(BLOCK_TYPES).map(([k, v]) => (
                      <button key={k} onClick={() => setFType(k)} style={{
                        padding:'11px 10px', textAlign:'center', lineHeight:1.4,
                        border: fType === k ? '2px solid ' + v.color : '1px solid #2a2a2a',
                        borderRadius:9,
                        background: fType === k ? v.color + '20' : '#141414',
                        color: fType === k ? v.color : '#666',
                        fontSize:'.78rem', fontWeight:500, cursor:'pointer',
                      }}>
                        <div style={{ fontSize:'1.4rem', marginBottom:4 }}>{v.icon}</div>
                        <div style={{ fontWeight:600 }}>{v.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Via */}
                <div style={{ marginBottom:14 }}>
                  <label style={LABEL}>VÍA O REFERENCIA</label>
                  <input
                    value={fVia}
                    onChange={e => setFVia(e.target.value)}
                    maxLength={80}
                    placeholder="Ej: Autopista Caracas-La Guaira km 12, Av. Libertador..."
                    style={INPUT}
                  />
                </div>

                {/* Desc */}
                <div style={{ marginBottom:14 }}>
                  <label style={LABEL}>
                    DESCRIPCIÓN * &nbsp;
                    <span style={{ color: fDesc.length > 260 ? '#ef4444' : '#333' }}>{fDesc.length}/300</span>
                  </label>
                  <textarea
                    value={fDesc}
                    onChange={e => setFDesc(e.target.value)}
                    maxLength={300}
                    rows={4}
                    placeholder="Qué está pasando, cuántos vehículos bloquean, si hay paso alternativo..."
                    style={{ ...INPUT, resize:'none', lineHeight:1.6 }}
                  />
                </div>

                {/* Name */}
                <div style={{ marginBottom:8 }}>
                  <label style={LABEL}>TU NOMBRE (opcional)</label>
                  <input
                    value={fName}
                    onChange={e => setFName(e.target.value)}
                    maxLength={40}
                    placeholder="Para que otros sepan quién reportó"
                    style={INPUT}
                  />
                </div>

              </div>
            </div>

            {/* Fixed submit button */}
            <div style={{ flexShrink:0, padding:'12px 16px 24px', background:'#111', borderTop:'1px solid #222', display:'flex', gap:10 }}>
              <button onClick={cancelReport} style={{ flex:1, padding:'13px 0', background:'#1c1c1c', border:'1px solid #2a2a2a', color:'#aaa', borderRadius:10, fontSize:'.85rem', fontWeight:600, cursor:'pointer' }}>
                Cancelar
              </button>
              <button onClick={submit} disabled={submitting || !fType || !fDesc.trim()} style={{
                flex:2, padding:'13px 0', border:'none', borderRadius:10,
                fontSize:'.88rem', fontWeight:700,
                background: (!fType || !fDesc.trim()) ? '#2a2a2a' : '#fbbf24',
                color: (!fType || !fDesc.trim()) ? '#555' : '#000',
                cursor: (submitting || !fType || !fDesc.trim()) ? 'not-allowed' : 'pointer',
                opacity: submitting ? .7 : 1,
              }}>
                {submitting ? 'Publicando...' : '🚫 Publicar bloqueo'}
              </button>
            </div>
          </div>

          {/* ── LIST PANEL ── */}
          <div style={{
            position:'absolute', inset:0,
            display: tab === 'list' ? 'flex' : 'none',
            flexDirection:'column',
            background:'#0d0d0d',
          }}>
            <div style={{ flex:1, minHeight:0, overflowY:'auto', WebkitOverflowScrolling:'touch' }}>
              <div style={{ padding:'14px', maxWidth:560, margin:'0 auto' }}>

                {/* Filters */}
                <div style={{ display:'flex', gap:6, marginBottom:14, overflowX:'auto', paddingBottom:2 }}>
                  <button onClick={() => setFilter('all')} style={{ flexShrink:0, padding:'5px 12px', borderRadius:20, border: filter==='all' ? '1px solid #fbbf24' : '1px solid #2a2a2a', background: filter==='all' ? 'rgba(251,191,36,.1)' : 'none', color: filter==='all' ? '#fbbf24' : '#555', fontSize:'.72rem', cursor:'pointer' }}>
                    Todos ({total})
                  </button>
                  {Object.entries(BLOCK_TYPES).map(([k, v]) => {
                    const count = blocks.filter(b => b.type === k).length
                    if (!count) return null
                    return (
                      <button key={k} onClick={() => setFilter(k)} style={{ flexShrink:0, padding:'5px 12px', borderRadius:20, border: filter===k ? '1px solid ' + v.color : '1px solid #2a2a2a', background: filter===k ? v.color + '18' : 'none', color: filter===k ? v.color : '#555', fontSize:'.72rem', cursor:'pointer' }}>
                        {v.icon} {v.label} ({count})
                      </button>
                    )
                  })}
                </div>

                {filtered.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'48px 20px', color:'#555' }}>
                    <div style={{ fontSize:'2rem', marginBottom:10 }}>✅</div>
                    <div style={{ fontSize:'.88rem', fontWeight:600, color:'#888', marginBottom:4 }}>Sin bloqueos activos</div>
                    <div style={{ fontSize:'.75rem' }}>Las vías están libres en este momento</div>
                  </div>
                ) : filtered.map(b => (
                  <BlockCard key={b.id} b={b} onFocus={focusOnMap} onResolve={resolve} />
                ))}

                <div style={{ textAlign:'center', padding:'24px 0 12px', marginTop:8, borderTop:'1px solid #1a1a1a' }}>
                  <div style={{ fontSize:'.68rem', color:'#333' }}>Creado por</div>
                  <div style={{ fontWeight:700, fontSize:'.9rem', color:'#fbbf24', letterSpacing:'.05em', marginTop:3 }}>NIVEL_DI0S</div>
                  <div style={{ fontSize:'.62rem', color:'#2a2a2a', marginTop:4 }}>Venezuela 🇻🇪 · Gratis · Código abierto</div>
                </div>
              </div>
            </div>

            {/* Report button at bottom of list too */}
            <div style={{ flexShrink:0, padding:'12px 16px 16px', background:'#111', borderTop:'1px solid #222' }}>
              <button onClick={startPicking} style={{ width:'100%', padding:'13px 0', background:'#fbbf24', color:'#000', border:'none', borderRadius:10, fontSize:'.88rem', fontWeight:700, cursor:'pointer' }}>
                🚫 Reportar vía bloqueada
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* TOAST */}
      {toast && (
        <div style={{
          position:'fixed', bottom:24, left:'50%', transform:'translateX(-50%)',
          background:'#1c1c1c',
          border:'1px solid ' + (toast.type==='ok' ? 'rgba(5,150,105,.4)' : toast.type==='err' ? 'rgba(239,68,68,.4)' : 'rgba(251,191,36,.4)'),
          padding:'10px 18px', borderRadius:8, fontSize:'.82rem',
          color: toast.type==='ok' ? '#059669' : toast.type==='err' ? '#ef4444' : '#fbbf24',
          zIndex:500, maxWidth:'calc(100vw - 32px)', textAlign:'center',
          boxShadow:'0 4px 20px rgba(0,0,0,.4)',
        }}>
          {toast.msg}
        </div>
      )}
    </>
  )
}
