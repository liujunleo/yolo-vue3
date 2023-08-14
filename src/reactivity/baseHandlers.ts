import { track, trigger } from "./effect"
import { ReactiveFlags } from "./reactive"

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

function createGetter(isReadonly = false) {
    return function get(target, key) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if(key === ReactiveFlags.IS_READONLY) {
            return isReadonly
        }

        const res = Reflect.get(target, key)
        if(!isReadonly) {
            track(target, key) // 依赖收集
        }
        return res
    }
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value)
        trigger(target, key) // 依赖触发
        return res
    }
}

export const mutableHandler = {
    get,
    set,
}

export const readonlyHandler = {
    get: readonlyGet,
    set: (target, key, value) => {
        console.warn('Cannot change readonly object')
        return true
    }
}