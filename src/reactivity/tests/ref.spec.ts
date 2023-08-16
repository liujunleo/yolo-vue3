import { effect } from "../effect"
import { ref } from "../ref"

describe('ref', () => {
    it('happy path', () => {
        const age = ref(1)
        expect(age.value).toBe(1)
    })

    it('should be reactive', () => {
        const age = ref(1)
        let dummy
        let calls = 0
        effect(() => {
            calls++
            dummy = age.value
        })
        expect(calls).toBe(1)
        expect(dummy).toBe(1)
        age.value = 2
        expect(calls).toBe(2)
        expect(dummy).toBe(2)
        
        // same value should not trigger
        age.value = 2
        expect(calls).toBe(2)
        expect(dummy).toBe(2)
    })

    it('should make nested properpies reactive', () => {
        const user = ref({ age: 1 })
        let dummy
        effect(() => {
            dummy = user.value.age
        })
        expect(dummy).toBe(1)
        user.value = { age: 2}
        expect(dummy).toBe(2)
        user.value.age = 3
        expect(dummy).toBe(3)
    })
})
