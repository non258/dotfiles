(function() {
  var CompositeDisposable, Disposable, Emitter, Grim, InsertMode, Motions, Operators, Point, Prefixes, Range, Scroll, TextObjects, Utils, VimState, _, ref, ref1, settings,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Grim = require('grim');

  _ = require('underscore-plus');

  ref = require('atom'), Point = ref.Point, Range = ref.Range;

  ref1 = require('event-kit'), Emitter = ref1.Emitter, Disposable = ref1.Disposable, CompositeDisposable = ref1.CompositeDisposable;

  settings = require('./settings');

  Operators = require('./operators/index');

  Prefixes = require('./prefixes');

  Motions = require('./motions/index');

  InsertMode = require('./insert-mode');

  TextObjects = require('./text-objects');

  Utils = require('./utils');

  Scroll = require('./scroll');

  module.exports = VimState = (function() {
    VimState.prototype.editor = null;

    VimState.prototype.opStack = null;

    VimState.prototype.mode = null;

    VimState.prototype.submode = null;

    VimState.prototype.destroyed = false;

    VimState.prototype.replaceModeListener = null;

    function VimState(editorElement, statusBarManager, globalVimState) {
      this.editorElement = editorElement;
      this.statusBarManager = statusBarManager;
      this.globalVimState = globalVimState;
      this.ensureCursorsWithinLine = bind(this.ensureCursorsWithinLine, this);
      this.checkSelections = bind(this.checkSelections, this);
      this.replaceModeUndoHandler = bind(this.replaceModeUndoHandler, this);
      this.replaceModeInsertHandler = bind(this.replaceModeInsertHandler, this);
      this.emitter = new Emitter;
      this.subscriptions = new CompositeDisposable;
      this.editor = this.editorElement.getModel();
      this.opStack = [];
      this.history = [];
      this.marks = {};
      this.subscriptions.add(this.editor.onDidDestroy((function(_this) {
        return function() {
          return _this.destroy();
        };
      })(this)));
      this.editorElement.addEventListener('mouseup', this.checkSelections);
      if (atom.commands.onDidDispatch != null) {
        this.subscriptions.add(atom.commands.onDidDispatch((function(_this) {
          return function(e) {
            if (e.target === _this.editorElement) {
              return _this.checkSelections();
            }
          };
        })(this)));
      }
      this.editorElement.classList.add("vim-mode");
      this.setupNormalMode();
      if (settings.startInInsertMode()) {
        this.activateInsertMode();
      } else {
        this.activateNormalMode();
      }
    }

    VimState.prototype.destroy = function() {
      var ref2;
      if (!this.destroyed) {
        this.destroyed = true;
        this.subscriptions.dispose();
        if (this.editor.isAlive()) {
          this.deactivateInsertMode();
          if ((ref2 = this.editorElement.component) != null) {
            ref2.setInputEnabled(true);
          }
          this.editorElement.classList.remove("vim-mode");
          this.editorElement.classList.remove("normal-mode");
        }
        this.editorElement.removeEventListener('mouseup', this.checkSelections);
        this.editor = null;
        this.editorElement = null;
        return this.emitter.emit('did-destroy');
      }
    };

    VimState.prototype.setupNormalMode = function() {
      this.registerCommands({
        'activate-normal-mode': (function(_this) {
          return function() {
            return _this.activateNormalMode();
          };
        })(this),
        'activate-linewise-visual-mode': (function(_this) {
          return function() {
            return _this.activateVisualMode('linewise');
          };
        })(this),
        'activate-characterwise-visual-mode': (function(_this) {
          return function() {
            return _this.activateVisualMode('characterwise');
          };
        })(this),
        'activate-blockwise-visual-mode': (function(_this) {
          return function() {
            return _this.activateVisualMode('blockwise');
          };
        })(this),
        'reset-normal-mode': (function(_this) {
          return function() {
            return _this.resetNormalMode();
          };
        })(this),
        'repeat-prefix': (function(_this) {
          return function(e) {
            return _this.repeatPrefix(e);
          };
        })(this),
        'reverse-selections': (function(_this) {
          return function(e) {
            return _this.reverseSelections(e);
          };
        })(this),
        'undo': (function(_this) {
          return function(e) {
            return _this.undo(e);
          };
        })(this),
        'replace-mode-backspace': (function(_this) {
          return function() {
            return _this.replaceModeUndo();
          };
        })(this),
        'insert-mode-put': (function(_this) {
          return function(e) {
            return _this.insertRegister(_this.registerName(e));
          };
        })(this),
        'copy-from-line-above': (function(_this) {
          return function() {
            return InsertMode.copyCharacterFromAbove(_this.editor, _this);
          };
        })(this),
        'copy-from-line-below': (function(_this) {
          return function() {
            return InsertMode.copyCharacterFromBelow(_this.editor, _this);
          };
        })(this)
      });
      return this.registerOperationCommands({
        'activate-insert-mode': (function(_this) {
          return function() {
            return new Operators.Insert(_this.editor, _this);
          };
        })(this),
        'activate-replace-mode': (function(_this) {
          return function() {
            return new Operators.ReplaceMode(_this.editor, _this);
          };
        })(this),
        'substitute': (function(_this) {
          return function() {
            return [new Operators.Change(_this.editor, _this), new Motions.MoveRight(_this.editor, _this)];
          };
        })(this),
        'substitute-line': (function(_this) {
          return function() {
            return [new Operators.Change(_this.editor, _this), new Motions.MoveToRelativeLine(_this.editor, _this)];
          };
        })(this),
        'insert-after': (function(_this) {
          return function() {
            return new Operators.InsertAfter(_this.editor, _this);
          };
        })(this),
        'insert-after-end-of-line': (function(_this) {
          return function() {
            return new Operators.InsertAfterEndOfLine(_this.editor, _this);
          };
        })(this),
        'insert-at-beginning-of-line': (function(_this) {
          return function() {
            return new Operators.InsertAtBeginningOfLine(_this.editor, _this);
          };
        })(this),
        'insert-above-with-newline': (function(_this) {
          return function() {
            return new Operators.InsertAboveWithNewline(_this.editor, _this);
          };
        })(this),
        'insert-below-with-newline': (function(_this) {
          return function() {
            return new Operators.InsertBelowWithNewline(_this.editor, _this);
          };
        })(this),
        'delete': (function(_this) {
          return function() {
            return _this.linewiseAliasedOperator(Operators.Delete);
          };
        })(this),
        'change': (function(_this) {
          return function() {
            return _this.linewiseAliasedOperator(Operators.Change);
          };
        })(this),
        'change-to-last-character-of-line': (function(_this) {
          return function() {
            return [new Operators.Change(_this.editor, _this), new Motions.MoveToLastCharacterOfLine(_this.editor, _this)];
          };
        })(this),
        'delete-right': (function(_this) {
          return function() {
            return [new Operators.Delete(_this.editor, _this), new Motions.MoveRight(_this.editor, _this)];
          };
        })(this),
        'delete-left': (function(_this) {
          return function() {
            return [new Operators.Delete(_this.editor, _this), new Motions.MoveLeft(_this.editor, _this)];
          };
        })(this),
        'delete-to-last-character-of-line': (function(_this) {
          return function() {
            return [new Operators.Delete(_this.editor, _this), new Motions.MoveToLastCharacterOfLine(_this.editor, _this)];
          };
        })(this),
        'toggle-case': (function(_this) {
          return function() {
            return new Operators.ToggleCase(_this.editor, _this);
          };
        })(this),
        'upper-case': (function(_this) {
          return function() {
            return new Operators.UpperCase(_this.editor, _this);
          };
        })(this),
        'lower-case': (function(_this) {
          return function() {
            return new Operators.LowerCase(_this.editor, _this);
          };
        })(this),
        'toggle-case-now': (function(_this) {
          return function() {
            return new Operators.ToggleCase(_this.editor, _this, {
              complete: true
            });
          };
        })(this),
        'yank': (function(_this) {
          return function() {
            return _this.linewiseAliasedOperator(Operators.Yank);
          };
        })(this),
        'yank-line': (function(_this) {
          return function() {
            return [new Operators.Yank(_this.editor, _this), new Motions.MoveToRelativeLine(_this.editor, _this)];
          };
        })(this),
        'put-before': (function(_this) {
          return function() {
            return new Operators.Put(_this.editor, _this, {
              location: 'before'
            });
          };
        })(this),
        'put-after': (function(_this) {
          return function() {
            return new Operators.Put(_this.editor, _this, {
              location: 'after'
            });
          };
        })(this),
        'join': (function(_this) {
          return function() {
            return new Operators.Join(_this.editor, _this);
          };
        })(this),
        'indent': (function(_this) {
          return function() {
            return _this.linewiseAliasedOperator(Operators.Indent);
          };
        })(this),
        'outdent': (function(_this) {
          return function() {
            return _this.linewiseAliasedOperator(Operators.Outdent);
          };
        })(this),
        'auto-indent': (function(_this) {
          return function() {
            return _this.linewiseAliasedOperator(Operators.Autoindent);
          };
        })(this),
        'increase': (function(_this) {
          return function() {
            return new Operators.Increase(_this.editor, _this);
          };
        })(this),
        'decrease': (function(_this) {
          return function() {
            return new Operators.Decrease(_this.editor, _this);
          };
        })(this),
        'move-left': (function(_this) {
          return function() {
            return new Motions.MoveLeft(_this.editor, _this);
          };
        })(this),
        'move-up': (function(_this) {
          return function() {
            return new Motions.MoveUp(_this.editor, _this);
          };
        })(this),
        'move-down': (function(_this) {
          return function() {
            return new Motions.MoveDown(_this.editor, _this);
          };
        })(this),
        'move-right': (function(_this) {
          return function() {
            return new Motions.MoveRight(_this.editor, _this);
          };
        })(this),
        'move-to-next-word': (function(_this) {
          return function() {
            return new Motions.MoveToNextWord(_this.editor, _this);
          };
        })(this),
        'move-to-next-whole-word': (function(_this) {
          return function() {
            return new Motions.MoveToNextWholeWord(_this.editor, _this);
          };
        })(this),
        'move-to-end-of-word': (function(_this) {
          return function() {
            return new Motions.MoveToEndOfWord(_this.editor, _this);
          };
        })(this),
        'move-to-end-of-whole-word': (function(_this) {
          return function() {
            return new Motions.MoveToEndOfWholeWord(_this.editor, _this);
          };
        })(this),
        'move-to-previous-word': (function(_this) {
          return function() {
            return new Motions.MoveToPreviousWord(_this.editor, _this);
          };
        })(this),
        'move-to-previous-whole-word': (function(_this) {
          return function() {
            return new Motions.MoveToPreviousWholeWord(_this.editor, _this);
          };
        })(this),
        'move-to-next-paragraph': (function(_this) {
          return function() {
            return new Motions.MoveToNextParagraph(_this.editor, _this);
          };
        })(this),
        'move-to-next-sentence': (function(_this) {
          return function() {
            return new Motions.MoveToNextSentence(_this.editor, _this);
          };
        })(this),
        'move-to-previous-sentence': (function(_this) {
          return function() {
            return new Motions.MoveToPreviousSentence(_this.editor, _this);
          };
        })(this),
        'move-to-previous-paragraph': (function(_this) {
          return function() {
            return new Motions.MoveToPreviousParagraph(_this.editor, _this);
          };
        })(this),
        'move-to-first-character-of-line': (function(_this) {
          return function() {
            return new Motions.MoveToFirstCharacterOfLine(_this.editor, _this);
          };
        })(this),
        'move-to-first-character-of-line-and-down': (function(_this) {
          return function() {
            return new Motions.MoveToFirstCharacterOfLineAndDown(_this.editor, _this);
          };
        })(this),
        'move-to-last-character-of-line': (function(_this) {
          return function() {
            return new Motions.MoveToLastCharacterOfLine(_this.editor, _this);
          };
        })(this),
        'move-to-last-nonblank-character-of-line-and-down': (function(_this) {
          return function() {
            return new Motions.MoveToLastNonblankCharacterOfLineAndDown(_this.editor, _this);
          };
        })(this),
        'move-to-beginning-of-line': (function(_this) {
          return function(e) {
            return _this.moveOrRepeat(e);
          };
        })(this),
        'move-to-first-character-of-line-up': (function(_this) {
          return function() {
            return new Motions.MoveToFirstCharacterOfLineUp(_this.editor, _this);
          };
        })(this),
        'move-to-first-character-of-line-down': (function(_this) {
          return function() {
            return new Motions.MoveToFirstCharacterOfLineDown(_this.editor, _this);
          };
        })(this),
        'move-to-start-of-file': (function(_this) {
          return function() {
            return new Motions.MoveToStartOfFile(_this.editor, _this);
          };
        })(this),
        'move-to-line': (function(_this) {
          return function() {
            return new Motions.MoveToAbsoluteLine(_this.editor, _this);
          };
        })(this),
        'move-to-top-of-screen': (function(_this) {
          return function() {
            return new Motions.MoveToTopOfScreen(_this.editorElement, _this);
          };
        })(this),
        'move-to-bottom-of-screen': (function(_this) {
          return function() {
            return new Motions.MoveToBottomOfScreen(_this.editorElement, _this);
          };
        })(this),
        'move-to-middle-of-screen': (function(_this) {
          return function() {
            return new Motions.MoveToMiddleOfScreen(_this.editorElement, _this);
          };
        })(this),
        'scroll-down': (function(_this) {
          return function() {
            return new Scroll.ScrollDown(_this.editorElement);
          };
        })(this),
        'scroll-up': (function(_this) {
          return function() {
            return new Scroll.ScrollUp(_this.editorElement);
          };
        })(this),
        'scroll-cursor-to-top': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToTop(_this.editorElement);
          };
        })(this),
        'scroll-cursor-to-top-leave': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToTop(_this.editorElement, {
              leaveCursor: true
            });
          };
        })(this),
        'scroll-cursor-to-middle': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToMiddle(_this.editorElement);
          };
        })(this),
        'scroll-cursor-to-middle-leave': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToMiddle(_this.editorElement, {
              leaveCursor: true
            });
          };
        })(this),
        'scroll-cursor-to-bottom': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToBottom(_this.editorElement);
          };
        })(this),
        'scroll-cursor-to-bottom-leave': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToBottom(_this.editorElement, {
              leaveCursor: true
            });
          };
        })(this),
        'scroll-half-screen-up': (function(_this) {
          return function() {
            return new Motions.ScrollHalfUpKeepCursor(_this.editorElement, _this);
          };
        })(this),
        'scroll-full-screen-up': (function(_this) {
          return function() {
            return new Motions.ScrollFullUpKeepCursor(_this.editorElement, _this);
          };
        })(this),
        'scroll-half-screen-down': (function(_this) {
          return function() {
            return new Motions.ScrollHalfDownKeepCursor(_this.editorElement, _this);
          };
        })(this),
        'scroll-full-screen-down': (function(_this) {
          return function() {
            return new Motions.ScrollFullDownKeepCursor(_this.editorElement, _this);
          };
        })(this),
        'scroll-cursor-to-left': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToLeft(_this.editorElement);
          };
        })(this),
        'scroll-cursor-to-right': (function(_this) {
          return function() {
            return new Scroll.ScrollCursorToRight(_this.editorElement);
          };
        })(this),
        'select-inside-word': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideWord(_this.editor);
          };
        })(this),
        'select-inside-whole-word': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideWholeWord(_this.editor);
          };
        })(this),
        'select-inside-double-quotes': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideQuotes(_this.editor, '"', false);
          };
        })(this),
        'select-inside-single-quotes': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideQuotes(_this.editor, '\'', false);
          };
        })(this),
        'select-inside-back-ticks': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideQuotes(_this.editor, '`', false);
          };
        })(this),
        'select-inside-curly-brackets': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '{', '}', false);
          };
        })(this),
        'select-inside-angle-brackets': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '<', '>', false);
          };
        })(this),
        'select-inside-tags': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '>', '<', false);
          };
        })(this),
        'select-inside-square-brackets': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '[', ']', false);
          };
        })(this),
        'select-inside-parentheses': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '(', ')', false);
          };
        })(this),
        'select-inside-paragraph': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideParagraph(_this.editor, false);
          };
        })(this),
        'select-a-word': (function(_this) {
          return function() {
            return new TextObjects.SelectAWord(_this.editor);
          };
        })(this),
        'select-a-whole-word': (function(_this) {
          return function() {
            return new TextObjects.SelectAWholeWord(_this.editor);
          };
        })(this),
        'select-around-double-quotes': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideQuotes(_this.editor, '"', true);
          };
        })(this),
        'select-around-single-quotes': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideQuotes(_this.editor, '\'', true);
          };
        })(this),
        'select-around-back-ticks': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideQuotes(_this.editor, '`', true);
          };
        })(this),
        'select-around-curly-brackets': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '{', '}', true);
          };
        })(this),
        'select-around-angle-brackets': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '<', '>', true);
          };
        })(this),
        'select-around-square-brackets': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '[', ']', true);
          };
        })(this),
        'select-around-parentheses': (function(_this) {
          return function() {
            return new TextObjects.SelectInsideBrackets(_this.editor, '(', ')', true);
          };
        })(this),
        'select-around-paragraph': (function(_this) {
          return function() {
            return new TextObjects.SelectAParagraph(_this.editor, true);
          };
        })(this),
        'register-prefix': (function(_this) {
          return function(e) {
            return _this.registerPrefix(e);
          };
        })(this),
        'repeat': (function(_this) {
          return function(e) {
            return new Operators.Repeat(_this.editor, _this);
          };
        })(this),
        'repeat-search': (function(_this) {
          return function(e) {
            return new Motions.RepeatSearch(_this.editor, _this);
          };
        })(this),
        'repeat-search-backwards': (function(_this) {
          return function(e) {
            return new Motions.RepeatSearch(_this.editor, _this).reversed();
          };
        })(this),
        'move-to-mark': (function(_this) {
          return function(e) {
            return new Motions.MoveToMark(_this.editor, _this);
          };
        })(this),
        'move-to-mark-literal': (function(_this) {
          return function(e) {
            return new Motions.MoveToMark(_this.editor, _this, false);
          };
        })(this),
        'mark': (function(_this) {
          return function(e) {
            return new Operators.Mark(_this.editor, _this);
          };
        })(this),
        'find': (function(_this) {
          return function(e) {
            return new Motions.Find(_this.editor, _this);
          };
        })(this),
        'find-backwards': (function(_this) {
          return function(e) {
            return new Motions.Find(_this.editor, _this).reverse();
          };
        })(this),
        'till': (function(_this) {
          return function(e) {
            return new Motions.Till(_this.editor, _this);
          };
        })(this),
        'till-backwards': (function(_this) {
          return function(e) {
            return new Motions.Till(_this.editor, _this).reverse();
          };
        })(this),
        'repeat-find': (function(_this) {
          return function(e) {
            if (_this.globalVimState.currentFind) {
              return new _this.globalVimState.currentFind.constructor(_this.editor, _this, {
                repeated: true
              });
            }
          };
        })(this),
        'repeat-find-reverse': (function(_this) {
          return function(e) {
            if (_this.globalVimState.currentFind) {
              return new _this.globalVimState.currentFind.constructor(_this.editor, _this, {
                repeated: true,
                reverse: true
              });
            }
          };
        })(this),
        'replace': (function(_this) {
          return function(e) {
            return new Operators.Replace(_this.editor, _this);
          };
        })(this),
        'search': (function(_this) {
          return function(e) {
            return new Motions.Search(_this.editor, _this);
          };
        })(this),
        'reverse-search': (function(_this) {
          return function(e) {
            return (new Motions.Search(_this.editor, _this)).reversed();
          };
        })(this),
        'search-current-word': (function(_this) {
          return function(e) {
            return new Motions.SearchCurrentWord(_this.editor, _this);
          };
        })(this),
        'bracket-matching-motion': (function(_this) {
          return function(e) {
            return new Motions.BracketMatchingMotion(_this.editor, _this);
          };
        })(this),
        'reverse-search-current-word': (function(_this) {
          return function(e) {
            return (new Motions.SearchCurrentWord(_this.editor, _this)).reversed();
          };
        })(this)
      });
    };

    VimState.prototype.registerCommands = function(commands) {
      var commandName, fn, results;
      results = [];
      for (commandName in commands) {
        fn = commands[commandName];
        results.push((function(_this) {
          return function(fn) {
            return _this.subscriptions.add(atom.commands.add(_this.editorElement, "vim-mode:" + commandName, fn));
          };
        })(this)(fn));
      }
      return results;
    };

    VimState.prototype.registerOperationCommands = function(operationCommands) {
      var commandName, commands, fn1, operationFn;
      commands = {};
      fn1 = (function(_this) {
        return function(operationFn) {
          return commands[commandName] = function(event) {
            return _this.pushOperations(operationFn(event));
          };
        };
      })(this);
      for (commandName in operationCommands) {
        operationFn = operationCommands[commandName];
        fn1(operationFn);
      }
      return this.registerCommands(commands);
    };

    VimState.prototype.pushOperations = function(operations) {
      var i, len, operation, results, topOp;
      if (operations == null) {
        return;
      }
      if (!_.isArray(operations)) {
        operations = [operations];
      }
      results = [];
      for (i = 0, len = operations.length; i < len; i++) {
        operation = operations[i];
        if (this.mode === 'visual' && (operation instanceof Motions.Motion || operation instanceof TextObjects.TextObject)) {
          operation.execute = operation.select;
        }
        if (((topOp = this.topOperation()) != null) && (topOp.canComposeWith != null) && !topOp.canComposeWith(operation)) {
          this.resetNormalMode();
          this.emitter.emit('failed-to-compose');
          break;
        }
        this.opStack.push(operation);
        if (this.mode === 'visual' && operation instanceof Operators.Operator) {
          this.opStack.push(new Motions.CurrentSelection(this.editor, this));
        }
        results.push(this.processOpStack());
      }
      return results;
    };

    VimState.prototype.onDidFailToCompose = function(fn) {
      return this.emitter.on('failed-to-compose', fn);
    };

    VimState.prototype.onDidDestroy = function(fn) {
      return this.emitter.on('did-destroy', fn);
    };

    VimState.prototype.clearOpStack = function() {
      return this.opStack = [];
    };

    VimState.prototype.undo = function() {
      this.editor.undo();
      return this.activateNormalMode();
    };

    VimState.prototype.processOpStack = function() {
      var e, poppedOperation;
      if (!(this.opStack.length > 0)) {
        return;
      }
      if (!this.topOperation().isComplete()) {
        if (this.mode === 'normal' && this.topOperation() instanceof Operators.Operator) {
          this.activateOperatorPendingMode();
        }
        return;
      }
      poppedOperation = this.opStack.pop();
      if (this.opStack.length) {
        try {
          this.topOperation().compose(poppedOperation);
          return this.processOpStack();
        } catch (error) {
          e = error;
          if ((e instanceof Operators.OperatorError) || (e instanceof Motions.MotionError)) {
            return this.resetNormalMode();
          } else {
            throw e;
          }
        }
      } else {
        if (poppedOperation.isRecordable()) {
          this.history.unshift(poppedOperation);
        }
        return poppedOperation.execute();
      }
    };

    VimState.prototype.topOperation = function() {
      return _.last(this.opStack);
    };

    VimState.prototype.getRegister = function(name) {
      var text, type;
      if (name === '"') {
        name = settings.defaultRegister();
      }
      if (name === '*' || name === '+') {
        text = atom.clipboard.read();
        type = Utils.copyType(text);
        return {
          text: text,
          type: type
        };
      } else if (name === '%') {
        text = this.editor.getURI();
        type = Utils.copyType(text);
        return {
          text: text,
          type: type
        };
      } else if (name === "_") {
        text = '';
        type = Utils.copyType(text);
        return {
          text: text,
          type: type
        };
      } else {
        return this.globalVimState.registers[name.toLowerCase()];
      }
    };

    VimState.prototype.getMark = function(name) {
      if (this.marks[name]) {
        return this.marks[name].getBufferRange().start;
      } else {
        return void 0;
      }
    };

    VimState.prototype.setRegister = function(name, value) {
      if (name === '"') {
        name = settings.defaultRegister();
      }
      if (name === '*' || name === '+') {
        return atom.clipboard.write(value.text);
      } else if (name === '_') {

      } else if (/^[A-Z]$/.test(name)) {
        return this.appendRegister(name.toLowerCase(), value);
      } else {
        return this.globalVimState.registers[name] = value;
      }
    };

    VimState.prototype.appendRegister = function(name, value) {
      var base, register;
      register = (base = this.globalVimState.registers)[name] != null ? base[name] : base[name] = {
        type: 'character',
        text: ""
      };
      if (register.type === 'linewise' && value.type !== 'linewise') {
        return register.text += value.text + '\n';
      } else if (register.type !== 'linewise' && value.type === 'linewise') {
        register.text += '\n' + value.text;
        return register.type = 'linewise';
      } else {
        return register.text += value.text;
      }
    };

    VimState.prototype.setMark = function(name, pos) {
      var charCode, marker;
      if ((charCode = name.charCodeAt(0)) >= 96 && charCode <= 122) {
        marker = this.editor.markBufferRange(new Range(pos, pos), {
          invalidate: 'never',
          persistent: false
        });
        return this.marks[name] = marker;
      }
    };

    VimState.prototype.pushSearchHistory = function(search) {
      return this.globalVimState.searchHistory.unshift(search);
    };

    VimState.prototype.getSearchHistoryItem = function(index) {
      if (index == null) {
        index = 0;
      }
      return this.globalVimState.searchHistory[index];
    };

    VimState.prototype.activateNormalMode = function() {
      var i, len, ref2, selection;
      this.deactivateInsertMode();
      this.deactivateVisualMode();
      this.mode = 'normal';
      this.submode = null;
      this.changeModeClass('normal-mode');
      this.clearOpStack();
      ref2 = this.editor.getSelections();
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        selection.clear({
          autoscroll: false
        });
      }
      this.ensureCursorsWithinLine();
      return this.updateStatusBar();
    };

    VimState.prototype.activateCommandMode = function() {
      Grim.deprecate("Use ::activateNormalMode instead");
      return this.activateNormalMode();
    };

    VimState.prototype.activateInsertMode = function(subtype) {
      if (subtype == null) {
        subtype = null;
      }
      this.mode = 'insert';
      this.editorElement.component.setInputEnabled(true);
      this.setInsertionCheckpoint();
      this.submode = subtype;
      this.changeModeClass('insert-mode');
      return this.updateStatusBar();
    };

    VimState.prototype.activateReplaceMode = function() {
      this.activateInsertMode('replace');
      this.replaceModeCounter = 0;
      this.editorElement.classList.add('replace-mode');
      this.subscriptions.add(this.replaceModeListener = this.editor.onWillInsertText(this.replaceModeInsertHandler));
      return this.subscriptions.add(this.replaceModeUndoListener = this.editor.onDidInsertText(this.replaceModeUndoHandler));
    };

    VimState.prototype.replaceModeInsertHandler = function(event) {
      var char, chars, i, j, len, len1, ref2, selection, selections;
      chars = ((ref2 = event.text) != null ? ref2.split('') : void 0) || [];
      selections = this.editor.getSelections();
      for (i = 0, len = chars.length; i < len; i++) {
        char = chars[i];
        if (char === '\n') {
          continue;
        }
        for (j = 0, len1 = selections.length; j < len1; j++) {
          selection = selections[j];
          if (!selection.cursor.isAtEndOfLine()) {
            selection["delete"]();
          }
        }
      }
    };

    VimState.prototype.replaceModeUndoHandler = function(event) {
      return this.replaceModeCounter++;
    };

    VimState.prototype.replaceModeUndo = function() {
      if (this.replaceModeCounter > 0) {
        this.editor.undo();
        this.editor.undo();
        this.editor.moveLeft();
        return this.replaceModeCounter--;
      }
    };

    VimState.prototype.setInsertionCheckpoint = function() {
      if (this.insertionCheckpoint == null) {
        return this.insertionCheckpoint = this.editor.createCheckpoint();
      }
    };

    VimState.prototype.deactivateInsertMode = function() {
      var changes, cursor, i, item, len, ref2, ref3;
      if ((ref2 = this.mode) !== null && ref2 !== 'insert') {
        return;
      }
      this.editorElement.component.setInputEnabled(false);
      this.editorElement.classList.remove('replace-mode');
      this.editor.groupChangesSinceCheckpoint(this.insertionCheckpoint);
      changes = this.editor.buffer.getChangesSinceCheckpoint(this.insertionCheckpoint);
      item = this.inputOperator(this.history[0]);
      this.insertionCheckpoint = null;
      if (item != null) {
        item.confirmChanges(changes);
      }
      ref3 = this.editor.getCursors();
      for (i = 0, len = ref3.length; i < len; i++) {
        cursor = ref3[i];
        if (!cursor.isAtBeginningOfLine()) {
          cursor.moveLeft();
        }
      }
      if (this.replaceModeListener != null) {
        this.replaceModeListener.dispose();
        this.subscriptions.remove(this.replaceModeListener);
        this.replaceModeListener = null;
        this.replaceModeUndoListener.dispose();
        this.subscriptions.remove(this.replaceModeUndoListener);
        return this.replaceModeUndoListener = null;
      }
    };

    VimState.prototype.deactivateVisualMode = function() {
      var i, len, ref2, results, selection;
      if (this.mode !== 'visual') {
        return;
      }
      ref2 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        if (!(selection.isEmpty() || selection.isReversed())) {
          results.push(selection.cursor.moveLeft());
        } else {
          results.push(void 0);
        }
      }
      return results;
    };

    VimState.prototype.inputOperator = function(item) {
      var ref2;
      if (item == null) {
        return item;
      }
      if (typeof item.inputOperator === "function" ? item.inputOperator() : void 0) {
        return item;
      }
      if ((ref2 = item.composedObject) != null ? typeof ref2.inputOperator === "function" ? ref2.inputOperator() : void 0 : void 0) {
        return item.composedObject;
      }
    };

    VimState.prototype.activateVisualMode = function(type) {
      var end, endRow, i, j, k, len, len1, originalRange, ref2, ref3, ref4, ref5, ref6, ref7, ref8, row, selection, start, startRow;
      if (this.mode === 'visual') {
        if (this.submode === type) {
          this.activateNormalMode();
          return;
        }
        this.submode = type;
        if (this.submode === 'linewise') {
          ref2 = this.editor.getSelections();
          for (i = 0, len = ref2.length; i < len; i++) {
            selection = ref2[i];
            originalRange = selection.getBufferRange();
            selection.marker.setProperties({
              originalRange: originalRange
            });
            ref3 = selection.getBufferRowRange(), start = ref3[0], end = ref3[1];
            for (row = j = ref4 = start, ref5 = end; ref4 <= ref5 ? j <= ref5 : j >= ref5; row = ref4 <= ref5 ? ++j : --j) {
              selection.selectLine(row);
            }
          }
        } else if ((ref6 = this.submode) === 'characterwise' || ref6 === 'blockwise') {
          ref7 = this.editor.getSelections();
          for (k = 0, len1 = ref7.length; k < len1; k++) {
            selection = ref7[k];
            originalRange = selection.marker.getProperties().originalRange;
            if (originalRange) {
              ref8 = selection.getBufferRowRange(), startRow = ref8[0], endRow = ref8[1];
              originalRange.start.row = startRow;
              originalRange.end.row = endRow;
              selection.setBufferRange(originalRange);
            }
          }
        }
      } else {
        this.deactivateInsertMode();
        this.mode = 'visual';
        this.submode = type;
        this.changeModeClass('visual-mode');
        if (this.submode === 'linewise') {
          this.editor.selectLinesContainingCursors();
        } else if (this.editor.getSelectedText() === '') {
          this.editor.selectRight();
        }
      }
      return this.updateStatusBar();
    };

    VimState.prototype.resetVisualMode = function() {
      return this.activateVisualMode(this.submode);
    };

    VimState.prototype.activateOperatorPendingMode = function() {
      this.deactivateInsertMode();
      this.mode = 'operator-pending';
      this.submode = null;
      this.changeModeClass('operator-pending-mode');
      return this.updateStatusBar();
    };

    VimState.prototype.changeModeClass = function(targetMode) {
      var i, len, mode, ref2, results;
      ref2 = ['normal-mode', 'insert-mode', 'visual-mode', 'operator-pending-mode'];
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        mode = ref2[i];
        if (mode === targetMode) {
          results.push(this.editorElement.classList.add(mode));
        } else {
          results.push(this.editorElement.classList.remove(mode));
        }
      }
      return results;
    };

    VimState.prototype.resetNormalMode = function() {
      this.clearOpStack();
      this.editor.clearSelections();
      return this.activateNormalMode();
    };

    VimState.prototype.registerPrefix = function(e) {
      return new Prefixes.Register(this.registerName(e));
    };

    VimState.prototype.registerName = function(e) {
      var keyboardEvent, name, ref2, ref3;
      keyboardEvent = (ref2 = (ref3 = e.originalEvent) != null ? ref3.originalEvent : void 0) != null ? ref2 : e.originalEvent;
      name = atom.keymaps.keystrokeForKeyboardEvent(keyboardEvent);
      if (name.lastIndexOf('shift-', 0) === 0) {
        name = name.slice(6);
      }
      return name;
    };

    VimState.prototype.repeatPrefix = function(e) {
      var keyboardEvent, num, ref2, ref3;
      keyboardEvent = (ref2 = (ref3 = e.originalEvent) != null ? ref3.originalEvent : void 0) != null ? ref2 : e.originalEvent;
      num = parseInt(atom.keymaps.keystrokeForKeyboardEvent(keyboardEvent));
      if (this.topOperation() instanceof Prefixes.Repeat) {
        return this.topOperation().addDigit(num);
      } else {
        if (num === 0) {
          return e.abortKeyBinding();
        } else {
          return this.pushOperations(new Prefixes.Repeat(num));
        }
      }
    };

    VimState.prototype.reverseSelections = function() {
      var i, len, ref2, results, reversed, selection;
      reversed = !this.editor.getLastSelection().isReversed();
      ref2 = this.editor.getSelections();
      results = [];
      for (i = 0, len = ref2.length; i < len; i++) {
        selection = ref2[i];
        results.push(selection.setBufferRange(selection.getBufferRange(), {
          reversed: reversed
        }));
      }
      return results;
    };

    VimState.prototype.moveOrRepeat = function(e) {
      if (this.topOperation() instanceof Prefixes.Repeat) {
        this.repeatPrefix(e);
        return null;
      } else {
        return new Motions.MoveToBeginningOfLine(this.editor, this);
      }
    };

    VimState.prototype.linewiseAliasedOperator = function(constructor) {
      if (this.isOperatorPending(constructor)) {
        return new Motions.MoveToRelativeLine(this.editor, this);
      } else {
        return new constructor(this.editor, this);
      }
    };

    VimState.prototype.isOperatorPending = function(constructor) {
      var i, len, op, ref2;
      if (constructor != null) {
        ref2 = this.opStack;
        for (i = 0, len = ref2.length; i < len; i++) {
          op = ref2[i];
          if (op instanceof constructor) {
            return op;
          }
        }
        return false;
      } else {
        return this.opStack.length > 0;
      }
    };

    VimState.prototype.updateStatusBar = function() {
      return this.statusBarManager.update(this.mode, this.submode);
    };

    VimState.prototype.insertRegister = function(name) {
      var ref2, text;
      text = (ref2 = this.getRegister(name)) != null ? ref2.text : void 0;
      if (text != null) {
        return this.editor.insertText(text);
      }
    };

    VimState.prototype.checkSelections = function() {
      if (this.editor == null) {
        return;
      }
      if (this.editor.getSelections().every(function(selection) {
        return selection.isEmpty();
      })) {
        if (this.mode === 'normal') {
          this.ensureCursorsWithinLine();
        }
        if (this.mode === 'visual') {
          return this.activateNormalMode();
        }
      } else {
        if (this.mode === 'normal') {
          return this.activateVisualMode('characterwise');
        }
      }
    };

    VimState.prototype.ensureCursorsWithinLine = function() {
      var cursor, goalColumn, i, len, ref2;
      ref2 = this.editor.getCursors();
      for (i = 0, len = ref2.length; i < len; i++) {
        cursor = ref2[i];
        goalColumn = cursor.goalColumn;
        if (cursor.isAtEndOfLine() && !cursor.isAtBeginningOfLine()) {
          cursor.moveLeft();
        }
        cursor.goalColumn = goalColumn;
      }
      return this.editor.mergeCursors();
    };

    return VimState;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL3ZpbS1tb2RlL2xpYi92aW0tc3RhdGUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxvS0FBQTtJQUFBOztFQUFBLElBQUEsR0FBUSxPQUFBLENBQVEsTUFBUjs7RUFDUixDQUFBLEdBQUksT0FBQSxDQUFRLGlCQUFSOztFQUNKLE1BQWlCLE9BQUEsQ0FBUSxNQUFSLENBQWpCLEVBQUMsaUJBQUQsRUFBUTs7RUFDUixPQUE2QyxPQUFBLENBQVEsV0FBUixDQUE3QyxFQUFDLHNCQUFELEVBQVUsNEJBQVYsRUFBc0I7O0VBQ3RCLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFFWCxTQUFBLEdBQVksT0FBQSxDQUFRLG1CQUFSOztFQUNaLFFBQUEsR0FBVyxPQUFBLENBQVEsWUFBUjs7RUFDWCxPQUFBLEdBQVUsT0FBQSxDQUFRLGlCQUFSOztFQUNWLFVBQUEsR0FBYSxPQUFBLENBQVEsZUFBUjs7RUFFYixXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUNkLEtBQUEsR0FBUSxPQUFBLENBQVEsU0FBUjs7RUFDUixNQUFBLEdBQVMsT0FBQSxDQUFRLFVBQVI7O0VBRVQsTUFBTSxDQUFDLE9BQVAsR0FDTTt1QkFDSixNQUFBLEdBQVE7O3VCQUNSLE9BQUEsR0FBUzs7dUJBQ1QsSUFBQSxHQUFNOzt1QkFDTixPQUFBLEdBQVM7O3VCQUNULFNBQUEsR0FBVzs7dUJBQ1gsbUJBQUEsR0FBcUI7O0lBRVIsa0JBQUMsYUFBRCxFQUFpQixnQkFBakIsRUFBb0MsY0FBcEM7TUFBQyxJQUFDLENBQUEsZ0JBQUQ7TUFBZ0IsSUFBQyxDQUFBLG1CQUFEO01BQW1CLElBQUMsQ0FBQSxpQkFBRDs7Ozs7TUFDL0MsSUFBQyxDQUFBLE9BQUQsR0FBVyxJQUFJO01BQ2YsSUFBQyxDQUFBLGFBQUQsR0FBaUIsSUFBSTtNQUNyQixJQUFDLENB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LElBQUMsQ0FBQSx1QkFBRCxDQUFBLEVBQUE7O1FBQ0EsSUFBeUIsSUFBQyxDQUFBLElBQUQsS0FBUyxRQUFsQztpQkFBQSxJQUFDLENBQUEsa0JBQUQsQ0FBQSxFQUFBO1NBRkY7T0FBQSxNQUFBO1FBSUUsSUFBd0MsSUFBQyxDQUFBLElBQUQsS0FBUyxRQUFqRDtpQkFBQSxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsZUFBcEIsRUFBQTtTQUpGOztJQUZlOzt1QkFTakIsdUJBQUEsR0FBeUIsU0FBQTtBQUN2QixVQUFBO0FBQUE7QUFBQSxXQUFBLHNDQUFBOztRQUNHLGFBQWM7UUFDZixJQUFHLE1BQU0sQ0FBQyxhQUFQLENBQUEsQ0FBQSxJQUEyQixDQUFJLE1BQU0sQ0FBQyxtQkFBUCxDQUFBLENBQWxDO1VBQ0UsTUFBTSxDQUFDLFFBQVAsQ0FBQSxFQURGOztRQUVBLE1BQU0sQ0FBQyxVQUFQLEdBQW9CO0FBSnRCO2FBTUEsSUFBQyxDQUFBLE1BQU0sQ0FBQyxZQUFSLENBQUE7SUFQdUI7Ozs7O0FBeHBCM0IiLCJzb3VyY2VzQ29udGVudCI6WyJHcmltICA9IHJlcXVpcmUgJ2dyaW0nXG5fID0gcmVxdWlyZSAndW5kZXJzY29yZS1wbHVzJ1xue1BvaW50LCBSYW5nZX0gPSByZXF1aXJlICdhdG9tJ1xue0VtaXR0ZXIsIERpc3Bvc2FibGUsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnZXZlbnQta2l0J1xuc2V0dGluZ3MgPSByZXF1aXJlICcuL3NldHRpbmdzJ1xuXG5PcGVyYXRvcnMgPSByZXF1aXJlICcuL29wZXJhdG9ycy9pbmRleCdcblByZWZpeGVzID0gcmVxdWlyZSAnLi9wcmVmaXhlcydcbk1vdGlvbnMgPSByZXF1aXJlICcuL21vdGlvbnMvaW5kZXgnXG5JbnNlcnRNb2RlID0gcmVxdWlyZSAnLi9pbnNlcnQtbW9kZSdcblxuVGV4dE9iamVjdHMgPSByZXF1aXJlICcuL3RleHQtb2JqZWN0cydcblV0aWxzID0gcmVxdWlyZSAnLi91dGlscydcblNjcm9sbCA9IHJlcXVpcmUgJy4vc2Nyb2xsJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBWaW1TdGF0ZVxuICBlZGl0b3I6IG51bGxcbiAgb3BTdGFjazogbnVsbFxuICBtb2RlOiBudWxsXG4gIHN1Ym1vZGU6IG51bGxcbiAgZGVzdHJveWVkOiBmYWxzZVxuICByZXBsYWNlTW9kZUxpc3RlbmVyOiBudWxsXG5cbiAgY29uc3RydWN0b3I6IChAZWRpdG9yRWxlbWVudCwgQHN0YXR1c0Jhck1hbmFnZXIsIEBnbG9iYWxWaW1TdGF0ZSkgLT5cbiAgICBAZW1pdHRlciA9IG5ldyBFbWl0dGVyXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICAgIEBlZGl0b3IgPSBAZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpXG4gICAgQG9wU3RhY2sgPSBbXVxuICAgIEBoaXN0b3J5ID0gW11cbiAgICBAbWFya3MgPSB7fVxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAZWRpdG9yLm9uRGlkRGVzdHJveSA9PiBAZGVzdHJveSgpXG5cbiAgICBAZWRpdG9yRWxlbWVudC5hZGRFdmVudExpc3RlbmVyICdtb3VzZXVwJywgQGNoZWNrU2VsZWN0aW9uc1xuICAgIGlmIGF0b20uY29tbWFuZHMub25EaWREaXNwYXRjaD9cbiAgICAgIEBzdWJzY3JpcHRpb25zLmFkZCBhdG9tLmNvbW1hbmRzLm9uRGlkRGlzcGF0Y2ggKGUpID0+XG4gICAgICAgIGlmIGUudGFyZ2V0IGlzIEBlZGl0b3JFbGVtZW50XG4gICAgICAgICAgQGNoZWNrU2VsZWN0aW9ucygpXG5cbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QuYWRkKFwidmltLW1vZGVcIilcbiAgICBAc2V0dXBOb3JtYWxNb2RlKClcbiAgICBpZiBzZXR0aW5ncy5zdGFydEluSW5zZXJ0TW9kZSgpXG4gICAgICBAYWN0aXZhdGVJbnNlcnRNb2RlKClcbiAgICBlbHNlXG4gICAgICBAYWN0aXZhdGVOb3JtYWxNb2RlKClcblxuICBkZXN0cm95OiAtPlxuICAgIHVubGVzcyBAZGVzdHJveWVkXG4gICAgICBAZGVzdHJveWVkID0gdHJ1ZVxuICAgICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgICBpZiBAZWRpdG9yLmlzQWxpdmUoKVxuICAgICAgICBAZGVhY3RpdmF0ZUluc2VydE1vZGUoKVxuICAgICAgICBAZWRpdG9yRWxlbWVudC5jb21wb25lbnQ/LnNldElucHV0RW5hYmxlZCh0cnVlKVxuICAgICAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwidmltLW1vZGVcIilcbiAgICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcIm5vcm1hbC1tb2RlXCIpXG4gICAgICBAZWRpdG9yRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyICdtb3VzZXVwJywgQGNoZWNrU2VsZWN0aW9uc1xuICAgICAgQGVkaXRvciA9IG51bGxcbiAgICAgIEBlZGl0b3JFbGVtZW50ID0gbnVsbFxuICAgICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWRlc3Ryb3knXG5cbiAgIyBQcml2YXRlOiBDcmVhdGVzIHRoZSBwbHVnaW4ncyBiaW5kaW5nc1xuICAjXG4gICMgUmV0dXJucyBub3RoaW5nLlxuICBzZXR1cE5vcm1hbE1vZGU6IC0+XG4gICAgQHJlZ2lzdGVyQ29tbWFuZHNcbiAgICAgICdhY3RpdmF0ZS1ub3JtYWwtbW9kZSc6ID0+IEBhY3RpdmF0ZU5vcm1hbE1vZGUoKVxuICAgICAgJ2FjdGl2YXRlLWxpbmV3aXNlLXZpc3VhbC1tb2RlJzogPT4gQGFjdGl2YXRlVmlzdWFsTW9kZSgnbGluZXdpc2UnKVxuICAgICAgJ2FjdGl2YXRlLWNoYXJhY3Rlcndpc2UtdmlzdWFsLW1vZGUnOiA9PiBAYWN0aXZhdGVWaXN1YWxNb2RlKCdjaGFyYWN0ZXJ3aXNlJylcbiAgICAgICdhY3RpdmF0ZS1ibG9ja3dpc2UtdmlzdWFsLW1vZGUnOiA9PiBAYWN0aXZhdGVWaXN1YWxNb2RlKCdibG9ja3dpc2UnKVxuICAgICAgJ3Jlc2V0LW5vcm1hbC1tb2RlJzogPT4gQHJlc2V0Tm9ybWFsTW9kZSgpXG4gICAgICAncmVwZWF0LXByZWZpeCc6IChlKSA9PiBAcmVwZWF0UHJlZml4KGUpXG4gICAgICAncmV2ZXJzZS1zZWxlY3Rpb25zJzogKGUpID0+IEByZXZlcnNlU2VsZWN0aW9ucyhlKVxuICAgICAgJ3VuZG8nOiAoZSkgPT4gQHVuZG8oZSlcbiAgICAgICdyZXBsYWNlLW1vZGUtYmFja3NwYWNlJzogPT4gQHJlcGxhY2VNb2RlVW5kbygpXG4gICAgICAnaW5zZXJ0LW1vZGUtcHV0JzogKGUpID0+IEBpbnNlcnRSZWdpc3RlcihAcmVnaXN0ZXJOYW1lKGUpKVxuICAgICAgJ2NvcHktZnJvbS1saW5lLWFib3ZlJzogPT4gSW5zZXJ0TW9kZS5jb3B5Q2hhcmFjdGVyRnJvbUFib3ZlKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnY29weS1mcm9tLWxpbmUtYmVsb3cnOiA9PiBJbnNlcnRNb2RlLmNvcHlDaGFyYWN0ZXJGcm9tQmVsb3coQGVkaXRvciwgdGhpcylcblxuICAgIEByZWdpc3Rlck9wZXJhdGlvbkNvbW1hbmRzXG4gICAgICAnYWN0aXZhdGUtaW5zZXJ0LW1vZGUnOiA9PiBuZXcgT3BlcmF0b3JzLkluc2VydChAZWRpdG9yLCB0aGlzKVxuICAgICAgJ2FjdGl2YXRlLXJlcGxhY2UtbW9kZSc6ID0+IG5ldyBPcGVyYXRvcnMuUmVwbGFjZU1vZGUoQGVkaXRvciwgdGhpcylcbiAgICAgICdzdWJzdGl0dXRlJzogPT4gW25ldyBPcGVyYXRvcnMuQ2hhbmdlKEBlZGl0b3IsIHRoaXMpLCBuZXcgTW90aW9ucy5Nb3ZlUmlnaHQoQGVkaXRvciwgdGhpcyldXG4gICAgICAnc3Vic3RpdHV0ZS1saW5lJzogPT4gW25ldyBPcGVyYXRvcnMuQ2hhbmdlKEBlZGl0b3IsIHRoaXMpLCBuZXcgTW90aW9ucy5Nb3ZlVG9SZWxhdGl2ZUxpbmUoQGVkaXRvciwgdGhpcyldXG4gICAgICAnaW5zZXJ0LWFmdGVyJzogPT4gbmV3IE9wZXJhdG9ycy5JbnNlcnRBZnRlcihAZWRpdG9yLCB0aGlzKVxuICAgICAgJ2luc2VydC1hZnRlci1lbmQtb2YtbGluZSc6ID0+IG5ldyBPcGVyYXRvcnMuSW5zZXJ0QWZ0ZXJFbmRPZkxpbmUoQGVkaXRvciwgdGhpcylcbiAgICAgICdpbnNlcnQtYXQtYmVnaW5uaW5nLW9mLWxpbmUnOiA9PiBuZXcgT3BlcmF0b3JzLkluc2VydEF0QmVnaW5uaW5nT2ZMaW5lKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnaW5zZXJ0LWFib3ZlLXdpdGgtbmV3bGluZSc6ID0+IG5ldyBPcGVyYXRvcnMuSW5zZXJ0QWJvdmVXaXRoTmV3bGluZShAZWRpdG9yLCB0aGlzKVxuICAgICAgJ2luc2VydC1iZWxvdy13aXRoLW5ld2xpbmUnOiA9PiBuZXcgT3BlcmF0b3JzLkluc2VydEJlbG93V2l0aE5ld2xpbmUoQGVkaXRvciwgdGhpcylcbiAgICAgICdkZWxldGUnOiA9PiBAbGluZXdpc2VBbGlhc2VkT3BlcmF0b3IoT3BlcmF0b3JzLkRlbGV0ZSlcbiAgICAgICdjaGFuZ2UnOiA9PiBAbGluZXdpc2VBbGlhc2VkT3BlcmF0b3IoT3BlcmF0b3JzLkNoYW5nZSlcbiAgICAgICdjaGFuZ2UtdG8tbGFzdC1jaGFyYWN0ZXItb2YtbGluZSc6ID0+IFtuZXcgT3BlcmF0b3JzLkNoYW5nZShAZWRpdG9yLCB0aGlzKSwgbmV3IE1vdGlvbnMuTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZShAZWRpdG9yLCB0aGlzKV1cbiAgICAgICdkZWxldGUtcmlnaHQnOiA9PiBbbmV3IE9wZXJhdG9ycy5EZWxldGUoQGVkaXRvciwgdGhpcyksIG5ldyBNb3Rpb25zLk1vdmVSaWdodChAZWRpdG9yLCB0aGlzKV1cbiAgICAgICdkZWxldGUtbGVmdCc6ID0+IFtuZXcgT3BlcmF0b3JzLkRlbGV0ZShAZWRpdG9yLCB0aGlzKSwgbmV3IE1vdGlvbnMuTW92ZUxlZnQoQGVkaXRvciwgdGhpcyldXG4gICAgICAnZGVsZXRlLXRvLWxhc3QtY2hhcmFjdGVyLW9mLWxpbmUnOiA9PiBbbmV3IE9wZXJhdG9ycy5EZWxldGUoQGVkaXRvciwgdGhpcyksIG5ldyBNb3Rpb25zLk1vdmVUb0xhc3RDaGFyYWN0ZXJPZkxpbmUoQGVkaXRvciwgdGhpcyldXG4gICAgICAndG9nZ2xlLWNhc2UnOiA9PiBuZXcgT3BlcmF0b3JzLlRvZ2dsZUNhc2UoQGVkaXRvciwgdGhpcylcbiAgICAgICd1cHBlci1jYXNlJzogPT4gbmV3IE9wZXJhdG9ycy5VcHBlckNhc2UoQGVkaXRvciwgdGhpcylcbiAgICAgICdsb3dlci1jYXNlJzogPT4gbmV3IE9wZXJhdG9ycy5Mb3dlckNhc2UoQGVkaXRvciwgdGhpcylcbiAgICAgICd0b2dnbGUtY2FzZS1ub3cnOiA9PiBuZXcgT3BlcmF0b3JzLlRvZ2dsZUNhc2UoQGVkaXRvciwgdGhpcywgY29tcGxldGU6IHRydWUpXG4gICAgICAneWFuayc6ID0+IEBsaW5ld2lzZUFsaWFzZWRPcGVyYXRvcihPcGVyYXRvcnMuWWFuaylcbiAgICAgICd5YW5rLWxpbmUnOiA9PiBbbmV3IE9wZXJhdG9ycy5ZYW5rKEBlZGl0b3IsIHRoaXMpLCBuZXcgTW90aW9ucy5Nb3ZlVG9SZWxhdGl2ZUxpbmUoQGVkaXRvciwgdGhpcyldXG4gICAgICAncHV0LWJlZm9yZSc6ID0+IG5ldyBPcGVyYXRvcnMuUHV0KEBlZGl0b3IsIHRoaXMsIGxvY2F0aW9uOiAnYmVmb3JlJylcbiAgICAgICdwdXQtYWZ0ZXInOiA9PiBuZXcgT3BlcmF0b3JzLlB1dChAZWRpdG9yLCB0aGlzLCBsb2NhdGlvbjogJ2FmdGVyJylcbiAgICAgICdqb2luJzogPT4gbmV3IE9wZXJhdG9ycy5Kb2luKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnaW5kZW50JzogPT4gQGxpbmV3aXNlQWxpYXNlZE9wZXJhdG9yKE9wZXJhdG9ycy5JbmRlbnQpXG4gICAgICAnb3V0ZGVudCc6ID0+IEBsaW5ld2lzZUFsaWFzZWRPcGVyYXRvcihPcGVyYXRvcnMuT3V0ZGVudClcbiAgICAgICdhdXRvLWluZGVudCc6ID0+IEBsaW5ld2lzZUFsaWFzZWRPcGVyYXRvcihPcGVyYXRvcnMuQXV0b2luZGVudClcbiAgICAgICdpbmNyZWFzZSc6ID0+IG5ldyBPcGVyYXRvcnMuSW5jcmVhc2UoQGVkaXRvciwgdGhpcylcbiAgICAgICdkZWNyZWFzZSc6ID0+IG5ldyBPcGVyYXRvcnMuRGVjcmVhc2UoQGVkaXRvciwgdGhpcylcbiAgICAgICdtb3ZlLWxlZnQnOiA9PiBuZXcgTW90aW9ucy5Nb3ZlTGVmdChAZWRpdG9yLCB0aGlzKVxuICAgICAgJ21vdmUtdXAnOiA9PiBuZXcgTW90aW9ucy5Nb3ZlVXAoQGVkaXRvciwgdGhpcylcbiAgICAgICdtb3ZlLWRvd24nOiA9PiBuZXcgTW90aW9ucy5Nb3ZlRG93bihAZWRpdG9yLCB0aGlzKVxuICAgICAgJ21vdmUtcmlnaHQnOiA9PiBuZXcgTW90aW9ucy5Nb3ZlUmlnaHQoQGVkaXRvciwgdGhpcylcbiAgICAgICdtb3ZlLXRvLW5leHQtd29yZCc6ID0+IG5ldyBNb3Rpb25zLk1vdmVUb05leHRXb3JkKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnbW92ZS10by1uZXh0LXdob2xlLXdvcmQnOiA9PiBuZXcgTW90aW9ucy5Nb3ZlVG9OZXh0V2hvbGVXb3JkKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnbW92ZS10by1lbmQtb2Ytd29yZCc6ID0+IG5ldyBNb3Rpb25zLk1vdmVUb0VuZE9mV29yZChAZWRpdG9yLCB0aGlzKVxuICAgICAgJ21vdmUtdG8tZW5kLW9mLXdob2xlLXdvcmQnOiA9PiBuZXcgTW90aW9ucy5Nb3ZlVG9FbmRPZldob2xlV29yZChAZWRpdG9yLCB0aGlzKVxuICAgICAgJ21vdmUtdG8tcHJldmlvdXMtd29yZCc6ID0+IG5ldyBNb3Rpb25zLk1vdmVUb1ByZXZpb3VzV29yZChAZWRpdG9yLCB0aGlzKVxuICAgICAgJ21vdmUtdG8tcHJldmlvdXMtd2hvbGUtd29yZCc6ID0+IG5ldyBNb3Rpb25zLk1vdmVUb1ByZXZpb3VzV2hvbGVXb3JkKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnbW92ZS10by1uZXh0LXBhcmFncmFwaCc6ID0+IG5ldyBNb3Rpb25zLk1vdmVUb05leHRQYXJhZ3JhcGgoQGVkaXRvciwgdGhpcylcbiAgICAgICdtb3ZlLXRvLW5leHQtc2VudGVuY2UnOiA9PiBuZXcgTW90aW9ucy5Nb3ZlVG9OZXh0U2VudGVuY2UoQGVkaXRvciwgdGhpcylcbiAgICAgICdtb3ZlLXRvLXByZXZpb3VzLXNlbnRlbmNlJzogPT4gbmV3IE1vdGlvbnMuTW92ZVRvUHJldmlvdXNTZW50ZW5jZShAZWRpdG9yLCB0aGlzKVxuICAgICAgJ21vdmUtdG8tcHJldmlvdXMtcGFyYWdyYXBoJzogPT4gbmV3IE1vdGlvbnMuTW92ZVRvUHJldmlvdXNQYXJhZ3JhcGgoQGVkaXRvciwgdGhpcylcbiAgICAgICdtb3ZlLXRvLWZpcnN0LWNoYXJhY3Rlci1vZi1saW5lJzogPT4gbmV3IE1vdGlvbnMuTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmUoQGVkaXRvciwgdGhpcylcbiAgICAgICdtb3ZlLXRvLWZpcnN0LWNoYXJhY3Rlci1vZi1saW5lLWFuZC1kb3duJzogPT4gbmV3IE1vdGlvbnMuTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVBbmREb3duKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnbW92ZS10by1sYXN0LWNoYXJhY3Rlci1vZi1saW5lJzogPT4gbmV3IE1vdGlvbnMuTW92ZVRvTGFzdENoYXJhY3Rlck9mTGluZShAZWRpdG9yLCB0aGlzKVxuICAgICAgJ21vdmUtdG8tbGFzdC1ub25ibGFuay1jaGFyYWN0ZXItb2YtbGluZS1hbmQtZG93bic6ID0+IG5ldyBNb3Rpb25zLk1vdmVUb0xhc3ROb25ibGFua0NoYXJhY3Rlck9mTGluZUFuZERvd24oQGVkaXRvciwgdGhpcylcbiAgICAgICdtb3ZlLXRvLWJlZ2lubmluZy1vZi1saW5lJzogKGUpID0+IEBtb3ZlT3JSZXBlYXQoZSlcbiAgICAgICdtb3ZlLXRvLWZpcnN0LWNoYXJhY3Rlci1vZi1saW5lLXVwJzogPT4gbmV3IE1vdGlvbnMuTW92ZVRvRmlyc3RDaGFyYWN0ZXJPZkxpbmVVcChAZWRpdG9yLCB0aGlzKVxuICAgICAgJ21vdmUtdG8tZmlyc3QtY2hhcmFjdGVyLW9mLWxpbmUtZG93bic6ID0+IG5ldyBNb3Rpb25zLk1vdmVUb0ZpcnN0Q2hhcmFjdGVyT2ZMaW5lRG93bihAZWRpdG9yLCB0aGlzKVxuICAgICAgJ21vdmUtdG8tc3RhcnQtb2YtZmlsZSc6ID0+IG5ldyBNb3Rpb25zLk1vdmVUb1N0YXJ0T2ZGaWxlKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnbW92ZS10by1saW5lJzogPT4gbmV3IE1vdGlvbnMuTW92ZVRvQWJzb2x1dGVMaW5lKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnbW92ZS10by10b3Atb2Ytc2NyZWVuJzogPT4gbmV3IE1vdGlvbnMuTW92ZVRvVG9wT2ZTY3JlZW4oQGVkaXRvckVsZW1lbnQsIHRoaXMpXG4gICAgICAnbW92ZS10by1ib3R0b20tb2Ytc2NyZWVuJzogPT4gbmV3IE1vdGlvbnMuTW92ZVRvQm90dG9tT2ZTY3JlZW4oQGVkaXRvckVsZW1lbnQsIHRoaXMpXG4gICAgICAnbW92ZS10by1taWRkbGUtb2Ytc2NyZWVuJzogPT4gbmV3IE1vdGlvbnMuTW92ZVRvTWlkZGxlT2ZTY3JlZW4oQGVkaXRvckVsZW1lbnQsIHRoaXMpXG4gICAgICAnc2Nyb2xsLWRvd24nOiA9PiBuZXcgU2Nyb2xsLlNjcm9sbERvd24oQGVkaXRvckVsZW1lbnQpXG4gICAgICAnc2Nyb2xsLXVwJzogPT4gbmV3IFNjcm9sbC5TY3JvbGxVcChAZWRpdG9yRWxlbWVudClcbiAgICAgICdzY3JvbGwtY3Vyc29yLXRvLXRvcCc6ID0+IG5ldyBTY3JvbGwuU2Nyb2xsQ3Vyc29yVG9Ub3AoQGVkaXRvckVsZW1lbnQpXG4gICAgICAnc2Nyb2xsLWN1cnNvci10by10b3AtbGVhdmUnOiA9PiBuZXcgU2Nyb2xsLlNjcm9sbEN1cnNvclRvVG9wKEBlZGl0b3JFbGVtZW50LCB7bGVhdmVDdXJzb3I6IHRydWV9KVxuICAgICAgJ3Njcm9sbC1jdXJzb3ItdG8tbWlkZGxlJzogPT4gbmV3IFNjcm9sbC5TY3JvbGxDdXJzb3JUb01pZGRsZShAZWRpdG9yRWxlbWVudClcbiAgICAgICdzY3JvbGwtY3Vyc29yLXRvLW1pZGRsZS1sZWF2ZSc6ID0+IG5ldyBTY3JvbGwuU2Nyb2xsQ3Vyc29yVG9NaWRkbGUoQGVkaXRvckVsZW1lbnQsIHtsZWF2ZUN1cnNvcjogdHJ1ZX0pXG4gICAgICAnc2Nyb2xsLWN1cnNvci10by1ib3R0b20nOiA9PiBuZXcgU2Nyb2xsLlNjcm9sbEN1cnNvclRvQm90dG9tKEBlZGl0b3JFbGVtZW50KVxuICAgICAgJ3Njcm9sbC1jdXJzb3ItdG8tYm90dG9tLWxlYXZlJzogPT4gbmV3IFNjcm9sbC5TY3JvbGxDdXJzb3JUb0JvdHRvbShAZWRpdG9yRWxlbWVudCwge2xlYXZlQ3Vyc29yOiB0cnVlfSlcbiAgICAgICdzY3JvbGwtaGFsZi1zY3JlZW4tdXAnOiA9PiBuZXcgTW90aW9ucy5TY3JvbGxIYWxmVXBLZWVwQ3Vyc29yKEBlZGl0b3JFbGVtZW50LCB0aGlzKVxuICAgICAgJ3Njcm9sbC1mdWxsLXNjcmVlbi11cCc6ID0+IG5ldyBNb3Rpb25zLlNjcm9sbEZ1bGxVcEtlZXBDdXJzb3IoQGVkaXRvckVsZW1lbnQsIHRoaXMpXG4gICAgICAnc2Nyb2xsLWhhbGYtc2NyZWVuLWRvd24nOiA9PiBuZXcgTW90aW9ucy5TY3JvbGxIYWxmRG93bktlZXBDdXJzb3IoQGVkaXRvckVsZW1lbnQsIHRoaXMpXG4gICAgICAnc2Nyb2xsLWZ1bGwtc2NyZWVuLWRvd24nOiA9PiBuZXcgTW90aW9ucy5TY3JvbGxGdWxsRG93bktlZXBDdXJzb3IoQGVkaXRvckVsZW1lbnQsIHRoaXMpXG4gICAgICAnc2Nyb2xsLWN1cnNvci10by1sZWZ0JzogPT4gbmV3IFNjcm9sbC5TY3JvbGxDdXJzb3JUb0xlZnQoQGVkaXRvckVsZW1lbnQpXG4gICAgICAnc2Nyb2xsLWN1cnNvci10by1yaWdodCc6ID0+IG5ldyBTY3JvbGwuU2Nyb2xsQ3Vyc29yVG9SaWdodChAZWRpdG9yRWxlbWVudClcbiAgICAgICdzZWxlY3QtaW5zaWRlLXdvcmQnOiA9PiBuZXcgVGV4dE9iamVjdHMuU2VsZWN0SW5zaWRlV29yZChAZWRpdG9yKVxuICAgICAgJ3NlbGVjdC1pbnNpZGUtd2hvbGUtd29yZCc6ID0+IG5ldyBUZXh0T2JqZWN0cy5TZWxlY3RJbnNpZGVXaG9sZVdvcmQoQGVkaXRvcilcbiAgICAgICdzZWxlY3QtaW5zaWRlLWRvdWJsZS1xdW90ZXMnOiA9PiBuZXcgVGV4dE9iamVjdHMuU2VsZWN0SW5zaWRlUXVvdGVzKEBlZGl0b3IsICdcIicsIGZhbHNlKVxuICAgICAgJ3NlbGVjdC1pbnNpZGUtc2luZ2xlLXF1b3Rlcyc6ID0+IG5ldyBUZXh0T2JqZWN0cy5TZWxlY3RJbnNpZGVRdW90ZXMoQGVkaXRvciwgJ1xcJycsIGZhbHNlKVxuICAgICAgJ3NlbGVjdC1pbnNpZGUtYmFjay10aWNrcyc6ID0+IG5ldyBUZXh0T2JqZWN0cy5TZWxlY3RJbnNpZGVRdW90ZXMoQGVkaXRvciwgJ2AnLCBmYWxzZSlcbiAgICAgICdzZWxlY3QtaW5zaWRlLWN1cmx5LWJyYWNrZXRzJzogPT4gbmV3IFRleHRPYmplY3RzLlNlbGVjdEluc2lkZUJyYWNrZXRzKEBlZGl0b3IsICd7JywgJ30nLCBmYWxzZSlcbiAgICAgICdzZWxlY3QtaW5zaWRlLWFuZ2xlLWJyYWNrZXRzJzogPT4gbmV3IFRleHRPYmplY3RzLlNlbGVjdEluc2lkZUJyYWNrZXRzKEBlZGl0b3IsICc8JywgJz4nLCBmYWxzZSlcbiAgICAgICdzZWxlY3QtaW5zaWRlLXRhZ3MnOiA9PiBuZXcgVGV4dE9iamVjdHMuU2VsZWN0SW5zaWRlQnJhY2tldHMoQGVkaXRvciwgJz4nLCAnPCcsIGZhbHNlKVxuICAgICAgJ3NlbGVjdC1pbnNpZGUtc3F1YXJlLWJyYWNrZXRzJzogPT4gbmV3IFRleHRPYmplY3RzLlNlbGVjdEluc2lkZUJyYWNrZXRzKEBlZGl0b3IsICdbJywgJ10nLCBmYWxzZSlcbiAgICAgICdzZWxlY3QtaW5zaWRlLXBhcmVudGhlc2VzJzogPT4gbmV3IFRleHRPYmplY3RzLlNlbGVjdEluc2lkZUJyYWNrZXRzKEBlZGl0b3IsICcoJywgJyknLCBmYWxzZSlcbiAgICAgICdzZWxlY3QtaW5zaWRlLXBhcmFncmFwaCc6ID0+IG5ldyBUZXh0T2JqZWN0cy5TZWxlY3RJbnNpZGVQYXJhZ3JhcGgoQGVkaXRvciwgZmFsc2UpXG4gICAgICAnc2VsZWN0LWEtd29yZCc6ID0+IG5ldyBUZXh0T2JqZWN0cy5TZWxlY3RBV29yZChAZWRpdG9yKVxuICAgICAgJ3NlbGVjdC1hLXdob2xlLXdvcmQnOiA9PiBuZXcgVGV4dE9iamVjdHMuU2VsZWN0QVdob2xlV29yZChAZWRpdG9yKVxuICAgICAgJ3NlbGVjdC1hcm91bmQtZG91YmxlLXF1b3Rlcyc6ID0+IG5ldyBUZXh0T2JqZWN0cy5TZWxlY3RJbnNpZGVRdW90ZXMoQGVkaXRvciwgJ1wiJywgdHJ1ZSlcbiAgICAgICdzZWxlY3QtYXJvdW5kLXNpbmdsZS1xdW90ZXMnOiA9PiBuZXcgVGV4dE9iamVjdHMuU2VsZWN0SW5zaWRlUXVvdGVzKEBlZGl0b3IsICdcXCcnLCB0cnVlKVxuICAgICAgJ3NlbGVjdC1hcm91bmQtYmFjay10aWNrcyc6ID0+IG5ldyBUZXh0T2JqZWN0cy5TZWxlY3RJbnNpZGVRdW90ZXMoQGVkaXRvciwgJ2AnLCB0cnVlKVxuICAgICAgJ3NlbGVjdC1hcm91bmQtY3VybHktYnJhY2tldHMnOiA9PiBuZXcgVGV4dE9iamVjdHMuU2VsZWN0SW5zaWRlQnJhY2tldHMoQGVkaXRvciwgJ3snLCAnfScsIHRydWUpXG4gICAgICAnc2VsZWN0LWFyb3VuZC1hbmdsZS1icmFja2V0cyc6ID0+IG5ldyBUZXh0T2JqZWN0cy5TZWxlY3RJbnNpZGVCcmFja2V0cyhAZWRpdG9yLCAnPCcsICc+JywgdHJ1ZSlcbiAgICAgICdzZWxlY3QtYXJvdW5kLXNxdWFyZS1icmFja2V0cyc6ID0+IG5ldyBUZXh0T2JqZWN0cy5TZWxlY3RJbnNpZGVCcmFja2V0cyhAZWRpdG9yLCAnWycsICddJywgdHJ1ZSlcbiAgICAgICdzZWxlY3QtYXJvdW5kLXBhcmVudGhlc2VzJzogPT4gbmV3IFRleHRPYmplY3RzLlNlbGVjdEluc2lkZUJyYWNrZXRzKEBlZGl0b3IsICcoJywgJyknLCB0cnVlKVxuICAgICAgJ3NlbGVjdC1hcm91bmQtcGFyYWdyYXBoJzogPT4gbmV3IFRleHRPYmplY3RzLlNlbGVjdEFQYXJhZ3JhcGgoQGVkaXRvciwgdHJ1ZSlcbiAgICAgICdyZWdpc3Rlci1wcmVmaXgnOiAoZSkgPT4gQHJlZ2lzdGVyUHJlZml4KGUpXG4gICAgICAncmVwZWF0JzogKGUpID0+IG5ldyBPcGVyYXRvcnMuUmVwZWF0KEBlZGl0b3IsIHRoaXMpXG4gICAgICAncmVwZWF0LXNlYXJjaCc6IChlKSA9PiBuZXcgTW90aW9ucy5SZXBlYXRTZWFyY2goQGVkaXRvciwgdGhpcylcbiAgICAgICdyZXBlYXQtc2VhcmNoLWJhY2t3YXJkcyc6IChlKSA9PiBuZXcgTW90aW9ucy5SZXBlYXRTZWFyY2goQGVkaXRvciwgdGhpcykucmV2ZXJzZWQoKVxuICAgICAgJ21vdmUtdG8tbWFyayc6IChlKSA9PiBuZXcgTW90aW9ucy5Nb3ZlVG9NYXJrKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnbW92ZS10by1tYXJrLWxpdGVyYWwnOiAoZSkgPT4gbmV3IE1vdGlvbnMuTW92ZVRvTWFyayhAZWRpdG9yLCB0aGlzLCBmYWxzZSlcbiAgICAgICdtYXJrJzogKGUpID0+IG5ldyBPcGVyYXRvcnMuTWFyayhAZWRpdG9yLCB0aGlzKVxuICAgICAgJ2ZpbmQnOiAoZSkgPT4gbmV3IE1vdGlvbnMuRmluZChAZWRpdG9yLCB0aGlzKVxuICAgICAgJ2ZpbmQtYmFja3dhcmRzJzogKGUpID0+IG5ldyBNb3Rpb25zLkZpbmQoQGVkaXRvciwgdGhpcykucmV2ZXJzZSgpXG4gICAgICAndGlsbCc6IChlKSA9PiBuZXcgTW90aW9ucy5UaWxsKEBlZGl0b3IsIHRoaXMpXG4gICAgICAndGlsbC1iYWNrd2FyZHMnOiAoZSkgPT4gbmV3IE1vdGlvbnMuVGlsbChAZWRpdG9yLCB0aGlzKS5yZXZlcnNlKClcbiAgICAgICdyZXBlYXQtZmluZCc6IChlKSA9PiBuZXcgQGdsb2JhbFZpbVN0YXRlLmN1cnJlbnRGaW5kLmNvbnN0cnVjdG9yKEBlZGl0b3IsIHRoaXMsIHJlcGVhdGVkOiB0cnVlKSBpZiBAZ2xvYmFsVmltU3RhdGUuY3VycmVudEZpbmRcbiAgICAgICdyZXBlYXQtZmluZC1yZXZlcnNlJzogKGUpID0+IG5ldyBAZ2xvYmFsVmltU3RhdGUuY3VycmVudEZpbmQuY29uc3RydWN0b3IoQGVkaXRvciwgdGhpcywgcmVwZWF0ZWQ6IHRydWUsIHJldmVyc2U6IHRydWUpIGlmIEBnbG9iYWxWaW1TdGF0ZS5jdXJyZW50RmluZFxuICAgICAgJ3JlcGxhY2UnOiAoZSkgPT4gbmV3IE9wZXJhdG9ycy5SZXBsYWNlKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnc2VhcmNoJzogKGUpID0+IG5ldyBNb3Rpb25zLlNlYXJjaChAZWRpdG9yLCB0aGlzKVxuICAgICAgJ3JldmVyc2Utc2VhcmNoJzogKGUpID0+IChuZXcgTW90aW9ucy5TZWFyY2goQGVkaXRvciwgdGhpcykpLnJldmVyc2VkKClcbiAgICAgICdzZWFyY2gtY3VycmVudC13b3JkJzogKGUpID0+IG5ldyBNb3Rpb25zLlNlYXJjaEN1cnJlbnRXb3JkKEBlZGl0b3IsIHRoaXMpXG4gICAgICAnYnJhY2tldC1tYXRjaGluZy1tb3Rpb24nOiAoZSkgPT4gbmV3IE1vdGlvbnMuQnJhY2tldE1hdGNoaW5nTW90aW9uKEBlZGl0b3IsIHRoaXMpXG4gICAgICAncmV2ZXJzZS1zZWFyY2gtY3VycmVudC13b3JkJzogKGUpID0+IChuZXcgTW90aW9ucy5TZWFyY2hDdXJyZW50V29yZChAZWRpdG9yLCB0aGlzKSkucmV2ZXJzZWQoKVxuXG4gICMgUHJpdmF0ZTogUmVnaXN0ZXIgbXVsdGlwbGUgY29tbWFuZCBoYW5kbGVycyB2aWEgYW4ge09iamVjdH0gdGhhdCBtYXBzXG4gICMgY29tbWFuZCBuYW1lcyB0byBjb21tYW5kIGhhbmRsZXIgZnVuY3Rpb25zLlxuICAjXG4gICMgUHJlZml4ZXMgdGhlIGdpdmVuIGNvbW1hbmQgbmFtZXMgd2l0aCAndmltLW1vZGU6JyB0byByZWR1Y2UgcmVkdW5kYW5jeSBpblxuICAjIHRoZSBwcm92aWRlZCBvYmplY3QuXG4gIHJlZ2lzdGVyQ29tbWFuZHM6IChjb21tYW5kcykgLT5cbiAgICBmb3IgY29tbWFuZE5hbWUsIGZuIG9mIGNvbW1hbmRzXG4gICAgICBkbyAoZm4pID0+XG4gICAgICAgIEBzdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZChAZWRpdG9yRWxlbWVudCwgXCJ2aW0tbW9kZToje2NvbW1hbmROYW1lfVwiLCBmbikpXG5cbiAgIyBQcml2YXRlOiBSZWdpc3RlciBtdWx0aXBsZSBPcGVyYXRvcnMgdmlhIGFuIHtPYmplY3R9IHRoYXRcbiAgIyBtYXBzIGNvbW1hbmQgbmFtZXMgdG8gZnVuY3Rpb25zIHRoYXQgcmV0dXJuIG9wZXJhdGlvbnMgdG8gcHVzaC5cbiAgI1xuICAjIFByZWZpeGVzIHRoZSBnaXZlbiBjb21tYW5kIG5hbWVzIHdpdGggJ3ZpbS1tb2RlOicgdG8gcmVkdWNlIHJlZHVuZGFuY3kgaW5cbiAgIyB0aGUgZ2l2ZW4gb2JqZWN0LlxuICByZWdpc3Rlck9wZXJhdGlvbkNvbW1hbmRzOiAob3BlcmF0aW9uQ29tbWFuZHMpIC0+XG4gICAgY29tbWFuZHMgPSB7fVxuICAgIGZvciBjb21tYW5kTmFtZSwgb3BlcmF0aW9uRm4gb2Ygb3BlcmF0aW9uQ29tbWFuZHNcbiAgICAgIGRvIChvcGVyYXRpb25GbikgPT5cbiAgICAgICAgY29tbWFuZHNbY29tbWFuZE5hbWVdID0gKGV2ZW50KSA9PiBAcHVzaE9wZXJhdGlvbnMob3BlcmF0aW9uRm4oZXZlbnQpKVxuICAgIEByZWdpc3RlckNvbW1hbmRzKGNvbW1hbmRzKVxuXG4gICMgUHJpdmF0ZTogUHVzaCB0aGUgZ2l2ZW4gb3BlcmF0aW9ucyBvbnRvIHRoZSBvcGVyYXRpb24gc3RhY2ssIHRoZW4gcHJvY2Vzc1xuICAjIGl0LlxuICBwdXNoT3BlcmF0aW9uczogKG9wZXJhdGlvbnMpIC0+XG4gICAgcmV0dXJuIHVubGVzcyBvcGVyYXRpb25zP1xuICAgIG9wZXJhdGlvbnMgPSBbb3BlcmF0aW9uc10gdW5sZXNzIF8uaXNBcnJheShvcGVyYXRpb25zKVxuXG4gICAgZm9yIG9wZXJhdGlvbiBpbiBvcGVyYXRpb25zXG4gICAgICAjIE1vdGlvbnMgaW4gdmlzdWFsIG1vZGUgcGVyZm9ybSB0aGVpciBzZWxlY3Rpb25zLlxuICAgICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCcgYW5kIChvcGVyYXRpb24gaW5zdGFuY2VvZiBNb3Rpb25zLk1vdGlvbiBvciBvcGVyYXRpb24gaW5zdGFuY2VvZiBUZXh0T2JqZWN0cy5UZXh0T2JqZWN0KVxuICAgICAgICBvcGVyYXRpb24uZXhlY3V0ZSA9IG9wZXJhdGlvbi5zZWxlY3RcblxuICAgICAgIyBpZiB3ZSBoYXZlIHN0YXJ0ZWQgYW4gb3BlcmF0aW9uIHRoYXQgcmVzcG9uZHMgdG8gY2FuQ29tcG9zZVdpdGggY2hlY2sgaWYgaXQgY2FuIGNvbXBvc2VcbiAgICAgICMgd2l0aCB0aGUgb3BlcmF0aW9uIHdlJ3JlIGdvaW5nIHRvIHB1c2ggb250byB0aGUgc3RhY2tcbiAgICAgIGlmICh0b3BPcCA9IEB0b3BPcGVyYXRpb24oKSk/IGFuZCB0b3BPcC5jYW5Db21wb3NlV2l0aD8gYW5kIG5vdCB0b3BPcC5jYW5Db21wb3NlV2l0aChvcGVyYXRpb24pXG4gICAgICAgIEByZXNldE5vcm1hbE1vZGUoKVxuICAgICAgICBAZW1pdHRlci5lbWl0KCdmYWlsZWQtdG8tY29tcG9zZScpXG4gICAgICAgIGJyZWFrXG5cbiAgICAgIEBvcFN0YWNrLnB1c2gob3BlcmF0aW9uKVxuXG4gICAgICAjIElmIHdlJ3ZlIHJlY2VpdmVkIGFuIG9wZXJhdG9yIGluIHZpc3VhbCBtb2RlLCBtYXJrIHRoZSBjdXJyZW50XG4gICAgICAjIHNlbGVjdGlvbiBhcyB0aGUgbW90aW9uIHRvIG9wZXJhdGUgb24uXG4gICAgICBpZiBAbW9kZSBpcyAndmlzdWFsJyBhbmQgb3BlcmF0aW9uIGluc3RhbmNlb2YgT3BlcmF0b3JzLk9wZXJhdG9yXG4gICAgICAgIEBvcFN0YWNrLnB1c2gobmV3IE1vdGlvbnMuQ3VycmVudFNlbGVjdGlvbihAZWRpdG9yLCB0aGlzKSlcblxuICAgICAgQHByb2Nlc3NPcFN0YWNrKClcblxuICBvbkRpZEZhaWxUb0NvbXBvc2U6IChmbikgLT5cbiAgICBAZW1pdHRlci5vbignZmFpbGVkLXRvLWNvbXBvc2UnLCBmbilcblxuICBvbkRpZERlc3Ryb3k6IChmbikgLT5cbiAgICBAZW1pdHRlci5vbignZGlkLWRlc3Ryb3knLCBmbilcblxuICAjIFByaXZhdGU6IFJlbW92ZXMgYWxsIG9wZXJhdGlvbnMgZnJvbSB0aGUgc3RhY2suXG4gICNcbiAgIyBSZXR1cm5zIG5vdGhpbmcuXG4gIGNsZWFyT3BTdGFjazogLT5cbiAgICBAb3BTdGFjayA9IFtdXG5cbiAgdW5kbzogLT5cbiAgICBAZWRpdG9yLnVuZG8oKVxuICAgIEBhY3RpdmF0ZU5vcm1hbE1vZGUoKVxuXG4gICMgUHJpdmF0ZTogUHJvY2Vzc2VzIHRoZSBjb21tYW5kIGlmIHRoZSBsYXN0IG9wZXJhdGlvbiBpcyBjb21wbGV0ZS5cbiAgI1xuICAjIFJldHVybnMgbm90aGluZy5cbiAgcHJvY2Vzc09wU3RhY2s6IC0+XG4gICAgdW5sZXNzIEBvcFN0YWNrLmxlbmd0aCA+IDBcbiAgICAgIHJldHVyblxuXG4gICAgdW5sZXNzIEB0b3BPcGVyYXRpb24oKS5pc0NvbXBsZXRlKClcbiAgICAgIGlmIEBtb2RlIGlzICdub3JtYWwnIGFuZCBAdG9wT3BlcmF0aW9uKCkgaW5zdGFuY2VvZiBPcGVyYXRvcnMuT3BlcmF0b3JcbiAgICAgICAgQGFjdGl2YXRlT3BlcmF0b3JQZW5kaW5nTW9kZSgpXG4gICAgICByZXR1cm5cblxuICAgIHBvcHBlZE9wZXJhdGlvbiA9IEBvcFN0YWNrLnBvcCgpXG4gICAgaWYgQG9wU3RhY2subGVuZ3RoXG4gICAgICB0cnlcbiAgICAgICAgQHRvcE9wZXJhdGlvbigpLmNvbXBvc2UocG9wcGVkT3BlcmF0aW9uKVxuICAgICAgICBAcHJvY2Vzc09wU3RhY2soKVxuICAgICAgY2F0Y2ggZVxuICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIE9wZXJhdG9ycy5PcGVyYXRvckVycm9yKSBvciAoZSBpbnN0YW5jZW9mIE1vdGlvbnMuTW90aW9uRXJyb3IpXG4gICAgICAgICAgQHJlc2V0Tm9ybWFsTW9kZSgpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICB0aHJvdyBlXG4gICAgZWxzZVxuICAgICAgQGhpc3RvcnkudW5zaGlmdChwb3BwZWRPcGVyYXRpb24pIGlmIHBvcHBlZE9wZXJhdGlvbi5pc1JlY29yZGFibGUoKVxuICAgICAgcG9wcGVkT3BlcmF0aW9uLmV4ZWN1dGUoKVxuXG4gICMgUHJpdmF0ZTogRmV0Y2hlcyB0aGUgbGFzdCBvcGVyYXRpb24uXG4gICNcbiAgIyBSZXR1cm5zIHRoZSBsYXN0IG9wZXJhdGlvbi5cbiAgdG9wT3BlcmF0aW9uOiAtPlxuICAgIF8ubGFzdCBAb3BTdGFja1xuXG4gICMgUHJpdmF0ZTogRmV0Y2hlcyB0aGUgdmFsdWUgb2YgYSBnaXZlbiByZWdpc3Rlci5cbiAgI1xuICAjIG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgcmVnaXN0ZXIgdG8gZmV0Y2guXG4gICNcbiAgIyBSZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gcmVnaXN0ZXIgb3IgdW5kZWZpbmVkIGlmIGl0IGhhc24ndFxuICAjIGJlZW4gc2V0LlxuICBnZXRSZWdpc3RlcjogKG5hbWUpIC0+XG4gICAgaWYgbmFtZSBpcyAnXCInXG4gICAgICBuYW1lID0gc2V0dGluZ3MuZGVmYXVsdFJlZ2lzdGVyKClcbiAgICBpZiBuYW1lIGluIFsnKicsICcrJ11cbiAgICAgIHRleHQgPSBhdG9tLmNsaXBib2FyZC5yZWFkKClcbiAgICAgIHR5cGUgPSBVdGlscy5jb3B5VHlwZSh0ZXh0KVxuICAgICAge3RleHQsIHR5cGV9XG4gICAgZWxzZSBpZiBuYW1lIGlzICclJ1xuICAgICAgdGV4dCA9IEBlZGl0b3IuZ2V0VVJJKClcbiAgICAgIHR5cGUgPSBVdGlscy5jb3B5VHlwZSh0ZXh0KVxuICAgICAge3RleHQsIHR5cGV9XG4gICAgZWxzZSBpZiBuYW1lIGlzIFwiX1wiICMgQmxhY2tob2xlIGFsd2F5cyByZXR1cm5zIG5vdGhpbmdcbiAgICAgIHRleHQgPSAnJ1xuICAgICAgdHlwZSA9IFV0aWxzLmNvcHlUeXBlKHRleHQpXG4gICAgICB7dGV4dCwgdHlwZX1cbiAgICBlbHNlXG4gICAgICBAZ2xvYmFsVmltU3RhdGUucmVnaXN0ZXJzW25hbWUudG9Mb3dlckNhc2UoKV1cblxuICAjIFByaXZhdGU6IEZldGNoZXMgdGhlIHZhbHVlIG9mIGEgZ2l2ZW4gbWFyay5cbiAgI1xuICAjIG5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgbWFyayB0byBmZXRjaC5cbiAgI1xuICAjIFJldHVybnMgdGhlIHZhbHVlIG9mIHRoZSBnaXZlbiBtYXJrIG9yIHVuZGVmaW5lZCBpZiBpdCBoYXNuJ3RcbiAgIyBiZWVuIHNldC5cbiAgZ2V0TWFyazogKG5hbWUpIC0+XG4gICAgaWYgQG1hcmtzW25hbWVdXG4gICAgICBAbWFya3NbbmFtZV0uZ2V0QnVmZmVyUmFuZ2UoKS5zdGFydFxuICAgIGVsc2VcbiAgICAgIHVuZGVmaW5lZFxuXG4gICMgUHJpdmF0ZTogU2V0cyB0aGUgdmFsdWUgb2YgYSBnaXZlbiByZWdpc3Rlci5cbiAgI1xuICAjIG5hbWUgIC0gVGhlIG5hbWUgb2YgdGhlIHJlZ2lzdGVyIHRvIGZldGNoLlxuICAjIHZhbHVlIC0gVGhlIHZhbHVlIHRvIHNldCB0aGUgcmVnaXN0ZXIgdG8uXG4gICNcbiAgIyBSZXR1cm5zIG5vdGhpbmcuXG4gIHNldFJlZ2lzdGVyOiAobmFtZSwgdmFsdWUpIC0+XG4gICAgaWYgbmFtZSBpcyAnXCInXG4gICAgICBuYW1lID0gc2V0dGluZ3MuZGVmYXVsdFJlZ2lzdGVyKClcbiAgICBpZiBuYW1lIGluIFsnKicsICcrJ11cbiAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHZhbHVlLnRleHQpXG4gICAgZWxzZSBpZiBuYW1lIGlzICdfJ1xuICAgICAgIyBCbGFja2hvbGUgcmVnaXN0ZXIsIG5vdGhpbmcgdG8gZG9cbiAgICBlbHNlIGlmIC9eW0EtWl0kLy50ZXN0KG5hbWUpXG4gICAgICBAYXBwZW5kUmVnaXN0ZXIobmFtZS50b0xvd2VyQ2FzZSgpLCB2YWx1ZSlcbiAgICBlbHNlXG4gICAgICBAZ2xvYmFsVmltU3RhdGUucmVnaXN0ZXJzW25hbWVdID0gdmFsdWVcblxuXG4gICMgUHJpdmF0ZTogYXBwZW5kIGEgdmFsdWUgaW50byBhIGdpdmVuIHJlZ2lzdGVyXG4gICMgbGlrZSBzZXRSZWdpc3RlciwgYnV0IGFwcGVuZHMgdGhlIHZhbHVlXG4gIGFwcGVuZFJlZ2lzdGVyOiAobmFtZSwgdmFsdWUpIC0+XG4gICAgcmVnaXN0ZXIgPSBAZ2xvYmFsVmltU3RhdGUucmVnaXN0ZXJzW25hbWVdID89XG4gICAgICB0eXBlOiAnY2hhcmFjdGVyJ1xuICAgICAgdGV4dDogXCJcIlxuICAgIGlmIHJlZ2lzdGVyLnR5cGUgaXMgJ2xpbmV3aXNlJyBhbmQgdmFsdWUudHlwZSBpc250ICdsaW5ld2lzZSdcbiAgICAgIHJlZ2lzdGVyLnRleHQgKz0gdmFsdWUudGV4dCArICdcXG4nXG4gICAgZWxzZSBpZiByZWdpc3Rlci50eXBlIGlzbnQgJ2xpbmV3aXNlJyBhbmQgdmFsdWUudHlwZSBpcyAnbGluZXdpc2UnXG4gICAgICByZWdpc3Rlci50ZXh0ICs9ICdcXG4nICsgdmFsdWUudGV4dFxuICAgICAgcmVnaXN0ZXIudHlwZSA9ICdsaW5ld2lzZSdcbiAgICBlbHNlXG4gICAgICByZWdpc3Rlci50ZXh0ICs9IHZhbHVlLnRleHRcblxuICAjIFByaXZhdGU6IFNldHMgdGhlIHZhbHVlIG9mIGEgZ2l2ZW4gbWFyay5cbiAgI1xuICAjIG5hbWUgIC0gVGhlIG5hbWUgb2YgdGhlIG1hcmsgdG8gZmV0Y2guXG4gICMgcG9zIHtQb2ludH0gLSBUaGUgdmFsdWUgdG8gc2V0IHRoZSBtYXJrIHRvLlxuICAjXG4gICMgUmV0dXJucyBub3RoaW5nLlxuICBzZXRNYXJrOiAobmFtZSwgcG9zKSAtPlxuICAgICMgY2hlY2sgdG8gbWFrZSBzdXJlIG5hbWUgaXMgaW4gW2Etel0gb3IgaXMgYFxuICAgIGlmIChjaGFyQ29kZSA9IG5hbWUuY2hhckNvZGVBdCgwKSkgPj0gOTYgYW5kIGNoYXJDb2RlIDw9IDEyMlxuICAgICAgbWFya2VyID0gQGVkaXRvci5tYXJrQnVmZmVyUmFuZ2UobmV3IFJhbmdlKHBvcywgcG9zKSwge2ludmFsaWRhdGU6ICduZXZlcicsIHBlcnNpc3RlbnQ6IGZhbHNlfSlcbiAgICAgIEBtYXJrc1tuYW1lXSA9IG1hcmtlclxuXG4gICMgUHVibGljOiBBcHBlbmQgYSBzZWFyY2ggdG8gdGhlIHNlYXJjaCBoaXN0b3J5LlxuICAjXG4gICMgTW90aW9ucy5TZWFyY2ggLSBUaGUgY29uZmlybWVkIHNlYXJjaCBtb3Rpb24gdG8gYXBwZW5kXG4gICNcbiAgIyBSZXR1cm5zIG5vdGhpbmdcbiAgcHVzaFNlYXJjaEhpc3Rvcnk6IChzZWFyY2gpIC0+XG4gICAgQGdsb2JhbFZpbVN0YXRlLnNlYXJjaEhpc3RvcnkudW5zaGlmdCBzZWFyY2hcblxuICAjIFB1YmxpYzogR2V0IHRoZSBzZWFyY2ggaGlzdG9yeSBpdGVtIGF0IHRoZSBnaXZlbiBpbmRleC5cbiAgI1xuICAjIGluZGV4IC0gdGhlIGluZGV4IG9mIHRoZSBzZWFyY2ggaGlzdG9yeSBpdGVtXG4gICNcbiAgIyBSZXR1cm5zIGEgc2VhcmNoIG1vdGlvblxuICBnZXRTZWFyY2hIaXN0b3J5SXRlbTogKGluZGV4ID0gMCkgLT5cbiAgICBAZ2xvYmFsVmltU3RhdGUuc2VhcmNoSGlzdG9yeVtpbmRleF1cblxuICAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiAgIyBNb2RlIFN3aXRjaGluZ1xuICAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcblxuICAjIFByaXZhdGU6IFVzZWQgdG8gZW5hYmxlIG5vcm1hbCBtb2RlLlxuICAjXG4gICMgUmV0dXJucyBub3RoaW5nLlxuICBhY3RpdmF0ZU5vcm1hbE1vZGU6IC0+XG4gICAgQGRlYWN0aXZhdGVJbnNlcnRNb2RlKClcbiAgICBAZGVhY3RpdmF0ZVZpc3VhbE1vZGUoKVxuXG4gICAgQG1vZGUgPSAnbm9ybWFsJ1xuICAgIEBzdWJtb2RlID0gbnVsbFxuXG4gICAgQGNoYW5nZU1vZGVDbGFzcygnbm9ybWFsLW1vZGUnKVxuXG4gICAgQGNsZWFyT3BTdGFjaygpXG4gICAgc2VsZWN0aW9uLmNsZWFyKGF1dG9zY3JvbGw6IGZhbHNlKSBmb3Igc2VsZWN0aW9uIGluIEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgQGVuc3VyZUN1cnNvcnNXaXRoaW5MaW5lKClcblxuICAgIEB1cGRhdGVTdGF0dXNCYXIoKVxuXG4gICMgVE9ETzogcmVtb3ZlIHRoaXMgbWV0aG9kIGFuZCBidW1wIHRoZSBgdmltLW1vZGVgIHNlcnZpY2UgdmVyc2lvbiBudW1iZXIuXG4gIGFjdGl2YXRlQ29tbWFuZE1vZGU6IC0+XG4gICAgR3JpbS5kZXByZWNhdGUoXCJVc2UgOjphY3RpdmF0ZU5vcm1hbE1vZGUgaW5zdGVhZFwiKVxuICAgIEBhY3RpdmF0ZU5vcm1hbE1vZGUoKVxuXG4gICMgUHJpdmF0ZTogVXNlZCB0byBlbmFibGUgaW5zZXJ0IG1vZGUuXG4gICNcbiAgIyBSZXR1cm5zIG5vdGhpbmcuXG4gIGFjdGl2YXRlSW5zZXJ0TW9kZTogKHN1YnR5cGUgPSBudWxsKSAtPlxuICAgIEBtb2RlID0gJ2luc2VydCdcbiAgICBAZWRpdG9yRWxlbWVudC5jb21wb25lbnQuc2V0SW5wdXRFbmFibGVkKHRydWUpXG4gICAgQHNldEluc2VydGlvbkNoZWNrcG9pbnQoKVxuICAgIEBzdWJtb2RlID0gc3VidHlwZVxuICAgIEBjaGFuZ2VNb2RlQ2xhc3MoJ2luc2VydC1tb2RlJylcbiAgICBAdXBkYXRlU3RhdHVzQmFyKClcblxuICBhY3RpdmF0ZVJlcGxhY2VNb2RlOiAtPlxuICAgIEBhY3RpdmF0ZUluc2VydE1vZGUoJ3JlcGxhY2UnKVxuICAgIEByZXBsYWNlTW9kZUNvdW50ZXIgPSAwXG4gICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LmFkZCgncmVwbGFjZS1tb2RlJylcbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgQHJlcGxhY2VNb2RlTGlzdGVuZXIgPSBAZWRpdG9yLm9uV2lsbEluc2VydFRleHQgQHJlcGxhY2VNb2RlSW5zZXJ0SGFuZGxlclxuICAgIEBzdWJzY3JpcHRpb25zLmFkZCBAcmVwbGFjZU1vZGVVbmRvTGlzdGVuZXIgPSBAZWRpdG9yLm9uRGlkSW5zZXJ0VGV4dCBAcmVwbGFjZU1vZGVVbmRvSGFuZGxlclxuXG4gIHJlcGxhY2VNb2RlSW5zZXJ0SGFuZGxlcjogKGV2ZW50KSA9PlxuICAgIGNoYXJzID0gZXZlbnQudGV4dD8uc3BsaXQoJycpIG9yIFtdXG4gICAgc2VsZWN0aW9ucyA9IEBlZGl0b3IuZ2V0U2VsZWN0aW9ucygpXG4gICAgZm9yIGNoYXIgaW4gY2hhcnNcbiAgICAgIGNvbnRpbnVlIGlmIGNoYXIgaXMgJ1xcbidcbiAgICAgIGZvciBzZWxlY3Rpb24gaW4gc2VsZWN0aW9uc1xuICAgICAgICBzZWxlY3Rpb24uZGVsZXRlKCkgdW5sZXNzIHNlbGVjdGlvbi5jdXJzb3IuaXNBdEVuZE9mTGluZSgpXG4gICAgcmV0dXJuXG5cbiAgcmVwbGFjZU1vZGVVbmRvSGFuZGxlcjogKGV2ZW50KSA9PlxuICAgIEByZXBsYWNlTW9kZUNvdW50ZXIrK1xuXG4gIHJlcGxhY2VNb2RlVW5kbzogLT5cbiAgICBpZiBAcmVwbGFjZU1vZGVDb3VudGVyID4gMFxuICAgICAgQGVkaXRvci51bmRvKClcbiAgICAgIEBlZGl0b3IudW5kbygpXG4gICAgICBAZWRpdG9yLm1vdmVMZWZ0KClcbiAgICAgIEByZXBsYWNlTW9kZUNvdW50ZXItLVxuXG4gIHNldEluc2VydGlvbkNoZWNrcG9pbnQ6IC0+XG4gICAgQGluc2VydGlvbkNoZWNrcG9pbnQgPSBAZWRpdG9yLmNyZWF0ZUNoZWNrcG9pbnQoKSB1bmxlc3MgQGluc2VydGlvbkNoZWNrcG9pbnQ/XG5cbiAgZGVhY3RpdmF0ZUluc2VydE1vZGU6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAbW9kZSBpbiBbbnVsbCwgJ2luc2VydCddXG4gICAgQGVkaXRvckVsZW1lbnQuY29tcG9uZW50LnNldElucHV0RW5hYmxlZChmYWxzZSlcbiAgICBAZWRpdG9yRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdyZXBsYWNlLW1vZGUnKVxuICAgIEBlZGl0b3IuZ3JvdXBDaGFuZ2VzU2luY2VDaGVja3BvaW50KEBpbnNlcnRpb25DaGVja3BvaW50KVxuICAgIGNoYW5nZXMgPSBAZWRpdG9yLmJ1ZmZlci5nZXRDaGFuZ2VzU2luY2VDaGVja3BvaW50KEBpbnNlcnRpb25DaGVja3BvaW50KVxuICAgIGl0ZW0gPSBAaW5wdXRPcGVyYXRvcihAaGlzdG9yeVswXSlcbiAgICBAaW5zZXJ0aW9uQ2hlY2twb2ludCA9IG51bGxcbiAgICBpZiBpdGVtP1xuICAgICAgaXRlbS5jb25maXJtQ2hhbmdlcyhjaGFuZ2VzKVxuICAgIGZvciBjdXJzb3IgaW4gQGVkaXRvci5nZXRDdXJzb3JzKClcbiAgICAgIGN1cnNvci5tb3ZlTGVmdCgpIHVubGVzcyBjdXJzb3IuaXNBdEJlZ2lubmluZ09mTGluZSgpXG4gICAgaWYgQHJlcGxhY2VNb2RlTGlzdGVuZXI/XG4gICAgICBAcmVwbGFjZU1vZGVMaXN0ZW5lci5kaXNwb3NlKClcbiAgICAgIEBzdWJzY3JpcHRpb25zLnJlbW92ZSBAcmVwbGFjZU1vZGVMaXN0ZW5lclxuICAgICAgQHJlcGxhY2VNb2RlTGlzdGVuZXIgPSBudWxsXG4gICAgICBAcmVwbGFjZU1vZGVVbmRvTGlzdGVuZXIuZGlzcG9zZSgpXG4gICAgICBAc3Vic2NyaXB0aW9ucy5yZW1vdmUgQHJlcGxhY2VNb2RlVW5kb0xpc3RlbmVyXG4gICAgICBAcmVwbGFjZU1vZGVVbmRvTGlzdGVuZXIgPSBudWxsXG5cbiAgZGVhY3RpdmF0ZVZpc3VhbE1vZGU6IC0+XG4gICAgcmV0dXJuIHVubGVzcyBAbW9kZSBpcyAndmlzdWFsJ1xuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIHNlbGVjdGlvbi5jdXJzb3IubW92ZUxlZnQoKSB1bmxlc3MgKHNlbGVjdGlvbi5pc0VtcHR5KCkgb3Igc2VsZWN0aW9uLmlzUmV2ZXJzZWQoKSlcblxuICAjIFByaXZhdGU6IEdldCB0aGUgaW5wdXQgb3BlcmF0b3IgdGhhdCBuZWVkcyB0byBiZSB0b2xkIGFib3V0IGFib3V0IHRoZVxuICAjIHR5cGVkIHVuZG8gdHJhbnNhY3Rpb24gaW4gYSByZWNlbnRseSBjb21wbGV0ZWQgb3BlcmF0aW9uLCBpZiB0aGVyZVxuICAjIGlzIG9uZS5cbiAgaW5wdXRPcGVyYXRvcjogKGl0ZW0pIC0+XG4gICAgcmV0dXJuIGl0ZW0gdW5sZXNzIGl0ZW0/XG4gICAgcmV0dXJuIGl0ZW0gaWYgaXRlbS5pbnB1dE9wZXJhdG9yPygpXG4gICAgcmV0dXJuIGl0ZW0uY29tcG9zZWRPYmplY3QgaWYgaXRlbS5jb21wb3NlZE9iamVjdD8uaW5wdXRPcGVyYXRvcj8oKVxuXG4gICMgUHJpdmF0ZTogVXNlZCB0byBlbmFibGUgdmlzdWFsIG1vZGUuXG4gICNcbiAgIyB0eXBlIC0gT25lIG9mICdjaGFyYWN0ZXJ3aXNlJywgJ2xpbmV3aXNlJyBvciAnYmxvY2t3aXNlJ1xuICAjXG4gICMgUmV0dXJucyBub3RoaW5nLlxuICBhY3RpdmF0ZVZpc3VhbE1vZGU6ICh0eXBlKSAtPlxuICAgICMgQWxyZWFkeSBpbiAndmlzdWFsJywgdGhpcyBtZWFucyBvbmUgb2YgZm9sbG93aW5nIGNvbW1hbmQgaXNcbiAgICAjIGV4ZWN1dGVkIHdpdGhpbiBgdmltLW1vZGUudmlzdWFsLW1vZGVgXG4gICAgIyAgKiBhY3RpdmF0ZS1ibG9ja3dpc2UtdmlzdWFsLW1vZGVcbiAgICAjICAqIGFjdGl2YXRlLWNoYXJhY3Rlcndpc2UtdmlzdWFsLW1vZGVcbiAgICAjICAqIGFjdGl2YXRlLWxpbmV3aXNlLXZpc3VhbC1tb2RlXG4gICAgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICAgIGlmIEBzdWJtb2RlIGlzIHR5cGVcbiAgICAgICAgQGFjdGl2YXRlTm9ybWFsTW9kZSgpXG4gICAgICAgIHJldHVyblxuXG4gICAgICBAc3VibW9kZSA9IHR5cGVcbiAgICAgIGlmIEBzdWJtb2RlIGlzICdsaW5ld2lzZSdcbiAgICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICAgICMgS2VlcCBvcmlnaW5hbCByYW5nZSBhcyBtYXJrZXIncyBwcm9wZXJ0eSB0byBnZXQgYmFja1xuICAgICAgICAgICMgdG8gY2hhcmFjdGVyd2lzZS5cbiAgICAgICAgICAjIFNpbmNlIHNlbGVjdExpbmUgbG9zdCBvcmlnaW5hbCBjdXJzb3IgY29sdW1uLlxuICAgICAgICAgIG9yaWdpbmFsUmFuZ2UgPSBzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKVxuICAgICAgICAgIHNlbGVjdGlvbi5tYXJrZXIuc2V0UHJvcGVydGllcyh7b3JpZ2luYWxSYW5nZX0pXG4gICAgICAgICAgW3N0YXJ0LCBlbmRdID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJvd1JhbmdlKClcbiAgICAgICAgICBzZWxlY3Rpb24uc2VsZWN0TGluZShyb3cpIGZvciByb3cgaW4gW3N0YXJ0Li5lbmRdXG5cbiAgICAgIGVsc2UgaWYgQHN1Ym1vZGUgaW4gWydjaGFyYWN0ZXJ3aXNlJywgJ2Jsb2Nrd2lzZSddXG4gICAgICAgICMgQ3VycmVudGx5LCAnYmxvY2t3aXNlJyBpcyBub3QgeWV0IGltcGxlbWVudGVkLlxuICAgICAgICAjIFNvIHRyZWF0IGl0IGFzIGNoYXJhY3Rlcndpc2UuXG4gICAgICAgICMgUmVjb3ZlciBvcmlnaW5hbCByYW5nZS5cbiAgICAgICAgZm9yIHNlbGVjdGlvbiBpbiBAZWRpdG9yLmdldFNlbGVjdGlvbnMoKVxuICAgICAgICAgIHtvcmlnaW5hbFJhbmdlfSA9IHNlbGVjdGlvbi5tYXJrZXIuZ2V0UHJvcGVydGllcygpXG4gICAgICAgICAgaWYgb3JpZ2luYWxSYW5nZVxuICAgICAgICAgICAgW3N0YXJ0Um93LCBlbmRSb3ddID0gc2VsZWN0aW9uLmdldEJ1ZmZlclJvd1JhbmdlKClcbiAgICAgICAgICAgIG9yaWdpbmFsUmFuZ2Uuc3RhcnQucm93ID0gc3RhcnRSb3dcbiAgICAgICAgICAgIG9yaWdpbmFsUmFuZ2UuZW5kLnJvdyAgID0gZW5kUm93XG4gICAgICAgICAgICBzZWxlY3Rpb24uc2V0QnVmZmVyUmFuZ2Uob3JpZ2luYWxSYW5nZSlcbiAgICBlbHNlXG4gICAgICBAZGVhY3RpdmF0ZUluc2VydE1vZGUoKVxuICAgICAgQG1vZGUgPSAndmlzdWFsJ1xuICAgICAgQHN1Ym1vZGUgPSB0eXBlXG4gICAgICBAY2hhbmdlTW9kZUNsYXNzKCd2aXN1YWwtbW9kZScpXG5cbiAgICAgIGlmIEBzdWJtb2RlIGlzICdsaW5ld2lzZSdcbiAgICAgICAgQGVkaXRvci5zZWxlY3RMaW5lc0NvbnRhaW5pbmdDdXJzb3JzKClcbiAgICAgIGVsc2UgaWYgQGVkaXRvci5nZXRTZWxlY3RlZFRleHQoKSBpcyAnJ1xuICAgICAgICBAZWRpdG9yLnNlbGVjdFJpZ2h0KClcblxuICAgIEB1cGRhdGVTdGF0dXNCYXIoKVxuXG4gICMgUHJpdmF0ZTogVXNlZCB0byByZS1lbmFibGUgdmlzdWFsIG1vZGVcbiAgcmVzZXRWaXN1YWxNb2RlOiAtPlxuICAgIEBhY3RpdmF0ZVZpc3VhbE1vZGUoQHN1Ym1vZGUpXG5cbiAgIyBQcml2YXRlOiBVc2VkIHRvIGVuYWJsZSBvcGVyYXRvci1wZW5kaW5nIG1vZGUuXG4gIGFjdGl2YXRlT3BlcmF0b3JQZW5kaW5nTW9kZTogLT5cbiAgICBAZGVhY3RpdmF0ZUluc2VydE1vZGUoKVxuICAgIEBtb2RlID0gJ29wZXJhdG9yLXBlbmRpbmcnXG4gICAgQHN1Ym1vZGUgPSBudWxsXG4gICAgQGNoYW5nZU1vZGVDbGFzcygnb3BlcmF0b3ItcGVuZGluZy1tb2RlJylcblxuICAgIEB1cGRhdGVTdGF0dXNCYXIoKVxuXG4gIGNoYW5nZU1vZGVDbGFzczogKHRhcmdldE1vZGUpIC0+XG4gICAgZm9yIG1vZGUgaW4gWydub3JtYWwtbW9kZScsICdpbnNlcnQtbW9kZScsICd2aXN1YWwtbW9kZScsICdvcGVyYXRvci1wZW5kaW5nLW1vZGUnXVxuICAgICAgaWYgbW9kZSBpcyB0YXJnZXRNb2RlXG4gICAgICAgIEBlZGl0b3JFbGVtZW50LmNsYXNzTGlzdC5hZGQobW9kZSlcbiAgICAgIGVsc2VcbiAgICAgICAgQGVkaXRvckVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShtb2RlKVxuXG4gICMgUHJpdmF0ZTogUmVzZXRzIHRoZSBub3JtYWwgbW9kZSBiYWNrIHRvIGl0J3MgaW5pdGlhbCBzdGF0ZS5cbiAgI1xuICAjIFJldHVybnMgbm90aGluZy5cbiAgcmVzZXROb3JtYWxNb2RlOiAtPlxuICAgIEBjbGVhck9wU3RhY2soKVxuICAgIEBlZGl0b3IuY2xlYXJTZWxlY3Rpb25zKClcbiAgICBAYWN0aXZhdGVOb3JtYWxNb2RlKClcblxuICAjIFByaXZhdGU6IEEgZ2VuZXJpYyB3YXkgdG8gY3JlYXRlIGEgUmVnaXN0ZXIgcHJlZml4IGJhc2VkIG9uIHRoZSBldmVudC5cbiAgI1xuICAjIGUgLSBUaGUgZXZlbnQgdGhhdCB0cmlnZ2VyZWQgdGhlIFJlZ2lzdGVyIHByZWZpeC5cbiAgI1xuICAjIFJldHVybnMgbm90aGluZy5cbiAgcmVnaXN0ZXJQcmVmaXg6IChlKSAtPlxuICAgIG5ldyBQcmVmaXhlcy5SZWdpc3RlcihAcmVnaXN0ZXJOYW1lKGUpKVxuXG4gICMgUHJpdmF0ZTogR2V0cyBhIHJlZ2lzdGVyIG5hbWUgZnJvbSBhIGtleWJvYXJkIGV2ZW50XG4gICNcbiAgIyBlIC0gVGhlIGV2ZW50XG4gICNcbiAgIyBSZXR1cm5zIHRoZSBuYW1lIG9mIHRoZSByZWdpc3RlclxuICByZWdpc3Rlck5hbWU6IChlKSAtPlxuICAgIGtleWJvYXJkRXZlbnQgPSBlLm9yaWdpbmFsRXZlbnQ/Lm9yaWdpbmFsRXZlbnQgPyBlLm9yaWdpbmFsRXZlbnRcbiAgICBuYW1lID0gYXRvbS5rZXltYXBzLmtleXN0cm9rZUZvcktleWJvYXJkRXZlbnQoa2V5Ym9hcmRFdmVudClcbiAgICBpZiBuYW1lLmxhc3RJbmRleE9mKCdzaGlmdC0nLCAwKSBpcyAwXG4gICAgICBuYW1lID0gbmFtZS5zbGljZSg2KVxuICAgIG5hbWVcblxuICAjIFByaXZhdGU6IEEgZ2VuZXJpYyB3YXkgdG8gY3JlYXRlIGEgTnVtYmVyIHByZWZpeCBiYXNlZCBvbiB0aGUgZXZlbnQuXG4gICNcbiAgIyBlIC0gVGhlIGV2ZW50IHRoYXQgdHJpZ2dlcmVkIHRoZSBOdW1iZXIgcHJlZml4LlxuICAjXG4gICMgUmV0dXJucyBub3RoaW5nLlxuICByZXBlYXRQcmVmaXg6IChlKSAtPlxuICAgIGtleWJvYXJkRXZlbnQgPSBlLm9yaWdpbmFsRXZlbnQ/Lm9yaWdpbmFsRXZlbnQgPyBlLm9yaWdpbmFsRXZlbnRcbiAgICBudW0gPSBwYXJzZUludChhdG9tLmtleW1hcHMua2V5c3Ryb2tlRm9yS2V5Ym9hcmRFdmVudChrZXlib2FyZEV2ZW50KSlcbiAgICBpZiBAdG9wT3BlcmF0aW9uKCkgaW5zdGFuY2VvZiBQcmVmaXhlcy5SZXBlYXRcbiAgICAgIEB0b3BPcGVyYXRpb24oKS5hZGREaWdpdChudW0pXG4gICAgZWxzZVxuICAgICAgaWYgbnVtIGlzIDBcbiAgICAgICAgZS5hYm9ydEtleUJpbmRpbmcoKVxuICAgICAgZWxzZVxuICAgICAgICBAcHVzaE9wZXJhdGlvbnMobmV3IFByZWZpeGVzLlJlcGVhdChudW0pKVxuXG4gIHJldmVyc2VTZWxlY3Rpb25zOiAtPlxuICAgIHJldmVyc2VkID0gbm90IEBlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLmlzUmV2ZXJzZWQoKVxuICAgIGZvciBzZWxlY3Rpb24gaW4gQGVkaXRvci5nZXRTZWxlY3Rpb25zKClcbiAgICAgIHNlbGVjdGlvbi5zZXRCdWZmZXJSYW5nZShzZWxlY3Rpb24uZ2V0QnVmZmVyUmFuZ2UoKSwge3JldmVyc2VkfSlcblxuICAjIFByaXZhdGU6IEZpZ3VyZSBvdXQgd2hldGhlciBvciBub3Qgd2UgYXJlIGluIGEgcmVwZWF0IHNlcXVlbmNlIG9yIHdlIGp1c3RcbiAgIyB3YW50IHRvIG1vdmUgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluZS4gSWYgd2UgYXJlIHdpdGhpbiBhIHJlcGVhdFxuICAjIHNlcXVlbmNlLCB3ZSBwYXNzIGNvbnRyb2wgb3ZlciB0byBAcmVwZWF0UHJlZml4LlxuICAjXG4gICMgZSAtIFRoZSB0cmlnZ2VyZWQgZXZlbnQuXG4gICNcbiAgIyBSZXR1cm5zIG5ldyBtb3Rpb24gb3Igbm90aGluZy5cbiAgbW92ZU9yUmVwZWF0OiAoZSkgLT5cbiAgICBpZiBAdG9wT3BlcmF0aW9uKCkgaW5zdGFuY2VvZiBQcmVmaXhlcy5SZXBlYXRcbiAgICAgIEByZXBlYXRQcmVmaXgoZSlcbiAgICAgIG51bGxcbiAgICBlbHNlXG4gICAgICBuZXcgTW90aW9ucy5Nb3ZlVG9CZWdpbm5pbmdPZkxpbmUoQGVkaXRvciwgdGhpcylcblxuICAjIFByaXZhdGU6IEEgZ2VuZXJpYyB3YXkgdG8gaGFuZGxlIE9wZXJhdG9ycyB0aGF0IGNhbiBiZSByZXBlYXRlZCBmb3JcbiAgIyB0aGVpciBsaW5ld2lzZSBmb3JtLlxuICAjXG4gICMgY29uc3RydWN0b3IgLSBUaGUgY29uc3RydWN0b3Igb2YgdGhlIG9wZXJhdG9yLlxuICAjXG4gICMgUmV0dXJucyBub3RoaW5nLlxuICBsaW5ld2lzZUFsaWFzZWRPcGVyYXRvcjogKGNvbnN0cnVjdG9yKSAtPlxuICAgIGlmIEBpc09wZXJhdG9yUGVuZGluZyhjb25zdHJ1Y3RvcilcbiAgICAgIG5ldyBNb3Rpb25zLk1vdmVUb1JlbGF0aXZlTGluZShAZWRpdG9yLCB0aGlzKVxuICAgIGVsc2VcbiAgICAgIG5ldyBjb25zdHJ1Y3RvcihAZWRpdG9yLCB0aGlzKVxuXG4gICMgUHJpdmF0ZTogQ2hlY2sgaWYgdGhlcmUgaXMgYSBwZW5kaW5nIG9wZXJhdGlvbiBvZiBhIGNlcnRhaW4gdHlwZSwgb3JcbiAgIyBpZiB0aGVyZSBpcyBhbnkgcGVuZGluZyBvcGVyYXRpb24sIGlmIG5vIHR5cGUgZ2l2ZW4uXG4gICNcbiAgIyBjb25zdHJ1Y3RvciAtIFRoZSBjb25zdHJ1Y3RvciBvZiB0aGUgb2JqZWN0IHR5cGUgeW91J3JlIGxvb2tpbmcgZm9yLlxuICAjXG4gIGlzT3BlcmF0b3JQZW5kaW5nOiAoY29uc3RydWN0b3IpIC0+XG4gICAgaWYgY29uc3RydWN0b3I/XG4gICAgICBmb3Igb3AgaW4gQG9wU3RhY2tcbiAgICAgICAgcmV0dXJuIG9wIGlmIG9wIGluc3RhbmNlb2YgY29uc3RydWN0b3JcbiAgICAgIGZhbHNlXG4gICAgZWxzZVxuICAgICAgQG9wU3RhY2subGVuZ3RoID4gMFxuXG4gIHVwZGF0ZVN0YXR1c0JhcjogLT5cbiAgICBAc3RhdHVzQmFyTWFuYWdlci51cGRhdGUoQG1vZGUsIEBzdWJtb2RlKVxuXG4gICMgUHJpdmF0ZTogaW5zZXJ0IHRoZSBjb250ZW50cyBvZiB0aGUgcmVnaXN0ZXIgaW4gdGhlIGVkaXRvclxuICAjXG4gICMgbmFtZSAtIHRoZSBuYW1lIG9mIHRoZSByZWdpc3RlciB0byBpbnNlcnRcbiAgI1xuICAjIFJldHVybnMgbm90aGluZy5cbiAgaW5zZXJ0UmVnaXN0ZXI6IChuYW1lKSAtPlxuICAgIHRleHQgPSBAZ2V0UmVnaXN0ZXIobmFtZSk/LnRleHRcbiAgICBAZWRpdG9yLmluc2VydFRleHQodGV4dCkgaWYgdGV4dD9cblxuICAjIFByaXZhdGU6IGVuc3VyZSB0aGUgbW9kZSBmb2xsb3dzIHRoZSBzdGF0ZSBvZiBzZWxlY3Rpb25zXG4gIGNoZWNrU2VsZWN0aW9uczogPT5cbiAgICByZXR1cm4gdW5sZXNzIEBlZGl0b3I/XG4gICAgaWYgQGVkaXRvci5nZXRTZWxlY3Rpb25zKCkuZXZlcnkoKHNlbGVjdGlvbikgLT4gc2VsZWN0aW9uLmlzRW1wdHkoKSlcbiAgICAgIEBlbnN1cmVDdXJzb3JzV2l0aGluTGluZSgpIGlmIEBtb2RlIGlzICdub3JtYWwnXG4gICAgICBAYWN0aXZhdGVOb3JtYWxNb2RlKCkgaWYgQG1vZGUgaXMgJ3Zpc3VhbCdcbiAgICBlbHNlXG4gICAgICBAYWN0aXZhdGVWaXN1YWxNb2RlKCdjaGFyYWN0ZXJ3aXNlJykgaWYgQG1vZGUgaXMgJ25vcm1hbCdcblxuICAjIFByaXZhdGU6IGVuc3VyZSB0aGUgY3Vyc29yIHN0YXlzIHdpdGhpbiB0aGUgbGluZSBhcyBhcHByb3ByaWF0ZVxuICBlbnN1cmVDdXJzb3JzV2l0aGluTGluZTogPT5cbiAgICBmb3IgY3Vyc29yIGluIEBlZGl0b3IuZ2V0Q3Vyc29ycygpXG4gICAgICB7Z29hbENvbHVtbn0gPSBjdXJzb3JcbiAgICAgIGlmIGN1cnNvci5pc0F0RW5kT2ZMaW5lKCkgYW5kIG5vdCBjdXJzb3IuaXNBdEJlZ2lubmluZ09mTGluZSgpXG4gICAgICAgIGN1cnNvci5tb3ZlTGVmdCgpXG4gICAgICBjdXJzb3IuZ29hbENvbHVtbiA9IGdvYWxDb2x1bW5cblxuICAgIEBlZGl0b3IubWVyZ2VDdXJzb3JzKClcbiJdfQ==
