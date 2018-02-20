(function() {
  var Command, CommandError, Ex, ExViewModel, Find;

  ExViewModel = require('./ex-view-model');

  Ex = require('./ex');

  Find = require('./find');

  CommandError = require('./command-error');

  Command = (function() {
    function Command(editor, exState) {
      this.editor = editor;
      this.exState = exState;
      this.selections = this.exState.getSelections();
      this.viewModel = new ExViewModel(this, Object.keys(this.selections).length > 0);
    }

    Command.prototype.parseAddr = function(str, cursor) {
      var addr, buffer, mark, ref, ref1, row;
      row = cursor.getBufferRow();
      if (str === '.') {
        addr = row;
      } else if (str === '$') {
        buffer = this.editor.getBuffer();
        addr = ((ref = typeof buffer.getLineCount === "function" ? buffer.getLineCount() : void 0) != null ? ref : buffer.lines.length) - 1;
      } else if ((ref1 = str[0]) === "+" || ref1 === "-") {
        addr = row + this.parseOffset(str);
      } else if (!isNaN(str)) {
        addr = parseInt(str) - 1;
      } else if (str[0] === "'") {
        if (this.vimState == null) {
          throw new CommandError("Couldn't get access to vim-mode.");
        }
        mark = this.vimState.mark.marks[str[1]];
        if (mark == null) {
          throw new CommandError("Mark " + str + " not set.");
        }
        addr = mark.getEndBufferPosition().row;
      } else if (str[0] === "/") {
        str = str.slice(1);
        if (str[str.length - 1] === "/") {
          str = str.slice(0, -1);
        }
        addr = Find.scanEditor(str, this.editor, cursor.getCurrentLineBufferRange().end)[0];
        if (addr == null) {
          throw new CommandError("Pattern not found: " + str);
        }
        addr = addr.start.row;
      } else if (str[0] === "?") {
        str = str.slice(1);
        if (str[str.length - 1] === "?") {
          str = str.slice(0, -1);
        }
        addr = Find.scanEditor(str, this.editor, cursor.getCurrentLineBufferRange().start, true)[0];
        if (addr == null) {
          throw new CommandError("Pattern not found: " + str.slice(1, -1));
        }
        addr = addr.start.row;
      }
      return addr;
    };

    Command.prototype.parseOffset = function(str) {
      var o;
      if (str.length === 0) {
        return 0;
      }
      if (str.length === 1) {
        o = 1;
      } else {
        o = parseInt(str.slice(1));
      }
      if (str[0] === '+') {
        return o;
      } else {
        return -o;
      }
    };

    Command.prototype.execute = function(input) {
      var addr1, addr2, addrPattern, address1, address2, args, buffer, bufferRange, cl, command, cursor, func, id, lastLine, m, match, matching, name, off1, off2, range, ref, ref1, ref2, ref3, ref4, results, runOverSelections, selection, val;
      this.vimState = (ref = this.exState.globalExState.vim) != null ? ref.getEditorState(this.editor) : void 0;
      cl = input.characters;
      cl = cl.replace(/^(:|\s)*/, '');
      if (!(cl.length > 0)) {
        return;
      }
      if (cl[0] === '"') {
        return;
      }
      buffer = this.editor.getBuffer();
      lastLine = ((ref1 = typeof buffer.getLineCount === "function" ? buffer.getLineCount() : void 0) != null ? ref1 : buffer.lines.length) - 1;
      if (cl[0] === '%') {
        range = [0, lastLine];
        cl = cl.slice(1);
      } else {
        addrPattern = /^(?:(\.|\$|\d+|'[\[\]<>'`"^.(){}a-zA-Z]|\/.*?(?:[^\\]\/|$)|\?.*?(?:[^\\]\?|$)|[+-]\d*)((?:\s*[+-]\d*)*))?(?:,(\.|\$|\d+|'[\[\]<>'`"^.(){}a-zA-Z]|\/.*?[^\\]\/|\?.*?[^\\]\?|[+-]\d*)((?:\s*[+-]\d*)*))?/;
        ref2 = cl.match(addrPattern), match = ref2[0], addr1 = ref2[1], off1 = ref2[2], addr2 = ref2[3], off2 = ref2[4];
        cursor = this.editor.getLastCursor();
        if (addr1 === "'<" && addr2 === "'>") {
          runOverSelections = true;
        } else {
          runOverSelections = false;
          if (addr1 != null) {
            address1 = this.parseAddr(addr1, cursor);
          } else {
            address1 = cursor.getBufferRow();
          }
          if (off1 != null) {
            address1 += this.parseOffset(off1);
          }
          if (address1 === -1) {
            address1 = 0;
          }
          if (address1 > lastLine) {
            address1 = lastLine;
          }
          if (address1 < 0) {
            throw new CommandError('Invalid range');
          }
          if (addr2 != null) {
            address2 = this.parseAddr(addr2, cursor);
          }
          if (off2 != null) {
            address2 += this.parseOffset(off2);
          }
          if (address2 === -1) {
            address2 = 0;
          }
          if (address2 > lastLine) {
            address2 = lastLine;
          }
          if (address2 < 0) {
            throw new CommandError('Invalid range');
          }
          if (address2 < address1) {
            throw new CommandError('Backwards range given');
          }
        }
        range = [address1, address2 != null ? address2 : address1];
      }
      cl = cl.slice(match != null ? match.length : void 0);
      cl = cl.trimLeft();
      if (cl.length === 0) {
        this.editor.setCursorBufferPosition([range[1], 0]);
        return;
      }
      if (cl.length === 2 && cl[0] === 'k' && /[a-z]/i.test(cl[1])) {
        command = 'mark';
        args = cl[1];
      } else if (!/[a-z]/i.test(cl[0])) {
        command = cl[0];
        args = cl.slice(1);
      } else {
        ref3 = cl.match(/^(\w+)(.*)/), m = ref3[0], command = ref3[1], args = ref3[2];
      }
      if ((func = Ex.singleton()[command]) == null) {
        matching = (function() {
          var ref4, results;
          ref4 = Ex.singleton();
          results = [];
          for (name in ref4) {
            val = ref4[name];
            if (name.indexOf(command) === 0) {
              results.push(name);
            }
          }
          return results;
        })();
        matching.sort();
        command = matching[0];
        func = Ex.singleton()[command];
      }
      if (func != null) {
        if (runOverSelections) {
          ref4 = this.selections;
          results = [];
          for (id in ref4) {
            selection = ref4[id];
            bufferRange = selection.getBufferRange();
            range = [bufferRange.start.row, bufferRange.end.row];
            results.push(func({
              range: range,
              args: args,
              vimState: this.vimState,
              exState: this.exState,
              editor: this.editor
            }));
          }
          return results;
        } else {
          return func({
            range: range,
            args: args,
            vimState: this.vimState,
            exState: this.exState,
            editor: this.editor
          });
        }
      } else {
        throw new CommandError("Not an editor command: " + input.characters);
      }
    };

    return Command;

  })();

  module.exports = Command;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2V4LW1vZGUvbGliL2NvbW1hbmQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxXQUFBLEdBQWMsT0FBQSxDQUFRLGlCQUFSOztFQUNkLEVBQUEsR0FBSyxPQUFBLENBQVEsTUFBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLFFBQVI7O0VBQ1AsWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUjs7RUFFVDtJQUNTLGlCQUFDLE1BQUQsRUFBVSxPQUFWO01BQUMsSUFBQyxDQUFBLFNBQUQ7TUFBUyxJQUFDLENBQUEsVUFBRDtNQUNyQixJQUFDLENBQUEsVUFBRCxHQUFjLElBQUMsQ0FBQSxPQUFPLENBQUMsYUFBVCxDQUFBO01BQ2QsSUFBQyxDQUFBLFNBQUQsR0FBYSxJQUFJLFdBQUosQ0FBZ0IsSUFBaEIsRUFBbUIsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFDLENBQUEsVUFBYixDQUF3QixDQUFDLE1BQXpCLEdBQWtDLENBQXJEO0lBRkY7O3NCQUliLFNBQUEsR0FBVyxTQUFDLEdBQUQsRUFBTSxNQUFOO0FBQ1QsVUFBQTtNQUFBLEdBQUEsR0FBTSxNQUFNLENBQUMsWUFBUCxDQUFBO01BQ04sSUFBRyxHQUFBLEtBQU8sR0FBVjtRQUNFLElBQUEsR0FBTyxJQURUO09BQUEsTUFFSyxJQUFHLEdBQUEsS0FBTyxHQUFWO1FBS0gsTUFBQSxHQUFTLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixDQUFBO1FBQ1QsSUFBQSxHQUFPLG9HQUEwQixNQUFNLENBQUMsS0FBSyxDQUFDLE1BQXZDLENBQUEsR0FBaUQsRUFOckQ7T0FBQSxNQU9BLFlBQUcsR0FBSSxDQUFBLENBQUEsRUFBSixLQUFXLEdBQVgsSUFBQSxJQUFBLEtBQWdCLEdBQW5CO1FBQ0gsSUFBQSxHQUFPLEdBQUEsR0FBTSxJQUFDLENBQUEsV0FBRCxDQUFh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Tyx3Q0FBUDtRQUVFLFFBQUE7O0FBQVk7QUFBQTtlQUFBLFlBQUE7O2dCQUNWLElBQUksQ0FBQyxPQUFMLENBQWEsT0FBYixDQUFBLEtBQXlCOzJCQURmOztBQUFBOzs7UUFHWixRQUFRLENBQUMsSUFBVCxDQUFBO1FBRUEsT0FBQSxHQUFVLFFBQVMsQ0FBQSxDQUFBO1FBRW5CLElBQUEsR0FBTyxFQUFFLENBQUMsU0FBSCxDQUFBLENBQWUsQ0FBQSxPQUFBLEVBVHhCOztNQVdBLElBQUcsWUFBSDtRQUNFLElBQUcsaUJBQUg7QUFDRTtBQUFBO2VBQUEsVUFBQTs7WUFDRSxXQUFBLEdBQWMsU0FBUyxDQUFDLGNBQVYsQ0FBQTtZQUNkLEtBQUEsR0FBUSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsR0FBbkIsRUFBd0IsV0FBVyxDQUFDLEdBQUcsQ0FBQyxHQUF4Qzt5QkFDUixJQUFBLENBQUs7Y0FBRSxPQUFBLEtBQUY7Y0FBUyxNQUFBLElBQVQ7Y0FBZ0IsVUFBRCxJQUFDLENBQUEsUUFBaEI7Y0FBMkIsU0FBRCxJQUFDLENBQUEsT0FBM0I7Y0FBcUMsUUFBRCxJQUFDLENBQUEsTUFBckM7YUFBTDtBQUhGO3lCQURGO1NBQUEsTUFBQTtpQkFNRSxJQUFBLENBQUs7WUFBRSxPQUFBLEtBQUY7WUFBUyxNQUFBLElBQVQ7WUFBZ0IsVUFBRCxJQUFDLENBQUEsUUFBaEI7WUFBMkIsU0FBRCxJQUFDLENBQUEsT0FBM0I7WUFBcUMsUUFBRCxJQUFDLENBQUEsTUFBckM7V0FBTCxFQU5GO1NBREY7T0FBQSxNQUFBO0FBU0UsY0FBTSxJQUFJLFlBQUosQ0FBaUIseUJBQUEsR0FBMEIsS0FBSyxDQUFDLFVBQWpELEVBVFI7O0lBOUhPOzs7Ozs7RUF5SVgsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUF4TWpCIiwic291cmNlc0NvbnRlbnQiOlsiRXhWaWV3TW9kZWwgPSByZXF1aXJlICcuL2V4LXZpZXctbW9kZWwnXG5FeCA9IHJlcXVpcmUgJy4vZXgnXG5GaW5kID0gcmVxdWlyZSAnLi9maW5kJ1xuQ29tbWFuZEVycm9yID0gcmVxdWlyZSAnLi9jb21tYW5kLWVycm9yJ1xuXG5jbGFzcyBDb21tYW5kXG4gIGNvbnN0cnVjdG9yOiAoQGVkaXRvciwgQGV4U3RhdGUpIC0+XG4gICAgQHNlbGVjdGlvbnMgPSBAZXhTdGF0ZS5nZXRTZWxlY3Rpb25zKClcbiAgICBAdmlld01vZGVsID0gbmV3IEV4Vmlld01vZGVsKEAsIE9iamVjdC5rZXlzKEBzZWxlY3Rpb25zKS5sZW5ndGggPiAwKVxuXG4gIHBhcnNlQWRkcjogKHN0ciwgY3Vyc29yKSAtPlxuICAgIHJvdyA9IGN1cnNvci5nZXRCdWZmZXJSb3coKVxuICAgIGlmIHN0ciBpcyAnLidcbiAgICAgIGFkZHIgPSByb3dcbiAgICBlbHNlIGlmIHN0ciBpcyAnJCdcbiAgICAgICMgTGluZXMgYXJlIDAtaW5kZXhlZCBpbiBBdG9tLCBidXQgMS1pbmRleGVkIGluIHZpbS5cbiAgICAgICMgVGhlIHR3byB3YXlzIG9mIGdldHRpbmcgbGVuZ3RoIGxldCB1cyBzdXBwb3J0IEF0b20gMS4xOSdzIG5ldyBidWZmZXJcbiAgICAgICMgaW1wbGVtZW50YXRpb24gKGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL2F0b20vcHVsbC8xNDQzNSkgYW5kIHN0aWxsXG4gICAgICAjIHN1cHBvcnQgMS4xOCBhbmQgYmVsb3dcbiAgICAgIGJ1ZmZlciA9IEBlZGl0b3IuZ2V0QnVmZmVyKClcbiAgICAgIGFkZHIgPSAoYnVmZmVyLmdldExpbmVDb3VudD8oKSA/IGJ1ZmZlci5saW5lcy5sZW5ndGgpIC0gMVxuICAgIGVsc2UgaWYgc3RyWzBdIGluIFtcIitcIiwgXCItXCJdXG4gICAgICBhZGRyID0gcm93ICsgQHBhcnNlT2Zmc2V0KHN0cilcbiAgICBlbHNlIGlmIG5vdCBpc05hTihzdHIpXG4gICAgICBhZGRyID0gcGFyc2VJbnQoc3RyKSAtIDFcbiAgICBlbHNlIGlmIHN0clswXSBpcyBcIidcIiAjIFBhcnNlIE1hcmsuLi5cbiAgICAgIHVubGVzcyBAdmltU3RhdGU/XG4gICAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoXCJDb3VsZG4ndCBnZXQgYWNjZXNzIHRvIHZpbS1tb2RlLlwiKVxuICAgICAgbWFyayA9IEB2aW1TdGF0ZS5tYXJrLm1hcmtzW3N0clsxXV1cbiAgICAgIHVubGVzcyBtYXJrP1xuICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiTWFyayAje3N0cn0gbm90IHNldC5cIilcbiAgICAgIGFkZHIgPSBtYXJrLmdldEVuZEJ1ZmZlclBvc2l0aW9uKCkucm93XG4gICAgZWxzZSBpZiBzdHJbMF0gaXMgXCIvXCJcbiAgICAgIHN0ciA9IHN0clsxLi4uXVxuICAgICAgaWYgc3RyW3N0ci5sZW5ndGgtMV0gaXMgXCIvXCJcbiAgICAgICAgc3RyID0gc3RyWy4uLi0xXVxuICAgICAgYWRkciA9IEZpbmQuc2NhbkVkaXRvcihzdHIsIEBlZGl0b3IsIGN1cnNvci5nZXRDdXJyZW50TGluZUJ1ZmZlclJhbmdlKCkuZW5kKVswXVxuICAgICAgdW5sZXNzIGFkZHI/XG4gICAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoXCJQYXR0ZXJuIG5vdCBmb3VuZDogI3tzdHJ9XCIpXG4gICAgICBhZGRyID0gYWRkci5zdGFydC5yb3dcbiAgICBlbHNlIGlmIHN0clswXSBpcyBcIj9cIlxuICAgICAgc3RyID0gc3RyWzEuLi5dXG4gICAgICBpZiBzdHJbc3RyLmxlbmd0aC0xXSBpcyBcIj9cIlxuICAgICAgICBzdHIgPSBzdHJbLi4uLTFdXG4gICAgICBhZGRyID0gRmluZC5zY2FuRWRpdG9yKHN0ciwgQGVkaXRvciwgY3Vyc29yLmdldEN1cnJlbnRMaW5lQnVmZmVyUmFuZ2UoKS5zdGFydCwgdHJ1ZSlbMF1cbiAgICAgIHVubGVzcyBhZGRyP1xuICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiUGF0dGVybiBub3QgZm91bmQ6ICN7c3RyWzEuLi4tMV19XCIpXG4gICAgICBhZGRyID0gYWRkci5zdGFydC5yb3dcblxuICAgIHJldHVybiBhZGRyXG5cbiAgcGFyc2VPZmZzZXQ6IChzdHIpIC0+XG4gICAgaWYgc3RyLmxlbmd0aCBpcyAwXG4gICAgICByZXR1cm4gMFxuICAgIGlmIHN0ci5sZW5ndGggaXMgMVxuICAgICAgbyA9IDFcbiAgICBlbHNlXG4gICAgICBvID0gcGFyc2VJbnQoc3RyWzEuLl0pXG4gICAgaWYgc3RyWzBdIGlzICcrJ1xuICAgICAgcmV0dXJuIG9cbiAgICBlbHNlXG4gICAgICByZXR1cm4gLW9cblxuICBleGVjdXRlOiAoaW5wdXQpIC0+XG4gICAgQHZpbVN0YXRlID0gQGV4U3RhdGUuZ2xvYmFsRXhTdGF0ZS52aW0/LmdldEVkaXRvclN0YXRlKEBlZGl0b3IpXG4gICAgIyBDb21tYW5kIGxpbmUgcGFyc2luZyAobW9zdGx5KSBmb2xsb3dpbmcgdGhlIHJ1bGVzIGF0XG4gICAgIyBodHRwOi8vcHVicy5vcGVuZ3JvdXAub3JnL29ubGluZXB1YnMvOTY5OTkxOTc5OS91dGlsaXRpZXNcbiAgICAjIC9leC5odG1sI3RhZ18yMF80MF8xM18wM1xuXG4gICAgIyBTdGVwcyAxLzI6IExlYWRpbmcgYmxhbmtzIGFuZCBjb2xvbnMgYXJlIGlnbm9yZWQuXG4gICAgY2wgPSBpbnB1dC5jaGFyYWN0ZXJzXG4gICAgY2wgPSBjbC5yZXBsYWNlKC9eKDp8XFxzKSovLCAnJylcbiAgICByZXR1cm4gdW5sZXNzIGNsLmxlbmd0aCA+IDBcblxuICAgICMgU3RlcCAzOiBJZiB0aGUgZmlyc3QgY2hhcmFjdGVyIGlzIGEgXCIsIGlnbm9yZSB0aGUgcmVzdCBvZiB0aGUgbGluZVxuICAgIGlmIGNsWzBdIGlzICdcIidcbiAgICAgIHJldHVyblxuXG4gICAgIyBTdGVwIDQ6IEFkZHJlc3MgcGFyc2luZ1xuICAgICMgc2VlIGNvbW1lbnQgaW4gcGFyc2VBZGRyIGFib3V0IGxpbmUgbGVuZ3RoXG4gICAgYnVmZmVyID0gQGVkaXRvci5nZXRCdWZmZXIoKVxuICAgIGxhc3RMaW5lID0gKGJ1ZmZlci5nZXRMaW5lQ291bnQ/KCkgPyBidWZmZXIubGluZXMubGVuZ3RoKSAtIDFcbiAgICBpZiBjbFswXSBpcyAnJSdcbiAgICAgIHJhbmdlID0gWzAsIGxhc3RMaW5lXVxuICAgICAgY2wgPSBjbFsxLi5dXG4gICAgZWxzZVxuICAgICAgYWRkclBhdHRlcm4gPSAvLy9eXG4gICAgICAgICg/OiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIEZpcnN0IGFkZHJlc3NcbiAgICAgICAgKFxuICAgICAgICBcXC58ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgQ3VycmVudCBsaW5lXG4gICAgICAgIFxcJHwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBMYXN0IGxpbmVcbiAgICAgICAgXFxkK3wgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIG4tdGggbGluZVxuICAgICAgICAnW1xcW1xcXTw+J2BcIl4uKCl7fWEtekEtWl18ICAgICAgICAgIyBNYXJrc1xuICAgICAgICAvLio/KD86W15cXFxcXS98JCl8ICAgICAgICAgICAgICAgICAjIFJlZ2V4XG4gICAgICAgIFxcPy4qPyg/OlteXFxcXF1cXD98JCl8ICAgICAgICAgICAgICAgIyBCYWNrd2FyZHMgc2VhcmNoXG4gICAgICAgIFsrLV1cXGQqICAgICAgICAgICAgICAgICAgICAgICAgICAgIyBDdXJyZW50IGxpbmUgKy8tIGEgbnVtYmVyIG9mIGxpbmVzXG4gICAgICAgICkoKD86XFxzKlsrLV1cXGQqKSopICAgICAgICAgICAgICAgICMgTGluZSBvZmZzZXRcbiAgICAgICAgKT9cbiAgICAgICAgKD86LCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgU2Vjb25kIGFkZHJlc3NcbiAgICAgICAgKCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMgU2FtZSBhcyBmaXJzdCBhZGRyZXNzXG4gICAgICAgIFxcLnxcbiAgICAgICAgXFwkfFxuICAgICAgICBcXGQrfFxuICAgICAgICAnW1xcW1xcXTw+J2BcIl4uKCl7fWEtekEtWl18XG4gICAgICAgIC8uKj9bXlxcXFxdL3xcbiAgICAgICAgXFw/Lio/W15cXFxcXVxcP3xcbiAgICAgICAgWystXVxcZCpcbiAgICAgICAgKSgoPzpcXHMqWystXVxcZCopKilcbiAgICAgICAgKT9cbiAgICAgIC8vL1xuXG4gICAgICBbbWF0Y2gsIGFkZHIxLCBvZmYxLCBhZGRyMiwgb2ZmMl0gPSBjbC5tYXRjaChhZGRyUGF0dGVybilcblxuICAgICAgY3Vyc29yID0gQGVkaXRvci5nZXRMYXN0Q3Vyc29yKClcblxuICAgICAgIyBTcGVjaWFsIGNhc2U6IHJ1biBjb21tYW5kIG9uIHNlbGVjdGlvbi4gVGhpcyBjYW4ndCBiZSBoYW5kbGVkIGJ5IHNpbXBseVxuICAgICAgIyBwYXJzaW5nIHRoZSBtYXJrIHNpbmNlIHZpbS1tb2RlIGRvZXNuJ3Qgc2V0IGl0IChhbmQgaXQgd291bGQgYmUgZmFpcmx5XG4gICAgICAjIHVzZWxlc3Mgd2l0aCBtdWx0aXBsZSBzZWxlY3Rpb25zKVxuICAgICAgaWYgYWRkcjEgaXMgXCInPFwiIGFuZCBhZGRyMiBpcyBcIic+XCJcbiAgICAgICAgcnVuT3ZlclNlbGVjdGlvbnMgPSB0cnVlXG4gICAgICBlbHNlXG4gICAgICAgIHJ1bk92ZXJTZWxlY3Rpb25zID0gZmFsc2VcbiAgICAgICAgaWYgYWRkcjE/XG4gICAgICAgICAgYWRkcmVzczEgPSBAcGFyc2VBZGRyKGFkZHIxLCBjdXJzb3IpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAjIElmIG5vIGFkZHIxIGlzIGdpdmVuICgsKzMpLCBhc3N1bWUgaXQgaXMgJy4nXG4gICAgICAgICAgYWRkcmVzczEgPSBjdXJzb3IuZ2V0QnVmZmVyUm93KClcbiAgICAgICAgaWYgb2ZmMT9cbiAgICAgICAgICBhZGRyZXNzMSArPSBAcGFyc2VPZmZzZXQob2ZmMSlcblxuICAgICAgICBhZGRyZXNzMSA9IDAgaWYgYWRkcmVzczEgaXMgLTFcbiAgICAgICAgYWRkcmVzczEgPSBsYXN0TGluZSBpZiBhZGRyZXNzMSA+IGxhc3RMaW5lXG5cbiAgICAgICAgaWYgYWRkcmVzczEgPCAwXG4gICAgICAgICAgdGhyb3cgbmV3IENvbW1hbmRFcnJvcignSW52YWxpZCByYW5nZScpXG5cbiAgICAgICAgaWYgYWRkcjI/XG4gICAgICAgICAgYWRkcmVzczIgPSBAcGFyc2VBZGRyKGFkZHIyLCBjdXJzb3IpXG4gICAgICAgIGlmIG9mZjI/XG4gICAgICAgICAgYWRkcmVzczIgKz0gQHBhcnNlT2Zmc2V0KG9mZjIpXG5cbiAgICAgICAgYWRkcmVzczIgPSAwIGlmIGFkZHJlc3MyIGlzIC0xXG4gICAgICAgIGFkZHJlc3MyID0gbGFzdExpbmUgaWYgYWRkcmVzczIgPiBsYXN0TGluZVxuXG4gICAgICAgIGlmIGFkZHJlc3MyIDwgMFxuICAgICAgICAgIHRocm93IG5ldyBDb21tYW5kRXJyb3IoJ0ludmFsaWQgcmFuZ2UnKVxuXG4gICAgICAgIGlmIGFkZHJlc3MyIDwgYWRkcmVzczFcbiAgICAgICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKCdCYWNrd2FyZHMgcmFuZ2UgZ2l2ZW4nKVxuXG4gICAgICByYW5nZSA9IFthZGRyZXNzMSwgaWYgYWRkcmVzczI/IHRoZW4gYWRkcmVzczIgZWxzZSBhZGRyZXNzMV1cbiAgICBjbCA9IGNsW21hdGNoPy5sZW5ndGguLl1cblxuICAgICMgU3RlcCA1OiBMZWFkaW5nIGJsYW5rcyBhcmUgaWdub3JlZFxuICAgIGNsID0gY2wudHJpbUxlZnQoKVxuXG4gICAgIyBTdGVwIDZhOiBJZiBubyBjb21tYW5kIGlzIHNwZWNpZmllZCwgZ28gdG8gdGhlIGxhc3Qgc3BlY2lmaWVkIGFkZHJlc3NcbiAgICBpZiBjbC5sZW5ndGggaXMgMFxuICAgICAgQGVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihbcmFuZ2VbMV0sIDBdKVxuICAgICAgcmV0dXJuXG5cbiAgICAjIElnbm9yZSBzdGVwcyA2YiBhbmQgNmMgc2luY2UgdGhleSBvbmx5IG1ha2Ugc2Vuc2UgZm9yIHByaW50IGNvbW1hbmRzIGFuZFxuICAgICMgcHJpbnQgZG9lc24ndCBtYWtlIHNlbnNlXG5cbiAgICAjIElnbm9yZSBzdGVwIDdhIHNpbmNlIGZsYWdzIGFyZSBvbmx5IHVzZWZ1bCBmb3IgcHJpbnRcblxuICAgICMgU3RlcCA3YjogOms8dmFsaWQgbWFyaz4gaXMgZXF1YWwgdG8gOm1hcmsgPHZhbGlkIG1hcms+IC0gb25seSBhLXpBLVogaXNcbiAgICAjIGluIHZpbS1tb2RlIGZvciBub3dcbiAgICBpZiBjbC5sZW5ndGggaXMgMiBhbmQgY2xbMF0gaXMgJ2snIGFuZCAvW2Etel0vaS50ZXN0KGNsWzFdKVxuICAgICAgY29tbWFuZCA9ICdtYXJrJ1xuICAgICAgYXJncyA9IGNsWzFdXG4gICAgZWxzZSBpZiBub3QgL1thLXpdL2kudGVzdChjbFswXSlcbiAgICAgIGNvbW1hbmQgPSBjbFswXVxuICAgICAgYXJncyA9IGNsWzEuLl1cbiAgICBlbHNlXG4gICAgICBbbSwgY29tbWFuZCwgYXJnc10gPSBjbC5tYXRjaCgvXihcXHcrKSguKikvKVxuXG4gICAgIyBJZiB0aGUgY29tbWFuZCBtYXRjaGVzIGFuIGV4aXN0aW5nIG9uZSBleGFjdGx5LCBleGVjdXRlIHRoYXQgb25lXG4gICAgdW5sZXNzIChmdW5jID0gRXguc2luZ2xldG9uKClbY29tbWFuZF0pP1xuICAgICAgIyBTdGVwIDg6IE1hdGNoIGNvbW1hbmQgYWdhaW5zdCBleGlzdGluZyBjb21tYW5kc1xuICAgICAgbWF0Y2hpbmcgPSAobmFtZSBmb3IgbmFtZSwgdmFsIG9mIEV4LnNpbmdsZXRvbigpIHdoZW4gXFxcbiAgICAgICAgbmFtZS5pbmRleE9mKGNvbW1hbmQpIGlzIDApXG5cbiAgICAgIG1hdGNoaW5nLnNvcnQoKVxuXG4gICAgICBjb21tYW5kID0gbWF0Y2hpbmdbMF1cblxuICAgICAgZnVuYyA9IEV4LnNpbmdsZXRvbigpW2NvbW1hbmRdXG5cbiAgICBpZiBmdW5jP1xuICAgICAgaWYgcnVuT3ZlclNlbGVjdGlvbnNcbiAgICAgICAgZm9yIGlkLCBzZWxlY3Rpb24gb2YgQHNlbGVjdGlvbnNcbiAgICAgICAgICBidWZmZXJSYW5nZSA9IHNlbGVjdGlvbi5nZXRCdWZmZXJSYW5nZSgpXG4gICAgICAgICAgcmFuZ2UgPSBbYnVmZmVyUmFuZ2Uuc3RhcnQucm93LCBidWZmZXJSYW5nZS5lbmQucm93XVxuICAgICAgICAgIGZ1bmMoeyByYW5nZSwgYXJncywgQHZpbVN0YXRlLCBAZXhTdGF0ZSwgQGVkaXRvciB9KVxuICAgICAgZWxzZVxuICAgICAgICBmdW5jKHsgcmFuZ2UsIGFyZ3MsIEB2aW1TdGF0ZSwgQGV4U3RhdGUsIEBlZGl0b3IgfSlcbiAgICBlbHNlXG4gICAgICB0aHJvdyBuZXcgQ29tbWFuZEVycm9yKFwiTm90IGFuIGVkaXRvciBjb21tYW5kOiAje2lucHV0LmNoYXJhY3RlcnN9XCIpXG5cbm1vZHVsZS5leHBvcnRzID0gQ29tbWFuZFxuIl19
