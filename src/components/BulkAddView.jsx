import { useState } from 'react'
import dayjs from 'dayjs'
import { Plus, Trash2, CheckCircle2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { usePeople } from '../hooks/usePeople'
import { useItems } from '../hooks/useItems'
import { Avatar } from './MembersView'

const CURRENCIES = [
  { key: '฿', label: '฿ THB' },
  { key: '₭', label: '₭ KIP' },
  { key: '$', label: '$ USD' },
]

const newMemberRow = () => ({
  id: crypto.randomUUID(),
  date: dayjs().format('YYYY-MM-DD'),
  price: '',
})

const newDayRow = () => ({
  id: crypto.randomUUID(),
  personId: '',
  price: '',
})

// ────────────────────────────────────────────
// BY MEMBER MODE
// ────────────────────────────────────────────
function ByMemberMode({ people, items }) {
  const [selectedMember, setSelectedMember] = useState(null)
  const [selectedItem, setSelectedItem] = useState('')
  const [currency, setCurrency] = useState('฿')
  const [rows, setRows] = useState([newMemberRow()])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const addRow = () => setRows(prev => [...prev, newMemberRow()])
  const updateRow = (id, field, value) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  const removeRow = (id) =>
    setRows(prev => prev.length > 1 ? prev.filter(r => r.id !== id) : prev)

  const total = rows.reduce((sum, r) => sum + (parseFloat(r.price) || 0), 0)
  const validRows = rows.filter(r => r.date && parseFloat(r.price) > 0)
  const canSave = selectedMember && selectedItem && validRows.length > 0

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    const inserts = validRows.map(r => ({
      name: selectedMember.name,
      menu: selectedItem,
      currency,
      price: parseFloat(r.price),
      date: r.date,
      status: 'pending',
    }))
    await supabase.from('coffee_entries').insert(inserts)
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); setRows([newMemberRow()]) }, 1500)
  }

  return (
    <>
      {/* Member picker */}
      <div className="bg-white px-5 pb-4 flex flex-col gap-4">
        <div>
          <p className="text-[10px] text-gray-400 font-medium mb-2 px-1">Member</p>
          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {people.map(p => (
              <button key={p.id} onClick={() => setSelectedMember(p)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all shrink-0 ${
                  selectedMember?.id === p.id ? 'bg-gray-900' : 'bg-gray-100 hover:bg-gray-200'}`}>
                <Avatar name={p.name} icon={p.icon} size="sm" />
                <span className={`text-[10px] font-medium ${selectedMember?.id === p.id ? 'text-white' : 'text-gray-600'}`}>
                  {p.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 font-medium mb-2 px-1">Item</p>
            <select value={selectedItem} onChange={e => setSelectedItem(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-sm font-medium border-0 outline-none ${
                selectedItem ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
              <option value="">Select item...</option>
              {items.map(it => <option key={it.id} value={it.name}>{it.name}</option>)}
            </select>
          </div>
          <div className="shrink-0">
            <p className="text-[10px] text-gray-400 font-medium mb-2 px-1">Currency</p>
            <div className="flex gap-1">
              {CURRENCIES.map(c => (
                <button key={c.key} onClick={() => setCurrency(c.key)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    currency === c.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {c.key}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="px-5 pt-4 pb-3">
        <div className="bg-white rounded-2xl px-5 py-4" style={{ boxShadow: '0 4px 20px rgba(100,120,140,0.12)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] text-gray-400 font-medium">Total · {validRows.length} entries</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{currency}{total.toLocaleString()}</p>
            </div>
            {selectedMember && (
              <div className="flex items-center gap-2">
                <Avatar name={selectedMember.name} icon={selectedMember.icon} size="sm" />
                <div>
                  <p className="text-xs font-semibold text-gray-700">{selectedMember.name}</p>
                  {selectedItem && <p className="text-[10px] text-gray-400">{selectedItem}</p>}
                </div>
              </div>
            )}
          </div>
          <button onClick={handleSave} disabled={!canSave || saving}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              saved ? 'bg-emerald-500 text-white' : canSave ? 'bg-gray-900 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
            {saved ? <><CheckCircle2 size={16} /> Saved!</> : saving ? 'Saving...' : `Save ${validRows.length} ${validRows.length === 1 ? 'entry' : 'entries'}`}
          </button>
        </div>
      </div>

      {/* Rows */}
      <div className="px-5 pb-2 flex flex-col gap-2">
        {rows.map((row, idx) => (
          <div key={row.id} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3">
            <span className="text-xs text-gray-300 font-medium w-5 text-center">{idx + 1}</span>
            <input type="date" value={row.date} onChange={e => updateRow(row.id, 'date', e.target.value)}
              className="flex-1 bg-gray-100 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none" />
            <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2 gap-1 w-28">
              <span className="text-xs text-gray-400">{currency}</span>
              <input type="number" placeholder="0" value={row.price} onChange={e => updateRow(row.id, 'price', e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-gray-800 outline-none" />
            </div>
            <button onClick={() => removeRow(row.id)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="px-5 pb-8">
        <button onClick={addRow}
          className="w-full flex items-center gap-2 justify-center py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors">
          <Plus size={15} /><span className="text-sm">Add row</span>
        </button>
      </div>
    </>
  )
}

// ────────────────────────────────────────────
// BY DAY MODE
// ────────────────────────────────────────────
function ByDayMode({ people, items }) {
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [selectedItem, setSelectedItem] = useState('')
  const [currency, setCurrency] = useState('฿')
  const [rows, setRows] = useState([newDayRow()])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Summary/Calculate state
  const [sumMembers, setSumMembers] = useState([])
  const [sumFrom, setSumFrom] = useState('')
  const [sumTo, setSumTo] = useState('')
  const [sumResult, setSumResult] = useState(null)
  const [calculating, setCalculating] = useState(false)
  const [confirmSaving, setConfirmSaving] = useState(false)
  const [confirmSaved, setConfirmSaved] = useState(false)

  const addRow = () => setRows(prev => [...prev, newDayRow()])
  const updateRow = (id, field, value) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  const removeRow = (id) =>
    setRows(prev => prev.length > 1 ? prev.filter(r => r.id !== id) : prev)

  const validRows = rows.filter(r => r.personId && parseFloat(r.price) > 0)
  const total = validRows.reduce((sum, r) => sum + (parseFloat(r.price) || 0), 0)
  const canSave = selectedItem && validRows.length > 0

  const handleSave = async () => {
    if (!canSave) return
    setSaving(true)
    const inserts = validRows.map(r => {
      const person = people.find(p => p.id === r.personId)
      return { name: person.name, menu: selectedItem, currency, price: parseFloat(r.price), date, status: 'pending' }
    })
    await supabase.from('coffee_entries').insert(inserts)
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); setRows([newDayRow()]) }, 1500)
  }

  const toggleSumMember = (id) =>
    setSumMembers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])

  const handleCalculate = async () => {
    if (!sumFrom || !sumTo || sumMembers.length === 0 || !selectedItem) return
    setCalculating(true)
    const names = sumMembers.map(id => people.find(p => p.id === id)?.name).filter(Boolean)
    const { data } = await supabase
      .from('coffee_entries')
      .select('*')
      .in('name', names)
      .eq('menu', selectedItem)
      .eq('currency', currency)
      .gte('date', sumFrom)
      .lte('date', sumTo)
    // group by name
    const grouped = {}
    for (const e of data || []) {
      if (!grouped[e.name]) grouped[e.name] = { total: 0, count: 0, person: people.find(p => p.name === e.name) }
      grouped[e.name].total += e.price
      grouped[e.name].count += 1
    }
    setSumResult(grouped)
    setCalculating(false)
  }

  const handleConfirmSave = async () => {
    if (!sumResult) return
    setConfirmSaving(true)
    const inserts = Object.entries(sumResult).map(([name, s]) => ({
      name,
      menu: selectedItem,
      currency,
      price: s.total,
      date: sumTo,
      status: 'pending',
    }))
    await supabase.from('coffee_entries').insert(inserts)
    setConfirmSaving(false)
    setConfirmSaved(true)
    setTimeout(() => { setConfirmSaved(false); setSumResult(null) }, 1500)
  }

  return (
    <>
      {/* Header settings */}
      <div className="bg-white px-5 pb-4 flex flex-col gap-3">
        <div>
          <p className="text-[10px] text-gray-400 font-medium mb-1 px-1">Date</p>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full bg-gray-100 rounded-xl px-3 py-2 text-sm text-gray-700 outline-none" />
        </div>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 font-medium mb-1 px-1">Item</p>
            <select value={selectedItem} onChange={e => setSelectedItem(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl text-sm font-medium border-0 outline-none ${
                selectedItem ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
              <option value="">Select item...</option>
              {items.map(it => <option key={it.id} value={it.name}>{it.name}</option>)}
            </select>
          </div>
          <div className="shrink-0">
            <p className="text-[10px] text-gray-400 font-medium mb-1 px-1">Currency</p>
            <div className="flex gap-1">
              {CURRENCIES.map(c => (
                <button key={c.key} onClick={() => setCurrency(c.key)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    currency === c.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {c.key}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary card */}
      <div className="px-5 pt-4 pb-3">
        <div className="bg-white rounded-2xl px-5 py-4" style={{ boxShadow: '0 4px 20px rgba(100,120,140,0.12)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] text-gray-400 font-medium">Total · {validRows.length} members</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">{currency}{total.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-700">{dayjs(date).format('D MMM YYYY')}</p>
              {selectedItem && <p className="text-[10px] text-gray-400">{selectedItem}</p>}
            </div>
          </div>
          <button onClick={handleSave} disabled={!canSave || saving}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
              saved ? 'bg-emerald-500 text-white' : canSave ? 'bg-gray-900 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
            {saved ? <><CheckCircle2 size={16} /> Saved!</> : saving ? 'Saving...' : `Save ${validRows.length} ${validRows.length === 1 ? 'entry' : 'entries'}`}
          </button>
        </div>
      </div>

      {/* Rows: member + price */}
      <div className="px-5 pb-2 flex flex-col gap-2">
        {rows.map((row, idx) => (
          <div key={row.id} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3">
            <span className="text-xs text-gray-300 font-medium w-5 text-center">{idx + 1}</span>
            <select value={row.personId} onChange={e => updateRow(row.id, 'personId', e.target.value)}
              className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border-0 outline-none ${
                row.personId ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
              <option value="">Select member...</option>
              {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <div className="flex items-center bg-gray-100 rounded-xl px-3 py-2 gap-1 w-28">
              <span className="text-xs text-gray-400">{currency}</span>
              <input type="number" placeholder="0" value={row.price} onChange={e => updateRow(row.id, 'price', e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-gray-800 outline-none" />
            </div>
            <button onClick={() => removeRow(row.id)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <div className="px-5 pb-6">
        <button onClick={addRow}
          className="w-full flex items-center gap-2 justify-center py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors">
          <Plus size={15} /><span className="text-sm">Add member</span>
        </button>
      </div>

      {/* ── Calculate Summary ── */}
      <div className="px-5 pb-8">
        <div className="bg-white rounded-2xl px-5 py-4 flex flex-col gap-3" style={{ boxShadow: '0 4px 20px rgba(100,120,140,0.12)' }}>
          <p className="text-xs font-bold text-gray-700">Calculate Summary</p>

          {/* Select members */}
          <div>
            <p className="text-[10px] text-gray-400 mb-2">Select members</p>
            <div className="flex gap-2 flex-wrap">
              {people.map(p => (
                <button key={p.id} onClick={() => toggleSumMember(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    sumMembers.includes(p.id) ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <Avatar name={p.name} icon={p.icon} size="xs" />
                  {p.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="flex gap-2">
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 mb-1">From</p>
              <input type="date" value={sumFrom} onChange={e => setSumFrom(e.target.value)}
                className="w-full bg-gray-100 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-gray-400 mb-1">To</p>
              <input type="date" value={sumTo} onChange={e => setSumTo(e.target.value)}
                className="w-full bg-gray-100 rounded-xl px-3 py-2 text-xs text-gray-700 outline-none" />
            </div>
          </div>

          <button onClick={handleCalculate}
            disabled={!sumFrom || !sumTo || sumMembers.length === 0 || !selectedItem || calculating}
            className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
              sumFrom && sumTo && sumMembers.length > 0 && selectedItem
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
            {calculating ? 'Calculating...' : 'Calculate'}
          </button>
        </div>
      </div>

      {/* Result popup */}
      {sumResult && (
        <div className="fixed inset-0 bg-black/30 flex items-end justify-center z-50 p-4 pb-8"
          style={{ backdropFilter: 'blur(8px)' }}>
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden"
            style={{ boxShadow: '0 20px 60px rgba(100,120,140,0.3)' }}>
            <div className="px-5 pt-5 pb-3 flex items-center justify-between border-b border-gray-50">
              <div>
                <p className="font-bold text-gray-900">Summary</p>
                <p className="text-[10px] text-gray-400">{selectedItem} · {currency} · {sumFrom} → {sumTo}</p>
              </div>
              <button onClick={() => setSumResult(null)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                <X size={14} />
              </button>
            </div>

            <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
              {Object.entries(sumResult).length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-8">No entries found</p>
              ) : Object.entries(sumResult).map(([name, s]) => (
                <div key={name} className="flex items-center gap-3 px-5 py-3">
                  <Avatar name={name} icon={s.person?.icon} size="sm" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{name}</p>
                    <p className="text-[10px] text-gray-400">{s.count} entries</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{currency}{s.total.toLocaleString()}</p>
                </div>
              ))}
            </div>

            {Object.entries(sumResult).length > 0 && (
              <div className="px-5 py-4 border-t border-gray-50">
                <button onClick={handleConfirmSave} disabled={confirmSaving}
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    confirmSaved ? 'bg-emerald-500 text-white' : 'bg-gray-900 text-white hover:bg-gray-700'}`}>
                  {confirmSaved ? <><CheckCircle2 size={16} /> Saved to History!</> : confirmSaving ? 'Saving...' : 'Confirm & Save to History'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────
export default function BulkAddView() {
  const { people } = usePeople()
  const { items } = useItems()
  const [mode, setMode] = useState('member')

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white px-5 pt-14 pb-4 flex flex-col gap-3">
        <h2 className="text-xl font-bold text-gray-900">Bulk Add</h2>

        {/* Mode toggle */}
        <div className="flex bg-gray-100 rounded-2xl p-1">
          <button onClick={() => setMode('member')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === 'member' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
            By Member
          </button>
          <button onClick={() => setMode('day')}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === 'day' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400'}`}>
            By Day
          </button>
        </div>
      </div>

      {mode === 'member'
        ? <ByMemberMode people={people} items={items} />
        : <ByDayMode people={people} items={items} />
      }
    </div>
  )
}
