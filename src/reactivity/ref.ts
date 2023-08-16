// proxy 只接收 objec，不支持基本类型（string，boolean，number）
// 如 reactive 中一般使用 proxy 来劫持 get/set 进行依赖收集、依赖触发
// 使用 RefImpl 将 ref(值) 包装成 object，如：{ value: 值 } ，再使用 reactive & proxy 能力 & 逻辑

import { hasChanged, isObject } from "../shared"
import { isTracking, trackEffects, triggerEffects } from "./effect"
import { reactive } from "./reactive"

class RefImpl {
    private _rawValue
    private _value
    private dep
    public __v__is_ref = true

    constructor(value) {
        this._rawValue = value
        this._value = convert(value)
        this.dep = new Set()
    }

    get value() {
        // 当 ref 变量在 effect(fn) 中被使用，effect 会 new ReactiveEffect 来收集依赖
        // 在 ReactiveEffect 中 run 函数，会初始化 shouldTrack & activeEffect
        
        if(isTracking()) {
            trackEffects(this.dep)
        }
        return this._value
    }

    set value(newValue) {
        if(!hasChanged(newValue, this._rawValue)) return 

        this._rawValue = newValue
        this._value = convert(newValue)
        // 当 ref 变量被 set 时，查看 dep 并触发其所有依赖（ReactiveEffect.run）
        triggerEffects(this.dep)
    }
}

function convert(value) {
    return isObject(value) ? reactive(value) : value
}

export function isRef(ref) {
    return !!ref.__v__is_ref
}

export function unRef(ref) {
    return isRef(ref) ? ref.value : ref
}

export function ref(value) {
    return new RefImpl(value)
}