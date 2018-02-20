(function() {
  var $$, BufferedProcess, SelectListView, TagCreateView, TagListView, TagView, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  BufferedProcess = require('atom').BufferedProcess;

  ref = require('atom-space-pen-views'), $$ = ref.$$, SelectListView = ref.SelectListView;

  TagView = require('./tag-view');

  TagCreateView = require('./tag-create-view');

  module.exports = TagListView = (function(superClass) {
    extend(TagListView, superClass);

    function TagListView() {
      return TagListView.__super__.constructor.apply(this, arguments);
    }

    TagListView.prototype.initialize = function(repo, data) {
      this.repo = repo;
      this.data = data != null ? data : '';
      TagListView.__super__.initialize.apply(this, arguments);
      this.show();
      return this.parseData();
    };

    TagListView.prototype.parseData = function() {
      var item, items, tmp;
      if (this.data.length > 0) {
        this.data = this.data.split("\n").slice(0, -1);
        items = (function() {
          var i, len, ref1, results;
          ref1 = this.data.reverse();
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            item = ref1[i];
            if (!(item !== '')) {
              continue;
            }
            tmp = item.match(/([\w\d-_\/.]+)\s(.*)/);
            results.push({
              tag: tmp != null ? tmp[1] : void 0,
              annotation: tmp != null ? tmp[2] : void 0
            });
          }
          return results;
        }).call(this);
      } else {
        items = [];
      }
      items.push({
        tag: '+ Add Tag',
        annotation: 'Add a tag referencing the current commit.'
      });
      this.setItems(items);
      return this.focusFilterEditor();
    };

    TagListView.prototype.getFilterKey = function() {
      return 'tag';
    };

    TagListView.prototype.show = function() {
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      return this.storeFocusedElement();
    };

    TagListView.prototype.cancelled = function() {
      return this.hide();
    };

    TagListView.prototype.hide = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.destroy() : void 0;
    };

    TagListView.prototype.viewForItem = function(arg) {
      var annotation, tag;
      tag = arg.tag, annotation = arg.annotation;
      return $$(function() {
        return this.li((function(_this) {
          return function() {
            _this.div({
              "class": 'text-highlight'
            }, tag);
            return _this.div({
              "class": 'text-warning'
            }, annotation);
          };
        })(this));
      });
    };

    TagListView.prototype.confirmed = function(arg) {
      var tag;
      tag = arg.tag;
      this.cancel();
      if (tag === '+ Add Tag') {
        return new TagCreateView(this.repo);
      } else {
        return new TagView(this.repo, tag);
      }
    };

    return TagListView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi92aWV3cy90YWctbGlzdC12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsNkVBQUE7SUFBQTs7O0VBQUMsa0JBQW1CLE9BQUEsQ0FBUSxNQUFSOztFQUNwQixNQUF1QixPQUFBLENBQVEsc0JBQVIsQ0FBdkIsRUFBQyxXQUFELEVBQUs7O0VBRUwsT0FBQSxHQUFVLE9BQUEsQ0FBUSxZQUFSOztFQUNWLGFBQUEsR0FBZ0IsT0FBQSxDQUFRLG1CQUFSOztFQUVoQixNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7OzBCQUVKLFVBQUEsR0FBWSxTQUFDLElBQUQsRUFBUSxJQUFSO01BQUMsSUFBQyxDQUFBLE9BQUQ7TUFBTyxJQUFDLENBQUEsc0JBQUQsT0FBTTtNQUN4Qiw2Q0FBQSxTQUFBO01BQ0EsSUFBQyxDQUFBLElBQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxTQUFELENBQUE7SUFIVTs7MEJBS1osU0FBQSxHQUFXLFNBQUE7QUFDVCxVQUFBO01BQUEsSUFBRyxJQUFDLENBQUEsSUFBSSxDQUFDLE1BQU4sR0FBZSxDQUFsQjtRQUNFLElBQUMsQ0FBQSxJQUFELEdBQVEsSUFBQyxDQUFBLElBQUksQ0FBQyxLQUFOLENBQVksSUFBWixDQUFrQjtRQUMxQixLQUFBOztBQUNFO0FBQUE7ZUFBQSxzQ0FBQTs7a0JBQWlDLElBQUEsS0FBUTs7O1lBQ3ZDLEdBQUEsR0FBTSxJQUFJLENBQUMsS0FBTCxDQUFXLHNCQUFYO3lCQUNOO2NBQUMsR0FBQSxnQkFBSyxHQUFLLENBQUEsQ0FBQSxVQUFYO2NBQWUsVUFBQSxnQkFBWSxHQUFLLENBQUEsQ0FBQSxVQUFoQzs7QUFGRjs7c0JBSEo7T0FBQSxNQUFBO1FBUUUsS0FBQSxHQUFRLEdBUlY7O01BVUEsS0FBSyxDQUFDLElBQU4sQ0FBVztRQUFDLEdBQUEsRUFBSyxXQUFOO1FBQW1CLFVBQUEsRUFBWSwyQ0FBL0I7T0FBWDtNQUNBLElBQUMsQ0FBQSxRQUFELENBQVUsS0FBVjthQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO0lBYlM7OzBCQWVYLFlBQUEsR0FBYyxTQUFBO2FBQUc7SUFBSDs7MEJBRWQsSUFBQSxHQUFNLFNBQUE7O1FBQ0osSUFBQyxDQUFBLFFBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO1VBQUEsSUFBQSxFQUFNLElBQU47U0FBN0I7O01BQ1YsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUE7YUFDQSxJQUFDLENBQUEsbUJBQUQsQ0FBQTtJQUhJOzswQkFLTixTQUFBLEdBQVcsU0FBQTthQUFHLElBQUMsQ0FBQSxJQUFELENBQUE7SUFBSDs7MEJBRVgsSUFBQSxHQUFNLFNBQUE7QUFBRyxVQUFBOytDQUFNLENBQUUsT0FBUixDQUFBO0lBQUg7OzBCQUVOLFdBQUEsR0FBYSxTQUFDLEdBQUQ7QUFDWCxVQUFBO01BRGEsZUFBSzthQUNsQixFQUFBLENBQUcsU0FBQTtlQUNELElBQUMsQ0FBQSxFQUFELENBQUksQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQTtZQUNGLEtBQUMsQ0FBQSxHQUFELENBQUs7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLGdCQUFQO2FBQUwsRUFBOEIsR0FBOUI7bUJBQ0EsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sY0FBUDthQUFMLEVBQTRCLFVBQTVCO1VBRkU7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUo7TUFEQyxDQUFIO0lBRFc7OzBCQU1iLFNBQUEsR0FBVyxTQUFDLEdBQUQ7QUFDVCxVQUFBO01BRFcsTUFBRDtNQUNWLElBQUMsQ0FBQSxNQUFELENBQUE7TUFDQSxJQUFHLEdBQUEsS0FBTyxXQUFWO2VBQ0UsSUFBSSxhQUFKLENBQWtCLElBQUMsQ0FBQSxJQUFuQixFQURGO09BQUEsTUFBQTtlQUdFLElBQUksT0FBSixDQUFZLElBQUMsQ0FBQSxJQUFiLEVBQW1CLEdBQW5CLEVBSEY7O0lBRlM7Ozs7S0F2Q2E7QUFQMUIiLCJzb3VyY2VzQ29udGVudCI6WyJ7QnVmZmVyZWRQcm9jZXNzfSA9IHJlcXVpcmUgJ2F0b20nXG57JCQsIFNlbGVjdExpc3RWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuXG5UYWdWaWV3ID0gcmVxdWlyZSAnLi90YWctdmlldydcblRhZ0NyZWF0ZVZpZXcgPSByZXF1aXJlICcuL3RhZy1jcmVhdGUtdmlldydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgVGFnTGlzdFZpZXcgZXh0ZW5kcyBTZWxlY3RMaXN0Vmlld1xuXG4gIGluaXRpYWxpemU6IChAcmVwbywgQGRhdGE9JycpIC0+XG4gICAgc3VwZXJcbiAgICBAc2hvdygpXG4gICAgQHBhcnNlRGF0YSgpXG5cbiAgcGFyc2VEYXRhOiAtPlxuICAgIGlmIEBkYXRhLmxlbmd0aCA+IDBcbiAgICAgIEBkYXRhID0gQGRhdGEuc3BsaXQoXCJcXG5cIilbLi4uLTFdXG4gICAgICBpdGVtcyA9IChcbiAgICAgICAgZm9yIGl0ZW0gaW4gQGRhdGEucmV2ZXJzZSgpIHdoZW4gaXRlbSAhPSAnJ1xuICAgICAgICAgIHRtcCA9IGl0ZW0ubWF0Y2ggLyhbXFx3XFxkLV8vLl0rKVxccyguKikvXG4gICAgICAgICAge3RhZzogdG1wP1sxXSwgYW5ub3RhdGlvbjogdG1wP1syXX1cbiAgICAgIClcbiAgICBlbHNlXG4gICAgICBpdGVtcyA9IFtdXG5cbiAgICBpdGVtcy5wdXNoIHt0YWc6ICcrIEFkZCBUYWcnLCBhbm5vdGF0aW9uOiAnQWRkIGEgdGFnIHJlZmVyZW5jaW5nIHRoZSBjdXJyZW50IGNvbW1pdC4nfVxuICAgIEBzZXRJdGVtcyBpdGVtc1xuICAgIEBmb2N1c0ZpbHRlckVkaXRvcigpXG5cbiAgZ2V0RmlsdGVyS2V5OiAtPiAndGFnJ1xuXG4gIHNob3c6IC0+XG4gICAgQHBhbmVsID89IGF0b20ud29ya3NwYWNlLmFkZE1vZGFsUGFuZWwoaXRlbTogdGhpcylcbiAgICBAcGFuZWwuc2hvdygpXG4gICAgQHN0b3JlRm9jdXNlZEVsZW1lbnQoKVxuXG4gIGNhbmNlbGxlZDogLT4gQGhpZGUoKVxuXG4gIGhpZGU6IC0+IEBwYW5lbD8uZGVzdHJveSgpXG5cbiAgdmlld0Zvckl0ZW06ICh7dGFnLCBhbm5vdGF0aW9ufSkgLT5cbiAgICAkJCAtPlxuICAgICAgQGxpID0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICd0ZXh0LWhpZ2hsaWdodCcsIHRhZ1xuICAgICAgICBAZGl2IGNsYXNzOiAndGV4dC13YXJuaW5nJywgYW5ub3RhdGlvblxuXG4gIGNvbmZpcm1lZDogKHt0YWd9KSAtPlxuICAgIEBjYW5jZWwoKVxuICAgIGlmIHRhZyBpcyAnKyBBZGQgVGFnJ1xuICAgICAgbmV3IFRhZ0NyZWF0ZVZpZXcoQHJlcG8pXG4gICAgZWxzZVxuICAgICAgbmV3IFRhZ1ZpZXcoQHJlcG8sIHRhZylcbiJdfQ==
