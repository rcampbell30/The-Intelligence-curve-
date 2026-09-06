import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

type Draft = {
  key: string
  sourceId: string
  sourceLabel: string
  sourceUrl: string
  metricIds: string[]
  detectedAt: string
  publishedSnapshot: Record<string, string | number>
  candidateSnapshot: Record<string, string | number>
  status: 'pending-review' | 'approved' | 'rejected'
  reviewedAt?: string
  action?: 'approve' | 'reject'
}

function canPublishMetric(sourceId: string) {
  return sourceId === 'hle-leaderboard' || sourceId === 'arc-agi-3-astra'
}

function formatTime(value?: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
  }).format(new Date(value))
}

export default function ReviewPage() {
  const [key, setKey] = useState(() => sessionStorage.getItem('tic-review-key') ?? '')
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'unauthorised' | 'error'>('idle')
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const pending = useMemo(() => drafts.filter((draft) => draft.status === 'pending-review'), [drafts])
  const reviewed = useMemo(() => drafts.filter((draft) => draft.status !== 'pending-review'), [drafts])

  async function loadQueue(reviewKey = key) {
    if (!reviewKey) return
    setStatus('loading')
    setMessage('')
    try {
      const response = await fetch('/api/review-queue', { headers: { authorization: `Bearer ${reviewKey}` } })
      if (response.status === 401) {
        setStatus('unauthorised')
        return
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const payload = await response.json() as { drafts: Draft[] }
      sessionStorage.setItem('tic-review-key', reviewKey)
      setDrafts(payload.drafts ?? [])
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    if (key) void loadQueue(key)
    // Only attempt automatic session restore once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function review(draft: Draft, action: 'approve' | 'reject') {
    const label = action === 'approve' ? 'Approve' : 'Reject'
    if (!window.confirm(`${label} this detected source change?`)) return
    setBusy(draft.key)
    setMessage('')
    try {
      const response = await fetch('/api/review-action', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
        body: JSON.stringify({ draftKey: draft.key, action }),
      })
      const payload = await response.json().catch(() => ({})) as { error?: string; published?: boolean }
      if (response.status === 401) {
        setStatus('unauthorised')
        return
      }
      if (!response.ok) throw new Error(payload.error ?? `HTTP ${response.status}`)
      setMessage(action === 'approve'
        ? payload.published ? 'Approved and published to the live metric override.' : 'Approved as the new source baseline; no headline value was auto-published for this source.'
        : 'Rejected. This exact candidate will be ignored unless the source changes again.')
      await loadQueue(key)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Review action failed')
    } finally {
      setBusy(null)
    }
  }

  return (
    <section className="section-pad page-section review-page">
      <div className="page-hero data-page-hero review-hero">
        <span className="eyebrow">PRIVATE REVIEW</span>
        <h1>Approve evidence<br />before it goes live.</h1>
        <p>The automatic monitors can detect changes, but only this protected review flow can accept a new baseline or publish a supported headline override.</p>
        <div className="page-meta-row"><span>Server-side key required</span><span>Audit trail retained</span><span>No blind auto-publishing</span></div>
      </div>

      {status !== 'ready' && (
        <div className="review-login-panel">
          <div><span className="eyebrow">REVIEW ACCESS</span><h2>Enter the review key</h2><p>The key is checked only by the Netlify function and stored in this browser tab’s session storage.</p></div>
          <form onSubmit={(event) => { event.preventDefault(); void loadQueue(key) }}>
            <input type="password" value={key} onChange={(event) => setKey(event.target.value)} placeholder="Review key" autoComplete="current-password" />
            <button className="button primary" type="submit" disabled={!key || status === 'loading'}>{status === 'loading' ? 'Checking…' : 'Unlock review queue'}</button>
          </form>
          {status === 'unauthorised' && <p className="review-error">That key was not accepted.</p>}
          {status === 'error' && <p className="review-error">The review service is temporarily unavailable.</p>}
        </div>
      )}

      {status === 'ready' && (
        <>
          <div className="review-toolbar">
            <div><span className="eyebrow">PENDING</span><strong>{pending.length}</strong></div>
            <button className="button secondary" type="button" onClick={() => { sessionStorage.removeItem('tic-review-key'); setKey(''); setStatus('idle'); setDrafts([]) }}>Lock review page</button>
          </div>

          {message && <div className="review-message">{message}</div>}

          <div className="review-queue">
            {pending.length === 0 ? (
              <div className="review-empty"><span className="eyebrow">QUEUE CLEAR</span><h2>No source changes need review.</h2><p>The monitors will keep checking on schedule.</p></div>
            ) : pending.map((draft) => (
              <article className="review-card" key={draft.key}>
                <div className="review-card-head">
                  <div><span className="eyebrow">{draft.sourceLabel}</span><h2>{draft.metricIds.join(', ')}</h2></div>
                  <span>{formatTime(draft.detectedAt)}</span>
                </div>
                <div className="review-diff-grid">
                  <div><span>Published baseline</span><pre>{JSON.stringify(draft.publishedSnapshot, null, 2)}</pre></div>
                  <div><span>Detected candidate</span><pre>{JSON.stringify(draft.candidateSnapshot, null, 2)}</pre></div>
                </div>
                <div className="review-publish-note">
                  {canPublishMetric(draft.sourceId)
                    ? 'Approval will update the accepted baseline and publish the supported metric headline through the runtime override layer.'
                    : 'Approval will accept this source state as reviewed, but will not invent a new headline value. METR still needs a human interpretation when its methodology/page changes.'}
                </div>
                <div className="review-actions">
                  <a className="button secondary" href={draft.sourceUrl} target="_blank" rel="noreferrer">Open source ↗</a>
                  <button className="button secondary" type="button" disabled={busy === draft.key} onClick={() => void review(draft, 'reject')}>Reject</button>
                  <button className="button primary" type="button" disabled={busy === draft.key} onClick={() => void review(draft, 'approve')}>{busy === draft.key ? 'Saving…' : canPublishMetric(draft.sourceId) ? 'Approve & publish' : 'Approve baseline'}</button>
                </div>
              </article>
            ))}
          </div>

          {reviewed.length > 0 && (
            <section className="review-history">
              <div className="section-heading"><div><span className="eyebrow">HISTORY</span><h2>Recent review decisions</h2></div><p>Reviewed drafts remain visible for auditability.</p></div>
              <div className="review-history-list">
                {reviewed.slice(0, 20).map((draft) => (
                  <div key={draft.key}><strong>{draft.sourceLabel}</strong><span>{draft.status}</span><span>{formatTime(draft.reviewedAt)}</span></div>
                ))}
              </div>
            </section>
          )}

          <Link className="text-link" to="/updates">← Back to public updates</Link>
        </>
      )}
    </section>
  )
}
