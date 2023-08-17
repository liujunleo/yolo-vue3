// computed 返回 new ComputedRefImpl(getter)，在其实例 get value 时调用传入的 getter：computed(getter)
// 每次访问 get value 时，以 _dirty 属性判断当前是否已缓存结果 _value，省略无意义的 getter
// 利用 getter 中的响应对象发生改变 (set) 时，会 trigger 触发依赖的特性，将 getter 和 scheduler 重置函数传入，如： new ReactiveEffect(getter, () => this._dirty = true)
// 将 “重置 _dirty 属性” 函数写入依赖中 scheduler，每次 set 后将 trigger 触发依赖，执行 scheduler 更新 _dirty，下次再调用 get value 时，判断 _dirty 并获取到最新值

import { ReactiveEffect } from "./effect"

class ComputedRefImpl {
    private _getter
    private _dirty = true
    private _value
    private _effect

    constructor(getter) {
        this._getter = getter
        this._effect = new ReactiveEffect(getter, () => this._dirty = true)
    }

    get value() {
        // 访问 computed 的 value 属性时，根据状态 _dirty 判断是否已经缓存
        // 如果未缓存：执行传入的 getter 函数获取值
        // 如果已缓存：返回缓存的 _value
        // _dirty 初始化时为 true，触发 get value 执行 getter 后置为 false，触发 set 时，重置状态为 true
        if(this._dirty) {
            this._dirty = false
            this._value = this._effect.run()
        }
        return this._value
    }
}


export function computed(getter) {
    return new ComputedRefImpl(getter)
}