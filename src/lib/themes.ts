export interface Theme {
  id: string;
  name: string;
  background: string;
  textColor: string;
  buttonBg: string;
  buttonText: string;
  buttonBorder: string;
  cardStyle: string;
  avatarBorder: string;
}

export const themes: Record<string, Theme> = {
  default: {
    id: 'default',
    name: 'Modern Clean',
    background: 'bg-slate-50',
    textColor: 'text-slate-900',
    buttonBg: 'bg-white',
    buttonText: 'text-slate-800',
    buttonBorder: 'border-slate-200',
    cardStyle: 'rounded-2xl shadow-sm hover:border-indigo-300',
    avatarBorder: 'border-white shadow-lg'
  },
  dark: {
    id: 'dark',
    name: 'Deep Dark',
    background: 'bg-slate-950',
    textColor: 'text-slate-50',
    buttonBg: 'bg-slate-900',
    buttonText: 'text-slate-100',
    buttonBorder: 'border-slate-800',
    cardStyle: 'rounded-2xl shadow-md border-slate-800 hover:border-slate-700',
    avatarBorder: 'border-slate-900 shadow-2xl'
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Gradient',
    background: 'bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600',
    textColor: 'text-white',
    buttonBg: 'bg-white/20 backdrop-blur-md',
    buttonText: 'text-white',
    buttonBorder: 'border-white/30',
    cardStyle: 'rounded-full shadow-lg hover:bg-white/30',
    avatarBorder: 'border-white/50 shadow-xl'
  },
  glass: {
    id: 'glass',
    name: 'Glassmorphism',
    background: 'bg-gradient-to-tr from-indigo-500 to-cyan-400',
    textColor: 'text-white',
    buttonBg: 'bg-white/10 backdrop-blur-xl',
    buttonText: 'text-white',
    buttonBorder: 'border-white/20',
    cardStyle: 'rounded-3xl shadow-2xl hover:bg-white/20',
    avatarBorder: 'border-white/40 shadow-2xl'
  },
  minimal: {
    id: 'minimal',
    name: 'Minimalist',
    background: 'bg-white',
    textColor: 'text-black',
    buttonBg: 'bg-black',
    buttonText: 'text-white',
    buttonBorder: 'border-black',
    cardStyle: 'rounded-none shadow-none hover:opacity-90',
    avatarBorder: 'border-black'
  }
};
