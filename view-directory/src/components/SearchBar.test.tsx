import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HighlightMatch } from './SearchBar';
import { SearchBar } from './SearchBar';
import { renderWithProviders } from '../test/test-utils';

describe('HighlightMatch', () => {
    it('renders full text when query is empty', () => {
        render(<HighlightMatch text="hello world" query="" />);
        expect(screen.getByText('hello world')).toBeInTheDocument();
    });

    it('wraps matching substring in a <mark> tag', () => {
        const { container } = render(<HighlightMatch text="hello world" query="world" />);
        const mark = container.querySelector('mark');
        expect(mark).toBeInTheDocument();
        expect(mark!.textContent).toBe('world');
    });

    it('is case-insensitive', () => {
        const { container } = render(<HighlightMatch text="Hello World" query="hello" />);
        const mark = container.querySelector('mark');
        expect(mark).toBeInTheDocument();
        expect(mark!.textContent).toBe('Hello');
    });

    it('renders plain text when no match found', () => {
        const { container } = render(<HighlightMatch text="hello" query="xyz" />);
        expect(container.querySelector('mark')).toBeNull();
        expect(screen.getByText('hello')).toBeInTheDocument();
    });

    it('preserves text before and after the match', () => {
        const { container } = render(<HighlightMatch text="abc-def-ghi" query="def" />);
        const text = container.textContent;
        expect(text).toBe('abc-def-ghi');
        const mark = container.querySelector('mark');
        expect(mark!.textContent).toBe('def');
    });
});

describe('SearchBar', () => {
    it('renders input with placeholder', () => {
        renderWithProviders(<SearchBar />);
        expect(screen.getByPlaceholderText('Search files and folders...')).toBeInTheDocument();
    });

    it('has combobox role', () => {
        renderWithProviders(<SearchBar />);
        expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('shows clear button when text is entered', async () => {
        const user = userEvent.setup();
        renderWithProviders(<SearchBar />);
        const input = screen.getByRole('combobox');
        await user.type(input, 'test');
        expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
    });

    it('clear button clears the input', async () => {
        const user = userEvent.setup();
        renderWithProviders(<SearchBar />);
        const input = screen.getByRole('combobox') as HTMLInputElement;
        await user.type(input, 'test');
        const clearBtn = screen.getByLabelText('Clear search');
        await user.click(clearBtn);
        expect(input.value).toBe('');
    });

    it('does not show clear button when input is empty', () => {
        renderWithProviders(<SearchBar />);
        expect(screen.queryByLabelText('Clear search')).toBeNull();
    });
});
