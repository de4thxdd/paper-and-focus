import React,{createContext,useContext,useEffect,useMemo,useState} from 'react'
import {api,request} from './api'

const RoomSessionContext=createContext(null)
const KEY='paper_focus_active_group_room'

function readStored(){try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}}

export function RoomSessionProvider({children}){
 const [session,setSession]=useState(readStored)
 const [elapsed,setElapsed]=useState(0)

 useEffect(()=>{
   if(!session)return
   request(api.get(`/rooms/${session.room.id}`)).catch(()=>{localStorage.removeItem(KEY);setSession(null);setElapsed(0)})
 },[session?.room?.id])

 useEffect(()=>{
   if(!session)return
   const tick=()=>setElapsed(Math.max(0,Math.floor((Date.now()-session.startedAt)/1000)))
   tick()
   const id=setInterval(tick,1000)
   const beat=setInterval(()=>{
     request(api.post('/study/group/heartbeat',{roomId:session.room.id})).then(r=>{if(r?.active===false){localStorage.removeItem(KEY);setSession(null);setElapsed(0)}}).catch(()=>{})
   },10000)
   return()=>{clearInterval(id);clearInterval(beat)}
 },[session])

 const enterRoom=async(room)=>{
   const now=Date.now()
   const next={room,startedAt:now}
   localStorage.setItem(KEY,JSON.stringify(next))
   setSession(next)
   setElapsed(0)
   await request(api.post('/study/group/start',{roomId:room.id}))
 }

 const leaveRoom=async()=>{
   if(!session)return
   const roomId=session.room.id
   try{await request(api.post('/study/group/stop',{roomId}))}finally{
     localStorage.removeItem(KEY)
     setSession(null)
     setElapsed(0)
   }
 }

 const endRoom=async()=>{
   if(!session)return
   const roomId=session.room.id
   try{await request(api.post('/study/group/stop',{roomId}));await request(api.delete(`/rooms/${roomId}`))}finally{
     localStorage.removeItem(KEY)
     setSession(null)
     setElapsed(0)
   }
 }

 const value=useMemo(()=>({session,room:session?.room||null,elapsed,enterRoom,leaveRoom,endRoom}),[session,elapsed])
 return <RoomSessionContext.Provider value={value}>{children}</RoomSessionContext.Provider>
}

export function useRoomSession(){return useContext(RoomSessionContext)}
