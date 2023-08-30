import { ShapeFlags } from "../shared/ShapeFlags"
import { isObject } from "../shared/index"
import { createComponentInstance, setupComponent } from "./component"

export function render(vnode, container) {
    patch(vnode, container)
}

function patch(vnode, container) {
    const { shapeFlag } = vnode
    if (shapeFlag & ShapeFlags.ELEMENT) {
        // 判断 vnode 类型为 ELEMENT：调用 processElement
        processElement(vnode, container)
    } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 判断 vnode 类型为 STATEFUL_COMPONENT：调用 processComponent
        processComponent(vnode, container)
    }
}

// 处理 Element
function processElement(vnode: any, container: any) {
    mountElement(vnode, container)
}

// 挂载 Element
function mountElement(vnode: any, container: any) {
    // create el & save el to vnode
    const el = (vnode.el = document.createElement(vnode.type) as Element)

    // children
    const { children, shapeFlag } = vnode
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children
    } else if(shapeFlag & ShapeFlags.ARRAY_CHILREN) {
        // handle multiple childrens
        mountChildren(vnode, el)
    }

    // props
    const { props } = vnode
    for (const key in props) {
       el.setAttribute(key, props[key])
    }

    // el append to container
    container.append(el)
}

// 挂载 children 数组，循环调用 patch
function mountChildren(vnode, container) {
    vnode.children.forEach(v => {
        patch(v, container)
    });
}

// 处理组件
function processComponent(vnode, container) {
    mountComponent(vnode, container)
}

// 挂载组件
function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode)
    setupComponent(instance)
    setupRenderEffect(instance, initialVNode, container)
}

// 调用 render 获取虚拟节点树 subTree，继续 patch 挂载 component/element
function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance
    const subTree = instance.render.call(proxy)
    patch(subTree, container)
    initialVNode.el = subTree.el
}

