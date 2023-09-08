import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppApi } from "./createApp"
import { Fragment, Text } from "./vnode"

export function createRenderer(options) {
    const { createElement, patchProp, insert } = options

    function render(vnode, container) {
        patch(vnode, container, null)
    }

    // 判断 vnode 类型，区分处理
    function patch(vnode, container, parentComponent) {
        const { type, shapeFlag } = vnode
        switch (type) {
            case Fragment:
                processFragment(vnode, container, parentComponent)
                break;
            case Text:
                processText(vnode, container)
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    // 判断 vnode 类型为 ELEMENT：调用 processElement
                    processElement(vnode, container, parentComponent)
                } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    // 判断 vnode 类型为 STATEFUL_COMPONENT：调用 processComponent
                    processComponent(vnode, container, parentComponent)
                }
                break;
        }
    
    }

    // 处理 Fragment
    function processFragment(vnode: any, container: any, parentComponent) {
        mountChildren(vnode, container, parentComponent)
    }

    // 处理 Text
    function processText(vnode: any, container: any) {
        const { children } = vnode
        const el = vnode.el = document.createTextNode(children)
        container.append(el)
    }

    // 处理 Element
    function processElement(vnode: any, container: any, parentComponent) {
        mountElement(vnode, container, parentComponent)
    }

    // 挂载 Element
    function mountElement(vnode: any, container: any, parentComponent) {
        // create el & save el to vnode
        const el = (vnode.el = createElement(vnode.type) as Element)

        // children
        const { children, shapeFlag } = vnode
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children
        } else if(shapeFlag & ShapeFlags.ARRAY_CHILREN) {
            // handle multiple childrens
            mountChildren(vnode, el, parentComponent)
        }

        // props
        const { props } = vnode
        for (const key in props) {
            const val = props[key]
            patchProp(el, key, val)
        }

        // el append to container
        insert(el, container)
    }

    // 挂载 children 数组，循环调用 patch
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach(v => {
            patch(v, container, parentComponent)
        });
    }

    // 处理组件
    function processComponent(vnode, container, parentComponent) {
        mountComponent(vnode, container, parentComponent)
    }

    // 挂载组件
    function mountComponent(initialVNode, container, parentComponent) {
        const instance = createComponentInstance(initialVNode, parentComponent)
        setupComponent(instance)
        setupRenderEffect(instance, initialVNode, container)
    }

    // 调用 render 获取虚拟节点树 subTree，继续 patch 挂载 component/element
    function setupRenderEffect(instance, initialVNode, container) {
        const { proxy } = instance
        const subTree = instance.render.call(proxy)
        patch(subTree, container, instance)
        initialVNode.el = subTree.el
    }
    
    return {
        createApp: createAppApi(render)
    }
}
