(function() {
  var ClangProvider, CompositeDisposable, Disposable, File, LocationSelectList, Selection, buildEmitPchCommandArgs, buildGoDeclarationCommandArgs, defaultPrecompiled, makeBufferedClangProcess, path, ref, ref1, util;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, Disposable = ref.Disposable, Selection = ref.Selection, File = ref.File;

  path = require('path');

  util = require('./util');

  makeBufferedClangProcess = require('./clang-args-builder').makeBufferedClangProcess;

  ref1 = require('./clang-args-builder'), buildGoDeclarationCommandArgs = ref1.buildGoDeclarationCommandArgs, buildEmitPchCommandArgs = ref1.buildEmitPchCommandArgs;

  LocationSelectList = require('./location-select-view.coffee');

  ClangProvider = null;

  defaultPrecompiled = require('./defaultPrecompiled');

  module.exports = {
    config: {
      clangCommand: {
        type: 'string',
        "default": 'clang'
      },
      includePaths: {
        type: 'array',
        "default": ['.'],
        items: {
          type: 'string'
        }
      },
      pchFilePrefix: {
        type: 'string',
        "default": '.stdafx'
      },
      ignoreClangErrors: {
        type: 'boolean',
        "default": true
      },
      includeDocumentation: {
        type: 'boolean',
        "default": true
      },
      includeSystemHeadersDocumentation: {
        type: 'boolean',
        "default": false,
        description: "**WARNING**: if there are any PCHs compiled without this option," + "you will have to delete them and generate them again"
      },
      includeNonDoxygenCommentsAsDocumentation: {
        type: 'boolean',
        "default": false
      },
      "std c++": {
        type: 'string',
        "default": "c++11"
      },
      "std c": {
        type: 'string',
        "default": "c99"
      },
      "preCompiledHeaders c++": {
        type: 'array',
        "default": defaultPrecompiled.cpp,
        item: {
          type: 'string'
        }
      },
      "preCompiledHeaders c": {
        type: 'array',
        "default": defaultPrecompiled.c,
        items: {
          type: 'string'
        }
      },
      "preCompiledHeaders objective-c": {
        type: 'array',
        "default": defaultPrecompiled.objc,
        items: {
          type: 'string'
        }
      },
      "preCompiledHeaders objective-c++": {
        type: 'array',
        "default": defaultPrecompiled.objcpp,
        items: {
          type: 'string'
        }
      }
    },
    deactivationDisposables: null,
    activate: function(state) {
      this.deactivationDisposables = new CompositeDisposable;
      this.deactivationDisposables.add(atom.commands.add('atom-text-editor:not([mini])', {
        'autocomplete-clang:emit-pch': (function(_this) {
          return function() {
            return _this.emitPch(atom.workspace.getActiveTextEditor());
          };
        })(this)
      }));
      return this.deactivationDisposables.add(atom.commands.add('atom-text-editor:not([mini])', {
        'autocomplete-clang:go-declaration': (function(_this) {
          return function(e) {
            return _this.goDeclaration(atom.workspace.getActiveTextEditor(), e);
          };
        })(this)
      }));
    },
    goDeclaration: function(editor, e) {
      var args, callback, lang, term;
      lang = util.getFirstCursorSourceScopeLang(editor);
      if (!lang) {
        e.abortKeyBinding();
        return;
      }
      editor.selectWordsContainingCursors();
      term = editor.getSelectedText();
      args = buildGoDeclarationCommandArgs(editor, lang, term);
      callback = (function(_this) {
        return function(code, outputs, errors, resolve) {
          console.log("GoDecl err\n", errors);
          return resolve(_this.handleGoDeclarationResult(editor, {
            output: outputs,
            term: term
          }, code));
        };
      })(this);
      return makeBufferedClangProcess(editor, args, callback, editor.getText());
    },
    emitPch: function(editor) {
      var args, callback, h, headers, headersInput, lang;
      lang = util.getFirstCursorSourceScopeLang(editor);
      if (!lang) {
        atom.notifications.addError("autocomplete-clang:emit-pch\nError: Incompatible Language");
        return;
      }
      headers = atom.config.get("autocomplete-clang.preCompiledHeaders " + lang);
      headersInput = ((function() {
        var i, len, results;
        results = [];
        for (i = 0, len = headers.length; i < len; i++) {
          h = headers[i];
          results.push("#include <" + h + ">");
        }
        return results;
      })()).join("\n");
      args = buildEmitPchCommandArgs(editor, lang);
      callback = (function(_this) {
        return function(code, outputs, errors, resolve) {
          console.log("-emit-pch out\n", outputs);
          console.log("-emit-pch err\n", errors);
          return resolve(_this.handleEmitPchResult(code));
        };
      })(this);
      return makeBufferedClangProcess(editor, args, callback, headersInput);
    },
    handleGoDeclarationResult: function(editor, result, returnCode) {
      var list, places;
      if (returnCode === !0) {
        if (!atom.config.get("autocomplete-clang.ignoreClangErrors")) {
          return;
        }
      }
      places = this.parseAstDump(result.output, result.term);
      if (places.length === 1) {
        return this.goToLocation(editor, places.pop());
      } else if (places.length > 1) {
        list = new LocationSelectList(editor, this.goToLocation);
        return list.setItems(places);
      }
    },
    goToLocation: function(editor, arg) {
      var col, f, file, line;
      file = arg[0], line = arg[1], col = arg[2];
      if (file === '<stdin>') {
        return editor.setCursorBufferPosition([line - 1, col - 1]);
      }
      if (file.startsWith(".")) {
        file = path.join(editor.getDirectoryPath(), file);
      }
      f = new File(file);
      return f.exists().then(function(result) {
        if (result) {
          return atom.workspace.open(file, {
            initialLine: line - 1,
            initialColumn: col - 1
          });
        }
      });
    },
    parseAstDump: function(aststring, term) {
      var _, candidate, candidates, col, declRangeStr, declTerms, file, i, len, line, lines, match, places, posStr, positions, ref2, ref3;
      candidates = aststring.split('\n\n');
      places = [];
      for (i = 0, len = candidates.length; i < len; i++) {
        candidate = candidates[i];
        match = candidate.match(RegExp("^Dumping\\s(?:[A-Za-z_]*::)*?" + term + ":"));
        if (match !== null) {
          lines = candidate.split('\n');
          if (lines.length < 2) {
            continue;
          }
          declTerms = lines[1].split(' ');
          _ = declTerms[0], _ = declTerms[1], declRangeStr = declTerms[2], _ = declTerms[3], posStr = declTerms[4];
          while (!declRangeStr.match(/<(.*):([0-9]+):([0-9]+),/)) {
            if (declTerms.length < 5) {
              break;
            }
            declTerms = declTerms.slice(2);
            _ = declTerms[0], _ = declTerms[1], declRangeStr = declTerms[2], _ = declTerms[3], posStr = declTerms[4];
          }
          if (declRangeStr.match(/<(.*):([0-9]+):([0-9]+),/)) {
            ref2 = declRangeStr.match(/<(.*):([0-9]+):([0-9]+),/), _ = ref2[0], file = ref2[1], line = ref2[2], col = ref2[3];
            positions = posStr.match(/(line|col):([0-9]+)(?::([0-9]+))?/);
            if (positions) {
              if (positions[1] === 'line') {
                ref3 = [positions[2], positions[3]], line = ref3[0], col = ref3[1];
              } else {
                col = positions[2];
              }
              places.push([file, Number(line), Number(col)]);
            }
          }
        }
      }
      return places;
    },
    handleEmitPchResult: function(code) {
      if (!code) {
        atom.notifications.addSuccess("Emiting precompiled header has successfully finished");
        return;
      }
      return atom.notifications.addError(("Emiting precompiled header exit with " + code + "\n") + "See console for detailed error message");
    },
    deactivate: function() {
      return this.deactivationDisposables.dispose();
    },
    provide: function() {
      if (ClangProvider == null) {
        ClangProvider = require('./clang-provider');
      }
      return new ClangProvider();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1jbGFuZy9saWIvYXV0b2NvbXBsZXRlLWNsYW5nLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBa0QsT0FBQSxDQUFRLE1BQVIsQ0FBbEQsRUFBQyw2Q0FBRCxFQUFxQiwyQkFBckIsRUFBZ0MseUJBQWhDLEVBQTBDOztFQUMxQyxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsSUFBQSxHQUFPLE9BQUEsQ0FBUSxRQUFSOztFQUNOLDJCQUE2QixPQUFBLENBQVEsc0JBQVI7O0VBQzlCLE9BQTBELE9BQUEsQ0FBUSxzQkFBUixDQUExRCxFQUFDLGtFQUFELEVBQStCOztFQUMvQixrQkFBQSxHQUFxQixPQUFBLENBQVEsK0JBQVI7O0VBRXJCLGFBQUEsR0FBZ0I7O0VBQ2hCLGtCQUFBLEdBQXFCLE9BQUEsQ0FBUSxzQkFBUjs7RUFFckIsTUFBTSxDQUFDLE9BQVAsR0FDRTtJQUFBLE1BQUEsRUFDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxRQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxPQURUO09BREY7TUFHQSxZQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sT0FBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsQ0FBQyxHQUFELENBRFQ7UUFFQSxLQUFBLEVBQ0U7VUFBQSxJQUFBLEVBQU0sUUFBTjtTQUhGO09BSkY7TUFRQSxhQUFBLEVBQ0U7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUNBLENBQUEsT0FBQSxDQUFBLEVBQVMsU0FEVDtPQVRGO01BV0EsaUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBTSxTQUFOO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQURUO09BWkY7TUFjQSxvQkFBQSxFQUNFO1FBQUEsSUFBQSxFQUFNLFNBQU47UUFDQSxDQUFBLE9BQUEs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QWE7WUFDYixTQUFBLEdBQVksTUFBTSxDQUFDLEtBQVAsQ0FBYSxtQ0FBYjtZQUNaLElBQUcsU0FBSDtjQUNFLElBQUcsU0FBVSxDQUFBLENBQUEsQ0FBVixLQUFnQixNQUFuQjtnQkFDRSxPQUFhLENBQUMsU0FBVSxDQUFBLENBQUEsQ0FBWCxFQUFlLFNBQVUsQ0FBQSxDQUFBLENBQXpCLENBQWIsRUFBQyxjQUFELEVBQU0sY0FEUjtlQUFBLE1BQUE7Z0JBR0UsR0FBQSxHQUFNLFNBQVUsQ0FBQSxDQUFBLEVBSGxCOztjQUlBLE1BQU0sQ0FBQyxJQUFQLENBQVksQ0FBQyxJQUFELEVBQU8sTUFBQSxDQUFPLElBQVAsQ0FBUCxFQUFxQixNQUFBLENBQU8sR0FBUCxDQUFyQixDQUFaLEVBTEY7YUFIRjtXQVRGOztBQUZGO0FBb0JBLGFBQU87SUF2QkssQ0E5R2Q7SUF1SUEsbUJBQUEsRUFBcUIsU0FBQyxJQUFEO01BQ25CLElBQUEsQ0FBTyxJQUFQO1FBQ0UsSUFBSSxDQUFDLGFBQWEsQ0FBQyxVQUFuQixDQUE4QixzREFBOUI7QUFDQSxlQUZGOzthQUdBLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBbkIsQ0FBNEIsQ0FBQSx1Q0FBQSxHQUF3QyxJQUF4QyxHQUE2QyxJQUE3QyxDQUFBLEdBQzFCLHdDQURGO0lBSm1CLENBdklyQjtJQThJQSxVQUFBLEVBQVksU0FBQTthQUNWLElBQUMsQ0FBQSx1QkFBdUIsQ0FBQyxPQUF6QixDQUFBO0lBRFUsQ0E5SVo7SUFpSkEsT0FBQSxFQUFTLFNBQUE7O1FBQ1AsZ0JBQWlCLE9BQUEsQ0FBUSxrQkFBUjs7YUFDakIsSUFBSSxhQUFKLENBQUE7SUFGTyxDQWpKVDs7QUFYRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlLERpc3Bvc2FibGUsU2VsZWN0aW9uLEZpbGV9ID0gcmVxdWlyZSAnYXRvbSdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xudXRpbCA9IHJlcXVpcmUgJy4vdXRpbCdcbnttYWtlQnVmZmVyZWRDbGFuZ1Byb2Nlc3N9ICA9IHJlcXVpcmUgJy4vY2xhbmctYXJncy1idWlsZGVyJ1xue2J1aWxkR29EZWNsYXJhdGlvbkNvbW1hbmRBcmdzLGJ1aWxkRW1pdFBjaENvbW1hbmRBcmdzfSA9IHJlcXVpcmUgJy4vY2xhbmctYXJncy1idWlsZGVyJ1xuTG9jYXRpb25TZWxlY3RMaXN0ID0gcmVxdWlyZSAnLi9sb2NhdGlvbi1zZWxlY3Qtdmlldy5jb2ZmZWUnXG5cbkNsYW5nUHJvdmlkZXIgPSBudWxsXG5kZWZhdWx0UHJlY29tcGlsZWQgPSByZXF1aXJlICcuL2RlZmF1bHRQcmVjb21waWxlZCdcblxubW9kdWxlLmV4cG9ydHMgPVxuICBjb25maWc6XG4gICAgY2xhbmdDb21tYW5kOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdjbGFuZydcbiAgICBpbmNsdWRlUGF0aHM6XG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgICBkZWZhdWx0OiBbJy4nXVxuICAgICAgaXRlbXM6XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgcGNoRmlsZVByZWZpeDpcbiAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICBkZWZhdWx0OiAnLnN0ZGFmeCdcbiAgICBpZ25vcmVDbGFuZ0Vycm9yczpcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIGluY2x1ZGVEb2N1bWVudGF0aW9uOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiB0cnVlXG4gICAgaW5jbHVkZVN5c3RlbUhlYWRlcnNEb2N1bWVudGF0aW9uOlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgZGVzY3JpcHRpb246XG4gICAgICAgIFwiKipXQVJOSU5HKio6IGlmIHRoZXJlIGFyZSBhbnkgUENIcyBjb21waWxlZCB3aXRob3V0IHRoaXMgb3B0aW9uLFwiK1xuICAgICAgICBcInlvdSB3aWxsIGhhdmUgdG8gZGVsZXRlIHRoZW0gYW5kIGdlbmVyYXRlIHRoZW0gYWdhaW5cIlxuICAgIGluY2x1ZGVOb25Eb3h5Z2VuQ29tbWVudHNBc0RvY3VtZW50YXRpb246XG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgXCJzdGQgYysrXCI6XG4gICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgZGVmYXVsdDogXCJjKysxMVwiXG4gICAgXCJzdGQgY1wiOlxuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6IFwiYzk5XCJcbiAgICBcInByZUNvbXBpbGVkSGVhZGVycyBjKytcIjpcbiAgICAgIHR5cGU6ICdhcnJheSdcbiAgICAgIGRlZmF1bHQ6IGRlZmF1bHRQcmVjb21waWxlZC5jcHBcbiAgICAgIGl0ZW06XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgXCJwcmVDb21waWxlZEhlYWRlcnMgY1wiOlxuICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgZGVmYXVsdDogZGVmYXVsdFByZWNvbXBpbGVkLmNcbiAgICAgIGl0ZW1zOlxuICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgIFwicHJlQ29tcGlsZWRIZWFkZXJzIG9iamVjdGl2ZS1jXCI6XG4gICAgICB0eXBlOiAnYXJyYXknXG4gICAgICBkZWZhdWx0OiBkZWZhdWx0UHJlY29tcGlsZWQub2JqY1xuICAgICAgaXRlbXM6XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgXCJwcmVDb21waWxlZEhlYWRlcnMgb2JqZWN0aXZlLWMrK1wiOlxuICAgICAgdHlwZTogJ2FycmF5J1xuICAgICAgZGVmYXVsdDogZGVmYXVsdFByZWNvbXBpbGVkLm9iamNwcFxuICAgICAgaXRlbXM6XG4gICAgICAgIHR5cGU6ICdzdHJpbmcnXG5cbiAgZGVhY3RpdmF0aW9uRGlzcG9zYWJsZXM6IG51bGxcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIEBkZWFjdGl2YXRpb25EaXNwb3NhYmxlcyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlXG4gICAgQGRlYWN0aXZhdGlvbkRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcjpub3QoW21pbmldKScsXG4gICAgICAnYXV0b2NvbXBsZXRlLWNsYW5nOmVtaXQtcGNoJzogPT5cbiAgICAgICAgQGVtaXRQY2ggYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpXG4gICAgQGRlYWN0aXZhdGlvbkRpc3Bvc2FibGVzLmFkZCBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS10ZXh0LWVkaXRvcjpub3QoW21pbmldKScsXG4gICAgICAnYXV0b2NvbXBsZXRlLWNsYW5nOmdvLWRlY2xhcmF0aW9uJzogKGUpPT5cbiAgICAgICAgQGdvRGVjbGFyYXRpb24gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpLGVcblxuICBnb0RlY2xhcmF0aW9uOiAoZWRpdG9yLGUpLT5cbiAgICBsYW5nID0gdXRpbC5nZXRGaXJzdEN1cnNvclNvdXJjZVNjb3BlTGFuZyBlZGl0b3JcbiAgICB1bmxlc3MgbGFuZ1xuICAgICAgZS5hYm9ydEtleUJpbmRpbmcoKVxuICAgICAgcmV0dXJuXG4gICAgZWRpdG9yLnNlbGVjdFdvcmRzQ29udGFpbmluZ0N1cnNvcnMoKVxuICAgIHRlcm0gPSBlZGl0b3IuZ2V0U2VsZWN0ZWRUZXh0KClcbiAgICBhcmdzID0gYnVpbGRHb0RlY2xhcmF0aW9uQ29tbWFuZEFyZ3MgZWRpdG9yLCBsYW5nLCB0ZXJtXG4gICAgY2FsbGJhY2sgPSAoY29kZSwgb3V0cHV0cywgZXJyb3JzLCByZXNvbHZlKSA9PlxuICAgICAgY29uc29sZS5sb2cgXCJHb0RlY2wgZXJyXFxuXCIsIGVycm9yc1xuICAgICAgcmVzb2x2ZShAaGFuZGxlR29EZWNsYXJhdGlvblJlc3VsdCBlZGl0b3IsIHtvdXRwdXQ6b3V0cHV0cywgdGVybTp0ZXJtfSwgY29kZSlcbiAgICBtYWtlQnVmZmVyZWRDbGFuZ1Byb2Nlc3MgZWRpdG9yLCBhcmdzLCBjYWxsYmFjaywgZWRpdG9yLmdldFRleHQoKVxuXG4gIGVtaXRQY2g6IChlZGl0b3IpLT5cbiAgICBsYW5nID0gdXRpbC5nZXRGaXJzdEN1cnNvclNvdXJjZVNjb3BlTGFuZyBlZGl0b3JcbiAgICB1bmxlc3MgbGFuZ1xuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIFwiYXV0b2NvbXBsZXRlLWNsYW5nOmVtaXQtcGNoXFxuRXJyb3I6IEluY29tcGF0aWJsZSBMYW5ndWFnZVwiXG4gICAgICByZXR1cm5cbiAgICBoZWFkZXJzID0gYXRvbS5jb25maWcuZ2V0IFwiYXV0b2NvbXBsZXRlLWNsYW5nLnByZUNvbXBpbGVkSGVhZGVycyAje2xhbmd9XCJcbiAgICBoZWFkZXJzSW5wdXQgPSAoXCIjaW5jbHVkZSA8I3tofT5cIiBmb3IgaCBpbiBoZWFkZXJzKS5qb2luIFwiXFxuXCJcbiAgICBhcmdzID0gYnVpbGRFbWl0UGNoQ29tbWFuZEFyZ3MgZWRpdG9yLCBsYW5nXG4gICAgY2FsbGJhY2sgPSAoY29kZSwgb3V0cHV0cywgZXJyb3JzLCByZXNvbHZlKSA9PlxuICAgICAgY29uc29sZS5sb2cgXCItZW1pdC1wY2ggb3V0XFxuXCIsIG91dHB1dHNcbiAgICAgIGNvbnNvbGUubG9nIFwiLWVtaXQtcGNoIGVyclxcblwiLCBlcnJvcnNcbiAgICAgIHJlc29sdmUoQGhhbmRsZUVtaXRQY2hSZXN1bHQgY29kZSlcbiAgICBtYWtlQnVmZmVyZWRDbGFuZ1Byb2Nlc3MgZWRpdG9yLCBhcmdzLCBjYWxsYmFjaywgaGVhZGVyc0lucHV0XG5cbiAgaGFuZGxlR29EZWNsYXJhdGlvblJlc3VsdDogKGVkaXRvciwgcmVzdWx0LCByZXR1cm5Db2RlKS0+XG4gICAgaWYgcmV0dXJuQ29kZSBpcyBub3QgMFxuICAgICAgcmV0dXJuIHVubGVzcyBhdG9tLmNvbmZpZy5nZXQgXCJhdXRvY29tcGxldGUtY2xhbmcuaWdub3JlQ2xhbmdFcnJvcnNcIlxuICAgIHBsYWNlcyA9IEBwYXJzZUFzdER1bXAgcmVzdWx0Lm91dHB1dCwgcmVzdWx0LnRlcm1cbiAgICBpZiBwbGFjZXMubGVuZ3RoIGlzIDFcbiAgICAgIEBnb1RvTG9jYXRpb24gZWRpdG9yLCBwbGFjZXMucG9wKClcbiAgICBlbHNlIGlmIHBsYWNlcy5sZW5ndGggPiAxXG4gICAgICBsaXN0ID0gbmV3IExvY2F0aW9uU2VsZWN0TGlzdChlZGl0b3IsIEBnb1RvTG9jYXRpb24pXG4gICAgICBsaXN0LnNldEl0ZW1zKHBsYWNlcylcblxuICBnb1RvTG9jYXRpb246IChlZGl0b3IsIFtmaWxlLGxpbmUsY29sXSkgLT5cbiAgICBpZiBmaWxlIGlzICc8c3RkaW4+J1xuICAgICAgcmV0dXJuIGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbiBbbGluZS0xLGNvbC0xXVxuICAgIGZpbGUgPSBwYXRoLmpvaW4gZWRpdG9yLmdldERpcmVjdG9yeVBhdGgoKSwgZmlsZSBpZiBmaWxlLnN0YXJ0c1dpdGgoXCIuXCIpXG4gICAgZiA9IG5ldyBGaWxlIGZpbGVcbiAgICBmLmV4aXN0cygpLnRoZW4gKHJlc3VsdCkgLT5cbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4gZmlsZSwge2luaXRpYWxMaW5lOmxpbmUtMSwgaW5pdGlhbENvbHVtbjpjb2wtMX0gaWYgcmVzdWx0XG5cbiAgcGFyc2VBc3REdW1wOiAoYXN0c3RyaW5nLCB0ZXJtKS0+XG4gICAgY2FuZGlkYXRlcyA9IGFzdHN0cmluZy5zcGxpdCAnXFxuXFxuJ1xuICAgIHBsYWNlcyA9IFtdXG4gICAgZm9yIGNhbmRpZGF0ZSBpbiBjYW5kaWRhdGVzXG4gICAgICBtYXRjaCA9IGNhbmRpZGF0ZS5tYXRjaCAvLy9eRHVtcGluZ1xccyg/OltBLVphLXpfXSo6OikqPyN7dGVybX06Ly8vXG4gICAgICBpZiBtYXRjaCBpc250IG51bGxcbiAgICAgICAgbGluZXMgPSBjYW5kaWRhdGUuc3BsaXQgJ1xcbidcbiAgICAgICAgY29udGludWUgaWYgbGluZXMubGVuZ3RoIDwgMlxuICAgICAgICBkZWNsVGVybXMgPSBsaW5lc1sxXS5zcGxpdCAnICdcbiAgICAgICAgW18sXyxkZWNsUmFuZ2VTdHIsXyxwb3NTdHIsLi4uXSA9IGRlY2xUZXJtc1xuICAgICAgICB3aGlsZSBub3QgZGVjbFJhbmdlU3RyLm1hdGNoIC88KC4qKTooWzAtOV0rKTooWzAtOV0rKSwvXG4gICAgICAgICAgYnJlYWsgaWYgZGVjbFRlcm1zLmxlbmd0aCA8IDVcbiAgICAgICAgICBkZWNsVGVybXMgPSBkZWNsVGVybXNbMi4uXVxuICAgICAgICAgIFtfLF8sZGVjbFJhbmdlU3RyLF8scG9zU3RyLC4uLl0gPSBkZWNsVGVybXNcbiAgICAgICAgaWYgZGVjbFJhbmdlU3RyLm1hdGNoIC88KC4qKTooWzAtOV0rKTooWzAtOV0rKSwvXG4gICAgICAgICAgW18sZmlsZSxsaW5lLGNvbF0gPSBkZWNsUmFuZ2VTdHIubWF0Y2ggLzwoLiopOihbMC05XSspOihbMC05XSspLC9cbiAgICAgICAgICBwb3NpdGlvbnMgPSBwb3NTdHIubWF0Y2ggLyhsaW5lfGNvbCk6KFswLTldKykoPzo6KFswLTldKykpPy9cbiAgICAgICAgICBpZiBwb3NpdGlvbnNcbiAgICAgICAgICAgIGlmIHBvc2l0aW9uc1sxXSBpcyAnbGluZSdcbiAgICAgICAgICAgICAgW2xpbmUsY29sXSA9IFtwb3NpdGlvbnNbMl0sIHBvc2l0aW9uc1szXV1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgY29sID0gcG9zaXRpb25zWzJdXG4gICAgICAgICAgICBwbGFjZXMucHVzaCBbZmlsZSwoTnVtYmVyIGxpbmUpLChOdW1iZXIgY29sKV1cbiAgICByZXR1cm4gcGxhY2VzXG5cbiAgaGFuZGxlRW1pdFBjaFJlc3VsdDogKGNvZGUpLT5cbiAgICB1bmxlc3MgY29kZVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MgXCJFbWl0aW5nIHByZWNvbXBpbGVkIGhlYWRlciBoYXMgc3VjY2Vzc2Z1bGx5IGZpbmlzaGVkXCJcbiAgICAgIHJldHVyblxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBcIkVtaXRpbmcgcHJlY29tcGlsZWQgaGVhZGVyIGV4aXQgd2l0aCAje2NvZGV9XFxuXCIrXG4gICAgICBcIlNlZSBjb25zb2xlIGZvciBkZXRhaWxlZCBlcnJvciBtZXNzYWdlXCJcblxuICBkZWFjdGl2YXRlOiAtPlxuICAgIEBkZWFjdGl2YXRpb25EaXNwb3NhYmxlcy5kaXNwb3NlKClcblxuICBwcm92aWRlOiAtPlxuICAgIENsYW5nUHJvdmlkZXIgPz0gcmVxdWlyZSgnLi9jbGFuZy1wcm92aWRlcicpXG4gICAgbmV3IENsYW5nUHJvdmlkZXIoKVxuIl19
