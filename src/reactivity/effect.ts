class ReactiveEffect {
    private _fn: Function

    constructor(fn: Function) {
       this._fn = fn
    }
    run() {
        activeEffect = this
        return this._fn()
    }
}

export function effect(fn: Function) {
    const _effect = new ReactiveEffect(fn)
    _effect.run()
    return _effect.run.bind(_effect)
}

const targetMap = new Map()
let activeEffect: ReactiveEffect

export function track(target, key) {
    if(!activeEffect) {
        return
    }
    //  将对象的依赖数组取出
    let depsMap = targetMap.get(target)
    if(!depsMap) {
        depsMap = new Map()
        targetMap.set(target, depsMap) // [ { user: count }: [] ]
    }
    // 将 key 的依赖取数
    let dep = depsMap.get(key)
    if (!dep) {
        dep = new Set()
        depsMap.set(key, dep) // [ { user: count }: [ count: [] ] ]
    }
    dep.add(activeEffect) // [ { user: count }: [ count: [ ReactiveEffect, ReactiveEffect, ...] ] ]
    activeEffect = undefined as any
}

export function trigger(target, key) {
    const depsMap = targetMap.get(target)
    const dep = depsMap.get(key)
    for (const effect of dep) {
        effect.run()
    }
}