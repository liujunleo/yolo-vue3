import { reactive } from '../reactive'


describe('reactive', () => {
    it('happy path', () => {
        const origin :any = { age: 1 }
        const user :any = reactive(origin)
        expect(origin).not.toBe(user)
        expect(user.age).toBe(1)
    })
})