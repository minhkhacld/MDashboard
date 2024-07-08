import { useState, useEffect } from 'react';

// ----------------------------------------------------------------------

export default function useAccessToken() {
    const [value, setValue] = useState(() => {
        const storedValue = localStorage.getItem('accessToken');
        return storedValue || ""
    });

    useEffect(() => {
        const listener = (e) => {
            // console.log(e)
            if (e.storageArea === localStorage && e.key === 'accessToken') {
                setValue(e.newValue);
            }
        };
        window.addEventListener('storage', listener);

        return () => {
            window.removeEventListener('storage', listener);
        };
    }, []);


    return value;
}
