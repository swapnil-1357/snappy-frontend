import Fuse from 'fuse.js';
import { useEffect, useState, useMemo } from 'react';

export const useHybridSearch = (data = [], key = 'username') => {
    const [fuse, setFuse] = useState(null);

    const fuseOptions = useMemo(() => ({
        keys: [key],
        threshold: 0.35,           // Fuzzy/typo tolerance (0.0 exact, 1.0 everything)
        ignoreLocation: true,      // Match anywhere in string
        includeScore: true,        // Optional: for future ranking if needed
        minMatchCharLength: 2,     // Ignore very short noise
    }), [key]);

    useEffect(() => {
        if (data.length) {
            setFuse(new Fuse(data, fuseOptions));
        }
    }, [data, fuseOptions]);

    const search = (query) => {
        if (!query.trim() || !fuse) return data;

        return fuse.search(query).map(result => result.item);
    };

    return {
        search,
        isReady: !!fuse,
    };
};
