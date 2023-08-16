import { effect } from "../effect"
import { reactive } from "../reactive"
import { isRef, ref, unRef } from "../ref"

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

    it('isRef', () => {
        const origin = { age: 1}
        const react = reactive({ age: 1})
        const user = ref({ age: 1 })
        expect(isRef(origin)).toBe(false)
        expect(isRef(react)).toBe(false)
        expect(isRef(user)).toBe(true)
    })

    it('unRef', () => {
        const origin = 'origin'
        const user = ref('user')
        const obj = ref({ age: 18 })
        expect(unRef(origin)).toBe('origin')
        expect(unRef(user)).toBe('user')
        expect(unRef(obj)).toHaveProperty('age')
        expect(unRef(obj).age).toBe(18)
        expect(unRef(1)).toBe(1)
    })
})
