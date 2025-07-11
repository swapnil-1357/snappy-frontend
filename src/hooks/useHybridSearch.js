import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import Fuse from 'fuse.js';
import { useEffect, useRef, useState } from 'react';

export const useHybridSearch = (data = [], getKey = 'name') => {
    const [model, setModel] = useState(null);
    const fuseRef = useRef(null);
    const lastDataRef = useRef([]);

    const keyExtractor = typeof getKey === 'function'
        ? getKey
        : (item) => item?.[getKey] ?? '';

    // Load Universal Sentence Encoder model once
    useEffect(() => {
        use.load().then(setModel);
    }, []);

    // Update Fuse instance only when data actually changes
    useEffect(() => {
        const dataString = JSON.stringify(data.map(keyExtractor));
        const lastDataString = JSON.stringify(lastDataRef.current.map(keyExtractor));

        if (dataString !== lastDataString) {
            lastDataRef.current = data;
            const fuseReadyData = data.map(d => ({
                ...d,
                _searchKey: keyExtractor(d)
            }));
            fuseRef.current = new Fuse(fuseReadyData, {
                keys: ['_searchKey'],
                threshold: 0.35,
                includeScore: true,
                minMatchCharLength: 2,
            });
        }
    }, [data]);

    const search = async (query) => {
        if (!query.trim() || !model || !fuseRef.current) return data;

        // 1. Fuzzy search
        const fuzzyResults = fuseRef.current.search(query).map(res => ({
            item: res.item,
            fuzzyScore: 1 - res.score,
        }));

        // 2. Semantic search
        const texts = data.map(keyExtractor);
        const embeddings = await model.embed([query, ...texts]);
        const queryVec = embeddings.slice([0, 0], [1]);
        const itemVecs = embeddings.slice([1]);
        const simScores = await tf.matMul(queryVec, itemVecs, false, true).data();

        // 3. Combine scores
        const results = data.map((item, i) => {
            const fuzzy = fuzzyResults.find(res => res.item.id === item.id);
            const fuzzyScore = fuzzy?.fuzzyScore ?? 0;
            const semanticScore = simScores[i] ?? 0;
            const finalScore = 0.6 * semanticScore + 0.4 * fuzzyScore;
            return { item, finalScore };
        });

        return results
            .sort((a, b) => b.finalScore - a.finalScore)
            .map(res => res.item);
    };

    return {
        search,
        isReady: !!model && !!fuseRef.current,
    };
};
