const publicPropertiesMap = {
    $el: (i)=> i.vnode.el
    // $data
    // ...
}

export const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance
        if(key in setupState) {
            return Reflect.get(setupState,key)
        }
        if (key in publicPropertiesMap) {
            return Reflect.get(publicPropertiesMap,key)(instance)
        }
    }
}