import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useDebounce } from './use-debounce';

describe('useDebounce', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('does not emit the new value before the delay elapses', () => {
		const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
			initialProps: { value: 'a' }
		});

		rerender({ value: 'b' });
		act(() => vi.advanceTimersByTime(399));

		expect(result.current).toBe('a');
	});

	it('emits the new value once the delay elapses', () => {
		const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
			initialProps: { value: 'a' }
		});

		rerender({ value: 'b' });
		act(() => vi.advanceTimersByTime(400));

		expect(result.current).toBe('b');
	});

	it('collapses rapid consecutive changes into a single emission', () => {
		const { result, rerender } = renderHook(({ value }) => useDebounce(value, 400), {
			initialProps: { value: 'a' }
		});

		rerender({ value: 'b' });
		act(() => vi.advanceTimersByTime(200));
		rerender({ value: 'c' });
		act(() => vi.advanceTimersByTime(200));

		expect(result.current).toBe('a');

		act(() => vi.advanceTimersByTime(200));

		expect(result.current).toBe('c');
	});
});
