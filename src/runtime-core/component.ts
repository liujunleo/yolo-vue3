import { shallowReadonly } from "../reactivity/reactive"
import { initProps } from "./componentProps"
import { publicInstanceProxyHandlers } from "./componentPublicInstance"

// 创建组件实例
export function createComponentInstance(vnode: any) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {}
    }
    return component
}

// 安装组件
export function setupComponent(instance) {
    initProps(instance, instance.vnode.props)
    // TODO initSlots
    // 为 instance 挂载 setupState、render 函数
    setupStatufulComponent(instance)
}

// 安装组件状态
export function setupStatufulComponent(instance: any) {
    const component = instance.type
    
    // 代理组件对象（setupState、props、$el、$data...）
    instance.proxy = new Proxy( { _: instance }, publicInstanceProxyHandlers)

    // 处理 setup 函数
    if(component.setup) {
        const setupResult = component.setup(shallowReadonly(instance.props))
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
