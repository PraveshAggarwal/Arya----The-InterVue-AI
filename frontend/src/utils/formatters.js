// Formatting utility functions (English)

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatScore = (score) => {
  if (score >= 90) return { label: 'Excellent', color: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' };
  if (score >= 80) return { label: 'Very Good', color: 'text-sky-400', border: 'border-sky-500/30', bg: 'bg-sky-500/10' };
  if (score >= 70) return { label: 'Good', color: 'text-blue-400', border: 'border-blue-500/30', bg: 'bg-blue-500/10' };
  return { label: 'Needs Improvement', color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' };
};

export const getStatusBadgeStyle = (status) => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    case 'in progress':
      return 'bg-sky-500/10 text-sky-400 border-sky-500/30 animate-pulse';
    case 'scheduled':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700';
  }
};
