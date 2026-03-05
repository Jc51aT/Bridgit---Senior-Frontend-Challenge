import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SortControls } from './SortControls';
import { renderWithProviders } from '../test/test-utils';

describe('SortControls', () => {
    it('renders the sort label', () => {
        renderWithProviders(<SortControls />);
        expect(screen.getByText('Sort by:')).toBeInTheDocument();
    });

    it('renders a select with Name and Type options', () => {
        renderWithProviders(<SortControls />);
        const select = screen.getByRole('combobox') as HTMLSelectElement;
        expect(select).toBeInTheDocument();
        expect(select.value).toBe('name');
        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(2);
    });

    it('renders the direction toggle button', () => {
        renderWithProviders(<SortControls />);
        const btn = screen.getByRole('button');
        expect(btn).toBeInTheDocument();
        expect(btn.textContent).toContain('↑');
    });

    it('changing select updates the value', async () => {
        const user = userEvent.setup();
        renderWithProviders(<SortControls />);
        const select = screen.getByRole('combobox') as HTMLSelectElement;
        await user.selectOptions(select, 'type');
        expect(select.value).toBe('type');
    });

    it('clicking direction button toggles the arrow', async () => {
        const user = userEvent.setup();
        renderWithProviders(<SortControls />);
        const btn = screen.getByRole('button');
        expect(btn.textContent).toContain('↑');
        await user.click(btn);
        expect(btn.textContent).toContain('↓');
    });

    it('has toolbar role with aria-label', () => {
        renderWithProviders(<SortControls />);
        expect(screen.getByRole('toolbar')).toBeInTheDocument();
    });
});
