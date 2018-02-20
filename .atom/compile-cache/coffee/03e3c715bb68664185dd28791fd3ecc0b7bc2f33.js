(function() {
  var CiteView, CompositeDisposable, LabelView, LatexerHook;

  CompositeDisposable = require('atom').CompositeDisposable;

  LabelView = require('./label-view');

  CiteView = require('./cite-view');

  module.exports = LatexerHook = (function() {
    LatexerHook.prototype.beginRex = /\\begin{([^}]+)}/;

    LatexerHook.prototype.mathRex = /(\\+)\[/;

    LatexerHook.prototype.refRex = /\\\w*ref({|{[^}]+,)$/;

    LatexerHook.prototype.citeRex = /\\(cite|textcite|onlinecite|citet|citep|citet\*|citep\*)(\[[^\]]+\])?({|{[^}]+,)$/;

    function LatexerHook(editor1) {
      this.editor = editor1;
      this.disposables = new CompositeDisposable;
      this.disposables.add(this.editor.onDidChangeTitle((function(_this) {
        return function() {
          return _this.subscribeBuffer();
        };
      })(this)));
      this.disposables.add(this.editor.onDidChangePath((function(_this) {
        return function() {
          return _this.subscribeBuffer();
        };
      })(this)));
      this.disposables.add(this.editor.onDidSave((function(_this) {
        return function() {
          return _this.subscribeBuffer();
        };
      })(this)));
      this.disposables.add(this.editor.onDidDestroy(this.destroy.bind(this)));
      this.subscribeBuffer();
      this.lv = new LabelView;
      this.cv = new CiteView;
    }

    LatexerHook.prototype.destroy = function() {
      var ref, ref1;
      this.unsubscribeBuffer();
      this.disposables.dispose();
      if ((ref = this.lv) != null) {
        ref.hide();
      }
      return (ref1 = this.cv) != null ? ref1.hide() : void 0;
    };

    LatexerHook.prototype.subscribeBuffer = function() {
      var ref, title;
      this.unsubscribeBuffer();
      if (this.editor == null) {
        return;
      }
      title = (ref = this.editor) != null ? ref.getTitle() : void 0;
      if (!((title != null) && title.match(/\.tex$/))) {
        return;
      }
      this.buffer = this.editor.getBuffer();
      return this.disposableBuffer = this.buffer.onDidStopChanging((function(_this) {
        return function() {
          return _this.editorHook();
        };
      })(this));
    };

    LatexerHook.prototype.unsubscribeBuffer = function() {
      var ref;
      if ((ref = this.disposableBuffer) != null) {
        ref.dispose();
      }
      return this.buffer = null;
    };

    LatexerHook.prototype.refCiteCheck = function(editor, refOpt, citeOpt) {
      var line, match, pos;
      pos = editor.getCursorBufferPosition().toArray();
      line = editor.getTextInBufferRange([[pos[0], 0], pos]);
      if (refOpt && (match = line.match(this.refRex))) {
        this.lv.show(editor);
      }
      if (citeOpt && (match = line.match(this.citeRex))) {
        return this.cv.show(editor);
      }
    };

    LatexerHook.prototype.environmentCheck = function(editor) {
      var balanceAfter, balanceBefore, beginText, beginTextRex, endText, endTextRex, lineCount, match, pos, posBefore, preText, previousLine, remainingText;
      pos = editor.getCursorBufferPosition().toArray();
      if (pos[0] <= 0) {
        return;
      }
      previousLine = editor.lineTextForBufferRow(pos[0] - 1);
      if ((match = this.beginRex.exec(previousLine))) {
        beginText = "\\begin{" + match[1] + "}";
        endText = "\\end{" + match[1] + "}";
        beginTextRex = new RegExp(beginText.replace(/([()[{*+.$^\\|?])/g, "\\$1"), "gm");
        endTextRex = new RegExp(endText.replace(/([()[{*+.$^\\|?])/g, "\\$1"), "gm");
      } else if ((match = this.mathRex.exec(previousLine)) && match[1].length % 2) {
        beginText = "\\[";
        endText = "\\]";
        beginTextRex = new RegExp("\\\\\\[", "gm");
        endTextRex = new RegExp("\\\\\\]", "gm");
      } else {
        return;
      }
      lineCount = editor.getLineCount();
      preText = editor.getTextInBufferRange([[0, 0], [pos[0], 0]]).replace(/%.+$/gm, "");
      remainingText = editor.getTextInBufferRange([[pos[0], 0], [lineCount + 1, 0]]).replace(/%.+$/gm, "");
      balanceBefore = (preText.match(beginTextRex) || []).length - (preText.match(endTextRex) || []).length;
      balanceAfter = (remainingText.match(beginTextRex) || []).length - (remainingText.match(endTextRex) || []).length;
      if (balanceBefore + balanceAfter < 1) {
        return;
      }
      posBefore = editor.getCursorBufferPosition();
      editor.insertText(endText);
      editor.moveUp(1);
      editor.moveToEndOfLine();
      return editor.insertText("\n");
    };

    LatexerHook.prototype.editorHook = function(editor) {
      var citeOpt, envOpt, refOpt;
      if (editor == null) {
        editor = this.editor;
      }
      envOpt = atom.config.get("latexer.autocomplete_environments");
      refOpt = atom.config.get("latexer.autocomplete_references");
      citeOpt = atom.config.get("latexer.autocomplete_citations");
      if (refOpt || citeOpt) {
        this.refCiteCheck(editor, refOpt, citeOpt);
      }
      if (envOpt) {
        return this.environmentCheck(editor);
      }
    };

    return LatexerHook;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2xhdGV4ZXIvbGliL2xhdGV4ZXItaG9vay5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLHNCQUF1QixPQUFBLENBQVEsTUFBUjs7RUFDeEIsU0FBQSxHQUFZLE9BQUEsQ0FBUSxjQUFSOztFQUNaLFFBQUEsR0FBVyxPQUFBLENBQVEsYUFBUjs7RUFFWCxNQUFNLENBQUMsT0FBUCxHQUNROzBCQUNKLFFBQUEsR0FBVTs7MEJBQ1YsT0FBQSxHQUFTOzswQkFDVCxNQUFBLEdBQVE7OzBCQUNSLE9BQUEsR0FBUzs7SUFDSSxxQkFBQyxPQUFEO01BQUMsSUFBQyxDQUFBLFNBQUQ7TUFDWixJQUFDLENBQUEsV0FBRCxHQUFlLElBQUk7TUFDbkIsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsZ0JBQVIsQ0FBeUIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxlQUFELENBQUE7UUFBSDtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBekIsQ0FBakI7TUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxlQUFSLENBQXdCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsZUFBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXhCLENBQWpCO01BQ0EsSUFBQyxDQUFBLFdBQVcsQ0FBQyxHQUFiLENBQWlCLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixDQUFrQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7aUJBQUcsS0FBQyxDQUFBLGVBQUQsQ0FBQTtRQUFIO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFsQixDQUFqQjtNQUVBLElBQUMsQ0FBQSxXQUFXLENBQUMsR0FBYixDQUFpQixJQUFDLENBQUEsTUFBTSxDQUFDLFlBQVIsQ0FBcUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsSUFBZCxDQUFyQixDQUFqQjtNQUNBLElBQUMsQ0FBQSxlQUFELENBQUE7TUFDQSxJQUFDLENBQUEsRUFBRCxHQUFNLElBQUk7TUFDVixJQUFDLENBQUEsRUFBRCxHQUFNLElBQUk7SUFUQzs7MEJBV2IsT0FBQSxHQUFTLFNBQUE7QUFDUCxVQUFBO01BQUEsSUFBQyxDQUFBLGlCQUFELENBQUE7TUFDQSxJQUFDLENBQUEsV0FBVyxDQUFDLE9BQWIsQ0FBQTs7V0FDRyxDQUFFLElBQUwsQ0FBQTs7NENBQ0csQ0FBRSxJQUFMLENBQUE7SUFKTzs7MEJBT1QsZUFBQSxHQUFpQixTQUFBO0FBQ2YsVUFBQTtNQUFBLElBQUMsQ0FBQSxpQkFBRCxDQUFBO01BQ0EsSUFBYyxtQkFBZDtBQUFBLGVBQUE7O01BQ0EsS0FBQSxvQ0FBZSxDQUFFLFFBQVQsQ0FBQTtNQUNSLElBQUEsQ0FBQSxDQUFjLGVBQUEsSUFBVyxLQUFLLENBQUMsS0FBTixDQUFZLFFBQVosQ0FBekIsQ0FBQTtBQUFBLGVBQUE7O01BQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVSxJQUFDLENBQUEsTUFBTSxDQUFDLFNBQVIsQ0FBQTthQUNWLElBQUMsQ0FBQSxnQkFBRCxHQUFvQixJQUFDLENBQUEsTUFBTSxDQUFDLGlCQUFSLENBQTBCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtpQkFBRyxLQUFDLENBQUEsVUFBRCxDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTFCO0lBTkw7OzBCQVFqQixpQkFBQSxHQUFtQixTQUFBO0FBQ2pCLFVBQUE7O1dBQWlCLENBQUUsT0FBbkIsQ0FBQTs7YUFDQSxJQUFDLENBQUEsTUFBRCxHQUFVO0lBRk87OzBCQUluQixZQUFBLEdBQWMsU0FBQyxNQUFELEVBQVMsTUFBVCxFQUFpQixPQUFqQjtBQUNaLFVBQUE7TUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLHVCQUFQLENBQUEsQ0FBZ0MsQ0FBQyxPQUFqQyxDQUFBO01BQ04sSUFBQSxHQUFPLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixDQUFDLENBQUMsR0FBSSxDQUFBLENBQUEsQ0FBTCxFQUFTLENBQVQsQ0FBRCxFQUFjLEdBQWQsQ0FBNUI7TUFDUCxJQUFHLE1BQUEsSUFBVyxDQUFDLEtBQUEsR0FBUSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUMsQ0FBQSxNQUFaLENBQVQsQ0FBZDtRQUNFLElBQUMsQ0FBQSxFQUFFLENBQUMsSUFBSixDQUFTLE1BQVQsRUFERjs7TUFFQSxJQUFHLE9BQUEsSUFBWSxDQUFDLEtBQUEsR0FBUSxJQUFJLENBQUMsS0FBTCxDQUFXLElBQUMsQ0FBQSxPQUFaLENBQVQsQ0FBZjtlQUNFLElBQUMsQ0FBQSxFQUFFLENBQUMsSUFBSixDQUFTLE1BQVQsRUFERjs7SUFMWTs7MEJBUWQsZ0JBQUEsR0FBa0IsU0FBQyxNQUFEO0FBQ2hCLFVBQUE7TUFBQSxHQUFBLEdBQU0sTUFBTSxDQUFDLHVCQUFQLENBQUEsQ0FBZ0MsQ0FBQyxPQUFqQyxDQUFBO01BQ04sSUFBVSxHQUFJLENBQUEsQ0FBQSxDQUFKLElBQVUsQ0FBcEI7QUFBQSxlQUFBOztNQUNBLFlBQUEsR0FBZSxNQUFNLENBQUMsb0JBQVAsQ0FBNEIsR0FBSSxDQUFBLENBQUEsQ0FBSixHQUFPLENBQW5DO01BQ2YsSUFBRyxDQUFDLEtBQUEsR0FBUSxJQUFDLENBQUEsUUFBUSxDQUFDLElBQVYsQ0FBZSxZQUFmLENBQVQsQ0FBSDtRQUNFLFNBQUEsR0FBWSxVQUFBLEdBQVcsS0FBTSxDQUFBLENBQUEsQ0FBakIsR0FBb0I7UUFDaEMsT0FBQSxHQUFVLFFBQUEsR0FBUyxLQUFNLENBQUEsQ0FBQSxDQUFmLEdBQWtCO1FBQzVCLFlBQUEsR0FBZSxJQUFJLE1BQUosQ0FBVyxTQUFTLENBQUMsT0FBVixDQUFrQixvQkFBbEIsRUFBd0MsTUFBeEMsQ0FBWCxFQUE0RCxJQUE1RDtRQUNmLFVBQUEsR0FBYSxJQUFJLE1BQUosQ0FBVyxPQUFPLENBQUMsT0FBUixDQUFnQixvQkFBaEIsRUFBc0MsTUFBdEMsQ0FBWCxFQUEwRCxJQUExRCxFQUpmO09BQUEsTUFLSyxJQUFHLENBQUMsS0FBQSxHQUFRLElBQUMsQ0FBQSxPQUFPLENBQUMsSUFBVCxDQUFjLFlBQWQsQ0FBVCxDQUFBLElBQTBDLEtBQU0sQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFULEdBQWtCLENBQS9EO1FBQ0gsU0FBQSxHQUFZO1FBQ1osT0FBQSxHQUFVO1FBQ1YsWUFBQSxHQUFlLElBQUksTUFBSixDQUFXLFNBQVgsRUFBc0IsSUFBdEI7UUFDZixVQUFBLEdBQWEsSUFBSSxNQUFKLENBQVcsU0FBWCxFQUFzQixJQUF0QixFQUpWO09BQUEsTUFBQTtBQU1ILGVBTkc7O01BT0wsU0FBQSxHQUFZLE1BQU0sQ0FBQyxZQUFQLENBQUE7TUFDWixPQUFBLEdBQVMsTUFBTSxDQUFDLG9CQUFQLENBQTRCLENBQUMsQ0FBQyxDQUFELEVBQUcsQ0FBSCxDQUFELEVBQVEsQ0FBQyxHQUFJLENBQUEsQ0FBQSxDQUFMLEVBQVEsQ0FBUixDQUFSLENBQTVCLENBQWdELENBQUMsT0FBakQsQ0FBeUQsUUFBekQsRUFBa0UsRUFBbEU7TUFDVCxhQUFBLEdBQWdCLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixDQUFDLENBQUMsR0FBSSxDQUFBLENBQUEsQ0FBTCxFQUFRLENBQVIsQ0FBRCxFQUFZLENBQUMsU0FBQSxHQUFVLENBQVgsRUFBYSxDQUFiLENBQVosQ0FBNUIsQ0FBeUQsQ0FBQyxPQUExRCxDQUFrRSxRQUFsRSxFQUEyRSxFQUEzRTtNQUNoQixhQUFBLEdBQWdCLENBQUMsT0FBTyxDQUFDLEtBQVIsQ0FBYyxZQUFkLENBQUEsSUFBNkIsRUFBOUIsQ0FBaUMsQ0FBQyxNQUFsQyxHQUEyQyxDQUFDLE9BQU8sQ0FBQyxLQUFSLENBQWMsVUFBZCxDQUFBLElBQTJCLEVBQTVCLENBQStCLENBQUM7TUFDM0YsWUFBQSxHQUFlLENBQUMsYUFBYSxDQUFDLEtBQWQsQ0FBb0IsWUFBcEIsQ0FBQSxJQUFtQyxFQUFwQyxDQUF1QyxDQUFDLE1BQXhDLEdBQWlELENBQUMsYUFBYSxDQUFDLEtBQWQsQ0FBb0IsVUFBcEIsQ0FBQSxJQUFpQyxFQUFsQyxDQUFxQyxDQUFDO01BQ3RHLElBQVUsYUFBQSxHQUFnQixZQUFoQixHQUErQixDQUF6QztBQUFBLGVBQUE7O01BQ0EsU0FBQSxHQUFZLE1BQU0sQ0FBQyx1QkFBUCxDQUFBO01BQ1osTUFBTSxDQUFDLFVBQVAsQ0FBa0IsT0FBbEI7TUFDQSxNQUFNLENBQUMsTUFBUCxDQUFjLENBQWQ7TUFDQSxNQUFNLENBQUMsZUFBUCxDQUFBO2FBQ0EsTUFBTSxDQUFDLFVBQVAsQ0FBa0IsSUFBbEI7SUExQmdCOzswQkE0QmxCLFVBQUEsR0FBWSxTQUFDLE1BQUQ7QUFDVixVQUFBOztRQURXLFNBQVMsSUFBQyxDQUFBOztNQUNyQixNQUFBLEdBQVMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLG1DQUFoQjtNQUNULE1BQUEsR0FBUyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsaUNBQWhCO01BQ1QsT0FBQSxHQUFVLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixnQ0FBaEI7TUFDVixJQUEwQyxNQUFBLElBQVUsT0FBcEQ7UUFBQSxJQUFDLENBQUEsWUFBRCxDQUFjLE1BQWQsRUFBc0IsTUFBdEIsRUFBOEIsT0FBOUIsRUFBQTs7TUFDQSxJQUE2QixNQUE3QjtlQUFBLElBQUMsQ0FBQSxnQkFBRCxDQUFrQixNQUFsQixFQUFBOztJQUxVOzs7OztBQTVFaEIiLCJzb3VyY2VzQ29udGVudCI6WyJ7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuTGFiZWxWaWV3ID0gcmVxdWlyZSAnLi9sYWJlbC12aWV3J1xuQ2l0ZVZpZXcgPSByZXF1aXJlICcuL2NpdGUtdmlldydcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjbGFzcyBMYXRleGVySG9va1xuICAgIGJlZ2luUmV4OiAvXFxcXGJlZ2lueyhbXn1dKyl9L1xuICAgIG1hdGhSZXg6IC8oXFxcXCspXFxbL1xuICAgIHJlZlJleDogL1xcXFxcXHcqcmVmKHt8e1tefV0rLCkkL1xuICAgIGNpdGVSZXg6IC9cXFxcKGNpdGV8dGV4dGNpdGV8b25saW5lY2l0ZXxjaXRldHxjaXRlcHxjaXRldFxcKnxjaXRlcFxcKikoXFxbW15cXF1dK1xcXSk/KHt8e1tefV0rLCkkL1xuICAgIGNvbnN0cnVjdG9yOiAoQGVkaXRvcikgLT5cbiAgICAgIEBkaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIEBlZGl0b3Iub25EaWRDaGFuZ2VUaXRsZSA9PiBAc3Vic2NyaWJlQnVmZmVyKClcbiAgICAgIEBkaXNwb3NhYmxlcy5hZGQgQGVkaXRvci5vbkRpZENoYW5nZVBhdGggPT4gQHN1YnNjcmliZUJ1ZmZlcigpXG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIEBlZGl0b3Iub25EaWRTYXZlID0+IEBzdWJzY3JpYmVCdWZmZXIoKVxuXG4gICAgICBAZGlzcG9zYWJsZXMuYWRkIEBlZGl0b3Iub25EaWREZXN0cm95KEBkZXN0cm95LmJpbmQodGhpcykpXG4gICAgICBAc3Vic2NyaWJlQnVmZmVyKClcbiAgICAgIEBsdiA9IG5ldyBMYWJlbFZpZXdcbiAgICAgIEBjdiA9IG5ldyBDaXRlVmlld1xuXG4gICAgZGVzdHJveTogLT5cbiAgICAgIEB1bnN1YnNjcmliZUJ1ZmZlcigpXG4gICAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG4gICAgICBAbHY/LmhpZGUoKVxuICAgICAgQGN2Py5oaWRlKClcblxuXG4gICAgc3Vic2NyaWJlQnVmZmVyOiAtPlxuICAgICAgQHVuc3Vic2NyaWJlQnVmZmVyKClcbiAgICAgIHJldHVybiB1bmxlc3MgQGVkaXRvcj9cbiAgICAgIHRpdGxlID0gQGVkaXRvcj8uZ2V0VGl0bGUoKVxuICAgICAgcmV0dXJuIHVubGVzcyB0aXRsZT8gYW5kIHRpdGxlLm1hdGNoKC9cXC50ZXgkLylcbiAgICAgIEBidWZmZXIgPSBAZWRpdG9yLmdldEJ1ZmZlcigpXG4gICAgICBAZGlzcG9zYWJsZUJ1ZmZlciA9IEBidWZmZXIub25EaWRTdG9wQ2hhbmdpbmcgPT4gQGVkaXRvckhvb2soKVxuXG4gICAgdW5zdWJzY3JpYmVCdWZmZXI6IC0+XG4gICAgICBAZGlzcG9zYWJsZUJ1ZmZlcj8uZGlzcG9zZSgpXG4gICAgICBAYnVmZmVyID0gbnVsbFxuXG4gICAgcmVmQ2l0ZUNoZWNrOiAoZWRpdG9yLCByZWZPcHQsIGNpdGVPcHQpLT5cbiAgICAgIHBvcyA9IGVkaXRvci5nZXRDdXJzb3JCdWZmZXJQb3NpdGlvbigpLnRvQXJyYXkoKVxuICAgICAgbGluZSA9IGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShbW3Bvc1swXSwgMF0sIHBvc10pXG4gICAgICBpZiByZWZPcHQgYW5kIChtYXRjaCA9IGxpbmUubWF0Y2goQHJlZlJleCkpXG4gICAgICAgIEBsdi5zaG93KGVkaXRvcilcbiAgICAgIGlmIGNpdGVPcHQgYW5kIChtYXRjaCA9IGxpbmUubWF0Y2goQGNpdGVSZXgpKVxuICAgICAgICBAY3Yuc2hvdyhlZGl0b3IpXG5cbiAgICBlbnZpcm9ubWVudENoZWNrOiAoZWRpdG9yKS0+XG4gICAgICBwb3MgPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKS50b0FycmF5KClcbiAgICAgIHJldHVybiBpZiBwb3NbMF0gPD0gMFxuICAgICAgcHJldmlvdXNMaW5lID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHBvc1swXS0xKVxuICAgICAgaWYgKG1hdGNoID0gQGJlZ2luUmV4LmV4ZWMocHJldmlvdXNMaW5lKSlcbiAgICAgICAgYmVnaW5UZXh0ID0gXCJcXFxcYmVnaW57I3ttYXRjaFsxXX19XCJcbiAgICAgICAgZW5kVGV4dCA9IFwiXFxcXGVuZHsje21hdGNoWzFdfX1cIlxuICAgICAgICBiZWdpblRleHRSZXggPSBuZXcgUmVnRXhwIGJlZ2luVGV4dC5yZXBsYWNlKC8oWygpW3sqKy4kXlxcXFx8P10pL2csIFwiXFxcXCQxXCIpLCBcImdtXCJcbiAgICAgICAgZW5kVGV4dFJleCA9IG5ldyBSZWdFeHAgZW5kVGV4dC5yZXBsYWNlKC8oWygpW3sqKy4kXlxcXFx8P10pL2csIFwiXFxcXCQxXCIpLCBcImdtXCJcbiAgICAgIGVsc2UgaWYgKG1hdGNoID0gQG1hdGhSZXguZXhlYyhwcmV2aW91c0xpbmUpKSBhbmQgbWF0Y2hbMV0ubGVuZ3RoICUgMlxuICAgICAgICBiZWdpblRleHQgPSBcIlxcXFxbXCJcbiAgICAgICAgZW5kVGV4dCA9IFwiXFxcXF1cIlxuICAgICAgICBiZWdpblRleHRSZXggPSBuZXcgUmVnRXhwIFwiXFxcXFxcXFxcXFxcW1wiLCBcImdtXCJcbiAgICAgICAgZW5kVGV4dFJleCA9IG5ldyBSZWdFeHAgXCJcXFxcXFxcXFxcXFxdXCIsIFwiZ21cIlxuICAgICAgZWxzZVxuICAgICAgICByZXR1cm5cbiAgICAgIGxpbmVDb3VudCA9IGVkaXRvci5nZXRMaW5lQ291bnQoKVxuICAgICAgcHJlVGV4dD0gZWRpdG9yLmdldFRleHRJbkJ1ZmZlclJhbmdlKFtbMCwwXSwgW3Bvc1swXSwwXV0pLnJlcGxhY2UgLyUuKyQvZ20sXCJcIlxuICAgICAgcmVtYWluaW5nVGV4dCA9IGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShbW3Bvc1swXSwwXSxbbGluZUNvdW50KzEsMF1dKS5yZXBsYWNlIC8lLiskL2dtLFwiXCJcbiAgICAgIGJhbGFuY2VCZWZvcmUgPSAocHJlVGV4dC5tYXRjaChiZWdpblRleHRSZXgpfHxbXSkubGVuZ3RoIC0gKHByZVRleHQubWF0Y2goZW5kVGV4dFJleCl8fFtdKS5sZW5ndGhcbiAgICAgIGJhbGFuY2VBZnRlciA9IChyZW1haW5pbmdUZXh0Lm1hdGNoKGJlZ2luVGV4dFJleCl8fFtdKS5sZW5ndGggLSAocmVtYWluaW5nVGV4dC5tYXRjaChlbmRUZXh0UmV4KXx8W10pLmxlbmd0aFxuICAgICAgcmV0dXJuIGlmIGJhbGFuY2VCZWZvcmUgKyBiYWxhbmNlQWZ0ZXIgPCAxXG4gICAgICBwb3NCZWZvcmUgPSBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuICAgICAgZWRpdG9yLmluc2VydFRleHQgZW5kVGV4dFxuICAgICAgZWRpdG9yLm1vdmVVcCAxXG4gICAgICBlZGl0b3IubW92ZVRvRW5kT2ZMaW5lKClcbiAgICAgIGVkaXRvci5pbnNlcnRUZXh0IFwiXFxuXCJcblxuICAgIGVkaXRvckhvb2s6IChlZGl0b3IgPSBAZWRpdG9yKS0+XG4gICAgICBlbnZPcHQgPSBhdG9tLmNvbmZpZy5nZXQgXCJsYXRleGVyLmF1dG9jb21wbGV0ZV9lbnZpcm9ubWVudHNcIlxuICAgICAgcmVmT3B0ID0gYXRvbS5jb25maWcuZ2V0IFwibGF0ZXhlci5hdXRvY29tcGxldGVfcmVmZXJlbmNlc1wiXG4gICAgICBjaXRlT3B0ID0gYXRvbS5jb25maWcuZ2V0IFwibGF0ZXhlci5hdXRvY29tcGxldGVfY2l0YXRpb25zXCJcbiAgICAgIEByZWZDaXRlQ2hlY2soZWRpdG9yLCByZWZPcHQsIGNpdGVPcHQpIGlmIHJlZk9wdCBvciBjaXRlT3B0XG4gICAgICBAZW52aXJvbm1lbnRDaGVjayhlZGl0b3IpIGlmIGVudk9wdFxuIl19
