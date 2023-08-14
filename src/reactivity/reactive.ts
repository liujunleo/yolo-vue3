import { mutableHandler, readonlyHandler } from './baseHandlers'

export function reactive(raw: Object) {
    return createActiveObject(raw, mutableHandler)
}

export function readonly(raw) {
    return createActiveObject(raw,readonlyHandler)
}

export function createActiveObject(raw, baseHandler) {
    return new Proxy(raw, baseHandler)
}