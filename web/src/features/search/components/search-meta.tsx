interface SearchMetaProps {
	count: number;
	elapsedMs: number;
	showElapsed: boolean;
}

/** `elapsedMs` is only real in semantic mode; keyword mode hardcodes it to 0. */
export function SearchMeta({ count, elapsedMs, showElapsed }: SearchMetaProps) {
	return (
		<p className="font-mono text-[11px] text-text-dim tabular-nums">
			{count} resultado{count === 1 ? '' : 's'}
			{showElapsed && ` · ${elapsedMs} ms`}
		</p>
	);
}
