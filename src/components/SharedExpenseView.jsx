import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, X, Check, Users, Calendar, Receipt, Pencil, ImageDown, FileText } from 'lucide-react'
import dayjs from 'dayjs'
import html2canvas from 'html2canvas'

const STORAGE_KEY = 'shared_expenses'
const CURRENCIES = ['฿', '₭', '$']

const HEADER_GRAD = 'linear-gradient(135deg,#a8d8ea 0%,#c5dff8 50%,#d4eaf7 100%)'

const load = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
const save = (data) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data))

// ── Form Modal ─────────────────────────────────────────────────────────────
function ExpenseFormModal({ expense, onClose, onSave }) {
  const isEdit = !!expense
  const [title, setTitle] = useState(expense?.title || '')
  const [date, setDate] = useState(expense?.date || dayjs().format('YYYY-MM-DD'))
  const [price, setPrice] = useState(expense?.price?.toString() || '')
  const [currency, setCurrency] = useState(expense?.currency || '฿')
  const [note, setNote] = useState(expense?.note || '')
  const [memberInput, setMemberInput] = useState('')
  const [members, setMembers] = useState(expense?.members?.map(m => m.name) || [])

  const addMember = () => {
    const name = memberInput.trim()
    if (!name || members.includes(name)) return
    setMembers(prev => [...prev, name])
    setMemberInput('')
  }

  const removeMember = (name) => setMembers(prev => prev.filter(m => m !== name))
  const handleKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); addMember() } }
  const canSave = title.trim() && price && members.length > 0

  const handleSave = () => {
    if (!canSave) return
    if (isEdit) {
      const prevMap = Object.fromEntries((expense.members || []).map(m => [m.name, m.paid]))
      onSave({ ...expense, title: title.trim(), date, price: parseFloat(price), currency, note, members: members.map(name => ({ name, paid: prevMap[name] ?? false })) })
    } else {
      onSave({ id: Date.now().toString(), title: title.trim(), date, price: parseFloat(price), currency, note, members: members.map(name => ({ name, paid: false })), createdAt: new Date().toISOString() })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" style={{ backdropFilter: 'blur(12px)' }}>
      <div className="w-full max-w-md bg-white rounded-3xl flex flex-col" style={{ boxShadow: '0 24px 60px rgba(30,40,60,0.2)', maxHeight: '88vh' }}>
        <div className="px-5 pt-5 pb-6 overflow-y-auto flex-1">
          <div className="w-8 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold" style={{ color: '#1a2636' }}>{isEdit ? 'Edit Expense' : 'New Split'}</h2>
            <button onClick={onClose} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-colors">
              <X size={14} />
            </button>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Title</p>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Pickle Ball, Dinner…"
                className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-sm font-medium text-gray-800 outline-none placeholder-gray-300 border border-gray-100 focus:border-gray-300 transition-colors" />
            </div>

            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Date</p>
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-sm text-gray-700 outline-none border border-gray-100 focus:border-gray-300 transition-colors" />
            </div>

            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Total Amount</p>
              <div className="flex gap-2">
                <div className="flex gap-1">
                  {CURRENCIES.map(c => (
                    <button key={c} onClick={() => setCurrency(c)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currency === c ? 'bg-gray-900 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                      {c}
                    </button>
                  ))}
                </div>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0"
                  className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 text-sm font-medium text-gray-800 outline-none border border-gray-100 focus:border-gray-300 transition-colors placeholder-gray-300" />
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Members</p>
              <div className="flex gap-2 mb-2">
                <input value={memberInput} onChange={e => setMemberInput(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="Type name, press +"
                  className="flex-1 bg-gray-50 rounded-2xl px-4 py-3 text-sm text-gray-800 outline-none border border-gray-100 focus:border-gray-300 transition-colors placeholder-gray-300" />
                <button onClick={addMember} className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center shrink-0 hover:bg-gray-700 transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              {members.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {members.map(name => (
                    <div key={name} className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1.5">
                      <span className="text-xs font-medium text-gray-700">{name}</span>
                      <button onClick={() => removeMember(name)} className="text-gray-400 hover:text-red-400 transition-colors"><X size={10} /></button>
                    </div>
                  ))}
                </div>
              )}
              {members.length > 0 && price && (
                <p className="text-xs text-gray-400 px-1">
                  <span className="font-semibold" style={{ color: '#d95c5c' }}>{currency}{Math.ceil(parseFloat(price) / members.length).toLocaleString()}</span> / person
                </p>
              )}
            </div>


            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Note <span className="normal-case font-normal">(optional)</span></p>
              <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note for your friends…" rows={2}
                className="w-full bg-gray-50 rounded-2xl px-4 py-3 text-sm text-gray-800 outline-none border border-gray-100 focus:border-gray-300 transition-colors placeholder-gray-300 resize-none" />
            </div>
          </div>

          <button onClick={handleSave} disabled={!canSave}
            className={`w-full mt-5 py-3.5 rounded-2xl font-bold text-sm transition-all ${canSave ? 'bg-gray-900 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}>
            {isEdit ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Expense Card ───────────────────────────────────────────────────────────
function ExpenseCard({ expense, onTogglePaid, onConfirmDelete, onEdit }) {
  const perPerson = Math.ceil(expense.price / expense.members.length)
  const paidCount = expense.members.filter(m => m.paid).length
  const allPaid = paidCount === expense.members.length
  const [saving, setSaving] = useState(false)

  const handleSaveImage = async () => {
    setSaving(true)
    try {
      const snap = document.createElement('div')
      snap.style.cssText = [
        'position:fixed', 'left:-9999px', 'top:0',
        'width:380px', 'padding:28px',
        "font-family:'Noto Sans Lao',system-ui,-apple-system,sans-serif",
        'background:linear-gradient(145deg,#f8fafc 0%,#f0f4f8 100%)',
        'border-radius:0',
        'box-sizing:border-box',
      ].join(';')

      const pct = Math.round((paidCount / expense.members.length) * 100)

      snap.innerHTML = `
        <div style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(30,40,60,0.10);">

          <!-- header band -->
          <div style="background:${HEADER_GRAD};padding:20px 22px 16px;">
            <div style="font-size:18px;font-weight:800;color:#1a2636;letter-spacing:-0.3px;">${expense.title}</div>
            <div style="display:flex;gap:14px;margin-top:6px;">
              <span style="font-size:11px;color:rgba(26,38,54,0.5);">${dayjs(expense.date).format('D MMM YYYY')}</span>
              <span style="font-size:11px;color:rgba(26,38,54,0.5);">${expense.members.length} people</span>
            </div>
          </div>

          <!-- amounts row -->
          <div style="display:flex;padding:16px 22px;gap:0;border-bottom:1px solid #f0f2f5;">
            <div style="flex:1;">
              <div style="font-size:9px;color:#aab;letter-spacing:1.5px;font-weight:600;margin-bottom:4px;">TOTAL</div>
              <div style="font-size:26px;font-weight:800;color:#d95c5c;letter-spacing:-0.5px;">${expense.currency}${expense.price.toLocaleString()}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:9px;color:#aab;letter-spacing:1.5px;font-weight:600;margin-bottom:4px;">PER PERSON</div>
              <div style="font-size:20px;font-weight:800;color:#1a2636;">${expense.currency}${perPerson.toLocaleString()}</div>
            </div>
          </div>

          <!-- progress -->
          <div style="padding:12px 22px 0;">
            <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
              <span style="font-size:10px;color:#8a9baa;font-weight:500;">${paidCount}/${expense.members.length} paid</span>
              <span style="font-size:10px;font-weight:700;color:${allPaid ? '#10b981' : '#8a9baa'};">${allPaid ? 'All settled ✓' : `${expense.members.length - paidCount} pending`}</span>
            </div>
            <div style="height:5px;background:#eef0f4;border-radius:99px;overflow:hidden;">
              <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#6ee7b7,#34d399);border-radius:99px;"></div>
            </div>
          </div>

          <!-- members -->
          <div style="padding:10px 22px ${expense.note ? '0' : '16px'};">
            ${expense.members.map((m, i) => `
              <div style="display:flex;align-items:center;gap:10px;padding:6px 0;${i < expense.members.length - 1 ? 'border-bottom:1px solid #f5f6f8;' : ''}">
                <div style="width:14px;height:14px;min-width:14px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:${m.paid ? '#10b981' : '#fff'};border:${m.paid ? 'none' : '1.5px solid #d0d8e0'};box-sizing:border-box;">
                  ${m.paid ? '<span style="color:#fff;font-size:9px;line-height:1;font-weight:900;">✓</span>' : ''}
                </div>
                <span style="font-size:13px;font-weight:600;flex:1;line-height:1.2;color:${m.paid ? '#b0b8c0' : '#1a2636'};text-decoration:${m.paid ? 'line-through' : 'none'};">${m.name}</span>
                <span style="font-size:12px;font-weight:700;line-height:1.2;color:${m.paid ? '#b0b8c0' : '#d95c5c'};">${m.paid ? 'paid' : `${expense.currency}${perPerson.toLocaleString()}`}</span>
              </div>`).join('')}
          </div>

          ${expense.note ? `
          <!-- note -->
          <div style="margin:0 22px 16px;padding:10px 14px;background:#f8fafc;border-radius:12px;border-left:3px solid #d95c5c;">
            <div style="font-size:9px;color:#aab;letter-spacing:1.5px;font-weight:600;margin-bottom:4px;">NOTE</div>
            <div style="font-size:12px;color:#4a5568;line-height:1.5;">${expense.note}</div>
          </div>` : ''}
        </div>
      `
      document.body.appendChild(snap)
      const canvas = await html2canvas(snap, { scale: 4, useCORS: true, backgroundColor: null, logging: false })
      document.body.removeChild(snap)

      const filename = `split-${expense.title.replace(/\s+/g, '-')}.jpg`
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.97))
      const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent)
      const file = new File([blob], filename, { type: 'image/jpeg' })
      if (isIOS && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] })
      } else {
        const link = document.createElement('a')
        link.download = filename
        link.href = URL.createObjectURL(blob)
        link.click()
        URL.revokeObjectURL(link.href)
      }
    } catch (err) {
      console.error('Save image failed:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: '#fff', boxShadow: '0 2px 20px rgba(30,40,60,0.08), 0 1px 4px rgba(30,40,60,0.04)' }}>

      {/* Header band */}
      <div className="px-5 pt-4 pb-4" style={{ background: HEADER_GRAD }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate" style={{ fontSize: 16, letterSpacing: -0.3, color: '#1a2636' }}>{expense.title}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="flex items-center gap-1" style={{ color: 'rgba(26,38,54,0.5)' }}>
                <Calendar size={10} />
                <span style={{ fontSize: 11 }}>{dayjs(expense.date).format('D MMM YYYY')}</span>
              </div>
              <div className="flex items-center gap-1" style={{ color: 'rgba(26,38,54,0.5)' }}>
                <Users size={10} />
                <span style={{ fontSize: 11 }}>{expense.members.length} people</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => onEdit(expense)} className="w-7 h-7 rounded-full flex items-center justify-center transition-colors" style={{ color: 'rgba(26,38,54,0.4)', background: 'rgba(26,38,54,0.08)' }}>
              <Pencil size={11} />
            </button>
            <button onClick={() => onConfirmDelete(expense.id)} className="w-7 h-7 rounded-full flex items-center justify-center transition-colors" style={{ color: 'rgba(26,38,54,0.4)', background: 'rgba(26,38,54,0.08)' }}>
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Amounts row */}
      <div className="flex px-5 py-3.5" style={{ borderBottom: '1px solid #f0f2f5' }}>
        <div className="flex-1">
          <p className="text-[9px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#aab' }}>Total</p>
          <p className="font-extrabold" style={{ fontSize: 22, color: '#d95c5c', letterSpacing: -0.5 }}>{expense.currency}{expense.price.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#aab' }}>Per person</p>
          <p className="font-extrabold" style={{ fontSize: 18, color: '#1a2636' }}>{expense.currency}{perPerson.toLocaleString()}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="px-5 pt-3 pb-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-medium" style={{ color: '#8a9baa' }}>{paidCount}/{expense.members.length} paid</span>
          <span className="text-[10px] font-bold" style={{ color: allPaid ? '#10b981' : '#8a9baa' }}>
            {allPaid ? 'All settled ✓' : `${expense.members.length - paidCount} pending`}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#eef0f4' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(paidCount / expense.members.length) * 100}%`, background: 'linear-gradient(90deg,#6ee7b7,#34d399)' }} />
        </div>
      </div>

      {/* Members list */}
      <div className="px-5 py-2">
        {expense.members.map((member, i) => (
          <button key={i} onClick={() => onTogglePaid(expense.id, i)}
            className="flex items-center gap-3 w-full py-1.5 transition-all active:scale-95"
            style={{ borderBottom: i < expense.members.length - 1 ? '1px solid #f5f6f8' : 'none' }}>
            <div className="shrink-0 flex items-center justify-center rounded-full transition-all"
              style={{ width: 14, height: 14, background: member.paid ? '#10b981' : '#fff', border: member.paid ? 'none' : '1.5px solid #d0d8e0' }}>
              {member.paid && <Check size={8} color="white" strokeWidth={3.5} />}
            </div>
            <span className="text-left transition-all flex-1" style={{ fontSize: 13, fontWeight: 600, color: member.paid ? '#b0b8c0' : '#1a2636', textDecoration: member.paid ? 'line-through' : 'none' }}>
              {member.name}
            </span>
            <span style={{ fontSize: 12, fontWeight: 700, color: member.paid ? '#b0b8c0' : '#d95c5c' }}>
              {member.paid ? 'paid' : `${expense.currency}${perPerson.toLocaleString()}`}
            </span>
          </button>
        ))}
      </div>

      {/* Note */}
      {expense.note && (
        <div className="mx-5 mb-3 px-3 py-2.5 rounded-2xl flex gap-2" style={{ background: '#f8fafc', borderLeft: '3px solid #d95c5c' }}>
          <FileText size={12} className="shrink-0 mt-0.5" style={{ color: '#d95c5c' }} />
          <p className="text-xs leading-relaxed" style={{ color: '#4a5568' }}>{expense.note}</p>
        </div>
      )}

      {/* Save button */}
      <div className="px-5 pb-4">
        <button onClick={handleSaveImage} disabled={saving}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl text-xs font-bold transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#e8f4fd 0%,#e0f2ec 100%)', color: '#2D6A5A' }}>
          <ImageDown size={13} />
          {saving ? 'Saving…' : 'Save Image'}
        </button>
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

  const openEdit = (expense) => { setEditExpense(expense); setShowForm(true) }
  const closeForm = () => { setShowForm(false); setEditExpense(null) }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(160deg,#E8EEF5 0%,#EDF3F0 100%)' }}>

      {/* Header */}
      <div className="px-5 pt-14 pb-5">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#8A9BAA' }}>Split the bill</p>
            <h1 className="text-2xl font-extrabold" style={{ color: '#1a2636', letterSpacing: -0.5 }}>Shared Expense</h1>
          </div>
          <button onClick={() => { setEditExpense(null); setShowForm(true) }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg,#1a2636 0%,#2d3f54 100%)', boxShadow: '0 4px 12px rgba(26,38,54,0.3)' }}>
            <Plus size={14} />
            New
          </button>
        </div>
      </div>

      {/* List */}
      <div className="px-4 pb-10 flex flex-col gap-4">
        {expenses.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl" style={{ boxShadow: '0 4px 20px rgba(100,120,140,0.08)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'linear-gradient(135deg,#E8EEF5,#DDE5EE)' }}>
              <Receipt size={24} style={{ color: '#8A9BAA' }} />
            </div>
            <p className="font-bold text-gray-700 mb-1">No shared expenses yet</p>
            <p className="text-sm text-gray-400">Tap New to split a bill with friends</p>
          </div>
        ) : (
          expenses.map(expense => (
            <ExpenseCard key={expense.id} expense={expense} onTogglePaid={handleTogglePaid} onConfirmDelete={setConfirmDeleteId} onEdit={openEdit} />
          ))
        )}
      </div>

      {showForm && <ExpenseFormModal expense={editExpense} onClose={closeForm} onSave={handleSave} />}

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" style={{ backdropFilter: 'blur(8px)' }}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center" style={{ boxShadow: '0 20px 60px rgba(100,120,140,0.25)' }}>
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 size={20} className="text-red-400" />
            </div>
            <h3 className="font-bold text-gray-800">Delete this expense?</h3>
            <p className="text-sm text-gray-400 mt-1">This cannot be undone.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-gray-600 hover:bg-gray-50 text-sm font-medium">Cancel</button>
              <button onClick={() => handleDelete(confirmDeleteId)} className="flex-1 bg-red-400 hover:bg-red-500 text-white rounded-xl py-2.5 font-medium text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
