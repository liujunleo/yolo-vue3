import { mutableHandler, readonlyHandler } from './baseHandlers'

export enum ReactiveFlags {
    IS_REACTIVE = '__v__is_reactive',
    IS_READONLY = '__v__is_readonly'
}

export function reactive(raw: Object) {
    return createActiveObject(raw, mutableHandler)
}

export function readonly(raw) {
    return createActiveObject(raw,readonlyHandler)
}

export function createActiveObject(raw, baseHandler) {
    return new Proxy(raw, baseHandler)
}

export function isReactive (value){
    return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly (value){
    return !!value[ReactiveFlags.IS_READONLY]
}