(function() {
  var AnsiToHtml, AtomRunnerView, ScrollView,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ScrollView = require('atom-space-pen-views').ScrollView;

  AnsiToHtml = require('ansi-to-html');

  module.exports = AtomRunnerView = (function(superClass) {
    extend(AtomRunnerView, superClass);

    atom.deserializers.add(AtomRunnerView);

    AtomRunnerView.deserialize = function(arg) {
      var footer, output, title, view;
      title = arg.title, output = arg.output, footer = arg.footer;
      view = new AtomRunnerView(title);
      view._output.html(output);
      view._footer.html(footer);
      return view;
    };

    AtomRunnerView.content = function() {
      return this.div({
        "class": 'atom-runner',
        tabindex: -1
      }, (function(_this) {
        return function() {
          _this.h1('Atom Runner');
          _this.pre({
            "class": 'output'
          });
          return _this.div({
            "class": 'footer'
          });
        };
      })(this));
    };

    function AtomRunnerView(title) {
      AtomRunnerView.__super__.constructor.apply(this, arguments);
      this._output = this.find('.output');
      this._footer = this.find('.footer');
      this.setTitle(title);
    }

    AtomRunnerView.prototype.serialize = function() {
      return {
        deserializer: 'AtomRunnerView',
        title: this.title,
        output: this._output.html(),
        footer: this._footer.html()
      };
    };

    AtomRunnerView.prototype.getTitle = function() {
      return "Atom Runner: " + this.title;
    };

    AtomRunnerView.prototype.setTitle = function(title) {
      this.title = title;
      return this.find('h1').html(this.getTitle());
    };

    AtomRunnerView.prototype.clear = function() {
      this._output.html('');
      return this._footer.html('');
    };

    AtomRunnerView.prototype.append = function(text, className) {
      var node, span;
      span = document.createElement('span');
      node = document.createTextNode(text);
      span.appendChild(node);
      span.innerHTML = new AnsiToHtml().toHtml(span.innerHTML);
      span.className = className || 'stdout';
      return this._output.append(span);
    };

    AtomRunnerView.prototype.appendFooter = function(text) {
      return this._footer.html(this._footer.html() + text);
    };

    AtomRunnerView.prototype.footer = function(text) {
      return this._footer.html(text);
    };

    return AtomRunnerView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2F0b20tcnVubmVyL2xpYi9hdG9tLXJ1bm5lci12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsc0NBQUE7SUFBQTs7O0VBQUMsYUFBYyxPQUFBLENBQVEsc0JBQVI7O0VBQ2YsVUFBQSxHQUFhLE9BQUEsQ0FBUSxjQUFSOztFQUViLE1BQU0sQ0FBQyxPQUFQLEdBQ007OztJQUNKLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBbkIsQ0FBdUIsY0FBdkI7O0lBRUEsY0FBQyxDQUFBLFdBQUQsR0FBYyxTQUFDLEdBQUQ7QUFDWixVQUFBO01BRGMsbUJBQU8scUJBQVE7TUFDN0IsSUFBQSxHQUFPLElBQUksY0FBSixDQUFtQixLQUFuQjtNQUNQLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBYixDQUFrQixNQUFsQjtNQUNBLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBYixDQUFrQixNQUFsQjthQUNBO0lBSlk7O0lBTWQsY0FBQyxDQUFBLE9BQUQsR0FBVSxTQUFBO2FBQ1IsSUFBQyxDQUFBLEdBQUQsQ0FBSztRQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sYUFBUDtRQUFzQixRQUFBLEVBQVUsQ0FBQyxDQUFqQztPQUFMLEVBQXlDLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUN2QyxLQUFDLENBQUEsRUFBRCxDQUFJLGFBQUo7VUFDQSxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxRQUFQO1dBQUw7aUJBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztZQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sUUFBUDtXQUFMO1FBSHVDO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF6QztJQURROztJQU1HLHdCQUFDLEtBQUQ7TUFDWCxpREFBQSxTQUFBO01BRUEsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFDLENBQUEsSUFBRCxDQUFNLFNBQU47TUFDWCxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxJQUFELENBQU0sU0FBTjtNQUNYLElBQUMsQ0FBQSxRQUFELENBQVUsS0FBVjtJQUxXOzs2QkFPYixTQUFBLEdBQVcsU0FBQTthQUNUO1FBQUEsWUFBQSxFQUFjLGdCQUFkO1FBQ0EsS0FBQSxFQUFPLElBQUMsQ0FBQSxLQURSO1FBRUEsTUFBQSxFQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFBLENBRlI7UUFHQSxNQUFBLEVBQVEsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQUEsQ0FIUjs7SUFEUzs7NkJBTVgsUUFBQSxHQUFVLFNBQUE7YUFDUixlQUFBLEdBQWdCLElBQUMsQ0FBQTtJQURUOzs2QkFHVixRQUFBLEdBQVUsU0FBQyxLQUFEO01BQ1IsSUFBQyxDQUFBLEtBQUQsR0FBUzthQUNULElBQUMsQ0FBQSxJQUFELENBQU0sSUFBTixDQUFXLENBQUMsSUFBWixDQUFpQixJQUFDLENBQUEsUUFBRCxDQUFBLENBQWpCO0lBRlE7OzZCQUlWLEtBQUEsR0FBTyxTQUFBO01BQ0wsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsRUFBZDthQUNBLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLEVBQWQ7SUFGSzs7NkJBSVAsTUFBQSxHQUFRLFNBQUMsSUFBRCxFQUFPLFNBQVA7QUFDTixVQUFBO01BQUEsSUFBQSxHQUFPLFFBQVEsQ0FBQyxhQUFULENBQXVCLE1BQXZCO01BQ1AsSUFBQSxHQUFPLFFBQVEsQ0FBQyxjQUFULENBQXdCLElBQXhCO01BQ1AsSUFBSSxDQUFDLFdBQUwsQ0FBaUIsSUFBakI7TUFDQSxJQUFJLENBQUMsU0FBTCxHQUFpQixJQUFJLFVBQUosQ0FBQSxDQUFnQixDQUFDLE1BQWpCLENBQXdCLElBQUksQ0FBQyxTQUE3QjtNQUNqQixJQUFJLENBQUMsU0FBTCxHQUFpQixTQUFBLElBQWE7YUFDOUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxNQUFULENBQWdCLElBQWhCO0lBTk07OzZCQVFSLFlBQUEsR0FBYyxTQUFDLElBQUQ7YUFDWixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBQSxDQUFBLEdBQWtCLElBQWhDO0lBRFk7OzZCQUdkLE1BQUEsR0FBUSxTQUFDLElBQUQ7YUFDTixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxJQUFkO0lBRE07Ozs7S0FsRG1CO0FBSjdCIiwic291cmNlc0NvbnRlbnQiOlsie1Njcm9sbFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5BbnNpVG9IdG1sID0gcmVxdWlyZSAnYW5zaS10by1odG1sJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBBdG9tUnVubmVyVmlldyBleHRlbmRzIFNjcm9sbFZpZXdcbiAgYXRvbS5kZXNlcmlhbGl6ZXJzLmFkZCh0aGlzKVxuXG4gIEBkZXNlcmlhbGl6ZTogKHt0aXRsZSwgb3V0cHV0LCBmb290ZXJ9KSAtPlxuICAgIHZpZXcgPSBuZXcgQXRvbVJ1bm5lclZpZXcodGl0bGUpXG4gICAgdmlldy5fb3V0cHV0Lmh0bWwob3V0cHV0KVxuICAgIHZpZXcuX2Zvb3Rlci5odG1sKGZvb3RlcilcbiAgICB2aWV3XG5cbiAgQGNvbnRlbnQ6IC0+XG4gICAgQGRpdiBjbGFzczogJ2F0b20tcnVubmVyJywgdGFiaW5kZXg6IC0xLCA9PlxuICAgICAgQGgxICdBdG9tIFJ1bm5lcidcbiAgICAgIEBwcmUgY2xhc3M6ICdvdXRwdXQnXG4gICAgICBAZGl2IGNsYXNzOiAnZm9vdGVyJ1xuXG4gIGNvbnN0cnVjdG9yOiAodGl0bGUpIC0+XG4gICAgc3VwZXJcblxuICAgIEBfb3V0cHV0ID0gQGZpbmQoJy5vdXRwdXQnKVxuICAgIEBfZm9vdGVyID0gQGZpbmQoJy5mb290ZXInKVxuICAgIEBzZXRUaXRsZSh0aXRsZSlcblxuICBzZXJpYWxpemU6IC0+XG4gICAgZGVzZXJpYWxpemVyOiAnQXRvbVJ1bm5lclZpZXcnXG4gICAgdGl0bGU6IEB0aXRsZVxuICAgIG91dHB1dDogQF9vdXRwdXQuaHRtbCgpXG4gICAgZm9vdGVyOiBAX2Zvb3Rlci5odG1sKClcblxuICBnZXRUaXRsZTogLT5cbiAgICBcIkF0b20gUnVubmVyOiAje0B0aXRsZX1cIlxuXG4gIHNldFRpdGxlOiAodGl0bGUpIC0+XG4gICAgQHRpdGxlID0gdGl0bGVcbiAgICBAZmluZCgnaDEnKS5odG1sKEBnZXRUaXRsZSgpKVxuXG4gIGNsZWFyOiAtPlxuICAgIEBfb3V0cHV0Lmh0bWwoJycpXG4gICAgQF9mb290ZXIuaHRtbCgnJylcblxuICBhcHBlbmQ6ICh0ZXh0LCBjbGFzc05hbWUpIC0+XG4gICAgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKVxuICAgIG5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0ZXh0KVxuICAgIHNwYW4uYXBwZW5kQ2hpbGQobm9kZSlcbiAgICBzcGFuLmlubmVySFRNTCA9IG5ldyBBbnNpVG9IdG1sKCkudG9IdG1sKHNwYW4uaW5uZXJIVE1MKVxuICAgIHNwYW4uY2xhc3NOYW1lID0gY2xhc3NOYW1lIHx8ICdzdGRvdXQnXG4gICAgQF9vdXRwdXQuYXBwZW5kKHNwYW4pXG4gIFxuICBhcHBlbmRGb290ZXI6ICh0ZXh0KSAtPlxuICAgIEBfZm9vdGVyLmh0bWwoQF9mb290ZXIuaHRtbCgpICsgdGV4dClcblxuICBmb290ZXI6ICh0ZXh0KSAtPlxuICAgIEBfZm9vdGVyLmh0bWwodGV4dClcbiJdfQ==
