import React from 'react'
import {Navigate,Route,Routes,useLocation} from 'react-router-dom'
import {AuthProvider,useAuth} from './lib/auth'
import Layout from './components/Layout'
import Auth from './pages/Auth'
import Daily from './pages/Daily'
import Weekly from './pages/Weekly'
import Monthly from './pages/Monthly'
import Study from './pages/Study'
import Dashboard from './pages/Dashboard'
import {RoomSessionProvider} from './lib/roomSession'

function Private({children}){const {user,loading}=useAuth();const loc=useLocation();if(loading)return <div className="loading">Opening the diary…</div>;return user?children:<Navigate to="/login" state={{from:loc.pathname}} replace/>}
export default function App(){return <AuthProvider><RoomSessionProvider><Routes><Route path="/login" element={<Auth mode="login"/>}/><Route path="/register" element={<Auth mode="register"/>}/><Route element={<Private><Layout/></Private>}><Route path="/" element={<Navigate to="/daily" replace/>}/><Route path="/daily" element={<Daily/>}/><Route path="/weekly" element={<Weekly/>}/><Route path="/monthly" element={<Monthly/>}/><Route path="/study" element={<Study/>}/><Route path="/dashboard" element={<Dashboard/>}/></Route></Routes></RoomSessionProvider></AuthProvider>}
