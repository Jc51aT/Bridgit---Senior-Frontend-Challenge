export const handleTreeKeyDown = (
    e: React.KeyboardEvent<HTMLElement>,
    options?: {
        isOpen?: boolean;
        toggle?: () => void;
        isDir?: boolean;
    }
) => {
    const validKeys = ['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'];
    if (!validKeys.includes(e.key)) return;

    const treeItems = Array.from(
        document.querySelectorAll('.file, .directory-header')
    ) as HTMLElement[];
    const currentIndex = treeItems.indexOf(e.currentTarget as HTMLElement);

    if (currentIndex === -1) return;

    e.preventDefault();

    if (e.key === 'ArrowDown') {
        const next = treeItems[currentIndex + 1];
        if (next) {
            next.focus();
        }
    } else if (e.key === 'ArrowUp') {
        const prev = treeItems[currentIndex - 1];
        if (prev) {
            prev.focus();
        }
    } else if (e.key === 'ArrowRight') {
        if (options?.isDir) {
            if (!options.isOpen && options.toggle) {
                options.toggle();
            } else if (options.isOpen) {
                const next = treeItems[currentIndex + 1];
                if (next) next.focus();
            }
        }
    } else if (e.key === 'ArrowLeft') {
        if (options?.isDir && options.isOpen && options.toggle) {
            options.toggle();
        } else {
            // Find parent directory-header
            const parentContents = e.currentTarget.closest('.directory-contents');
            if (parentContents) {
                const parentHeader = parentContents.previousElementSibling as HTMLElement;
                if (parentHeader && parentHeader.classList.contains('directory-header')) {
                    parentHeader.focus();
                }
            }
        }
    }
};
