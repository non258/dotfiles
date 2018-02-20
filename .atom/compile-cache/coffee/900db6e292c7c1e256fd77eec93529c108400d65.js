(function() {
  module.exports = function(colorPicker) {
    return {
      Emitter: (require('../modules/Emitter'))(),
      element: null,
      control: null,
      canvas: null,
      emitSelectionChanged: function() {
        return this.Emitter.emit('selectionChanged', this.control.selection);
      },
      onSelectionChanged: function(callback) {
        return this.Emitter.on('selectionChanged', callback);
      },
      emitColorChanged: function() {
        return this.Emitter.emit('colorChanged', this.control.selection.color);
      },
      onColorChanged: function(callback) {
        return this.Emitter.on('colorChanged', callback);
      },
      activate: function() {
        var Body;
        Body = colorPicker.getExtension('Body');
        this.element = {
          el: (function() {
            var _classPrefix, _el;
            _classPrefix = Body.element.el.className;
            _el = document.createElement('div');
            _el.classList.add(_classPrefix + "-saturation");
            return _el;
          })(),
          width: 0,
          height: 0,
          getWidth: function() {
            return this.width || this.el.offsetWidth;
          },
          getHeight: function() {
            return this.height || this.el.offsetHeight;
          },
          rect: null,
          getRect: function() {
            return this.rect || this.updateRect();
          },
          updateRect: function() {
            return this.rect = this.el.getClientRects()[0];
          },
          add: function(element) {
            this.el.appendChild(element);
            return this;
          }
        };
        Body.element.add(this.element.el, 0);
        colorPicker.onOpen((function(_this) {
          return function() {
            var _rect;
            if (!(_this.element.updateRect() && (_rect = _this.element.getRect()))) {
              return;
            }
            _this.width = _rect.width;
            return _this.height = _rect.height;
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            var Hue, Saturation, _elementHeight, _elementWidth;
            Saturation = _this;
            Hue = colorPicker.getExtension('Hue');
            _elementWidth = _this.element.getWidth();
            _elementHeight = _this.element.getHeight();
            _this.canvas = {
              el: (function() {
                var _el;
                _el = document.createElement('canvas');
                _el.width = _elementWidth;
                _el.height = _elementHeight;
                _el.classList.add(Saturation.element.el.className + "-canvas");
                return _el;
              })(),
              context: null,
              getContext: function() {
                return this.context || (this.context = this.el.getContext('2d'));
              },
              getColorAtPosition: function(x, y) {
                return colorPicker.SmartColor.HSVArray([Hue.getHue(), x / Saturation.element.getWidth() * 100, 100 - (y / Saturation.element.getHeight() * 100)]);
              },
              previousRender: null,
              render: function(smartColor) {
                var _context, _gradient, _hslArray, _joined;
                _hslArray = ((function() {
                  if (!smartColor) {
                    return colorPicker.SmartColor.HEX('#f00');
                  } else {
                    return smartColor;
                  }
                })()).toHSLArray();
                _joined = _hslArray.join(',');
                if (this.previousRender && this.previousRender === _joined) {
                  return;
                }
                _context = this.getContext();
                _context.clearRect(0, 0, _elementWidth, _elementHeight);
                _gradient = _context.createLinearGradient(0, 0, _elementWidth, 1);
                _gradient.addColorStop(.01, 'hsl(0,100%,100%)');
                _gradient.addColorStop(.99, "hsl(" + _hslArray[0] + ",100%,50%)");
                _context.fillStyle = _gradient;
                _context.fillRect(0, 0, _elementWidth, _elementHeight);
                _gradient = _context.createLinearGradient(0, 0, 1, _elementHeight);
                _gradient.addColorStop(.01, 'rgba(0,0,0,0)');
                _gradient.addColorStop(.99, 'rgba(0,0,0,1)');
                _context.fillStyle = _gradient;
                _context.fillRect(0, 0, _elementWidth, _elementHeight);
                return this.previousRender = _joined;
              }
            };
            Hue.onColorChanged(function(smartColor) {
              return _this.canvas.render(smartColor);
            });
            _this.canvas.render();
            return _this.element.add(_this.canvas.el);
          };
        })(this));
        setTimeout((function(_this) {
          return function() {
            var Hue, Saturation, hasChild;
            hasChild = function(element, child) {
              var _parent;
              if (child && (_parent = child.parentNode)) {
                if (child === element) {
                  return true;
                } else {
                  return hasChild(element, _parent);
                }
              }
              return false;
            };
            Saturation = _this;
            Hue = colorPicker.getExtension('Hue');
            _this.control = {
              el: (function() {
                var _el;
                _el = document.createElement('div');
                _el.classList.add(Saturation.element.el.className + "-control");
                return _el;
              })(),
              isGrabbing: false,
              previousControlPosition: null,
              updateControlPosition: function(x, y) {
                var _joined;
                _joined = x + "," + y;
                if (this.previousControlPosition && this.previousControlPosition === _joined) {
                  return;
                }
                requestAnimationFrame((function(_this) {
                  return function() {
                    _this.el.style.left = x + "px";
                    return _this.el.style.top = y + "px";
                  };
                })(this));
                return this.previousControlPosition = _joined;
              },
              selection: {
                x: null,
                y: 0,
                color: null
              },
              setSelection: function(e, saturation, key) {
                var _height, _position, _rect, _width, _x, _y;
                if (saturation == null) {
                  saturation = null;
                }
                if (key == null) {
                  key = null;
                }
                if (!(Saturation.canvas && (_rect = Saturation.element.getRect()))) {
                  return;
                }
                _width = Saturation.element.getWidth();
                _height = Saturation.element.getHeight();
                if (e) {
                  _x = e.pageX - _rect.left;
                  _y = e.pageY - _rect.top;
                } else if ((typeof saturation === 'number') && (typeof key === 'number')) {
                  _x = _width * saturation;
                  _y = _height * key;
                } else {
                  if (typeof this.selection.x !== 'number') {
                    this.selection.x = _width;
                  }
                  _x = this.selection.x;
                  _y = this.selection.y;
                }
                _x = this.selection.x = Math.max(0, Math.min(_width, Math.round(_x)));
                _y = this.selection.y = Math.max(0, Math.min(_height, Math.round(_y)));
                _position = {
                  x: Math.max(6, Math.min(_width - 7, _x)),
                  y: Math.max(6, Math.min(_height - 7, _y))
                };
                this.selection.color = Saturation.canvas.getColorAtPosition(_x, _y);
                this.updateControlPosition(_position.x, _position.y);
                return Saturation.emitSelectionChanged();
              },
              refreshSelection: function() {
                return this.setSelection();
              }
            };
            _this.control.refreshSelection();
            colorPicker.onInputColor(function(smartColor) {
              var h, ref, s, v;
              ref = smartColor.toHSVArray(), h = ref[0], s = ref[1], v = ref[2];
              return _this.control.setSelection(null, s, 1 - v);
            });
            Saturation.onSelectionChanged(function() {
              return Saturation.emitColorChanged();
            });
            colorPicker.onOpen(function() {
              return _this.control.refreshSelection();
            });
            colorPicker.onOpen(function() {
              return _this.control.isGrabbing = false;
            });
            colorPicker.onClose(function() {
              return _this.control.isGrabbing = false;
            });
            Hue.onColorChanged(function() {
              return _this.control.refreshSelection();
            });
            colorPicker.onMouseDown(function(e, isOnPicker) {
              if (!(isOnPicker && hasChild(Saturation.element.el, e.target))) {
                return;
              }
              e.preventDefault();
              _this.control.isGrabbing = true;
              return _this.control.setSelection(e);
            });
            colorPicker.onMouseMove(function(e) {
              if (!_this.control.isGrabbing) {
                return;
              }
              return _this.control.setSelection(e);
            });
            colorPicker.onMouseUp(function(e) {
              if (!_this.control.isGrabbing) {
                return;
              }
              _this.control.isGrabbing = false;
              return _this.control.setSelection(e);
            });
            return _this.element.add(_this.control.el);
          };
        })(this));
        return this;
      }
    };
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2NvbG9yLXBpY2tlci9saWIvZXh0ZW5zaW9ucy9TYXR1cmF0aW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFLSTtFQUFBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLFNBQUMsV0FBRDtXQUNiO01BQUEsT0FBQSxFQUFTLENBQUMsT0FBQSxDQUFRLG9CQUFSLENBQUQsQ0FBQSxDQUFBLENBQVQ7TUFFQSxPQUFBLEVBQVMsSUFGVDtNQUdBLE9BQUEsRUFBUyxJQUhUO01BSUEsTUFBQSxFQUFRLElBSlI7TUFVQSxvQkFBQSxFQUFzQixTQUFBO2VBQ2xCLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGtCQUFkLEVBQWtDLElBQUMsQ0FBQSxPQUFPLENBQUMsU0FBM0M7TUFEa0IsQ0FWdEI7TUFZQSxrQkFBQSxFQUFvQixTQUFDLFFBQUQ7ZUFDaEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxFQUFULENBQVksa0JBQVosRUFBZ0MsUUFBaEM7TUFEZ0IsQ0FacEI7TUFnQkEsZ0JBQUEsRUFBa0IsU0FBQTtlQUNkLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLGNBQWQsRUFBOEIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBakQ7TUFEYyxDQWhCbEI7TUFrQkEsY0FBQSxFQUFnQixTQUFDLFFBQUQ7ZUFDWixJQUFDLENBQUEsT0FBTyxDQUFDLEVBQVQsQ0FBWSxjQUFaLEVBQTRCLFFBQTVCO01BRFksQ0FsQmhCO01Bd0JBLFFBQUEsRUFBVSxTQUFBO0FBQ04sWUFBQTtRQUFBLElBQUEsR0FBTyxXQUFXLENBQUMsWUFBWixDQUF5QixNQUF6QjtRQUlQLElBQUMsQ0FBQSxPQUFELEdBQ0k7VUFBQSxFQUFBLEVBQU8sQ0FBQSxTQUFBO0FBQ0gsZ0JBQUE7WUFBQSxZQUFBLEdBQWUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7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LS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jICBDb2xvciBQaWNrZXIvZXh0ZW5zaW9uczogU2F0dXJhdGlvblxuIyAgQ29sb3IgU2F0dXJhdGlvbiBjb250cm9sbGVyXG4jIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAgIG1vZHVsZS5leHBvcnRzID0gKGNvbG9yUGlja2VyKSAtPlxuICAgICAgICBFbWl0dGVyOiAocmVxdWlyZSAnLi4vbW9kdWxlcy9FbWl0dGVyJykoKVxuXG4gICAgICAgIGVsZW1lbnQ6IG51bGxcbiAgICAgICAgY29udHJvbDogbnVsbFxuICAgICAgICBjYW52YXM6IG51bGxcblxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMgIFNldCB1cCBldmVudHMgYW5kIGhhbmRsaW5nXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICMgU2VsZWN0aW9uIENoYW5nZWQgZXZlbnRcbiAgICAgICAgZW1pdFNlbGVjdGlvbkNoYW5nZWQ6IC0+XG4gICAgICAgICAgICBARW1pdHRlci5lbWl0ICdzZWxlY3Rpb25DaGFuZ2VkJywgQGNvbnRyb2wuc2VsZWN0aW9uXG4gICAgICAgIG9uU2VsZWN0aW9uQ2hhbmdlZDogKGNhbGxiYWNrKSAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIub24gJ3NlbGVjdGlvbkNoYW5nZWQnLCBjYWxsYmFja1xuXG4gICAgICAgICMgQ29sb3IgQ2hhbmdlZCBldmVudFxuICAgICAgICBlbWl0Q29sb3JDaGFuZ2VkOiAtPlxuICAgICAgICAgICAgQEVtaXR0ZXIuZW1pdCAnY29sb3JDaGFuZ2VkJywgQGNvbnRyb2wuc2VsZWN0aW9uLmNvbG9yXG4gICAgICAgIG9uQ29sb3JDaGFuZ2VkOiAoY2FsbGJhY2spIC0+XG4gICAgICAgICAgICBARW1pdHRlci5vbiAnY29sb3JDaGFuZ2VkJywgY2FsbGJhY2tcblxuICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMgIENyZWF0ZSBhbmQgYWN0aXZhdGUgU2F0dXJhdGlvbiBjb250cm9sbGVyXG4gICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgIGFjdGl2YXRlOiAtPlxuICAgICAgICAgICAgQm9keSA9IGNvbG9yUGlja2VyLmdldEV4dGVuc2lvbiAnQm9keSdcblxuICAgICAgICAjICBDcmVhdGUgZWxlbWVudFxuICAgICAgICAjIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgICAgICAgQGVsZW1lbnQgPVxuICAgICAgICAgICAgICAgIGVsOiBkbyAtPlxuICAgICAgICAgICAgICAgICAgICBfY2xhc3NQcmVmaXggPSBCb2R5LmVsZW1lbnQuZWwuY2xhc3NOYW1lXG4gICAgICAgICAgICAgICAgICAgIF9lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2RpdidcbiAgICAgICAgICAgICAgICAgICAgX2VsLmNsYXNzTGlzdC5hZGQgXCIjeyBfY2xhc3NQcmVmaXggfS1zYXR1cmF0aW9uXCJcblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2VsXG4gICAgICAgICAgICAgICAgIyBVdGlsaXR5IGZ1bmN0aW9uc1xuICAgICAgICAgICAgICAgIHdpZHRoOiAwXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAwXG4gICAgICAgICAgICAgICAgZ2V0V2lkdGg6IC0+IHJldHVybiBAd2lkdGggb3IgQGVsLm9mZnNldFdpZHRoXG4gICAgICAgICAgICAgICAgZ2V0SGVpZ2h0OiAtPiByZXR1cm4gQGhlaWdodCBvciBAZWwub2Zmc2V0SGVpZ2h0XG5cbiAgICAgICAgICAgICAgICByZWN0OiBudWxsXG4gICAgICAgICAgICAgICAgZ2V0UmVjdDogLT4gcmV0dXJuIEByZWN0IG9yIEB1cGRhdGVSZWN0KClcbiAgICAgICAgICAgICAgICB1cGRhdGVSZWN0OiAtPiBAcmVjdCA9IEBlbC5nZXRDbGllbnRSZWN0cygpWzBdXG5cbiAgICAgICAgICAgICAgICAjIEFkZCBhIGNoaWxkIG9uIHRoZSBTYXR1cmF0aW9uIGVsZW1lbnRcbiAgICAgICAgICAgICAgICBhZGQ6IChlbGVtZW50KSAtPlxuICAgICAgICAgICAgICAgICAgICBAZWwuYXBwZW5kQ2hpbGQgZWxlbWVudFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpc1xuICAgICAgICAgICAgQm9keS5lbGVtZW50LmFkZCBAZWxlbWVudC5lbCwgMFxuXG4gICAgICAgICMgIFVwZGF0ZSBlbGVtZW50IHJlY3Qgd2hlbiBDb2xvciBQaWNrZXIgb3BlbnNcbiAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIGNvbG9yUGlja2VyLm9uT3BlbiA9PlxuICAgICAgICAgICAgICAgIHJldHVybiB1bmxlc3MgQGVsZW1lbnQudXBkYXRlUmVjdCgpIGFuZCBfcmVjdCA9IEBlbGVtZW50LmdldFJlY3QoKVxuICAgICAgICAgICAgICAgIEB3aWR0aCA9IF9yZWN0LndpZHRoXG4gICAgICAgICAgICAgICAgQGhlaWdodCA9IF9yZWN0LmhlaWdodFxuXG4gICAgICAgICMgIENyZWF0ZSBhbmQgZHJhdyBjYW52YXNcbiAgICAgICAgIyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICAgICAgIHNldFRpbWVvdXQgPT4gIyB3YWl0IGZvciB0aGUgRE9NXG4gICAgICAgICAgICAgICAgU2F0dXJhdGlvbiA9IHRoaXNcbiAgICAgICAgICAgICAgICBIdWUgPSBjb2xvclBpY2tlci5nZXRFeHRlbnNpb24gJ0h1ZSdcblxuICAgICAgICAgICAgICAgICMgUHJlcGFyZSBzb21lIHZhcmlhYmxlc1xuICAgICAgICAgICAgICAgIF9lbGVtZW50V2lkdGggPSBAZWxlbWVudC5nZXRXaWR0aCgpXG4gICAgICAgICAgICAgICAgX2VsZW1lbnRIZWlnaHQgPSBAZWxlbWVudC5nZXRIZWlnaHQoKVxuXG4gICAgICAgICAgICAgICAgIyBDcmVhdGUgZWxlbWVudFxuICAgICAgICAgICAgICAgIEBjYW52YXMgPVxuICAgICAgICAgICAgICAgICAgICBlbDogZG8gLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIF9lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2NhbnZhcydcbiAgICAgICAgICAgICAgICAgICAgICAgIF9lbC53aWR0aCA9IF9lbGVtZW50V2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgIF9lbC5oZWlnaHQgPSBfZWxlbWVudEhlaWdodFxuICAgICAgICAgICAgICAgICAgICAgICAgX2VsLmNsYXNzTGlzdC5hZGQgXCIjeyBTYXR1cmF0aW9uLmVsZW1lbnQuZWwuY2xhc3NOYW1lIH0tY2FudmFzXCJcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF9lbFxuICAgICAgICAgICAgICAgICAgICAjIFV0aWxpdHkgZnVuY3Rpb25zXG4gICAgICAgICAgICAgICAgICAgIGNvbnRleHQ6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgZ2V0Q29udGV4dDogLT4gQGNvbnRleHQgb3IgKEBjb250ZXh0ID0gQGVsLmdldENvbnRleHQgJzJkJylcblxuICAgICAgICAgICAgICAgICAgICBnZXRDb2xvckF0UG9zaXRpb246ICh4LCB5KSAtPiByZXR1cm4gY29sb3JQaWNrZXIuU21hcnRDb2xvci5IU1ZBcnJheSBbXG4gICAgICAgICAgICAgICAgICAgICAgICBIdWUuZ2V0SHVlKClcbiAgICAgICAgICAgICAgICAgICAgICAgIHggLyBTYXR1cmF0aW9uLmVsZW1lbnQuZ2V0V2lkdGgoKSAqIDEwMFxuICAgICAgICAgICAgICAgICAgICAgICAgMTAwIC0gKHkgLyBTYXR1cmF0aW9uLmVsZW1lbnQuZ2V0SGVpZ2h0KCkgKiAxMDApXVxuXG4gICAgICAgICAgICAgICAgICAgICMgUmVuZGVyIFNhdHVyYXRpb24gY2FudmFzXG4gICAgICAgICAgICAgICAgICAgIHByZXZpb3VzUmVuZGVyOiBudWxsXG4gICAgICAgICAgICAgICAgICAgIHJlbmRlcjogKHNtYXJ0Q29sb3IpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICBfaHNsQXJyYXkgPSAoIGRvIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5sZXNzIHNtYXJ0Q29sb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbG9yUGlja2VyLlNtYXJ0Q29sb3IuSEVYICcjZjAwJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVsc2UgcmV0dXJuIHNtYXJ0Q29sb3JcbiAgICAgICAgICAgICAgICAgICAgICAgICkudG9IU0xBcnJheSgpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIF9qb2luZWQgPSBfaHNsQXJyYXkuam9pbiAnLCdcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpZiBAcHJldmlvdXNSZW5kZXIgYW5kIEBwcmV2aW91c1JlbmRlciBpcyBfam9pbmVkXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICMgR2V0IGNvbnRleHQgYW5kIGNsZWFyIGl0XG4gICAgICAgICAgICAgICAgICAgICAgICBfY29udGV4dCA9IEBnZXRDb250ZXh0KClcbiAgICAgICAgICAgICAgICAgICAgICAgIF9jb250ZXh0LmNsZWFyUmVjdCAwLCAwLCBfZWxlbWVudFdpZHRoLCBfZWxlbWVudEhlaWdodFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIERyYXcgaHVlIGNoYW5uZWwgb24gdG9wXG4gICAgICAgICAgICAgICAgICAgICAgICBfZ3JhZGllbnQgPSBfY29udGV4dC5jcmVhdGVMaW5lYXJHcmFkaWVudCAwLCAwLCBfZWxlbWVudFdpZHRoLCAxXG4gICAgICAgICAgICAgICAgICAgICAgICBfZ3JhZGllbnQuYWRkQ29sb3JTdG9wIC4wMSwgJ2hzbCgwLDEwMCUsMTAwJSknXG4gICAgICAgICAgICAgICAgICAgICAgICBfZ3JhZGllbnQuYWRkQ29sb3JTdG9wIC45OSwgXCJoc2woI3sgX2hzbEFycmF5WzBdIH0sMTAwJSw1MCUpXCJcblxuICAgICAgICAgICAgICAgICAgICAgICAgX2NvbnRleHQuZmlsbFN0eWxlID0gX2dyYWRpZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBfY29udGV4dC5maWxsUmVjdCAwLCAwLCBfZWxlbWVudFdpZHRoLCBfZWxlbWVudEhlaWdodFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAjIERyYXcgc2F0dXJhdGlvbiBjaGFubmVsIG9uIHRoZSBib3R0b21cbiAgICAgICAgICAgICAgICAgICAgICAgIF9ncmFkaWVudCA9IF9jb250ZXh0LmNyZWF0ZUxpbmVhckdyYWRpZW50IDAsIDAsIDEsIF9lbGVtZW50SGVpZ2h0XG4gICAgICAgICAgICAgICAgICAgICAgICBfZ3JhZGllbnQuYWRkQ29sb3JTdG9wIC4wMSwgJ3JnYmEoMCwwLDAsMCknXG4gICAgICAgICAgICAgICAgICAgICAgICBfZ3JhZGllbnQuYWRkQ29sb3JTdG9wIC45OSwgJ3JnYmEoMCwwLDAsMSknXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIF9jb250ZXh0LmZpbGxTdHlsZSA9IF9ncmFkaWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgX2NvbnRleHQuZmlsbFJlY3QgMCwgMCwgX2VsZW1lbnRXaWR0aCwgX2VsZW1lbnRIZWlnaHRcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBAcHJldmlvdXNSZW5kZXIgPSBfam9pbmVkXG5cbiAgICAgICAgICAgICAgICAjIFJlbmRlciBhZ2FpbiBvbiBIdWUgc2VsZWN0aW9uIGNoYW5nZVxuICAgICAgICAgICAgICAgIEh1ZS5vbkNvbG9yQ2hhbmdlZCAoc21hcnRDb2xvcikgPT5cbiAgICAgICAgICAgICAgICAgICAgQGNhbnZhcy5yZW5kZXIgc21hcnRDb2xvclxuICAgICAgICAgICAgICAgIEBjYW52YXMucmVuZGVyKClcblxuICAgICAgICAgICAgICAgICMgQWRkIHRvIFNhdHVyYXRpb24gZWxlbWVudFxuICAgICAgICAgICAgICAgIEBlbGVtZW50LmFkZCBAY2FudmFzLmVsXG5cbiAgICAgICAgIyAgQ3JlYXRlIFNhdHVyYXRpb24gY29udHJvbCBlbGVtZW50XG4gICAgICAgICMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAgICAgICBzZXRUaW1lb3V0ID0+ICMgd2FpdCBmb3IgdGhlIERPTVxuICAgICAgICAgICAgICAgIGhhc0NoaWxkID0gKGVsZW1lbnQsIGNoaWxkKSAtPlxuICAgICAgICAgICAgICAgICAgICBpZiBjaGlsZCBhbmQgX3BhcmVudCA9IGNoaWxkLnBhcmVudE5vZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIGNoaWxkIGlzIGVsZW1lbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSByZXR1cm4gaGFzQ2hpbGQgZWxlbWVudCwgX3BhcmVudFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcblxuICAgICAgICAgICAgICAgICMgQ3JlYXRlIGVsZW1lbnRcbiAgICAgICAgICAgICAgICBTYXR1cmF0aW9uID0gdGhpc1xuICAgICAgICAgICAgICAgIEh1ZSA9IGNvbG9yUGlja2VyLmdldEV4dGVuc2lvbiAnSHVlJ1xuXG4gICAgICAgICAgICAgICAgQGNvbnRyb2wgPVxuICAgICAgICAgICAgICAgICAgICBlbDogZG8gLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIF9lbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgJ2RpdidcbiAgICAgICAgICAgICAgICAgICAgICAgIF9lbC5jbGFzc0xpc3QuYWRkIFwiI3sgU2F0dXJhdGlvbi5lbGVtZW50LmVsLmNsYXNzTmFtZSB9LWNvbnRyb2xcIlxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX2VsXG4gICAgICAgICAgICAgICAgICAgIGlzR3JhYmJpbmc6IG5vXG5cbiAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNDb250cm9sUG9zaXRpb246IG51bGxcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlQ29udHJvbFBvc2l0aW9uOiAoeCwgeSkgLT5cbiAgICAgICAgICAgICAgICAgICAgICAgIF9qb2luZWQgPSBcIiN7IHggfSwjeyB5IH1cIlxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlmIEBwcmV2aW91c0NvbnRyb2xQb3NpdGlvbiBhbmQgQHByZXZpb3VzQ29udHJvbFBvc2l0aW9uIGlzIF9qb2luZWRcblxuICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgQGVsLnN0eWxlLmxlZnQgPSBcIiN7IHggfXB4XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBAZWwuc3R5bGUudG9wID0gXCIjeyB5IH1weFwiXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gQHByZXZpb3VzQ29udHJvbFBvc2l0aW9uID0gX2pvaW5lZFxuXG4gICAgICAgICAgICAgICAgICAgIHNlbGVjdGlvbjpcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IG51bGxcbiAgICAgICAgICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbG9yOiBudWxsXG4gICAgICAgICAgICAgICAgICAgIHNldFNlbGVjdGlvbjogKGUsIHNhdHVyYXRpb249bnVsbCwga2V5PW51bGwpIC0+XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdW5sZXNzIFNhdHVyYXRpb24uY2FudmFzIGFuZCBfcmVjdCA9IFNhdHVyYXRpb24uZWxlbWVudC5nZXRSZWN0KClcblxuICAgICAgICAgICAgICAgICAgICAgICAgX3dpZHRoID0gU2F0dXJhdGlvbi5lbGVtZW50LmdldFdpZHRoKClcbiAgICAgICAgICAgICAgICAgICAgICAgIF9oZWlnaHQgPSBTYXR1cmF0aW9uLmVsZW1lbnQuZ2V0SGVpZ2h0KClcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF94ID0gZS5wYWdlWCAtIF9yZWN0LmxlZnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfeSA9IGUucGFnZVkgLSBfcmVjdC50b3BcbiAgICAgICAgICAgICAgICAgICAgICAgICMgU2V0IHNhdHVyYXRpb24gYW5kIGtleSBkaXJlY3RseVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIHNhdHVyYXRpb24gaXMgJ251bWJlcicpIGFuZCAodHlwZW9mIGtleSBpcyAnbnVtYmVyJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfeCA9IF93aWR0aCAqIHNhdHVyYXRpb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfeSA9IF9oZWlnaHQgKiBrZXlcbiAgICAgICAgICAgICAgICAgICAgICAgICMgRGVmYXVsdCB0byBwcmV2aW91cyB2YWx1ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIEBzZWxlY3Rpb24ueCBpc250ICdudW1iZXInKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBAc2VsZWN0aW9uLnggPSBfd2lkdGhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfeCA9IEBzZWxlY3Rpb24ueFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF95ID0gQHNlbGVjdGlvbi55XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIF94ID0gQHNlbGVjdGlvbi54ID0gTWF0aC5tYXggMCwgKE1hdGgubWluIF93aWR0aCwgTWF0aC5yb3VuZCBfeClcbiAgICAgICAgICAgICAgICAgICAgICAgIF95ID0gQHNlbGVjdGlvbi55ID0gTWF0aC5tYXggMCwgKE1hdGgubWluIF9oZWlnaHQsIE1hdGgucm91bmQgX3kpXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIF9wb3NpdGlvbiA9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogTWF0aC5tYXggNiwgKE1hdGgubWluIChfd2lkdGggLSA3KSwgX3gpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogTWF0aC5tYXggNiwgKE1hdGgubWluIChfaGVpZ2h0IC0gNyksIF95KVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBAc2VsZWN0aW9uLmNvbG9yID0gU2F0dXJhdGlvbi5jYW52YXMuZ2V0Q29sb3JBdFBvc2l0aW9uIF94LCBfeVxuICAgICAgICAgICAgICAgICAgICAgICAgQHVwZGF0ZUNvbnRyb2xQb3NpdGlvbiBfcG9zaXRpb24ueCwgX3Bvc2l0aW9uLnlcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBTYXR1cmF0aW9uLmVtaXRTZWxlY3Rpb25DaGFuZ2VkKClcblxuICAgICAgICAgICAgICAgICAgICByZWZyZXNoU2VsZWN0aW9uOiAtPiBAc2V0U2VsZWN0aW9uKClcbiAgICAgICAgICAgICAgICBAY29udHJvbC5yZWZyZXNoU2VsZWN0aW9uKClcblxuICAgICAgICAgICAgICAgICMgSWYgdGhlIENvbG9yIFBpY2tlciBpcyBmZWQgYSBjb2xvciwgc2V0IGl0XG4gICAgICAgICAgICAgICAgY29sb3JQaWNrZXIub25JbnB1dENvbG9yIChzbWFydENvbG9yKSA9PlxuICAgICAgICAgICAgICAgICAgICBbaCwgcywgdl0gPSBzbWFydENvbG9yLnRvSFNWQXJyYXkoKVxuICAgICAgICAgICAgICAgICAgICBAY29udHJvbC5zZXRTZWxlY3Rpb24gbnVsbCwgcywgKDEgLSB2KVxuXG4gICAgICAgICAgICAgICAgIyBXaGVuIHRoZSBzZWxlY3Rpb24gY2hhbmdlcywgdGhlIGNvbG9yIGhhcyBjaGFuZ2VkXG4gICAgICAgICAgICAgICAgU2F0dXJhdGlvbi5vblNlbGVjdGlvbkNoYW5nZWQgLT4gU2F0dXJhdGlvbi5lbWl0Q29sb3JDaGFuZ2VkKClcblxuICAgICAgICAgICAgICAgICMgUmVzZXRcbiAgICAgICAgICAgICAgICBjb2xvclBpY2tlci5vbk9wZW4gPT4gQGNvbnRyb2wucmVmcmVzaFNlbGVjdGlvbigpXG4gICAgICAgICAgICAgICAgY29sb3JQaWNrZXIub25PcGVuID0+IEBjb250cm9sLmlzR3JhYmJpbmcgPSBub1xuICAgICAgICAgICAgICAgIGNvbG9yUGlja2VyLm9uQ2xvc2UgPT4gQGNvbnRyb2wuaXNHcmFiYmluZyA9IG5vXG5cbiAgICAgICAgICAgICAgICAjIEJpbmQgY29udHJvbGxlciBldmVudHNcbiAgICAgICAgICAgICAgICBIdWUub25Db2xvckNoYW5nZWQgPT4gQGNvbnRyb2wucmVmcmVzaFNlbGVjdGlvbigpXG5cbiAgICAgICAgICAgICAgICBjb2xvclBpY2tlci5vbk1vdXNlRG93biAoZSwgaXNPblBpY2tlcikgPT5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVubGVzcyBpc09uUGlja2VyIGFuZCBoYXNDaGlsZCBTYXR1cmF0aW9uLmVsZW1lbnQuZWwsIGUudGFyZ2V0XG4gICAgICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKVxuICAgICAgICAgICAgICAgICAgICBAY29udHJvbC5pc0dyYWJiaW5nID0geWVzXG4gICAgICAgICAgICAgICAgICAgIEBjb250cm9sLnNldFNlbGVjdGlvbiBlXG5cbiAgICAgICAgICAgICAgICBjb2xvclBpY2tlci5vbk1vdXNlTW92ZSAoZSkgPT5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHVubGVzcyBAY29udHJvbC5pc0dyYWJiaW5nXG4gICAgICAgICAgICAgICAgICAgIEBjb250cm9sLnNldFNlbGVjdGlvbiBlXG5cbiAgICAgICAgICAgICAgICBjb2xvclBpY2tlci5vbk1vdXNlVXAgKGUpID0+XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB1bmxlc3MgQGNvbnRyb2wuaXNHcmFiYmluZ1xuICAgICAgICAgICAgICAgICAgICBAY29udHJvbC5pc0dyYWJiaW5nID0gbm9cbiAgICAgICAgICAgICAgICAgICAgQGNvbnRyb2wuc2V0U2VsZWN0aW9uIGVcblxuICAgICAgICAgICAgICAgICMgQWRkIHRvIFNhdHVyYXRpb24gZWxlbWVudFxuICAgICAgICAgICAgICAgIEBlbGVtZW50LmFkZCBAY29udHJvbC5lbFxuICAgICAgICAgICAgcmV0dXJuIHRoaXNcbiJdfQ==
