import React, { useEffect, useState } from 'react'
import { Edit3, Plus, Trash2 } from 'lucide-react'
import DiaryPaper from '../components/DiaryPaper'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import { api, request } from '../lib/api'

function monday() {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(d.getDate()).padStart(2, '0')}`
}

export default function Weekly() {
  const [week, setWeek] = useState(null)
  const [selected, setSelected] = useState(null)
  const [chapters, setChapters] = useState('')
  const [plan, setPlan] = useState('')
  const [editPlan, setEditPlan] = useState(null)
  const [toast, setToast] = useState('')

  // FIXED: useEffect itself does not return a Promise
  useEffect(() => {
    let cancelled = false

    async function loadWeekly() {
      try {
        const data = await request(
          api.get('/diary/weekly', {
            params: {
              weekStart: monday(),
            },
          })
        )

        if (!cancelled) {
          setWeek(data)
        }
      } catch (e) {
        if (!cancelled) {
          setToast(e.message)
        }
      }
    }

    loadWeekly()

    return () => {
      cancelled = true
    }
  }, [])

  const load = async () => {
    try {
      const data = await request(
        api.get('/diary/weekly', {
          params: {
            weekStart: monday(),
          },
        })
      )

      setWeek(data)
    } catch (e) {
      setToast(e.message)
    }
  }

  if (!week) {
    return <div className="loading">Opening this week…</div>
  }

  const totalSec = week.days.reduce(
    (a, d) => a + d.seconds,
    0
  )

  const savePlan = async () => {
    try {
      if (editPlan) {
        await request(
          api.patch(`/diary/weekly/plans/${editPlan.id}`, {
            content: plan,
          })
        )
      } else {
        await request(
          api.post('/diary/weekly/plans', {
            weekStart: week.weekStart,
            date: selected.date,
            content: plan,
          })
        )
      }

      setPlan('')
      setEditPlan(null)
      setSelected(null)

      await load()
    } catch (e) {
      setToast(e.message)
    }
  }

  const addChapter = async () => {
    if (!chapters.trim()) return

    try {
      await request(
        api.post('/diary/weekly/chapters', {
          weekStart: week.weekStart,
          name: chapters,
        })
      )

      setChapters('')
      await load()
    } catch (e) {
      setToast(e.message)
    }
  }

  const delPlan = async (id) => {
    if (!confirm('Delete this plan?')) return

    try {
      await request(
        api.delete(`/diary/weekly/plans/${id}`)
      )

      await load()
    } catch (e) {
      setToast(e.message)
    }
  }

  const delChapter = async (id) => {
    if (!confirm('Delete this chapter?')) return

    try {
      await request(
        api.delete(`/diary/weekly/chapters/${id}`)
      )

      await load()
    } catch (e) {
      setToast(e.message)
    }
  }

  return (
    <DiaryPaper
      title="The week at a glance"
      page="02"
    >
      <div className="week-summary">
        <div>
          <span>COMPLETION</span>
          <b>
            {week.days.reduce(
              (a, d) => a + d.completed,
              0
            )}{' '}
            tasks
          </b>
        </div>

        <div>
          <span>GOALS</span>
          <b>
            {week.days.reduce(
              (a, d) => a + d.goals,
              0
            )}{' '}
            active
          </b>
        </div>

        <div>
          <span>STUDY</span>
          <b>{formatDuration(totalSec)}</b>
        </div>
      </div>

      <div className="weekly-editor">
        <div className="section-head">
          <div>
            <span className="eyebrow">
              WEEKLY CHAPTERS
            </span>

            <h2>
              What belongs on this week’s shelf?
            </h2>
          </div>
        </div>

        <div className="chapter-add">
          <input
            value={chapters}
            onChange={(e) =>
              setChapters(e.target.value)
            }
            placeholder="e.g. Cell, Kinematics, Sets"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addChapter()
              }
            }}
          />

          <button
            className="primary"
            onClick={addChapter}
          >
            <Plus size={15} />
            Add chapter
          </button>
        </div>

        <div className="chapter-list">
          {week.chapters.length ? (
            week.chapters.map((c) => (
              <span key={c.id}>
                {c.name}

                <button
                  onClick={() =>
                    delChapter(c.id)
                  }
                >
                  <Trash2 size={12} />
                </button>
              </span>
            ))
          ) : (
            <small className="muted">
              Add only the chapter names you plan
              to study this week.
            </small>
          )}
        </div>
      </div>

      <div className="week-grid">
        {week.days.map((d) => (
          <div
            className="day-card"
            key={d.date}
          >
            <div className="day-title">
              <b>{d.day}</b>
              <span>{d.date}</span>
            </div>

            <button
              className="day-plan-button"
              onClick={() => {
                setSelected(d)
                setEditPlan(null)
                setPlan('')
              }}
            >
              <Plus size={15} />
              <span>Write this day’s plan</span>
            </button>

            <div className="plan-list">
              {d.plans.length ? (
                d.plans.map((p) => (
                  <div key={p.id}>
                    <span>{p.content}</span>

                    <button
                      onClick={() => {
                        setSelected(d)
                        setEditPlan(p)
                        setPlan(p.content)
                      }}
                    >
                      <Edit3 size={13} />
                    </button>

                    <button
                      onClick={() =>
                        delPlan(p.id)
                      }
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              ) : (
                <small className="muted">
                  Nothing planned yet.
                </small>
              )}
            </div>

            <div className="mini-stat">
              {d.completed} tasks done •{' '}
              {formatDuration(d.seconds)} studied
            </div>
          </div>
        ))}
      </div>

      <p className="journal-note">
        Pick a day and write exactly what you want
        to accomplish. This is your weekly planning
        table.
      </p>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`${editPlan ? 'Edit' : 'Plan'} ${
          selected?.day || ''
        }`}
      >
        <div className="form-stack">
          <label>
            What will you do on this day?

            <textarea
              className="plan-textarea"
              rows="6"
              value={plan}
              onChange={(e) =>
                setPlan(e.target.value)
              }
              placeholder="e.g. Finish Cell notes, solve 30 questions, revise..."
            />
          </label>

          <button
            className="primary wide"
            onClick={savePlan}
          >
            {editPlan
              ? 'Update plan'
              : 'Save plan'}
          </button>
        </div>
      </Modal>

      <Toast
        message={toast}
        onDone={() => setToast('')}
      />
    </DiaryPaper>
  )
}

function formatDuration(sec) {
  sec = Math.max(0, Math.floor(sec || 0))

  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60

  return h
    ? `${h}h ${m}m`
    : m
    ? `${m}m ${s}s`
    : `${s}s`
}