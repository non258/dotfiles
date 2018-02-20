(function() {
  var BufferedProcess, ClangFlags, addClangFlags, addCommonArgs, addDocumentationArgs, fs, getCommonArgs, makeFileBasedArgs, path, tmp;

  BufferedProcess = require('atom').BufferedProcess;

  path = require('path');

  fs = require('fs');

  tmp = require('tmp');

  ClangFlags = require('clang-flags');

  module.exports = {
    makeBufferedClangProcess: function(editor, args, callback, input) {
      return new Promise(function(resolve) {
        var argsCountThreshold, bufferedProcess, command, errors, exit, filePath, options, outputs, ref, ref1, stderr, stdout;
        command = atom.config.get("autocomplete-clang.clangCommand");
        options = {
          cwd: path.dirname(editor.getPath())
        };
        ref = [[], []], outputs = ref[0], errors = ref[1];
        stdout = function(data) {
          return outputs.push(data);
        };
        stderr = function(data) {
          return errors.push(data);
        };
        argsCountThreshold = atom.config.get("autocomplete-clang.argsCountThreshold");
        if ((args.join(" ")).length > (argsCountThreshold || 7000)) {
          ref1 = makeFileBasedArgs(args, editor), args = ref1[0], filePath = ref1[1];
          exit = function(code) {
            fs.unlinkSync(filePath);
            return callback(code, outputs.join('\n'), errors.join('\n'), resolve);
          };
        } else {
          exit = function(code) {
            return callback(code, outputs.join('\n'), errors.join('\n'), resolve);
          };
        }
        bufferedProcess = new BufferedProcess({
          command: command,
          args: args,
          options: options,
          stdout: stdout,
          stderr: stderr,
          exit: exit
        });
        bufferedProcess.process.stdin.setEncoding = 'utf-8';
        bufferedProcess.process.stdin.write(input);
        return bufferedProcess.process.stdin.end();
      });
    },
    buildCodeCompletionArgs: function(editor, row, column, language) {
      var args, currentDir, filePath, pchPath, ref, std;
      ref = getCommonArgs(editor, language), std = ref.std, filePath = ref.filePath, currentDir = ref.currentDir, pchPath = ref.pchPath;
      args = [];
      args.push("-fsyntax-only");
      args.push("-x" + language);
      args.push("-Xclang", "-code-completion-macros");
      args.push("-Xclang", "-code-completion-at=-:" + (row + 1) + ":" + (column + 1));
      if (fs.existsSync(pchPath)) {
        args.push("-include-pch", pchPath);
      }
      return addCommonArgs(args, std, currentDir, pchPath, filePath);
    },
    buildGoDeclarationCommandArgs: function(editor, language, term) {
      var args, currentDir, filePath, pchPath, ref, std;
      ref = getCommonArgs(editor, language), std = ref.std, filePath = ref.filePath, currentDir = ref.currentDir, pchPath = ref.pchPath;
      args = [];
      args.push("-fsyntax-only");
      args.push("-x" + language);
      args.push("-Xclang", "-ast-dump");
      args.push("-Xclang", "-ast-dump-filter");
      args.push("-Xclang", "" + term);
      if (fs.existsSync(pchPath)) {
        args.push("-include-pch", pchPath);
      }
      return addCommonArgs(args, std, currentDir, pchPath, filePath);
    },
    buildEmitPchCommandArgs: function(editor, language) {
      var args, currentDir, filePath, pchPath, ref, std;
      ref = getCommonArgs(editor, language), std = ref.std, filePath = ref.filePath, currentDir = ref.currentDir, pchPath = ref.pchPath;
      args = [];
      args.push("-x" + language + "-header");
      args.push("-Xclang", "-emit-pch", "-o", pchPath);
      return addCommonArgs(args, std, currentDir, pchPath, filePath);
    }
  };

  getCommonArgs = function(editor, language) {
    var currentDir, filePath, pchFile, pchFilePrefix;
    pchFilePrefix = atom.config.get("autocomplete-clang.pchFilePrefix");
    pchFile = [pchFilePrefix, language, "pch"].join('.');
    filePath = editor.getPath();
    currentDir = path.dirname(filePath);
    return {
      std: atom.config.get("autocomplete-clang.std " + language),
      filePath: filePath,
      currentDir: currentDir,
      pchPath: path.join(currentDir, pchFile)
    };
  };

  addCommonArgs = function(args, std, currentDir, pchPath, filePath) {
    var i, j, len, ref;
    if (std) {
      args.push("-std=" + std);
    }
    ref = atom.config.get("autocomplete-clang.includePaths");
    for (j = 0, len = ref.length; j < len; j++) {
      i = ref[j];
      args.push("-I" + i);
    }
    args.push("-I" + currentDir);
    args = addDocumentationArgs(args);
    args = addClangFlags(args, filePath);
    args.push("-");
    return args;
  };

  addClangFlags = function(args, filePath) {
    var clangflags, error;
    try {
      clangflags = ClangFlags.getClangFlags(filePath);
      if (clangflags) {
        args = args.concat(clangflags);
      }
    } catch (error1) {
      error = error1;
      console.log("clang-flags error:", error);
    }
    return args;
  };

  addDocumentationArgs = function(args) {
    if (atom.config.get("autocomplete-clang.includeDocumentation")) {
      args.push("-Xclang", "-code-completion-brief-comments");
      if (atom.config.get("autocomplete-clang.includeNonDoxygenCommentsAsDocumentation")) {
        args.push("-fparse-all-comments");
      }
      if (atom.config.get("autocomplete-clang.includeSystemHeadersDocumentation")) {
        args.push("-fretain-comments-from-system-headers");
      }
    }
    return args;
  };

  makeFileBasedArgs = function(args, editor) {
    var filePath;
    args = args.join('\n');
    args = args.replace(/\\/g, "\\\\");
    args = args.replace(/\ /g, "\\\ ");
    filePath = tmp.fileSync().name;
    fs.writeFile(filePath, args, function(error) {
      if (error) {
        return console.error("Error writing file", error);
      }
    });
    args = ['@' + filePath];
    return [args, filePath];
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1jbGFuZy9saWIvY2xhbmctYXJncy1idWlsZGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUMsa0JBQW1CLE9BQUEsQ0FBUSxNQUFSOztFQUNwQixJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjs7RUFDTixVQUFBLEdBQWEsT0FBQSxDQUFRLGFBQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FFRTtJQUFBLHdCQUFBLEVBQTBCLFNBQUMsTUFBRCxFQUFTLElBQVQsRUFBZSxRQUFmLEVBQXlCLEtBQXpCO2FBQ3hCLElBQUksT0FBSixDQUFZLFNBQUMsT0FBRDtBQUNWLFlBQUE7UUFBQSxPQUFBLEdBQVUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFaLENBQWdCLGlDQUFoQjtRQUNWLE9BQUEsR0FBVTtVQUFBLEdBQUEsRUFBSyxJQUFJLENBQUMsT0FBTCxDQUFhLE1BQU0sQ0FBQyxPQUFQLENBQUEsQ0FBYixDQUFMOztRQUNWLE1BQW9CLENBQUMsRUFBRCxFQUFLLEVBQUwsQ0FBcEIsRUFBQyxnQkFBRCxFQUFVO1FBQ1YsTUFBQSxHQUFTLFNBQUMsSUFBRDtpQkFBUyxPQUFPLENBQUMsSUFBUixDQUFhLElBQWI7UUFBVDtRQUNULE1BQUEsR0FBUyxTQUFDLElBQUQ7aUJBQVMsTUFBTSxDQUFDLElBQVAsQ0FBWSxJQUFaO1FBQVQ7UUFDVCxrQkFBQSxHQUFxQixJQUFJLENBQUMsTUFBTSxDQUFDLEdBQVosQ0FBZ0IsdUNBQWhCO1FBQ3JCLElBQUcsQ0FBQyxJQUFJLENBQUMsSUFBTCxDQUFVLEdBQVYsQ0FBRCxDQUFnQixDQUFDLE1BQWpCLEdBQTBCLENBQUMsa0JBQUEsSUFBc0IsSUFB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TCxDQUFVLElBQVY7SUFDUCxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxLQUFiLEVBQW9CLE1BQXBCO0lBQ1AsSUFBQSxHQUFPLElBQUksQ0FBQyxPQUFMLENBQWEsS0FBYixFQUFvQixNQUFwQjtJQUNQLFFBQUEsR0FBVyxHQUFHLENBQUMsUUFBSixDQUFBLENBQWMsQ0FBQztJQUMxQixFQUFFLENBQUMsU0FBSCxDQUFhLFFBQWIsRUFBdUIsSUFBdkIsRUFBNkIsU0FBQyxLQUFEO01BQzNCLElBQThDLEtBQTlDO2VBQUEsT0FBTyxDQUFDLEtBQVIsQ0FBYyxvQkFBZCxFQUFvQyxLQUFwQyxFQUFBOztJQUQyQixDQUE3QjtJQUVBLElBQUEsR0FBTyxDQUFDLEdBQUEsR0FBTSxRQUFQO1dBQ1AsQ0FBQyxJQUFELEVBQU8sUUFBUDtFQVJrQjtBQTlGcEIiLCJzb3VyY2VzQ29udGVudCI6WyJ7QnVmZmVyZWRQcm9jZXNzfSA9IHJlcXVpcmUgJ2F0b20nXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbmZzID0gcmVxdWlyZSAnZnMnXG50bXAgPSByZXF1aXJlICd0bXAnXG5DbGFuZ0ZsYWdzID0gcmVxdWlyZSAnY2xhbmctZmxhZ3MnXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICBtYWtlQnVmZmVyZWRDbGFuZ1Byb2Nlc3M6IChlZGl0b3IsIGFyZ3MsIGNhbGxiYWNrLCBpbnB1dCktPlxuICAgIG5ldyBQcm9taXNlIChyZXNvbHZlKSAtPlxuICAgICAgY29tbWFuZCA9IGF0b20uY29uZmlnLmdldCBcImF1dG9jb21wbGV0ZS1jbGFuZy5jbGFuZ0NvbW1hbmRcIlxuICAgICAgb3B0aW9ucyA9IGN3ZDogcGF0aC5kaXJuYW1lIGVkaXRvci5nZXRQYXRoKClcbiAgICAgIFtvdXRwdXRzLCBlcnJvcnNdID0gW1tdLCBbXV1cbiAgICAgIHN0ZG91dCA9IChkYXRhKS0+IG91dHB1dHMucHVzaCBkYXRhXG4gICAgICBzdGRlcnIgPSAoZGF0YSktPiBlcnJvcnMucHVzaCBkYXRhXG4gICAgICBhcmdzQ291bnRUaHJlc2hvbGQgPSBhdG9tLmNvbmZpZy5nZXQoXCJhdXRvY29tcGxldGUtY2xhbmcuYXJnc0NvdW50VGhyZXNob2xkXCIpXG4gICAgICBpZiAoYXJncy5qb2luKFwiIFwiKSkubGVuZ3RoID4gKGFyZ3NDb3VudFRocmVzaG9sZCBvciA3MDAwKVxuICAgICAgICBbYXJncywgZmlsZVBhdGhdID0gbWFrZUZpbGVCYXNlZEFyZ3MgYXJncywgZWRpdG9yXG4gICAgICAgIGV4aXQgPSAoY29kZSktPlxuICAgICAgICAgIGZzLnVubGlua1N5bmMgZmlsZVBhdGhcbiAgICAgICAgICBjYWxsYmFjayBjb2RlLCAob3V0cHV0cy5qb2luICdcXG4nKSwgKGVycm9ycy5qb2luICdcXG4nKSwgcmVzb2x2ZVxuICAgICAgZWxzZVxuICAgICAgICBleGl0ID0gKGNvZGUpLT4gY2FsbGJhY2sgY29kZSwgKG91dHB1dHMuam9pbiAnXFxuJyksIChlcnJvcnMuam9pbiAnXFxuJyksIHJlc29sdmVcbiAgICAgIGJ1ZmZlcmVkUHJvY2VzcyA9IG5ldyBCdWZmZXJlZFByb2Nlc3Moe2NvbW1hbmQsIGFyZ3MsIG9wdGlvbnMsIHN0ZG91dCwgc3RkZXJyLCBleGl0fSlcbiAgICAgIGJ1ZmZlcmVkUHJvY2Vzcy5wcm9jZXNzLnN0ZGluLnNldEVuY29kaW5nID0gJ3V0Zi04J1xuICAgICAgYnVmZmVyZWRQcm9jZXNzLnByb2Nlc3Muc3RkaW4ud3JpdGUgaW5wdXRcbiAgICAgIGJ1ZmZlcmVkUHJvY2Vzcy5wcm9jZXNzLnN0ZGluLmVuZCgpXG5cbiAgYnVpbGRDb2RlQ29tcGxldGlvbkFyZ3M6IChlZGl0b3IsIHJvdywgY29sdW1uLCBsYW5ndWFnZSkgLT5cbiAgICB7c3RkLCBmaWxlUGF0aCwgY3VycmVudERpciwgcGNoUGF0aH0gPSBnZXRDb21tb25BcmdzIGVkaXRvcixsYW5ndWFnZVxuICAgIGFyZ3MgPSBbXVxuICAgIGFyZ3MucHVzaCBcIi1mc3ludGF4LW9ubHlcIlxuICAgIGFyZ3MucHVzaCBcIi14I3tsYW5ndWFnZX1cIlxuICAgIGFyZ3MucHVzaCBcIi1YY2xhbmdcIiwgXCItY29kZS1jb21wbGV0aW9uLW1hY3Jvc1wiXG4gICAgYXJncy5wdXNoIFwiLVhjbGFuZ1wiLCBcIi1jb2RlLWNvbXBsZXRpb24tYXQ9LToje3JvdyArIDF9OiN7Y29sdW1uICsgMX1cIlxuICAgIGFyZ3MucHVzaChcIi1pbmNsdWRlLXBjaFwiLCBwY2hQYXRoKSBpZiBmcy5leGlzdHNTeW5jKHBjaFBhdGgpXG4gICAgYWRkQ29tbW9uQXJncyBhcmdzLCBzdGQsIGN1cnJlbnREaXIsIHBjaFBhdGgsIGZpbGVQYXRoXG5cbiAgYnVpbGRHb0RlY2xhcmF0aW9uQ29tbWFuZEFyZ3M6IChlZGl0b3IsIGxhbmd1YWdlLCB0ZXJtKS0+XG4gICAge3N0ZCwgZmlsZVBhdGgsIGN1cnJlbnREaXIsIHBjaFBhdGh9ID0gZ2V0Q29tbW9uQXJncyBlZGl0b3IsbGFuZ3VhZ2VcbiAgICBhcmdzID0gW11cbiAgICBhcmdzLnB1c2ggXCItZnN5bnRheC1vbmx5XCJcbiAgICBhcmdzLnB1c2ggXCIteCN7bGFuZ3VhZ2V9XCJcbiAgICBhcmdzLnB1c2ggXCItWGNsYW5nXCIsIFwiLWFzdC1kdW1wXCJcbiAgICBhcmdzLnB1c2ggXCItWGNsYW5nXCIsIFwiLWFzdC1kdW1wLWZpbHRlclwiXG4gICAgYXJncy5wdXNoIFwiLVhjbGFuZ1wiLCBcIiN7dGVybX1cIlxuICAgIGFyZ3MucHVzaChcIi1pbmNsdWRlLXBjaFwiLCBwY2hQYXRoKSBpZiBmcy5leGlzdHNTeW5jKHBjaFBhdGgpXG4gICAgYWRkQ29tbW9uQXJncyBhcmdzLCBzdGQsIGN1cnJlbnREaXIsIHBjaFBhdGgsIGZpbGVQYXRoXG5cbiAgYnVpbGRFbWl0UGNoQ29tbWFuZEFyZ3M6IChlZGl0b3IsIGxhbmd1YWdlKS0+XG4gICAge3N0ZCwgZmlsZVBhdGgsIGN1cnJlbnREaXIsIHBjaFBhdGh9ID0gZ2V0Q29tbW9uQXJncyBlZGl0b3IsbGFuZ3VhZ2VcbiAgICBhcmdzID0gW11cbiAgICBhcmdzLnB1c2ggXCIteCN7bGFuZ3VhZ2V9LWhlYWRlclwiXG4gICAgYXJncy5wdXNoIFwiLVhjbGFuZ1wiLCBcIi1lbWl0LXBjaFwiLCBcIi1vXCIsIHBjaFBhdGhcbiAgICBhZGRDb21tb25BcmdzIGFyZ3MsIHN0ZCwgY3VycmVudERpciwgcGNoUGF0aCwgZmlsZVBhdGhcblxuZ2V0Q29tbW9uQXJncyA9IChlZGl0b3IsIGxhbmd1YWdlKS0+XG4gIHBjaEZpbGVQcmVmaXggPSBhdG9tLmNvbmZpZy5nZXQgXCJhdXRvY29tcGxldGUtY2xhbmcucGNoRmlsZVByZWZpeFwiXG4gIHBjaEZpbGUgPSBbcGNoRmlsZVByZWZpeCwgbGFuZ3VhZ2UsIFwicGNoXCJdLmpvaW4gJy4nXG4gIGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKVxuICBjdXJyZW50RGlyID0gcGF0aC5kaXJuYW1lIGZpbGVQYXRoXG4gIHtcbiAgICBzdGQ6IChhdG9tLmNvbmZpZy5nZXQgXCJhdXRvY29tcGxldGUtY2xhbmcuc3RkICN7bGFuZ3VhZ2V9XCIpLFxuICAgIGZpbGVQYXRoOiBmaWxlUGF0aCxcbiAgICBjdXJyZW50RGlyOiBjdXJyZW50RGlyLFxuICAgIHBjaFBhdGg6IChwYXRoLmpvaW4gY3VycmVudERpciwgcGNoRmlsZSlcbiAgfVxuXG5hZGRDb21tb25BcmdzID0gKGFyZ3MsIHN0ZCwgY3VycmVudERpciwgcGNoUGF0aCwgZmlsZVBhdGgpLT5cbiAgYXJncy5wdXNoIFwiLXN0ZD0je3N0ZH1cIiBpZiBzdGRcbiAgYXJncy5wdXNoIFwiLUkje2l9XCIgZm9yIGkgaW4gYXRvbS5jb25maWcuZ2V0IFwiYXV0b2NvbXBsZXRlLWNsYW5nLmluY2x1ZGVQYXRoc1wiXG4gIGFyZ3MucHVzaCBcIi1JI3tjdXJyZW50RGlyfVwiXG4gIGFyZ3MgPSBhZGREb2N1bWVudGF0aW9uQXJncyBhcmdzXG4gIGFyZ3MgPSBhZGRDbGFuZ0ZsYWdzIGFyZ3MsIGZpbGVQYXRoXG4gIGFyZ3MucHVzaCBcIi1cIlxuICBhcmdzXG5cbmFkZENsYW5nRmxhZ3MgPSAoYXJncywgZmlsZVBhdGgpLT5cbiAgdHJ5XG4gICAgY2xhbmdmbGFncyA9IENsYW5nRmxhZ3MuZ2V0Q2xhbmdGbGFncyhmaWxlUGF0aClcbiAgICBhcmdzID0gYXJncy5jb25jYXQgY2xhbmdmbGFncyBpZiBjbGFuZ2ZsYWdzXG4gIGNhdGNoIGVycm9yXG4gICAgY29uc29sZS5sb2cgXCJjbGFuZy1mbGFncyBlcnJvcjpcIiwgZXJyb3JcbiAgYXJnc1xuXG5hZGREb2N1bWVudGF0aW9uQXJncyA9IChhcmdzKS0+XG4gIGlmIGF0b20uY29uZmlnLmdldCBcImF1dG9jb21wbGV0ZS1jbGFuZy5pbmNsdWRlRG9jdW1lbnRhdGlvblwiXG4gICAgYXJncy5wdXNoIFwiLVhjbGFuZ1wiLCBcIi1jb2RlLWNvbXBsZXRpb24tYnJpZWYtY29tbWVudHNcIlxuICAgIGlmIGF0b20uY29uZmlnLmdldCBcImF1dG9jb21wbGV0ZS1jbGFuZy5pbmNsdWRlTm9uRG94eWdlbkNvbW1lbnRzQXNEb2N1bWVudGF0aW9uXCJcbiAgICAgIGFyZ3MucHVzaCBcIi1mcGFyc2UtYWxsLWNvbW1lbnRzXCJcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQgXCJhdXRvY29tcGxldGUtY2xhbmcuaW5jbHVkZVN5c3RlbUhlYWRlcnNEb2N1bWVudGF0aW9uXCJcbiAgICAgIGFyZ3MucHVzaCBcIi1mcmV0YWluLWNvbW1lbnRzLWZyb20tc3lzdGVtLWhlYWRlcnNcIlxuICBhcmdzXG5cbm1ha2VGaWxlQmFzZWRBcmdzID0gKGFyZ3MsIGVkaXRvciktPlxuICBhcmdzID0gYXJncy5qb2luKCdcXG4nKVxuICBhcmdzID0gYXJncy5yZXBsYWNlIC9cXFxcL2csIFwiXFxcXFxcXFxcIlxuICBhcmdzID0gYXJncy5yZXBsYWNlIC9cXCAvZywgXCJcXFxcXFwgXCJcbiAgZmlsZVBhdGggPSB0bXAuZmlsZVN5bmMoKS5uYW1lXG4gIGZzLndyaXRlRmlsZSBmaWxlUGF0aCwgYXJncywgKGVycm9yKSAtPlxuICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciB3cml0aW5nIGZpbGVcIiwgZXJyb3IpIGlmIGVycm9yXG4gIGFyZ3MgPSBbJ0AnICsgZmlsZVBhdGhdXG4gIFthcmdzLCBmaWxlUGF0aF1cbiJdfQ==
