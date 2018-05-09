// Generated by CoffeeScript 1.9.3
(function() {
  var injectedCode, script;

  return;

  injectedCode = function() {
    var Anchor, EL, _addEventListener, _toString, addEventListener, newToString;
    _addEventListener = EventTarget.prototype.addEventListener;
    _toString = Function.prototype.toString;
    EL = typeof Element === "function" ? Element : HTMLElement;
    Anchor = HTMLAnchorElement;
    addEventListener = function(type, listener, useCapture) {
      if (type === "click" && this instanceof EL) {
        if (!(this instanceof Anchor)) {
          try {
            this.setAttribute("_vimium-has-onclick-listener", "");
          } catch (_error) {}
        }
      }
      return _addEventListener != null ? _addEventListener.apply(this, arguments) : void 0;
    };
    newToString = function() {
      var real;
      real = this === newToString ? _toString : (this === addEventListener ? _addEventListener : void 0, this);
      return _toString.apply(real, arguments);
    };
    EventTarget.prototype.addEventListener = addEventListener;
    return Function.prototype.toString = newToString;
  };

  script = document.createElement("script");

  script.textContent = "(" + (injectedCode.toString()) + ")()";

  (document.head || document.documentElement).appendChild(script);

  script.remove();

}).call(this);
