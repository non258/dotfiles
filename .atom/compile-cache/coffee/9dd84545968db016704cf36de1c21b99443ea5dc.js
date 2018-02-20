(function() {
  var CiteView, CompositeDisposable, LabelView, Latexer, LatexerHook;

  LabelView = require('./label-view');

  CiteView = require('./cite-view');

  LatexerHook = require('./latexer-hook');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = Latexer = {
    config: {
      parameters_to_search_citations_by: {
        type: "array",
        "default": ["title", "author"],
        items: {
          type: "string"
        }
      },
      autocomplete_environments: {
        type: "boolean",
        "default": true
      },
      autocomplete_references: {
        type: "boolean",
        "default": true
      },
      autocomplete_citations: {
        type: "boolean",
        "default": true
      }
    },
    activate: function() {
      var instance;
      instance = this;
      atom.commands.add("atom-text-editor", {
        "latexer:omnicomplete": function(event) {
          instance.latexHook.refCiteCheck(this.getModel(), true, true);
          return instance.latexHook.environmentCheck(this.getModel());
        },
        "latexer:insert-reference": function(event) {
          return instance.latexHook.lv.show(this.getModel());
        },
        "latexer:insert-citation": function(event) {
          return instance.latexHook.cv.show(this.getModel());
        }
      });
      return atom.workspace.observeTextEditors((function(_this) {
        return function(editor) {
          return _this.latexHook = new LatexerHook(editor);
        };
      })(this));
    },
    deactivate: function() {
      return this.latexHook.destroy();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2xhdGV4ZXIvbGliL2xhdGV4ZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxTQUFBLEdBQVksT0FBQSxDQUFRLGNBQVI7O0VBQ1osUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUNYLFdBQUEsR0FBYyxPQUFBLENBQVEsZ0JBQVI7O0VBQ2Isc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUd4QixNQUFNLENBQUMsT0FBUCxHQUFpQixPQUFBLEdBQ2Y7SUFBQSxNQUFBLEVBQ0U7TUFBQSxpQ0FBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLE9BQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLENBQUMsT0FBRCxFQUFVLFFBQVYsQ0FEVDtRQUVBLEtBQUEsRUFDRTtVQUFBLElBQUEsRUFBTSxRQUFOO1NBSEY7T0FERjtNQU1BLHlCQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sU0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFEVDtPQVBGO01BVUEsdUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO09BWEY7TUFjQSxzQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRFQ7T0FmRjtLQURGO0lBb0JBLFFBQUEsRUFBVSxTQUFBO0FBQ1IsVUFBQTtNQUFBLFFBQUEsR0FBVztNQUNYLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixrQkFBbEIsRUFDRTtRQUFBLHNCQUFBLEVBQXdCLFNBQUMsS0FBRDtVQUN0QixRQUFRLENBQUMsU0FBUyxDQUFDLFlBQW5CLENBQWdDLElBQUMsQ0FBQSxRQUFELENBQUEsQ0FBaEMsRUFBNkMsSUFBN0MsRUFBbUQsSUFBbkQ7aUJBQ0EsUUFBUSxDQUFDLFNBQVMsQ0FBQyxnQkFBbkIsQ0FBb0MsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUFwQztRQUZzQixDQUF4QjtRQUdBLDBCQUFBLEVBQTRCLFNBQUMsS0FBRDtpQkFDMUIsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBdEIsQ0FBMkIsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUEzQjtRQUQwQixDQUg1QjtRQUtBLHlCQUFBLEVBQTJCLFNBQUMsS0FBRDtpQkFDekIsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsSUFBdEIsQ0FBMkIsSUFBQyxDQUFBLFFBQUQsQ0FBQSxDQUEzQjtRQUR5QixDQUwzQjtPQURGO2FBUUEsSUFBSSxDQUFDLFNBQVMsQ0FBQyxrQkFBZixDQUFrQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsTUFBRDtpQkFDaEMsS0FBQyxDQUFBLFNBQUQsR0FBYSxJQUFJLFdBQUosQ0FBZ0IsTUFBaEI7UUFEbUI7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxDO0lBVlEsQ0FwQlY7SUFpQ0EsVUFBQSxFQUFZLFNBQUE7YUFDVixJQUFDLENBQUEsU0FBUyxDQUFDLE9BQVgsQ0FBQTtJQURVLENBakNaOztBQVBGIiwic291cmNlc0NvbnRlbnQiOlsiTGFiZWxWaWV3ID0gcmVxdWlyZSAnLi9sYWJlbC12aWV3J1xuQ2l0ZVZpZXcgPSByZXF1aXJlICcuL2NpdGUtdmlldydcbkxhdGV4ZXJIb29rID0gcmVxdWlyZSAnLi9sYXRleGVyLWhvb2snXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5cbm1vZHVsZS5leHBvcnRzID0gTGF0ZXhlciA9XG4gIGNvbmZpZzpcbiAgICBwYXJhbWV0ZXJzX3RvX3NlYXJjaF9jaXRhdGlvbnNfYnk6XG4gICAgICB0eXBlOiBcImFycmF5XCJcbiAgICAgIGRlZmF1bHQ6IFtcInRpdGxlXCIsIFwiYXV0aG9yXCJdXG4gICAgICBpdGVtczpcbiAgICAgICAgdHlwZTogXCJzdHJpbmdcIlxuXG4gICAgYXV0b2NvbXBsZXRlX2Vudmlyb25tZW50czpcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICBkZWZhdWx0OiB0cnVlXG5cbiAgICBhdXRvY29tcGxldGVfcmVmZXJlbmNlczpcbiAgICAgIHR5cGU6IFwiYm9vbGVhblwiXG4gICAgICBkZWZhdWx0OiB0cnVlXG5cbiAgICBhdXRvY29tcGxldGVfY2l0YXRpb25zOlxuICAgICAgdHlwZTogXCJib29sZWFuXCJcbiAgICAgIGRlZmF1bHQ6IHRydWVcblxuXG4gIGFjdGl2YXRlOiAtPlxuICAgIGluc3RhbmNlID0gdGhpc1xuICAgIGF0b20uY29tbWFuZHMuYWRkIFwiYXRvbS10ZXh0LWVkaXRvclwiLFxuICAgICAgXCJsYXRleGVyOm9tbmljb21wbGV0ZVwiOiAoZXZlbnQpLT5cbiAgICAgICAgaW5zdGFuY2UubGF0ZXhIb29rLnJlZkNpdGVDaGVjayBAZ2V0TW9kZWwoKSwgdHJ1ZSwgdHJ1ZVxuICAgICAgICBpbnN0YW5jZS5sYXRleEhvb2suZW52aXJvbm1lbnRDaGVjayBAZ2V0TW9kZWwoKVxuICAgICAgXCJsYXRleGVyOmluc2VydC1yZWZlcmVuY2VcIjogKGV2ZW50KS0+XG4gICAgICAgIGluc3RhbmNlLmxhdGV4SG9vay5sdi5zaG93IEBnZXRNb2RlbCgpXG4gICAgICBcImxhdGV4ZXI6aW5zZXJ0LWNpdGF0aW9uXCI6IChldmVudCktPlxuICAgICAgICBpbnN0YW5jZS5sYXRleEhvb2suY3Yuc2hvdyBAZ2V0TW9kZWwoKVxuICAgIGF0b20ud29ya3NwYWNlLm9ic2VydmVUZXh0RWRpdG9ycyAoZWRpdG9yKSA9PlxuICAgICAgQGxhdGV4SG9vayA9IG5ldyBMYXRleGVySG9vayhlZGl0b3IpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAbGF0ZXhIb29rLmRlc3Ryb3koKVxuIl19
