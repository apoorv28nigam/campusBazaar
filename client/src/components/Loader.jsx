export default function Loader({ text = 'Loading CampusCart...', fullPage = false }) {
  if (fullPage) return (
    <div style={{ minHeight: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, background: 'var(--bg)' }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', border: '4px solid var(--primary-light)', borderTop: '4px solid var(--primary)', animation: 'spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ color: 'var(--text-muted)', fontSize: 16, fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>{text}</p>
    </div>
  );
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--primary-light)', borderTop: '3px solid var(--primary)', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card" style={{ overflow: 'hidden', border: '1px solid var(--border)', background: 'white' }}>
      <div className="skeleton" style={{ paddingTop: '65%', borderRadius: 0 }} />
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="skeleton" style={{ height: 20, width: '85%' }} />
        <div className="skeleton" style={{ height: 28, width: '45%' }} />
        <div className="skeleton" style={{ height: 16, width: '65%' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <div className="skeleton" style={{ width: 28, height: 28, borderRadius: '50%' }} />
          <div className="skeleton" style={{ height: 16, width: '55%' }} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array(count).fill(null).map((_, i) => (
        <div key={i} className="card" style={{ display: 'flex', gap: 16, padding: '16px 20px', alignItems: 'center' }}>
          <div className="skeleton" style={{ width: 52, height: 52, borderRadius: 12, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="skeleton" style={{ height: 18, width: '30%' }} />
              <div className="skeleton" style={{ height: 14, width: '15%' }} />
            </div>
            <div className="skeleton" style={{ height: 16, width: '70%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="page-container" style={{ paddingTop: 100, paddingBottom: 100 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 40 }}>
        <div className="skeleton" style={{ aspectRatio: '1/1', borderRadius: 24 }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div>
            <div className="skeleton" style={{ height: 40, width: '90%', marginBottom: 12 }} />
            <div className="skeleton" style={{ height: 20, width: '40%' }} />
          </div>
          <div className="skeleton" style={{ height: 80, width: '100%', borderRadius: 16 }} />
          <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="skeleton" style={{ height: 32, width: '50%' }} />
            <div className="skeleton" style={{ height: 48, width: '100%', borderRadius: 12 }} />
          </div>
          <div className="skeleton" style={{ height: 100, width: '100%', borderRadius: 16 }} />
        </div>
      </div>
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="card" style={{ padding: 40, marginBottom: 32, display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <div className="skeleton" style={{ width: 100, height: 100, borderRadius: 16 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="skeleton" style={{ height: 40, width: '250px' }} />
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="skeleton" style={{ height: 24, width: '120px' }} />
          <div className="skeleton" style={{ height: 24, width: '100px' }} />
        </div>
        <div className="skeleton" style={{ height: 60, width: '100%', maxWidth: '600px' }} />
      </div>
    </div>
  );
}

export function SkeletonChat() {
  return (
    <div style={{ paddingTop: 64, height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <div style={{ background: 'white', borderBottom: '1px solid var(--border)', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div className="skeleton" style={{ width: 42, height: 42, borderRadius: 12 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 20, width: '120px', marginBottom: 6 }} />
          <div className="skeleton" style={{ height: 12, width: '60px' }} />
        </div>
      </div>
      <div style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {[0.4, 0.6, 0.3, 0.5, 0.7].map((w, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end' }}>
            <div className="skeleton" style={{ height: 44, width: `${w * 100}%`, borderRadius: 16 }} />
          </div>
        ))}
      </div>
    </div>
  );
}

