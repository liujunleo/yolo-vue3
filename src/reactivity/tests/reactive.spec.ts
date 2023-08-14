import { reactive, readonly, isReadonly, isReactive } from '../reactive'


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
})