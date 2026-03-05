import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonRow } from './SkeletonRow';

describe('SkeletonRow', () => {
    it('renders with default props', () => {
        const { container } = render(<SkeletonRow />);
        const items = container.querySelectorAll('.skeleton-item');
        // icon + bar = 2 items
        expect(items.length).toBe(2);
    });

    it('renders without icon when showIcon is false', () => {
        const { container } = render(<SkeletonRow showIcon={false} />);
        const items = container.querySelectorAll('.skeleton-item');
        expect(items.length).toBe(1);
    });

    it('applies custom width to the shimmer bar', () => {
        const { container } = render(<SkeletonRow width="75%" />);
        const items = container.querySelectorAll('.skeleton-item');
        const bar = items[items.length - 1] as HTMLElement;
        expect(bar.style.width).toBe('75%');
    });

    it('has the skeleton-shimmer class on items', () => {
        const { container } = render(<SkeletonRow />);
        const shimmerItems = container.querySelectorAll('.skeleton-shimmer');
        expect(shimmerItems.length).toBeGreaterThan(0);
    });
});
