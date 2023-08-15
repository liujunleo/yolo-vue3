import { isReadonly, shallowReadonly } from "../reactive"

describe('shallowReadonly', () => {
    it('should not make non-reactive properties reactive', () => {
        const origin = shallowReadonly({
            name: 'shallow',
            obj: { count: 1 }
        })
        console.warn = jest.fn()
        // origin.name is readonly & origin's first level properpies, cannot change
        origin.name = 'shallow 2'
        expect(console.warn).toHaveBeenCalledTimes(1)

        expect(isReadonly(origin)).toBe(true)
        expect(isReadonly(origin.name)).toBe(false)
        expect(isReadonly(origin.obj)).toBe(false)
        expect(isReadonly(origin.obj.count)).toBe(false)

        // not readonly & not origin's first level properpies, can set
        origin.obj.count++
        expect(console.warn).toHaveBeenCalledTimes(1)
        expect(origin.obj.count).toBe(2)

        // origin.obj is not readonly, but is origin's first level properpies, cannot set
        origin.obj = { age: 1 }
        expect(origin.obj.age).toBe(undefined)
        expect(console.warn).toHaveBeenCalledTimes(2)

        // not readonly & not first level properpies, can set 
        origin.obj.age = 100
        expect(origin.obj.age).toBe(100)

        // origin is readonly, cannot set
        origin.test = 'test'
        expect(console.warn).toHaveBeenCalledTimes(3)
    })
})