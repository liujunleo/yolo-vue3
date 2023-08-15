import { isReadonly, readonly } from '../reactive'


describe('readonly', () => {
    it('happy path', () => {
        const origin :any = { age: 1 }
        const user :any = readonly(origin)
        expect(origin).not.toBe(user)
        expect(user.age).toBe(1)
        user.age++
        expect(user.age).toBe(1)
    })

    it('warn when call set', () => {
        console.warn = jest.fn()
        const user :any = readonly({ age: 1 })
        user.age++
        // not set
        expect(console.warn).toHaveBeenCalled()
    })

    it('nested readonly', () => {
        const origin = readonly({
            nested: {
                foo: 1
            },
            array: [{ bar: 2 }]
        })
        expect(isReadonly(origin)).toBe(true)
        expect(isReadonly(origin.nested)).toBe(true)
        expect(isReadonly(origin.array)).toBe(true)
    })
})