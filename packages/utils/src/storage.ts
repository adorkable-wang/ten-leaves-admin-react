
/** The storage type */
export type StorageType = 'local' | 'session';

export function createStorage<T extends object>(type: StorageType, storagePrefix: string) {
    const stg = type === 'session' ? window.sessionStorage : window.localStorage;

    const buildKey = (key: keyof T) => `${storagePrefix}_${key as string}`;

    const storage = {
        clear() {
            stg.clear();
        },
        /**
         * Get session
         *
         * @param key Session key
         */
        get<K extends keyof T>(key: K): T[K] | null {
            const json = stg.getItem(buildKey(key));
            if (!json) return null;
            let storageData: T[K] | null = null;
            try {
                storageData = JSON.parse(json);
                if (storageData) {
                    return storageData as T[K];
                } else {
                    return null;
                }
            } catch {
                console.error(`Error parsing JSON for key "${key as string}":`, json);
                stg.removeItem(buildKey(key));
                return null;
            }
        },
        remove(key: keyof T) {
            stg.removeItem(buildKey(key));
        },
        /**
         * Set session
         *
         * @param key Session key
         * @param value Session value
         */
        set<K extends keyof T>(key: K, value: T[K]) {
            const json = JSON.stringify(value);
            stg.setItem(buildKey(key), json);
        }
    };
    return storage;
}

