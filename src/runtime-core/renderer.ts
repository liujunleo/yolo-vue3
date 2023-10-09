import { effect } from "../reactivity/effect"
import { EMPTY_OBJ } from "../shared"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { createAppApi } from "./createApp"
import { Fragment, Text } from "./vnode"

export function createRenderer(options) {
    const { 
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
        remove: hostRemove,
        setElementText: hostSetElementText
    } = options

    // 开启渲染
    function render(vnode, container) {
        patch(null, vnode, container, null, null)
    }

    // n1：旧的vnode n2：新的vnode
    // 判断 vnode 类型，区分处理
    function patch(n1, n2, container, parentComponent, anchor) {
        const { type, shapeFlag } = n2
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor)
                break;
            case Text:
                processText(n1, n2, container)
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    // 判断 vnode 类型为 ELEMENT：调用 processElement
                    processElement(n1, n2, container, parentComponent, anchor)
                } else if(shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    // 判断 vnode 类型为 STATEFUL_COMPONENT：调用 processComponent
                    processComponent(n1, n2, container, parentComponent, anchor)
                }
                break;
        }
    
    }

    // 处理 Fragment
    function processFragment(n1: any, n2: any, container: any, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor)
    }

    // 处理 Text
    function processText(n1: any, n2: any, container: any) {
        const { children } = n2
        const el = n2.el = document.createTextNode(children)
        container.append(el)
    }

    // 处理 Element
    function processElement(n1, n2: any, container: any, parentComponent, anchor) {
        if(!n1) {
            mountElement(n2, container, parentComponent, anchor)
        } else {
            patchElement(n1, n2, container, parentComponent, anchor)
        }
    }

    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log('update patchElement')
        console.log('n1', n1)
        console.log('n2', n2)
 
        const oldProps = n1.props || EMPTY_OBJ
        const newProps = n2.props || EMPTY_OBJ
        const el = n2.el = n1.el

        // 对比 children
        patchChildren(n1, n2, el, parentComponent, anchor)

        // 对比 props
        patchProps(el, oldProps, newProps)
    }

    // 对比新老节点 children 差异
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const prevShapeFlag = n1.shapeFlag
        const nextShapeFlag = n2.shapeFlag
        const c1 = n1.children
        const c2 = n2.children

        if(nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
            // array to text
            if(prevShapeFlag & ShapeFlags.ARRAY_CHILREN) {
                // 删除原来的 array children
                unmountChildren(n1.children)
            }
            // text to text
            if(c1 !== c2) {
                hostSetElementText(container, c2)
            }
        }
        else {
            // text to array
            if(prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(container, '')
                mountChildren(c2, container, parentComponent, anchor)
            } else {
                // array to array （diff算法）
                patchKeyedChildren(c1, c2, container, parentComponent, anchor)
            }
        }
    }

    // 对比新老 children diff 算法
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        // 新数组长度
        let l2 = c2.length
        // 数组开始下标
        let i = 0
        // 老数组最大长度
        let e1 = c1.length - 1
        // 新数组最大长度
        let e2 = l2 - 1


        function isSameVNodeType(n1, n2) {
           return n1.type === n2.type && n1.key === n2.key
        }
        
        // 1. 左侧对比新老数组，找到第一个不同处的下标，作为开始下标：i
        // 如：a b | a b c，找到 c 作为开始下标
        // while (开始下标 i 不能大于新老数组长度)
        while(i <= e1 && i <= e2) {
            const n1 = c1[i]
            const n2 = c2[i]
            // 如果标签的 type 和 key 都一致，则认定为同一个 child，无变化
            if(isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor)
            } else {
                break
            }
            i++
        }
        console.log('i', i)

        // 2. 右侧对比新老数组，找到第一个差异的下标，作为结束下标：e1 & e2
        // 如：a b | c a b，找到 c

        // while (开始下标 i 不能大于新老数组长度)
        while(i <= e1 && i <= e2) {
            const n1 = c1[e1]
            const n2 = c2[e2]
            // 如果标签的 type 和 key 都一致，则认定为同一个 vnode，执行 patch 继续递归对比 props、children 等
            if(isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor)
            } else {
                break
            }
            e1--
            e2--
        }
        console.log('e1', e1)
        console.log('e2', e2)

        // 3. 新的比老的长时 - 创建
        // 循环新增从 i 到 e2 的值
        // 如：ab -> dcab，添加 dc 到 ab 前
        if(i > e1) {
            if(i <= e2) {
                const nextPos = e2 + 1;
                const anchor = nextPos < l2 ? c2[nextPos].el : null;
                while(i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor)
                    i++
                }
            }
        }
        // 4. 老的比新的长时 - 删除
        // 循环删除从 i 到 e1 的值
        // 如：abc -> ab，删除 c，i：2 e1：2 e2：1
        else if(i > e2) {
            if(i <= e1) {
                while(i <= e1) {
                    hostRemove(c1[i].el)
                    i++
                }
            }
        }
        // 剩余乱序部分
        else {
            // TODO 创建新的、删除老的、移动
        }
    }

    // 删除 children
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el
            hostRemove(el)
        }
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
    function mountElement(vnode: any, container: any, parentComponent, anchor) {
        // create el & save el to vnode
        const el = (vnode.el = hostCreateElement(vnode.type) as Element)

        // children
        const { children, shapeFlag } = vnode
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children
        } else if(shapeFlag & ShapeFlags.ARRAY_CHILREN) {
            // handle multiple childrens
            mountChildren(vnode.children, el, parentComponent, anchor)
        }

        // props
        const { props } = vnode
        for (const key in props) {
            const val = props[key]
            hostPatchProp(el, key, null, val)
        }

        // el append to container
        hostInsert(el, container, anchor)
    }

    // 挂载 children 数组，循环调用 patch
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach(v => {
            patch(null, v, container, parentComponent, anchor)
        });
    }

    // 处理组件
    function processComponent(n1, n2, container, parentComponent, anchor) {
        mountComponent(n2, container, parentComponent, anchor)
    }

    // 挂载组件
    function mountComponent(initialVNode, container, parentComponent, anchor) {
        const instance = createComponentInstance(initialVNode, parentComponent)
        setupComponent(instance)
        setupRenderEffect(instance, initialVNode, container, anchor)
    }

    // 调用 render 获取虚拟节点树 subTree，继续 patch 挂载 component/element
    function setupRenderEffect(instance, initialVNode, container, anchor) {
        effect(() => {
            if(!instance.isMounted) {
                // mount
                const { proxy } = instance
                const subTree = (instance.subTree = instance.render.call(proxy))

                patch(null, subTree, container, instance, anchor)
                initialVNode.el = subTree.el
                instance.isMounted = true
            } else {
                // update
                const { proxy } = instance
                const subTree = instance.render.call(proxy)
                const prevSubTree = instance.subTree

                // 更新当前 subTree 记录，方便与下次 update 对比
                instance.subTree = subTree

                patch(prevSubTree, subTree, container, instance, anchor)
            }
            
        })
    }
    
    return {
        createApp: createAppApi(render)
    }
}
