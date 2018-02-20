(function() {
  var $, FindLabels, LabelView, SelectListView, fs, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $ = ref.$, SelectListView = ref.SelectListView;

  FindLabels = require('./find-labels');

  fs = require('fs-plus');

  module.exports = LabelView = (function(superClass) {
    extend(LabelView, superClass);

    function LabelView() {
      return LabelView.__super__.constructor.apply(this, arguments);
    }

    LabelView.prototype.editor = null;

    LabelView.prototype.panel = null;

    LabelView.prototype.initialize = function() {
      LabelView.__super__.initialize.apply(this, arguments);
      return this.addClass('overlay from-top label-view');
    };

    LabelView.prototype.show = function(editor) {
      var absolutFilePath, basePath, error, file, labels, match, ref1, texRootRex, text;
      if (editor == null) {
        return;
      }
      this.editor = editor;
      file = editor != null ? (ref1 = editor.buffer) != null ? ref1.file : void 0 : void 0;
      basePath = file != null ? file.path : void 0;
      texRootRex = /%!TEX root = (.+)/g;
      while ((match = texRootRex.exec(this.editor.getText()))) {
        absolutFilePath = FindLabels.getAbsolutePath(basePath, match[1]);
        try {
          text = fs.readFileSync(absolutFilePath).toString();
          labels = FindLabels.getLabelsByText(text, absolutFilePath);
        } catch (error1) {
          error = error1;
          atom.notifications.addError('could not load content of ' + absolutFilePath, {
            dismissable: true
          });
          console.log(error);
        }
      }
      if (labels === void 0 || labels.length === 0) {
        labels = FindLabels.getLabelsByText(this.editor.getText(), basePath);
      }
      this.setItems(labels);
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.storeFocusedElement();
      return this.focusFilterEditor();
    };

    LabelView.prototype.hide = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.hide() : void 0;
    };

    LabelView.prototype.getEmptyMessage = function() {
      return "No labels found";
    };

    LabelView.prototype.getFilterKey = function() {
      return "label";
    };

    LabelView.prototype.viewForItem = function(arg) {
      var label;
      label = arg.label;
      return "<li>" + label + "</li>";
    };

    LabelView.prototype.confirmed = function(arg) {
      var label;
      label = arg.label;
      this.editor.insertText(label);
      this.restoreFocus();
      return this.hide();
    };

    LabelView.prototype.cancel = function() {
      LabelView.__super__.cancel.apply(this, arguments);
      return this.hide();
    };

    return LabelView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2xhdGV4ZXIvbGliL2xhYmVsLXZpZXcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxpREFBQTtJQUFBOzs7RUFBQSxNQUFxQixPQUFBLENBQVEsc0JBQVIsQ0FBckIsRUFBQyxTQUFELEVBQUc7O0VBQ0gsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUNiLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFFTCxNQUFNLENBQUMsT0FBUCxHQUNNOzs7Ozs7O3dCQUNKLE1BQUEsR0FBUTs7d0JBQ1IsS0FBQSxHQUFPOzt3QkFFUCxVQUFBLEdBQVksU0FBQTtNQUNWLDJDQUFBLFNBQUE7YUFDQSxJQUFDLENBQUEsUUFBRCxDQUFVLDZCQUFWO0lBRlU7O3dCQUlaLElBQUEsR0FBTSxTQUFDLE1BQUQ7QUFDSixVQUFBO01BQUEsSUFBYyxjQUFkO0FBQUEsZUFBQTs7TUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVO01BQ1YsSUFBQSx5REFBcUIsQ0FBRTtNQUN2QixRQUFBLGtCQUFXLElBQUksQ0FBRTtNQUNqQixVQUFBLEdBQWE7QUFDYixhQUFLLENBQUMsS0FBQSxHQUFRLFVBQVUsQ0FBQyxJQUFYLENBQWdCLElBQUMsQ0FBQSxNQUFNLENBQUMsT0FBUixDQUFBLENBQWhCLENBQVQsQ0FBTDtRQUNFLGVBQUEsR0FBa0IsVUFBVSxDQUFDLGVBQVgsQ0FBMkIsUUFBM0IsRUFBb0MsS0FBTSxDQUFBLENBQUEsQ0FBMUM7QUFDbEI7VUFDRSxJQUFBLEdBQU8sRUFBRSxDQUFDLFlBQUgsQ0FBZ0IsZUFBaEIsQ0FBZ0MsQ0FBQyxRQUFqQyxDQUFBO1VBQ1AsTUFBQSxHQUFTLFVBQVUsQ0FBQyxlQUFYLENBQTJCLElBQTNCLEVBQWlDLGVBQWpDLEVBRlg7U0FBQSxjQUFBO1VBR007VUFDSixJQUFJLENBQUMsYUFBYSxDQUFDLFFBQW5CLENBQTRCLDRCQUFBLEdBQThCLGVBQTFELEVBQTJFO1lBQUUsV0FBQSxFQUFhLElBQWY7V0FBM0U7VUFDQSxPQUFPLENBQUMsR0FBUixDQUFZLEtBQVosRUFMRjs7TUFGRjtNQVFBLElBQUcsTUFBQSxLQUFVLE1BQVYsSUFBdUIsTUFBTSxDQUFDLE1BQVAsS0FBaUIsQ0FBM0M7UUFDRSxNQUFBLEdBQVMsVUFBVSxDQUFDLGVBQVgsQ0FBMkIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxPQUFSLENBQUEsQ0FBM0IsRUFBOEMsUUFBOUMsRUFEWDs7TUFFQSxJQUFDLENBQUEsUUFBRCxDQUFVLE1BQVY7O1FBQ0EsSUFBQyxDQUFBLFFBQVMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFmLENBQTZCO1VBQUEsSUFBQSxFQUFNLElBQU47U0FBN0I7O01BQ1YsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQUE7TUFDQSxJQUFDLENBQUEsbUJBQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO0lBcEJJOzt3QkFzQk4sSUFBQSxHQUFNLFNBQUE7QUFDSixVQUFBOytDQUFNLENBQUUsSUFBUixDQUFBO0lBREk7O3dCQUdOLGVBQUEsR0FBaUIsU0FBQTthQUNmO0lBRGU7O3dCQUdqQixZQUFBLEdBQWMsU0FBQTthQUNaO0lBRFk7O3dCQUdkLFdBQUEsR0FBYSxTQUFDLEdBQUQ7QUFDVixVQUFBO01BRFksUUFBRDthQUNYLE1BQUEsR0FBTyxLQUFQLEdBQWE7SUFESDs7d0JBR2IsU0FBQSxHQUFXLFNBQUMsR0FBRDtBQUNULFVBQUE7TUFEVyxRQUFEO01BQ1YsSUFBQyxDQUFBLE1BQU0sQ0FBQyxVQUFSLENBQW1CLEtBQW5CO01BQ0EsSUFBQyxDQUFBLFlBQUQsQ0FBQTthQUNBLElBQUMsQ0FBQSxJQUFELENBQUE7SUFIUzs7d0JBS1gsTUFBQSxHQUFRLFNBQUE7TUFDTix1Q0FBQSxTQUFBO2FBQ0EsSUFBQyxDQUFBLElBQUQsQ0FBQTtJQUZNOzs7O0tBL0NjO0FBTHhCIiwic291cmNlc0NvbnRlbnQiOlsieyQsU2VsZWN0TGlzdFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5GaW5kTGFiZWxzID0gcmVxdWlyZSAnLi9maW5kLWxhYmVscydcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcblxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgTGFiZWxWaWV3IGV4dGVuZHMgU2VsZWN0TGlzdFZpZXdcbiAgZWRpdG9yOiBudWxsXG4gIHBhbmVsOiBudWxsXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEBhZGRDbGFzcygnb3ZlcmxheSBmcm9tLXRvcCBsYWJlbC12aWV3JylcblxuICBzaG93OiAoZWRpdG9yKSAtPlxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yP1xuICAgIEBlZGl0b3IgPSBlZGl0b3JcbiAgICBmaWxlID0gZWRpdG9yPy5idWZmZXI/LmZpbGVcbiAgICBiYXNlUGF0aCA9IGZpbGU/LnBhdGhcbiAgICB0ZXhSb290UmV4ID0gLyUhVEVYIHJvb3QgPSAoLispL2dcbiAgICB3aGlsZShtYXRjaCA9IHRleFJvb3RSZXguZXhlYyhAZWRpdG9yLmdldFRleHQoKSkpXG4gICAgICBhYnNvbHV0RmlsZVBhdGggPSBGaW5kTGFiZWxzLmdldEFic29sdXRlUGF0aChiYXNlUGF0aCxtYXRjaFsxXSlcbiAgICAgIHRyeVxuICAgICAgICB0ZXh0ID0gZnMucmVhZEZpbGVTeW5jKGFic29sdXRGaWxlUGF0aCkudG9TdHJpbmcoKVxuICAgICAgICBsYWJlbHMgPSBGaW5kTGFiZWxzLmdldExhYmVsc0J5VGV4dCh0ZXh0LCBhYnNvbHV0RmlsZVBhdGgpXG4gICAgICBjYXRjaCBlcnJvclxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IoJ2NvdWxkIG5vdCBsb2FkIGNvbnRlbnQgb2YgJysgYWJzb2x1dEZpbGVQYXRoLCB7IGRpc21pc3NhYmxlOiB0cnVlIH0pXG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yKVxuICAgIGlmIGxhYmVscyA9PSB1bmRlZmluZWQgb3IgbGFiZWxzLmxlbmd0aCA9PSAwXG4gICAgICBsYWJlbHMgPSBGaW5kTGFiZWxzLmdldExhYmVsc0J5VGV4dChAZWRpdG9yLmdldFRleHQoKSwgYmFzZVBhdGgpXG4gICAgQHNldEl0ZW1zKGxhYmVscylcbiAgICBAcGFuZWwgPz0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiB0aGlzKVxuICAgIEBwYW5lbC5zaG93KClcbiAgICBAc3RvcmVGb2N1c2VkRWxlbWVudCgpXG4gICAgQGZvY3VzRmlsdGVyRWRpdG9yKClcblxuICBoaWRlOiAtPlxuICAgIEBwYW5lbD8uaGlkZSgpXG5cbiAgZ2V0RW1wdHlNZXNzYWdlOiAtPlxuICAgIFwiTm8gbGFiZWxzIGZvdW5kXCJcblxuICBnZXRGaWx0ZXJLZXk6IC0+XG4gICAgXCJsYWJlbFwiXG5cbiAgdmlld0Zvckl0ZW06ICh7bGFiZWx9KSAtPlxuICAgICBcIjxsaT4je2xhYmVsfTwvbGk+XCJcblxuICBjb25maXJtZWQ6ICh7bGFiZWx9KSAtPlxuICAgIEBlZGl0b3IuaW5zZXJ0VGV4dCBsYWJlbFxuICAgIEByZXN0b3JlRm9jdXMoKVxuICAgIEBoaWRlKClcblxuICBjYW5jZWw6IC0+XG4gICAgc3VwZXJcbiAgICBAaGlkZSgpXG4iXX0=
