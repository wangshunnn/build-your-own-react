function commitWork(fiber) {
    if (!fiber) {
        return
    }

    // const domParent = fiber.parent.dom
    let domParentFiber = fiber.parent
    while (!domParentFiber.dom) {
        domParentFiber = domParentFiber.parent
    }

    const domParent = domParentFiber.dom
    if (
        fiber.effectTag === "PLACEMENT" &&
        fiber.dom != null
    ) {
        domParent.appendChild(fiber.dom)
    } else if (
        fiber.effectTag === "UPDATE" &&
        fiber.dom != null
    ) {
        updateDom(
            fiber.dom,
            fiber.alternate.props,
            fiber.props
        )
    } else if (fiber.effectTag === "DELETION") {
        // domParent.removeChild(fiber.dom)
        commitDeletion(fiber, domParent)

    }

    commitWork(fiber.child)
    commitWork(fiber.sibling)
}

function commitDeletion(fiber, domParent) {
    if (fiber.dom) {
        domParent.removeChild(fiber.dom)
    } else {
        commitDeletion(fiber.child, domParent)
    }
}

function performUnitOfWork(fiber) {
    // - ---------diff---------
    // - if (!fiber.dom) {
    // -     fiber.dom = createDom(fiber)
    // - }
    // - const elements = fiber.props.children
    // - reconcileChildren(fiber, elements)
    // - ---------diff---------
    const isFunctionComponent =
        fiber.type instanceof Function
    if (isFunctionComponent) {
        updateFunctionComponent(fiber)
    } else {
        updateHostComponent(fiber)
    }

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

function updateFunctionComponent(fiber) {
    // fiber = Didact.createElement(App, {
    //     name: "foo",
    // })
    // ==> fiber.tyle = 'ƒ App() {}', fiber.props = {name: "foo"}
    const children = [fiber.type(fiber.props)]
    reconcileChildren(fiber, children)
}

function updateHostComponent(fiber) {
    if (!fiber.dom) {
        fiber.dom = createDom(fiber)
    }
    reconcileChildren(fiber, fiber.props.children)
}

/** @jsx Didact.createElement */
function App(props) {
    return <h1>Hi {props.name}</h1>
}
const element = <App name="foo" />
const container = document.getElementById("root")
Didact.render(element, container)
