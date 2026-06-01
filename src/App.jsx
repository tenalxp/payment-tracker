import { useState } from 'react'
import HomeView from './components/HomeView'
import MonthlyView from './components/MonthlyView'
import MembersView from './components/MembersView'
import ItemsView from './components/ItemsView'
import HistoryView from './components/HistoryView'
import { Home, BarChart2, Users, Clock, Tag } from 'lucide-react'

const TABS = [
  { key: 'home',    label: 'Home',    icon: Home },
  { key: 'monthly', label: 'Monthly', icon: BarChart2 },
  { key: 'history', label: 'History', icon: Clock },
  { key: 'members', label: 'Members', icon: Users },
  { key: 'items',   label: 'Items',   icon: Tag },
]

export default function App() {
  const [tab, setTab] = useState('home')

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col max-w-md mx-auto">
      <div className="flex-1 overflow-y-auto pb-20">
        {tab === 'home'    && <HomeView />}
        {tab === 'monthly' && <div className="px-5 pt-14"><h2 className="text-xl font-semibold text-gray-900 mb-5">Monthly</h2><MonthlyView /></div>}
        {tab === 'history' && <HistoryView />}
        {tab === 'members' && <div className="px-5 pt-14"><MembersView /></div>}
        {tab === 'items'   && <div className="px-5 pt-14"><ItemsView /></div>}
      </div>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/80 backdrop-blur border-t border-gray-200/60 flex z-40">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
              tab === key ? 'text-gray-900' : 'text-gray-400'
            }`}
          >
            <Icon size={19} strokeWidth={tab === key ? 2.2 : 1.6} />
            <span className={`text-[10px] ${tab === key ? 'font-semibold' : 'font-normal'}`}>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
