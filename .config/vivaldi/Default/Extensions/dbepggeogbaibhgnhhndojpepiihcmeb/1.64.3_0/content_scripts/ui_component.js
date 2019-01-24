// Generated by CoffeeScript 1.9.3
(function() {
  var UIComponent, root;

  UIComponent = (function() {
    UIComponent.prototype.iframeElement = null;

    UIComponent.prototype.iframePort = null;

    UIComponent.prototype.showing = false;

    UIComponent.prototype.iframeFrameId = null;

    UIComponent.prototype.options = null;

    UIComponent.prototype.shadowDOM = null;

    UIComponent.prototype.toggleIframeElementClasses = function(removeClass, addClass) {
      this.iframeElement.classList.remove(removeClass);
      return this.iframeElement.classList.add(addClass);
    };

    function UIComponent(iframeUrl, className, handleMessage) {
      this.handleMessage = handleMessage;
      DomUtils.documentReady((function(_this) {
        return function() {
          var ref, ref1, shadowWrapper, styleSheet;
          styleSheet = DomUtils.createElement("style");
          styleSheet.type = "text/css";
          styleSheet.innerHTML = "iframe {display: none;}";
          chrome.storage.local.get("vimiumCSSInChromeStorage", function(items) {
            return styleSheet.innerHTML = items.vimiumCSSInChromeStorage;
          });
          _this.iframeElement = DomUtils.createElement("iframe");
          extend(_this.iframeElement, {
            className: className,
            seamless: "seamless"
          });
          shadowWrapper = DomUtils.createElement("div");
          _this.shadowDOM = (ref = (ref1 = typeof shadowWrapper.attachShadow === "function" ? shadowWrapper.attachShadow({
            mode: "open"
          }) : void 0) != null ? ref1 : typeof shadowWrapper.createShadowRoot === "function" ? shadowWrapper.createShadowRoot() : void 0) != null ? ref : shadowWrapper;
          _this.shadowDOM.appendChild(styleSheet);
          _this.shadowDOM.appendChild(_this.iframeElement);
          _this.toggleIframeElementClasses("vimiumUIComponentVisible", "vimiumUIComponentHidden");
          return _this.iframePort = new AsyncDataFetcher(function(setIframePort) {
            _this.iframeElement.src = chrome.runtime.getURL(iframeUrl);
            document.documentElement.appendChild(shadowWrapper);
            return _this.iframeElement.addEventListener("load", function() {
              return chrome.storage.local.get("vimiumSecret", function(arg) {
                var port1, port2, ref2, vimiumSecret;
                vimiumSecret = arg.vimiumSecret;
                ref2 = new MessageChannel, port1 = ref2.port1, port2 = ref2.port2;
                _this.iframeElement.contentWindow.postMessage(vimiumSecret, chrome.runtime.getURL(""), [port2]);
                return port1.onmessage = function(event) {
                  var ref3, ref4;
                  switch ((ref3 = event != null ? (ref4 = event.data) != null ? ref4.name : void 0 : void 0) != null ? ref3 : event != null ? event.data : void 0) {
                    case "uiComponentIsReady":
                      chrome.runtime.onMessage.addListener(function(arg1) {
                        var focusFrameId, name, ref5;
                        name = arg1.name, focusFrameId = arg1.focusFrameId;
                        if (name === "frameFocused" && ((ref5 = _this.options) != null ? ref5.focus : void 0) && (focusFrameId !== frameId && focusFrameId !== _this.iframeFrameId)) {
                          _this.hide(false);
                        }
                        return false;
                      });
                      window.addEventListener("focus", function(event) {
                        var ref5;
                        if (event.target === window && ((ref5 = _this.options) != null ? ref5.focus : void 0)) {
                          _this.hide(false);
                        }
                        return true;
                      });
                      return setIframePort(port1);
                    case "setIframeFrameId":
                      return _this.iframeFrameId = event.data.iframeFrameId;
                    case "hide":
                      return _this.hide();
                    default:
                      return _this.handleMessage(event);
                  }
                };
              });
            });
          });
        };
      })(this));
    }

    UIComponent.prototype.postMessage = function(message, continuation) {
      var ref;
      if (message == null) {
        message = null;
      }
      if (continuation == null) {
        continuation = null;
      }
      return (ref = this.iframePort) != null ? ref.use(function(port) {
        if (message != null) {
          port.postMessage(message);
        }
        return typeof continuation === "function" ? continuation() : void 0;
      }) : void 0;
    };

    UIComponent.prototype.activate = function(options) {
      this.options = options != null ? options : null;
      return this.postMessage(this.options, (function(_this) {
        return function() {
          var ref;
          _this.toggleIframeElementClasses("vimiumUIComponentHidden", "vimiumUIComponentVisible");
          if ((ref = _this.options) != null ? ref.focus : void 0) {
            _this.iframeElement.focus();
          }
          return _this.showing = true;
        };
      })(this));
    };

    UIComponent.prototype.hide = function(shouldRefocusOriginalFrame) {
      if (shouldRefocusOriginalFrame == null) {
        shouldRefocusOriginalFrame = true;
      }
      return this.postMessage(null, (function(_this) {
        return function() {
          var ref, ref1;
          if (_this.showing) {
            _this.showing = false;
            _this.toggleIframeElementClasses("vimiumUIComponentVisible", "vimiumUIComponentHidden");
            if ((ref = _this.options) != null ? ref.focus : void 0) {
              _this.iframeElement.blur();
              if (shouldRefocusOriginalFrame) {
                if (((ref1 = _this.options) != null ? ref1.sourceFrameId : void 0) != null) {
                  chrome.runtime.sendMessage({
                    handler: "sendMessageToFrames",
                    message: {
                      name: "focusFrame",
                      frameId: _this.options.sourceFrameId,
                      forceFocusThisFrame: true
                    }
                  });
                } else {
                  window.focus();
                }
              }
            }
            _this.options = null;
            return _this.postMessage("hidden");
          }
        };
      })(this));
    };

    return UIComponent;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : (window.root != null ? window.root : window.root = {});

  root.UIComponent = UIComponent;

  if (typeof exports === "undefined" || exports === null) {
    extend(window, root);
  }

}).call(this);
