
import { reactive } from '../reactive'
import { effect, stop } from '../effect'

describe('effect', () => {
    it('happy path',() => {
        const user: any = reactive({ count: 10, age: 1 })
        let nextCount
        let nextAge = 1

        effect(() => {
            nextCount = user.count + 1
        })
        effect(() => {
            nextAge = user.age + nextAge
        })

        expect(nextCount).toBe(11)
        expect(nextAge).toBe(2)

        // update
        user.count++

        expect(nextCount).toBe(12)
        expect(nextAge).toBe(2)
    })

    it('should return runner when call effect', () => {
        let foo = 1
        const runner = effect(()=> {
            foo++
            return 'foo'
        })

        expect(foo).toBe(2)
        const result = runner()
        expect(foo).toBe(3)
        expect(result).toBe('foo')
        
    })

    it('scheduler', () => {
        // 为 effect 添加 options 参数 { scheduler }，除第一次初始化照常执行 fn 外，之后都调用此 scheduler
        const obj:any = reactive({ foo: 1 })
        let dummy
        let run
        let scheduler = jest.fn(()=> {
            run = runner
        })
        const runner = effect(()=> {
            dummy = obj.foo
            },
            { scheduler }
        ) 
        expect(scheduler).not.toHaveBeenCalled()
        expect(dummy).toBe(1)
        obj.foo++
        expect(dummy).toBe(1)
        expect(scheduler).toHaveBeenCalledTimes(1)
        run()
        expect(dummy).toBe(2)
    })

    it('stop',() => {
        // 使用 stop 函数，传入 runner 将依赖删除，触发 trigger 时不再自动执行 runner
        const obj:any = reactive({ count: 1 })
        let dummy
        const runner = effect(() => {
            dummy = obj.count
        })
        expect(dummy).toBe(1)
        obj.count++
        expect(dummy).toBe(2)
        stop(runner)
        obj.count++
        expect(dummy).toBe(2)
        // 手动执行 runner，仍旧生效
        runner()
        expect(dummy).toBe(3)
    })

    it('onStop',() => {
        const obj:any = reactive({ count: 1 })
        const onStop = jest.fn(()=> {
            console.log('onStop')
        })
        let dummy
        const runner = effect(() => {
            dummy = obj.count
        }, { onStop })
        stop(runner)
        expect(onStop).toHaveBeenCalledTimes(1)
        stop(runner)
        expect(onStop).toHaveBeenCalledTimes(1)
       
    })
})