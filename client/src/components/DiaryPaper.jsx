import React from 'react'
export default function DiaryPaper({children, title, page}) {
  return <section className="diary-wrap"><div className="leather-spine"></div><div className="paper">
    <div className="paper-header"><div><span className="eyebrow">PERSONAL JOURNAL</span><h1>{title}</h1></div><span className="page-no">PAGE {page}</span></div>
    <div className="paper-content">{children}</div>
  </div></section>
}
