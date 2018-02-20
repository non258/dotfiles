'use babel';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var FastPackageView = (function () {
  function FastPackageView(serializedState) {
    _classCallCheck(this, FastPackageView);

    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('fast-package');

    // Create message element
    var message = document.createElement('div');
    message.textContent = 'The FastPackage package is Alive! It\'s ALIVE!';
    message.classList.add('message');
    this.element.appendChild(message);
  }

  // Returns an object that can be retrieved when package is activated

  _createClass(FastPackageView, [{
    key: 'serialize',
    value: function serialize() {}

    // Tear down any state and detach
  }, {
    key: 'destroy',
    value: function destroy() {
      this.element.remove();
    }
  }, {
    key: 'getElement',
    value: function getElement() {
      return this.element;
    }
  }]);

  return FastPackageView;
})();

exports['default'] = FastPackageView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL25vem9taS9naXRodWIvZmFzdC1wYWNrYWdlL2xpYi9mYXN0LXBhY2thZ2Utdmlldy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUM7Ozs7Ozs7Ozs7SUFFUyxlQUFlO0FBRXZCLFdBRlEsZUFBZSxDQUV0QixlQUFlLEVBQUU7MEJBRlYsZUFBZTs7O0FBSWhDLFFBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QyxRQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUM7OztBQUczQyxRQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzlDLFdBQU8sQ0FBQyxXQUFXLEdBQUcsZ0RBQWdELENBQUM7QUFDdkUsV0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDakMsUUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDbkM7Ozs7ZUFaa0IsZUFBZTs7V0FlekIscUJBQUcsRUFBRTs7Ozs7V0FHUCxtQkFBRztBQUNSLFVBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7S0FDdkI7OztXQUVTLHNCQUFHO0FBQ1gsYUFBTyxJQUFJLENBQUMsT0FBTyxDQUFDO0tBQ3JCOzs7U0F4QmtCLGVBQWU7OztxQkFBZixlQUFlIiwiZmlsZSI6Ii9ob21lL25vem9taS9naXRodWIvZmFzdC1wYWNrYWdlL2xpYi9mYXN0LXBhY2thZ2Utdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGYXN0UGFja2FnZVZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKHNlcmlhbGl6ZWRTdGF0ZSkge1xuICAgIC8vIENyZWF0ZSByb290IGVsZW1lbnRcbiAgICB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnZmFzdC1wYWNrYWdlJyk7XG5cbiAgICAvLyBDcmVhdGUgbWVzc2FnZSBlbGVtZW50XG4gICAgY29uc3QgbWVzc2FnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG1lc3NhZ2UudGV4dENvbnRlbnQgPSAnVGhlIEZhc3RQYWNrYWdlIHBhY2thZ2UgaXMgQWxpdmUhIEl0XFwncyBBTElWRSEnO1xuICAgIG1lc3NhZ2UuY2xhc3NMaXN0LmFkZCgnbWVzc2FnZScpO1xuICAgIHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZChtZXNzYWdlKTtcbiAgfVxuXG4gIC8vIFJldHVybnMgYW4gb2JqZWN0IHRoYXQgY2FuIGJlIHJldHJpZXZlZCB3aGVuIHBhY2thZ2UgaXMgYWN0aXZhdGVkXG4gIHNlcmlhbGl6ZSgpIHt9XG5cbiAgLy8gVGVhciBkb3duIGFueSBzdGF0ZSBhbmQgZGV0YWNoXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZSgpO1xuICB9XG5cbiAgZ2V0RWxlbWVudCgpIHtcbiAgICByZXR1cm4gdGhpcy5lbGVtZW50O1xuICB9XG5cbn1cbiJdfQ==