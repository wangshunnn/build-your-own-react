/**
 * Fiber Tree
 * 为了能在render过程中进行并发渲染(可中断更新), 使用新的数据结构：Fiber Tree.
 * 每个Element对应一个Fiber.
 * 遍历Fiber Tree的优先顺序（从root根节点开始遍历）:
 * 1. child: 子节点；
 * 2. sibling: 兄弟节点；
 * 3. uncle: the sibling of the parent：父节点的兄弟节点。
 * 4. 直到回到root根节点，表示render工作结束。
 */

function createDom(fiber) {
    const dom =
        fiber.type == "TEXT_ELEMENT"
            ? document.createTextNode("")
            : document.createElement(fiber.type)
    const isProperty = key => key !== "children"
    Object.keys(fiber.props)
        .filter(isProperty)
        .forEach(name => {
            dom[name] = fiber.props[name]
        })
    return dom
}

function render(element, container) {
    // set nextUnitOfWork to the root of the fiber tree.
    nextUnitOfWork = {
        dom: container,
        props: {
            children: [element],
        },
    }
}

let nextUnitOfWork = null

function workLoop(deadline) {
    let shouldYield = false
    while (nextUnitOfWork && !shouldYield) {
        nextUnitOfWork = performUnitOfWork(
            nextUnitOfWork
        )
        shouldYield = deadline.timeRemaining() < 1
    }
    requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

function performUnitOfWork(fiber) {
    // add dom node
    if (!fiber.dom) {
        fiber.dom = createDom(fiber)
    }
    if (fiber.parent) {
        fiber.parent.dom.appendChild(fiber.dom)
    }

    // create new fibers
    const elements = fiber.props.children
    let index = 0
    let prevSibling = null
    while (index < elements.length) {
        const element = elements[index]
        const newFiber = {
            type: element.type,
            props: element.props,
            parent: fiber,
            dom: null,
        }
        if (index === 0) {
            // 将children里第一个元素设为父节点的child
            fiber.child = newFiber
        } else {
            // 将children里其他元素, 设为前一个子元素prevSibling的兄弟节点sibling
            prevSibling.sibling = newFiber
        }
        prevSibling = newFiber
        index++
    }

    // search and return next unit of work:
    // 1. We first try with the child,
    // 2. then with the sibling,
    // 3. then with the uncle, and so on.
    if (fiber.child) {
        return fiber.child
    }
    let nextFiber = fiber
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling
        }
        nextFiber = nextFiber.parent
    }
}
