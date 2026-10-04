import React, { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useAuth } from '../lib/auth'

export default function Auth({mode='login'}) {
  const {user,login,register} = useAuth(); const nav=useNavigate(); const loc=useLocation()
  const [form,setForm]=useState({name:'',email:'',password:''}); const [err,setErr]=useState('')
  if(user) return <Navigate to={loc.state?.from || '/daily'} replace/>
  const submit=async e=>{e.preventDefault();setErr('');try{mode==='login'?await login(form):await register(form);nav('/daily')}catch(e){setErr(e.message)}}
  return <div className="auth-page"><div className="auth-art"><div className="floating-book"><BookOpen size={34}/><h1>Paper & Focus</h1><p>A quiet desk for loud ambitions.</p></div></div>
    <form className="auth-card" onSubmit={submit}><div className="brand auth-brand"><div className="brand-mark"><BookOpen size={20}/></div><div><b>Paper & Focus</b><span>digital diary</span></div></div>
    <h2>{mode==='login'?'Welcome back.':'Create your desk.'}</h2><p className="muted">{mode==='login'?'Pick up where you left off.':'Your pages, tasks and study time in one place.'}</p>
    {mode==='register'&&<label><span>Name</span><div className="input-icon"><UserRound size={17}/><input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div></label>}
    <label><span>Email</span><div className="input-icon"><Mail size={17}/><input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div></label>
    <label><span>Password</span><div className="input-icon"><LockKeyhole size={17}/><input type="password" minLength="6" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></div></label>
    {err&&<div className="error">{err}</div>}<button className="primary wide">{mode==='login'?'Open diary':'Create account'}</button>
    <button type="button" className="link-btn" onClick={()=>nav(mode==='login'?'/register':'/login')}>{mode==='login'?'New here? Create an account':'Already have an account? Sign in'}</button></form></div>
}
