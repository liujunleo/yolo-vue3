import { effect } from "../reactivity/effect"
import { EMPTY_OBJ } from "../shared"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppApi } from "./createApp"
import { Fragment, Text } from "./vnode"

export function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert } = options

    // 开启渲染
    function render(vnode, container) {
        patch(null, vnode, container, null)
    }

    // n1：旧的vnode n2：新的vnode
    // 判断 vnode 类型，区分处理
    function patch(n1, n2, container, parentComponent) {
        const { type, shapeFlag } = n2
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent)
                break;
            case Text:
                processText(n1, n2, container)
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    // 判断 vnode 类型为 ELEMENT：调用 processElement
                    processElement(n1, n2, container, parentComponent)
                } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    // 判断 vnode 类型为 STATEFUL_COMPONENT：调用 processComponent
                    processComponent(n1, n2, container, parentComponent)
                }
                break;
        }
    
    }

    // 处理 Fragment
    function processFragment(n1: any, n2: any, container: any, parentComponent) {
        mountChildren(n2, container, parentComponent)
    }

    // 处理 Text
    function processText(n1: any, n2: any, container: any) {
        const { children } = n2
        const el = n2.el = document.createTextNode(children)
        container.append(el)
    }

    // 处理 Element
    function processElement(n1, n2: any, container: any, parentComponent) {
        if(!n1) {
            mountElement(n2, container, parentComponent)
        } else {
            patchElement(n1, n2, container)
        }
    }

    function patchElement(n1, n2, container) {
        console.log('update patchElement')
        console.log('n1', n1)
        console.log('n2', n2)
 
        const oldProps = n1.props || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ
        const el = n2.el = n1.el

        // 对比 props
        patchProps(el, oldProps, newProps)

        // 对比 children
    }

    // 对比新老节点 props 差异
    function patchProps(el, oldProps, newProps) {
        if(oldProps !== newProps) {
            // newProp与oldProp不一致时，设置newProp值（修改、新增）
            for(const key in newProps) {
                const prevProp = oldProps[key]
                const nextProp = newProps[key]
                if(prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp)
                }
            }

            if(oldProps !== EMPTY_OBJ) {
                // oldProps中key不在newProps时，删除el中对应key属性
                for(const key in oldProps) {
                    if(!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null)
                    }
                }
            }
        }
    }

    // 挂载 Element
    function mountElement(vnode: any, container: any, parentComponent) {
        // create el & save el to vnode
        const el = (vnode.el = hostCreateElement(vnode.type) as Element)

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
            hostPatchProp(el, key, null, val)
        }

        // el append to container
        hostInsert(el, container)
    }

    // 挂载 children 数组，循环调用 patch
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach(v => {
            patch(null, v, container, parentComponent)
        });
    }

    // 处理组件
    function processComponent(n1, n2, container, parentComponent) {
        mountComponent(n2, container, parentComponent)
    }

    // 挂载组件
    function mountComponent(initialVNode, container, parentComponent) {
        const instance = createComponentInstance(initialVNode, parentComponent)
        setupComponent(instance)
        setupRenderEffect(instance, initialVNode, container)
    }

    // 调用 render 获取虚拟节点树 subTree，继续 patch 挂载 component/element
    function setupRenderEffect(instance, initialVNode, container) {
        effect(() => {
            if(!instance.isMounted) {
                // mount
                const { proxy } = instance
                const subTree = (instance.subTree = instance.render.call(proxy))

                patch(null, subTree, container, instance)
                initialVNode.el = subTree.el
                instance.isMounted = true
            } else {
                // update
                const { proxy } = instance
                const subTree = instance.render.call(proxy)
                const prevSubTree = instance.subTree

                // 更新当前 subTree 记录，方便与下次 update 对比
                instance.subTree = subTree

                patch(prevSubTree, subTree, container, instance)
            }
            
        })
    }
    
    return {
        createApp: createAppApi(render)
    }
}
