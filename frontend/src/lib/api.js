const BASE = '/api';
async function get(path, params) {
    const url = new URL(path, window.location.origin);
    url.pathname = `${BASE}${path}`;
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== '') {
                url.searchParams.set(key, value);
            }
        }
    }
    const res = await fetch(url.toString());
    if (!res.ok)
        throw new Error(`API error: ${res.status}`);
    return res.json();
}
async function post(path, body) {
    const res = await fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok)
        throw new Error(`API error: ${res.status}`);
    return res.json();
}
export function fetchVacancies(params) {
    return get('/vacancies', params);
}
export function fetchVacancy(id) {
    return get(`/vacancies/${id}`);
}
export function fetchMunicipalities() {
    return get('/municipalities');
}
export function fetchStats() {
    return get('/stats');
}
export function triggerScrape(municipalities) {
    return post('/scrape', municipalities ? { municipalities } : undefined);
}
export function fetchScrapeStatus() {
    return get('/scrape/status');
}
//# sourceMappingURL=api.js.map