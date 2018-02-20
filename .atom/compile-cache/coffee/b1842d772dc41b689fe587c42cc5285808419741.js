
/*
  lib/main.coffee
 */

(function() {
  var MarkdownScrlSync, SubAtom, log, mix,
    slice = [].slice;

  log = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return console.log.apply(console, ['markdown-scroll, main:'].concat(args));
  };

  SubAtom = require('sub-atom');

  MarkdownScrlSync = (function() {
    function MarkdownScrlSync() {}

    MarkdownScrlSync.prototype.activate = function(state) {
      var MarkdownPreviewView, TextEditor, pathUtil, prvwPkg, viewPath;
      pathUtil = require('path');
      TextEditor = require('atom').TextEditor;
      this.subs = new SubAtom;
      if (!(prvwPkg = atom.packages.getLoadedPackage('markdown-preview')) && !(prvwPkg = atom.packages.getLoadedPackage('markdown-preview-plus'))) {
        log('markdown preview package not found');
        return;
      }
      viewPath = pathUtil.join(prvwPkg.path, 'lib/markdown-preview-view');
      MarkdownPreviewView = require(viewPath);
      return this.subs.add(atom.workspace.observeActivePaneItem((function(_this) {
        return function(editor) {
          var i, isMarkdown, len, previewView, ref;
          isMarkdown = function(editor) {
            var fext, fpath, i, len, name, path, ref, ref1, ref2;
            ref = ["GitHub Markdown", "CoffeeScript (Literate)"];
            for (i = 0, len = ref.length; i < len; i++) {
              name = ref[i];
              if (((ref1 = editor.getGrammar()) != null ? ref1.name : void 0) === name) {
                return true;
              }
            }
            if ((path = editor.getPath())) {
              ref2 = path.split('.'), fpath = ref2[0], fext = ref2[ref2.length - 1];
              if (fext.toLowerCase() === 'md') {
                return true;
              }
            }
            return false;
          };
          if (editor instanceof TextEditor && editor.alive && isMarkdown(editor)) {
            _this.stopTracking();
            ref = atom.workspace.getPaneItems();
            for (i = 0, len = ref.length; i < len; i++) {
              previewView = ref[i];
              if (previewView instanceof MarkdownPreviewView && previewView.editor === editor) {
                _this.startTracking(editor, previewView);
                break;
              }
            }
            return null;
          }
        };
      })(this)));
    };

    MarkdownScrlSync.prototype.startTracking = function(editor1, previewView) {
      this.editor = editor1;
      this.editorView = atom.views.getView(this.editor);
      this.previewEle = previewView.element;
      this.chrHgt = this.editor.getLineHeightInPixels();
      this.lastScrnRow = null;
      this.lastChrOfs = 0;
      this.setMap();
      this.chkScroll('init');
      this.subs2 = new SubAtom;
      this.subs2.add(this.editor.onDidStopChanging((function(_this) {
        return function() {
          _this.setMap();
          return _this.chkScroll('changed');
        };
      })(this)));
      this.subs2.add(this.editor.onDidChangeCursorPosition((function(_this) {
        return function() {
          return _this.chkScroll('cursorMoved');
        };
      })(this)));
      this.subs2.add(this.editorView.onDidChangeScrollTop((function(_this) {
        return function() {
          return _this.chkScroll('newtop');
        };
      })(this)));
      return this.subs2.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.stopTracking();
        };
      })(this)));
    };

    MarkdownScrlSync.prototype.stopTracking = function() {
      if (this.subs2) {
        this.subs2.dispose();
      }
      return this.subs2 = null;
    };

    MarkdownScrlSync.prototype.deactivate = function() {
      this.stopTracking();
      return this.subs.dispose();
    };

    return MarkdownScrlSync;

  })();

  mix = function(mixinName) {
    var i, key, len, mixin, ref, results;
    mixin = require('./' + mixinName);
    ref = Object.keys(mixin);
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      key = ref[i];
      results.push(MarkdownScrlSync.prototype[key] = mixin[key]);
    }
    return results;
  };

  mix('map');

  mix('scroll');

  mix('utils');

  module.exports = new MarkdownScrlSync;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXNjcm9sbC1zeW5jL2xpYi9tYWluLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUE7Ozs7QUFBQTtBQUFBLE1BQUEsbUNBQUE7SUFBQTs7RUFJQSxHQUFBLEdBQU0sU0FBQTtBQUNKLFFBQUE7SUFESztXQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBWixDQUFrQixPQUFsQixFQUEyQixDQUFDLHdCQUFELENBQTBCLENBQUMsTUFBM0IsQ0FBa0MsSUFBbEMsQ0FBM0I7RUFESTs7RUFHTixPQUFBLEdBQVcsT0FBQSxDQUFRLFVBQVI7O0VBRUw7OzsrQkFFSixRQUFBLEdBQVUsU0FBQyxLQUFEO0FBQ1IsVUFBQTtNQUFBLFFBQUEsR0FBZSxPQUFBLENBQVEsTUFBUjtNQUNkLGFBQWMsT0FBQSxDQUFRLE1BQVI7TUFDZixJQUFDLENBQUEsSUFBRCxHQUFlLElBQUk7TUFFbkIsSUFBRyxDQUFJLENBQUMsT0FBQSxHQUFVLElBQUksQ0FBQyxRQUFRLENBQUMsZ0JBQWQsQ0FBK0Isa0JBQS9CLENBQVgsQ0FBSixJQUNBLENBQUksQ0FBQyxPQUFBLEdBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZCxDQUErQix1QkFBL0IsQ0FBWCxDQURQO1FBRUUsR0FBQSxDQUFJLG9DQUFKO0FBQ0EsZUFIRjs7TUFLQSxRQUFBLEdBQVcsUUFBUSxDQUFDLElBQVQsQ0FBYyxPQUFPLENBQUMsSUFBdEIsRUFBNEIsMkJBQTVCO01BQ1gsbUJBQUEsR0FBdUIsT0FBQSxDQUFRLFFBQVI7YUFFdkIsSUFBQyxDQUFBLElBQUksQ0FBQyxHQUFOLENBQVUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxxQkFBZixDQUFxQyxDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsTUFBRDtBQUM3QyxjQUFBO1VBQUEsVUFBQSxHQUFhLFNBQUMsTUFBRDtBQUNYLGdCQUFBO0FB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QyxPQUFOLENBQUE7SUFGVTs7Ozs7O0VBSWQsR0FBQSxHQUFNLFNBQUMsU0FBRDtBQUNKLFFBQUE7SUFBQSxLQUFBLEdBQVEsT0FBQSxDQUFRLElBQUEsR0FBTyxTQUFmO0FBQ1I7QUFBQTtTQUFBLHFDQUFBOzttQkFDRSxnQkFBZ0IsQ0FBQyxTQUFVLENBQUEsR0FBQSxDQUEzQixHQUFrQyxLQUFNLENBQUEsR0FBQTtBQUQxQzs7RUFGSTs7RUFLTixHQUFBLENBQUksS0FBSjs7RUFDQSxHQUFBLENBQUksUUFBSjs7RUFDQSxHQUFBLENBQUksT0FBSjs7RUFFQSxNQUFNLENBQUMsT0FBUCxHQUFpQixJQUFJO0FBN0VyQiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuICBsaWIvbWFpbi5jb2ZmZWVcbiMjI1xuXG5sb2cgPSAoYXJncy4uLikgLT4gXG4gIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUsIFsnbWFya2Rvd24tc2Nyb2xsLCBtYWluOiddLmNvbmNhdCBhcmdzXG5cblN1YkF0b20gID0gcmVxdWlyZSAnc3ViLWF0b20nXG5cbmNsYXNzIE1hcmtkb3duU2NybFN5bmNcbiAgXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgcGF0aFV0aWwgICAgID0gcmVxdWlyZSAncGF0aCdcbiAgICB7VGV4dEVkaXRvcn0gPSByZXF1aXJlICdhdG9tJ1xuICAgIEBzdWJzICAgICAgICA9IG5ldyBTdWJBdG9tXG5cbiAgICBpZiBub3QgKHBydndQa2cgPSBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UgJ21hcmtkb3duLXByZXZpZXcnKSBhbmRcbiAgICAgICBub3QgKHBydndQa2cgPSBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UgJ21hcmtkb3duLXByZXZpZXctcGx1cycpXG4gICAgICBsb2cgJ21hcmtkb3duIHByZXZpZXcgcGFja2FnZSBub3QgZm91bmQnXG4gICAgICByZXR1cm5cblxuICAgIHZpZXdQYXRoID0gcGF0aFV0aWwuam9pbiBwcnZ3UGtnLnBhdGgsICdsaWIvbWFya2Rvd24tcHJldmlldy12aWV3J1xuICAgIE1hcmtkb3duUHJldmlld1ZpZXcgID0gcmVxdWlyZSB2aWV3UGF0aFxuICAgIFxuICAgIEBzdWJzLmFkZCBhdG9tLndvcmtzcGFjZS5vYnNlcnZlQWN0aXZlUGFuZUl0ZW0gKGVkaXRvcikgPT5cbiAgICAgIGlzTWFya2Rvd24gPSAoZWRpdG9yKS0+XG4gICAgICAgIGZvciBuYW1lIGluIFtcIkdpdEh1YiBNYXJrZG93blwiLCBcIkNvZmZlZVNjcmlwdCAoTGl0ZXJhdGUpXCJdXG4gICAgICAgICAgcmV0dXJuIHRydWUgaWYgZWRpdG9yLmdldEdyYW1tYXIoKT8ubmFtZSBpcyBuYW1lXG4gICAgICAgIGlmKHBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpKVxuICAgICAgICAgIFtmcGF0aCwgLi4uLCBmZXh0XSA9IHBhdGguc3BsaXQoJy4nKVxuICAgICAgICAgIHJldHVybiB0cnVlIGlmIGZleHQudG9Mb3dlckNhc2UoKSBpcyAnbWQnXG4gICAgICAgIGZhbHNlXG4gICAgICBpZiBlZGl0b3IgaW5zdGFuY2VvZiBUZXh0RWRpdG9yIGFuZFxuICAgICAgICAgZWRpdG9yLmFsaXZlICAgICAgICAgICAgICAgICBhbmRcbiAgICAgICAgIGlzTWFya2Rvd24oZWRpdG9yKVxuICAgICAgICBAc3RvcFRyYWNraW5nKClcbiAgICAgICAgZm9yIHByZXZpZXdWaWV3IGluIGF0b20ud29ya3NwYWNlLmdldFBhbmVJdGVtcygpIFxuICAgICAgICAgIGlmIHByZXZpZXdWaWV3IGluc3RhbmNlb2YgTWFya2Rvd25QcmV2aWV3VmlldyBhbmQgXG4gICAgICAgICAgICAgcHJldmlld1ZpZXcuZWRpdG9yIGlzIGVkaXRvclxuICAgICAgICAgICAgQHN0YXJ0VHJhY2tpbmcgZWRpdG9yLCBwcmV2aWV3Vmlld1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgbnVsbFxuXG4gIHN0YXJ0VHJhY2tpbmc6IChAZWRpdG9yLCBwcmV2aWV3VmlldykgLT5cbiAgICBAZWRpdG9yVmlldyAgICA9IGF0b20udmlld3MuZ2V0VmlldyBAZWRpdG9yXG4gICAgQHByZXZpZXdFbGUgICAgPSBwcmV2aWV3Vmlldy5lbGVtZW50XG4gICAgXG4gICAgQGNockhndCA9IEBlZGl0b3IuZ2V0TGluZUhlaWdodEluUGl4ZWxzKClcbiAgICBAbGFzdFNjcm5Sb3cgPSBudWxsXG4gICAgQGxhc3RDaHJPZnMgID0gMFxuICAgIFxuICAgIEBzZXRNYXAoKVxuICAgIEBjaGtTY3JvbGwgJ2luaXQnXG4gICAgXG4gICAgQHN1YnMyID0gbmV3IFN1YkF0b21cbiAgICBAc3ViczIuYWRkIEBlZGl0b3IgICAgLm9uRGlkU3RvcENoYW5naW5nICAgICAgICAgPT4gQHNldE1hcCgpOyBAY2hrU2Nyb2xsICdjaGFuZ2VkJ1xuICAgIEBzdWJzMi5hZGQgQGVkaXRvciAgICAub25EaWRDaGFuZ2VDdXJzb3JQb3NpdGlvbiA9PiBAY2hrU2Nyb2xsICdjdXJzb3JNb3ZlZCdcbiAgICBAc3ViczIuYWRkIEBlZGl0b3JWaWV3Lm9uRGlkQ2hhbmdlU2Nyb2xsVG9wICAgICAgPT4gQGNoa1Njcm9sbCAnbmV3dG9wJ1xuICAgIEBzdWJzMi5hZGQgQGVkaXRvciAgICAub25EaWREZXN0cm95ICAgICAgICAgICAgICA9PiBAc3RvcFRyYWNraW5nKClcbiAgICBcbiAgc3RvcFRyYWNraW5nOiAtPlxuICAgIEBzdWJzMi5kaXNwb3NlKCkgaWYgQHN1YnMyXG4gICAgQHN1YnMyID0gbnVsbFxuICAgICAgXG4gIGRlYWN0aXZhdGU6IC0+IFxuICAgIEBzdG9wVHJhY2tpbmcoKVxuICAgIEBzdWJzLmRpc3Bvc2UoKVxuXG5taXggPSAobWl4aW5OYW1lKSAtPlxuICBtaXhpbiA9IHJlcXVpcmUgJy4vJyArIG1peGluTmFtZVxuICBmb3Iga2V5IGluIE9iamVjdC5rZXlzIG1peGluXG4gICAgTWFya2Rvd25TY3JsU3luYy5wcm90b3R5cGVba2V5XSA9IG1peGluW2tleV1cblxubWl4ICdtYXAnXG5taXggJ3Njcm9sbCdcbm1peCAndXRpbHMnXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IE1hcmtkb3duU2NybFN5bmNcbiJdfQ==
