import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { X, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Avatar } from './MembersView'
import AddDebtModal from './AddDebtModal'

const STATUS_CONFIG = {
  pending:   { label: 'Pending', cls: 'bg-red-50 text-red-500' },
  paid_qr:   { label: 'QR',      cls: 'bg-emerald-50 text-emerald-600' },
  paid_cash: { label: 'Cash',    cls: 'bg-blue-50 text-blue-600' },
}

export default function PersonHistoryModal({ person, onClose, onUpdate }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)

  const fetchEntries = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('coffee_entries')
      .select('*')
      .eq('name', person.name)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
    setEntries(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchEntries() }, [person.name])

  const updateStatus = async (id, status) => {
    await supabase.from('coffee_entries').update({ status }).eq('id', id)
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status } : e))
    onUpdate?.()
  }

  const totalPending = entries
    .filter(e => e.status === 'pending')
    .reduce((acc, e) => {
      const c = e.currency || '฿'
      acc[c] = (acc[c] || 0) + e.price
      return acc
    }, {})

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F2F7] flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar name={person.name} icon={person.icon} size="sm" />
            <div>
              <p className="font-semibold text-gray-900">{person.name}</p>
              <p className="text-xs text-gray-400">{entries.length} records</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdd(true)}
              className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
            >
              <Plus size={15} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Pending summary chips */}
        {Object.keys(totalPending).length > 0 && (
          <div className="flex gap-2">
            {Object.entries(totalPending).map(([cur, amt]) => (
              <div key={cur} className="bg-red-50 rounded-xl px-3 py-2">
                <p className="text-[10px] text-red-400 font-medium">Pending</p>
                <p className="text-sm font-bold text-red-500">-{cur}{amt.toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {loading ? (
          <div className="text-center py-10 text-gray-300 text-sm">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl">
            <p className="text-gray-400 text-sm">No records yet</p>
          </div>
        ) : (
          entries.map(entry => {
            const st = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending
            return (
              <div key={entry.id} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{entry.menu || '—'}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-gray-400">{dayjs(entry.date).format('D MMM YYYY')}</p>
                    {entry.description && (
                      <p className="text-xs text-gray-400 truncate">· {entry.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <p className="text-sm font-bold text-gray-900">
                    {entry.currency || '฿'}{entry.price.toLocaleString()}
                  </p>

                  <select
                    value={entry.status}
                    onChange={e => updateStatus(entry.id, e.target.value)}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer ${st.cls}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid_qr">QR</option>
                    <option value="paid_cash">Cash</option>
                  </select>
                </div>
              </div>
            )
          })
        )}
      </div>

      {showAdd && (
        <AddDebtModal
          person={person}
          onClose={() => setShowAdd(false)}
          onSuccess={() => { setShowAdd(false); fetchEntries(); onUpdate?.() }}
        />
      )}
    </div>
  )
}
