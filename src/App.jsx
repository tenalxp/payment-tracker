import { useState, useRef } from 'react'
import PinLock from './components/PinLock'
import HomeView from './components/HomeView'
import MonthlyView from './components/MonthlyView'
import MembersView from './components/MembersView'
import ItemsView from './components/ItemsView'
import HistoryView from './components/HistoryView'
import BulkAddView from './components/BulkAddView'
import SharedExpenseView from './components/SharedExpenseView'
import { Home, BarChart2, Users, Clock, Tag, ClipboardList, AlertTriangle, Scissors } from 'lucide-react'

const TABS = [
  { key: 'home',    label: 'Home',    icon: Home },
  { key: 'monthly', label: 'Monthly', icon: BarChart2 },
  { key: 'history', label: 'History', icon: Clock },
  { key: 'bulk',    label: 'Bulk',    icon: ClipboardList },
  { key: 'split',   label: 'Split',   icon: Scissors },
  { key: 'members', label: 'Members', icon: Users },
  { key: 'items',   label: 'Items',   icon: Tag },
]

export default function App() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('unlocked') === '1')
  const [tab, setTab] = useState('home')
  const [pendingTab, setPendingTab] = useState(null)
  const bulkDirtyRef = useRef(false)

  if (!unlocked) return <PinLock onUnlock={() => { sessionStorage.setItem('unlocked', '1'); setUnlocked(true) }} />

  const handleTabClick = (key) => {
    if (tab === 'bulk' && key !== 'bulk' && bulkDirtyRef.current) {
      setPendingTab(key)
    } else {
      setTab(key)
    }
  }

  const confirmLeave = () => {
    setTab(pendingTab)
    setPendingTab(null)
    bulkDirtyRef.current = false
  }

  const cancelLeave = () => setPendingTab(null)

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto" style={{ background: 'linear-gradient(160deg, #E8EEF5 0%, #EDF3F0 100%)' }}>
      <div className="flex-1 overflow-y-auto pb-20">
        {tab === 'home'    && <HomeView />}
        {tab === 'monthly' && <MonthlyView />}
        {tab === 'history' && <HistoryView />}
        {tab === 'members' && <div className="px-5 pt-14 min-h-screen"><MembersView /></div>}
        {tab === 'bulk'    && <BulkAddView dirtyRef={bulkDirtyRef} />}
        {tab === 'split'   && <SharedExpenseView />}
        {tab === 'items'   && <div className="px-5 pt-14 min-h-screen"><ItemsView /></div>}
      </div>

      {/* Bottom nav */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md flex z-40"
        style={{ background: 'rgba(238,240,245,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.7)' }}
      >
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleTabClick(key)}
            className="flex-1 flex flex-col items-center gap-1 py-3 transition-all"
            style={{ color: tab === key ? '#6A9BAA' : '#8A9BAA' }}
          >
            <Icon size={18} strokeWidth={tab === key ? 2.2 : 1.6} />
            <span className={`text-[9px] ${tab === key ? 'font-bold' : 'font-normal'}`}>{label}</span>
          </button>
        ))}
      </div>

      {/* Leave confirmation popup */}
      {pendingTab && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-6"
          style={{ backdropFilter: 'blur(8px)' }}>
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center"
            style={{ boxShadow: '0 20px 60px rgba(100,120,140,0.25)' }}>
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle size={22} className="text-amber-400" />
            </div>
            <h3 className="font-bold text-gray-800 text-base">Leave this page?</h3>
            <p className="text-sm text-gray-400 mt-1">You have unsaved entries. If you leave now, they will be lost.</p>
            <div className="flex gap-3 mt-5">
              <button onClick={cancelLeave}
                className="flex-1 border border-gray-200 rounded-xl py-2.5 text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium">
                Stay
              </button>
              <button onClick={confirmLeave}
                className="flex-1 bg-red-400 hover:bg-red-500 text-white rounded-xl py-2.5 font-medium transition-colors text-sm">
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
