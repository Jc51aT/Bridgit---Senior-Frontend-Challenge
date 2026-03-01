import React from 'react';
import { SkeletonRow } from './SkeletonRow';

// Staggered widths so the skeleton feels natural, not uniform.
const ROW_WIDTHS = ['65%', '80%', '50%', '75%', '55%'];

interface SkeletonListProps {
    /** Number of skeleton rows to render. Defaults to 5. */
    count?: number;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({ count = 5 }) => {
    const rows = ROW_WIDTHS.slice(0, count);

    return (
        <div
            aria-hidden="true"
            aria-busy="true"
            role="status"
            style={{ padding: '4px 0' }}
        >
            {rows.map((width, i) => (
                <SkeletonRow key={i} width={width} showIcon />
            ))}
        </div>
    );
};
