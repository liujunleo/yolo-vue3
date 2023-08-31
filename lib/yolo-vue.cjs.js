'use strict';

var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILREN"] = 8] = "ARRAY_CHILREN";
})(ShapeFlags || (ShapeFlags = {}));

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null
    };
    if (typeof children === 'string') {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    }
    else if (typeof children === 'object') {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILREN;
    }
    return vnode;
}
function getShapeFlag(type) {
    return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;
}

const isOn = (key) => {
    return /^on[A-z]/.test(key);
};
const getEventNameByKey = (key) => {
    return key.slice(2).toLocaleLowerCase();
};

const publicPropertiesMap = {
    $el: (i) => i.vnode.el
    // $data
    // ...
};
const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (key in setupState) {
            return Reflect.get(setupState, key);
        }
        if (key in publicPropertiesMap) {
            return Reflect.get(publicPropertiesMap, key)(instance);
        }
    }
};

// 创建组件实例
function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {}
    };
    return component;
}
// 安装组件
function setupComponent(instance) {
    // TODO initProps、initSlots
    // 为 instance 挂载 setupState、render 函数
    setupStatufulComponent(instance);
}
// 安装组件状态
function setupStatufulComponent(instance) {
    const component = instance.type;
    // 代理组件对象（setupState、$el、$data...）
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    // 处理 setup 函数
    if (component.setup) {
        const setupResult = component.setup();
        handleSetupResult(instance, setupResult);
    }
}
// 处理 setupResult（挂载 setupState）
function handleSetupResult(instance, setupResult) {
    if (typeof setupResult === 'object') {
        instance.setupState = setupResult;
        finishComponentSetup(instance);
    }
    // TODO function
}
// 完成组件按钮（挂载render）
function finishComponentSetup(instance) {
    const component = instance.type;
    if (component.render) {
        instance.render = component.render;
    }
}

function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    const { shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.ELEMENT) {
        // 判断 vnode 类型为 ELEMENT：调用 processElement
        processElement(vnode, container);
    }
    else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 判断 vnode 类型为 STATEFUL_COMPONENT：调用 processComponent
        processComponent(vnode, container);
    }
}
// 处理 Element
function processElement(vnode, container) {
    mountElement(vnode, container);
}
// 挂载 Element
function mountElement(vnode, container) {
    // create el & save el to vnode
    const el = (vnode.el = document.createElement(vnode.type));
    // children
    const { children, shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children;
    }
    else if (shapeFlag & ShapeFlags.ARRAY_CHILREN) {
        // handle multiple childrens
        mountChildren(vnode, el);
    }
    // props
    const { props } = vnode;
    for (const key in props) {
        if (isOn(key)) {
            el.addEventListener(getEventNameByKey(key), props[key]);
        }
        else {
            el.setAttribute(key, props[key]);
        }
    }
    // el append to container
    container.append(el);
}
// 挂载 children 数组，循环调用 patch
function mountChildren(vnode, container) {
    vnode.children.forEach(v => {
        patch(v, container);
    });
}
// 处理组件
function processComponent(vnode, container) {
    mountComponent(vnode, container);
}
// 挂载组件
function mountComponent(initialVNode, container) {
    const instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
// 调用 render 获取虚拟节点树 subTree，继续 patch 挂载 component/element
function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    initialVNode.el = subTree.el;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            const container = typeof rootContainer === 'string' ? document.querySelector(rootContainer) : rootContainer;
            const vnode = createVNode(rootComponent);
            render(vnode, container);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
