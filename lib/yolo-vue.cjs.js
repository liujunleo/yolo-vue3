'use strict';

const extend = Object.assign;
const EMPTY_OBJ = {};
const isObject = (val) => {
    return val !== null && typeof (val) === 'object';
};
const hasChanged = (value, newValue) => {
    return !Object.is(value, newValue);
};
const isOn = (key) => {
    return /^on[A-z]/.test(key);
};
const getEventNameByKey = (key) => {
    return key.slice(2).toLocaleLowerCase();
};
const hasOwn = (target, key) => Object.prototype.hasOwnProperty.call(target, key);
// 首字母大写
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
// 将 event 转化成组件中的命名格式，event -> onEvent、event-name -> onEventName
function toHandleKey(str) {
    return str ? `on${capitalize(str)}` : '';
}
// 去除-以及转换-后首字母为大写
function camelize(str) {
    return str.replace(/-(\w)/g, (rule, v) => {
        return v ? v.toUpperCase() : '';
    });
}

const targetMap = new Map();
let activeEffect;
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler) {
        this.deps = [];
        this.active = true;
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const result = this._fn();
        shouldTrack = false;
        return result;
    }
    stop() {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    }
}
function cleanupEffect(effect) {
    effect.deps.forEach(dep => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
function track(target, key) {
    if (!isTracking())
        return;
    //  将对象的依赖数组取出
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap); // [ { user: count }: [] ]
    }
    // 将 key 的依赖取数
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep); // [ { user: count }: [ count: [] ] ]
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect); // [ { user: count }: [ count: [ ReactiveEffect, ReactiveEffect, ...] ] ]
    activeEffect.deps.push(dep);
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
function trigger(target, key) {
    // 如果 reactive 对象未使用过 effect，无需 trigger
    if (targetMap.size > 0) {
        const depsMap = targetMap.get(target);
        if (depsMap && depsMap.has(key)) {
            const dep = depsMap.get(key);
            triggerEffects(dep);
        }
    }
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
function effect(fn, options = {}) {
    // fn
    const _effect = new ReactiveEffect(fn, options.scheduler);
    // options
    extend(_effect, options);
    _effect.run();
    // runner
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

var ShapeFlags;
(function (ShapeFlags) {
    ShapeFlags[ShapeFlags["ELEMENT"] = 1] = "ELEMENT";
    ShapeFlags[ShapeFlags["STATEFUL_COMPONENT"] = 2] = "STATEFUL_COMPONENT";
    ShapeFlags[ShapeFlags["TEXT_CHILDREN"] = 4] = "TEXT_CHILDREN";
    ShapeFlags[ShapeFlags["ARRAY_CHILREN"] = 8] = "ARRAY_CHILREN";
    ShapeFlags[ShapeFlags["SLOT_CHILDREN"] = 16] = "SLOT_CHILDREN";
})(ShapeFlags || (ShapeFlags = {}));

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly = false, isShallow = false) {
    return function get(target, key) {
        // 判断 isReadonly｜isReactive
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly;
        }
        else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        // 如果是表层响应对象，直接返回
        if (isShallow) {
            return res;
        }
        // 处理嵌套对象
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        // 响应对象收集依赖
        if (!isReadonly) {
            track(target, key); // 依赖收集
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key); // 依赖触发
        return res;
    };
}
const mutableHandler = {
    get,
    set,
};
const readonlyHandler = {
    get: readonlyGet,
    set: (target, key, value) => {
        console.warn('Cannot change readonly object');
        return true;
    }
};
const shallowReadonlyHandler = extend({}, readonlyHandler, {
    get: shallowReadonlyGet
});

var ReactiveFlags;
(function (ReactiveFlags) {
    ReactiveFlags["IS_REACTIVE"] = "__v__is_reactive";
    ReactiveFlags["IS_READONLY"] = "__v__is_readonly";
})(ReactiveFlags || (ReactiveFlags = {}));
function reactive(raw) {
    return createActiveObject(raw, mutableHandler);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandler);
}
function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandler);
}
function createActiveObject(target, baseHandler) {
    if (!isObject(target)) {
        console.warn('target is not a object');
        return target;
    }
    return new Proxy(target, baseHandler);
}

// proxy 只接收 objec，不支持基本类型（string，boolean，number）
// 如 reactive 中一般使用 proxy 来劫持 get/set 进行依赖收集、依赖触发
// 使用 RefImpl 将 ref(值) 包装成 object，如：{ value: 值 } ，再使用 reactive & proxy 能力 & 逻辑
class RefImpl {
    constructor(value) {
        this.__v__is_ref = true;
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
    }
    get value() {
        // 当 ref 变量在 effect(fn) 中被使用，effect 会 new ReactiveEffect 来收集依赖
        // 在 ReactiveEffect 中 run 函数，会初始化 shouldTrack & activeEffect
        if (isTracking()) {
            trackEffects(this.dep);
        }
        return this._value;
    }
    set value(newValue) {
        if (!hasChanged(newValue, this._rawValue))
            return;
        this._rawValue = newValue;
        this._value = convert(newValue);
        // 当 ref 变量被 set 时，查看 dep 并触发其所有依赖（ReactiveEffect.run）
        triggerEffects(this.dep);
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function isRef(ref) {
    return !!ref.__v__is_ref;
}
function unRef(ref) {
    // 如果是 ref 对象，返回 ref 下的 value 值
    // 否则直接返回
    return isRef(ref) ? ref.value : ref;
}
function ref(value) {
    return new RefImpl(value);
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            // 获取属性值，如果是 ref，节省 .value 步骤直接获取
            // 如：const user = proxyRefs({ age: ref(18) }) -> user.age
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            // 设置属性值，如果是 ref，节省 .value 步骤直接设置
            // 如：const user = proxyRefs({ age: ref(18) }) -> user.age = 20
            // 如果 target[key] 是 ref, 但 value 不是 ref, 将 value 赋值到 target[key].value，以节省 .value 步骤
            if (isRef(target[key]) && !isRef(value)) {
                return target[key].value = value;
            }
            else {
                // 其他情况直接赋值
                // 同是 ref 赋值：const user = proxyRefs({ age: ref(18) }) -> user.age = ref(20)
                // 非 ref 赋值 ref：const user = proxyRefs({ age: 18 }) -> user.age = ref(20)
                return Reflect.set(target, key, value);
            }
        }
    });
}

// instance 通过上层对 emit 函数 bind(null, instance) 绑定第一个参数为当前 instance
// event 事件名，通过 event 转换为事件函数命名格式（以 on 开头的驼峰命名格式），在 instance.props 中匹配对应的事件，并调用
// ...args 接收所有参数，且在调用对应事件函数时，作为回调数据传入
function emit(instance, event, ...args) {
    const { props } = instance;
    const handleName = toHandleKey(camelize(event));
    const handle = props[handleName];
    handle && handle(...args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots
    // $data
    // ...
};
const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return Reflect.get(setupState, key);
        }
        if (hasOwn(props, key)) {
            return Reflect.get(props, key);
        }
        if (hasOwn(publicPropertiesMap, key)) {
            return Reflect.get(publicPropertiesMap, key)(instance);
        }
    }
};

function initSlots(instance, children) {
    const { vnode } = instance;
    // vnode.shapeFlag 标记为 SLOT_CHILDREN 时，才执行绑定 slots 逻辑
    if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

// 创建组件实例
function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: {},
        emit: () => { }
    };
    // 为 emit 绑定当前组件实例作为第一个参数 instance
    component.emit = emit.bind(null, component);
    return component;
}
// 安装组件
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatufulComponent(instance);
}
// 安装组件状态
function setupStatufulComponent(instance) {
    const component = instance.type;
    // 代理组件对象（setupState、props、$el、$data...）
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    // 处理 setup 函数
    const { setup } = component;
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = component.setup(shallowReadonly(instance.props), { emit: instance.emit });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
// 处理 setupResult（挂载 setupState）
function handleSetupResult(instance, setupResult) {
    // TODO function
    // object
    if (typeof setupResult === 'object') {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
// 完成组件按钮（挂载render）
function finishComponentSetup(instance) {
    const component = instance.type;
    instance.render = component.render;
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        key: props && props.key,
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
    // 如果当前 vnode，为组件且 children 为 object，设置 shapeFlag 为 SLOT_CHILDREN 标记
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        if (typeof vnode.children === 'object') {
            vnode.shapeFlag |= ShapeFlags.SLOT_CHILDREN;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === 'string' ? ShapeFlags.ELEMENT : ShapeFlags.STATEFUL_COMPONENT;
}

function createAppApi(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                const container = typeof rootContainer === 'string' ? document.querySelector(rootContainer) : rootContainer;
                const vnode = createVNode(rootComponent);
                render(vnode, container);
            }
        };
    };
}

function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText } = options;
    // 开启渲染
    function render(vnode, container) {
        patch(null, vnode, container, null, null);
    }
    // n1：旧的vnode n2：新的vnode
    // 判断 vnode 类型，区分处理
    function patch(n1, n2, container, parentComponent, anchor) {
        const { type, shapeFlag } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    // 判断 vnode 类型为 ELEMENT：调用 processElement
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    // 判断 vnode 类型为 STATEFUL_COMPONENT：调用 processComponent
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
                break;
        }
    }
    // 处理 Fragment
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor);
    }
    // 处理 Text
    function processText(n1, n2, container) {
        const { children } = n2;
        const el = n2.el = document.createTextNode(children);
        container.append(el);
    }
    // 处理 Element
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log('update patchElement');
        console.log('n1', n1);
        console.log('n2', n2);
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = n2.el = n1.el;
        // 对比 children
        patchChildren(n1, n2, el, parentComponent, anchor);
        // 对比 props
        patchProps(el, oldProps, newProps);
    }
    // 对比新老节点 children 差异
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const prevShapeFlag = n1.shapeFlag;
        const nextShapeFlag = n2.shapeFlag;
        const c1 = n1.children;
        const c2 = n2.children;
        if (nextShapeFlag & ShapeFlags.TEXT_CHILDREN) {
            // array to text
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILREN) {
                // 删除原来的 array children
                unmountChildren(n1.children);
            }
            // text to text
            if (c1 !== c2) {
                hostSetElementText(container, c2);
            }
        }
        else {
            // text to array
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(container, '');
                mountChildren(c2, container, parentComponent, anchor);
            }
            else {
                // array to array （diff算法）
                patchKeyedChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    // 对比新老 children diff 算法
    function patchKeyedChildren(c1, c2, container, parentComponent, parentAnchor) {
        // 新数组长度
        let l2 = c2.length;
        // 数组开始下标
        let i = 0;
        // 老数组最大长度
        let e1 = c1.length - 1;
        // 新数组最大长度
        let e2 = l2 - 1;
        function isSameVNodeType(n1, n2) {
            return n1.type === n2.type && n1.key === n2.key;
        }
        // 1. 左侧对比新老数组，找到第一个不同处的下标，作为开始下标：i
        // 如：a b | a b c，找到 c 作为开始下标
        // while (开始下标 i 不能大于新老数组长度)
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            // 如果标签的 type 和 key 都一致，则认定为同一个 child，无变化
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            i++;
        }
        console.log('i', i);
        // 2. 右侧对比新老数组，找到第一个差异的下标，作为结束下标：e1 & e2
        // 如：a b | c a b，找到 c
        // while (开始下标 i 不能大于新老数组长度)
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            // 如果标签的 type 和 key 都一致，则认定为同一个 vnode，执行 patch 继续递归对比 props、children 等
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        console.log('e1', e1);
        console.log('e2', e2);
        // 3. 新的比老的长时 - 创建
        // 循环新增从 i 到 e2 的值
        // 如：ab -> dcab，添加 dc 到 ab 前
        if (i > e1) {
            if (i <= e2) {
                const nextPos = e2 + 1;
                const anchor = nextPos < l2 ? c2[nextPos].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        // 4. 老的比新的长时 - 删除
        // 循环删除从 i 到 e1 的值
        // 如：abc -> ab，删除 c，i：2 e1：2 e2：1
        else if (i > e2) {
            if (i <= e1) {
                while (i <= e1) {
                    hostRemove(c1[i].el);
                    i++;
                }
            }
        }
        // 剩余乱序部分
        else ;
    }
    // 删除 children
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            hostRemove(el);
        }
    }
    // 对比新老节点 props 差异
    function patchProps(el, oldProps, newProps) {
        if (oldProps !== newProps) {
            // newProp与oldProp不一致时，设置newProp值（修改、新增）
            for (const key in newProps) {
                const prevProp = oldProps[key];
                const nextProp = newProps[key];
                if (prevProp !== nextProp) {
                    hostPatchProp(el, key, prevProp, nextProp);
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                // oldProps中key不在newProps时，删除el中对应key属性
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, oldProps[key], null);
                    }
                }
            }
        }
    }
    // 挂载 Element
    function mountElement(vnode, container, parentComponent, anchor) {
        // create el & save el to vnode
        const el = (vnode.el = hostCreateElement(vnode.type));
        // children
        const { children, shapeFlag } = vnode;
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children;
        }
        else if (shapeFlag & ShapeFlags.ARRAY_CHILREN) {
            // handle multiple childrens
            mountChildren(vnode.children, el, parentComponent, anchor);
        }
        // props
        const { props } = vnode;
        for (const key in props) {
            const val = props[key];
            hostPatchProp(el, key, null, val);
        }
        // el append to container
        hostInsert(el, container, anchor);
    }
    // 挂载 children 数组，循环调用 patch
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach(v => {
            patch(null, v, container, parentComponent, anchor);
        });
    }
    // 处理组件
    function processComponent(n1, n2, container, parentComponent, anchor) {
        mountComponent(n2, container, parentComponent, anchor);
    }
    // 挂载组件
    function mountComponent(initialVNode, container, parentComponent, anchor) {
        const instance = createComponentInstance(initialVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container, anchor);
    }
    // 调用 render 获取虚拟节点树 subTree，继续 patch 挂载 component/element
    function setupRenderEffect(instance, initialVNode, container, anchor) {
        effect(() => {
            if (!instance.isMounted) {
                // mount
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));
                patch(null, subTree, container, instance, anchor);
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                // update
                const { proxy } = instance;
                const subTree = instance.render.call(proxy);
                const prevSubTree = instance.subTree;
                // 更新当前 subTree 记录，方便与下次 update 对比
                instance.subTree = subTree;
                patch(prevSubTree, subTree, container, instance, anchor);
            }
        });
    }
    return {
        createApp: createAppApi(render)
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === 'function') {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

// 将 key & value 在当前组件实例 provides 中保存
function provide(key, value) {
    let currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const { provides: parentProvides } = currentInstance.parent || {};
        // provides 与父级 provides 相同，说明是初始化状态进入，将父级 provides 设置到当前 provides 原型
        if (provides === parentProvides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        // 在当前组件实例 provides 对象中保存 key & value
        provides[key] = value;
    }
}
// 根据 key 取值，在当前组件的父级实例 provides 对象匹配，利用原型链特性一直向上寻找属性，直到 null
function inject(key) {
    let currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        console.log(`${currentInstance.type.name} parentProvides`, parentProvides);
        return parentProvides[key];
    }
}

// 创建元素
function createElement(type) {
    return document.createElement(type);
}
// 处理 props
function patchProp(el, key, prevVal, nextVal) {
    if (isOn(key)) {
        el.addEventListener(getEventNameByKey(key), nextVal);
    }
    else {
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
// 插入元素
function insert(el, parent, anchor) {
    parent.insertBefore(el, anchor || null);
}
// 移除元素
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
// 设置元素文本内容
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({ createElement, patchProp, insert, remove, setElementText });
function createApp(...args) {
    return renderer.createApp(...args);
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.ref = ref;
exports.renderSlots = renderSlots;
