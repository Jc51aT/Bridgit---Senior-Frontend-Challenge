import { describe, it, expect, vi } from 'vitest';
import { handleTreeKeyDown } from './keyboardNav';

// Helper to create a mock keyboard event
function createKeyEvent(
    key: string,
    currentTarget: HTMLElement
): React.KeyboardEvent<HTMLElement> {
    return {
        key,
        currentTarget,
        preventDefault: vi.fn(),
    } as unknown as React.KeyboardEvent<HTMLElement>;
}

describe('handleTreeKeyDown', () => {
    // Set up a mini DOM with tree items
    function setupDOM() {
        document.body.innerHTML = '';
        const container = document.createElement('div');

        const item1 = document.createElement('div');
        item1.className = 'directory-header';
        item1.tabIndex = 0;
        item1.focus = vi.fn();

        const contents = document.createElement('div');
        contents.className = 'directory-contents';

        const item2 = document.createElement('div');
        item2.className = 'file';
        item2.tabIndex = 0;
        item2.focus = vi.fn();

        // item2 is a child of item1's directory-contents
        contents.appendChild(item2);

        // previousElementSibling of contents should be item1
        container.appendChild(item1);
        container.appendChild(contents);

        const item3 = document.createElement('div');
        item3.className = 'file';
        item3.tabIndex = 0;
        item3.focus = vi.fn();
        container.appendChild(item3);

        document.body.appendChild(container);
        return { item1, item2, item3 };
    }

    it('does nothing for non-arrow keys', () => {
        const { item1 } = setupDOM();
        const event = createKeyEvent('Enter', item1);
        handleTreeKeyDown(event);
        expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it('ArrowDown focuses the next tree item', () => {
        const { item1, item2 } = setupDOM();
        const event = createKeyEvent('ArrowDown', item1);
        handleTreeKeyDown(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(item2.focus).toHaveBeenCalled();
    });

    it('ArrowUp focuses the previous tree item', () => {
        const { item1, item2 } = setupDOM();
        const event = createKeyEvent('ArrowUp', item2);
        handleTreeKeyDown(event);
        expect(event.preventDefault).toHaveBeenCalled();
        expect(item1.focus).toHaveBeenCalled();
    });

    it('ArrowDown at the last item does nothing extra', () => {
        const { item3 } = setupDOM();
        const event = createKeyEvent('ArrowDown', item3);
        handleTreeKeyDown(event);
        expect(event.preventDefault).toHaveBeenCalled();
        // No item to focus after last
    });

    it('ArrowUp at the first item does nothing extra', () => {
        const { item1 } = setupDOM();
        const event = createKeyEvent('ArrowUp', item1);
        handleTreeKeyDown(event);
        expect(event.preventDefault).toHaveBeenCalled();
        // No item to focus before first
    });

    it('ArrowRight on a closed directory calls toggle', () => {
        const { item1 } = setupDOM();
        const toggle = vi.fn();
        const event = createKeyEvent('ArrowRight', item1);
        handleTreeKeyDown(event, { isDir: true, isOpen: false, toggle });
        expect(toggle).toHaveBeenCalled();
    });

    it('ArrowRight on an open directory focuses next item', () => {
        const { item1, item2 } = setupDOM();
        const toggle = vi.fn();
        const event = createKeyEvent('ArrowRight', item1);
        handleTreeKeyDown(event, { isDir: true, isOpen: true, toggle });
        expect(toggle).not.toHaveBeenCalled();
        expect(item2.focus).toHaveBeenCalled();
    });

    it('ArrowRight on a non-directory does nothing', () => {
        const { item2 } = setupDOM();
        const event = createKeyEvent('ArrowRight', item2);
        handleTreeKeyDown(event);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('ArrowLeft on an open directory calls toggle', () => {
        const { item1 } = setupDOM();
        const toggle = vi.fn();
        const event = createKeyEvent('ArrowLeft', item1);
        handleTreeKeyDown(event, { isDir: true, isOpen: true, toggle });
        expect(toggle).toHaveBeenCalled();
    });

    it('ArrowLeft on a file inside a directory focuses the parent header', () => {
        const { item1, item2 } = setupDOM();
        const event = createKeyEvent('ArrowLeft', item2);
        handleTreeKeyDown(event);
        expect(item1.focus).toHaveBeenCalled();
    });
});
