import { isObject } from '../shared'
import { mutableHandler, readonlyHandler, shallowReadonlyHandler } from './baseHandlers'

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

export function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandler)
}

export function createActiveObject(target, baseHandler) {
    if (!isObject(target)) {
        console.warn('target is not a object')
        return target
    }
    return new Proxy(target, baseHandler)
}

export function isReactive (value){
    return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly (value){
    return !!value[ReactiveFlags.IS_READONLY]
}

export function isProxy (value) {
    return isReactive(value) || isReadonly(value)
}