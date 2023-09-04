import { shallowReadonly } from "../reactivity/reactive"
import { emit } from "./componentEmit"
import { initProps } from "./componentProps"
import { publicInstanceProxyHandlers } from "./componentPublicInstance"
import { initSlots } from "./componentSlots"

// 创建组件实例
export function createComponentInstance(vnode: any) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        emit: () => {}
    }
    // 为 emit 绑定当前组件实例作为第一个参数 instance
    component.emit = emit.bind(null, component) as any
    return component
}

// 安装组件
export function setupComponent(instance) {
    initProps(instance, instance.vnode.props)
    initSlots(instance, instance.vnode.children)
    setupStatufulComponent(instance)
}

// 安装组件状态
export function setupStatufulComponent(instance: any) {
    const component = instance.type
    
    // 代理组件对象（setupState、props、$el、$data...）
    instance.proxy = new Proxy( { _: instance }, publicInstanceProxyHandlers)

    // 处理 setup 函数
    const { setup } = component
    if(setup) {
        setCurrentInstance(instance)
        const setupResult = component.setup(shallowReadonly(instance.props), { emit: instance.emit })
        setCurrentInstance(null)
        handleSetupResult(instance, setupResult)
    }
}

// 处理 setupResult（挂载 setupState）
export function handleSetupResult(instance: any, setupResult: any) {
    // TODO function
    
    // object
    if(typeof setupResult === 'object') {
        instance.setupState = setupResult
    }
    finishComponentSetup(instance)
}

// 完成组件按钮（挂载render）
export function finishComponentSetup(instance: any) {
    const component = instance.type
    instance.render = component.render
}

let currentInstance = null

export function getCurrentInstance() {
    return currentInstance
}

export function setCurrentInstance(instance) {
    currentInstance = instance
}
