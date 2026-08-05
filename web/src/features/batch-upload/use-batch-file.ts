import { useState, type ChangeEvent, type DragEvent } from 'react';
import { ACCEPTED_EXTENSION, MAX_FILE_SIZE, MAX_ROWS } from './constants';
import { parseBatchCsv, type CsvParseResult } from './parse-csv';

export function validateBatchFile(file: File): string | null {
	if (!file.name.toLowerCase().endsWith(ACCEPTED_EXTENSION)) {
		return 'Selecciona un archivo con extensión .csv.';
	}
	if (file.size === 0) {
		return 'El archivo está vacío. Selecciona un CSV con al menos una fila de datos.';
	}
	if (file.size > MAX_FILE_SIZE) {
		return 'El archivo supera el límite de 5 MB. Divide el contenido en lotes más pequeños.';
	}
	return null;
}

/** Selecting, validating and parsing a local CSV file; knows nothing about the upload mutation. */
export function useBatchFile(onFileChange?: () => void) {
	const [file, setFile] = useState<File | null>(null);
	const [validationError, setValidationError] = useState<string | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [isParsing, setIsParsing] = useState(false);
	const [parse, setParse] = useState<CsvParseResult | null>(null);

	function selectFile(nextFile: File | null) {
		onFileChange?.();
		setValidationError(null);
		setParse(null);

		if (!nextFile) {
			setFile(null);
			return;
		}

		const error = validateBatchFile(nextFile);
		if (error) {
			setFile(null);
			setValidationError(error);
			return;
		}

		setFile(nextFile);
		setIsParsing(true);
		nextFile
			.text()
			.then(text => {
				const result = parseBatchCsv(text);
				if (result.ok && result.data.totalRows > MAX_ROWS) {
					setFile(null);
					setValidationError(`El archivo supera las ${MAX_ROWS.toLocaleString('es')} filas permitidas por lote.`);
					return;
				}
				setParse(result);
			})
			.finally(() => setIsParsing(false));
	}

	function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
		selectFile(event.target.files?.[0] ?? null);
		event.target.value = '';
	}

	function handleDragEnter(event: DragEvent<HTMLLabelElement>) {
		event.preventDefault();
		setIsDragging(true);
	}

	function handleDragOver(event: DragEvent<HTMLLabelElement>) {
		event.preventDefault();
	}

	function handleDragLeave() {
		setIsDragging(false);
	}

	function handleDrop(event: DragEvent<HTMLLabelElement>) {
		event.preventDefault();
		setIsDragging(false);
		selectFile(event.dataTransfer.files?.[0] ?? null);
	}

	function clear() {
		setFile(null);
		setValidationError(null);
		setParse(null);
	}

	return {
		file,
		validationError,
		isDragging,
		isParsing,
		parse,
		handleFileChange,
		handleDragEnter,
		handleDragOver,
		handleDragLeave,
		handleDrop,
		clear
	};
}
