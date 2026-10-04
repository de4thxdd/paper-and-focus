import React, { useEffect } from 'react'
export default function Toast({message,onDone}) {
  useEffect(()=>{ if(message){ const t=setTimeout(onDone,2800); return ()=>clearTimeout(t)}},[message,onDone])
  return message ? <div className="toast">{message}</div> : null
}
