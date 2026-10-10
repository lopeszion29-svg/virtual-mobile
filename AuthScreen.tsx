import { useState } from 'react';
import type { FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function AuthScreen({ configured }: { configured: boolean }) {
  const [mode, setMode] = useState<'login'|'signup'|'reset'>('login');
  const [name, setName] = useState(''); const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [show, setShow] = useState(false); const [busy, setBusy] = useState(false); const [message, setMessage] = useState('');
  async function submit(e: FormEvent) {
    e.preventDefault(); setMessage('');
    if (!supabase) { setMessage('Connect Supabase to enable secure accounts. Follow the setup instructions in README.md.'); return; }
    if (mode === 'signup' && (!name.trim() || !username.trim())) { setMessage('Enter your full name and username.'); return; }
    setBusy(true);
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name.trim(), username: username.trim() } } });
        if (error) throw error; setMessage('Account created. If email confirmation is enabled, check your inbox before logging in.'); setMode('login');
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (error) throw error; setMessage('If an account exists for this email, a password reset link has been sent.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error;
      }
    } catch (err) { setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.'); }
    finally { setBusy(false); }
  }
  return <main className="auth-page"><div className="auth-art"><div className="art-orb orb-one"/><div className="art-orb orb-two"/><div className="art-copy"><div className="brand-lockup"><span className="brand-mark">V</span><span>Virtual Phone OS</span></div><div className="hero-phone"><div className="hero-status"><span>9:41</span><span>● ▰ ▴</span></div><div className="hero-date">Friday, October 9</div><div className="hero-time">09:41</div><div className="hero-widget">Good evening <b>✦</b><small>Your digital space, everywhere.</small></div><div className="hero-apps"><i>✉</i><i>◉</i><i>♫</i><i>▦</i></div><div className="hero-dock"><span>●</span><span>◉</span><span>▣</span><span>⚙</span></div></div><h1>Your phone.<br/><em>Everywhere.</em></h1><p>A personal digital space that follows you from device to device.</p><div className="art-proof"><ShieldCheck size={17}/> Private by design <span>·</span> <Sparkles size={16}/> Made for you</div></div></div><section className="auth-panel"><div className="mobile-brand"><span className="brand-mark">V</span> Virtual Phone OS</div><div className="auth-card"><div className="eyebrow"><Smartphone size={15}/> YOUR DIGITAL SPACE</div><h2>{mode==='signup'?'Create your account':mode==='reset'?'Reset your password':'Welcome back'}</h2><p className="muted">{mode==='signup'?'Set up your own virtual phone in a few steps.':mode==='reset'?'We’ll email you a secure password reset link.':'Log in to pick up right where you left off.'}</p>
  {!configured && <div className="notice"><b>Setup required</b><br/>Add your Supabase project URL and public key to <code>.env</code> to activate authentication and cloud sync.</div>}
  <form onSubmit={submit}>{mode==='signup'&&<><label>Full name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" autoComplete="name" required/></label><label>Username<input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Choose a username" autoComplete="username" required/></label></>}
  <label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required/></label>
  {mode!=='reset'&&<label>Password<div className="password-field"><input type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode==='signup'?'At least 8 characters':'Enter your password'} minLength={mode==='signup'?8:1} autoComplete={mode==='signup'?'new-password':'current-password'} required/><button type="button" className="icon-button" onClick={()=>setShow(!show)} aria-label="Toggle password visibility">{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>}
  {mode==='login'&&<button type="button" className="text-button forgot" onClick={()=>{setMode('reset');setMessage('')}}>Forgot password?</button>}
  <button className="primary-button" disabled={busy} type="submit">{busy?'Please wait…':mode==='signup'?'Create account':mode==='reset'?'Send reset link':'Log in'} <ArrowRight size={17}/></button></form>
  {message&&<div className={message.toLowerCase().includes('error')?'form-message error':'form-message'}>{message}</div>}
  <div className="auth-switch">{mode==='signup'?'Already have an account?':mode==='reset'?'Remembered your password?':"Don't have an account?"} <button className="text-button" onClick={()=>{setMode(mode==='signup'?'login':'signup');setMessage('')}}>{mode==='signup'?'Log in':mode==='reset'?'Back to login':'Create account'}</button></div><div className="secure-note"><ShieldCheck size={15}/> Your account is protected by Supabase Authentication.</div></div><div className="auth-footer">Virtual Phone OS <span>·</span> Your space, synced securely</div></section></main>;
}
