'use strict';

function createVNode(type, props, children) {
    return {
        type,
        props,
        children
    };
}

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
    patch(vnode);
}
function patch(vnode, container) {
    processComponent(vnode);
}
// 处理组件
function processComponent(vnode, container) {
    // 判断 vnode 类型：component
    mountComponent(vnode);
    // TODO
    // 判断 vnode 类型：element
}
// 挂载组件
function mountComponent(vnode, container) {
    const instance = createComponentInstance(vnode);
    setupComponent(instance);
    setupRenderEffect(instance);
}
// 调用 render 获取虚拟节点树 subTree，继续 patch 挂载 component/element
function setupRenderEffect(instance, container) {
    const subTree = instance.render();
    patch(subTree);
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            typeof rootContainer === 'string' ? document.querySelector(rootContainer) : rootContainer;
            const vnode = createVNode(rootComponent);
            render(vnode);
        }
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
