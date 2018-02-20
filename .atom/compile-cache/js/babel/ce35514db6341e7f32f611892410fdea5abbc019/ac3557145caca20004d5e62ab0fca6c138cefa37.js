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
        var item = undefined;
        var allItems = this.getDepthFirstItems(this.outline);

        for (item of allItems) {
          range = item.range;
          if (range) {
            if (range.containsPoint(cursorPos)) {
              var id = 'document-outline-' + item.range.start.row + '-' + item.range.end.row;
              var foundElement = document.getElementById(id);
              if (foundElement) {
                foundElement.scrollIntoView();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL25vem9taS8uYXRvbS9wYWNrYWdlcy9kb2N1bWVudC1vdXRsaW5lL2xpYi9kb2N1bWVudC1vdXRsaW5lLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7O0FBR1osSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztlQUNILE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7SUFBNUMsZUFBZSxZQUFmLGVBQWU7O0lBRWhCLG1CQUFtQjtBQUVaLFdBRlAsbUJBQW1CLEdBRVQ7MEJBRlYsbUJBQW1COztBQUdyQixRQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSxDQUFDO0FBQ3ZDLFFBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO0FBQ2xCLFFBQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7O0FBRTNCLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsb0NBQW9DLENBQUMsQ0FBQztBQUN4RSxRQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLDBDQUEwQyxDQUFDLENBQUM7QUFDL0UsUUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUN2Qjs7ZUFWRyxtQkFBbUI7O1dBWUwsOEJBQUc7QUFDbkIsYUFBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO0tBQ3hEOzs7V0FFTyxvQkFBRztBQUNULGFBQU8sU0FBUyxDQUFDO0tBQ2xCOzs7V0FFSyxrQkFBRztBQUNQLGFBQU8saUNBQWlDLENBQUM7S0FDMUM7OztXQUVrQiwrQkFBRztBQUNwQixhQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQzFCOzs7V0FFZ0IsNkJBQUc7QUFDbEIsYUFBTyxHQUFHLENBQUM7S0FDWjs7O1dBRUksaUJBQUc7QUFDTixVQUFJLENBQUMsTUFBTSxD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QUNGOzs7V0FFaUIsNEJBQUMsSUFBSSxFQUFFOztBQUV2QixlQUFTLGlCQUFpQixDQUFDLElBQUksRUFBRSxHQUFHLEVBQUU7QUFDcEMsWUFBSSxLQUFLLFlBQUEsQ0FBQztBQUNWLFlBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtBQUN2QixlQUFLLEtBQUssSUFBSSxJQUFJLEVBQUU7QUFDbEIsNkJBQWlCLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1dBQy9CO1NBQ0YsTUFBTTtBQUNMLGVBQUssS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7QUFDM0IsNkJBQWlCLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1dBQy9CO0FBQ0QsYUFBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNoQjtPQUNGOztBQUVELFVBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLElBQUksSUFBSSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7QUFDaEUsWUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztBQUMzQix5QkFBaUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUM7T0FDaEQ7QUFDRCxhQUFPLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQztLQUM5Qjs7O1NBOUhHLG1CQUFtQjs7O0FBaUl6QixNQUFNLENBQUMsT0FBTyxHQUFHLEVBQUMsbUJBQW1CLEVBQW5CLG1CQUFtQixFQUFDLENBQUMiLCJmaWxlIjoiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2RvY3VtZW50LW91dGxpbmUvbGliL2RvY3VtZW50LW91dGxpbmUtdmlldy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyoqIEBqc3ggZXRjaC5kb20gKi9cblxuY29uc3QgZXRjaCA9IHJlcXVpcmUoJ2V0Y2gnKTtcbmNvbnN0IHtPdXRsaW5lVHJlZVZpZXd9ID0gcmVxdWlyZSgnLi9vdXRsaW5lLXRyZWUnKTtcblxuY2xhc3MgRG9jdW1lbnRPdXRsaW5lVmlldyB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5jdXJzb3JQb3NpdGlvblN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgdGhpcy5vdXRsaW5lID0gW107XG4gICAgdGhpcy5fZGVwdGhGaXJzdEl0ZW1zID0gW107XG5cbiAgICB0aGlzLmF1dG9TY3JvbGwgPSBhdG9tLmNvbmZpZy5nZXQoXCJkb2N1bWVudC1vdXRsaW5lLmF1dG9TY3JvbGxPdXRsaW5lXCIpO1xuICAgIHRoaXMuZG9IaWdobGlnaHQgPSBhdG9tLmNvbmZpZy5nZXQoXCJkb2N1bWVudC1vdXRsaW5lLmhpZ2hsaWdodEN1cnJlbnRTZWN0aW9uXCIpO1xuICAgIGV0Y2guaW5pdGlhbGl6ZSh0aGlzKTtcbiAgfVxuXG4gIGdldERlZmF1bHRMb2NhdGlvbigpIHtcbiAgICByZXR1cm4gYXRvbS5jb25maWcuZ2V0KCdkb2N1bWVudC1vdXRsaW5lLmRlZmF1bHRTaWRlJyk7XG4gIH1cblxuICBnZXRUaXRsZSgpIHtcbiAgICByZXR1cm4gJ091dGxpbmUnO1xuICB9XG5cbiAgZ2V0VVJJKCkge1xuICAgIHJldHVybiAnYXRvbTovL2RvY3VtZW50LW91dGxpbmUvb3V0bGluZSc7XG4gIH1cblxuICBnZXRBbGxvd2VkTG9jYXRpb25zKCkge1xuICAgIHJldHVybiBbJ2xlZnQnLCAncmlnaHQnXTtcbiAgfVxuXG4gIGdldFByZWZlcnJlZFdpZHRoKCkge1xuICAgIHJldHVybiAyMDA7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICB0aGlzLnVwZGF0ZSh7b3V0bGluZTogW119KTtcbiAgfVxuXG4gIGRlc3Ryb3koKSB7XG4gICAgZXRjaC5kZXN0cm95KHRoaXMpO1xuICAgIGlmICh0aGlzLmN1cnNvclBvc2l0aW9uU3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLmN1cnNvclBvc2l0aW9uU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICB9XG4gIH1cblxuICBnZXRFbGVtZW50KCkge1xuICAgIHJldHVybiB0aGlzLmVsZW1lbnQ7XG4gIH1cblxuICB1cGRhdGUocHJvcHMpIHtcbiAgICBsZXQge291dGxpbmUsIGVkaXRvcn0gPSBwcm9wcztcbiAgICB0aGlzLm91dGxpbmUgPSBvdXRsaW5lO1xuICAgIC8vIFNldCB0aGUgb3V0bGluZSwgd2hpY2ggc2hvdWxkIHJlYnVpbGQgdGhlIERPTSB0cmVlXG4gICAgLy8gQ2xlYXIgZXhpc3RpbmcgZXZlbnRzIGFuZCByZS1zdWJzY3JpYmUgdG8gbWFrZSBzdXJlIHdlIGRvbid0IGFjY3VtdWxhdGUgc3Vic2NyaXB0aW9uc1xuICAgIGlmICh0aGlzLmN1cnNvclBvc2l0aW9uU3Vic2NyaXB0aW9uKSB7XG4gICAgICB0aGlzLmN1cnNvclBvc2l0aW9uU3Vic2NyaXB0aW9uLmRpc3Bvc2UoKTtcbiAgICB9XG5cbiAgICBpZiAoZWRpdG9yKSB7XG4gICAgICB0aGlzLmN1cnNvclBvcyA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpO1xuXG4gICAgICB0aGlzLmN1cnNvclBvc2l0aW9uU3Vic2NyaXB0aW9uID0gZWRpdG9yLm9uRGlkQ2hhbmdlQ3Vyc29yUG9zaXRpb24oZXZlbnQgPT4ge1xuICAgICAgICBpZiAoZXZlbnQub2xkQnVmZmVyUG9zaXRpb24ucm93ICE9PSBldmVudC5uZXdCdWZmZXJQb3NpdGlvbi5yb3cpIHtcbiAgICAgICAgICB0aGlzLmN1cnNvclBvcyA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpO1xuICAgICAgICAgIHJldHVybiBldGNoLnVwZGF0ZSh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5fZGVwdGhGaXJzdEl0ZW1zID0gW107XG4gICAgcmV0dXJuIGV0Y2gudXBkYXRlKHRoaXMpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHRoaXMub3V0bGluZUVsZW1lbnRzID0gdGhpcy5vdXRsaW5lLm1hcCh0cmVlID0+IHtcbiAgICAgIHRyZWUuY3Vyc29yUG9zID0gdGhpcy5jdXJzb3JQb3M7XG4gICAgICB0cmVlLmRvSGlnaGxpZ2h0ID0gdGhpcy5kb0hpZ2hsaWdodDtcbiAgICAgIHJldHVybiA8T3V0bGluZVRyZWVWaWV3IHsuLi50cmVlfS8+O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIDxkaXYgY2xhc3M9XCJkb2N1bWVudC1vdXRsaW5lXCIgaWQ9XCJkb2N1bWVudC1vdXRsaW5lXCI+XG4gICAgICAgIDxvbCBjbGFzcz1cImxpc3QtdHJlZVwiPnt0aGlzLm91dGxpbmVFbGVtZW50c308L29sPlxuICAgICAgPC9kaXY+O1xuICB9XG5cbiAgcmVhZEFmdGVyVXBkYXRlKCkge1xuICAgIGlmICh0aGlzLmF1dG9TY3JvbGwgJiYgdGhpcy5jdXJzb3JQb3MpIHtcbiAgICAgIGxldCBjdXJzb3JQb3MgPSB0aGlzLmN1cnNvclBvcztcbiAgICAgIGxldCByYW5nZTtcbiAgICAgIGxldCBpdGVtO1xuICAgICAgbGV0IGFsbEl0ZW1zID0gdGhpcy5nZXREZXB0aEZpcnN0SXRlbXModGhpcy5vdXRsaW5lKTtcblxuICAgICAgZm9yIChpdGVtIG9mIGFsbEl0ZW1zKSB7XG4gICAgICAgIHJhbmdlID0gaXRlbS5yYW5nZTtcbiAgICAgICAgaWYgKHJhbmdlKSB7XG4gICAgICAgICAgaWYgKHJhbmdlLmNvbnRhaW5zUG9pbnQoY3Vyc29yUG9zKSkge1xuICAgICAgICAgICAgbGV0IGlkID0gYGRvY3VtZW50LW91dGxpbmUtJHtpdGVtLnJhbmdlLnN0YXJ0LnJvd30tJHtpdGVtLnJhbmdlLmVuZC5yb3d9YDtcbiAgICAgICAgICAgIGxldCBmb3VuZEVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgICAgICAgICBpZiAoZm91bmRFbGVtZW50KSB7XG4gICAgICAgICAgICAgIGZvdW5kRWxlbWVudC5zY3JvbGxJbnRvVmlldygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldERlcHRoRmlyc3RJdGVtcyhyb290KSB7XG4gICAgLy8gTGF6aWx5IGNvbnN0cnVjdCBhIGZsYXQgbGlzdCBvZiBpdGVtcyBmb3IgKGluIHRoZW9yeSkgZmFzdCBpdGVyYXRpb25cbiAgICBmdW5jdGlvbiBjb2xsZWN0RGVwdGhGaXJzdChpdGVtLCBvdXQpIHtcbiAgICAgIGxldCBjaGlsZDtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGl0ZW0pKSB7XG4gICAgICAgIGZvciAoY2hpbGQgb2YgaXRlbSkge1xuICAgICAgICAgIGNvbGxlY3REZXB0aEZpcnN0KGNoaWxkLCBvdXQpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKGNoaWxkIG9mIGl0ZW0uY2hpbGRyZW4pIHtcbiAgICAgICAgICBjb2xsZWN0RGVwdGhGaXJzdChjaGlsZCwgb3V0KTtcbiAgICAgICAgfVxuICAgICAgICBvdXQucHVzaChpdGVtKTtcbiAgICAgIH1cbiAgICB9XG4gICAgICAvLyBMYXppbHkgZ2V0IHRoZSBpdGVtcyBkZXB0aCBmaXJzdC4gT24gZmlyc3QgcnVuIGJ1aWxkIGEgZmxhdCBsaXN0IG9mIGl0ZW1zXG4gICAgaWYgKCF0aGlzLl9kZXB0aEZpcnN0SXRlbXMgfHwgdGhpcy5fZGVwdGhGaXJzdEl0ZW1zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5fZGVwdGhGaXJzdEl0ZW1zID0gW107XG4gICAgICBjb2xsZWN0RGVwdGhGaXJzdChyb290LCB0aGlzLl9kZXB0aEZpcnN0SXRlbXMpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fZGVwdGhGaXJzdEl0ZW1zO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge0RvY3VtZW50T3V0bGluZVZpZXd9O1xuIl19