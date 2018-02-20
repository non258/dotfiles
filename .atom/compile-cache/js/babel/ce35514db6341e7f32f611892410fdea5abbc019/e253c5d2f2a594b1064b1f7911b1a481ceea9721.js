'use babel';
/** @jsx etch.dom */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var etch = require('etch');

var _require = require('atom');

var Point = _require.Point;

etch.setScheduler(atom.views);

var OutlineTreeView = (function () {
  function OutlineTreeView(props) {
    _classCallCheck(this, OutlineTreeView);

    this.plainText = props.plainText;
    this.childOutlines = props.children ? props.children : [];
    this.startRow = props.startPosition ? props.startPosition.row : null;
    this.endRow = props.endPosition ? props.endPosition.row : null;
    for (var child of this.childOutlines) {
      child.doHighlight = props.doHighlight;
      child.cursorPos = props.cursorPos;
    }
    this.highlight = '';
    if (props.cursorPos) {
      if (props.cursorPos >= this.startRow && props.cursorPos < this.endRow && props.doHighlight) {
        this.highlight = 'item-highlight';
      }
    }
    this.autoCollapse = props.autoCollapse;
    this.showChildren = true;
    this.updateIcon();
    etch.initialize(this);
  }

  _createClass(OutlineTreeView, [{
    key: 'update',
    value: function update(props) {
      // this.cursorPos = props.cursorPos;
      this.plainText = props.plainText;
      this.childOutlines = props.children;
      this.startRow = props.startPosition ? props.startPosition.row : null;
      this.endRow = props.endPosition ? props.endPosition.row : null;

      for (var child of this.childOutlines) {
        child.doHighlight = props.doHighlight;
        child.cursorPos = props.cursorPos;
        child.autoCollapse = props.autoCollapse;
      }

      this.highlight = '';
      if (props.cursorPos) {
        if (props.cursorPos.row >= this.startRow && props.cursorPos.row < this.endRow && props.doHighlight) {
          this.highlight = 'item-highlight';
          this.showChildren = true;
        } else {
          // False if autoCollapse is set, True otherwise
          this.showChildren = !props.autoCollapse;
        }
      }
      this.updateIcon();
      return etch.update(this);
    }
  }, {
    key: 'render',
    value: function render() {
      var sublist = etch.dom('span', null);

      if (this.childOutlines && this.showChildren) {
        sublist = etch.dom(
          'ol',
          { 'class': 'list-tree' },
          this.childOutlines.map(function (child) {
            return etch.dom(OutlineTreeView, child);
          })
        );
      }

      var iconClass = 'icon ' + this.icon;
      var itemClass = 'list-nested-item list-selectable-item ' + this.highlight;
      var itemId = 'document-outline-' + this.startRow + '-' + this.endRow;

      return etch.dom(
        'div',
        { 'class': itemClass,
          startrow: this.startRow, endrow: this.endRow,
          id: itemId,
          key: itemId,
          ref: 'outlineElement'
        },
        etch.dom('span', { 'class': iconClass, on: { click: this.toggleSubtree } }),
        etch.dom(
          'span',
          { 'class': 'tree-item-text', on: {
              click: this.didClick,
              dblclick: this.toggleSubtree } },
          this.plainText
        ),
        sublist
      );
      // draggable="true"
    }

    // // Optional: Destroy the component. Async/await syntax is pretty but optional.
    // async destroy () {
    //   // call etch.destroy to remove the element and destroy child components
    //   await etch.destroy(this)
    //   // then perform custom teardown logic here...
    // }

  }, {
    key: 'didClick',
    value: function didClick() {
      var editor = atom.workspace.getActiveTextEditor();
      var cursorPos = editor.getCursorBufferPosition();
      var documentPos = new Point(this.startRow - 1, 0);
      editor.scrollToBufferPosition(documentPos, { center: true });
      atom.views.getView(editor).focus();

      // NOTE: don't reset to cursor position if we autoCollapse
      // because that would reset the outline view again!
      if (!this.autoCollapse) {
        editor.setCursorBufferPosition(cursorPos, { autoscroll: false });
      }
    }
  }, {
    key: 'toggleSubtree',
    value: function toggleSubtree() {
      this.showChildren = !this.showChildren;
      this.updateIcon();
      return etch.update(this);
    }
  }, {
    key: 'updateIcon',
    value: function updateIcon() {
      if (this.childOutlines && this.childOutlines.length > 0 && this.showChildren) {
        this.icon = 'icon-chevron-down';
      } else if (this.childOutlines && this.childOutlines.length > 0 && !this.showChildren) {
        this.icon = 'icon-chevron-right';
      } else {
        this.icon = 'icon-one-dot';
      }
    }
  }]);

  return OutlineTreeView;
})();

module.exports = { OutlineTreeView: OutlineTreeView };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL25vem9taS8uYXRvbS9wYWNrYWdlcy9kb2N1bWVudC1vdXRsaW5lL2xpYi9vdXRsaW5lLXRyZWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7O0FBR1osSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztlQUNiLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQXhCLEtBQUssWUFBTCxLQUFLOztBQUVaLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDOztJQUV4QixlQUFlO0FBQ1IsV0FEUCxlQUFlLENBQ1AsS0FBSyxFQUFFOzBCQURmLGVBQWU7O0FBRWpCLFFBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQztBQUNqQyxRQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDMUQsUUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztBQUNyRSxRQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO0FBQy9ELFNBQUssSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUNwQyxXQUFLLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7QUFDdEMsV0FBSyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDO0tBQ25DO0FBQ0QsUUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDcEIsUUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFO0FBQ25CLFVBQUksS0FBSyxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxT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QUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7QUFDNUUsWUFBSSxDQUFDLElBQUksR0FBRyxtQkFBbUIsQ0FBQztPQUNqQyxNQUFNLElBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO0FBQ3BGLFlBQUksQ0FBQyxJQUFJLEdBQUcsb0JBQW9CLENBQUM7T0FDbEMsTUFBTTtBQUNMLFlBQUksQ0FBQyxJQUFJLEdBQUcsY0FBYyxDQUFDO09BQzVCO0tBQ0Y7OztTQWxIRyxlQUFlOzs7QUFxSHJCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsRUFBQyxlQUFlLEVBQWYsZUFBZSxFQUFDLENBQUMiLCJmaWxlIjoiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2RvY3VtZW50LW91dGxpbmUvbGliL291dGxpbmUtdHJlZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyoqIEBqc3ggZXRjaC5kb20gKi9cblxuY29uc3QgZXRjaCA9IHJlcXVpcmUoJ2V0Y2gnKTtcbmNvbnN0IHtQb2ludH0gPSByZXF1aXJlKCdhdG9tJyk7XG5cbmV0Y2guc2V0U2NoZWR1bGVyKGF0b20udmlld3MpO1xuXG5jbGFzcyBPdXRsaW5lVHJlZVZpZXcge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHRoaXMucGxhaW5UZXh0ID0gcHJvcHMucGxhaW5UZXh0O1xuICAgIHRoaXMuY2hpbGRPdXRsaW5lcyA9IHByb3BzLmNoaWxkcmVuID8gcHJvcHMuY2hpbGRyZW4gOiBbXTtcbiAgICB0aGlzLnN0YXJ0Um93ID0gcHJvcHMuc3RhcnRQb3NpdGlvbiA/IHByb3BzLnN0YXJ0UG9zaXRpb24ucm93IDogbnVsbDtcbiAgICB0aGlzLmVuZFJvdyA9IHByb3BzLmVuZFBvc2l0aW9uID8gcHJvcHMuZW5kUG9zaXRpb24ucm93IDogbnVsbDtcbiAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLmNoaWxkT3V0bGluZXMpIHtcbiAgICAgIGNoaWxkLmRvSGlnaGxpZ2h0ID0gcHJvcHMuZG9IaWdobGlnaHQ7XG4gICAgICBjaGlsZC5jdXJzb3JQb3MgPSBwcm9wcy5jdXJzb3JQb3M7XG4gICAgfVxuICAgIHRoaXMuaGlnaGxpZ2h0ID0gJyc7XG4gICAgaWYgKHByb3BzLmN1cnNvclBvcykge1xuICAgICAgaWYgKHByb3BzLmN1cnNvclBvcyA+PSB0aGlzLnN0YXJ0Um93ICYmIHByb3BzLmN1cnNvclBvcyA8IHRoaXMuZW5kUm93ICYmIHByb3BzLmRvSGlnaGxpZ2h0KSB7XG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0ID0gJ2l0ZW0taGlnaGxpZ2h0JztcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5hdXRvQ29sbGFwc2UgPSBwcm9wcy5hdXRvQ29sbGFwc2U7XG4gICAgdGhpcy5zaG93Q2hpbGRyZW4gPSB0cnVlO1xuICAgIHRoaXMudXBkYXRlSWNvbigpO1xuICAgIGV0Y2guaW5pdGlhbGl6ZSh0aGlzKTtcbiAgfVxuXG4gIHVwZGF0ZShwcm9wcykge1xuICAgIC8vIHRoaXMuY3Vyc29yUG9zID0gcHJvcHMuY3Vyc29yUG9zO1xuICAgIHRoaXMucGxhaW5UZXh0ID0gcHJvcHMucGxhaW5UZXh0O1xuICAgIHRoaXMuY2hpbGRPdXRsaW5lcyA9IHByb3BzLmNoaWxkcmVuO1xuICAgIHRoaXMuc3RhcnRSb3cgPSBwcm9wcy5zdGFydFBvc2l0aW9uID8gcHJvcHMuc3RhcnRQb3NpdGlvbi5yb3cgOiBudWxsO1xuICAgIHRoaXMuZW5kUm93ID0gcHJvcHMuZW5kUG9zaXRpb24gPyBwcm9wcy5lbmRQb3NpdGlvbi5yb3cgOiBudWxsO1xuXG4gICAgZm9yIChsZXQgY2hpbGQgb2YgdGhpcy5jaGlsZE91dGxpbmVzKSB7XG4gICAgICBjaGlsZC5kb0hpZ2hsaWdodCA9IHByb3BzLmRvSGlnaGxpZ2h0O1xuICAgICAgY2hpbGQuY3Vyc29yUG9zID0gcHJvcHMuY3Vyc29yUG9zO1xuICAgICAgY2hpbGQuYXV0b0NvbGxhcHNlID0gcHJvcHMuYXV0b0NvbGxhcHNlO1xuICAgIH1cblxuICAgIHRoaXMuaGlnaGxpZ2h0ID0gJyc7XG4gICAgaWYgKHByb3BzLmN1cnNvclBvcykge1xuICAgICAgaWYgKHByb3BzLmN1cnNvclBvcy5yb3cgPj0gdGhpcy5zdGFydFJvdyAmJiBwcm9wcy5jdXJzb3JQb3Mucm93IDwgdGhpcy5lbmRSb3cgJiYgcHJvcHMuZG9IaWdobGlnaHQpIHtcbiAgICAgICAgdGhpcy5oaWdobGlnaHQgPSAnaXRlbS1oaWdobGlnaHQnO1xuICAgICAgICB0aGlzLnNob3dDaGlsZHJlbiA9IHRydWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBGYWxzZSBpZiBhdXRvQ29sbGFwc2UgaXMgc2V0LCBUcnVlIG90aGVyd2lzZVxuICAgICAgICB0aGlzLnNob3dDaGlsZHJlbiA9ICFwcm9wcy5hdXRvQ29sbGFwc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMudXBkYXRlSWNvbigpO1xuICAgIHJldHVybiBldGNoLnVwZGF0ZSh0aGlzKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBsZXQgc3VibGlzdCA9IDxzcGFuPjwvc3Bhbj47XG5cbiAgICBpZiAodGhpcy5jaGlsZE91dGxpbmVzICYmIHRoaXMuc2hvd0NoaWxkcmVuKSB7XG4gICAgICBzdWJsaXN0ID0gPG9sIGNsYXNzPVwibGlzdC10cmVlXCI+XG4gICAgICAgICAge3RoaXMuY2hpbGRPdXRsaW5lcy5tYXAoY2hpbGQgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIDxPdXRsaW5lVHJlZVZpZXcgey4uLmNoaWxkfS8+O1xuICAgICAgICAgIH0pfVxuICAgICAgICA8L29sPjtcbiAgICB9XG5cbiAgICBsZXQgaWNvbkNsYXNzID0gYGljb24gJHt0aGlzLmljb259YDtcbiAgICBsZXQgaXRlbUNsYXNzID0gYGxpc3QtbmVzdGVkLWl0ZW0gbGlzdC1zZWxlY3RhYmxlLWl0ZW0gJHt0aGlzLmhpZ2hsaWdodH1gO1xuICAgIGxldCBpdGVtSWQgPSBgZG9jdW1lbnQtb3V0bGluZS0ke3RoaXMuc3RhcnRSb3d9LSR7dGhpcy5lbmRSb3d9YDtcblxuICAgIHJldHVybiA8ZGl2IGNsYXNzPXtpdGVtQ2xhc3N9XG4gICAgc3RhcnRyb3c9e3RoaXMuc3RhcnRSb3d9IGVuZHJvdz17dGhpcy5lbmRSb3d9XG4gICAgaWQ9e2l0ZW1JZH1cbiAgICBrZXk9e2l0ZW1JZH1cbiAgICByZWY9XCJvdXRsaW5lRWxlbWVudFwiXG4gICAgPlxuICAgIDxzcGFuIGNsYXNzPXtpY29uQ2xhc3N9IG9uPXt7Y2xpY2s6IHRoaXMudG9nZ2xlU3VidHJlZX19Pjwvc3Bhbj5cbiAgICA8c3BhbiBjbGFzcz1cInRyZWUtaXRlbS10ZXh0XCIgb249e3tcbiAgICAgIGNsaWNrOiB0aGlzLmRpZENsaWNrLFxuICAgICAgZGJsY2xpY2s6IHRoaXMudG9nZ2xlU3VidHJlZX19PlxuICAgIHt0aGlzLnBsYWluVGV4dH08L3NwYW4+XG4gICAge3N1Ymxpc3R9XG4gICAgPC9kaXY+O1xuICAgIC8vIGRyYWdnYWJsZT1cInRydWVcIlxuICB9XG4gIC8vIC8vIE9wdGlvbmFsOiBEZXN0cm95IHRoZSBjb21wb25lbnQuIEFzeW5jL2F3YWl0IHN5bnRheCBpcyBwcmV0dHkgYnV0IG9wdGlvbmFsLlxuICAvLyBhc3luYyBkZXN0cm95ICgpIHtcbiAgLy8gICAvLyBjYWxsIGV0Y2guZGVzdHJveSB0byByZW1vdmUgdGhlIGVsZW1lbnQgYW5kIGRlc3Ryb3kgY2hpbGQgY29tcG9uZW50c1xuICAvLyAgIGF3YWl0IGV0Y2guZGVzdHJveSh0aGlzKVxuICAvLyAgIC8vIHRoZW4gcGVyZm9ybSBjdXN0b20gdGVhcmRvd24gbG9naWMgaGVyZS4uLlxuICAvLyB9XG5cbiAgZGlkQ2xpY2soKSB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGNvbnN0IGN1cnNvclBvcyA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpO1xuICAgIGNvbnN0IGRvY3VtZW50UG9zID0gbmV3IFBvaW50KHRoaXMuc3RhcnRSb3cgLSAxLCAwKTtcbiAgICBlZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihkb2N1bWVudFBvcywge2NlbnRlcjogdHJ1ZX0pO1xuICAgIGF0b20udmlld3MuZ2V0VmlldyhlZGl0b3IpLmZvY3VzKCk7XG5cbiAgICAvLyBOT1RFOiBkb24ndCByZXNldCB0byBjdXJzb3IgcG9zaXRpb24gaWYgd2UgYXV0b0NvbGxhcHNlXG4gICAgLy8gYmVjYXVzZSB0aGF0IHdvdWxkIHJlc2V0IHRoZSBvdXRsaW5lIHZpZXcgYWdhaW4hXG4gICAgaWYgKCF0aGlzLmF1dG9Db2xsYXBzZSkge1xuICAgICAgZWRpdG9yLnNldEN1cnNvckJ1ZmZlclBvc2l0aW9uKGN1cnNvclBvcywge2F1dG9zY3JvbGw6IGZhbHNlfSk7XG4gICAgfVxuICB9XG5cbiAgdG9nZ2xlU3VidHJlZSgpIHtcbiAgICB0aGlzLnNob3dDaGlsZHJlbiA9ICF0aGlzLnNob3dDaGlsZHJlbjtcbiAgICB0aGlzLnVwZGF0ZUljb24oKTtcbiAgICByZXR1cm4gZXRjaC51cGRhdGUodGhpcyk7XG4gIH1cblxuICB1cGRhdGVJY29uKCkge1xuICAgIGlmICh0aGlzLmNoaWxkT3V0bGluZXMgJiYgdGhpcy5jaGlsZE91dGxpbmVzLmxlbmd0aCA+IDAgJiYgdGhpcy5zaG93Q2hpbGRyZW4pIHtcbiAgICAgIHRoaXMuaWNvbiA9ICdpY29uLWNoZXZyb24tZG93bic7XG4gICAgfSBlbHNlIGlmICh0aGlzLmNoaWxkT3V0bGluZXMgJiYgdGhpcy5jaGlsZE91dGxpbmVzLmxlbmd0aCA+IDAgJiYgIXRoaXMuc2hvd0NoaWxkcmVuKSB7XG4gICAgICB0aGlzLmljb24gPSAnaWNvbi1jaGV2cm9uLXJpZ2h0JztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pY29uID0gJ2ljb24tb25lLWRvdCc7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge091dGxpbmVUcmVlVmlld307XG4iXX0=