import { IconMoon, IconSun } from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/shared/theme/use-theme';

export function ThemeToggle() {
	const { resolvedTheme, toggleTheme } = useTheme();
	const isDark = resolvedTheme === 'dark';

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			aria-label={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
		>
			{isDark ? <IconSun /> : <IconMoon />}
		</Button>
	);
}
