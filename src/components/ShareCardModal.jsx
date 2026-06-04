import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { X, Download, Image } from 'lucide-react'
import dayjs from 'dayjs'
import mascot from '../assets/mascot.png'

const BG = '#EBEBEB'
const CARD = '#FFFFFF'
const TEXT = '#111111'
const TEXT2 = '#888888'
const ACCENT = '#111111'

// ─── Monthly Card ───────────────────────────────────────────────────────────
function MonthlyCardContent({ monthLabel, summary, members }) {
  return (
    <div style={{
      width: 400, aspectRatio: '4/5',
      background: BG,
      borderRadius: 32,
      padding: 28,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={mascot} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: 10, color: TEXT2, letterSpacing: 2, textTransform: 'uppercase' }}>Payment Tracker</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{monthLabel}</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: TEXT2 }}>{dayjs().format('D MMM YYYY')}</div>
      </div>

      {/* Total card */}
      {Object.entries(summary).map(([cur, s]) => (
        <div key={cur} style={{
          background: CARD, borderRadius: 20, padding: '20px 24px',
          marginBottom: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <div style={{ fontSize: 10, color: TEXT2, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Total</div>
          <div style={{ fontSize: 34, fontWeight: 800, color: TEXT, letterSpacing: -1 }}>
            {cur}{s.total.toLocaleString()}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            {s.pending > 0 && (
              <div style={{
                background: '#fff0f0', borderRadius: 8, padding: '4px 10px',
                fontSize: 11, fontWeight: 600, color: '#e53935',
              }}>
                Pending -{cur}{s.pending.toLocaleString()}
              </div>
            )}
            {s.paid > 0 && (
              <div style={{
                background: '#f0fff4', borderRadius: 8, padding: '4px 10px',
                fontSize: 11, fontWeight: 600, color: '#2e7d32',
              }}>
                Paid {cur}{s.paid.toLocaleString()}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Members card */}
      <div style={{
        background: CARD, borderRadius: 20, padding: '20px 24px',
        flex: 1, overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        <div style={{ fontSize: 10, color: TEXT2, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 14 }}>
          Members · {members.length} people
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {members.slice(0, 7).map((m, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: '#f0f0f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, color: '#555',
                }}>
                  {m.name.slice(0, 2).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{m.name}</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: m.pending > 0 ? '#e53935' : '#2e7d32' }}>
                  {m.currency}{m.total.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
          {members.length > 7 && (
            <div style={{ fontSize: 11, color: TEXT2, textAlign: 'center', marginTop: 2 }}>
              +{members.length - 7} more
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Entry Card ──────────────────────────────────────────────────────────────
function EntryCardContent({ entry }) {
  const isPending = entry.status === 'pending'
  return (
    <div style={{
      width: 400, aspectRatio: '4/5',
      background: BG,
      borderRadius: 32, padding: 28,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={mascot} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: 10, color: TEXT2, letterSpacing: 2, textTransform: 'uppercase' }}>Payment Tracker</div>
            <div style={{ fontSize: 12, color: TEXT2, marginTop: 1 }}>{dayjs(entry.date).format('ddd, D MMM YYYY')}</div>
          </div>
        </div>
      </div>

      {/* Member card */}
      <div style={{
        background: CARD, borderRadius: 20, padding: '18px 24px', marginBottom: 12,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        <div style={{ fontSize: 10, color: TEXT2, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Member</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: '#f0f0f0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#555',
          }}>
            {entry.name.slice(0, 2).toUpperCase()}
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: TEXT }}>{entry.name}</span>
        </div>
      </div>

      {/* Item card */}
      <div style={{
        background: CARD, borderRadius: 20, padding: '18px 24px', marginBottom: 12,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      }}>
        <div style={{ fontSize: 10, color: TEXT2, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Item</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>{entry.menu || '—'}</div>
        {entry.description && (
          <div style={{ fontSize: 12, color: TEXT2, marginTop: 4 }}>{entry.description}</div>
        )}
      </div>

      {/* Amount card */}
      <div style={{
        background: CARD, borderRadius: 20, padding: '18px 24px',
        flex: 1,
        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 10, color: TEXT2, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Amount</div>
        <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: -2, color: isPending ? '#e53935' : '#2e7d32' }}>
          {entry.currency || '฿'}{entry.price.toLocaleString()}
        </div>
        <div style={{
          display: 'inline-flex', marginTop: 12,
          padding: '5px 14px', borderRadius: 20,
          background: isPending ? '#fff0f0' : '#f0fff4',
          color: isPending ? '#e53935' : '#2e7d32',
          fontSize: 12, fontWeight: 600, width: 'fit-content',
        }}>
          {isPending ? 'Pending' : entry.status === 'paid_qr' ? 'Paid · QR' : 'Paid · Cash'}
        </div>
      </div>
    </div>
  )
}

// ─── Main Modal ──────────────────────────────────────────────────────────────
export default function ShareCardModal({ type, data, onClose }) {
  const cardRef = useRef(null)
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    if (!cardRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, useCORS: true, backgroundColor: null,
      })
      const link = document.createElement('a')
      link.download = type === 'monthly'
        ? `payment-${data.monthLabel.replace(' ', '-')}.jpg`
        : `payment-${data.entry.name}-${data.entry.date}.jpg`
      link.href = canvas.toDataURL('image/jpeg', 0.95)
      link.click()
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      style={{ backdropFilter: 'blur(12px)' }}>
      <div className="flex flex-col items-center gap-4 w-full max-w-sm">

        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Image size={16} className="text-white/60" />
            <span className="text-white/80 text-sm font-medium">Preview</span>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white/60 hover:bg-white/20">
            <X size={14} />
          </button>
        </div>

        <div ref={cardRef} style={{ borderRadius: 32, overflow: 'hidden', width: '100%' }}>
          {type === 'monthly'
            ? <MonthlyCardContent {...data} />
            : <EntryCardContent {...data} />
          }
        </div>

        <button onClick={handleDownload} disabled={downloading}
          className="w-full flex items-center justify-center gap-2 bg-white text-gray-900 rounded-2xl py-3.5 font-semibold text-sm hover:bg-gray-100 transition-colors disabled:opacity-60">
          <Download size={16} />
          {downloading ? 'Saving...' : 'Save as JPEG'}
        </button>
      </div>
    </div>
  )
}
