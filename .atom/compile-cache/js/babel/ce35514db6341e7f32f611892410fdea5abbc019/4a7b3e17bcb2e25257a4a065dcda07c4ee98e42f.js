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
        this.highlight = 'highlight';
      }
    }
    this.showChildren = true;
    this.updateIcon();
    etch.initialize(this);
  }

  _createClass(OutlineTreeView, [{
    key: 'update',
    value: function update(props) {
      // this.props = props;
      // this.cursorPos = props.cursorPos;
      this.plainText = props.plainText;
      this.childOutlines = props.children;
      this.startRow = props.startPosition ? props.startPosition.row : null;
      this.endRow = props.endPosition ? props.endPosition.row : null;

      for (var child of this.childOutlines) {
        child.doHighlight = props.doHighlight;
        child.cursorPos = props.cursorPos;
      }
      // TODO if cursorPos changes but stays in start/end range, dont update
      // Hopefully etch is smart enough to make no changes if highlight doesn't change
      this.highlight = '';
      if (props.cursorPos) {
        if (props.cursorPos.row >= this.startRow && props.cursorPos.row < this.endRow && props.doHighlight) {
          this.highlight = 'highlight';
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
      var pt = new Point(this.startRow - 1, 0);
      editor.scrollToBufferPosition(pt, { center: true });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL25vem9taS8uYXRvbS9wYWNrYWdlcy9kb2N1bWVudC1vdXRsaW5lL2xpYi9vdXRsaW5lLXRyZWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsV0FBVyxDQUFDOzs7Ozs7O0FBR1osSUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDOztlQUNiLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQXhCLEtBQUssWUFBTCxLQUFLOztBQUVaLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDOztJQUV4QixlQUFlO0FBQ1IsV0FEUCxlQUFlLENBQ1AsS0FBSyxFQUFFOzBCQURmLGVBQWU7O0FBRWpCLFFBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQztBQUNqQyxRQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDMUQsUUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQztBQUNyRSxRQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDO0FBQy9ELFNBQUssSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtBQUNwQyxXQUFLLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUM7QUFDdEMsV0FBSyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDO0tBQ25DO0FBQ0QsUUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7QUFDcEIsUUFBSSxLQUFLLENBQUMsU0FBUyxFQUFFO0FBQ25CLFVBQUksS0FBSyxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLEtBQUssQ0FBQyxT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QixPQUFPO09BQ0YsQ0FBQzs7S0FFUjs7Ozs7Ozs7Ozs7V0FRTyxvQkFBRztBQUNULFVBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUNsRCxVQUFNLEVBQUUsR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMzQyxZQUFNLENBQUMsc0JBQXNCLENBQUMsRUFBRSxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7S0FDbkQ7OztXQUVZLHlCQUFHO0FBQ2QsVUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7QUFDdkMsVUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ2xCLGFBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUMxQjs7O1dBRVMsc0JBQUc7QUFDWCxVQUFJLElBQUksQ0FBQyxhQUFhLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUU7QUFDNUUsWUFBSSxDQUFDLElBQUksR0FBRyxtQkFBbUIsQ0FBQztPQUNqQyxNQUFNLElBQUksSUFBSSxDQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLE1BQU0sR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFO0FBQ3BGLFlBQUksQ0FBQyxJQUFJLEdBQUcsb0JBQW9CLENBQUM7T0FDbEMsTUFBTTtBQUNMLFlBQUksQ0FBQyxJQUFJLEdBQUcsY0FBYyxDQUFDO09BQzVCO0tBQ0Y7OztTQXRHRyxlQUFlOzs7QUF5R3JCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsRUFBQyxlQUFlLEVBQWYsZUFBZSxFQUFDLENBQUMiLCJmaWxlIjoiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2RvY3VtZW50LW91dGxpbmUvbGliL291dGxpbmUtdHJlZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyoqIEBqc3ggZXRjaC5kb20gKi9cblxuY29uc3QgZXRjaCA9IHJlcXVpcmUoJ2V0Y2gnKTtcbmNvbnN0IHtQb2ludH0gPSByZXF1aXJlKCdhdG9tJyk7XG5cbmV0Y2guc2V0U2NoZWR1bGVyKGF0b20udmlld3MpO1xuXG5jbGFzcyBPdXRsaW5lVHJlZVZpZXcge1xuICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgIHRoaXMucGxhaW5UZXh0ID0gcHJvcHMucGxhaW5UZXh0O1xuICAgIHRoaXMuY2hpbGRPdXRsaW5lcyA9IHByb3BzLmNoaWxkcmVuID8gcHJvcHMuY2hpbGRyZW4gOiBbXTtcbiAgICB0aGlzLnN0YXJ0Um93ID0gcHJvcHMuc3RhcnRQb3NpdGlvbiA/IHByb3BzLnN0YXJ0UG9zaXRpb24ucm93IDogbnVsbDtcbiAgICB0aGlzLmVuZFJvdyA9IHByb3BzLmVuZFBvc2l0aW9uID8gcHJvcHMuZW5kUG9zaXRpb24ucm93IDogbnVsbDtcbiAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLmNoaWxkT3V0bGluZXMpIHtcbiAgICAgIGNoaWxkLmRvSGlnaGxpZ2h0ID0gcHJvcHMuZG9IaWdobGlnaHQ7XG4gICAgICBjaGlsZC5jdXJzb3JQb3MgPSBwcm9wcy5jdXJzb3JQb3M7XG4gICAgfVxuICAgIHRoaXMuaGlnaGxpZ2h0ID0gJyc7XG4gICAgaWYgKHByb3BzLmN1cnNvclBvcykge1xuICAgICAgaWYgKHByb3BzLmN1cnNvclBvcyA+PSB0aGlzLnN0YXJ0Um93ICYmIHByb3BzLmN1cnNvclBvcyA8IHRoaXMuZW5kUm93ICYmIHByb3BzLmRvSGlnaGxpZ2h0KSB7XG4gICAgICAgIHRoaXMuaGlnaGxpZ2h0ID0gJ2hpZ2hsaWdodCc7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuc2hvd0NoaWxkcmVuID0gdHJ1ZTtcbiAgICB0aGlzLnVwZGF0ZUljb24oKTtcbiAgICBldGNoLmluaXRpYWxpemUodGhpcyk7XG4gIH1cblxuICB1cGRhdGUocHJvcHMpIHtcbiAgICAvLyB0aGlzLnByb3BzID0gcHJvcHM7XG4gICAgLy8gdGhpcy5jdXJzb3JQb3MgPSBwcm9wcy5jdXJzb3JQb3M7XG4gICAgdGhpcy5wbGFpblRleHQgPSBwcm9wcy5wbGFpblRleHQ7XG4gICAgdGhpcy5jaGlsZE91dGxpbmVzID0gcHJvcHMuY2hpbGRyZW47XG4gICAgdGhpcy5zdGFydFJvdyA9IHByb3BzLnN0YXJ0UG9zaXRpb24gPyBwcm9wcy5zdGFydFBvc2l0aW9uLnJvdyA6IG51bGw7XG4gICAgdGhpcy5lbmRSb3cgPSBwcm9wcy5lbmRQb3NpdGlvbiA/IHByb3BzLmVuZFBvc2l0aW9uLnJvdyA6IG51bGw7XG5cbiAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLmNoaWxkT3V0bGluZXMpIHtcbiAgICAgIGNoaWxkLmRvSGlnaGxpZ2h0ID0gcHJvcHMuZG9IaWdobGlnaHQ7XG4gICAgICBjaGlsZC5jdXJzb3JQb3MgPSBwcm9wcy5jdXJzb3JQb3M7XG4gICAgfVxuICAgIC8vIFRPRE8gaWYgY3Vyc29yUG9zIGNoYW5nZXMgYnV0IHN0YXlzIGluIHN0YXJ0L2VuZCByYW5nZSwgZG9udCB1cGRhdGVcbiAgICAvLyBIb3BlZnVsbHkgZXRjaCBpcyBzbWFydCBlbm91Z2ggdG8gbWFrZSBubyBjaGFuZ2VzIGlmIGhpZ2hsaWdodCBkb2Vzbid0IGNoYW5nZVxuICAgIHRoaXMuaGlnaGxpZ2h0ID0gJyc7XG4gICAgaWYgKHByb3BzLmN1cnNvclBvcykge1xuICAgICAgaWYgKHByb3BzLmN1cnNvclBvcy5yb3cgPj0gdGhpcy5zdGFydFJvdyAmJiBwcm9wcy5jdXJzb3JQb3Mucm93IDwgdGhpcy5lbmRSb3cgJiYgcHJvcHMuZG9IaWdobGlnaHQpIHtcbiAgICAgICAgdGhpcy5oaWdobGlnaHQgPSAnaGlnaGxpZ2h0JztcbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy51cGRhdGVJY29uKCk7XG4gICAgcmV0dXJuIGV0Y2gudXBkYXRlKHRoaXMpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGxldCBzdWJsaXN0ID0gPHNwYW4+PC9zcGFuPjtcblxuICAgIGlmICh0aGlzLmNoaWxkT3V0bGluZXMgJiYgdGhpcy5zaG93Q2hpbGRyZW4pIHtcbiAgICAgIHN1Ymxpc3QgPSA8b2wgY2xhc3M9XCJsaXN0LXRyZWVcIj5cbiAgICAgICAgICB7dGhpcy5jaGlsZE91dGxpbmVzLm1hcChjaGlsZCA9PiB7XG4gICAgICAgICAgICByZXR1cm4gPE91dGxpbmVUcmVlVmlldyB7Li4uY2hpbGR9Lz47XG4gICAgICAgICAgfSl9XG4gICAgICAgIDwvb2w+O1xuICAgIH1cblxuICAgIGxldCBpY29uQ2xhc3MgPSBgaWNvbiAke3RoaXMuaWNvbn1gO1xuICAgIGxldCBpdGVtQ2xhc3MgPSBgbGlzdC1uZXN0ZWQtaXRlbSBsaXN0LXNlbGVjdGFibGUtaXRlbSAke3RoaXMuaGlnaGxpZ2h0fWA7XG4gICAgbGV0IGl0ZW1JZCA9IGBkb2N1bWVudC1vdXRsaW5lLSR7dGhpcy5zdGFydFJvd30tJHt0aGlzLmVuZFJvd31gO1xuXG4gICAgcmV0dXJuIDxkaXYgY2xhc3M9e2l0ZW1DbGFzc31cbiAgICBzdGFydHJvdz17dGhpcy5zdGFydFJvd30gZW5kcm93PXt0aGlzLmVuZFJvd31cbiAgICBpZD17aXRlbUlkfVxuICAgIGtleT17aXRlbUlkfVxuICAgIHJlZj1cIm91dGxpbmVFbGVtZW50XCJcbiAgICA+XG4gICAgPHNwYW4gY2xhc3M9e2ljb25DbGFzc30gb249e3tjbGljazogdGhpcy50b2dnbGVTdWJ0cmVlfX0+PC9zcGFuPlxuICAgIDxzcGFuIGNsYXNzPVwidHJlZS1pdGVtLXRleHRcIiBvbj17e1xuICAgICAgY2xpY2s6IHRoaXMuZGlkQ2xpY2ssXG4gICAgICBkYmxjbGljazogdGhpcy50b2dnbGVTdWJ0cmVlfX0+XG4gICAge3RoaXMucGxhaW5UZXh0fTwvc3Bhbj5cbiAgICB7c3VibGlzdH1cbiAgICA8L2Rpdj47XG4gICAgLy8gZHJhZ2dhYmxlPVwidHJ1ZVwiXG4gIH1cbiAgLy8gLy8gT3B0aW9uYWw6IERlc3Ryb3kgdGhlIGNvbXBvbmVudC4gQXN5bmMvYXdhaXQgc3ludGF4IGlzIHByZXR0eSBidXQgb3B0aW9uYWwuXG4gIC8vIGFzeW5jIGRlc3Ryb3kgKCkge1xuICAvLyAgIC8vIGNhbGwgZXRjaC5kZXN0cm95IHRvIHJlbW92ZSB0aGUgZWxlbWVudCBhbmQgZGVzdHJveSBjaGlsZCBjb21wb25lbnRzXG4gIC8vICAgYXdhaXQgZXRjaC5kZXN0cm95KHRoaXMpXG4gIC8vICAgLy8gdGhlbiBwZXJmb3JtIGN1c3RvbSB0ZWFyZG93biBsb2dpYyBoZXJlLi4uXG4gIC8vIH1cblxuICBkaWRDbGljaygpIHtcbiAgICBsZXQgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGNvbnN0IHB0ID0gbmV3IFBvaW50KHRoaXMuc3RhcnRSb3cgLSAxLCAwKTtcbiAgICBlZGl0b3Iuc2Nyb2xsVG9CdWZmZXJQb3NpdGlvbihwdCwge2NlbnRlcjogdHJ1ZX0pO1xuICB9XG5cbiAgdG9nZ2xlU3VidHJlZSgpIHtcbiAgICB0aGlzLnNob3dDaGlsZHJlbiA9ICF0aGlzLnNob3dDaGlsZHJlbjtcbiAgICB0aGlzLnVwZGF0ZUljb24oKTtcbiAgICByZXR1cm4gZXRjaC51cGRhdGUodGhpcyk7XG4gIH1cblxuICB1cGRhdGVJY29uKCkge1xuICAgIGlmICh0aGlzLmNoaWxkT3V0bGluZXMgJiYgdGhpcy5jaGlsZE91dGxpbmVzLmxlbmd0aCA+IDAgJiYgdGhpcy5zaG93Q2hpbGRyZW4pIHtcbiAgICAgIHRoaXMuaWNvbiA9ICdpY29uLWNoZXZyb24tZG93bic7XG4gICAgfSBlbHNlIGlmICh0aGlzLmNoaWxkT3V0bGluZXMgJiYgdGhpcy5jaGlsZE91dGxpbmVzLmxlbmd0aCA+IDAgJiYgIXRoaXMuc2hvd0NoaWxkcmVuKSB7XG4gICAgICB0aGlzLmljb24gPSAnaWNvbi1jaGV2cm9uLXJpZ2h0JztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pY29uID0gJ2ljb24tb25lLWRvdCc7XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge091dGxpbmVUcmVlVmlld307XG4iXX0=