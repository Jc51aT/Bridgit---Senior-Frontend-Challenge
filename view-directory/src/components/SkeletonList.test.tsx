import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkeletonList } from './SkeletonList';

describe('SkeletonList', () => {
    it('renders 5 skeleton rows by default', () => {
        const { container } = render(<SkeletonList />);
        const rows = container.querySelectorAll('.skeleton-row');
        expect(rows.length).toBe(5);
    });

    it('renders a custom count of rows', () => {
        const { container } = render(<SkeletonList count={3} />);
        const rows = container.querySelectorAll('.skeleton-row');
        expect(rows.length).toBe(3);
    });

    it('has aria-busy for accessibility', () => {
        const { container } = render(<SkeletonList />);
        const wrapper = container.firstElementChild as HTMLElement;
        expect(wrapper.getAttribute('aria-busy')).toBe('true');
    });

    it('has role=status', () => {
        render(<SkeletonList />);
        expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });

    it('is aria-hidden', () => {
        const { container } = render(<SkeletonList />);
        const wrapper = container.firstElementChild as HTMLElement;
        expect(wrapper.getAttribute('aria-hidden')).toBe('true');
    });
});
