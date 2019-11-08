(function (window, document) {
  // 给hotcss开辟个命名空间，别问我为什么，我要给你准备你会用到的方法，免得用到的时候还要自己写。
  const hotcss = {}
    ; (function () {
      // 根据devicePixelRatio自定计算scale
      // 作兼容处理1px问题
      let viewportEl = document.querySelector("meta[name=\"viewport\"]"),
        hotcssEl = document.querySelector("meta[name=\"hotcss\"]"),
        dpr = window.devicePixelRatio || 1,
        maxWidth = 540,
        designWidth = 0

      dpr = dpr >= 3 ? 3 : (dpr >= 2 ? 2 : 1)

      // 允许通过自定义name为hotcss的meta头，通过initial-dpr来强制定义页面缩放
      if (hotcssEl) {
        const hotcssCon = hotcssEl.getAttribute("content")
          ; if (hotcssCon) {
            const initialDprMatch = hotcssCon.match(/initial\-dpr=([\d\.]+)/)
            if (initialDprMatch) {
              dpr = parseFloat(initialDprMatch[1])
            }
            const maxWidthMatch = hotcssCon.match(/max\-width=([\d\.]+)/)
            if (maxWidthMatch) {
              maxWidth = parseFloat(maxWidthMatch[1])
            }
            const designWidthMatch = hotcssCon.match(/design\-width=([\d\.]+)/)
            if (designWidthMatch) {
              designWidth = parseFloat(designWidthMatch[1])
            }
          }
      }

      document.documentElement.setAttribute("data-dpr", dpr)
      hotcss.dpr = dpr

      document.documentElement.setAttribute("max-width", maxWidth)
      hotcss.maxWidth = maxWidth

      if (designWidth) {
        document.documentElement.setAttribute("design-width", designWidth)
      }
      hotcss.designWidth = designWidth // 保证px2rem 和 rem2px 不传第二个参数时, 获取hotcss.designWidth是undefined导致的NaN

      let scale = 1 / dpr,
        content = `width=device-width, initial-scale=${scale}, minimum-scale=${scale}, maximum-scale=${scale}, user-scalable=no`
        ; if (viewportEl) {
          viewportEl.setAttribute("content", content)
        } else {
        viewportEl = document.createElement("meta")
          ; viewportEl.setAttribute("name", "viewport")
          ; viewportEl.setAttribute("content", content)
        document.head.appendChild(viewportEl)
      }
    })()

  hotcss.px2rem = function (px, designWidth) {
    // JS中用到尺寸，提供一个方法在JS中将px转为rem。
    if (!designWidth) {
      //调用hotcss.designWidh方法设置尺寸大小
      designWidth = parseInt(hotcss.designWidth, 10)
    }

    return parseInt(px, 10) * 320 / designWidth / 20
  }

  hotcss.rem2px = function (rem, designWidth) {
    // 新增一个rem2px的方法。用法和px2rem一致。
    if (!designWidth) {
      designWidth = parseInt(hotcss.designWidth, 10)
    }

    return rem * 20 * designWidth / 320
  }

  hotcss.mresize = function () {
    // HTML设置font-size。
    let innerWidth = document.documentElement.getBoundingClientRect().width || window.innerWidth

    if (hotcss.maxWidth && (innerWidth / hotcss.dpr > hotcss.maxWidth)) {
      innerWidth = hotcss.maxWidth * hotcss.dpr
    }

    if (!innerWidth) {
      return false
    }

    document.documentElement.style.fontSize = `${innerWidth * 20 / 320}px`
      ; hotcss.callback && hotcss.callback()
  }

  hotcss.mresize()
  // 直接调用一次

  window.addEventListener("resize", () => {
    clearTimeout(hotcss.tid)
      ; hotcss.tid = setTimeout(hotcss.mresize, 33)
  }, false)
  // 绑定resize的时候调用

  window.addEventListener("load", hotcss.mresize, false)
  // 防止不明原因的bug。load之后再调用一次。


  setTimeout(() => {
    hotcss.mresize()
    // 作为兼容其他机型，回调
  }, 333)

  window.hotcss = hotcss
  // 立即执行函数，把命名参数放到window供外部使用
})(window, document)
