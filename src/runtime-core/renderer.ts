import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
    patch(vnode, container)
}

function patch(vnode, container) {
    processComponent(vnode, container)
}

// 处理组件
function processComponent(vnode, container) {
    // 判断 vnode 类型：component
    mountComponent(vnode, container)
    // TODO
    // 判断 vnode 类型：element
}

// 挂载组件
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode)
    setupComponent(instance)
    setupRenderEffect(instance, container)
}

// 调用 render 获取虚拟节点树 subTree，继续 patch 挂载 component/element
function setupRenderEffect(instance, container) {
    const subTree = instance.render()
    patch(subTree, container)
}
