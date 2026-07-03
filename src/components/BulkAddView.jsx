import { useState } from 'react'
import dayjs from 'dayjs'
import { Plus, Trash2, CheckCircle2 } from 'lucide-react'
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
function ByMemberMode({ people, items, dirtyRef }) {
  const [selectedMember, setSelectedMember] = useState(null)
  const [selectedItem, setSelectedItem] = useState('')
  const [currency, setCurrency] = useState('฿')
  const [rows, setRows] = useState([newMemberRow()])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const setDirty = (val) => { if (dirtyRef) dirtyRef.current = val }

  const addRow = () => { setRows(prev => [...prev, newMemberRow()]); setDirty(true) }
  const updateRow = (id, field, value) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
    setDirty(true)
  }
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
    setDirty(false)
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
              saved ? 'bg-emerald-400 text-white' : canSave ? 'text-teal-700 hover:opacity-80' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
            style={canSave && !saved ? { background: 'linear-gradient(135deg, #b2e8d8 0%, #a8d8ea 100%)' } : {}}>
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
function ByDayMode({ people, items, dirtyRef }) {
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'))
  const [selectedItem, setSelectedItem] = useState('')
  const [currency, setCurrency] = useState('฿')
  const [rows, setRows] = useState([newDayRow()])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const setDirty = (val) => { if (dirtyRef) dirtyRef.current = val }

  const addRow = () => { setRows(prev => [...prev, newDayRow()]); setDirty(true) }
  const updateRow = (id, field, value) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
    setDirty(true)
  }
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
    setDirty(false)
    setTimeout(() => { setSaved(false); setRows([newDayRow()]) }, 1500)
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
              saved ? 'bg-emerald-400 text-white' : canSave ? 'text-teal-700 hover:opacity-80' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
            style={canSave && !saved ? { background: 'linear-gradient(135deg, #b2e8d8 0%, #a8d8ea 100%)' } : {}}>
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
      <div className="px-5 pb-8">
        <button onClick={addRow}
          className="w-full flex items-center gap-2 justify-center py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors">
          <Plus size={15} /><span className="text-sm">Add member</span>
        </button>
      </div>
    </>
  )
}

// ────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────
export default function BulkAddView({ dirtyRef }) {
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
        ? <ByMemberMode people={people} items={items} dirtyRef={dirtyRef} />
        : <ByDayMode people={people} items={items} dirtyRef={dirtyRef} />
      }
    </div>
  )
}
