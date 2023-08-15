import { extend } from "../shared"

const targetMap = new Map()
let activeEffect
let shouldTrack

class ReactiveEffect {
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

    if(dep.has(activeEffect)) return

    dep.add(activeEffect) // [ { user: count }: [ count: [ ReactiveEffect, ReactiveEffect, ...] ] ]
    activeEffect.deps.push(dep)
}

function isTracking() {
   return shouldTrack && activeEffect !== undefined
}

export function trigger(target, key) {
    const depsMap = targetMap.get(target)
    const dep = depsMap.get(key)
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
    _effect.onStop = options.onStop
    extend(_effect, options)

    _effect.run()
    // runner
    const runner:any = _effect.run.bind(_effect)
    runner.effect = _effect
    return runner
}