import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { ROLE_LABELS } from '../utils/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  users: UserProfile[];
  onLogin: (user: UserProfile) => void;
  onRegister: (newUser: Omit<UserProfile, 'id' | 'createdAt'>) => void;
  onDeleteUser?: (userId: string) => void;
  onLogout?: () => void;
  onNotify: (msg: string) => void;
  mode?: 'login' | 'register' | 'switch';
}

const AVATAR_OPTIONS = ['👩‍🍳', '🧑‍🍳', '🛍️', '🥣', '📦', '🧁', '🍰', '🍮', '🥛', '💼', '⭐', '✨'];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  onLogin,
  onRegister,
  onDeleteUser,
  onLogout,
  onNotify,
  mode: initialMode = 'login',
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'switch'>(initialMode);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      setLoginError('');
      setRegError('');
    }
  }, [isOpen, initialMode]);

  // Login form state
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser?.id || users[0]?.id || '');
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Register form state
  const [regName, setRegName] = useState<string>('');
  const [regUsername, setRegUsername] = useState<string>('');
  const [regRole, setRegRole] = useState<UserRole>('sales');
  const [regEmoji, setRegEmoji] = useState<string>('🛍️');
  const [regPin, setRegPin] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regError, setRegError] = useState<string>('');

  if (!isOpen) return null;

  const handleQuickLogin = (user: UserProfile) => {
    if (user.pin && user.pin !== '0000') {
      setSelectedUserId(user.id);
      setActiveTab('login');
      setEnteredPin('');
      setLoginError('');
      return;
    }
    // Direct login if standard PIN
    onLogin(user);
    onNotify(`👋 ¡Bienvenida/o, ${user.name}!`);
    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const targetUser = users.find((u) => u.id === selectedUserId);
    if (!targetUser) {
      setLoginError('Selecciona un usuario válido.');
      return;
    }

    if (targetUser.pin && enteredPin.trim() !== targetUser.pin) {
      setLoginError('PIN incorrecto. Inténtalo de nuevo.');
      return;
    }

    onLogin(targetUser);
    onNotify(`👋 Sesión iniciada como: ${targetUser.name}`);
    setEnteredPin('');
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim()) {
      setRegError('Ingresa el nombre del colaborador o artesano.');
      return;
    }

    const cleanUsername = regUsername.trim().toLowerCase().replace(/\s+/g, '_');
    if (!cleanUsername) {
      setRegError('Ingresa un nombre de usuario (ej. sofia_caja).');
      return;
    }

    if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
      setRegError('Ese nombre de usuario ya existe. Elige otro.');
      return;
    }

    if (regPin.length < 4) {
      setRegError('El PIN debe tener al menos 4 dígitos o caracteres.');
      return;
    }

    onRegister({
      name: regName.trim(),
      username: cleanUsername,
      role: regRole,
      avatarEmoji: regEmoji,
      pin: regPin.trim(),
      email: regEmail.trim() || undefined,
    });

    onNotify(`✅ Perfil "${regName.trim()}" registrado con éxito.`);
    // Reset form
    setRegName('');
    setRegUsername('');
    setRegPin('');
    setRegEmail('');
    setActiveTab('switch');
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '540px', width: '92%' }}
      >
        {/* Modal Header */}
        <div
          className="modal-header"
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🔐</span>
            <div>
              <h2 id="auth-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
                Control de Acceso & Perfiles del Taller
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--muted)' }}>
                Perfiles separados con permisos a la medida para Dueña, Ventas y Producción
              </p>
            </div>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Cerrar ventana de acceso"
            style={{ fontSize: '18px', background: 'transparent', border: 'none', color: 'var(--muted)' }}
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            background: 'var(--paper)',
            padding: '6px 24px',
            borderBottom: '1px solid var(--line)',
            gap: '8px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'login' ? 'var(--white)' : 'transparent',
              color: activeTab === 'login' ? 'var(--ink)' : 'var(--muted)',
              fontWeight: activeTab === 'login' ? 750 : 550,
              fontSize: '13px',
              boxShadow: activeTab === 'login' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            🔑 Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('switch')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'switch' ? 'var(--white)' : 'transparent',
              color: activeTab === 'switch' ? 'var(--ink)' : 'var(--muted)',
              fontWeight: activeTab === 'switch' ? 750 : 550,
              fontSize: '13px',
              boxShadow: activeTab === 'switch' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            👥 Perfiles ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'register' ? 'var(--white)' : 'transparent',
              color: activeTab === 'register' ? 'var(--ink)' : 'var(--muted)',
              fontWeight: activeTab === 'register' ? 750 : 550,
              fontSize: '13px',
              boxShadow: activeTab === 'register' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            ➕ Nuevo Perfil
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '20px 24px', maxHeight: '72vh', overflowY: 'auto' }}>
          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="field-label" style={{ margin: '0 0 6px', display: 'block', fontSize: '13px', fontWeight: 700 }}>
                  Selecciona tu Perfil de Trabajo
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                  {users.map((u) => {
                    const isSelected = selectedUserId === u.id;
                    return (
                      <div
                        key={u.id}
                        onClick={() => setSelectedUserId(u.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: isSelected ? '2px solid var(--lime)' : '1px solid var(--line)',
                          background: isSelected ? 'var(--mint)' : 'var(--white)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '24px' }}>{u.avatarEmoji}</span>
                          <div>
                            <strong style={{ fontSize: '13.5px', color: 'var(--ink)', display: 'block' }}>
                              {u.name}
                            </strong>
                            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                              @{u.username} · {ROLE_LABELS[u.role].label}
                            </span>
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: isSelected ? 'var(--deep)' : 'var(--paper)',
                            color: isSelected ? 'var(--lime)' : 'var(--muted)',
                          }}
                        >
                          {ROLE_LABELS[u.role].badge}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PIN / Password Input */}
              <div>
                <label className="field-label" style={{ margin: '0 0 6px', display: 'block', fontSize: '13px', fontWeight: 700 }}>
                  PIN de Acceso (4 dígitos)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={10}
                  className="margin-input"
                  placeholder="Ej. 1234"
                  value={enteredPin}
                  onChange={(e) => setEnteredPin(e.target.value)}
                  style={{
                    fontSize: '18px',
                    letterSpacing: '4px',
                    textAlign: 'center',
                    padding: '12px',
                    borderRadius: '10px',
                    width: '100%',
                    background: 'var(--white)',
                    border: '1px solid var(--line)',
                  }}
                  autoFocus
                />
                <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginTop: '4px', textAlign: 'center' }}>
                  PIN predeterminado de Elena (Dueña): <b>1234</b> · Sofía (Ventas): <b>0000</b> · Carlos (Taller): <b>5555</b>
                </span>
              </div>

              {loginError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px', borderRadius: '8px', fontSize: '12.5px', textAlign: 'center' }}>
                  ⚠️ {loginError}
                </div>
              )}

              <button
                type="submit"
                className="primary-btn"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 800,
                  marginTop: '4px',
                }}
              >
                Ingresar al Sistema
              </button>
            </form>
          )}

          {/* TAB 2: SWITCH PROFILES */}
          {activeTab === 'switch' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--muted)' }}>
                Toca cualquier perfil para cambiar de usuario al instante:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {users.map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <div
                      key={u.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: isCurrent ? '2px solid var(--lime)' : '1px solid var(--line)',
                        background: isCurrent ? 'var(--mint)' : 'var(--white)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '28px' }}>{u.avatarEmoji}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <strong style={{ fontSize: '14px', color: 'var(--ink)' }}>{u.name}</strong>
                            {isCurrent && (
                              <span style={{ fontSize: '9.5px', fontWeight: 800, background: 'var(--deep)', color: 'var(--lime)', padding: '2px 6px', borderRadius: '4px' }}>
                                ACTIVO
                              </span>
                            )}
                          </div>
                          <span style={{ fontSize: '11.5px', color: 'var(--muted)', display: 'block', marginTop: '2px' }}>
                            Rol: <b>{ROLE_LABELS[u.role].label}</b>
                          </span>
                          <span style={{ fontSize: '10.5px', color: 'var(--muted)', display: 'block' }}>
                            {ROLE_LABELS[u.role].desc}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {!isCurrent ? (
                          <button
                            type="button"
                            className="primary-btn"
                            onClick={() => handleQuickLogin(u)}
                            style={{ padding: '6px 14px', fontSize: '12px' }}
                          >
                            Activar
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--green)', fontWeight: 800 }}>
                            ✓ En turno
                          </span>
                        )}

                        {onDeleteUser && users.length > 1 && !isCurrent && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`¿Segura que deseas eliminar el perfil de "${u.name}"?`)) {
                                onDeleteUser(u.id);
                                onNotify(`Perfil "${u.name}" eliminado.`);
                              }
                            }}
                            title="Eliminar perfil"
                            style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', padding: '6px', fontSize: '14px' }}
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ background: 'var(--paper)', borderRadius: '10px', padding: '12px', border: '1px solid var(--line)', marginTop: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ink)', display: 'block', marginBottom: '4px' }}>
                  💡 ¿Cómo funcionan los perfiles separados?
                </span>
                <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--muted)', lineHeight: 1.5 }}>
                  • <b>Dueña:</b> Acceso total a recetas, costos secretos de insumos, fórmulas de CPP y tasas oficiales.<br />
                  • <b>Ventas / Caja:</b> Pantallas limpias para despachar, cobrar en $ y Bs., calcular vuelto y generar WhatsApp, sin ver costos ni alterar recetas.<br />
                  • <b>Producción:</b> Control de stock de leche y potes (8oz a 32oz) y lotes de preparación.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: REGISTER NEW PROFILE */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="field-label" style={{ margin: '0 0 4px', display: 'block', fontSize: '12.5px', fontWeight: 700 }}>
                  Nombre del Colaborador / Puesto
                </label>
                <input
                  type="text"
                  className="margin-input"
                  placeholder="Ej. Valentina (Ventas Tarde)"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--white)' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label className="field-label" style={{ margin: '0 0 4px', display: 'block', fontSize: '12.5px', fontWeight: 700 }}>
                    Usuario (sin espacios)
                  </label>
                  <input
                    type="text"
                    className="margin-input"
                    placeholder="valentina_taller"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--white)' }}
                    required
                  />
                </div>

                <div>
                  <label className="field-label" style={{ margin: '0 0 4px', display: 'block', fontSize: '12.5px', fontWeight: 700 }}>
                    PIN de Seguridad (4 dígitos)
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={10}
                    className="margin-input"
                    placeholder="Ej. 2026"
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--line)', background: 'var(--white)' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="field-label" style={{ margin: '0 0 4px', display: 'block', fontSize: '12.5px', fontWeight: 700 }}>
                  Rol y Permisos en el Taller
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                  {(['owner', 'sales', 'production'] as UserRole[]).map((r) => {
                    const isSelected = regRole === r;
                    return (
                      <div
                        key={r}
                        onClick={() => {
                          setRegRole(r);
                          if (r === 'owner') setRegEmoji('👩‍🍳');
                          if (r === 'sales') setRegEmoji('🛍️');
                          if (r === 'production') setRegEmoji('🥣');
                        }}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: isSelected ? '2px solid var(--lime)' : '1px solid var(--line)',
                          background: isSelected ? 'var(--mint)' : 'var(--white)',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '13px', color: 'var(--ink)' }}>
                            {ROLE_LABELS[r].label}
                          </strong>
                          <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', background: isSelected ? 'var(--deep)' : 'var(--paper)', color: isSelected ? 'var(--lime)' : 'var(--muted)' }}>
                            {ROLE_LABELS[r].badge}
                          </span>
                        </div>
                        <p style={{ margin: '3px 0 0', fontSize: '11px', color: 'var(--muted)' }}>
                          {ROLE_LABELS[r].desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="field-label" style={{ margin: '0 0 6px', display: 'block', fontSize: '12.5px', fontWeight: 700 }}>
                  Elige un Avatar
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {AVATAR_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setRegEmoji(em)}
                      style={{
                        fontSize: '22px',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        border: regEmoji === em ? '2px solid var(--lime)' : '1px solid var(--line)',
                        background: regEmoji === em ? 'var(--mint)' : 'var(--white)',
                        cursor: 'pointer',
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {regError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px', borderRadius: '8px', fontSize: '12.5px', textAlign: 'center' }}>
                  ⚠️ {regError}
                </div>
              )}

              <button
                type="submit"
                className="primary-btn"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '12px',
                  fontSize: '14px',
                  fontWeight: 800,
                  marginTop: '4px',
                }}
              >
                Guardar y Registrar Perfil
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div
          className="modal-footer"
          style={{
            padding: '14px 24px',
            borderTop: '1px solid var(--line)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'var(--paper)',
            borderRadius: '0 0 16px 16px',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
              👤 Usuario actual: <b>{currentUser?.name || 'Invitado (Sin sesión)'}</b> {currentUser ? `(${ROLE_LABELS[currentUser.role]?.badge || currentUser.role})` : ''}
            </span>
            {currentUser && onLogout && (
              <button
                type="button"
                className="ghost-btn"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                style={{
                  color: 'var(--rose)',
                  borderColor: 'rgba(220, 38, 38, 0.4)',
                  background: '#fff1f2',
                  fontWeight: 700,
                  fontSize: '11.5px',
                  padding: '4px 10px',
                }}
                title="Cerrar la sesión activa del usuario"
              >
                🚪 Cerrar Sesión / Salir
              </button>
            )}
          </div>
          <button
            type="button"
            className="ghost-btn"
            onClick={onClose}
            style={{ padding: '6px 14px', fontSize: '12px' }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
