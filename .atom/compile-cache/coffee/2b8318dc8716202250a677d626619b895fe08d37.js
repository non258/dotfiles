(function() {
  var CompositeDisposable, Config, _;

  _ = require('underscore-plus');

  CompositeDisposable = require('atom').CompositeDisposable;

  Config = {
    debug: {
      type: 'boolean',
      "default": false
    }
  };

  module.exports = {
    disposables: null,
    active: false,
    prefix: 'vim-mode-visual-block',
    activate: function(state) {
      var blockwiseCommands, command, commands, fn, i, len;
      this.disposables = new CompositeDisposable;
      blockwiseCommands = {};
      commands = 'jkoDCIA'.split('');
      commands.push('escape', 'ctrl-v');
      fn = (function(_this) {
        return function(command) {
          var name;
          name = _this.prefix + ":" + command;
          return blockwiseCommands[name] = function(event) {
            return _this.blockOperation(event, command);
          };
        };
      })(this);
      for (i = 0, len = commands.length; i < len; i++) {
        command = commands[i];
        fn(command);
      }
      this.disposables.add(atom.commands.add('atom-text-editor', blockwiseCommands));
      return this.reset();
    },
    deactivate: function() {
      return this.disposables.dispose();
    },
    consumeVimMode: function(vimModeService) {
      this.vimModeService = vimModeService;
    },
    reset: function() {
      return this.startRow = null;
    },
    getEditor: function() {
      return atom.workspace.getActiveTextEditor();
    },
    isVisualBlockMode: function(vimState) {
      return (vimState.mode === 'visual') && (vimState.submode === 'blockwise');
    },
    getVimEditorState: function(editor) {
      return this.vimModeService.getEditorState(editor);
    },
    adjustSelections: function(editor, options) {
      var i, len, range, ref, results, selection;
      ref = editor.getSelections();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        selection = ref[i];
        range = selection.getBufferRange();
        results.push(selection.setBufferRange(range, options));
      }
      return results;
    },
    blockOperation: function(event, command) {
      var adjustCursor, currentRow, cursor, cursorBottom, cursorTop, cursors, cursorsAdjusted, editor, i, j, lastSelection, len, len1, ref, ref1, selection, vimState;
      editor = this.getEditor();
      vimState = this.getVimEditorState(editor);
      if (!this.isVisualBlockMode(vimState)) {
        event.abortKeyBinding();
        this.reset();
        return;
      }
      if (editor.getCursors().length === 1) {
        this.reset();
      }
      currentRow = (ref = editor.getLastCursor()) != null ? ref.getBufferRow() : void 0;
      if (this.startRow == null) {
        this.startRow = currentRow;
      }
      switch (command) {
        case 'o':
          this.startRow = currentRow;
          break;
        case 'D':
        case 'C':
          vimState.activateNormalMode();
          event.abortKeyBinding();
          break;
        case 'escape':
        case 'ctrl-v':
          vimState.activateNormalMode();
          editor.clearSelections();
          break;
        case 'j':
        case 'k':
          cursors = editor.getCursorsOrderedByBufferPosition();
          cursorTop = _.first(cursors);
          cursorBottom = _.last(cursors);
          if ((command === 'j' && cursorTop.getBufferRow() >= this.startRow) || (command === 'k' && cursorBottom.getBufferRow() <= this.startRow)) {
            lastSelection = editor.getLastSelection();
            if (command === 'j') {
              editor.addSelectionBelow();
            } else {
              editor.addSelectionAbove();
            }
            this.adjustSelections(editor, {
              reversed: lastSelection.isReversed()
            });
          } else {
            if (editor.getCursors().length < 2) {
              this.reset();
              return;
            }
            if (command === 'j') {
              cursorTop.destroy();
            } else {
              cursorBottom.destroy();
            }
          }
          break;
        case 'I':
        case 'A':
          cursorsAdjusted = [];
          adjustCursor = function(selection) {
            var cursor, end, pointEndOfLine, pointTarget, ref1, start;
            ref1 = selection.getBufferRange(), start = ref1.start, end = ref1.end;
            pointEndOfLine = editor.bufferRangeForBufferRow(start.row).end;
            pointTarget = {
              'I': start,
              'A': end
            }[command];
            cursor = selection.cursor;
            if (pointTarget.isGreaterThanOrEqual(pointEndOfLine)) {
              pointTarget = pointEndOfLine;
              cursorsAdjusted.push(cursor);
            }
            return cursor.setBufferPosition(pointTarget);
          };
          ref1 = editor.getSelections();
          for (i = 0, len = ref1.length; i < len; i++) {
            selection = ref1[i];
            adjustCursor(selection);
          }
          vimState.activateNormalMode();
          vimState.activateInsertMode();
          if (command === 'A' && cursorsAdjusted.length) {
            for (j = 0, len1 = cursorsAdjusted.length; j < len1; j++) {
              cursor = cursorsAdjusted[j];
              cursor.moveRight();
            }
          }
      }
      if (!this.isVisualBlockMode(vimState)) {
        return this.reset();
      }
    },
    toggleDebug: function() {
      var oldState, state;
      oldState = atom.config.get(this.prefix + ".debug");
      atom.config.set(this.prefix + ".debug", !oldState);
      state = atom.config.get(this.prefix + ".debug") && "enabled" || "disabled";
      return console.log(this.prefix + ": debug " + state);
    },
    debug: function(msg) {
      if (!atom.config.get(this.prefix + ".debug")) {
        return;
      }
      return console.log(msg);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlLXZpc3VhbC1ibG9jay9saWIvbWFpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0gsc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixNQUFBLEdBQ0U7SUFBQSxLQUFBLEVBQ0U7TUFBQSxJQUFBLEVBQU0sU0FBTjtNQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsS0FEVDtLQURGOzs7RUFJRixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsV0FBQSxFQUFhLElBQWI7SUFDQSxNQUFBLEVBQWEsS0FEYjtJQUVBLE1BQUEsRUFBYSx1QkFGYjtJQUlBLFFBQUEsRUFBVSxTQUFDLEtBQUQ7QUFDUixVQUFBO01BQUEsSUFBQyxDQUFBLFdBQUQsR0FBZSxJQUFJO01BQ25CLGlCQUFBLEdBQW9CO01BQ3BCLFFBQUEsR0FBVyxTQUFTLENBQUMsS0FBVixDQUFnQixFQUFoQjtNQUNYLFFBQVEsQ0FBQyxJQUFULENBQWMsUUFBZCxFQUF3QixRQUF4QjtXQUVLLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFEO0FBQ0QsY0FBQTtVQUFBLElBQUEsR0FBVSxLQUFDLENBQUEsTUFBRixHQUFTLEdBQVQsR0FBWTtpQkFDckIsaUJBQWtCLENBQUEsSUFBQSxDQUFsQixHQUEwQixTQUFDLEtBQUQ7bUJBQVcsS0FBQyxDQUFBLGNBQUQsQ0FBZ0IsS0FBaEIsRUFBdUIsT0FBdkI7VUFBWDtRQUZ6QjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUE7QUFETCxXQUFBLDBDQUFBOztXQUNNO0FBRE47TUFNQSxJQUFDLENBQUEsV0FBVyxDQUFDLEdBQWIsQ0FBaUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGtCQUFsQixFQUFzQyxpQkFBdEMsQ0FBakI7YUFD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bUIsUUFBbkIsQ0FBUDtlQUNFLElBQUMsQ0FBQSxLQUFELENBQUEsRUFERjs7SUFsRmMsQ0F4Q2hCO0lBNkhBLFdBQUEsRUFBYSxTQUFBO0FBQ1gsVUFBQTtNQUFBLFFBQUEsR0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBbUIsSUFBQyxDQUFBLE1BQUYsR0FBUyxRQUEzQjtNQUNYLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFtQixJQUFDLENBQUEsTUFBRixHQUFTLFFBQTNCLEVBQW9DLENBQUksUUFBeEM7TUFDQSxLQUFBLEdBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQW1CLElBQUMsQ0FBQSxNQUFGLEdBQVMsUUFBM0IsQ0FBQSxJQUF3QyxTQUF4QyxJQUFxRDthQUM3RCxPQUFPLENBQUMsR0FBUixDQUFlLElBQUMsQ0FBQSxNQUFGLEdBQVMsVUFBVCxHQUFtQixLQUFqQztJQUpXLENBN0hiO0lBbUlBLEtBQUEsRUFBTyxTQUFDLEdBQUQ7TUFDTCxJQUFBLENBQWMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQW1CLElBQUMsQ0FBQSxNQUFGLEdBQVMsUUFBM0IsQ0FBZDtBQUFBLGVBQUE7O2FBQ0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxHQUFaO0lBRkssQ0FuSVA7O0FBVEYiLCJzb3VyY2VzQ29udGVudCI6WyJfID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue0NvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcblxuQ29uZmlnID1cbiAgZGVidWc6XG4gICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgZGVmYXVsdDogZmFsc2VcblxubW9kdWxlLmV4cG9ydHMgPVxuICBkaXNwb3NhYmxlczogbnVsbFxuICBhY3RpdmU6ICAgICAgZmFsc2VcbiAgcHJlZml4OiAgICAgICd2aW0tbW9kZS12aXN1YWwtYmxvY2snXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cbiAgICBAZGlzcG9zYWJsZXMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIGJsb2Nrd2lzZUNvbW1hbmRzID0ge31cbiAgICBjb21tYW5kcyA9ICdqa29EQ0lBJy5zcGxpdCgnJylcbiAgICBjb21tYW5kcy5wdXNoICdlc2NhcGUnLCAnY3RybC12J1xuICAgIGZvciBjb21tYW5kIGluIGNvbW1hbmRzXG4gICAgICBkbyAoY29tbWFuZCkgPT5cbiAgICAgICAgbmFtZSA9IFwiI3tAcHJlZml4fToje2NvbW1hbmR9XCJcbiAgICAgICAgYmxvY2t3aXNlQ29tbWFuZHNbbmFtZV0gPSAoZXZlbnQpID0+IEBibG9ja09wZXJhdGlvbihldmVudCwgY29tbWFuZClcblxuICAgICMgYmxvY2t3aXNlQ29tbWFuZHNbXCIje0BwcmVmaXh9OnRvZ2dsZS1kZWJ1Z1wiXSA9ID0+IEB0b2dnbGVEZWJ1ZygpXG4gICAgQGRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS10ZXh0LWVkaXRvcicsIGJsb2Nrd2lzZUNvbW1hbmRzKVxuICAgIEByZXNldCgpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAZGlzcG9zYWJsZXMuZGlzcG9zZSgpXG5cbiAgY29uc3VtZVZpbU1vZGU6IChAdmltTW9kZVNlcnZpY2UpIC0+XG5cbiAgcmVzZXQ6IC0+XG4gICAgQHN0YXJ0Um93ID0gbnVsbFxuXG4gIGdldEVkaXRvcjogLT5cbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcblxuICBpc1Zpc3VhbEJsb2NrTW9kZTogKHZpbVN0YXRlKSAtPlxuICAgICh2aW1TdGF0ZS5tb2RlIGlzICd2aXN1YWwnKSBhbmQgKHZpbVN0YXRlLnN1Ym1vZGUgaXMgJ2Jsb2Nrd2lzZScpXG5cbiAgZ2V0VmltRWRpdG9yU3RhdGU6IChlZGl0b3IpIC0+XG4gICAgQHZpbU1vZGVTZXJ2aWNlLmdldEVkaXRvclN0YXRlIGVkaXRvclxuXG4gIGFkanVzdFNlbGVjdGlvbnM6IChlZGl0b3IsIG9wdGlvbnMpIC0+XG4gICAgZm9yIHNlbGVjdGlvbiBpbiBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgICByYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2UgcmFuZ2UsIG9wdGlvbnNcblxuICBibG9ja09wZXJhdGlvbjogKGV2ZW50LCBjb21tYW5kKSAtPlxuICAgIGVkaXRvciAgID0gQGdldEVkaXRvcigpXG4gICAgdmltU3RhdGUgPSBAZ2V0VmltRWRpdG9yU3RhdGUgZWRpdG9yXG5cbiAgICB1bmxlc3MgQGlzVmlzdWFsQmxvY2tNb2RlIHZpbVN0YXRlXG4gICAgICBldmVudC5hYm9ydEtleUJpbmRpbmcoKVxuICAgICAgQHJlc2V0KClcbiAgICAgIHJldHVyblxuXG4gICAgIyBNYXkgYmUgbm9uLWNvbnRpbnVvdXMgZXhlY3V0aW9uLlxuICAgIGlmIGVkaXRvci5nZXRDdXJzb3JzKCkubGVuZ3RoIGlzIDFcbiAgICAgIEByZXNldCgpXG5cbiAgICBjdXJyZW50Um93ICA9IGVkaXRvci5nZXRMYXN0Q3Vyc29yKCk/LmdldEJ1ZmZlclJvdygpXG4gICAgQHN0YXJ0Um93ICA/PSBjdXJyZW50Um93XG5cbiAgICBzd2l0Y2ggY29tbWFuZFxuICAgICAgd2hlbiAnbydcbiAgICAgICAgQHN0YXJ0Um93ID0gY3VycmVudFJvd1xuICAgICAgd2hlbiAnRCcsICdDJ1xuICAgICAgICB2aW1TdGF0ZS5hY3RpdmF0ZU5vcm1hbE1vZGUoKVxuICAgICAgICBldmVudC5hYm9ydEtleUJpbmRpbmcoKVxuICAgICAgd2hlbiAnZXNjYXBlJywgJ2N0cmwtdidcbiAgICAgICAgdmltU3RhdGUuYWN0aXZhdGVOb3JtYWxNb2RlKClcbiAgICAgICAgZWRpdG9yLmNsZWFyU2VsZWN0aW9ucygpXG4gICAgICB3aGVuICdqJywgJ2snXG4gICAgICAgIGN1cnNvcnMgICAgICA9IGVkaXRvci5nZXRDdXJzb3JzT3JkZXJlZEJ5QnVmZmVyUG9zaXRpb24oKVxuICAgICAgICBjdXJzb3JUb3AgICAgPSBfLmZpcnN0IGN1cnNvcnNcbiAgICAgICAgY3Vyc29yQm90dG9tID0gXy5sYXN0IGN1cnNvcnNcblxuICAgICAgICBpZiAoY29tbWFuZCBpcyAnaicgYW5kIGN1cnNvclRvcC5nZXRCdWZmZXJSb3coKSA+PSBAc3RhcnRSb3cpIG9yXG4gICAgICAgICAgICAoY29tbWFuZCBpcyAnaycgYW5kIGN1cnNvckJvdHRvbS5nZXRCdWZmZXJSb3coKSA8PSBAc3RhcnRSb3cpXG4gICAgICAgICAgbGFzdFNlbGVjdGlvbiA9IGVkaXRvci5nZXRMYXN0U2VsZWN0aW9uKClcblxuICAgICAgICAgIGlmIGNvbW1hbmQgaXMgJ2onXG4gICAgICAgICAgICBlZGl0b3IuYWRkU2VsZWN0aW9uQmVsb3coKVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGVkaXRvci5hZGRTZWxlY3Rpb25BYm92ZSgpXG5cbiAgICAgICAgICAjIFtGSVhNRV1cbiAgICAgICAgICAjIFdoZW4gYWRkU2VsZWN0aW9uQWJvdmUoKSwgYWRkU2VsZWN0aW9uQmVsb3coKSBkb2Vzbid0IHJlc3BlY3RcbiAgICAgICAgICAjIHJldmVyc2VkIHN0YXRlZCwgbmVlZCBpbXByb3ZlZC5cbiAgICAgICAgICAjXG4gICAgICAgICAgIyBhbmQgb25lIG1vcmUuLlxuICAgICAgICAgICNcbiAgICAgICAgICAjIFdoZW4gc2VsZWN0aW9uIGlzIE5PVCBlbXB0eSBhbmQgYWRkIHNlbGVjdGlvbiBieSBhZGRTZWxlY3Rpb25BYm92ZSgpXG4gICAgICAgICAgIyBhbmQgdGhlbiBtb3ZlIHJpZ2h0LCBzZWxlY3Rpb24gcmFuZ2UgZ290IHdyb25nLCBtYXliZSB0aGlzIGlzIGJ1Zy4uXG4gICAgICAgICAgQGFkanVzdFNlbGVjdGlvbnMgZWRpdG9yLCByZXZlcnNlZDogbGFzdFNlbGVjdGlvbi5pc1JldmVyc2VkKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgICMgW0ZJWE1FXVxuICAgICAgICAgICMgR3VhcmQgdG8gbm90IGRlc3Ryb3lpbmcgbGFzdCBjdXJzb3JcbiAgICAgICAgICAjIFRoaXMgZ3VhcmQgaXMgbm8gbG9uZ2VyIG5lZWRlZFxuICAgICAgICAgICMgUmVtb3ZlIHVubmVjZXNzYXJ5IGNvZGUgYWZ0ZXIgcmUtdGhpbmsuXG4gICAgICAgICAgaWYgKGVkaXRvci5nZXRDdXJzb3JzKCkubGVuZ3RoIDwgMilcbiAgICAgICAgICAgIEByZXNldCgpXG4gICAgICAgICAgICByZXR1cm5cblxuICAgICAgICAgIGlmIGNvbW1hbmQgaXMgJ2onXG4gICAgICAgICAgICBjdXJzb3JUb3AuZGVzdHJveSgpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgY3Vyc29yQm90dG9tLmRlc3Ryb3koKVxuICAgICAgd2hlbiAnSScsICdBJ1xuICAgICAgICBjdXJzb3JzQWRqdXN0ZWQgPSBbXVxuXG4gICAgICAgIGFkanVzdEN1cnNvciA9IChzZWxlY3Rpb24pIC0+XG4gICAgICAgICAge3N0YXJ0LCBlbmR9ID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJhbmdlKClcbiAgICAgICAgICBwb2ludEVuZE9mTGluZSA9IGVkaXRvci5idWZmZXJSYW5nZUZvckJ1ZmZlclJvdyhzdGFydC5yb3cpLmVuZFxuICAgICAgICAgIHBvaW50VGFyZ2V0ICAgID0geydJJzogc3RhcnQsICdBJzogZW5kfVtjb21tYW5kXVxuICAgICAgICAgIHtjdXJzb3J9ICAgICAgID0gc2VsZWN0aW9uXG5cbiAgICAgICAgICBpZiBwb2ludFRhcmdldC5pc0dyZWF0ZXJUaGFuT3JFcXVhbChwb2ludEVuZE9mTGluZSlcbiAgICAgICAgICAgIHBvaW50VGFyZ2V0ID0gcG9pbnRFbmRPZkxpbmVcbiAgICAgICAgICAgIGN1cnNvcnNBZGp1c3RlZC5wdXNoIGN1cnNvclxuICAgICAgICAgIGN1cnNvci5zZXRCdWZmZXJQb3NpdGlvbihwb2ludFRhcmdldClcblxuICAgICAgICBhZGp1c3RDdXJzb3Ioc2VsZWN0aW9uKSBmb3Igc2VsZWN0aW9uIGluIGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgICAgdmltU3RhdGUuYWN0aXZhdGVOb3JtYWxNb2RlKClcbiAgICAgICAgdmltU3RhdGUuYWN0aXZhdGVJbnNlcnRNb2RlKClcblxuICAgICAgICBpZiBjb21tYW5kIGlzICdBJyBhbmQgIGN1cnNvcnNBZGp1c3RlZC5sZW5ndGhcbiAgICAgICAgICBjdXJzb3IubW92ZVJpZ2h0KCkgZm9yIGN1cnNvciBpbiBjdXJzb3JzQWRqdXN0ZWRcblxuICAgIHVubGVzcyBAaXNWaXN1YWxCbG9ja01vZGUgdmltU3RhdGVcbiAgICAgIEByZXNldCgpXG5cbiAgdG9nZ2xlRGVidWc6IC0+XG4gICAgb2xkU3RhdGUgPSBhdG9tLmNvbmZpZy5nZXQoXCIje0BwcmVmaXh9LmRlYnVnXCIpXG4gICAgYXRvbS5jb25maWcuc2V0KFwiI3tAcHJlZml4fS5kZWJ1Z1wiLCBub3Qgb2xkU3RhdGUpXG4gICAgc3RhdGUgPSBhdG9tLmNvbmZpZy5nZXQoXCIje0BwcmVmaXh9LmRlYnVnXCIpIGFuZCBcImVuYWJsZWRcIiBvciBcImRpc2FibGVkXCJcbiAgICBjb25zb2xlLmxvZyBcIiN7QHByZWZpeH06IGRlYnVnICN7c3RhdGV9XCJcblxuICBkZWJ1ZzogKG1zZykgLT5cbiAgICByZXR1cm4gdW5sZXNzIGF0b20uY29uZmlnLmdldChcIiN7QHByZWZpeH0uZGVidWdcIilcbiAgICBjb25zb2xlLmxvZyBtc2dcblxuICAjIGR1bXA6IC0+XG4gICMgICBAZGVidWcgXCJAc3RhcnRSb3cgPSAje0BzdGFydFJvd31cIlxuIl19
