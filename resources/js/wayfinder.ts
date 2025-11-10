export type RouteQueryOptions = {
    [key: string]: string | number | boolean | null | undefined;
};

export type RouteDefinition<T extends string = string> = {
    url: string;
    method: T;
};

export function queryParams(options?: RouteQueryOptions): string {
    if (!options || Object.keys(options).length === 0) {
        return '';
    }

    const params = new URLSearchParams();

    Object.entries(options).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            params.append(key, String(value));
        }
    });

    const queryString = params.toString();
    return queryString ? `?${queryString}` : '';
}

export function applyUrlDefaults(url: string, defaults: Record<string, any> = {}): string {
    let processedUrl = url;

    // Replace route parameters with defaults if provided
    Object.entries(defaults).forEach(([key, value]) => {
        const pattern = new RegExp(`\\{${key}\\??\\}`, 'g');
        processedUrl = processedUrl.replace(pattern, String(value));
    });

    return processedUrl;
}

declare global {
    interface Window {
        queryParams?: typeof queryParams;
    }
}

if (typeof window !== 'undefined') {
    window.queryParams = queryParams;
}
