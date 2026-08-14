import { BrandMark } from '@/components/brand';
import { NavLink, useLocation } from 'react-router';
import { useModelInfo } from '@/features/dashboard';
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
	const model = useModelInfo();

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<NavLink to="/" className="flex items-center gap-3">
								<div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
									<BrandMark className="size-5 shrink-0" />
								</div>

								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-heading text-base font-semibold">Mindloom</span>
									<span className="truncate text-xs text-muted-foreground">Organización inteligente</span>
								</div>
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
			{model.data && (
				<SidebarFooter>
					<p className="flex items-center gap-2 px-2 font-mono text-[11px] text-text-dim">
						<span className="size-1.5 shrink-0 rounded-full bg-success shadow-[0_0_6px_var(--success)]" />
						modelo {model.data.version} · {model.data.dim}d · F1 {model.data.macroF1.toFixed(2)}
					</p>
				</SidebarFooter>
			)}
			<SidebarRail />
		</Sidebar>
	);
}
