import { extend, isObject } from "../shared/index"
import { track, trigger } from "./effect"
import { ReactiveFlags, reactive, readonly } from "./reactive"

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)

function createGetter(isReadonly = false, isShallow = false) {
    return function get(target, key) {
        // 判断 isReadonly｜isReactive
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if(key === ReactiveFlags.IS_READONLY) {
            return isReadonly
        }
        const res = Reflect.get(target, key)
        // 如果是表层响应对象，直接返回
        if(isShallow) {
            return res
        }
        // 处理嵌套对象
        if(isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res)
        }
        // 响应对象收集依赖
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

export const shallowReadonlyHandler = extend({}, readonlyHandler, {
    get: shallowReadonlyGet
})