(function() {
  var BufferedProcess, CompositeDisposable, Processing, ProcessingView, fs, path, psTree, ref;

  ref = require('atom'), CompositeDisposable = ref.CompositeDisposable, BufferedProcess = ref.BufferedProcess;

  fs = require('fs');

  path = require('path');

  psTree = require('ps-tree');

  ProcessingView = require('./processing-view');

  module.exports = Processing = {
    config: {
      'processing-executable': {
        type: "string",
        "default": "processing-java"
      }
    },
    activate: function(state) {
      atom.commands.add('atom-workspace', {
        'processing:run': (function(_this) {
          return function() {
            return _this.runSketch();
          };
        })(this)
      });
      atom.commands.add('atom-workspace', {
        'processing:present': (function(_this) {
          return function() {
            return _this.runSketchPresent();
          };
        })(this)
      });
      return atom.commands.add('atom-workspace', {
        'processing:close': (function(_this) {
          return function() {
            return _this.closeSketch();
          };
        })(this)
      });
    },
    saveSketch: function() {
      var dir, editor, file, num;
      editor = atom.workspace.getActivePaneItem();
      file = editor != null ? editor.buffer.file : void 0;
      if (file != null ? file.existsSync() : void 0) {
        return editor.save();
      } else {
        num = Math.floor(Math.random() * 10000);
        dir = fs.mkdirSync("/tmp/sketch_" + num + "/");
        return editor.saveAs("/tmp/sketch_" + num + "/sketch_" + num + ".pde");
      }
    },
    buildSketch: function() {
      var args, build_dir, command, editor, exit, file, folder, options, stderr, stdout;
      console.log("build and run time");
      editor = atom.workspace.getActivePaneItem();
      file = editor != null ? editor.buffer.file : void 0;
      folder = file.getParent().getPath();
      build_dir = path.join(folder, "build");
      command = path.normalize(atom.config.get("processing.processing-executable"));
      args = ["--force", "--sketch=" + folder, "--output=" + build_dir, "--run"];
      options = {};
      console.log("Running command " + command + " " + (args.join(" ")));
      stdout = (function(_this) {
        return function(output) {
          return _this.display(output);
        };
      })(this);
      stderr = (function(_this) {
        return function(output) {
          return _this.display(output);
        };
      })(this);
      exit = function(code) {
        return console.log("Error code: " + code);
      };
      if (!this.view) {
        this.view = new ProcessingView;
        atom.workspace.addBottomPanel({
          item: this.view
        });
      }
      if (this.process) {
        psTree(this.process.process.pid, (function(_this) {
          return function(err, children) {
            var child, i, len, results;
            results = [];
            for (i = 0, len = children.length; i < len; i++) {
              child = children[i];
              results.push(process.kill(child.PID));
            }
            return results;
          };
        })(this));
        this.view.clear();
      }
      return this.process = new BufferedProcess({
        command: command,
        args: args,
        stdout: stdout,
        stderr: stderr,
        exit: exit
      });
    },
    runSketch: function() {
      this.saveSketch();
      return this.buildSketch();
    },
    display: function(line) {
      return this.view.log(line);
    },
    closeSketch: function() {
      if (this.view) {
        this.view.clear();
      }
      if (this.process) {
        return psTree(this.process.process.pid, (function(_this) {
          return function(err, children) {
            var child, i, len, results;
            results = [];
            for (i = 0, len = children.length; i < len; i++) {
              child = children[i];
              results.push(process.kill(child.PID));
            }
            return results;
          };
        })(this));
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL3Byb2Nlc3NpbmcvbGliL3Byb2Nlc3NpbmcuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUF5QyxPQUFBLENBQVEsTUFBUixDQUF6QyxFQUFDLDZDQUFELEVBQXNCOztFQUN0QixFQUFBLEdBQUssT0FBQSxDQUFRLElBQVI7O0VBQ0wsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLE1BQUEsR0FBUyxPQUFBLENBQVEsU0FBUjs7RUFDVCxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxtQkFBUjs7RUFFakIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsVUFBQSxHQUNmO0lBQUEsTUFBQSxFQUNFO01BQUEsdUJBQUEsRUFDRTtRQUFBLElBQUEsRUFBSyxRQUFMO1FBQ0EsQ0FBQSxPQUFBLENBQUEsRUFBUSxpQkFEUjtPQURGO0tBREY7SUFLQSxRQUFBLEVBQVUsU0FBQyxLQUFEO01BQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztRQUFBLGdCQUFBLEVBQWtCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ3BELEtBQUMsQ0FBQSxTQUFELENBQUE7VUFEb0Q7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQWxCO09BQXBDO01BRUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQztRQUFBLG9CQUFBLEVBQXNCLENBQUEsU0FBQSxLQUFBO2lCQUFBLFNBQUE7bUJBQ3hELEtBQUMsQ0FBQSxnQkFBRCxDQUFBO1VBRHdEO1FBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUF0QjtPQUFwQzthQUVBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0M7UUFBQSxrQkFBQSxFQUFvQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFB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QixRQUFBLE1BQWhCO1FBQXdCLFFBQUEsTUFBeEI7UUFBZ0MsTUFBQSxJQUFoQztPQUFwQjtJQXRCQSxDQXhCYjtJQWlEQSxTQUFBLEVBQVcsU0FBQTtNQUNULElBQUMsQ0FBQSxVQUFELENBQUE7YUFDQSxJQUFDLENBQUEsV0FBRCxDQUFBO0lBRlMsQ0FqRFg7SUFxREEsT0FBQSxFQUFTLFNBQUMsSUFBRDthQUNQLElBQUMsQ0FBQSxJQUFJLENBQUMsR0FBTixDQUFVLElBQVY7SUFETyxDQXJEVDtJQXdEQSxXQUFBLEVBQWEsU0FBQTtNQUNYLElBQUcsSUFBQyxDQUFBLElBQUo7UUFDRSxJQUFDLENBQUEsSUFBSSxDQUFDLEtBQU4sQ0FBQSxFQURGOztNQUVBLElBQUcsSUFBQyxDQUFBLE9BQUo7ZUFDRSxNQUFBLENBQU8sSUFBQyxDQUFBLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBeEIsRUFBNkIsQ0FBQSxTQUFBLEtBQUE7aUJBQUEsU0FBQyxHQUFELEVBQU0sUUFBTjtBQUMzQixnQkFBQTtBQUFBO2lCQUFBLDBDQUFBOzsyQkFDRSxPQUFPLENBQUMsSUFBUixDQUFhLEtBQUssQ0FBQyxHQUFuQjtBQURGOztVQUQyQjtRQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBN0IsRUFERjs7SUFIVyxDQXhEYjs7QUFQRiIsInNvdXJjZXNDb250ZW50IjpbIntDb21wb3NpdGVEaXNwb3NhYmxlLCBCdWZmZXJlZFByb2Nlc3N9ID0gcmVxdWlyZSAnYXRvbSdcbmZzID0gcmVxdWlyZSAnZnMnXG5wYXRoID0gcmVxdWlyZSAncGF0aCdcbnBzVHJlZSA9IHJlcXVpcmUgJ3BzLXRyZWUnXG5Qcm9jZXNzaW5nVmlldyA9IHJlcXVpcmUgJy4vcHJvY2Vzc2luZy12aWV3J1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2Nlc3NpbmcgPVxuICBjb25maWc6XG4gICAgJ3Byb2Nlc3NpbmctZXhlY3V0YWJsZSc6XG4gICAgICB0eXBlOlwic3RyaW5nXCIsXG4gICAgICBkZWZhdWx0OlwicHJvY2Vzc2luZy1qYXZhXCJcblxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsICdwcm9jZXNzaW5nOnJ1bic6ID0+XG4gICAgICBAcnVuU2tldGNoKClcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAncHJvY2Vzc2luZzpwcmVzZW50JzogPT5cbiAgICAgIEBydW5Ta2V0Y2hQcmVzZW50KClcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAncHJvY2Vzc2luZzpjbG9zZSc6ID0+XG4gICAgICBAY2xvc2VTa2V0Y2goKVxuXG4gIHNhdmVTa2V0Y2g6IC0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKVxuICAgIGZpbGUgPSBlZGl0b3I/LmJ1ZmZlci5maWxlXG5cbiAgICBpZiBmaWxlPy5leGlzdHNTeW5jKClcbiAgICAgIGVkaXRvci5zYXZlKClcbiAgICBlbHNlXG4gICAgICBudW0gPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDAwMClcbiAgICAgIGRpciA9IGZzLm1rZGlyU3luYyhcIi90bXAvc2tldGNoXyN7bnVtfS9cIilcbiAgICAgIGVkaXRvci5zYXZlQXMoXCIvdG1wL3NrZXRjaF8je251bX0vc2tldGNoXyN7bnVtfS5wZGVcIilcblxuICBidWlsZFNrZXRjaDogLT5cbiAgICBjb25zb2xlLmxvZyhcImJ1aWxkIGFuZCBydW4gdGltZVwiKVxuICAgIGVkaXRvciAgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpXG4gICAgZmlsZSAgICA9IGVkaXRvcj8uYnVmZmVyLmZpbGVcbiAgICBmb2xkZXIgID0gZmlsZS5nZXRQYXJlbnQoKS5nZXRQYXRoKClcbiAgICBidWlsZF9kaXIgPSBwYXRoLmpvaW4oZm9sZGVyLCBcImJ1aWxkXCIpXG4gICAgY29tbWFuZCA9IHBhdGgubm9ybWFsaXplKGF0b20uY29uZmlnLmdldChcInByb2Nlc3NpbmcucHJvY2Vzc2luZy1leGVjdXRhYmxlXCIpKVxuICAgIGFyZ3MgPSBbXCItLWZvcmNlXCIsIFwiLS1za2V0Y2g9I3tmb2xkZXJ9XCIsIFwiLS1vdXRwdXQ9I3tidWlsZF9kaXJ9XCIsIFwiLS1ydW5cIl1cbiAgICBvcHRpb25zID0ge31cbiAgICBjb25zb2xlLmxvZyhcIlJ1bm5pbmcgY29tbWFuZCAje2NvbW1hbmR9ICN7YXJncy5qb2luKFwiIFwiKX1cIilcbiAgICBzdGRvdXQgPSAob3V0cHV0KSA9PiBAZGlzcGxheSBvdXRwdXRcbiAgICBzdGRlcnIgPSAob3V0cHV0KSA9PiBAZGlzcGxheSBvdXRwdXRcbiAgICBleGl0ID0gKGNvZGUpIC0+XG4gICAgICBjb25zb2xlLmxvZyhcIkVycm9yIGNvZGU6ICN7Y29kZX1cIilcbiAgICBpZiAhQHZpZXdcbiAgICAgIEB2aWV3ID0gbmV3IFByb2Nlc3NpbmdWaWV3XG4gICAgICBhdG9tLndvcmtzcGFjZS5hZGRCb3R0b21QYW5lbChpdGVtOiBAdmlldylcbiAgICBpZiBAcHJvY2Vzc1xuICAgICAgcHNUcmVlIEBwcm9jZXNzLnByb2Nlc3MucGlkLCAoZXJyLCBjaGlsZHJlbikgPT5cbiAgICAgICAgZm9yIGNoaWxkIGluIGNoaWxkcmVuXG4gICAgICAgICAgcHJvY2Vzcy5raWxsKGNoaWxkLlBJRClcbiAgICAgIEB2aWV3LmNsZWFyKClcbiAgICBAcHJvY2VzcyA9IG5ldyBCdWZmZXJlZFByb2Nlc3Moe2NvbW1hbmQsIGFyZ3MsIHN0ZG91dCwgc3RkZXJyLCBleGl0fSlcblxuXG4gIHJ1blNrZXRjaDogLT5cbiAgICBAc2F2ZVNrZXRjaCgpXG4gICAgQGJ1aWxkU2tldGNoKClcblxuICBkaXNwbGF5OiAobGluZSkgLT5cbiAgICBAdmlldy5sb2cobGluZSlcblxuICBjbG9zZVNrZXRjaDogLT5cbiAgICBpZiBAdmlld1xuICAgICAgQHZpZXcuY2xlYXIoKVxuICAgIGlmIEBwcm9jZXNzXG4gICAgICBwc1RyZWUgQHByb2Nlc3MucHJvY2Vzcy5waWQsIChlcnIsIGNoaWxkcmVuKSA9PlxuICAgICAgICBmb3IgY2hpbGQgaW4gY2hpbGRyZW5cbiAgICAgICAgICBwcm9jZXNzLmtpbGwoY2hpbGQuUElEKVxuIl19
