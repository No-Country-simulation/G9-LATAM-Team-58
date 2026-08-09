import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useLoadingCompletion } from './use-loading-completion';

describe('useLoadingCompletion', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('becomes visible and resets to the starting progress while pending', () => {
		const { result } = renderHook(() => useLoadingCompletion({ isPending: true, isComplete: false, from: 8 }));

		// Only fire the immediate (0ms) setTimeout, not the later interval tick.
		act(() => vi.advanceTimersByTime(0));

		expect(result.current.isVisible).toBe(true);
		expect(result.current.progress).toBe(8);
	});

	it('advances progress towards the ceiling while pending, never exceeding it', () => {
		const { result } = renderHook(() =>
			useLoadingCompletion({ isPending: true, isComplete: false, from: 8, ceiling: 90, stepMs: 100 })
		);

		act(() => vi.advanceTimersByTime(100 * 50));

		expect(result.current.progress).toBeLessThanOrEqual(90);
		expect(result.current.progress).toBeGreaterThan(8);
	});

	it('hides immediately (without completing) when pending ends without success', () => {
		const { result, rerender } = renderHook(
			({ isPending, isComplete }) => useLoadingCompletion({ isPending, isComplete }),
			{ initialProps: { isPending: true, isComplete: false } }
		);
		act(() => vi.runOnlyPendingTimers());
		expect(result.current.isVisible).toBe(true);

		rerender({ isPending: false, isComplete: false });
		act(() => vi.runOnlyPendingTimers());

		expect(result.current.isVisible).toBe(false);
	});

	it('advances progress and hides after the completion window when the request succeeds', () => {
		const { result, rerender } = renderHook(
			({ isPending, isComplete }) => useLoadingCompletion({ isPending, isComplete, from: 8, completionStepMs: 50 }),
			{ initialProps: { isPending: true, isComplete: false } }
		);
		act(() => vi.advanceTimersByTime(0));
		const progressBeforeCompletion = result.current.progress;

		rerender({ isPending: false, isComplete: true });
		act(() => vi.advanceTimersByTime(50 * 6));

		expect(result.current.progress).toBeGreaterThan(progressBeforeCompletion);
		expect(result.current.isVisible).toBe(true);

		// doneId fires at completionStepMs * 7, unconditionally hiding the loader.
		act(() => vi.advanceTimersByTime(50));

		expect(result.current.isVisible).toBe(false);
	});
});
