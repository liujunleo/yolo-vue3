
import { reactive } from '../reactive'
import { effect } from '../effect'

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
})