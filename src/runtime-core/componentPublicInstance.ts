import { hasOwn } from "../shared"

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
    // $data
    // ...
}

export const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance
        if (hasOwn(setupState, key)) {
            return Reflect.get(setupState, key)
        }
        if (hasOwn(props, key)) {
            return Reflect.get(props, key)
        }
        if (hasOwn(publicPropertiesMap, key)) {
            return Reflect.get(publicPropertiesMap, key)(instance)
        }
    }
}