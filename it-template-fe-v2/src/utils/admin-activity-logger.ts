export interface AdminActivityInput {
  id?: string;
  title: string;
  description: string;
  icon?: string;
  iconBg?: string;
  iconColor?: string;
  link?: string;
  linkText?: string;
  time?: string | Date;
}

const STORAGE_KEY = 'admin_recent_activities';

export const logAdminActivity = (input: AdminActivityInput) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const existing: any[] = raw ? JSON.parse(raw) : [];

    const newEntry = {
      id: input.id || `admin-local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: input.title,
      description: input.description,
      icon: input.icon || 'solar:shield-check-bold-duotone',
      iconBg: input.iconBg || 'rgba(0, 79, 159, 0.1)',
      iconColor: input.iconColor || '#004F9F',
      link: input.link || '/dashboard/user-management',
      linkText: input.linkText || 'Kelola User',
      time: input.time ? new Date(input.time).toISOString() : new Date().toISOString(),
    };

    // Filter out if exact duplicate ID already exists, then keep latest 40 entries
    const filtered = existing.filter((item) => item.id !== newEntry.id);
    const updated = [newEntry, ...filtered].slice(0, 40);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('admin_activity_updated'));
  } catch (err) {
    console.error('Failed to log admin activity:', err);
  }
};

export const getAdminLocalActivities = (): any[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
