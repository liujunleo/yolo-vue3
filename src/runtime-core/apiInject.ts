import { getCurrentInstance } from "./component"

// 将 key & value 在当前组件实例 provides 中保存
export function provide(key, value) {
    let currentInstance: any = getCurrentInstance()
    if (currentInstance) {
        let { provides } = currentInstance
        const { provides: parentProvides } = currentInstance.parent || {}

        // provides 与父级 provides 相同，说明是初始化状态进入，将父级 provides 设置到当前 provides 原型
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides)
        }

        // 在当前组件实例 provides 对象中保存 key & value
        provides[key] = value
    }
}

// 根据 key 取值，在当前组件的父级实例 provides 对象匹配，利用原型链特性一直向上寻找属性，直到 null
export function inject(key) {
    let currentInstance: any = getCurrentInstance()
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides
        console.log(`${currentInstance.type.name} parentProvides`,parentProvides)
        return parentProvides[key]
    }
}