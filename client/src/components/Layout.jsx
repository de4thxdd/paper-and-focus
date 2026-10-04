import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { BookOpen, CalendarDays, CalendarRange, ClipboardList, LayoutDashboard, LogOut, Sparkles, TimerReset, Users } from 'lucide-react'
import { useAuth } from '../lib/auth'

const links = [
  ['/daily', 'Daily Diary', BookOpen],
  ['/weekly', 'Weekly Diary', CalendarRange],
  ['/monthly', 'Monthly Diary', CalendarDays],
  ['/study', 'Study Session', TimerReset],
  ['/dashboard', 'Dashboard', LayoutDashboard],
]

export default function Layout() {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><BookOpen size={20}/></div><div><b>Paper & Focus</b><span>study command center</span></div></div>
      <nav>{links.map(([to,label,Icon]) => <NavLink key={to} to={to} className={({isActive}) => isActive ? 'active' : ''}><Icon size={18}/><span>{label}</span></NavLink>)}</nav>
      <div className="sidebar-bottom">
        <div className="user-mini"><div className="avatar">{user?.name?.[0]?.toUpperCase() || 'U'}</div><div><strong>{user?.name}</strong><small>{user?.email}</small></div></div>
        <button className="ghost-btn" onClick={() => { logout(); nav('/login') }}><LogOut size={16}/> Sign out</button>
      </div>
    </aside>
    <main className="main"><header className="topbar"><div className="mobile-title"><Sparkles size={17}/> Paper & Focus</div><div className="date-stamp">{new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'})}</div></header><Outlet /></main>
    <nav className="mobile-nav">{links.map(([to,label,Icon]) => <NavLink key={to} to={to}><Icon size={19}/><span>{label.split(' ')[0]}</span></NavLink>)}</nav>
  </div>
}
