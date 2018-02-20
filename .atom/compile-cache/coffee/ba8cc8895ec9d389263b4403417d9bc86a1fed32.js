(function() {
  var Delete, Join, LowerCase, Mark, Operator, OperatorError, OperatorWithInput, Point, Range, Repeat, ToggleCase, UpperCase, Utils, ViewModel, Yank, _, ref, settings,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  _ = require('underscore-plus');

  ref = require('atom'), Point = ref.Point, Range = ref.Range;

  ViewModel = require('../view-models/view-model').ViewModel;

  Utils = require('../utils');

  settings = require('../settings');

  OperatorError = (function() {
    function OperatorError(message) {
      this.message = message;
      this.name = 'Operator Error';
    }

    return OperatorError;

  })();

  Operator = (function() {
    Operator.prototype.vimState = null;

    Operator.prototype.motion = null;

    Operator.prototype.complete = null;

    function Operator(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      this.complete = false;
    }

    Operator.prototype.isComplete = function() {
      return this.complete;
    };

    Operator.prototype.isRecordable = function() {
      return true;
    };

    Operator.prototype.compose = function(motion) {
      if (!motion.select) {
        throw new OperatorError('Must compose with a motion');
      }
      this.motion = motion;
      return this.complete = true;
    };

    Operator.prototype.canComposeWith = function(operation) {
      return operation.select != null;
    };

    Operator.prototype.setTextRegister = function(register, text) {
      var ref1, type;
      if ((ref1 = this.motion) != null ? typeof ref1.isLinewise === "function" ? ref1.isLinewise() : void 0 : void 0) {
        type = 'linewise';
        if (text.slice(-1) !== '\n') {
          text += '\n';
        }
      } else {
        type = Utils.copyType(text);
      }
      if (text !== '') {
        return this.vimState.setRegister(register, {
          text: text,
          type: type
        });
      }
    };

    return Operator;

  })();

  OperatorWithInput = (function(superClass) {
    extend(OperatorWithInput, superClass);

    function OperatorWithInput(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      this.editor = this.editor;
      this.complete = false;
    }

    OperatorWithInput.prototype.canComposeWith = function(operation) {
      return (operation.characters != null) || (operation.select != null);
    };

    OperatorWithInput.prototype.compose = function(operation) {
      if (operation.select != null) {
        this.motion = operation;
      }
      if (operation.characters != null) {
        this.input = operation;
        return this.complete = true;
      }
    };

    return OperatorWithInput;

  })(Operator);

  Delete = (function(superClass) {
    extend(Delete, superClass);

    Delete.prototype.register = null;

    function Delete(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      this.complete = false;
      this.register = settings.defaultRegister();
    }

    Delete.prototype.execute = function(count) {
      var base, cursor, j, len, ref1;
      if (_.contains(this.motion.select(count), true)) {
        this.setTextRegister(this.register, this.editor.getSelectedText());
        this.editor.transact((function(_this) {
          return function() {
            var j, len, ref1, results, selection;
            ref1 = _this.editor.getSelections();
            results = [];
            for (j = 0, len = ref1.length; j < len; j++) {
              selection = ref1[j];
              results.push(selection.deleteSelectedText());
            }
            return results;
          };
        })(this));
        ref1 = this.editor.getCursors();
        for (j = 0, len = ref1.length; j < len; j++) {
          cursor = ref1[j];
          if (typeof (base = this.motion).isLinewise === "function" ? base.isLinewise() : void 0) {
            cursor.skipLeadingWhitespace();
          } else {
            if (cursor.isAtEndOfLine() && !cursor.isAtBeginningOfLine()) {
              cursor.moveLeft();
            }
          }
        }
      }
      return this.vimState.activateNormalMode();
    };

    return Delete;

  })(Operator);

  ToggleCase = (function(superClass) {
    extend(ToggleCase, superClass);

    function ToggleCase(editor, vimState, arg) {
      this.editor = editor;
      this.vimState = vimState;
      this.complete = (arg != null ? arg : {}).complete;
    }

    ToggleCase.prototype.execute = function(count) {
      if (this.motion != null) {
        if (_.contains(this.motion.select(count), true)) {
          this.editor.replaceSelectedText({}, function(text) {
            return text.split('').map(function(char) {
              var lower;
              lower = char.toLowerCase();
              if (char === lower) {
                return char.toUpperCase();
              } else {
                return lower;
              }
            }).join('');
          });
        }
      } else {
        this.editor.transact((function(_this) {
          return function() {
            var cursor, cursorCount, j, len, lineLength, point, ref1, results;
            ref1 = _this.editor.getCursors();
            results = [];
            for (j = 0, len = ref1.length; j < len; j++) {
              cursor = ref1[j];
              point = cursor.getBufferPosition();
              lineLength = _this.editor.lineTextForBufferRow(point.row).length;
              cursorCount = Math.min(count != null ? count : 1, lineLength - point.column);
              results.push(_.times(cursorCount, function() {
                var char, range;
                point = cursor.getBufferPosition();
                range = Range.fromPointWithDelta(point, 0, 1);
                char = _this.editor.getTextInBufferRange(range);
                if (char === char.toLowerCase()) {
                  _this.editor.setTextInBufferRange(range, char.toUpperCase());
                } else {
                  _this.editor.setTextInBufferRange(range, char.toLowerCase());
                }
                if (!(point.column >= lineLength - 1)) {
                  return cursor.moveRight();
                }
              }));
            }
            return results;
          };
        })(this));
      }
      return this.vimState.activateNormalMode();
    };

    return ToggleCase;

  })(Operator);

  UpperCase = (function(superClass) {
    extend(UpperCase, superClass);

    function UpperCase(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      this.complete = false;
    }

    UpperCase.prototype.execute = function(count) {
      if (_.contains(this.motion.select(count), true)) {
        this.editor.replaceSelectedText({}, function(text) {
          return text.toUpperCase();
        });
      }
      return this.vimState.activateNormalMode();
    };

    return UpperCase;

  })(Operator);

  LowerCase = (function(superClass) {
    extend(LowerCase, superClass);

    function LowerCase(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      this.complete = false;
    }

    LowerCase.prototype.execute = function(count) {
      if (_.contains(this.motion.select(count), true)) {
        this.editor.replaceSelectedText({}, function(text) {
          return text.toLowerCase();
        });
      }
      return this.vimState.activateNormalMode();
    };

    return LowerCase;

  })(Operator);

  Yank = (function(superClass) {
    extend(Yank, superClass);

    Yank.prototype.register = null;

    function Yank(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      this.editorElement = atom.views.getView(this.editor);
      this.register = settings.defaultRegister();
    }

    Yank.prototype.execute = function(count) {
      var i, newPositions, oldLastCursorPosition, oldLeft, oldTop, originalPosition, originalPositions, position, startPositions, text;
      oldTop = this.editorElement.getScrollTop();
      oldLeft = this.editorElement.getScrollLeft();
      oldLastCursorPosition = this.editor.getCursorBufferPosition();
      originalPositions = this.editor.getCursorBufferPositions();
      if (_.contains(this.motion.select(count), true)) {
        text = this.editor.getSelectedText();
        startPositions = _.pluck(this.editor.getSelectedBufferRanges(), "start");
        newPositions = (function() {
          var base, j, len, results;
          results = [];
          for (i = j = 0, len = originalPositions.length; j < len; i = ++j) {
            originalPosition = originalPositions[i];
            if (startPositions[i]) {
              position = Point.min(startPositions[i], originalPositions[i]);
              if (this.vimState.mode !== 'visual' && (typeof (base = this.motion).isLinewise === "function" ? base.isLinewise() : void 0)) {
                position = new Point(position.row, originalPositions[i].column);
              }
              results.push(position);
            } else {
              results.push(originalPosition);
            }
          }
          return results;
        }).call(this);
      } else {
        text = '';
        newPositions = originalPositions;
      }
      this.setTextRegister(this.register, text);
      this.editor.setSelectedBufferRanges(newPositions.map(function(p) {
        return new Range(p, p);
      }));
      if (oldLastCursorPosition.isEqual(this.editor.getCursorBufferPosition())) {
        this.editorElement.setScrollLeft(oldLeft);
        this.editorElement.setScrollTop(oldTop);
      }
      return this.vimState.activateNormalMode();
    };

    return Yank;

  })(Operator);

  Join = (function(superClass) {
    extend(Join, superClass);

    function Join(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      this.complete = true;
    }

    Join.prototype.execute = function(count) {
      if (count == null) {
        count = 1;
      }
      this.editor.transact((function(_this) {
        return function() {
          return _.times(count, function() {
            return _this.editor.joinLines();
          });
        };
      })(this));
      return this.vimState.activateNormalMode();
    };

    return Join;

  })(Operator);

  Repeat = (function(superClass) {
    extend(Repeat, superClass);

    function Repeat(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      this.complete = true;
    }

    Repeat.prototype.isRecordable = function() {
      return false;
    };

    Repeat.prototype.execute = function(count) {
      if (count == null) {
        count = 1;
      }
      return this.editor.transact((function(_this) {
        return function() {
          return _.times(count, function() {
            var cmd;
            cmd = _this.vimState.history[0];
            return cmd != null ? cmd.execute() : void 0;
          });
        };
      })(this));
    };

    return Repeat;

  })(Operator);

  Mark = (function(superClass) {
    extend(Mark, superClass);

    function Mark(editor, vimState) {
      this.editor = editor;
      this.vimState = vimState;
      Mark.__super__.constructor.call(this, this.editor, this.vimState);
      this.viewModel = new ViewModel(this, {
        "class": 'mark',
        singleChar: true,
        hidden: true
      });
    }

    Mark.prototype.execute = function() {
      this.vimState.setMark(this.input.characters, this.editor.getCursorBufferPosition());
      return this.vimState.activateNormalMode();
    };

    return Mark;

  })(OperatorWithInput);

  module.exports = {
    Operator: Operator,
    OperatorWithInput: OperatorWithInput,
    OperatorError: OperatorError,
    Delete: Delete,
    ToggleCase: ToggleCase,
    UpperCase: UpperCase,
    LowerCase: LowerCase,
    Yank: Yank,
    Join: Join,
    Repeat: Repeat,
    Mark: Mark
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlL2xpYi9vcGVyYXRvcnMvZ2VuZXJhbC1vcGVyYXRvcnMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxnS0FBQTtJQUFBOzs7RUFBQSxDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQWlCLE9BQUEsQ0FBUSxNQUFSLENBQWpCLEVBQUMsaUJBQUQsRUFBUTs7RUFDUCxZQUFhLE9BQUEsQ0FBUSwyQkFBUjs7RUFDZCxLQUFBLEdBQVEsT0FBQSxDQUFRLFVBQVI7O0VBQ1IsUUFBQSxHQUFXLE9BQUEsQ0FBUSxhQUFSOztFQUVMO0lBQ1MsdUJBQUMsT0FBRDtNQUFDLElBQUMsQ0FBQSxVQUFEO01BQ1osSUFBQyxDQUFBLElBQUQsR0FBUTtJQURHOzs7Ozs7RUFHVDt1QkFDSixRQUFBLEdBQVU7O3VCQUNWLE1BQUEsR0FBUTs7dUJBQ1IsUUFBQSxHQUFVOztJQUVHLGtCQUFDLE1BQUQsRUFBVSxRQUFWO01BQUMsSUFBQyxDQUFBLFNBQUQ7TUFBUyxJQUFDLENBQUEsV0FBRDtNQUNyQixJQUFDLENBQUEsUUFBRCxHQUFZO0lBREQ7O3VCQU1iLFVBQUEsR0FBWSxTQUFBO2FBQUcsSUFBQyxDQUFBO0lBQUo7O3VCQU1aLFlBQUEsR0FBYyxTQUFBO2FBQUc7SUFBSDs7dUJBT2QsT0FBQSxHQUFTLFNBQUMsTUFBRDtNQUNQLElBQUcsQ0FBSSxNQUFNLENBQUMsTUFBZDtBQUNFLGNBQU0sSUFBSSxhQUFKLENBQWtCLDRCQUFsQixFQURSOztNQUdBLElBQUMsQ0FBQSxNQUFELEdBQVU7YUFDVixJQUFDLENBQUEsUUFBRCxHQUFZO0lBTEw7O3VCQU9ULGNBQUEsR0FBZ0IsU0FBQyxTQUFEO2FBQWU7SUFBZjs7dUJBS2hCLGVBQUEsR0FBaUIsU0FBQyxRQUFELEVBQVcsSUFBWDtBQUNmLFVBQUE7TUFBQSwrRUFB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Q0FBQSxRQUFRLENBQUMsa0JBQVYsQ0FBQTtJQUZPOzs7O0tBVFE7O0VBYW5CLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0lBQ2YsVUFBQSxRQURlO0lBQ0wsbUJBQUEsaUJBREs7SUFDYyxlQUFBLGFBRGQ7SUFDNkIsUUFBQSxNQUQ3QjtJQUNxQyxZQUFBLFVBRHJDO0lBRWYsV0FBQSxTQUZlO0lBRUosV0FBQSxTQUZJO0lBRU8sTUFBQSxJQUZQO0lBRWEsTUFBQSxJQUZiO0lBRW1CLFFBQUEsTUFGbkI7SUFFMkIsTUFBQSxJQUYzQjs7QUFqUWpCIiwic291cmNlc0NvbnRlbnQiOlsiXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbntQb2ludCwgUmFuZ2V9ID0gcmVxdWlyZSAnYXRvbSdcbntWaWV3TW9kZWx9ID0gcmVxdWlyZSAnLi4vdmlldy1tb2RlbHMvdmlldy1tb2RlbCdcblV0aWxzID0gcmVxdWlyZSAnLi4vdXRpbHMnXG5zZXR0aW5ncyA9IHJlcXVpcmUgJy4uL3NldHRpbmdzJ1xuXG5jbGFzcyBPcGVyYXRvckVycm9yXG4gIGNvbnN0cnVjdG9yOiAoQG1lc3NhZ2UpIC0+XG4gICAgQG5hbWUgPSAnT3BlcmF0b3IgRXJyb3InXG5cbmNsYXNzIE9wZXJhdG9yXG4gIHZpbVN0YXRlOiBudWxsXG4gIG1vdGlvbjogbnVsbFxuICBjb21wbGV0ZTogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvciwgQHZpbVN0YXRlKSAtPlxuICAgIEBjb21wbGV0ZSA9IGZhbHNlXG5cbiAgIyBQdWJsaWM6IERldGVybWluZXMgd2hlbiB0aGUgY29tbWFuZCBjYW4gYmUgZXhlY3V0ZWQuXG4gICNcbiAgIyBSZXR1cm5zIHRydWUgaWYgcmVhZHkgdG8gZXhlY3V0ZSBhbmQgZmFsc2Ugb3RoZXJ3aXNlLlxuICBpc0NvbXBsZXRlOiAtPiBAY29tcGxldGVcblxuICAjIFB1YmxpYzogRGV0ZXJtaW5lcyBpZiB0aGlzIGNvbW1hbmQgc2hvdWxkIGJlIHJlY29yZGVkIGluIHRoZSBjb21tYW5kXG4gICMgaGlzdG9yeSBmb3IgcmVwZWF0cy5cbiAgI1xuICAjIFJldHVybnMgdHJ1ZSBpZiB0aGlzIGNvbW1hbmQgc2hvdWxkIGJlIHJlY29yZGVkLlxuICBpc1JlY29yZGFibGU6IC0+IHRydWVcblxuICAjIFB1YmxpYzogTWFya3MgdGhpcyBhcyByZWFkeSB0byBleGVjdXRlIGFuZCBzYXZlcyB0aGUgbW90aW9uLlxuICAjXG4gICMgbW90aW9uIC0gVGhlIG1vdGlvbiB1c2VkIHRvIHNlbGVjdCB3aGF0IHRvIG9wZXJhdGUgb24uXG4gICNcbiAgIyBSZXR1cm5zIG5vdGhpbmcuXG4gIGNvbXBvc2U6IChtb3Rpb24pIC0+XG4gICAgaWYgbm90IG1vdGlvbi5zZWxlY3RcbiAgICAgIHRocm93IG5ldyBPcGVyYXRvckVycm9yKCdNdXN0IGNvbXBvc2Ugd2l0aCBhIG1vdGlvbicpXG5cbiAgICBAbW90aW9uID0gbW90aW9uXG4gICAgQGNvbXBsZXRlID0gdHJ1ZVxuXG4gIGNhbkNvbXBvc2VXaXRoOiAob3BlcmF0aW9uKSAtPiBvcGVyYXRpb24uc2VsZWN0P1xuXG4gICMgUHVibGljOiBQcmVwcyB0ZXh0IGFuZCBzZXRzIHRoZSB0ZXh0IHJlZ2lzdGVyXG4gICNcbiAgIyBSZXR1cm5zIG5vdGhpbmdcbiAgc2V0VGV4dFJlZ2lzdGVyOiAocmVnaXN0ZXIsIHRleHQpIC0+XG4gICAgaWYgQG1vdGlvbj8uaXNMaW5ld2lzZT8oKVxuICAgICAgdHlwZSA9ICdsaW5ld2lzZSdcbiAgICAgIGlmIHRleHRbLTEuLl0gaXNudCAnXFxuJ1xuICAgICAgICB0ZXh0ICs9ICdcXG4nXG4gICAgZWxzZVxuICAgICAgdHlwZSA9IFV0aWxzLmNvcHlUeXBlKHRleHQpXG4gICAgQHZpbVN0YXRlLnNldFJlZ2lzdGVyKHJlZ2lzdGVyLCB7dGV4dCwgdHlwZX0pIHVubGVzcyB0ZXh0IGlzICcnXG5cbiMgUHVibGljOiBHZW5lcmljIGNsYXNzIGZvciBhbiBvcGVyYXRvciB0aGF0IHJlcXVpcmVzIGV4dHJhIGlucHV0XG5jbGFzcyBPcGVyYXRvcldpdGhJbnB1dCBleHRlbmRzIE9wZXJhdG9yXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvciwgQHZpbVN0YXRlKSAtPlxuICAgIEBlZGl0b3IgPSBAZWRpdG9yXG4gICAgQGNvbXBsZXRlID0gZmFsc2VcblxuICBjYW5Db21wb3NlV2l0aDogKG9wZXJhdGlvbikgLT4gb3BlcmF0aW9uLmNoYXJhY3RlcnM/IG9yIG9wZXJhdGlvbi5zZWxlY3Q/XG5cbiAgY29tcG9zZTogKG9wZXJhdGlvbikgLT5cbiAgICBpZiBvcGVyYXRpb24uc2VsZWN0P1xuICAgICAgQG1vdGlvbiA9IG9wZXJhdGlvblxuICAgIGlmIG9wZXJhdGlvbi5jaGFyYWN0ZXJzP1xuICAgICAgQGlucHV0ID0gb3BlcmF0aW9uXG4gICAgICBAY29tcGxldGUgPSB0cnVlXG5cbiNcbiMgSXQgZGVsZXRlcyBldmVyeXRoaW5nIHNlbGVjdGVkIGJ5IHRoZSBmb2xsb3dpbmcgbW90aW9uLlxuI1xuY2xhc3MgRGVsZXRlIGV4dGVuZHMgT3BlcmF0b3JcbiAgcmVnaXN0ZXI6IG51bGxcblxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IsIEB2aW1TdGF0ZSkgLT5cbiAgICBAY29tcGxldGUgPSBmYWxzZVxuICAgIEByZWdpc3RlciA9IHNldHRpbmdzLmRlZmF1bHRSZWdpc3RlcigpXG5cbiAgIyBQdWJsaWM6IERlbGV0ZXMgdGhlIHRleHQgc2VsZWN0ZWQgYnkgdGhlIGdpdmVuIG1vdGlvbi5cbiAgI1xuICAjIGNvdW50IC0gVGhlIG51bWJlciBvZiB0aW1lcyB0byBleGVjdXRlLlxuICAjXG4gICMgUmV0dXJucyBub3RoaW5nLlxuICBleGVjdXRlOiAoY291bnQpIC0+XG4gICAgaWYgXy5jb250YWlucyhAbW90aW9uLnNlbGVjdChjb3VudCksIHRydWUpXG4gICAgICBAc2V0VGV4dFJlZ2lzdGVyKEByZWdpc3RlciwgQGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKSlcbiAgICAgIEBlZGl0b3IudHJhbnNhY3QgPT5cbiAgICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICAgIHNlbGVjdGlvbi5kZWxldGVTZWxlY3RlZFRleHQoKVxuICAgICAgZm9yIGN1cnNvciBpbiBAZWRpdG9yLmdldEN1cnNvcnMoKVxuICAgICAgICBpZiBAbW90aW9uLmlzTGluZXdpc2U/KClcbiAgICAgICAgICBjdXJzb3Iuc2tpcExlYWRpbmdXaGl0ZXNwYWNlKClcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGN1cnNvci5tb3ZlTGVmdCgpIGlmIGN1cnNvci5pc0F0RW5kT2ZMaW5lKCkgYW5kIG5vdCBjdXJzb3IuaXNBdEJlZ2lubmluZ09mTGluZSgpXG5cbiAgICBAdmltU3RhdGUuYWN0aXZhdGVOb3JtYWxNb2RlKClcblxuI1xuIyBJdCB0b2dnbGVzIHRoZSBjYXNlIG9mIGV2ZXJ5dGhpbmcgc2VsZWN0ZWQgYnkgdGhlIGZvbGxvd2luZyBtb3Rpb25cbiNcbmNsYXNzIFRvZ2dsZUNhc2UgZXh0ZW5kcyBPcGVyYXRvclxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IsIEB2aW1TdGF0ZSwge0Bjb21wbGV0ZX09e30pIC0+XG5cbiAgZXhlY3V0ZTogKGNvdW50KSAtPlxuICAgIGlmIEBtb3Rpb24/XG4gICAgICBpZiBfLmNvbnRhaW5zKEBtb3Rpb24uc2VsZWN0KGNvdW50KSwgdHJ1ZSlcbiAgICAgICAgQGVkaXRvci5yZXBsYWNlU2VsZWN0ZWRUZXh0IHt9LCAodGV4dCkgLT5cbiAgICAgICAgICB0ZXh0LnNwbGl0KCcnKS5tYXAoKGNoYXIpIC0+XG4gICAgICAgICAgICBsb3dlciA9IGNoYXIudG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgaWYgY2hhciBpcyBsb3dlclxuICAgICAgICAgICAgICBjaGFyLnRvVXBwZXJDYXNlKClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgbG93ZXJcbiAgICAgICAgICApLmpvaW4oJycpXG4gICAgZWxzZVxuICAgICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgICAgICAgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgICAgIGxpbmVMZW5ndGggPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KHBvaW50LnJvdykubGVuZ3RoXG4gICAgICAgICAgY3Vyc29yQ291bnQgPSBNYXRoLm1pbihjb3VudCA/IDEsIGxpbmVMZW5ndGggLSBwb2ludC5jb2x1bW4pXG5cbiAgICAgICAgICBfLnRpbWVzIGN1cnNvckNvdW50LCA9PlxuICAgICAgICAgICAgcG9pbnQgPSBjdXJzb3IuZ2V0QnVmZmVyUG9zaXRpb24oKVxuICAgICAgICAgICAgcmFuZ2UgPSBSYW5nZS5mcm9tUG9pbnRXaXRoRGVsdGEocG9pbnQsIDAsIDEpXG4gICAgICAgICAgICBjaGFyID0gQGVkaXRvci5nZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSlcblxuICAgICAgICAgICAgaWYgY2hhciBpcyBjaGFyLnRvTG93ZXJDYXNlKClcbiAgICAgICAgICAgICAgQGVkaXRvci5zZXRUZXh0SW5CdWZmZXJSYW5nZShyYW5nZSwgY2hhci50b1VwcGVyQ2FzZSgpKVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBAZWRpdG9yLnNldFRleHRJbkJ1ZmZlclJhbmdlKHJhbmdlLCBjaGFyLnRvTG93ZXJDYXNlKCkpXG5cbiAgICAgICAgICAgIGN1cnNvci5tb3ZlUmlnaHQoKSB1bmxlc3MgcG9pbnQuY29sdW1uID49IGxpbmVMZW5ndGggLSAxXG5cbiAgICBAdmltU3RhdGUuYWN0aXZhdGVOb3JtYWxNb2RlKClcblxuI1xuIyBJbiB2aXN1YWwgbW9kZSBvciBhZnRlciBgZ2Agd2l0aCBhIG1vdGlvbiwgaXQgbWFrZXMgdGhlIHNlbGVjdGlvbiB1cHBlcmNhc2VcbiNcbmNsYXNzIFVwcGVyQ2FzZSBleHRlbmRzIE9wZXJhdG9yXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvciwgQHZpbVN0YXRlKSAtPlxuICAgIEBjb21wbGV0ZSA9IGZhbHNlXG5cbiAgZXhlY3V0ZTogKGNvdW50KSAtPlxuICAgIGlmIF8uY29udGFpbnMoQG1vdGlvbi5zZWxlY3QoY291bnQpLCB0cnVlKVxuICAgICAgQGVkaXRvci5yZXBsYWNlU2VsZWN0ZWRUZXh0IHt9LCAodGV4dCkgLT5cbiAgICAgICAgdGV4dC50b1VwcGVyQ2FzZSgpXG5cbiAgICBAdmltU3RhdGUuYWN0aXZhdGVOb3JtYWxNb2RlKClcblxuI1xuIyBJbiB2aXN1YWwgbW9kZSBvciBhZnRlciBgZ2Agd2l0aCBhIG1vdGlvbiwgaXQgbWFrZXMgdGhlIHNlbGVjdGlvbiBsb3dlcmNhc2VcbiNcbmNsYXNzIExvd2VyQ2FzZSBleHRlbmRzIE9wZXJhdG9yXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvciwgQHZpbVN0YXRlKSAtPlxuICAgIEBjb21wbGV0ZSA9IGZhbHNlXG5cbiAgZXhlY3V0ZTogKGNvdW50KSAtPlxuICAgIGlmIF8uY29udGFpbnMoQG1vdGlvbi5zZWxlY3QoY291bnQpLCB0cnVlKVxuICAgICAgQGVkaXRvci5yZXBsYWNlU2VsZWN0ZWRUZXh0IHt9LCAodGV4dCkgLT5cbiAgICAgICAgdGV4dC50b0xvd2VyQ2FzZSgpXG5cbiAgICBAdmltU3RhdGUuYWN0aXZhdGVOb3JtYWxNb2RlKClcblxuI1xuIyBJdCBjb3BpZXMgZXZlcnl0aGluZyBzZWxlY3RlZCBieSB0aGUgZm9sbG93aW5nIG1vdGlvbi5cbiNcbmNsYXNzIFlhbmsgZXh0ZW5kcyBPcGVyYXRvclxuICByZWdpc3RlcjogbnVsbFxuXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvciwgQHZpbVN0YXRlKSAtPlxuICAgIEBlZGl0b3JFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KEBlZGl0b3IpXG4gICAgQHJlZ2lzdGVyID0gc2V0dGluZ3MuZGVmYXVsdFJlZ2lzdGVyKClcblxuICAjIFB1YmxpYzogQ29waWVzIHRoZSB0ZXh0IHNlbGVjdGVkIGJ5IHRoZSBnaXZlbiBtb3Rpb24uXG4gICNcbiAgIyBjb3VudCAtIFRoZSBudW1iZXIgb2YgdGltZXMgdG8gZXhlY3V0ZS5cbiAgI1xuICAjIFJldHVybnMgbm90aGluZy5cbiAgZXhlY3V0ZTogKGNvdW50KSAtPlxuICAgIG9sZFRvcCA9IEBlZGl0b3JFbGVtZW50LmdldFNjcm9sbFRvcCgpXG4gICAgb2xkTGVmdCA9IEBlZGl0b3JFbGVtZW50LmdldFNjcm9sbExlZnQoKVxuICAgIG9sZExhc3RDdXJzb3JQb3NpdGlvbiA9IEBlZGl0b3IuZ2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24oKVxuXG4gICAgb3JpZ2luYWxQb3NpdGlvbnMgPSBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9ucygpXG4gICAgaWYgXy5jb250YWlucyhAbW90aW9uLnNlbGVjdChjb3VudCksIHRydWUpXG4gICAgICB0ZXh0ID0gQGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKVxuICAgICAgc3RhcnRQb3NpdGlvbnMgPSBfLnBsdWNrKEBlZGl0b3IuZ2V0U2VsZWN0ZWRCdWZmZXJSYW5nZXMoKSwgXCJzdGFydFwiKVxuICAgICAgbmV3UG9zaXRpb25zID0gZm9yIG9yaWdpbmFsUG9zaXRpb24sIGkgaW4gb3JpZ2luYWxQb3NpdGlvbnNcbiAgICAgICAgaWYgc3RhcnRQb3NpdGlvbnNbaV1cbiAgICAgICAgICBwb3NpdGlvbiA9IFBvaW50Lm1pbihzdGFydFBvc2l0aW9uc1tpXSwgb3JpZ2luYWxQb3NpdGlvbnNbaV0pXG4gICAgICAgICAgaWYgQHZpbVN0YXRlLm1vZGUgaXNudCAndmlzdWFsJyBhbmQgQG1vdGlvbi5pc0xpbmV3aXNlPygpXG4gICAgICAgICAgICBwb3NpdGlvbiA9IG5ldyBQb2ludChwb3NpdGlvbi5yb3csIG9yaWdpbmFsUG9zaXRpb25zW2ldLmNvbHVtbilcbiAgICAgICAgICBwb3NpdGlvblxuICAgICAgICBlbHNlXG4gICAgICAgICAgb3JpZ2luYWxQb3NpdGlvblxuICAgIGVsc2VcbiAgICAgIHRleHQgPSAnJ1xuICAgICAgbmV3UG9zaXRpb25zID0gb3JpZ2luYWxQb3NpdGlvbnNcblxuICAgIEBzZXRUZXh0UmVnaXN0ZXIoQHJlZ2lzdGVyLCB0ZXh0KVxuXG4gICAgQGVkaXRvci5zZXRTZWxlY3RlZEJ1ZmZlclJhbmdlcyhuZXdQb3NpdGlvbnMubWFwIChwKSAtPiBuZXcgUmFuZ2UocCwgcCkpXG5cbiAgICBpZiBvbGRMYXN0Q3Vyc29yUG9zaXRpb24uaXNFcXVhbChAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgICBAZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxMZWZ0KG9sZExlZnQpXG4gICAgICBAZWRpdG9yRWxlbWVudC5zZXRTY3JvbGxUb3Aob2xkVG9wKVxuXG4gICAgQHZpbVN0YXRlLmFjdGl2YXRlTm9ybWFsTW9kZSgpXG5cbiNcbiMgSXQgY29tYmluZXMgdGhlIGN1cnJlbnQgbGluZSB3aXRoIHRoZSBmb2xsb3dpbmcgbGluZS5cbiNcbmNsYXNzIEpvaW4gZXh0ZW5kcyBPcGVyYXRvclxuICBjb25zdHJ1Y3RvcjogKEBlZGl0b3IsIEB2aW1TdGF0ZSkgLT4gQGNvbXBsZXRlID0gdHJ1ZVxuXG4gICMgUHVibGljOiBDb21iaW5lcyB0aGUgY3VycmVudCB3aXRoIHRoZSBmb2xsb3dpbmcgbGluZXNcbiAgI1xuICAjIGNvdW50IC0gVGhlIG51bWJlciBvZiB0aW1lcyB0byBleGVjdXRlLlxuICAjXG4gICMgUmV0dXJucyBub3RoaW5nLlxuICBleGVjdXRlOiAoY291bnQ9MSkgLT5cbiAgICBAZWRpdG9yLnRyYW5zYWN0ID0+XG4gICAgICBfLnRpbWVzIGNvdW50LCA9PlxuICAgICAgICBAZWRpdG9yLmpvaW5MaW5lcygpXG4gICAgQHZpbVN0YXRlLmFjdGl2YXRlTm9ybWFsTW9kZSgpXG5cbiNcbiMgUmVwZWF0IHRoZSBsYXN0IG9wZXJhdGlvblxuI1xuY2xhc3MgUmVwZWF0IGV4dGVuZHMgT3BlcmF0b3JcbiAgY29uc3RydWN0b3I6IChAZWRpdG9yLCBAdmltU3RhdGUpIC0+IEBjb21wbGV0ZSA9IHRydWVcblxuICBpc1JlY29yZGFibGU6IC0+IGZhbHNlXG5cbiAgZXhlY3V0ZTogKGNvdW50PTEpIC0+XG4gICAgQGVkaXRvci50cmFuc2FjdCA9PlxuICAgICAgXy50aW1lcyBjb3VudCwgPT5cbiAgICAgICAgY21kID0gQHZpbVN0YXRlLmhpc3RvcnlbMF1cbiAgICAgICAgY21kPy5leGVjdXRlKClcbiNcbiMgSXQgY3JlYXRlcyBhIG1hcmsgYXQgdGhlIGN1cnJlbnQgY3Vyc29yIHBvc2l0aW9uXG4jXG5jbGFzcyBNYXJrIGV4dGVuZHMgT3BlcmF0b3JXaXRoSW5wdXRcbiAgY29uc3RydWN0b3I6IChAZWRpdG9yLCBAdmltU3RhdGUpIC0+XG4gICAgc3VwZXIoQGVkaXRvciwgQHZpbVN0YXRlKVxuICAgIEB2aWV3TW9kZWwgPSBuZXcgVmlld01vZGVsKHRoaXMsIGNsYXNzOiAnbWFyaycsIHNpbmdsZUNoYXI6IHRydWUsIGhpZGRlbjogdHJ1ZSlcblxuICAjIFB1YmxpYzogQ3JlYXRlcyB0aGUgbWFyayBpbiB0aGUgc3BlY2lmaWVkIG1hcmsgcmVnaXN0ZXIgKGZyb20gdXNlciBpbnB1dClcbiAgIyBhdCB0aGUgY3VycmVudCBwb3NpdGlvblxuICAjXG4gICMgUmV0dXJucyBub3RoaW5nLlxuICBleGVjdXRlOiAtPlxuICAgIEB2aW1TdGF0ZS5zZXRNYXJrKEBpbnB1dC5jaGFyYWN0ZXJzLCBAZWRpdG9yLmdldEN1cnNvckJ1ZmZlclBvc2l0aW9uKCkpXG4gICAgQHZpbVN0YXRlLmFjdGl2YXRlTm9ybWFsTW9kZSgpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBPcGVyYXRvciwgT3BlcmF0b3JXaXRoSW5wdXQsIE9wZXJhdG9yRXJyb3IsIERlbGV0ZSwgVG9nZ2xlQ2FzZSxcbiAgVXBwZXJDYXNlLCBMb3dlckNhc2UsIFlhbmssIEpvaW4sIFJlcGVhdCwgTWFya1xufVxuIl19
