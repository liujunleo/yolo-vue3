import { computed } from "../computed"
import { reactive } from "../reactive"

describe('computed', () => {
    it('happy path', () => {
        const user = reactive({ age: 18 })
        const age = computed(() => {
            return user.age
        })
        expect(age.value).toBe(18)
    })

    it('should computed lazh', () => {
        const user = reactive({ age: 18 })
        const getter = jest.fn(() => {
            return user.age
        })
        const age = computed(getter)
        expect(getter).toHaveBeenCalledTimes(0)
        age.value
        expect(getter).toHaveBeenCalledTimes(1)
        // lazy cache
        expect(age.value).toBe(18)
        expect(getter).toHaveBeenCalledTimes(1)
        age.value
        // should not computed again
        expect(getter).toHaveBeenCalledTimes(1)
    })
    
    it('when set reactive object & call computed.value， call the getter （trigger  effect）', () => {
        const user = reactive({ age: 18 })
        const getter = jest.fn(() => {
            return user.age
        })
        const age = computed(getter)
        expect(getter).toHaveBeenCalledTimes(0)
        expect(user.age).toBe(18)
        user.age = 20
        expect(user.age).toBe(20)
        expect(getter).toHaveBeenCalledTimes(0)
        expect(age.value).toBe(20)
        expect(getter).toHaveBeenCalledTimes(1)
    })

})