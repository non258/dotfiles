(function() {
  var LocationSelectList, SelectListView, path,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  SelectListView = require('atom-space-pen-views').SelectListView;

  path = require('path');

  module.exports = LocationSelectList = (function(superClass) {
    extend(LocationSelectList, superClass);

    function LocationSelectList() {
      return LocationSelectList.__super__.constructor.apply(this, arguments);
    }

    LocationSelectList.prototype.initialize = function(editor, callback) {
      LocationSelectList.__super__.initialize.apply(this, arguments);
      this.addClass('overlay from-top');
      this.editor = editor;
      this.callback = callback;
      this.storeFocusedElement();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.focusFilterEditor();
    };

    LocationSelectList.prototype.viewForItem = function(item) {
      var f;
      if (item[0] === '<stdin>') {
        return "<li class=\"event\">" + item[1] + ":" + item[2] + "</li>";
      } else {
        f = path.join(item[0]);
        return "<li class=\"event\">" + f + "  " + item[1] + ":" + item[2] + "</li>";
      }
    };

    LocationSelectList.prototype.hide = function() {
      var ref;
      return (ref = this.panel) != null ? ref.hide() : void 0;
    };

    LocationSelectList.prototype.show = function() {
      this.storeFocusedElement();
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.focusFilterEditor();
    };

    LocationSelectList.prototype.toggle = function() {
      var ref;
      if ((ref = this.panel) != null ? ref.isVisible() : void 0) {
        return this.cancel();
      } else {
        return this.show();
      }
    };

    LocationSelectList.prototype.confirmed = function(item) {
      this.cancel();
      return this.callback(this.editor, item);
    };

    LocationSelectList.prototype.cancelled = function() {
      return this.hide();
    };

    return LocationSelectList;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1jbGFuZy9saWIvbG9jYXRpb24tc2VsZWN0LXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSx3Q0FBQTtJQUFBOzs7RUFBQyxpQkFBa0IsT0FBQSxDQUFRLHNCQUFSOztFQUNuQixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OztpQ0FDSixVQUFBLEdBQVksU0FBQyxNQUFELEVBQVMsUUFBVDtNQUNWLG9EQUFBLFNBQUE7TUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLGtCQUFWO01BQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVTtNQUNWLElBQUMsQ0FBQSxRQUFELEdBQVk7TUFDWixJQUFDLENBQUEsbUJBQUQsQ0FBQTs7UUFDQSxJQUFDLENBQUEsUUFBUyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWYsQ0FBNkI7VUFBQSxJQUFBLEVBQU0sSUFBTjtTQUE3Qjs7TUFDVixJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBQTthQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO0lBUlU7O2lDQVVaLFdBQUEsR0FBYSxTQUFDLElBQUQ7QUFDWCxVQUFBO01BQUEsSUFBRyxJQUFLLENBQUEsQ0FBQSxDQUFMLEtBQVcsU0FBZDtlQUNFLHNCQUFBLEdBQXVCLElBQUssQ0FBQSxDQUFBLENBQTVCLEdBQStCLEdBQS9CLEdBQWtDLElBQUssQ0FBQSxDQUFBLENBQXZDLEdBQTBDLFFBRDVDO09BQUEsTUFBQTtRQUdFLENBQUEsR0FBSSxJQUFJLENBQUMsSUFBTCxDQUFVLElBQUssQ0FBQSxDQUFBLENBQWY7ZUFDSixzQkFBQSxHQUF1QixDQUF2QixHQUF5QixJQUF6QixHQUE2QixJQUFLLENBQUEsQ0FBQSxDQUFsQyxHQUFxQyxHQUFyQyxHQUF3QyxJQUFLLENBQUEsQ0FBQSxDQUE3QyxHQUFnRCxRQUpsRDs7SUFEVzs7aUNBT2IsSUFBQSxHQUFNLFNBQUE7QUFBRyxVQUFBOzZDQUFNLENBQUUsSUFBUixDQUFBO0lBQUg7O2lDQUVOLElBQUEsR0FBTSxTQUFBO01BQ0osSUFBQyxDQUFBLG1CQUFELENBQUE7O1FBQ0EsSUFBQyxDQUFBLFFBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO1VBQUEsSUFBQSxFQUFNLElBQU47U0FBN0I7O01BQ1YsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUE7YUFDQSxJQUFDLENBQUEsaUJBQUQsQ0FBQTtJQUpJOztpQ0FNTixNQUFBLEdBQVEsU0FBQTtBQUNOLFVBQUE7TUFBQSxvQ0FBUyxDQUFFLFNBQVIsQ0FBQSxVQUFIO2VBQ0UsSUFBQyxDQUFBLE1BQUQsQ0FBQSxFQURGO09BQUEsTUFBQTtlQUdFLElBQUMsQ0FBQSxJQUFELENBQUEsRUFIRjs7SUFETTs7aUNBTVIsU0FBQSxHQUFXLFNBQUMsSUFBRDtNQUNULElBQUMsQ0FBQSxNQUFELENBQUE7YUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLElBQUMsQ0FBQSxNQUFYLEVBQW1CLElBQW5CO0lBRlM7O2lDQUlYLFNBQUEsR0FBVyxTQUFBO2FBQ1QsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQURTOzs7O0tBcENvQjtBQUpqQyIsInNvdXJjZXNDb250ZW50IjpbIntTZWxlY3RMaXN0Vmlld30gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBMb2NhdGlvblNlbGVjdExpc3QgZXh0ZW5kcyBTZWxlY3RMaXN0Vmlld1xuICBpbml0aWFsaXplOiAoZWRpdG9yLCBjYWxsYmFjayktPlxuICAgIHN1cGVyXG4gICAgQGFkZENsYXNzKCdvdmVybGF5IGZyb20tdG9wJylcbiAgICBAZWRpdG9yID0gZWRpdG9yXG4gICAgQGNhbGxiYWNrID0gY2FsbGJhY2tcbiAgICBAc3RvcmVGb2N1c2VkRWxlbWVudCgpXG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcylcbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQGZvY3VzRmlsdGVyRWRpdG9yKClcblxuICB2aWV3Rm9ySXRlbTogKGl0ZW0pIC0+XG4gICAgaWYgaXRlbVswXSBpcyAnPHN0ZGluPidcbiAgICAgIFwiPGxpIGNsYXNzPVxcXCJldmVudFxcXCI+I3tpdGVtWzFdfToje2l0ZW1bMl19PC9saT5cIlxuICAgIGVsc2VcbiAgICAgIGYgPSBwYXRoLmpvaW4oaXRlbVswXSlcbiAgICAgIFwiPGxpIGNsYXNzPVxcXCJldmVudFxcXCI+I3tmfSAgI3tpdGVtWzFdfToje2l0ZW1bMl19PC9saT5cIlxuXG4gIGhpZGU6IC0+IEBwYW5lbD8uaGlkZSgpXG5cbiAgc2hvdzogLT5cbiAgICBAc3RvcmVGb2N1c2VkRWxlbWVudCgpXG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcylcbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQGZvY3VzRmlsdGVyRWRpdG9yKClcblxuICB0b2dnbGU6IC0+XG4gICAgaWYgQHBhbmVsPy5pc1Zpc2libGUoKVxuICAgICAgQGNhbmNlbCgpXG4gICAgZWxzZVxuICAgICAgQHNob3coKVxuXG4gIGNvbmZpcm1lZDogKGl0ZW0pIC0+XG4gICAgQGNhbmNlbCgpXG4gICAgQGNhbGxiYWNrKEBlZGl0b3IsIGl0ZW0pXG5cbiAgY2FuY2VsbGVkOiAtPlxuICAgIEBoaWRlKClcbiJdfQ==
