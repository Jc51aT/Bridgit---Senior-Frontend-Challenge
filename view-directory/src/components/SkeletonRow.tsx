import React from 'react';

interface SkeletonRowProps {
    /** Width of the shimmer bar as a CSS value, e.g. '70%' */
    width?: string;
    /** Whether to show a small icon placeholder on the left (like a folder/file icon) */
    showIcon?: boolean;
}

export const SkeletonRow: React.FC<SkeletonRowProps> = ({
    width = '60%',
    showIcon = true,
}) => {
    return (
        <div
            className="skeleton-row"
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                gap: '12px',
            }}
        >
            {showIcon && (
                <div
                    className="skeleton-item skeleton-shimmer"
                    style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: 'var(--radius-sm)',
                        flexShrink: 0,
                    }}
                />
            )}
            <div
                className="skeleton-item skeleton-shimmer"
                style={{
                    width,
                    height: '14px',
                    borderRadius: 'var(--radius-sm)',
                }}
            />
        </div>
    );
};
