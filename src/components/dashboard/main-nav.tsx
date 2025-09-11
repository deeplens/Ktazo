
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Users, Settings, HelpCircle, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/lib/types';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: Home, roles: ['MASTER', 'ADMIN', 'PASTOR', 'MEMBER'] },
  { href: '/dashboard/profile', label: 'Profile', icon: UserIcon, roles: ['MASTER', 'ADMIN', 'PASTOR', 'MEMBER'] },
  { href: '/dashboard/sermons', label: 'Sermons', icon: BookOpen, roles: ['MASTER', 'ADMIN', 'PASTOR'] },
  { href: '/dashboard/weekly', label: 'This Week', icon: BookOpen, roles: ['MEMBER'] },
  { href: '/dashboard/admin/members', label: 'Members', icon: Users, roles: ['MASTER', 'ADMIN'] },
  { href: '/dashboard/admin/settings', label: 'Settings', icon: Settings, roles: ['MASTER', 'ADMIN', 'PASTOR'] },
  { href: '/dashboard/help', label: 'Help Center', icon: HelpCircle, roles: ['MASTER', 'ADMIN', 'PASTOR', 'MEMBER'] },
];

export function MainNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const userNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <nav className="grid items-start text-sm font-medium">
      {userNavItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            { 'bg-accent text-primary': pathname.startsWith(href) && (href !== '/dashboard' || pathname === '/dashboard') }
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}
