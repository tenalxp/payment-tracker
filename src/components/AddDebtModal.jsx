import { useState } from 'react'
import { X, Plus, UserPlus } from 'lucide-react'
import { useItems } from '../hooks/useItems'
import { supabase } from '../lib/supabase'
import { Avatar } from './MembersView'
import dayjs from 'dayjs'

const CURRENCIES = ['฿', '₭', '$']

export default function AddDebtModal({ person, onClose, onSuccess }) {
  const { items, addItem } = useItems()
  const [form, setForm] = useState({
    item: '',
    date: dayjs().format('YYYY-MM-DD'),
    amount: '',
    currency: '฿',
    description: '',
  })
  const [addingItem, setAddingItem] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSelectItem = (e) => {
    if (e.target.value === '__new__') {
      setAddingItem(true)
      setForm(f => ({ ...f, item: '' }))
    } else {
      setForm(f => ({ ...f, item: e.target.value }))
    }
  }

  const confirmNewItem = async () => {
    const trimmed = newItemName.trim()
    if (!trimmed) return
    await addItem(trimmed)
    setForm(f => ({ ...f, item: trimmed }))
    setNewItemName('')
    setAddingItem(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.item || !form.amount) return
    setSaving(true)
    const { error } = await supabase.from('coffee_entries').insert([{
      name: person.name,
      date: form.date,
      menu: form.item,
      price: parseFloat(form.amount),
      currency: form.currency,
      description: form.description.trim() || null,
      status: 'pending',
    }])
    setSaving(false)
    if (!error) { onSuccess?.(); onClose() }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b">
          <Avatar name={person.name} size="sm" />
          <div>
            <div className="font-bold text-gray-800">{person.name}</div>
            <div className="text-xs text-gray-400">เพิ่มรายการค้างจ่าย</div>
          </div>
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Item type */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ค้างจ่าย *</label>
            {!addingItem ? (
              <select
                value={form.item}
                onChange={handleSelectItem}
                required
                className="border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
              >
                <option value="">เลือกประเภท</option>
                {items.map(it => (
                  <option key={it.id} value={it.name}>{it.name}</option>
                ))}
                <option value="__new__">➕ เพิ่มประเภทใหม่...</option>
              </select>
            ) : (
              <div className="flex gap-2">
                <input
                  autoFocus
                  type="text"
                  placeholder="ชื่อประเภทใหม่"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), confirmNewItem())}
                  className="flex-1 border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
                <button type="button" onClick={confirmNewItem} className="bg-gray-900 text-white px-3 rounded-xl hover:bg-gray-700">
                  <Plus size={16} />
                </button>
                <button type="button" onClick={() => { setAddingItem(false); setNewItemName('') }} className="text-gray-400 hover:text-gray-600 px-2">
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">วันที่ *</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              required
              className="border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          {/* Amount + Currency */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">จำนวนเงิน *</label>
            <div className="flex gap-2">
              <div className="flex border rounded-xl overflow-hidden">
                {CURRENCIES.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, currency: c }))}
                    className={`px-3 py-2.5 text-sm font-bold transition-colors ${
                      form.currency === c
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="0"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                required
                min="0"
                step="0.01"
                className="flex-1 border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">หมายเหตุ</label>
            <input
              type="text"
              placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={saving || !form.item || !form.amount || addingItem}
            className="bg-gray-900 hover:bg-gray-700 text-white rounded-xl py-3 font-semibold transition-colors disabled:opacity-30 mt-1"
          >
            {saving ? 'กำลังบันทึก...' : 'บันทึกรายการ'}
          </button>
        </form>
      </div>
    </div>
  )
}
