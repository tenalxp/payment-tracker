import { useState, useEffect } from 'react'
import { Plus, Trash2, X, Check, Users, Calendar, Receipt, Pencil } from 'lucide-react'
import dayjs from 'dayjs'

const STORAGE_KEY = 'shared_expenses'
const CURRENCIES = ['฿', '₭', '$']

const load = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
const save = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

// ── Form Modal (create + edit) ─────────────────────────────────────────────
function ExpenseFormModal({ expense, onClose, onSave }) {
  const isEdit = !!expense
  const [title, setTitle] = useState(expense?.title || '')
  const [date, setDate] = useState(expense?.date || dayjs().format('YYYY-MM-DD'))
  const [price, setPrice] = useState(expense?.price?.toString() || '')
  const [currency, setCurrency] = useState(expense?.currency || '฿')
  const [memberInput, setMemberInput] = useState('')
  const [members, setMembers] = useState(expense?.members?.map(m => m.name) || [])

  const addMember = () => {
    const name = memberInput.trim()
    if (!name || members.includes(name)) return
    setMembers(prev => [...prev, name])
    setMemberInput('')
  }

  const removeMember = (name) => setMembers(prev => prev.filter(m => m !== name))

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addMember() }
  }

  const canSave = title.trim() && price && members.length > 0

  const handleSave = () => {
    if (!canSave) return
    if (isEdit) {
      // preserve paid status for existing members, reset for new members
      const prevMap = Object.fromEntries((expense.members || []).map(m => [m.name, m.paid]))
      onSave({
        ...expense,
        title: title.trim(),
        date,
        price: parseFloat(price),
        currency,
        members: members.map(name => ({ name, paid: prevMap[name] ?? false })),
      })
    } else {
      onSave({
        id: Date.now().toString(),
        title: title.trim(),
        date,
        price: parseFloat(price),
        currency,
        members: members.map(name => ({ name, paid: false })),
        createdAt: new Date().toISOString(),
      })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      style={{ backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-md bg-white rounded-3xl flex flex-col"
        style={{ boxShadow: '0 20px 60px rgba(100,120,140,0.25)', maxHeight: '88vh' }}>
        <div className="px-5 pt-5 pb-6 overflow-y-auto flex-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">
              {isEdit ? 'Edit Expense' : 'New Shared Expense'}
            </h2>
            <button onClick={onClose}
              className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200">
              <X size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {/* Title */}
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 px-1">Title</p>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Dinner at Lao Kitchen"
                className="w-full bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-800 outline-none placeholder-gray-300"
              />
            </div>

            {/* Date */}
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 px-1">Date</p>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-700 outline-none"
              />
            </div>

            {/* Price + Currency */}
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 px-1">Total Amount</p>
              <div className="flex gap-2">
                <div className="flex gap-1">
                  {CURRENCIES.map(c => (
                    <button key={c} onClick={() => setCurrency(c)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${currency === c ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {c}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="0"
                  className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-800 outline-none placeholder-gray-300"
                />
              </div>
            </div>

            {/* Members */}
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1.5 px-1">Members</p>
              <div className="flex gap-2 mb-2">
                <input
                  value={memberInput}
                  onChange={e => setMemberInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type name and press +"
                  className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-800 outline-none placeholder-gray-300"
                />
                <button onClick={addMember}
                  className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shrink-0 hover:bg-gray-700 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              {members.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {members.map(name => (
                    <div key={name} className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5">
                      <span className="text-xs font-medium text-gray-700">{name}</span>
                      <button onClick={() => removeMember(name)} className="text-gray-400 hover:text-red-400 transition-colors">
                        <X size={11} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {members.length > 0 && price && (
                <p className="text-xs text-gray-400 mt-2 px-1">
                  {currency}{Math.ceil(parseFloat(price) / members.length).toLocaleString()} / person
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`w-full mt-5 py-3.5 rounded-2xl font-semibold text-sm transition-all ${canSave ? 'bg-gray-900 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
            {isEdit ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Expense Card ───────────────────────────────────────────────────────────
function ExpenseCard({ expense, onTogglePaid, onConfirmDelete, onEdit }) {
  const perPerson = expense.price / expense.members.length
  const paidCount = expense.members.filter(m => m.paid).length

  return (
    <div className="bg-white rounded-3xl overflow-hidden"
      style={{ boxShadow: '0 4px 20px rgba(100,120,140,0.1)', border: '1px solid rgba(255,255,255,0.9)' }}>

      {/* Header */}
      <div className="px-5 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 truncate">{expense.title}</p>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-gray-400">
                <Calendar size={11} />
                <span className="text-[11px]">{dayjs(expense.date).format('D MMM YYYY')}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400">
                <Users size={11} />
                <span className="text-[11px]">{expense.members.length} people</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => onEdit(expense)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:text-blue-400 hover:bg-blue-50 transition-colors">
              <Pencil size={12} />
            </button>
            <button onClick={() => onConfirmDelete(expense.id)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Amount */}
        <div className="flex items-end justify-between mt-3 pt-3 border-t border-gray-50">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Total</p>
            <p className="text-xl font-bold" style={{ color: '#d95c5c' }}>
              {expense.currency}{expense.price.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">Per person</p>
            <p className="text-base font-bold text-gray-700">
              {expense.currency}{Math.ceil(perPerson).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 pb-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-gray-400">{paidCount}/{expense.members.length} paid</span>
          <span className="text-[10px] font-medium" style={{ color: paidCount === expense.members.length ? '#10b981' : '#8A9BAA' }}>
            {paidCount === expense.members.length ? 'All settled ✓' : `${expense.members.length - paidCount} pending`}
          </span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(paidCount / expense.members.length) * 100}%`, background: 'linear-gradient(90deg, #6ee7b7, #34d399)' }} />
        </div>
      </div>

      {/* Members list */}
      <div className="px-4 py-2 flex flex-col gap-0.5">
        {expense.members.map((member, i) => (
          <button
            key={i}
            onClick={() => onTogglePaid(expense.id, i)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all active:scale-95"
            style={{ background: member.paid ? 'rgba(16,185,129,0.06)' : 'transparent' }}
          >
            <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all"
              style={{
                background: member.paid ? '#10b981' : 'transparent',
                border: member.paid ? 'none' : '1.5px solid #D0D8E0',
              }}>
              {member.paid && <Check size={9} color="white" strokeWidth={3} />}
            </div>
            <span className="text-xs font-medium flex-1 text-left transition-all"
              style={{ color: member.paid ? '#9CA3AF' : '#374151', textDecoration: member.paid ? 'line-through' : 'none' }}>
              {member.name}
            </span>
            <span className="text-[11px] font-semibold transition-all"
              style={{ color: member.paid ? '#9CA3AF' : '#d95c5c' }}>
              {member.paid ? '✓' : `${expense.currency}${Math.ceil(perPerson).toLocaleString()}`}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main View ──────────────────────────────────────────────────────────────
export default function SharedExpenseView() {
  const [expenses, setExpenses] = useState(load)
  const [showForm, setShowForm] = useState(false)
  const [editExpense, setEditExpense] = useState(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState(null)

  useEffect(() => { save(expenses) }, [expenses])

  const handleSave = (expense) => {
    setExpenses(prev => {
      const exists = prev.find(e => e.id === expense.id)
      return exists ? prev.map(e => e.id === expense.id ? expense : e) : [expense, ...prev]
    })
  }

  const handleTogglePaid = (expenseId, memberIndex) => {
    setExpenses(prev => prev.map(e => {
      if (e.id !== expenseId) return e
      const members = e.members.map((m, i) => i === memberIndex ? { ...m, paid: !m.paid } : m)
      return { ...e, members }
    }))
  }

  const handleDelete = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id))
    setConfirmDeleteId(null)
  }

  const openEdit = (expense) => {
    setEditExpense(expense)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditExpense(null)
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg, #E8EEF5 0%, #EDF3F0 100%)' }}>

      {/* Header */}
      <div className="px-5 pt-14 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest mb-0.5" style={{ color: '#8A9BAA' }}>Split the bill</p>
            <h1 className="text-xl font-bold" style={{ color: '#2D3A48' }}>Shared Expense</h1>
          </div>
          <button
            onClick={() => { setEditExpense(null); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-semibold text-sm text-white transition-colors hover:opacity-90"
            style={{ background: '#2D3A48' }}
          >
            <Plus size={15} />
            New
          </button>
        </div>
      </div>

      {/* List */}
      <div className="px-4 pb-8 flex flex-col gap-4">
        {expenses.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl"
            style={{ boxShadow: '0 4px 20px rgba(100,120,140,0.08)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'linear-gradient(135deg, #E8EEF5, #DDE5EE)' }}>
              <Receipt size={24} style={{ color: '#8A9BAA' }} />
            </div>
            <p className="font-bold text-gray-700 mb-1">No shared expenses yet</p>
            <p className="text-sm text-gray-400">Tap New to split a bill with friends</p>
          </div>
        ) : (
          expenses.map(expense => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onTogglePaid={handleTogglePaid}
              onConfirmDelete={setConfirmDeleteId}
              onEdit={openEdit}
            />
          ))
        )}
      </div>

      {showForm && (
        <ExpenseFormModal
          expense={editExpense}
          onClose={closeForm}
          onSave={handleSave}
        />
      )}

      {/* Confirm delete */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
          style={{ backdropFilter: 'blur(8px)' }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center"
            style={{ boxShadow: '0 20px 60px rgba(100,120,140,0.25)' }}>
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 size={20} className="text-red-400" />
            </div>
            <h3 className="font-bold text-gray-800">Delete this expense?</h3>
            <p className="text-sm text-gray-400 mt-1">This cannot be undone.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setConfirmDeleteId(null)}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 text-gray-600 hover:bg-gray-50 text-sm font-medium">
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDeleteId)}
                className="flex-1 bg-red-400 hover:bg-red-500 text-white rounded-xl py-2.5 font-medium text-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
