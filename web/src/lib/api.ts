export const apiRequest = async (url: string, options: RequestInit = {}) => {
    const res = await fetch(`/api${url}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'API Error' }));
        throw new Error(error.message || 'Something went wrong');
    }

    return res.json();
};
