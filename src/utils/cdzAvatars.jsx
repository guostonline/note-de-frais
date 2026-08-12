import chakibImg from '../assets/cdz/chakib.png';
import maizImg from '../assets/cdz/maiz.png';
import mustaphaImg from '../assets/cdz/mustapha.png';
import soufianeImg from '../assets/cdz/soufiane.png';

export const CDZ_AVATARS = {
  'CHAKIB EL FIL': chakibImg,
  'MOHAMMED MAAIZ': maizImg,
  'EL MOSTAFA BOUTMEZGUINE': mustaphaImg,
  'EL BESTIRI SOUFIANE': soufianeImg,
};

/**
 * Returns the profile image URL for a given CDZ manager name, or null if not available
 */
export function getCdzAvatar(name) {
  if (!name || typeof name !== 'string') return null;
  const upper = name.trim().toUpperCase();

  if (upper.includes('CHAKIB') || upper.includes('ELFIL') || upper.includes('EL FIL')) return chakibImg;
  if (upper.includes('MAAIZ') || upper.includes('MAIZ')) return maizImg;
  if (upper.includes('BOUTMEZGUINE') || upper.includes('MUSTAPHA')) return mustaphaImg;
  if (upper.includes('BESTIRI') || upper.includes('SOUFIANE')) return soufianeImg;

  return null;
}

/**
 * Helper React component for displaying a CDZ avatar thumbnail with fallback initials badge
 */
export function CdzAvatarBadge({ name, size = 'md', className = '' }) {
  const avatarUrl = getCdzAvatar(name);
  const initials = (name || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');

  const sizeClasses = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  }[size] || 'w-9 h-9 text-xs';

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClasses} rounded-full object-cover ring-2 ring-[#F3CF55]/70 border border-stone-200 shadow-md shrink-0 transition-transform hover:scale-110 ${className}`}
      />
    );
  }

  return (
    <div className={`${sizeClasses} rounded-full bg-[#F3CF55] text-[#1E2024] font-extrabold flex items-center justify-center border border-amber-400/80 shadow-md shrink-0 ${className}`}>
      {initials}
    </div>
  );
}
