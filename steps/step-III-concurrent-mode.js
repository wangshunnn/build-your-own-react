/**
 * React doesn’t use requestIdleCallback anymore. 
 * Now it uses the scheduler package. 
 * But for this use case it’s conceptually the same.
 * 
 * requestIdleCallback also gives us a 'deadline' parameter. 
 * We can use it to check how much time we have until the browser needs to take control again.
 */

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

function performUnitOfWork(nextUnitOfWork) {
    // TODO
}
