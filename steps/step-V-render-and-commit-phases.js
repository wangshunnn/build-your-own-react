/**
 * 在commit阶段, 递归地挂载fiber节点到DOM上.
 */
function commitRoot() {
    // add nodes to dom
    commitWork(wipRoot.child)
    wipRoot = null
}

function commitWork(fiber) {
    if (!fiber) {
        return
    }
    const domParent = fiber.parent.dom
    domParent.appendChild(fiber.dom)
    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

/**
 * render只负责遍历生成wipRoot(Fiber Tree), 不涉及挂载DOM.
 */
function render(element, container) {
    wipRoot = {
        dom: container,
        props: {
            children: [element],
        },
    }
    nextUnitOfWork = wipRoot
}

let nextUnitOfWork = null
let wipRoot = null

function workLoop(deadline) {
    let shouldYield = false
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(
            nextUnitOfWork
        )
        shouldYield = deadline.timeRemaining() < 1
    }

    if (!nextUnitOfWork && wipRoot) {
        commitRoot()
    }

    requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {
    if (!fiber.dom) {
        fiber.dom = createDom(fiber)
    }

    // 在上一步中所写的下面代码存在问题所以需要去掉:
    // 会不停的挂载DOM导致页面DOM一直突变, 如果render过程被中断, 就会看见不完整的UI.
    // 处理: 将所有render产生的DOM变动统一放到commitRoot()(即commit阶段)一起进行.
    //  if (fiber.parent) {
    //      fiber.parent.dom.appendChild(fiber.dom)
    //  }

    // ...
}
