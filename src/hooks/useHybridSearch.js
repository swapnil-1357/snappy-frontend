import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import Fuse from 'fuse.js';
import { useEffect, useState } from 'react';

export const useHybridSearch = (data = [], key = 'username') => {
    const [model, setModel] = useState(null);
    const [fuse, setFuse] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            await tf.setBackend('cpu');
            await tf.ready();

            const m = await use.load();
            if (isMounted) {
                setModel(m);
                setFuse(
                    new Fuse(data, {
                        keys: [key],
                        threshold: 0.4
                    })
                );
            }
        };

        load();

        return () => {
            isMounted = false;
        };
    }, [key]); // ❗ do NOT include `data` here or it'll trigger infinite re-renders

    const search = async (query) => {
        if (!query.trim() || !model || !fuse) return data;

        const fuseResults = fuse.search(query).map(r => ({
            item: r.item,
            fuseScore: 1 - r.score
        }));

        const inputTexts = data.map(d => d[key]);
        const embeddings = await model.embed([query, ...inputTexts]);
        const queryVec = embeddings.slice([0, 0], [1]);
        const postVecs = embeddings.slice([1]);
        const simScores = await tf.matMul(queryVec, postVecs, false, true).data();

        const combined = data.map((item, i) => {
            const fuseMatch = fuseResults.find(f => f.item === item);
            const fuseScore = fuseMatch?.fuseScore || 0;
            const semanticScore = simScores[i];
            const finalScore = (semanticScore * 0.6) + (fuseScore * 0.4);
            return { item, finalScore };
        });

        return combined
            .sort((a, b) => b.finalScore - a.finalScore)
            .map(r => r.item);
    };

    return {
        search,
        isReady: !!model && !!fuse
    };
};
