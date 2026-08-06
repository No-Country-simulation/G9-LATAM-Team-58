export function BatchFormatCard() {
	return (
		<div className="rounded-md border bg-card p-5">
			<p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">Formato requerido</p>
			<p className="mt-2 text-sm text-muted-foreground">
				La primera fila debe ser la cabecera. Cada registro necesita las columnas{' '}
				<code className="font-mono text-foreground">title,body</code>.
			</p>
			<pre className="mt-4 overflow-x-auto rounded-sm border bg-muted/50 p-3 font-mono text-xs text-muted-foreground">
				{'title,body\n"Índices vectoriales","Contenido técnico..."'}
			</pre>
		</div>
	);
}
