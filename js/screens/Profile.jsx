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
