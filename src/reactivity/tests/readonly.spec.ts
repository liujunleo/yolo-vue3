import { readonly } from '../reactive'


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
})