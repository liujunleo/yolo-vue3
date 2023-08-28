import { effect } from "../effect"
import { reactive } from "../reactive"
import { isRef, proxyRefs, ref, unRef } from "../ref"

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
        expect(unRef(1)).toBe(1)
        expect(unRef(origin)).toBe('origin')
        expect(unRef(user)).toBe('user')
        expect(unRef(obj)).toHaveProperty('age')
        expect(unRef(obj).age).toBe(18)
    })

    it('proxyRefs', () => {
        const origin = { 
            age: ref(18),
            name: 'leo' as any
        }
        const proxyUser = proxyRefs(origin)
        expect(origin.age.value).toBe(18)
        expect(proxyUser.age).toBe(18)
        expect(proxyUser.name).toBe('leo')
        // set normal value
        proxyUser.age = 20
        expect(proxyUser.age).toBe(20)
        expect(origin.age.value).toBe(20)
        // set ref value
        proxyUser.age = ref(30)
        expect(proxyUser.age).toBe(30)
        expect(origin.age.value).toBe(30)
        // change name to ref
        proxyUser.name = ref('joe')
        expect(proxyUser.name).toBe('joe')
        expect(origin.name.value).toBe('joe')
    })
})


