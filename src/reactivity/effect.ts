import { extend } from "../shared/index"

const targetMap = new Map()
let activeEffect
let shouldTrack

export class ReactiveEffect {
    public scheduler?: Function
    private _fn: Function
    deps:any = []
    active = true
    onStop?: Function

    constructor(fn: Function, scheduler?: Function) {
       this._fn = fn
       this.scheduler = scheduler
    }
    run() {
        if(!this.active) {
           return this._fn()
        }

        shouldTrack = true
        activeEffect = this
        const result = this._fn()
        shouldTrack = false

        return result
    }
    stop() {
        if(this.active) {
            cleanupEffect(this)
            if ( this.onStop) {
                this.onStop()
            }
            this.active = false
        }
    }
}

function cleanupEffect (effect) {
    effect.deps.forEach(dep => {
        dep.delete(effect)
    });
    effect.deps.length = 0
} 

export function stop(runner) {
    runner.effect.stop()
}

export function track(target, key) {
    if(!isTracking()) return

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
    trackEffects(dep)
}

export function trackEffects(dep) {
    if(dep.has(activeEffect)) return

    dep.add(activeEffect) // [ { user: count }: [ count: [ ReactiveEffect, ReactiveEffect, ...] ] ]
    activeEffect.deps.push(dep)
}

export function isTracking() {
   return shouldTrack && activeEffect !== undefined
}

export function trigger(target, key) {
    // 如果 reactive 对象未使用过 effect，无需 trigger
    if(targetMap.size > 0) {
        const depsMap = targetMap.get(target)
        if(depsMap && depsMap.has(key)) {
            const dep = depsMap.get(key)
            triggerEffects(dep)
        }
    }
}

export function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler()
        } else {
            effect.run()
        }
    }
}

export function effect(fn: Function, options:any = {}) {
    // fn
    const _effect = new ReactiveEffect(fn, options.scheduler)

    // options
    extend(_effect, options)

    _effect.run()
    // runner
    const runner:any = _effect.run.bind(_effect)
    runner.effect = _effect
    return runner
}