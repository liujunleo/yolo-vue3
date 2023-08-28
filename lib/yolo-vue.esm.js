function createVNode(type, props, children) {
    return {
        type,
        props,
        children
    };
}

const isObject = (val) => {
    return val !== null && typeof (val) === 'object';
};

// 创建组件实例
function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type
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
    if (typeof vnode.type === 'string') {
        // 判断 vnode 类型为 string：调用 processElement
        processElement(vnode, container);
    }
    else if (isObject(vnode.type)) {
        // 判断 vnode 类型为 object：调用 processComponent
        processComponent(vnode, container);
    }
}
// 处理 Element
function processElement(vnode, container) {
    mountElement(vnode, container);
}
// 挂载 Element
function mountElement(vnode, container) {
    debugger;
    // create dom
    const el = document.createElement(vnode.type);
    // children
    const { children } = vnode;
    if (typeof children === 'string') {
        el.textContent = children;
    }
    else if (typeof children === 'object') {
        mountChildren(vnode, el);
    }
    // props
    const { props } = vnode;
    for (const key in props) {
        el.setAttribute(key, props[key]);
    }
    // append to container
    container.append(el);
}
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
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance, container);
}
// 调用 render 获取虚拟节点树 subTree，继续 patch 挂载 component/element
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    patch(subTree, container);
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

export { createApp, h };
