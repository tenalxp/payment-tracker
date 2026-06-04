import { useState } from 'react'
import dayjs from 'dayjs'
import { ChevronLeft, ChevronRight, Trash2, X, CheckCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useMonthlyEntries } from '../hooks/useCoffeeEntries'
import { usePeople } from '../hooks/usePeople'
import { useItems } from '../hooks/useItems'
import { Avatar } from './MembersView'

const STATUS_CONFIG = {
  pending:   { label: 'Pending', cls: 'bg-red-50 text-red-500' },
  paid_qr:   { label: 'QR',      cls: 'bg-emerald-50 text-emerald-600' },
  paid_cash: { label: 'Cash',    cls: 'bg-blue-50 text-blue-600' },
}

const CURRENCIES = [
  { key: '', label: 'All' },
  { key: '฿', label: '฿ THB' },
  { key: '₭', label: '₭ KIP' },
  { key: '$', label: '$ USD' },
]

export default function MonthlyView() {
  const now = dayjs()
  const [year, setYear] = useState(now.year())
  const [month, setMonth] = useState(now.month() + 1)
  const { entries, loading, updateStatus } = useMonthlyEntries(year, month)
  const { people } = usePeople()
  const { items } = useItems()

  const [selectedCurrency, setSelectedCurrency] = useState('')
  const [selectedMember, setSelectedMember] = useState('')
  const [selectedItem, setSelectedItem] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [localEntries, setLocalEntries] = useState(null)

  const hasFilters = selectedCurrency || selectedMember || selectedItem
  const clearFilters = () => { setSelectedCurrency(''); setSelectedMember(''); setSelectedItem('') }
  const [markAllSaving, setMarkAllSaving] = useState(false)
  const [showMarkAll, setShowMarkAll] = useState(false)

  const handleMarkAll = async (status) => {
    if (!filtered.length) return
    setMarkAllSaving(true)
    setShowMarkAll(false)
    const ids = filtered.map(e => e.id)
    await supabase.from('coffee_entries').update({ status }).in('id', ids)
    setLocalEntries(prev => (prev ?? entries).map(e => ids.includes(e.id) ? { ...e, status } : e))
    setMarkAllSaving(false)
  }

  const allEntries = localEntries ?? entries

  const prevMonth = () => {
    setLocalEntries(null)
    if (month === 1) { setYear(y => y - 1); setMonth(12) }
    else setMonth(m => m - 1)
  }
  const nextMonth = () => {
    setLocalEntries(null)
    if (month === 12) { setYear(y => y + 1); setMonth(1) }
    else setMonth(m => m + 1)
  }

  const handleUpdateStatus = async (id, status) => {
    await updateStatus(id, status)
    setLocalEntries(prev => (prev ?? entries).map(e => e.id === id ? { ...e, status } : e))
  }

  const handleDelete = async (id) => {
    await supabase.from('coffee_entries').delete().eq('id', id)
    setLocalEntries(prev => (prev ?? entries).filter(e => e.id !== id))
    setConfirmDelete(null)
  }

  const filtered = allEntries.filter(e => {
    if (selectedCurrency && (e.currency || '฿') !== selectedCurrency) return false
    if (selectedMember && e.name !== selectedMember) return false
    if (selectedItem && e.menu !== selectedItem) return false
    return true
  })

  // Monthly summary
  const summary = filtered.reduce((acc, e) => {
    const cur = e.currency || '฿'
    if (!acc[cur]) acc[cur] = { total: 0, pending: 0, paid: 0 }
    acc[cur].total += e.price
    if (e.status === 'pending') acc[cur].pending += e.price
    else acc[cur].paid += e.price
    return acc
  }, {})

  // Group by person
  const byPerson = filtered.reduce((acc, e) => {
    if (!acc[e.name]) acc[e.name] = []
    acc[e.name].push(e)
    return acc
  }, {})

  const monthLabel = dayjs(`${year}-${String(month).padStart(2, '0')}-01`).format('MMMM YYYY')

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-4 flex flex-col gap-3">
        <h2 className="text-xl font-bold text-gray-900">Monthly</h2>

        {/* Month navigator */}
        <div className="flex items-center justify-between bg-gray-100 rounded-2xl px-2 py-1">
          <button onClick={prevMonth} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white transition-colors">
            <ChevronLeft size={18} className="text-gray-500" />
          </button>
          <span className="font-bold text-gray-800 text-sm">{monthLabel}</span>
          <button onClick={nextMonth} className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-white transition-colors">
            <ChevronRight size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Member + Item filter */}
        <div className="flex gap-2">
          <select
            value={selectedMember}
            onChange={e => setSelectedMember(e.target.value)}
            className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium border-0 outline-none ${
              selectedMember ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
            <option value="">All members</option>
            {people.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
          <select
            value={selectedItem}
            onChange={e => setSelectedItem(e.target.value)}
            className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium border-0 outline-none ${
              selectedItem ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
            <option value="">All items</option>
            {items.map(it => <option key={it.id} value={it.name}>{it.name}</option>)}
          </select>
          {hasFilters && (
            <button onClick={clearFilters}
              className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-200 shrink-0">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Currency filter */}
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {CURRENCIES.map(c => (
            <button key={c.key} onClick={() => setSelectedCurrency(c.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0 ${
                selectedCurrency === c.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-4 flex flex-col gap-4">
        {/* Summary bar */}
        {filtered.length > 0 && (
          <div className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: '0 4px 16px rgba(100,120,140,0.1)' }}>
            <div className="px-4 py-2 border-b border-gray-50 flex items-center justify-between">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                {monthLabel} · {filtered.length} entries
              </p>
              <div className="relative">
                <button
                  onClick={() => setShowMarkAll(v => !v)}
                  disabled={markAllSaving}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-xl text-xs font-medium hover:bg-gray-700 transition-colors">
                  <CheckCheck size={12} />
                  {markAllSaving ? 'Saving...' : 'Mark all'}
                </button>
                {showMarkAll && (
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-2xl shadow-xl z-20 overflow-hidden"
                    style={{ boxShadow: '0 8px 30px rgba(100,120,140,0.2)', minWidth: 140 }}>
                    {[
                      { key: 'pending', label: 'Pending', cls: 'text-red-500' },
                      { key: 'paid_qr', label: 'QR Paid', cls: 'text-emerald-600' },
                      { key: 'paid_cash', label: 'Cash Paid', cls: 'text-blue-600' },
                    ].map(s => (
                      <button key={s.key} onClick={() => handleMarkAll(s.key)}
                        className={`w-full px-4 py-3 text-left text-sm font-medium hover:bg-gray-50 transition-colors ${s.cls}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {Object.entries(summary).map(([cur, s]) => (
                <div key={cur} className="px-4 py-3 flex items-center justify-between gap-3">
                  <p className="text-base font-bold text-gray-800">{cur}{s.total.toLocaleString()}</p>
                  <div className="flex gap-3 text-right">
                    {s.pending > 0 && (
                      <div>
                        <p className="text-[10px] text-red-400 font-medium">Pending</p>
                        <p className="text-sm font-bold text-red-500">-{cur}{s.pending.toLocaleString()}</p>
                      </div>
                    )}
                    {s.paid > 0 && (
                      <div>
                        <p className="text-[10px] text-emerald-500 font-medium">Paid</p>
                        <p className="text-sm font-bold text-emerald-600">{cur}{s.paid.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Per-person cards */}
        {loading ? (
          <div className="text-center py-10 text-gray-300 text-sm">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl">
            <p className="text-gray-400 text-sm">No records this month</p>
          </div>
        ) : (
          Object.entries(byPerson).map(([name, items]) => {
            const person = people.find(p => p.name === name)
            const pendingAmt = items.filter(e => e.status === 'pending').reduce((s, e) => s + e.price, 0)
            const pendingCur = items.find(e => e.status === 'pending')?.currency || '฿'
            const total = items.reduce((s, e) => s + e.price, 0)
            const totalCur = items[0]?.currency || '฿'

            return (
              <div key={name} className="bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: '0 2px 12px rgba(100,120,140,0.08)' }}>
                {/* Person header */}
                <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-50">
                  <Avatar name={name} icon={person?.icon} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-900">{name}</p>
                    <p className="text-[10px] text-gray-400">{items.length} records</p>
                  </div>
                  <div className="text-right">
                    {pendingAmt > 0 && (
                      <div>
                        <p className="text-[10px] text-red-400 font-medium">Pending</p>
                        <p className="text-sm font-bold text-red-500">-{pendingCur}{pendingAmt.toLocaleString()}</p>
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400">Total {totalCur}{total.toLocaleString()}</p>
                  </div>
                </div>

                {/* Entries */}
                <div className="divide-y divide-gray-50">
                  {items.map(entry => {
                    const st = STATUS_CONFIG[entry.status] || STATUS_CONFIG.pending
                    return (
                      <div key={entry.id} className="px-4 py-3 flex items-center gap-3">
                        <p className="text-xs text-gray-400 w-14 shrink-0">
                          {dayjs(entry.date).format('D MMM')}
                        </p>
                        <p className="flex-1 text-sm text-gray-700 truncate">
                          {entry.menu || '—'}
                          {entry.description ? ` · ${entry.description}` : ''}
                        </p>
                        <p className="text-sm font-semibold text-gray-800 shrink-0">
                          {entry.currency || '฿'}{entry.price.toLocaleString()}
                        </p>
                        <select
                          value={entry.status}
                          onChange={e => handleUpdateStatus(entry.id, e.target.value)}
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer shrink-0 ${st.cls}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="paid_qr">QR</option>
                          <option value="paid_cash">Cash</option>
                        </select>
                        <button
                          onClick={() => setConfirmDelete(entry)}
                          className="w-6 h-6 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Delete confirm popup */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
          style={{ backdropFilter: 'blur(8px)' }}>
          <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-sm text-center"
            style={{ boxShadow: '0 20px 60px rgba(100,120,140,0.25)' }}>
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 size={20} className="text-red-400" />
            </div>
            <h3 className="font-bold text-gray-800">Delete this entry?</h3>
            <p className="text-sm text-gray-400 mt-1">
              {confirmDelete.name} · {confirmDelete.menu || '—'} · {confirmDelete.currency || '฿'}{confirmDelete.price.toLocaleString()}
            </p>
            <p className="text-xs text-gray-300 mt-1">{dayjs(confirmDelete.date).format('D MMM YYYY')}</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 text-gray-600 hover:bg-gray-50 transition-colors text-sm">
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDelete.id)}
                className="flex-1 bg-red-400 hover:bg-red-500 text-white rounded-xl py-2.5 font-medium transition-colors text-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
