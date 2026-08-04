import { IconBrain } from '@tabler/icons-react';
import { NavLink, useLocation } from 'react-router';
import { NAV_GROUPS, type NavItem } from '@/shared/config/navigation';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail
} from '@/components/ui/sidebar';

function isActivePath(pathname: string, to: string, end?: boolean) {
	return end ? pathname === to : pathname === to || pathname.startsWith(to);
}

function SidebarNavItem({ item }: { item: NavItem }) {
	const { pathname } = useLocation();

	return (
		<SidebarMenuItem>
			<SidebarMenuButton
				asChild
				isActive={isActivePath(pathname, item.to, item.end)}
				tooltip={item.label}
				className="data-[active=true]:rounded-l-none data-[active=true]:border-l-2 data-[active=true]:border-l-primary"
			>
				<NavLink to={item.to} end={item.end}>
					<item.icon />
					<span>{item.label}</span>
				</NavLink>
			</SidebarMenuButton>
		</SidebarMenuItem>
	);
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<NavLink to="/">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<IconBrain className="size-4" />
								</div>
								<span className="font-heading text-base font-semibold">TechMind</span>
							</NavLink>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				{NAV_GROUPS.map(group => (
					<SidebarGroup key={group.label}>
						<SidebarGroupLabel>{group.label}</SidebarGroupLabel>
						<SidebarGroupContent>
							<SidebarMenu>
								{group.items.map(item => (
									<SidebarNavItem key={item.to} item={item} />
								))}
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				))}
			</SidebarContent>
			<SidebarFooter>
				{/* TODO: read the real values from the model metadata endpoint once it exists. */}
				<p className="flex items-center gap-2 px-2 font-mono text-[11px] text-text-dim">
					<span className="size-1.5 shrink-0 rounded-full bg-success shadow-[0_0_6px_var(--success)]" />
					modelo v1 · 384d · F1 0.84
				</p>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
