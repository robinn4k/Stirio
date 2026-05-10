// Stirio — Profile screen (user info, settings, activity heatmap, logout)
// Depends on ui.jsx, auth.js, learn.js.
// Split from the former monolithic js/screens.jsx (PR #145).

// ═══════════════ PROFILE ═══════════════
const Profile = ({ profile, onBack, onUpdateProfile, onLogout, onResetData, tweaks, onChangeTweak, playShortcuts, onOpenAdmin }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const [editingName, setEditingName] = React.useState(false);
  const [tmpName, setTmpName] = React.useState(profile.name || '');
  const units = tweaks?.units || 'ml';
  const setUnits = (u) => onChangeTweak && onChangeTweak('units', u);
  const [lang, setLang] = React.useState((window.stLang && window.stLang.getLang && window.stLang.getLang()) || 'es');
  const [reduce, setReduce] = React.useState(() => {
    try { return localStorage.getItem('stirio::reduce_motion') === '1'; } catch { return false; }
  });
  const [textScale, setTextScale] = React.useState(() => {
    try { return localStorage.getItem('stirio::text_scale') || 'default'; } catch { return 'default'; }
  });

  // Force re-render when Firebase auth resolves after Profile mounted, so the
  // admin row (gated by window.isAdminUser()) appears without a manual reload.
  const [, setAuthTick] = React.useState(0);
  React.useEffect(() => {
    const onAuthChange = () => setAuthTick(t => t + 1);
    window.addEventListener('stirio:authchange', onAuthChange);
    return () => window.removeEventListener('stirio:authchange', onAuthChange);
  }, []);

  // Apply text scale + reduced motion to <html> as data-* attributes so
  // tokens.css / style.css media queries can react. Persist to localStorage.
  React.useEffect(() => {
    document.documentElement.setAttribute('data-text-scale', textScale);
    try { localStorage.setItem('stirio::text_scale', textScale); } catch {}
  }, [textScale]);
  React.useEffect(() => {
    document.documentElement.setAttribute('data-reduce-motion', reduce ? '1' : '0');
    try { localStorage.setItem('stirio::reduce_motion', reduce ? '1' : '0'); } catch {}
  }, [reduce]);

  // Real achievements (loaded from localStorage + Firestore sync).
  // Refreshed on mount, on the 'stirio:achievement' event (dispatched by
  // checkAchievements whenever stats change), and on window focus — so the
  // Profile UI never shows stale logros after a game finishes.
  const [achievements, setAchievements] = React.useState([]);
  React.useEffect(() => {
    let cancelled = false;
    const readLocal = () => {
      try {
        if (!cancelled && window.stAchievements?.getAchievements) {
          setAchievements(window.stAchievements.getAchievements());
        }
      } catch {}
    };
    const loadAch = async () => {
      if (!window.stAchievements) return;
      try {
        if (window.stAchievements.loadAchievementsFromCloud) {
          await window.stAchievements.loadAchievementsFromCloud();
        }
        readLocal();
      } catch {}
    };
    if (window.stAchievements) loadAch();
    else setTimeout(loadAch, 300);
    window.addEventListener('stirio:achievement', readLocal);
    window.addEventListener('focus', readLocal);
    // Re-resolve titles/descs when translations arrive or language changes.
    // Without this, achievements cached pre-i18n-load would show raw keys.
    window.addEventListener('stirio:langchange', readLocal);
    return () => {
      cancelled = true;
      window.removeEventListener('stirio:achievement', readLocal);
      window.removeEventListener('focus', readLocal);
      window.removeEventListener('stirio:langchange', readLocal);
    };
  }, []);

  // Real leaderboard (Firestore query) — refetch on XP change & window focus
  // so rankings stay live without requiring a full screen remount.
  const [leaderboard, setLeaderboard] = React.useState([]);
  React.useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!window.stLeaderboard) return;
      try {
        const fn = window.stLeaderboard.fetchLeaderboard || window.stLeaderboard.getLeaderboard;
        if (!fn) return;
        const list = await fn();
        if (!cancelled && Array.isArray(list)) {
          const me = (window.stAuth && window.stAuth.getCurrentUser && window.stAuth.getCurrentUser()) || null;
          const mapped = list.map(u => ({
            name: u.displayName || u.name || 'Player',
            xp: u.xpTotal || u.xp || 0,
            level: u.level || 1,
            streak: u.streakDays || 0,
            self: me && (u.uid === me.uid),
          }));
          setLeaderboard(mapped);
        }
      } catch {}
    };
    load();
    // Retry shortly after mount in case Firebase auth / stLeaderboard init
    // hadn't finished yet (the Profile can open before fetchLeaderboard has
    // a live Firestore connection, which would silently return empty).
    const retryTimer = setTimeout(load, 1500);
    const onRefresh = () => load();
    window.addEventListener('stirio:xpchange', onRefresh);
    window.addEventListener('focus', onRefresh);
    window.addEventListener('stirio:authchange', onRefresh);
    return () => {
      cancelled = true;
      clearTimeout(retryTimer);
      window.removeEventListener('stirio:xpchange', onRefresh);
      window.removeEventListener('focus', onRefresh);
      window.removeEventListener('stirio:authchange', onRefresh);
    };
  }, []);

  const saveName = () => {
    const n = tmpName.trim();
    if (n) onUpdateProfile && onUpdateProfile({ name: n });
    setEditingName(false);
  };

  // Real activity totals (computed from the on-device activity log).
  // Re-read on every XP change so a lesson finished while Profile is mounted
  // shows up in the heatmap immediately — without this the heatmap is stale
  // until the user navigates away and back. Also refresh on window focus and
  // after activity-log cloud rehydration finishes.
  const [activityLog, setActivityLog] = React.useState(() =>
    (window.stActivity && window.stActivity.loadActivityLog && window.stActivity.loadActivityLog()) || {}
  );
  React.useEffect(() => {
    const reread = () => {
      try {
        if (window.stActivity?.loadActivityLog) {
          setActivityLog(window.stActivity.loadActivityLog());
        }
      } catch {}
    };
    window.addEventListener('stirio:xpchange', reread);
    window.addEventListener('stirio:activitychange', reread);
    window.addEventListener('focus', reread);
    return () => {
      window.removeEventListener('stirio:xpchange', reread);
      window.removeEventListener('stirio:activitychange', reread);
      window.removeEventListener('focus', reread);
    };
  }, []);
  let lessons = 0, perfect = 0, durationMs = 0;
  for (const k in activityLog) {
    const d = activityLog[k] || {};
    lessons += d.lessons || 0;
    perfect += d.perfect || 0;
    durationMs += d.durationMs || 0;
  }
  const hours = durationMs / 3600000;
  const hoursLabel = hours >= 10 ? Math.round(hours).toString() : hours.toFixed(1);
  const activityTotals = { lessons, perfect, hoursLabel };

  return (
    <div className="mobile-safe" style={{ padding: '24px 20px 120px', maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 2 }}>
      <button className="btn ghost" onClick={onBack} style={{ padding: 8, marginBottom: 18 }}>
        <Icon name="arrowL" size={18} /> Back
      </button>

      {/* hero */}
      <div className="card" style={{
        padding: 28, marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 22,
        background: 'linear-gradient(135deg, var(--amber-soft), var(--bg-2) 60%)',
        borderColor: 'oklch(0.82 0.17 75 / 0.3)',
      }}>
        <label style={{
          width: 86, height: 86, borderRadius: '50%',
          background: (profile.avatar || profile.photoURL) ? 'transparent' : 'linear-gradient(135deg, var(--amber), var(--berry))',
          display: 'grid', placeItems: 'center',
          fontSize: 36, fontWeight: 600, color: 'var(--bg-0)',
          boxShadow: '0 0 30px var(--amber-glow)',
          position: 'relative', overflow: 'hidden', cursor: 'pointer',
          flexShrink: 0,
        }} title="Cambiar foto">
          {(profile.avatar || profile.photoURL) ? (
            <img src={profile.avatar || profile.photoURL} alt="avatar" referrerPolicy="no-referrer" style={{
              width: '100%', height: '100%', objectFit: 'cover',
            }} />
          ) : (
            <span>{(profile.name || '?').slice(0, 1).toUpperCase()}</span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files && e.target.files[0];
              if (!file) return;
              // Always update local state immediately for snappy UX
              const reader = new FileReader();
              reader.onload = () => {
                onUpdateProfile && onUpdateProfile({ avatar: reader.result });
              };
              reader.readAsDataURL(file);
              // If signed in, also upload to Firebase Storage so it syncs across devices
              const signedIn = window.stAuth && window.stAuth.getCurrentUser && window.stAuth.getCurrentUser() && !window.stAuth.getCurrentUser().isGuest;
              if (signedIn && window.stAuth.uploadProfilePhoto) {
                try {
                  const url = await window.stAuth.uploadProfilePhoto(file);
                  onUpdateProfile && onUpdateProfile({ avatar: url });
                } catch (err) {
                  console.warn('photo upload failed:', err);
                }
              }
            }}
            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
          />
        </label>
        <div style={{ flex: 1 }}>
          <div className="mono caps" style={{ color: 'var(--amber)', fontSize: 10 }}>
            {(() => {
              if (!(window.stLang && window.stLang.t)) return `level ${profile.level} · ${profile.title}`;
              const titleKey = `profile.level.${profile.level}.title`;
              const titleVal = window.stLang.t(titleKey);
              const title = (titleVal && titleVal !== titleKey) ? titleVal : (profile.title || '');
              return window.stLang.t('profile.level_line', { level: profile.level, title });
            })()}
          </div>
          <div style={{ fontFamily: 'var(--f-serif)', fontSize: 32, fontWeight: 400, lineHeight: 1 }}>
            {profile.name || tr('profile.stranger', 'stranger')}
          </div>
          <div style={{ color: 'var(--ink-2)', fontSize: 13, marginTop: 2 }}>{tr('profile.joined', 'joined · 🌍 earth')}</div>
        </div>
        <StreakBadge count={profile.streak} />
      </div>

      {/* stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
        <StatTile label={tr('profile.stat_xp', 'TOTAL XP')} value={profile.xp} color="var(--amber)" />
        <StatTile label={tr('profile.stat_lessons', 'LESSONS')} value={activityTotals.lessons} color="var(--cyan)" />
        <StatTile label={tr('profile.stat_perfect', 'PERFECT')} value={activityTotals.perfect} color="var(--violet)" />
        <StatTile label={tr('profile.stat_hours', 'HOURS')} value={activityTotals.hoursLabel} color="var(--berry)" />
      </div>

      {/* activity graph */}
      <section style={{ marginBottom: 24 }}>
        <SectionHeader eyebrow={tr('profile.activity_eyebrow', 'último mes')} title={tr('profile.activity', 'Actividad')} />
        <div className="card" style={{ padding: 18 }}>
          <ActivityHeatmap log={activityLog} />
        </div>
      </section>

      {/* achievements (real, from localStorage + Firestore) */}
      <section style={{ marginBottom: 24 }}>
        <SectionHeader
          eyebrow={`${achievements.filter(a => a.unlocked).length} / ${achievements.length || ACHIEVEMENTS.length}`}
          title={tr('profile.achievements', 'Logros')}
        />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 10,
        }}>
          {(achievements.length ? achievements : ACHIEVEMENTS).map(a => {
            const earned = a.unlocked ?? a.earned;
            const label = a.title || a.label;
            return (
              <div key={a.id} className="card" style={{
                padding: 14, textAlign: 'center',
                opacity: earned ? 1 : 0.35,
                borderColor: earned ? 'oklch(0.82 0.17 75 / 0.3)' : 'var(--line-soft)',
                background: earned ? 'linear-gradient(180deg, var(--amber-soft), var(--bg-2))' : 'var(--bg-1)',
              }}>
                <div style={{ fontSize: 28, marginBottom: 6, filter: earned ? 'drop-shadow(0 0 10px var(--amber-glow))' : 'grayscale(1)' }}>{a.icon}</div>
                <div style={{ fontWeight: 500, fontSize: 12 }}>{label}</div>
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: 9, color: 'var(--ink-3)', marginTop: 2 }}>{a.desc}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* leaderboard full (real, from Firestore) */}
      <section style={{ marginBottom: 24 }}>
        <SectionHeader eyebrow={tr('profile.ranking_eyebrow', 'ranking')} title={tr('profile.ranking_title', 'Ranking global')} />
        <div className="card" style={{ padding: 4 }}>
          {(leaderboard.length ? leaderboard : []).map((p, i) => (
            <div key={`${p.name}-${i}`} style={{
              padding: '12px 14px',
              display: 'flex', alignItems: 'center', gap: 12,
              borderRadius: 'var(--r-md)',
              background: p.self ? 'var(--amber-soft)' : 'transparent',
              border: p.self ? '1px solid oklch(0.82 0.17 75 / 0.4)' : '1px solid transparent',
            }}>
              <div style={{ width: 24, textAlign: 'center', fontFamily: 'var(--f-mono)', fontSize: 13, fontWeight: 600, color: i < 3 ? 'var(--amber)' : 'var(--ink-3)' }}>
                {i + 1}
              </div>
              <div style={{ fontSize: 18 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '•'}</div>
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: p.self ? 600 : 400 }}>{p.name}</span>
                <span style={{ marginLeft: 8, color: 'var(--ink-3)', fontSize: 12, fontFamily: 'var(--f-mono)' }}>Lv {p.level}</span>
              </div>
              <div style={{ fontFamily: 'var(--f-mono)', fontSize: 13, color: p.self ? 'var(--amber)' : 'var(--ink-1)', fontWeight: 600 }}>
                {(p.xp || 0).toLocaleString()}
              </div>
            </div>
          ))}
          {leaderboard.length === 0 && (
            <div style={{ padding: '18px 14px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
              {tr('profile.no_ranking', 'Todavía no hay clasificación. Juega una partida para aparecer aquí.')}
            </div>
          )}
        </div>
      </section>

      {/* SETTINGS */}
      <section style={{ marginBottom: 24 }}>
        <SectionHeader eyebrow={tr('profile.eyebrow_ajustes', 'ajustes')} title={tr('profile.account_title', 'Cuenta')} />
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <SettingsRow
            icon="👤"
            label={tr('profile.name', 'Nombre')}
            value={editingName ? (
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  autoFocus
                  value={tmpName}
                  onChange={e => setTmpName(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false); }}
                  style={{
                    background: 'var(--bg-2)', border: '1px solid var(--amber)',
                    borderRadius: 8, padding: '6px 10px', fontSize: 14,
                    color: 'var(--ink-0)', width: 140, outline: 'none',
                  }}
                />
                <button onClick={saveName} className="btn primary" style={{ padding: '6px 12px', fontSize: 12 }}>OK</button>
              </div>
            ) : (
              <button onClick={() => { setTmpName(profile.name || ''); setEditingName(true); }}
                style={{ color: 'var(--ink-1)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                {profile.name || '—'} <Icon name="edit" size={12} />
              </button>
            )}
          />
          <SettingsRow
            icon="📧"
            label={tr('profile.account', 'Cuenta')}
            value={
              <span
                title={profile.email || ''}
                style={{
                  color: 'var(--ink-2)', fontSize: 13, fontFamily: 'var(--f-mono)',
                  maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap', display: 'inline-block',
                }}
              >
                {profile.email || (profile.authMode === 'guest' ? tr('profile.guest', 'invitado') : '—')}
              </span>
            }
          />
          {(() => {
            // Inline admin gate — kept self-contained so the row appears even
            // if Admin.jsx failed to register window.isAdminUser (partial SW
            // cache on iOS Safari, async script ordering, etc.). Same logic
            // as Admin.jsx's isAdminUser, copied here on purpose.
            const me = window.stAuth?.getCurrentUser?.();
            if (!me || me.isGuest || !onOpenAdmin) return false;
            const email = (me.email || '').trim().toLowerCase();
            return email === 'robinn4k@gmail.com';
          })() && (
            <SettingsRow
              icon="🔧"
              label={tr('profile.admin_panel', 'Consola admin')}
              value={
                <button
                  onClick={onOpenAdmin}
                  style={{ color: 'var(--cyan, var(--amber))', fontSize: 13, fontFamily: 'var(--f-mono)', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  {tr('profile.admin_cta', 'Abrir')} <Icon name="arrowR" size={12} />
                </button>
              }
            />
          )}

          <SettingsDivider />

          <SettingsRow
            icon="🎨"
            label={tr('profile.theme', 'Tema')}
            value={
              <select
                value={tweaks?.theme || 'lounge'}
                onChange={e => onChangeTweak && onChangeTweak('theme', e.target.value)}
                style={{
                  background: 'var(--bg-2)', border: '1px solid var(--line)',
                  borderRadius: 8, padding: '6px 10px', fontSize: 13,
                  color: 'var(--ink-0)', fontFamily: 'var(--f-mono)',
                }}
              >
                <option value="lounge">Lounge · Original</option>
                <option value="daybar">Daybar</option>
                <option value="midnight">Midnight</option>
                <option value="tiki">Tiki</option>
                <option value="punk">Punk</option>
                <option value="mezcal">Mezcal</option>
              </select>
            }
          />
          <SettingsRow
            icon="▶️"
            label={tr('profile.play_shortcut', 'Acceso rápido')}
            value={
              <select
                value={tweaks?.playShortcut || 'daily'}
                onChange={e => onChangeTweak && onChangeTweak('playShortcut', e.target.value)}
                style={{
                  background: 'var(--bg-2)', border: '1px solid var(--line)',
                  borderRadius: 8, padding: '6px 10px', fontSize: 13,
                  color: 'var(--ink-0)', fontFamily: 'var(--f-mono)',
                  maxWidth: 180,
                }}
              >
                {(playShortcuts || []).map(s => (
                  <option key={s.id} value={s.id}>{s.icon} {tr(`app.shortcut.${s.id}`, s.id)}</option>
                ))}
              </select>
            }
          />
          <SettingsRow
            icon="🌐"
            label={tr('profile.language', 'Idioma')}
            value={
              <select
                value={lang}
                onChange={e => {
                  const v = e.target.value;
                  setLang(v);
                  if (window.stLang && window.stLang.setLang) {
                    try { window.stLang.setLang(v); } catch {}
                  }
                  // Fire an app-wide event so components re-render with the new language.
                  window.dispatchEvent(new CustomEvent('stirio:langchange', { detail: { lang: v } }));
                }}
                style={{
                  background: 'var(--bg-2)', border: '1px solid var(--line)',
                  borderRadius: 8, padding: '6px 10px', fontSize: 13,
                  color: 'var(--ink-0)', fontFamily: 'var(--f-mono)',
                }}
              >
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="pt">Português</option>
                <option value="de">Deutsch</option>
              </select>
            }
          />
          <SettingsRow
            icon="🥃"
            label={tr('profile.units', 'Unidades')}
            value={
              <div style={{ display: 'flex', gap: 4, background: 'var(--bg-2)', padding: 3, borderRadius: 8 }}>
                {['ml', 'oz'].map(u => (
                  <button key={u} onClick={() => setUnits(u)} style={{
                    padding: '5px 12px', borderRadius: 6,
                    background: units === u ? 'var(--amber)' : 'transparent',
                    color: units === u ? 'var(--bg-0)' : 'var(--ink-2)',
                    fontFamily: 'var(--f-mono)', fontSize: 12, fontWeight: 600,
                  }}>{u}</button>
                ))}
              </div>
            }
          />

          <SettingsDivider />

          <SettingsRow
            icon="🎬"
            label={tr('profile.reduce_motion', 'Reducir animaciones')}
            value={<Toggle on={reduce} onChange={setReduce} />}
          />
          <SettingsRow
            icon="🔤"
            label={tr('profile.text_size', 'Tamaño de texto')}
            value={
              <div style={{ display: 'flex', gap: 4, background: 'var(--bg-2)', padding: 3, borderRadius: 8 }}>
                {[['sm','A'],['default','A'],['lg','A']].map(([v, a], i) => (
                  <button key={v} onClick={() => setTextScale(v)} style={{
                    padding: '5px 10px', borderRadius: 6,
                    background: textScale === v ? 'var(--amber)' : 'transparent',
                    color: textScale === v ? 'var(--bg-0)' : 'var(--ink-2)',
                    fontSize: i === 0 ? 11 : i === 1 ? 13 : 16, fontWeight: 600,
                  }}>{a}</button>
                ))}
              </div>
            }
          />

          <SettingsDivider />

          <SettingsRow
            icon="💾"
            label={tr('profile.export', 'Exportar datos')}
            value={<button onClick={() => {
              const data = JSON.stringify({ profile, tweaks }, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url; a.download = 'stirio-datos.json'; a.click();
            }} style={{ color: 'var(--cyan)', fontSize: 13, fontFamily: 'var(--f-mono)' }}>{tr('profile.export_cta', 'descargar ↓')}</button>}
          />
          <SettingsRow
            icon="🔄"
            label={tr('profile.force_update', 'Forzar actualización')}
            value={<button onClick={async () => {
              if (!confirm(tr('profile.force_update_confirm', '¿Limpiar la caché y recargar? Tu progreso (XP, racha) se queda intacto en la nube; se borra solo la copia offline para forzar la nueva versión.'))) return;
              try {
                if ('serviceWorker' in navigator) {
                  const regs = await navigator.serviceWorker.getRegistrations();
                  await Promise.all(regs.map(r => r.unregister().catch(() => {})));
                }
                if (typeof caches !== 'undefined') {
                  const keys = await caches.keys();
                  await Promise.all(keys.map(k => caches.delete(k).catch(() => {})));
                }
              } catch (e) { console.warn('force update cleanup failed:', e); }
              try { window.location.reload(); } catch { window.location.href = window.location.href; }
            }} style={{ color: 'var(--amber)', fontSize: 13, fontFamily: 'var(--f-mono)' }}>{tr('profile.force_update_cta', 'recargar →')}</button>}
          />
          <SettingsRow
            icon="🗑️"
            label={tr('profile.delete_progress', 'Borrar progreso')}
            value={<button onClick={async () => {
              const cu = window.stAuth?.getCurrentUser?.();
              const who = cu?.email || cu?.name || '';
              // Show the account identifier in the confirm dialog so the user
              // never accidentally wipes the wrong one.
              const msg = window.stLang?.t
                ? window.stLang.t('profile.delete_progress_confirm_who', { who })
                : tr('profile.delete_progress_confirm', '¿Borrar todo tu progreso? Esto restablece XP, nivel y estadísticas.');
              const resolved = (msg && msg !== 'profile.delete_progress_confirm_who')
                ? msg
                : `¿Borrar el progreso de ${who}? Esto restablece XP, nivel y estadísticas.`;
              if (!confirm(resolved)) return;
              const signedIn = cu && !cu.isGuest;
              if (signedIn && window.stAuth.deleteUserData) {
                try {
                  await window.stAuth.deleteUserData();
                } catch (e) {
                  if (e && e.code === 'auth-state-unstable') {
                    alert(tr('profile.reset_unstable', 'La sesión está cambiando de cuenta. Espera unos segundos y vuelve a intentarlo.'));
                    return;
                  }
                  console.warn('cloud wipe failed:', e);
                }
              }
              onResetData && onResetData();
            }} style={{ color: 'var(--bad)', fontSize: 13, fontFamily: 'var(--f-mono)' }}>{tr('profile.delete_progress_cta', 'borrar →')}</button>}
          />
          <SettingsRow
            icon="🚪"
            label={tr('profile.sign_out', 'Cerrar sesión')}
            value={<button onClick={() => {
              if (confirm(tr('profile.sign_out_confirm', '¿Cerrar sesión? Volverás al onboarding.'))) {
                onLogout && onLogout();
              }
            }} style={{ color: 'var(--bad)', fontSize: 13, fontFamily: 'var(--f-mono)' }}>{tr('profile.sign_out_cta', 'logout →')}</button>}
          />
          <SettingsRow
            icon="⚠️"
            label={tr('profile.delete_account', 'Borrar cuenta')}
            isLast
            value={<button onClick={async () => {
              const me = window.stAuth && window.stAuth.getCurrentUser && window.stAuth.getCurrentUser();
              if (!me || me.isGuest) {
                alert(tr('profile.delete_account_only_google', 'Solo disponible para cuentas Google.'));
                return;
              }
              if (!confirm(tr('profile.delete_account_confirm', '¿Borrar tu cuenta de Stirio y todos tus datos? Esta acción es irreversible.'))) return;
              try {
                await window.stAuth.deleteUserAccount();
                onLogout && onLogout();
              } catch (e) {
                alert(tr('profile.delete_account_error', 'No se pudo borrar la cuenta. Reinicia sesión y vuelve a intentarlo.'));
                console.warn('delete account failed:', e);
              }
            }} style={{ color: 'var(--bad)', fontSize: 13, fontFamily: 'var(--f-mono)' }}>{tr('profile.delete_account_cta', 'eliminar →')}</button>}
          />
        </div>

        <div style={{
          marginTop: 14, textAlign: 'center',
          fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-4)',
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          Stirio v{typeof window !== 'undefined' && window.STIRIO_VERSION ? window.STIRIO_VERSION : '0.0.0'} · {tr('profile.made_with_love', 'Hecho con ❤️ en Málaga')}
        </div>
      </section>
    </div>
  );
};

const SettingsRow = ({ icon, label, value, isLast }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 18px',
    borderBottom: isLast ? 'none' : '1px solid var(--line-soft)',
    minHeight: 56,
  }}>
    <div style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{icon}</div>
    <div style={{ flex: 1, fontSize: 14, color: 'var(--ink-1)' }}>{label}</div>
    <div>{value}</div>
  </div>
);

const SettingsDivider = () => (
  <div style={{ height: 8, background: 'var(--bg-0)' }} />
);

const Toggle = ({ on, onChange }) => (
  <button onClick={() => onChange(!on)} style={{
    width: 44, height: 26, borderRadius: 999,
    background: on ? 'var(--amber)' : 'var(--bg-3)',
    border: '1px solid ' + (on ? 'transparent' : 'var(--line)'),
    position: 'relative', transition: 'background .2s',
    boxShadow: on ? '0 0 12px var(--amber-glow)' : 'none',
  }}>
    <div style={{
      position: 'absolute', top: 2, left: on ? 20 : 2,
      width: 20, height: 20, borderRadius: '50%',
      background: '#fff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
      transition: 'left .2s cubic-bezier(.2,1.4,.3,1)',
    }} />
  </button>
);

const StatTile = ({ label, value, color }) => (
  <div className="card" style={{ padding: 14 }}>
    <div style={{
      fontFamily: 'var(--f-mono)', fontSize: 22, fontWeight: 600, color,
      letterSpacing: '-0.02em',
    }}>
      {value}
    </div>
    <div className="mono caps" style={{ fontSize: 9, color: 'var(--ink-3)', marginTop: 2 }}>{label}</div>
  </div>
);

const ActivityHeatmap = ({ log }) => {
  // 7 cols × 5 rows = last 35 days (≈ último mes). Today is top-left,
  // going back in time toward bottom-right (oldest).
  const days = 35;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  const dayKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const cells = [];
  let maxXp = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const entry = (log && log[dayKey(d)]) || null;
    const xp = entry ? (entry.xp || 0) : 0;
    const lessons = entry ? (entry.lessons || 0) : 0;
    if (xp > maxXp) maxXp = xp;
    cells.push({ xp, lessons });
  }
  const scale = maxXp > 0 ? maxXp : 1;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5, maxWidth: 380 }}>
      {cells.map((c, i) => {
        // Intensity from XP when available; fallback to a minimum tint when
        // there was any activity (lessons > 0) so "played today" never looks
        // like an empty cell.
        const xpIntensity = c.xp > 0 ? Math.min(1, c.xp / scale) : 0;
        const v = xpIntensity > 0 ? xpIntensity : (c.lessons > 0 ? 0.35 : 0);
        return (
          <div key={i} style={{
            aspectRatio: 1,
            borderRadius: 4,
            background: v === 0 ? 'var(--bg-3)' : `oklch(0.82 0.17 75 / ${0.2 + v * 0.8})`,
            boxShadow: v > 0.6 ? '0 0 6px var(--amber-glow)' : 'none',
          }} />
        );
      })}
    </div>
  );
};

Object.assign(window, { Profile });

// ─────────────────────────────────────────────────────────────────
// Admin console — moved here from js/screens/Admin.jsx because the
// separate Babel-script tag silently failed to register window.AdminScreen
// on iOS Safari (likely const Skeleton redeclaration conflict with the one
// in ui.jsx, since Babel-standalone executes compiled scripts at global
// scope on WebKit). Co-locating here guarantees Admin loads with Profile,
// which is the only entry point that opens the console.
// ─────────────────────────────────────────────────────────────────

const ADMIN_EMAIL = 'robinn4k@gmail.com';
const REPO_OWNER = 'robinn4k';
const REPO_NAME = 'Stirio';
const WORKFLOW_FILE = 'ai-content.yml';
const GITHUB_API = 'https://api.github.com';

function isAdminUser() {
  const me = window.stAuth?.getCurrentUser?.();
  if (!me || me.isGuest) return false;
  const email = (me.email || '').trim().toLowerCase();
  const ok = email === ADMIN_EMAIL;
  if (!ok && email) console.info('[admin] gate denied for', email);
  return ok;
}

const AdminScreen = ({ onBack }) => {
  const tr = (k, f) => (window.stUiT ? window.stUiT(k, f) : (f || k));
  const [coverage, setCoverage] = React.useState(null);
  const [runs, setRuns] = React.useState({ status: 'loading', items: [], error: null });
  const [prs, setPrs] = React.useState({ status: 'loading', items: [], error: null });
  const [refreshTick, setRefreshTick] = React.useState(0);
  const [refreshing, setRefreshing] = React.useState(true);
  // GitHub PAT for workflow_dispatch — lives in localStorage of this device only.
  // Required scope: `repo` (or `public_repo` if Stirio repo stays public).
  const [pat, setPatState] = React.useState(() => {
    try { return localStorage.getItem('stirio::admin::github_pat') || ''; } catch { return ''; }
  });
  const setPat = (next) => {
    try {
      if (next) localStorage.setItem('stirio::admin::github_pat', next);
      else localStorage.removeItem('stirio::admin::github_pat');
    } catch {}
    setPatState(next);
  };

  // Clear `refreshing` once all three panels exit their loading state.
  React.useEffect(() => {
    if (refreshing && coverage !== null && runs.status !== 'loading' && prs.status !== 'loading') {
      setRefreshing(false);
    }
  }, [refreshing, coverage, runs.status, prs.status]);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const cov = await window.stLang?.getCoverage?.();
        if (!cancelled && cov) setCoverage(cov);
      } catch (e) {
        if (!cancelled) setCoverage({ error: String(e?.message || e) });
      }
    })();
    return () => { cancelled = true; };
  }, [refreshTick]);

  React.useEffect(() => {
    let cancelled = false;
    setRuns({ status: 'loading', items: [], error: null });
    fetch(
      `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/actions/workflows/${WORKFLOW_FILE}/runs?per_page=15`
    )
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(data => {
        if (cancelled) return;
        const items = (data.workflow_runs || []).map(run => ({
          id: run.id,
          name: run.display_title || run.name || `run ${run.id}`,
          status: run.status,
          conclusion: run.conclusion,
          created_at: run.created_at,
          html_url: run.html_url,
        }));
        setRuns({ status: 'ready', items, error: null });
      })
      .catch(err => {
        if (!cancelled) setRuns({ status: 'error', items: [], error: String(err?.message || err) });
      });
    return () => { cancelled = true; };
  }, [refreshTick]);

  React.useEffect(() => {
    let cancelled = false;
    setPrs({ status: 'loading', items: [], error: null });
    fetch(
      `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/pulls?state=open&per_page=30`
    )
      .then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`)))
      .then(data => {
        if (cancelled) return;
        const items = (Array.isArray(data) ? data : [])
          .filter(pr => typeof pr.title === 'string' && pr.title.startsWith('AI content'))
          .map(pr => ({
            number: pr.number,
            title: pr.title,
            draft: !!pr.draft,
            head: pr.head?.ref || '',
            html_url: pr.html_url,
            created_at: pr.created_at,
          }));
        setPrs({ status: 'ready', items, error: null });
      })
      .catch(err => {
        if (!cancelled) setPrs({ status: 'error', items: [], error: String(err?.message || err) });
      });
    return () => { cancelled = true; };
  }, [refreshTick]);

  if (!isAdminUser()) {
    return (
      <div className="mobile-safe" style={{ padding: '24px 20px 120px', maxWidth: 720, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <button className="btn ghost" onClick={onBack} style={{ padding: 8, marginBottom: 18 }}>
          <Icon name="arrowL" size={18} /> Back
        </button>
        <div className="card" style={{ padding: 24, textAlign: 'center', color: 'var(--ink-2)' }}>
          {tr('admin.gate_denied', 'Esta consola es solo para el administrador.')}
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-safe" style={{ padding: '24px 20px 120px', maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 2 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <button className="btn ghost" onClick={onBack} style={{ padding: 8 }}>
          <Icon name="arrowL" size={18} /> Back
        </button>
        <button
          className="btn ghost"
          onClick={() => { setRefreshing(true); setCoverage(null); setRefreshTick(t => t + 1); }}
          disabled={refreshing}
          style={{ padding: '6px 12px', fontFamily: 'var(--f-mono)', fontSize: 11, opacity: refreshing ? 0.6 : 1 }}
          aria-label={tr('admin.refresh', 'Actualizar')}
        >
          <span style={refreshing ? { display: 'inline-block', animation: 'spin 0.8s linear infinite' } : null}>
            <Icon name="refresh" size={14} />
          </span>
          {' '}{refreshing ? tr('admin.refreshing', 'Actualizando…') : tr('admin.refresh', 'Actualizar')}
        </button>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div className="mono caps" style={{ color: 'var(--ink-3)', fontSize: 10, marginBottom: 4 }}>
          admin
        </div>
        <h1 style={{
          fontFamily: 'var(--f-serif)', fontSize: 32, fontWeight: 400,
          margin: 0, letterSpacing: '-0.02em',
        }}>
          {tr('admin.title', 'Consola admin')}
        </h1>
      </div>

      <section style={{ marginBottom: 28 }}>
        <SectionHeader
          eyebrow={tr('admin.coverage_eyebrow', 'i18n')}
          title={tr('admin.coverage_title', 'Cobertura de traducciones')}
        />
        <div className="card" style={{ padding: 18 }}>
          <CoverageList data={coverage} tr={tr} />
        </div>
      </section>

      <section style={{ marginBottom: 28 }}>
        <SectionHeader
          eyebrow={tr('admin.pending_eyebrow', 'i18n debt')}
          title={tr('admin.pending_title', 'Deuda pendiente i18n')}
        />
        <div className="card" style={{ padding: 18 }}>
          <PendingList data={coverage} tr={tr} />
        </div>
      </section>

      <section style={{ marginBottom: 28 }}>
        <SectionHeader
          eyebrow={tr('admin.actions_eyebrow', 'controls')}
          title={tr('admin.actions_title', 'Lanzar workflows IA')}
        />
        <div className="card" style={{ padding: 18 }}>
          <ActionsPanel
            pat={pat}
            setPat={setPat}
            tr={tr}
            onDispatched={() => { setRefreshing(true); setRefreshTick(t => t + 1); }}
          />
        </div>
      </section>

      <section style={{ marginBottom: 28 }}>
        <SectionHeader
          eyebrow={tr('admin.runs_eyebrow', 'github actions')}
          title={tr('admin.runs_title', 'Últimas ejecuciones de la IA')}
        />
        <div className="card" style={{ padding: 4 }}>
          <RunsList state={runs} tr={tr} />
        </div>
      </section>

      <section style={{ marginBottom: 28 }}>
        <SectionHeader
          eyebrow={tr('admin.prs_eyebrow', 'pull requests')}
          title={tr('admin.prs_title', 'PRs abiertos por la IA')}
        />
        <div className="card" style={{ padding: 4 }}>
          <PrsList state={prs} tr={tr} />
        </div>
      </section>

      <div style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 11, fontFamily: 'var(--f-mono)' }}>
        {tr('admin.footer_note', 'Datos públicos · 60 req/h por IP · sin estado en cliente')}
      </div>
    </div>
  );
};

const CoverageList = ({ data, tr }) => {
  if (!data) return <AdminSkeleton lines={4} />;
  if (data.error) {
    return (
      <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>
        {tr('admin.coverage_error', 'No se pudo calcular la cobertura:')} {data.error}
      </div>
    );
  }
  const langs = ['es', 'en', 'fr', 'pt', 'de'];
  const pendingTotal = data.pending?.total || 0;
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>
        {tr('admin.coverage_baseline', 'baseline ES')}: {data.baseline} {tr('admin.coverage_keys', 'claves')}
      </div>
      {langs.map(lang => {
        const row = data[lang] || { translated: 0, missing: 0, percent: 0 };
        const pct = Math.round(row.percent * 100);
        const color = pct >= 95 ? 'var(--mint, var(--amber))' : pct >= 80 ? 'var(--amber)' : 'var(--berry)';
        // ES uses its own translated count as denominator (4469 incl. pending);
        // other languages compare against the post-exclusion baseline (4013).
        const denom = lang === 'es' ? row.translated : data.baseline;
        return (
          <div key={lang}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              marginBottom: 6,
            }}>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, textTransform: 'uppercase' }}>
                {lang}
                {lang === 'es' && pendingTotal > 0 && (
                  <span style={{ fontFamily: 'var(--f-mono)', fontSize: 10, color: 'var(--ink-3)', marginLeft: 8, textTransform: 'none' }}>
                    · {tr('admin.coverage_includes_pending', 'incluye {n} pendientes').replace('{n}', pendingTotal)}
                  </span>
                )}
              </span>
              <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink-2)' }}>
                {row.translated}/{denom} · {pct}%
              </span>
            </div>
            <div style={{
              height: 6, background: 'var(--bg-2)', borderRadius: 99,
              border: '1px solid var(--line-soft)', overflow: 'hidden',
            }}>
              <div style={{
                width: `${pct}%`, height: '100%',
                background: color, transition: 'width .3s',
              }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PendingList = ({ data, tr }) => {
  if (!data) return <AdminSkeleton lines={3} />;
  if (!data.pending || !data.pending.total) {
    return (
      <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>
        {tr('admin.pending_empty', 'No hay claves pendientes 🎉')}
      </div>
    );
  }
  return (
    <div style={{ display: 'grid', gap: 4 }}>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)', marginBottom: 6 }}>
        {tr('admin.pending_total', 'total')}: {data.pending.total} {tr('admin.coverage_keys', 'claves')}
        {' · '}{data.pending.byPrefix.length} {tr('admin.pending_prefixes', 'prefijos')}
      </div>
      {data.pending.byPrefix.map(({ prefix, count }) => (
        <div key={prefix} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          padding: '8px 0', borderBottom: '1px solid var(--line-soft)',
        }}>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 11, color: 'var(--ink-1)', wordBreak: 'break-all', marginRight: 12 }}>
            {prefix}
          </span>
          <span style={{ fontFamily: 'var(--f-mono)', fontSize: 12, color: 'var(--ink-2)', flexShrink: 0 }}>
            {count}
          </span>
        </div>
      ))}
    </div>
  );
};

// Workflow trigger panel — POSTs to api.github.com/repos/.../workflows/.../dispatches
// using a PAT stored in localStorage. Surfaces 4 actions covering the auto cron
// pipeline plus the three granular modes of the manual ai-content.yml workflow.
const ActionsPanel = ({ pat, setPat, tr, onDispatched }) => {
  const [draft, setDraft] = React.useState('');
  const [editing, setEditing] = React.useState(!pat);
  const [busy, setBusy] = React.useState(null);

  const dispatch = async (workflowFile, inputs) => {
    if (!pat) return;
    setBusy(workflowFile + JSON.stringify(inputs || {}));
    try {
      const res = await fetch(
        `https://api.github.com/repos/robinn4k/Stirio/actions/workflows/${workflowFile}/dispatches`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${pat}`,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ref: 'main', inputs: inputs || {} }),
        }
      );
      if (res.status === 204) {
        window.stToast?.show?.(tr('admin.dispatch_ok', 'Workflow lanzado · revisa en 1-2 min'));
        onDispatched?.();
      } else {
        const text = await res.text().catch(() => '');
        window.stToast?.show?.(`HTTP ${res.status}: ${text.slice(0, 120)}`);
      }
    } catch (e) {
      window.stToast?.show?.(`Error: ${e?.message || e}`);
    } finally {
      setBusy(null);
    }
  };

  if (editing) {
    return (
      <div style={{ display: 'grid', gap: 10 }}>
        <p style={{ fontSize: 12, color: 'var(--ink-2)', margin: 0, lineHeight: 1.5 }}>
          {tr('admin.pat_required', 'Se necesita un GitHub PAT con scopes `repo` para disparar workflows')}
        </p>
        <input
          type="password"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder={tr('admin.pat_placeholder', 'ghp_… (token con scope repo)')}
          autoComplete="off"
          spellCheck={false}
          style={{
            padding: '10px 12px', borderRadius: 8,
            background: 'var(--bg-2)', border: '1px solid var(--line)',
            color: 'var(--ink-0)', fontFamily: 'var(--f-mono)', fontSize: 12,
          }}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="btn"
            onClick={() => { if (draft.trim()) { setPat(draft.trim()); setDraft(''); setEditing(false); } }}
            disabled={!draft.trim()}
            style={{ padding: '8px 14px', fontSize: 12, flex: 1 }}
          >
            {tr('admin.pat_save', 'Guardar token')}
          </button>
          <a
            href="https://github.com/settings/tokens/new?scopes=repo&description=Stirio%20admin%20console"
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: '8px 14px', fontSize: 12, color: 'var(--cyan, var(--amber))', textDecoration: 'none', alignSelf: 'center' }}
          >
            {tr('admin.pat_generate_link', 'Generar uno nuevo en github.com')} →
          </a>
        </div>
      </div>
    );
  }

  const actions = [
    { label: tr('admin.action_full_pipeline', 'Pipeline completo'), file: 'ai-content-auto.yml', inputs: {} },
    { label: tr('admin.action_translate', 'Solo traducir'), file: 'ai-content.yml', inputs: { mode: 'translate' } },
    { label: tr('admin.action_review', 'Solo revisar'), file: 'ai-content.yml', inputs: { mode: 'review' } },
    { label: tr('admin.action_complete', 'Solo completar'), file: 'ai-content.yml', inputs: { mode: 'complete' } },
  ];

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        {actions.map(({ label, file, inputs }) => {
          const key = file + JSON.stringify(inputs);
          const isBusy = busy === key;
          return (
            <button
              key={label}
              className="btn"
              onClick={() => dispatch(file, inputs)}
              disabled={!!busy}
              style={{ padding: '10px 12px', fontSize: 12, opacity: busy && !isBusy ? 0.5 : 1 }}
            >
              {isBusy ? '…' : label}
            </button>
          );
        })}
      </div>
      <button
        className="btn ghost"
        onClick={() => { setPat(''); setDraft(''); setEditing(true); }}
        style={{ padding: '6px 12px', fontSize: 11, color: 'var(--ink-3)', alignSelf: 'flex-start' }}
      >
        {tr('admin.pat_change', 'Cambiar token')}
      </button>
    </div>
  );
};

const RunsList = ({ state, tr }) => {
  if (state.status === 'loading') return <div style={{ padding: 14 }}><AdminSkeleton lines={3} /></div>;
  if (state.status === 'error') return (
    <div style={{ padding: '14px 16px', color: 'var(--ink-3)', fontSize: 13 }}>
      {tr('admin.offline_warning', 'Sin conexión a la API de GitHub.')} {state.error}
    </div>
  );
  if (!state.items.length) return (
    <div style={{ padding: '14px 16px', color: 'var(--ink-3)', fontSize: 13 }}>
      {tr('admin.runs_empty', 'Aún no hay ejecuciones.')}
    </div>
  );
  return state.items.map(run => {
    const conclusionIcon = run.conclusion === 'success' ? '✅'
      : run.conclusion === 'failure' ? '🔴'
      : run.conclusion === 'cancelled' ? '⏹'
      : run.status === 'in_progress' ? '⏳'
      : run.status === 'queued' ? '🟡' : '⚪';
    return (
      <a
        key={run.id}
        href={run.html_url}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 14px', borderRadius: 'var(--r-md)',
          textDecoration: 'none', color: 'inherit',
        }}
      >
        <div style={{ fontSize: 18 }}>{conclusionIcon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13, lineHeight: 1.3,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{run.name}</div>
          <div style={{ fontSize: 10, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>
            {run.conclusion || run.status} · {formatRelative(run.created_at)}
          </div>
        </div>
      </a>
    );
  });
};

const PrsList = ({ state, tr }) => {
  if (state.status === 'loading') return <div style={{ padding: 14 }}><AdminSkeleton lines={3} /></div>;
  if (state.status === 'error') return (
    <div style={{ padding: '14px 16px', color: 'var(--ink-3)', fontSize: 13 }}>
      {tr('admin.offline_warning', 'Sin conexión a la API de GitHub.')} {state.error}
    </div>
  );
  if (!state.items.length) return (
    <div style={{ padding: '14px 16px', color: 'var(--ink-3)', fontSize: 13 }}>
      {tr('admin.prs_empty', 'No hay PRs abiertos por la IA.')}
    </div>
  );
  return state.items.map(pr => (
    <a
      key={pr.number}
      href={pr.html_url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 14px', borderRadius: 'var(--r-md)',
        textDecoration: 'none', color: 'inherit',
      }}
    >
      <div style={{ fontSize: 18 }}>{pr.draft ? '📝' : '📬'}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13, lineHeight: 1.3,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>#{pr.number} · {pr.title}</div>
        <div style={{ fontSize: 10, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>
          {pr.draft ? tr('admin.pr_draft', 'draft') : tr('admin.pr_open', 'open')} · {formatRelative(pr.created_at)}
        </div>
      </div>
    </a>
  ));
};

// Renamed from Skeleton to avoid colliding with the const Skeleton declared
// in ui.jsx (different signature: { lines } vs { h, w, radius }) — that
// redeclaration was the suspected cause of Admin.jsx silently failing to
// register window.AdminScreen on iOS Safari WebKit.
const AdminSkeleton = ({ lines = 3 }) => (
  <div style={{ display: 'grid', gap: 8 }}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} style={{
        height: 12, borderRadius: 6,
        background: 'var(--bg-2)',
        opacity: 0.6 + (i % 2) * 0.2,
        width: `${60 + (i * 10) % 40}%`,
      }} />
    ))}
  </div>
);

function formatRelative(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diff = Math.max(0, now - then);
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  return `hace ${d}d`;
}

Object.assign(window, { AdminScreen, isAdminUser });
