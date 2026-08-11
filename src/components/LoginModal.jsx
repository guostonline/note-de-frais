import React, { useState } from 'react';
import { Lock, Mail, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';
import logoImg from '../../assets/logo.png';

export const AUTHORIZED_USERS = [
  { email: 'c.elfil@madec.co.ma', name: 'CHAKIB EL FIL', role: 'Responsable CDZ' },
  { email: 's.elbestiri@madec.co.ma', name: 'EL BESTIRI SOUFIANE', role: 'Responsable CDZ' },
  { email: 'm.boutmezguine@madec.co.ma', name: 'EL MOSTAFA BOUTMEZGUINE', role: 'Responsable CDZ' },
  { email: 'm.maaiz@madec.co.ma', name: 'MOHAMMED MAAIZ', role: 'Responsable CDZ' },
  { email: 'n.bensalem@madec.co.ma', name: 'BENSALEM NOUREDDINE', role: 'Responsable CDZ' }
];

export const DEFAULT_PASSWORD = 'Madec123';

export default function LoginModal({ isOpen, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    const foundUser = AUTHORIZED_USERS.find(u => u.email.toLowerCase() === cleanEmail);

    if (!foundUser) {
      setError('Adresse email non autorisée ou invalide.');
      return;
    }

    if (password !== DEFAULT_PASSWORD) {
      setError('Mot de passe incorrect.');
      return;
    }

    onLoginSuccess(foundUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-100 transform transition-all">
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-sky-950 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="mx-auto px-5 py-2.5 bg-white rounded-full flex items-center justify-center shadow-lg w-fit mb-3">
            <img src={logoImg} alt="MADEC Logo" className="h-10 w-auto object-contain" />
          </div>

          <h2 className="text-xl font-bold tracking-tight">Note de Frais <span className="text-sky-400">Comparator</span></h2>
          <p className="text-xs text-slate-300 mt-1 font-light">Espace Connexion Utilisateur</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2 text-rose-700 text-xs font-medium animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Email Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Adresse Email Professionnelle
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Entrez votre email..."
                className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe..."
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none transition-all"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 text-xs font-bold text-white bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
          >
            <Lock className="w-4 h-4" />
            <span>Se Connecter</span>
          </button>
        </form>
      </div>
    </div>
  );
}
