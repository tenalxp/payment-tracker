import { useState, useEffect } from 'react'
import dayjs from 'dayjs'
import { Search, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useItems } from '../hooks/useItems'
import { usePeople } from '../hooks/usePeople'
import { Avatar } from './MembersView'

const STATUS_CONFIG = {
  pending:   { label: 'Pending', cls: 'bg-red-50 text-red-500' },
  paid_qr:   { label: 'QR',      cls: 'bg-emerald-50 text-emerald-600' },
  paid_cash: { label: 'Cash',    cls: 'bg-blue-50 text-blue-600' },
}

const STATUS_FILTERS = [
  { key: 'all',       label: 'All' },
  { key: 'pending',   label: 'Pending' },
  { key: 'paid_qr',   label: 'QR' },
  { key: 'paid_cash', label: 'Cash' },
]

export default function HistoryView() {
  const { people } = usePeople()
  const { items } = useItems()

  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  // filters
  const [status, setStatus] = useState('all')
  const [memberSearch, setMemberSearch] = useState('')
  const [selectedMember, setSelectedMember] = useState('')
  const [selectedItem, setSelectedItem] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showMemberDrop, setShowMemberDrop] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      let q = supabase
        .from('coffee_entries')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
      if (status !== 'all') q = q.eq('status', status)
      if (selectedMember) q = q.eq('name', selectedMember)
      if (selectedItem) q = q.eq('menu', selectedItem)
      if (dateFrom) q = q.gte('date', dateFrom)
      if (dateTo) q = q.lte('date', dateTo)
      const { data } = await q
      setEntries(data || [])
      setLoading(false)
    }
    fetch()
  }, [status, selectedMember, selectedItem, dateFrom, dateTo])

  const updateStatus = async (id, s) => {
    await supabase.from('coffee_entries').update({ status: s }).eq('id', id)
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status: s } : e))
  }

  const clearAll = () => {
    setStatus('all'); setSelectedMember(''); setSelectedItem('')
    setDateFrom(''); setDateTo(''); setMemberSearch('')
  }

  const hasFilters = status !== 'all' || selectedMember || selectedItem || dateFrom || dateTo

  const grouped = entries.reduce((acc, e) => {
    if (!acc[e.date]) acc[e.date] = []
    acc[e.date].push(e)
    return acc
  }, {})

  const filteredPeople = people.filter(p =>
    p.name.toLowerCase().includes(memberSearch.toLowerCase())
  )

  return (
    <div className="bg-[#F2F2F7] min-h-screen">
      <div className="bg-white px-5 pt-14 pb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">History</h2>
          {hasFilters && (
            <button onClick={clearAll} className="text-xs text-gray-400 flex items-center gap-1 hover:text-gray-600">
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Member search */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search member..."
              value={selectedMember || memberSearch}
              onChange={e => { setMemberSearch(e.target.value); setSelectedMember(''); setShowMemberDrop(true) }}
              onFocus={() => setShowMemberDrop(true)}
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
            />
            {(selectedMember || memberSearch) && (
              <button onClick={() => { setSelectedMember(''); setMemberSearch(''); setShowMemberDrop(false) }}>
                <X size={13} className="text-gray-400" />
              </button>
            )}
          </div>
          {showMemberDrop && !selectedMember && filteredPeople.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white rounded-xl shadow-lg mt-1 z-10 overflow-hidden border border-gray-100">
              {filteredPeople.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setSelectedMember(p.name); setMemberSearch(''); setShowMemberDrop(false) }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left"
                >
                  <Avatar name={p.name} icon={p.icon} size="sm" />
                  <span className="text-sm text-gray-700">{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date range */}
        <div className="flex gap-2">
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 mb-1 px-1">From</p>
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full bg-gray-100 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none"
            />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 mb-1 px-1">To</p>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="w-full bg-gray-100 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none"
            />
          </div>
        </div>

        {/* Item + Status filters */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
          {/* Item dropdown */}
          <select
            value={selectedItem}
            onChange={e => setSelectedItem(e.target.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border-0 outline-none shrink-0 ${
              selectedItem ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
            }`}
          >
            <option value="">All items</option>
            {items.map(it => <option key={it.id} value={it.name}>{it.name}</option>)}
          </select>

          {/* Status pills */}
          {STATUS_FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setStatus(f.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                status === f.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'
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
                      <Avatar name={entry.name} icon={people.find(p => p.name === entry.name)?.icon} size="sm" />
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
