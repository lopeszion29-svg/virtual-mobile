export type Note = { id: string; title: string; body: string; updatedAt: string };
export type Task = { id: string; title: string; dueDate: string; done: boolean };
export type Contact = { id: string; name: string; phone: string; email: string };
export type EventItem = { id: string; title: string; date: string; time: string };
export type PhoneState = {
  wallpaper: string; theme: 'dark' | 'light'; accent: string; installed: string[]; favorites: string[];
  notes: Note[]; tasks: Task[]; contacts: Contact[]; events: EventItem[]; notifications: {id:string; text:string; read:boolean}[];
};
export const defaultState: PhoneState = {
  wallpaper: 'aurora', theme: 'dark', accent: '#a78bfa',
  installed: ['notes','calculator','calendar','gallery','tasks','contacts','settings','browser','clock','files'],
  favorites: ['browser','notes','gallery','settings'], notes: [], tasks: [], contacts: [], events: [], notifications: []
};
