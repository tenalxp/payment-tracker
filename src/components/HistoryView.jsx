import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { supabase } from '../lib/supabase'
import { Avatar } from './MembersView'

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   cls: 'bg-red-50 text-red-500' },
  paid_qr:   { label: 'QR',        cls: 'bg-emerald-50 text-emerald-600' },
  paid_cash: { label: 'Cash',      cls: 'bg-blue-50 text-blue-600' },
}

export default function HistoryView() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      let q = supabase
        .from('coffee_entries')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
      if (filter !== 'all') q = q.eq('status', filter)
      const { data } = await q
      setEntries(data || [])
      setLoading(false)
    }
    fetch()
  }, [filter])

  const updateStatus = async (id, status) => {
    await supabase.from('coffee_entries').update({ status }).eq('id', id)
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status } : e))
  }

  // group by date
  const grouped = entries.reduce((acc, e) => {
    const key = e.date
    if (!acc[key]) acc[key] = []
    acc[key].push(e)
    return acc
  }, {})

  const FILTERS = [
    { key: 'all',       label: 'All' },
    { key: 'pending',   label: 'Pending' },
    { key: 'paid_qr',   label: 'QR' },
    { key: 'paid_cash', label: 'Cash' },
  ]

  return (
    <div className="bg-[#F2F2F7] min-h-screen">
      <div className="bg-white px-5 pt-14 pb-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">History</h2>
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f.key
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 flex flex-col gap-5">
        {loading ? (
          <div className="text-center py-10 text-gray-300 text-sm">Loading...</div>
        ) : entries.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl">
            <p className="text-gray-400 text-sm">No records found</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                {dayjs(date).format('ddd, D MMM YYYY')}
              </p>
              <div className="bg-white rounded-2xl overflow-hidden divide-y divide-gray-50">
                {items.map(entry => {
                  const st = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending
                  return (
                    <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                      <Avatar name={entry.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">{entry.name}</p>
                        <p className="text-xs text-gray-400 truncate">{entry.menu || '—'}{entry.description ? ` · ${entry.description}` : ''}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {entry.currency || '฿'}{entry.price.toLocaleString()}
                        </p>
                        <select
                          value={entry.status}
                          onChange={e => updateStatus(entry.id, e.target.value)}
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer mt-0.5 ${st.cls}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid_qr">QR</option>
                          <option value="paid_cash">Cash</option>
                        </select>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
