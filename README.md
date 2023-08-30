### Yolo-Vue3 打工人自己的 Vue3
从零开始以 TDD 测试驱动开发形式，逐步实现 Vue3 中三大模块：
1. reactivity 响应式
  - [x] 实现 effect & reactive 依赖收集 & 依赖触发
  - [x] 实现 effect 返回 runner
  - [x] 实现 effect 返回 scheduler 功能
  - [x] 实现 effect 的 stop 功能
  - [x] 实现 readonly 功能
  - [x] 实现 isReactive & isReadonly
  - [x] 优化 stop 功能
  - [x] 实现 reactive & readonly 嵌套对象转换功能
  - [x] 实现 shallowReadonly 功能
  - [x] 实现 isProxy 功能
  - [x] 实现 ref 功能
  - [x] 实现 isRef & unRef 功能
  - [x] 实现 proxyRefs 功能
  - [x] 实现 computed 计算属性功能
     
2. runtime 运行时
  - [x] 实现初始化 component 主流程
  - [x] 使用 rollup 打包代码库
  - [x] 初始化 element 主流程 (example: hello world!)
  - [x] 实现组件代理对象 (setupState & $el)
  - [x] 实现 ShapeFlags & 二进制位运算
3. compiler 编译

#### 小步走实践开发
- 渐进式小步骤开发 Vue3 中功能 & 逻辑
- 单元测试先行，驱动开发满足功能要求
- 每个小步骤独立分支完成 以 pr 形式 merge
- 每完成一个小模块，记录模块实现总结

