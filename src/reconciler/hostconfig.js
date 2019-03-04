/**
 * -------------------------------------------
 * Host Config file.
 *
 * See:
 *   https://github.com/facebook/react/tree/master/packages/react-reconciler
 *   https://github.com/facebook/react/blob/master/packages/react-reconciler/src/forks/ReactFiberHostConfig.custom.js
 * -------------------------------------------
 */

import invariant from 'fbjs/lib/invariant'
import performanceNow from 'performance-now'
import { createElement } from '../utils/element'
import { CHILDREN, applyDefaultProps } from '../utils/props'

const EMPTY_OBJECT = {}

function shouldDeprioritize(type, props) {
  const isAlphaVisible = () => !props.alpha || props.alpha > 0
  const isRenderable = () => props.renderable === true
  const isVisible = () => props.visible === true

  return [isAlphaVisible, isRenderable, isVisible].some(isVisible => !isVisible())
}

function appendChild(parent, child) {
  if (parent.addChild) {
    parent.addChild(child)

    if (typeof child.didMount === 'function') {
      child.didMount.call(child, child, parent)
    }
  }
}

function removeChild(parent, child) {
  if (typeof child.willUnmount === 'function') {
    child.willUnmount.call(child, child, parent)
  }

  parent.removeChild(child)
  child.destroy()
}

function insertBefore(parent, child, beforeChild) {
  invariant(child !== beforeChild, 'PixiFiber cannot insert node before itself')

  const childExists = parent.children.indexOf(child) !== -1
  const index = parent.getChildIndex(beforeChild)

  childExists ? parent.setChildIndex(child, index) : parent.addChildAt(child, index)
}

export default {
  getRootHostContext(rootContainerInstance) {
    return rootContainerInstance
  },

  getChildHostContext() {
    return EMPTY_OBJECT
  },

  getPublicInstance(instance) {
    return instance
  },

  prepareForCommit() {
    // noop
  },

  resetAfterCommit() {
    // noop
  },

  createInstance: createElement,

  appendInitialChild: appendChild,

  finalizeInitialChildren(wordElement, type, props) {
    return false
  },

  prepareUpdate(pixiElement, type, oldProps, newProps, rootContainerInstance, hostContext) {
    return true
  },

  shouldSetTextContent(type, props) {
    return false
  },

  shouldDeprioritizeSubtree(type, props) {
    return shouldDeprioritize(type, props)
  },

  createTextInstance(text, rootContainerInstance, internalInstanceHandler) {
    invariant(false, 'PixiFiber does not support text instances. Use `<Text /> component` instead.')
  },

  now: performanceNow,

  isPrimaryRenderer: false,

  supportsMutation: true,

  /**
   * -------------------------------------------
   * Mutation
   * -------------------------------------------
   */

  appendChild,

  appendChildToContainer: appendChild,

  removeChild,

  removeChildFromContainer: removeChild,

  insertBefore,

  insertInContainerBefore: insertBefore,

  commitUpdate(instance, updatePayload, type, oldProps, newProps) {
    let applyProps = (instance && instance.applyProps) || applyDefaultProps

    applyProps(instance, oldProps, newProps)
  },

  commitMount(instance, updatePayload, type, oldProps, newProps) {
    // noop
  },

  commitTextUpdate(textInstance, oldText, newText) {
    // noop
  },

  resetTextContent(pixiElement) {
    // noop
  },

  scheduleAnimationCallback: window.requestAnimationFrame,

  scheduleDeferredCallback: window.requestIdleCallback,
}
