import { effect } from '../effect'
import { reactive, readonly, isReadonly, isReactive, isProxy } from '../reactive'


describe('reactive', () => {
    it('happy path', () => {
        const origin :any = { age: 1 }
        const user :any = reactive(origin)
        expect(origin).not.toBe(user)
        expect(user.age).toBe(1)
    })

    it('is readonly',() => {
        const origin :any = { age: 1 }
        const user :any = readonly(origin)
        expect(isReadonly(origin)).toBe(false)
        expect(isReadonly(user)).toBe(true)
    })

    it('is reactive',() => {
        const origin :any = { age: 1 }
        const user :any = reactive(origin)
        expect(isReactive(origin)).toBe(false)
        expect(isReactive(user)).toBe(true)
    })

    it('nested reactive', () => {
        const origin = reactive({
            count:1,
            nested: {
                foo: 1
            },
            array: [{ bar: 2 }]
        })
        expect(isReactive(origin)).toBe(true)
        expect(isReactive(origin.nested)).toBe(true)
        expect(isReactive(origin.array)).toBe(true)
    })

    it('is proxy object', () => {
        const origin :any = { age: 1 }
        const user :any = reactive(origin)
        expect(isProxy(origin)).toBe(false)
        expect(isProxy(user)).toBe(true)
    })
})