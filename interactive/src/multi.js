const createREGL = require('regl')

module.exports = function createMultiplexor (inputs) {
  var reglInput = {}
  if (inputs) {
    Object.keys(inputs).forEach(function (input) {
      reglInput[input] = inputs[input]
    })
  }

  var pixelRatio = reglInput.pixelRatio || window.devicePixelRatio
  reglInput.pixelRatio = pixelRatio


  function resize () {
    // canvas.width = pixelRatio * window.innerWidth
    // canvas.height = pixelRatio * window.innerHeight
  }

  // resize()

  window.addEventListener('resize', resize, false)

  delete reglInput.gl
  delete reglInput.container

  var regl = createREGL(reglInput)
  var subcontexts = []

  var viewBox = {
    x: 0,
    y: 0,
    width: 0,
    height: 0
  }

  function createSubContext (input) {
    console.log(input)
    var element
    if (typeof input === 'object' && input) {
      if (typeof input.getBoundingClientRect === 'function') {
        element = input
      } else if (input.element) {
        element = input.element
      }
    } else if (typeof input === 'string') {
      element = document.querySelector(element)
    }
    if (!element) {
      element = document.body
    }

    var subcontext = {
      tick: 0,
      element: element,
      callbacks: []
    }

    subcontexts.push(subcontext)

    function wrapBox (boxDesc) {
      return boxDesc
    }

    function subREGL (options) {
      if ('viewport' in options) {
        options.viewport = wrapBox(options.viewport)
      }
      if ('scissor' in options) {
        if ('box' in options) {
          options.scissor.box = wrapBox(options.scissor.box)
        }
        if ('enable' in options) {
          options.scissor.box = true
        }
      }
      return regl.apply(regl, Array.prototype.slice.call(arguments))
    }

    Object.keys(regl).forEach(function (option) {
      subREGL[option] = regl[option]
    })

    subREGL.frame = function subFrame (cb) {
      subcontext.callbacks.push(cb)
      return {
        cancel: function () {
          subcontext.callbacks.splice(subcontext.callbacks.indexOf(cb), 1)
        }
      }
    }

    subREGL.destroy = function () {
      subcontexts.splice(subcontexts.indexOf(subcontext), 1)
    }

    subREGL.container = element

    return subREGL
  }

  createSubContext.destroy = function () {
    regl.destroy()
  }

  createSubContext.regl = regl

  var setViewport = regl({
    context: {
      tick: regl.prop('subcontext.tick')
    },

    viewport: regl.prop('viewbox'),

    scissor: {
      enable: true,
      box: regl.prop('scissorbox')
    }
  })

  function executeCallbacks (context, props) {
    var callbacks = props.subcontext.callbacks
    for (var i = 0; i < callbacks.length; ++i) {
      (callbacks[i])(context)
    }
  }

  regl.frame(function (context) {
    regl.clear({
      color: [0, 0, 0, 0]
    })

    var width = window.innerWidth
    var height = window.innerHeight

    var pixelRatio = context.pixelRatio
    for (var i = 0; i < subcontexts.length; ++i) {
      var sc = subcontexts[i]
      var rect = sc.element.getBoundingClientRect()

      if (rect.right < 0 || rect.bottom < 0 ||
        width < rect.left || height < rect.top) {
        continue
      }

      viewBox.x = pixelRatio * (rect.left)
      viewBox.y = pixelRatio * (height - rect.bottom)
      viewBox.width = pixelRatio * (rect.right - rect.left)
      viewBox.height = pixelRatio * (rect.bottom - rect.top)

      setViewport({
        subcontext: sc,
        viewbox: viewBox,
        scissorbox: viewBox
      }, executeCallbacks)

      sc.tick += 1
    }
  })

  return createSubContext
}
