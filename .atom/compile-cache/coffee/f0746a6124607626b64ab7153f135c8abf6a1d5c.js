(function() {
  var ClangProvider, CompositeDisposable, Range, buildCodeCompletionArgs, getSourceScopeLang, makeBufferedClangProcess, nearestSymbolPosition, path, prefixAtPosition, ref, ref1, ref2;

  ref = require('atom'), Range = ref.Range, CompositeDisposable = ref.CompositeDisposable;

  path = require('path');

  ref1 = require('./clang-args-builder'), makeBufferedClangProcess = ref1.makeBufferedClangProcess, buildCodeCompletionArgs = ref1.buildCodeCompletionArgs;

  ref2 = require('./util'), getSourceScopeLang = ref2.getSourceScopeLang, prefixAtPosition = ref2.prefixAtPosition, nearestSymbolPosition = ref2.nearestSymbolPosition;

  module.exports = ClangProvider = (function() {
    function ClangProvider() {}

    ClangProvider.prototype.selector = '.source.cpp, .source.c, .source.objc, .source.objcpp';

    ClangProvider.prototype.inclusionPriority = 1;

    ClangProvider.prototype.getSuggestions = function(arg1) {
      var bufferPosition, editor, language, lastSymbol, line, minimumWordLength, prefix, ref3, regex, scopeDescriptor, symbolPosition;
      editor = arg1.editor, scopeDescriptor = arg1.scopeDescriptor, bufferPosition = arg1.bufferPosition;
      language = getSourceScopeLang(scopeDescriptor.getScopesArray());
      prefix = prefixAtPosition(editor, bufferPosition);
      ref3 = nearestSymbolPosition(editor, bufferPosition), symbolPosition = ref3[0], lastSymbol = ref3[1];
      minimumWordLength = atom.config.get('autocomplete-plus.minimumWordLength');
      if ((minimumWordLength != null) && prefix.length < minimumWordLength) {
        regex = /(?:\.|->|::)\s*\w*$/;
        line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
        if (!regex.test(line)) {
          return;
        }
      }
      if (language != null) {
        return this.codeCompletionAt(editor, symbolPosition.row, symbolPosition.column, language, prefix);
      }
    };

    ClangProvider.prototype.codeCompletionAt = function(editor, row, column, language, prefix) {
      var args, callback;
      args = buildCodeCompletionArgs(editor, row, column, language);
      callback = (function(_this) {
        return function(code, outputs, errors, resolve) {
          console.log(errors);
          return resolve(_this.handleCompletionResult(outputs, code, prefix));
        };
      })(this);
      return makeBufferedClangProcess(editor, args, callback, editor.getText());
    };

    ClangProvider.prototype.convertCompletionLine = function(line, prefix) {
      var argumentsRe, basicInfo, basicInfoRe, comment, commentRe, completion, completionAndComment, constMemFuncRe, content, contentRe, index, infoTagsRe, isConstMemFunc, match, optionalArgumentsStart, ref3, ref4, ref5, returnType, returnTypeRe, suggestion;
      contentRe = /^COMPLETION: (.*)/;
      ref3 = line.match(contentRe), line = ref3[0], content = ref3[1];
      basicInfoRe = /^(.*?) : (.*)/;
      match = content.match(basicInfoRe);
      if (match == null) {
        return {
          text: content
        };
      }
      content = match[0], basicInfo = match[1], completionAndComment = match[2];
      commentRe = /(?: : (.*))?$/;
      ref4 = completionAndComment.split(commentRe), completion = ref4[0], comment = ref4[1];
      returnTypeRe = /^\[#(.*?)#\]/;
      returnType = (ref5 = completion.match(returnTypeRe)) != null ? ref5[1] : void 0;
      constMemFuncRe = /\[# const#\]$/;
      isConstMemFunc = constMemFuncRe.test(completion);
      infoTagsRe = /\[#(.*?)#\]/g;
      completion = completion.replace(infoTagsRe, '');
      argumentsRe = /<#(.*?)#>/g;
      optionalArgumentsStart = completion.indexOf('{#');
      completion = completion.replace(/\{#/g, '');
      completion = completion.replace(/#\}/g, '');
      index = 0;
      completion = completion.replace(argumentsRe, function(match, arg, offset) {
        index++;
        if (optionalArgumentsStart > 0 && offset > optionalArgumentsStart) {
          return "${" + index + ":optional " + arg + "}";
        } else {
          return "${" + index + ":" + arg + "}";
        }
      });
      suggestion = {};
      if (returnType != null) {
        suggestion.leftLabel = returnType;
      }
      if (index > 0) {
        suggestion.snippet = completion;
      } else {
        suggestion.text = completion;
      }
      if (isConstMemFunc) {
        suggestion.displayText = completion + ' const';
      }
      if (comment != null) {
        suggestion.description = comment;
      }
      suggestion.replacementPrefix = prefix;
      return suggestion;
    };

    ClangProvider.prototype.handleCompletionResult = function(result, returnCode, prefix) {
      var completionsRe, line, outputLines;
      if (returnCode === !0) {
        if (!atom.config.get("autocomplete-clang.ignoreClangErrors")) {
          return;
        }
      }
      completionsRe = new RegExp("^COMPLETION: (" + prefix + ".*)$", "mg");
      outputLines = result.match(completionsRe);
      if (outputLines != null) {
        return (function() {
          var i, len, results;
          results = [];
          for (i = 0, len = outputLines.length; i < len; i++) {
            line = outputLines[i];
            results.push(this.convertCompletionLine(line, prefix));
          }
          return results;
        }).call(this);
      } else {
        return [];
      }
    };

    return ClangProvider;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1jbGFuZy9saWIvY2xhbmctcHJvdmlkZXIuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUlBO0FBQUEsTUFBQTs7RUFBQSxNQUErQixPQUFBLENBQVEsTUFBUixDQUEvQixFQUFDLGlCQUFELEVBQVE7O0VBQ1IsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLE9BQXNELE9BQUEsQ0FBUSxzQkFBUixDQUF0RCxFQUFDLHdEQUFELEVBQTJCOztFQUMzQixPQUFnRSxPQUFBLENBQVEsUUFBUixDQUFoRSxFQUFDLDRDQUFELEVBQXFCLHdDQUFyQixFQUF1Qzs7RUFFdkMsTUFBTSxDQUFDLE9BQVAsR0FDTTs7OzRCQUNKLFFBQUEsR0FBVTs7NEJBQ1YsaUJBQUEsR0FBbUI7OzRCQUVuQixjQUFBLEdBQWdCLFNBQUMsSUFBRDtBQUNkLFVBQUE7TUFEZ0Isc0JBQVEsd0NBQWlCO01BQ3pDLFFBQUEsR0FBVyxrQkFBQSxDQUFtQixlQUFlLENBQUMsY0FBaEIsQ0FBQSxDQUFuQjtNQUNYLE1BQUEsR0FBUyxnQkFBQSxDQUFpQixNQUFqQixFQUF5QixjQUF6QjtNQUNULE9BQThCLHFCQUFBLENBQXNCLE1BQXRCLEVBQThCLGNBQTlCLENBQTlCLEVBQUMsd0JBQUQsRUFBZ0I7TUFDaEIsaUJBQUEsR0FBb0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHFDQUFoQjtNQUVwQixJQUFHLDJCQUFBLElBQXVCLE1BQU0sQ0FBQyxNQUFQLEdBQWdCLGlCQUExQztRQUNFLEtBQUEsR0FBUTtRQUNSLElBQUEsR0FBTyxNQUFNLENBQUMsY0FBUCxDQUFzQixDQUFDLENBQUMsY0FBYyxDQUFDLEdBQWhCLEVBQXFCLENBQXJCLENBQUQsRUFBMEIsY0FBMUIsQ0FBdEI7UUFDUCxJQUFBLENBQWMsS0FBSyxDQUFDLElBQU4sQ0FBVyxJ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eEM7O01BRUEsSUFBb0MsZUFBcEM7UUFBQSxVQUFVLENBQUMsV0FBWCxHQUF5QixRQUF6Qjs7TUFDQSxVQUFVLENBQUMsaUJBQVgsR0FBK0I7YUFDL0I7SUF0Q3FCOzs0QkF3Q3ZCLHNCQUFBLEdBQXdCLFNBQUMsTUFBRCxFQUFTLFVBQVQsRUFBcUIsTUFBckI7QUFDdEIsVUFBQTtNQUFBLElBQUcsVUFBQSxLQUFjLENBQUksQ0FBckI7UUFDRSxJQUFBLENBQWMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLHNDQUFoQixDQUFkO0FBQUEsaUJBQUE7U0FERjs7TUFJQSxhQUFBLEdBQWdCLElBQUksTUFBSixDQUFXLGdCQUFBLEdBQW1CLE1BQW5CLEdBQTRCLE1BQXZDLEVBQStDLElBQS9DO01BQ2hCLFdBQUEsR0FBYyxNQUFNLENBQUMsS0FBUCxDQUFhLGFBQWI7TUFFZCxJQUFHLG1CQUFIO0FBQ0U7O0FBQVE7ZUFBQSw2Q0FBQTs7eUJBQUEsSUFBQyxDQUFBLHFCQUFELENBQXVCLElBQXZCLEVBQTZCLE1BQTdCO0FBQUE7O3NCQURWO09BQUEsTUFBQTtBQUdFLGVBQU8sR0FIVDs7SUFSc0I7Ozs7O0FBdkUxQiIsInNvdXJjZXNDb250ZW50IjpbIiMgYXV0b2NvbXBsZXRlLXBsdXMgcHJvdmlkZXIgY29kZSBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9iZW5vZ2xlL2F1dG9jb21wbGV0ZS1jbGFuZ1xuIyBDb3B5cmlnaHQgKGMpIDIwMTUgQmVuIE9nbGUgdW5kZXIgTUlUIGxpY2Vuc2VcbiMgQ2xhbmcgcmVsYXRlZCBjb2RlIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3lhc3V5dWt5L2F1dG9jb21wbGV0ZS1jbGFuZ1xuXG57UmFuZ2UsIENvbXBvc2l0ZURpc3Bvc2FibGV9ID0gcmVxdWlyZSAnYXRvbSdcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xue21ha2VCdWZmZXJlZENsYW5nUHJvY2VzcywgYnVpbGRDb2RlQ29tcGxldGlvbkFyZ3N9ID0gcmVxdWlyZSAnLi9jbGFuZy1hcmdzLWJ1aWxkZXInXG57Z2V0U291cmNlU2NvcGVMYW5nLCBwcmVmaXhBdFBvc2l0aW9uLCBuZWFyZXN0U3ltYm9sUG9zaXRpb259ID0gcmVxdWlyZSAnLi91dGlsJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBDbGFuZ1Byb3ZpZGVyXG4gIHNlbGVjdG9yOiAnLnNvdXJjZS5jcHAsIC5zb3VyY2UuYywgLnNvdXJjZS5vYmpjLCAuc291cmNlLm9iamNwcCdcbiAgaW5jbHVzaW9uUHJpb3JpdHk6IDFcblxuICBnZXRTdWdnZXN0aW9uczogKHtlZGl0b3IsIHNjb3BlRGVzY3JpcHRvciwgYnVmZmVyUG9zaXRpb259KSAtPlxuICAgIGxhbmd1YWdlID0gZ2V0U291cmNlU2NvcGVMYW5nIHNjb3BlRGVzY3JpcHRvci5nZXRTY29wZXNBcnJheSgpXG4gICAgcHJlZml4ID0gcHJlZml4QXRQb3NpdGlvbihlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgIFtzeW1ib2xQb3NpdGlvbixsYXN0U3ltYm9sXSA9IG5lYXJlc3RTeW1ib2xQb3NpdGlvbihlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKVxuICAgIG1pbmltdW1Xb3JkTGVuZ3RoID0gYXRvbS5jb25maWcuZ2V0KCdhdXRvY29tcGxldGUtcGx1cy5taW5pbXVtV29yZExlbmd0aCcpXG5cbiAgICBpZiBtaW5pbXVtV29yZExlbmd0aD8gYW5kIHByZWZpeC5sZW5ndGggPCBtaW5pbXVtV29yZExlbmd0aFxuICAgICAgcmVnZXggPSAvKD86XFwufC0+fDo6KVxccypcXHcqJC9cbiAgICAgIGxpbmUgPSBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoW1tidWZmZXJQb3NpdGlvbi5yb3csIDBdLCBidWZmZXJQb3NpdGlvbl0pXG4gICAgICByZXR1cm4gdW5sZXNzIHJlZ2V4LnRlc3QobGluZSlcblxuICAgIGlmIGxhbmd1YWdlP1xuICAgICAgQGNvZGVDb21wbGV0aW9uQXQoZWRpdG9yLCBzeW1ib2xQb3NpdGlvbi5yb3csIHN5bWJvbFBvc2l0aW9uLmNvbHVtbiwgbGFuZ3VhZ2UsIHByZWZpeClcblxuICBjb2RlQ29tcGxldGlvbkF0OiAoZWRpdG9yLCByb3csIGNvbHVtbiwgbGFuZ3VhZ2UsIHByZWZpeCkgLT5cbiAgICBhcmdzID0gYnVpbGRDb2RlQ29tcGxldGlvbkFyZ3MgZWRpdG9yLCByb3csIGNvbHVtbiwgbGFuZ3VhZ2VcbiAgICBjYWxsYmFjayA9IChjb2RlLCBvdXRwdXRzLCBlcnJvcnMsIHJlc29sdmUpID0+XG4gICAgICBjb25zb2xlLmxvZyBlcnJvcnNcbiAgICAgIHJlc29sdmUoQGhhbmRsZUNvbXBsZXRpb25SZXN1bHQob3V0cHV0cywgY29kZSwgcHJlZml4KSlcbiAgICBtYWtlQnVmZmVyZWRDbGFuZ1Byb2Nlc3MgZWRpdG9yLCBhcmdzLCBjYWxsYmFjaywgZWRpdG9yLmdldFRleHQoKVxuXG4gIGNvbnZlcnRDb21wbGV0aW9uTGluZTogKGxpbmUsIHByZWZpeCkgLT5cbiAgICBjb250ZW50UmUgPSAvXkNPTVBMRVRJT046ICguKikvXG4gICAgW2xpbmUsIGNvbnRlbnRdID0gbGluZS5tYXRjaCBjb250ZW50UmVcbiAgICBiYXNpY0luZm9SZSA9IC9eKC4qPykgOiAoLiopL1xuICAgIG1hdGNoID0gY29udGVudC5tYXRjaCBiYXNpY0luZm9SZVxuICAgIHJldHVybiB7dGV4dDogY29udGVudH0gdW5sZXNzIG1hdGNoP1xuXG4gICAgW2NvbnRlbnQsIGJhc2ljSW5mbywgY29tcGxldGlvbkFuZENvbW1lbnRdID0gbWF0Y2hcbiAgICBjb21tZW50UmUgPSAvKD86IDogKC4qKSk/JC9cbiAgICBbY29tcGxldGlvbiwgY29tbWVudF0gPSBjb21wbGV0aW9uQW5kQ29tbWVudC5zcGxpdCBjb21tZW50UmVcbiAgICByZXR1cm5UeXBlUmUgPSAvXlxcWyMoLio/KSNcXF0vXG4gICAgcmV0dXJuVHlwZSA9IGNvbXBsZXRpb24ubWF0Y2gocmV0dXJuVHlwZVJlKT9bMV1cbiAgICBjb25zdE1lbUZ1bmNSZSA9IC9cXFsjIGNvbnN0I1xcXSQvXG4gICAgaXNDb25zdE1lbUZ1bmMgPSBjb25zdE1lbUZ1bmNSZS50ZXN0IGNvbXBsZXRpb25cbiAgICBpbmZvVGFnc1JlID0gL1xcWyMoLio/KSNcXF0vZ1xuICAgIGNvbXBsZXRpb24gPSBjb21wbGV0aW9uLnJlcGxhY2UgaW5mb1RhZ3NSZSwgJydcbiAgICBhcmd1bWVudHNSZSA9IC88IyguKj8pIz4vZ1xuICAgIG9wdGlvbmFsQXJndW1lbnRzU3RhcnQgPSBjb21wbGV0aW9uLmluZGV4T2YgJ3sjJ1xuICAgIGNvbXBsZXRpb24gPSBjb21wbGV0aW9uLnJlcGxhY2UgL1xceyMvZywgJydcbiAgICBjb21wbGV0aW9uID0gY29tcGxldGlvbi5yZXBsYWNlIC8jXFx9L2csICcnXG4gICAgaW5kZXggPSAwXG4gICAgY29tcGxldGlvbiA9IGNvbXBsZXRpb24ucmVwbGFjZSBhcmd1bWVudHNSZSwgKG1hdGNoLCBhcmcsIG9mZnNldCkgLT5cbiAgICAgIGluZGV4KytcbiAgICAgIGlmIG9wdGlvbmFsQXJndW1lbnRzU3RhcnQgPiAwIGFuZCBvZmZzZXQgPiBvcHRpb25hbEFyZ3VtZW50c1N0YXJ0XG4gICAgICAgIHJldHVybiBcIiR7I3tpbmRleH06b3B0aW9uYWwgI3thcmd9fVwiXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBcIiR7I3tpbmRleH06I3thcmd9fVwiXG5cbiAgICBzdWdnZXN0aW9uID0ge31cbiAgICBzdWdnZXN0aW9uLmxlZnRMYWJlbCA9IHJldHVyblR5cGUgaWYgcmV0dXJuVHlwZT9cbiAgICBpZiBpbmRleCA+IDBcbiAgICAgIHN1Z2dlc3Rpb24uc25pcHBldCA9IGNvbXBsZXRpb25cbiAgICBlbHNlXG4gICAgICBzdWdnZXN0aW9uLnRleHQgPSBjb21wbGV0aW9uXG4gICAgaWYgaXNDb25zdE1lbUZ1bmNcbiAgICAgIHN1Z2dlc3Rpb24uZGlzcGxheVRleHQgPSBjb21wbGV0aW9uICsgJyBjb25zdCdcbiAgICBzdWdnZXN0aW9uLmRlc2NyaXB0aW9uID0gY29tbWVudCBpZiBjb21tZW50P1xuICAgIHN1Z2dlc3Rpb24ucmVwbGFjZW1lbnRQcmVmaXggPSBwcmVmaXhcbiAgICBzdWdnZXN0aW9uXG5cbiAgaGFuZGxlQ29tcGxldGlvblJlc3VsdDogKHJlc3VsdCwgcmV0dXJuQ29kZSwgcHJlZml4KSAtPlxuICAgIGlmIHJldHVybkNvZGUgaXMgbm90IDBcbiAgICAgIHJldHVybiB1bmxlc3MgYXRvbS5jb25maWcuZ2V0IFwiYXV0b2NvbXBsZXRlLWNsYW5nLmlnbm9yZUNsYW5nRXJyb3JzXCJcbiAgICAjIEZpbmQgYWxsIGNvbXBsZXRpb25zIHRoYXQgbWF0Y2ggb3VyIHByZWZpeCBpbiBPTkUgcmVnZXhcbiAgICAjIGZvciBwZXJmb3JtYW5jZSByZWFzb25zLlxuICAgIGNvbXBsZXRpb25zUmUgPSBuZXcgUmVnRXhwKFwiXkNPTVBMRVRJT046IChcIiArIHByZWZpeCArIFwiLiopJFwiLCBcIm1nXCIpXG4gICAgb3V0cHV0TGluZXMgPSByZXN1bHQubWF0Y2goY29tcGxldGlvbnNSZSlcblxuICAgIGlmIG91dHB1dExpbmVzP1xuICAgICAgcmV0dXJuIChAY29udmVydENvbXBsZXRpb25MaW5lKGxpbmUsIHByZWZpeCkgZm9yIGxpbmUgaW4gb3V0cHV0TGluZXMpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIFtdXG4iXX0=
