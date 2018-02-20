'use babel';
/** @jsx etch.dom */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var etch = require('etch');

var _require = require('./outline-tree');

var OutlineTreeView = _require.OutlineTreeView;

var DocumentOutlineView = (function () {
  function DocumentOutlineView() {
    _classCallCheck(this, DocumentOutlineView);

    this.cursorPositionSubscription = null;
    this.outline = [];
    this._depthFirstItems = [];

    this.autoScroll = atom.config.get("document-outline.autoScrollOutline");
    this.doHighlight = atom.config.get("document-outline.highlightCurrentSection");
    etch.initialize(this);
  }

  _createClass(DocumentOutlineView, [{
    key: 'getDefaultLocation',
    value: function getDefaultLocation() {
      return atom.config.get('document-outline.defaultSide');
    }
  }, {
    key: 'getTitle',
    value: function getTitle() {
      return 'Outline';
    }
  }, {
    key: 'getIconName',
    value: function getIconName() {
      return 'list-unordered';
    }
  }, {
    key: 'getURI',
    value: function getURI() {
      return 'atom://document-outline/outline';
    }
  }, {
    key: 'getAllowedLocations',
    value: function getAllowedLocations() {
      return ['left', 'right'];
    }
  }, {
    key: 'getPreferredWidth',
    value: function getPreferredWidth() {
      return 200;
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.update({ outline: [] });
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      etch.destroy(this);
      if (this.cursorPositionSubscription) {
        this.cursorPositionSubscription.dispose();
      }
    }
  }, {
    key: 'getElement',
    value: function getElement() {
      return this.element;
    }
  }, {
    key: 'update',
    value: function update(props) {
      var _this = this;

      var outline = props.outline;
      var editor = props.editor;

      this.outline = outline;
      // Set the outline, which should rebuild the DOM tree
      // Clear existing events and re-subscribe to make sure we don't accumulate subscriptions
      if (this.cursorPositionSubscription) {
        this.cursorPositionSubscription.dispose();
      }

      if (editor) {
        this.cursorPos = editor.getCursorBufferPosition();

        this.cursorPositionSubscription = editor.onDidChangeCursorPosition(function (event) {
          if (event.oldBufferPosition.row !== event.newBufferPosition.row) {
            _this.cursorPos = editor.getCursorBufferPosition();
            return etch.update(_this);
          }
        });
      }

      this._depthFirstItems = [];
      return etch.update(this);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      this.outlineElements = this.outline.map(function (tree) {
        tree.cursorPos = _this2.cursorPos;
        tree.doHighlight = _this2.doHighlight;
        tree.autoCollapse = atom.config.get('document-outline.collapseByDefault');
        return etch.dom(OutlineTreeView, tree);
      });

      return etch.dom(
        'div',
        { 'class': 'document-outline', id: 'document-outline' },
        etch.dom(
          'ol',
          { 'class': 'list-tree' },
          this.outlineElements
        )
      );
    }
  }, {
    key: 'readAfterUpdate',
    value: function readAfterUpdate() {
      if (this.autoScroll && this.cursorPos) {
        var cursorPos = this.cursorPos;
        var range = undefined;
        var didFindDeepestItem = false;

        // NOTE: getElementsByClassName + filter should be much faster thant
        // querySelectorAll on .list-nested-item.current
        var elements = document.getElementsByClassName('list-nested-item');
        Array.from(elements).map(function (el) {
          return el.classList.remove('current');
        });

        for (var item of this.getDepthFirstItems(this.outline)) {
          range = item.range;
          if (range && range.containsPoint(cursorPos)) {
            var id = 'document-outline-' + item.range.start.row + '-' + item.range.end.row;
            var foundElement = document.getElementById(id);
            if (foundElement) {
              foundElement.scrollIntoView();
              if (!didFindDeepestItem) {
                // This is where to add stuff related to the currently active sub-heading
                // without affecting parents or children
                foundElement.classList.add('current');
                didFindDeepestItem = true;
              }
            }
          }
        }
      }
    }
  }, {
    key: 'getDepthFirstItems',
    value: function getDepthFirstItems(root) {
      // Lazily construct a flat list of items for (in theory) fast iteration
      function collectDepthFirst(item, out) {
        var child = undefined;
        if (Array.isArray(item)) {
          for (child of item) {
            collectDepthFirst(child, out);
          }
        } else {
          for (child of item.children) {
            collectDepthFirst(child, out);
          }
          out.push(item);
        }
      }
      // Lazily get the items depth first. On first run build a flat list of items
      if (!this._depthFirstItems || this._depthFirstItems.length === 0) {
        this._depthFirstItems = [];
        collectDepthFirst(root, this._depthFirstItems);
      }
      return this._depthFirstItems;
    }
  }]);

  return DocumentOutlineView;
})();

module.exports = { DocumentOutlineView: DocumentOutlineView };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL25vem9taS8uYXRvbS9wYWNrYWdlcy9kb2N1bWVudC1vdXRsaW5lL2xpYi9kb2N1bWVudC1vdXRsaW5lLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7O0FBR1osSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztlQUNILE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7SUFBNUMsZUFBZSxZQUFmLGVBQWU7O0lBRWhCLG1CQUFtQjtBQUVaLFdBRlAsbUJBQW1CLEdBRVQ7MEJBRlYsbUJBQW1COztBQUdyQixRQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxDQUFDO0FBQ3ZDLFFBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7O0FBRTNCLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLENBQUMsQ0FBQztBQUN4RSxRQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7QUFDL0UsUUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUN2Qjs7ZUFWRyxtQkFBbUI7O1dBWUwsOEJBQUc7QUFDbkIsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0tBQ3hEOzs7V0FFTyxvQkFBRztBQUNULGFBQU8sU0FBUyxDQUFDO0tBQ2xCOzs7V0FFVSx1QkFBRztBQUNaLGFBQU8sZ0JBQWdCLENBQUM7S0FDekI7OztXQUVLLGtCQUFHO0FBQ1AsYUFBTyxpQ0FBaUMsQ0FBQztLQUMxQzs7O1dBRWtCLCtCQUFHO0FBQ3BCLGFBQU8sQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDMUI7OztXQUVnQiw2QkFBRztBQUNsQixhQUFPLEdBQUcsQ0FB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LENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO09BQ2hEO0FBQ0QsYUFBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUM7S0FDOUI7OztTQTdJRyxtQkFBbUI7OztBQWdKekIsTUFBTSxDQUFDLE9BQU8sR0FBRyxFQUFDLG1CQUFtQixFQUFuQixtQkFBbUIsRUFBQyxDQUFDIiwiZmlsZSI6Ii9ob21lL25vem9taS8uYXRvbS9wYWNrYWdlcy9kb2N1bWVudC1vdXRsaW5lL2xpYi9kb2N1bWVudC1vdXRsaW5lLXZpZXcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qKiBAanN4IGV0Y2guZG9tICovXG5cbmNvbnN0IGV0Y2ggPSByZXF1aXJlKCdldGNoJyk7XG5jb25zdCB7T3V0bGluZVRyZWVWaWV3fSA9IHJlcXVpcmUoJy4vb3V0bGluZS10cmVlJyk7XG5cbmNsYXNzIERvY3VtZW50T3V0bGluZVZpZXcge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuY3Vyc29yUG9zaXRpb25TdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIHRoaXMub3V0bGluZSA9IFtdO1xuICAgIHRoaXMuX2RlcHRoRmlyc3RJdGVtcyA9IFtdO1xuXG4gICAgdGhpcy5hdXRvU2Nyb2xsID0gYXRvbS5jb25maWcuZ2V0KFwiZG9jdW1lbnQtb3V0bGluZS5hdXRvU2Nyb2xsT3V0bGluZVwiKTtcbiAgICB0aGlzLmRvSGlnaGxpZ2h0ID0gYXRvbS5jb25maWcuZ2V0KFwiZG9jdW1lbnQtb3V0bGluZS5oaWdobGlnaHRDdXJyZW50U2VjdGlvblwiKTtcbiAgICBldGNoLmluaXRpYWxpemUodGhpcyk7XG4gIH1cblxuICBnZXREZWZhdWx0TG9jYXRpb24oKSB7XG4gICAgcmV0dXJuIGF0b20uY29uZmlnLmdldCgnZG9jdW1lbnQtb3V0bGluZS5kZWZhdWx0U2lkZScpO1xuICB9XG5cbiAgZ2V0VGl0bGUoKSB7XG4gICAgcmV0dXJuICdPdXRsaW5lJztcbiAgfVxuXG4gIGdldEljb25OYW1lKCkge1xuICAgIHJldHVybiAnbGlzdC11bm9yZGVyZWQnO1xuICB9XG5cbiAgZ2V0VVJJKCkge1xuICAgIHJldHVybiAnYXRvbTovL2RvY3VtZW50LW91dGxpbmUvb3V0bGluZSc7XG4gIH1cblxuICBnZXRBbGxvd2VkTG9jYXRpb25zKCkge1xuICAgIHJldHVybiBbJ2xlZnQnLCAncmlnaHQnXTtcbiAgfVxuXG4gIGdldFByZWZlcnJlZFdpZHRoKCkge1xuICAgIHJldHVybiAyMDA7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLnVwZGF0ZSh7b3V0bGluZTogW119KTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgZXRjaC5kZXN0cm95KHRoaXMpO1xuICAgIGlmICh0aGlzLmN1cnNvclBvc2l0aW9uU3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLmN1cnNvclBvc2l0aW9uU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICBnZXRFbGVtZW50KCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQ7XG4gIH1cblxuICB1cGRhdGUocHJvcHMpIHtcbiAgICBsZXQge291dGxpbmUsIGVkaXRvcn0gPSBwcm9wcztcbiAgICB0aGlzLm91dGxpbmUgPSBvdXRsaW5lO1xuICAgIC8vIFNldCB0aGUgb3V0bGluZSwgd2hpY2ggc2hvdWxkIHJlYnVpbGQgdGhlIERPTSB0cmVlXG4gICAgLy8gQ2xlYXIgZXhpc3RpbmcgZXZlbnRzIGFuZCByZS1zdWJzY3JpYmUgdG8gbWFrZSBzdXJlIHdlIGRvbid0IGFjY3VtdWxhdGUgc3Vic2NyaXB0aW9uc1xuICAgIGlmICh0aGlzLmN1cnNvclBvc2l0aW9uU3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLmN1cnNvclBvc2l0aW9uU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICB9XG5cbiAgICBpZiAoZWRpdG9yKSB7XG4gICAgICB0aGlzLmN1cnNvclBvcyA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpO1xuXG4gICAgICB0aGlzLmN1cnNvclBvc2l0aW9uU3Vic2NyaXB0aW9uID0gZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24oZXZlbnQgPT4ge1xuICAgICAgICBpZiAoZXZlbnQub2xkQnVmZmVyUG9zaXRpb24ucm93ICE9PSBldmVudC5uZXdCdWZmZXJQb3NpdGlvbi5yb3cpIHtcbiAgICAgICAgICB0aGlzLmN1cnNvclBvcyA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpO1xuICAgICAgICAgIHJldHVybiBldGNoLnVwZGF0ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5fZGVwdGhGaXJzdEl0ZW1zID0gW107XG4gICAgcmV0dXJuIGV0Y2gudXBkYXRlKHRoaXMpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHRoaXMub3V0bGluZUVsZW1lbnRzID0gdGhpcy5vdXRsaW5lLm1hcCh0cmVlID0+IHtcbiAgICAgIHRyZWUuY3Vyc29yUG9zID0gdGhpcy5jdXJzb3JQb3M7XG4gICAgICB0cmVlLmRvSGlnaGxpZ2h0ID0gdGhpcy5kb0hpZ2hsaWdodDtcbiAgICAgIHRyZWUuYXV0b0NvbGxhcHNlID0gYXRvbS5jb25maWcuZ2V0KCdkb2N1bWVudC1vdXRsaW5lLmNvbGxhcHNlQnlEZWZhdWx0Jyk7XG4gICAgICByZXR1cm4gPE91dGxpbmVUcmVlVmlldyB7Li4udHJlZX0vPjtcbiAgICB9KTtcblxuICAgIHJldHVybiA8ZGl2IGNsYXNzPVwiZG9jdW1lbnQtb3V0bGluZVwiIGlkPVwiZG9jdW1lbnQtb3V0bGluZVwiPlxuICAgICAgICA8b2wgY2xhc3M9XCJsaXN0LXRyZWVcIj57dGhpcy5vdXRsaW5lRWxlbWVudHN9PC9vbD5cbiAgICAgIDwvZGl2PjtcbiAgfVxuXG4gIHJlYWRBZnRlclVwZGF0ZSgpIHtcbiAgICBpZiAodGhpcy5hdXRvU2Nyb2xsICYmIHRoaXMuY3Vyc29yUG9zKSB7XG4gICAgICBsZXQgY3Vyc29yUG9zID0gdGhpcy5jdXJzb3JQb3M7XG4gICAgICBsZXQgcmFuZ2U7XG4gICAgICBsZXQgZGlkRmluZERlZXBlc3RJdGVtID0gZmFsc2U7XG5cbiAgICAgIC8vIE5PVEU6IGdldEVsZW1lbnRzQnlDbGFzc05hbWUgKyBmaWx0ZXIgc2hvdWxkIGJlIG11Y2ggZmFzdGVyIHRoYW50XG4gICAgICAvLyBxdWVyeVNlbGVjdG9yQWxsIG9uIC5saXN0LW5lc3RlZC1pdGVtLmN1cnJlbnRcbiAgICAgIGNvbnN0IGVsZW1lbnRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbGlzdC1uZXN0ZWQtaXRlbScpO1xuICAgICAgQXJyYXkuZnJvbShlbGVtZW50cykubWFwKGVsID0+IHtcbiAgICAgICAgcmV0dXJuIGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2N1cnJlbnQnKTtcbiAgICAgIH0pO1xuXG4gICAgICBmb3IgKGxldCBpdGVtIG9mIHRoaXMuZ2V0RGVwdGhGaXJzdEl0ZW1zKHRoaXMub3V0bGluZSkpIHtcbiAgICAgICAgcmFuZ2UgPSBpdGVtLnJhbmdlO1xuICAgICAgICBpZiAocmFuZ2UgJiYgcmFuZ2UuY29udGFpbnNQb2ludChjdXJzb3JQb3MpKSB7XG4gICAgICAgICAgbGV0IGlkID0gYGRvY3VtZW50LW91dGxpbmUtJHtpdGVtLnJhbmdlLnN0YXJ0LnJvd30tJHtpdGVtLnJhbmdlLmVuZC5yb3d9YDtcbiAgICAgICAgICBsZXQgZm91bmRFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgICAgICAgIGlmIChmb3VuZEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGZvdW5kRWxlbWVudC5zY3JvbGxJbnRvVmlldygpO1xuICAgICAgICAgICAgaWYgKCFkaWRGaW5kRGVlcGVzdEl0ZW0pIHtcbiAgICAgICAgICAgICAgLy8gVGhpcyBpcyB3aGVyZSB0byBhZGQgc3R1ZmYgcmVsYXRlZCB0byB0aGUgY3VycmVudGx5IGFjdGl2ZSBzdWItaGVhZGluZ1xuICAgICAgICAgICAgICAvLyB3aXRob3V0IGFmZmVjdGluZyBwYXJlbnRzIG9yIGNoaWxkcmVuXG4gICAgICAgICAgICAgIGZvdW5kRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdjdXJyZW50Jyk7XG4gICAgICAgICAgICAgIGRpZEZpbmREZWVwZXN0SXRlbSA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0RGVwdGhGaXJzdEl0ZW1zKHJvb3QpIHtcbiAgICAvLyBMYXppbHkgY29uc3RydWN0IGEgZmxhdCBsaXN0IG9mIGl0ZW1zIGZvciAoaW4gdGhlb3J5KSBmYXN0IGl0ZXJhdGlvblxuICAgIGZ1bmN0aW9uIGNvbGxlY3REZXB0aEZpcnN0KGl0ZW0sIG91dCkge1xuICAgICAgbGV0IGNoaWxkO1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoaXRlbSkpIHtcbiAgICAgICAgZm9yIChjaGlsZCBvZiBpdGVtKSB7XG4gICAgICAgICAgY29sbGVjdERlcHRoRmlyc3QoY2hpbGQsIG91dCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoY2hpbGQgb2YgaXRlbS5jaGlsZHJlbikge1xuICAgICAgICAgIGNvbGxlY3REZXB0aEZpcnN0KGNoaWxkLCBvdXQpO1xuICAgICAgICB9XG4gICAgICAgIG91dC5wdXNoKGl0ZW0pO1xuICAgICAgfVxuICAgIH1cbiAgICAgIC8vIExhemlseSBnZXQgdGhlIGl0ZW1zIGRlcHRoIGZpcnN0LiBPbiBmaXJzdCBydW4gYnVpbGQgYSBmbGF0IGxpc3Qgb2YgaXRlbXNcbiAgICBpZiAoIXRoaXMuX2RlcHRoRmlyc3RJdGVtcyB8fCB0aGlzLl9kZXB0aEZpcnN0SXRlbXMubGVuZ3RoID09PSAwKSB7XG4gICAgICB0aGlzLl9kZXB0aEZpcnN0SXRlbXMgPSBbXTtcbiAgICAgIGNvbGxlY3REZXB0aEZpcnN0KHJvb3QsIHRoaXMuX2RlcHRoRmlyc3RJdGVtcyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9kZXB0aEZpcnN0SXRlbXM7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSB7RG9jdW1lbnRPdXRsaW5lVmlld307XG4iXX0=