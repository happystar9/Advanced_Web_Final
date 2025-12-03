export function getString(key: string): string | null {
    return localStorage.getItem(key)
}

export function setString(key: string, value: string) {
    localStorage.setItem(key, value)
}

export function removeItem(key: string) {
    localStorage.removeItem(key)
}

export function getNumber(key: string, fallback = 0): number {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    const n = parseInt(raw, 10)
    return Number.isNaN(n) ? fallback : n
}

export function setNumber(key: string, value: number) {
    localStorage.setItem(key, String(value))
}

export default { getString, setString, removeItem, getNumber, setNumber }
