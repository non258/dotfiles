(function() {
  var AtomRunner, AtomRunnerView, ConfigObserver, fs, p, spawn, url,
    slice = [].slice;

  ConfigObserver = require('atom').ConfigObserver;

  spawn = require('child_process').spawn;

  fs = require('fs');

  url = require('url');

  p = require('path');

  AtomRunnerView = require('./atom-runner-view');

  AtomRunner = (function() {
    function AtomRunner() {}

    AtomRunner.prototype.config = {
      showOutputWindow: {
        title: 'Show Output Pane',
        description: 'Displays the output pane when running commands. Uncheck to hide output.',
        type: 'boolean',
        "default": true,
        order: 1
      },
      paneSplitDirection: {
        title: 'Pane Split Direction',
        description: 'The direction to split when opening the output pane.',
        type: 'string',
        "default": 'Right',
        "enum": ['Right', 'Down', 'Up', 'Left']
      }
    };

    AtomRunner.prototype.cfg = {
      ext: 'runner.extensions',
      scope: 'runner.scopes'
    };

    AtomRunner.prototype.defaultExtensionMap = {
      'spec.coffee': 'mocha',
      'ps1': 'powershell -file',
      '_test.go': 'go test'
    };

    AtomRunner.prototype.defaultScopeMap = {
      coffee: 'coffee',
      js: 'node',
      ruby: 'ruby',
      python: 'python',
      go: 'go run',
      shell: 'bash',
      powershell: 'powershell -noninteractive -noprofile -c -'
    };

    AtomRunner.prototype.timer = null;

    AtomRunner.prototype.extensionMap = null;

    AtomRunner.prototype.scopeMap = null;

    AtomRunner.prototype.splitFuncDefault = 'splitRight';

    AtomRunner.prototype.splitFuncs = {
      Right: 'splitRight',
      Left: 'splitLeft',
      Up: 'splitUp',
      Down: 'splitDown'
    };

    AtomRunner.prototype.debug = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      return console.debug.apply(console, ['[atom-runner]'].concat(slice.call(args)));
    };

    AtomRunner.prototype.initEnv = function() {
      var out, pid, ref, shell;
      if (process.platform === 'darwin') {
        ref = [process.env.SHELL || 'bash', ''], shell = ref[0], out = ref[1];
        this.debug('Importing ENV from', shell);
        pid = spawn(shell, ['--login', '-c', 'env']);
        pid.stdout.on('data', function(chunk) {
          return out += chunk;
        });
        pid.on('error', (function(_this) {
          return function() {
            return _this.debug('Failed to import ENV from', shell);
          };
        })(this));
        pid.on('close', (function(_this) {
          return function() {
            var i, len, line, match, ref1, results;
            ref1 = out.split('\n');
            results = [];
            for (i = 0, len = ref1.length; i < len; i++) {
              line = ref1[i];
              match = line.match(/^(\S+?)=(.+)/);
              if (match) {
                results.push(process.env[match[1]] = match[2]);
              } else {
                results.push(void 0);
              }
            }
            return results;
          };
        })(this));
        return pid.stdin.end();
      }
    };

    AtomRunner.prototype.destroy = function() {
      atom.config.unobserve(this.cfg.ext);
      return atom.config.unobserve(this.cfg.scope);
    };

    AtomRunner.prototype.activate = function() {
      this.initEnv();
      atom.config.setDefaults(this.cfg.ext, this.defaultExtensionMap);
      atom.config.setDefaults(this.cfg.scope, this.defaultScopeMap);
      atom.config.observe(this.cfg.ext, (function(_this) {
        return function() {
          return _this.extensionMap = atom.config.get(_this.cfg.ext);
        };
      })(this));
      atom.config.observe(this.cfg.scope, (function(_this) {
        return function() {
          return _this.scopeMap = atom.config.get(_this.cfg.scope);
        };
      })(this));
      atom.commands.add('atom-workspace', 'run:file', (function(_this) {
        return function() {
          return _this.run(false);
        };
      })(this));
      atom.commands.add('atom-workspace', 'run:selection', (function(_this) {
        return function() {
          return _this.run(true);
        };
      })(this));
      atom.commands.add('atom-workspace', 'run:stop', (function(_this) {
        return function() {
          return _this.stop();
        };
      })(this));
      atom.commands.add('atom-workspace', 'run:close', (function(_this) {
        return function() {
          return _this.stopAndClose();
        };
      })(this));
      return atom.commands.add('.atom-runner', 'run:copy', (function(_this) {
        return function() {
          return atom.clipboard.write(window.getSelection().toString());
        };
      })(this));
    };

    AtomRunner.prototype.run = function(selection) {
      var cmd, dir, dirfunc, editor, pane, panes, path, ref, view;
      editor = atom.workspace.getActiveTextEditor();
      if (editor == null) {
        return;
      }
      path = editor.getPath();
      cmd = this.commandFor(editor, selection);
      if (cmd == null) {
        console.warn("No registered executable for file '" + path + "'");
        return;
      }
      if (atom.config.get('atom-runner.showOutputWindow')) {
        ref = this.runnerView(), pane = ref.pane, view = ref.view;
        if (view == null) {
          view = new AtomRunnerView(editor.getTitle());
          panes = atom.workspace.getPanes();
          dir = atom.config.get('atom-runner.paneSplitDirection');
          dirfunc = this.splitFuncs[dir] || this.splitFuncDefault;
          pane = panes[panes.length - 1][dirfunc](view);
        }
      } else {
        view = {
          mocked: true,
          append: function(text, type) {
            if (type === 'stderr') {
              return console.error(text);
            } else {
              return console.log(text);
            }
          },
          scrollToBottom: function() {},
          clear: function() {},
          footer: function() {}
        };
      }
      if (!view.mocked) {
        view.setTitle(editor.getTitle());
        pane.activateItem(view);
      }
      return this.execute(cmd, editor, view, selection);
    };

    AtomRunner.prototype.stop = function(view) {
      if (this.child) {
        if (view == null) {
          view = this.runnerView().view;
        }
        if (view && (view.isOnDom() != null)) {
          view.append('^C', 'stdin');
        } else {
          this.debug('Killed child', this.child.pid);
        }
        this.child.kill('SIGINT');
        if (this.child.killed) {
          this.child = null;
        }
      }
      if (this.timer) {
        clearInterval(this.timer);
      }
      return this.timer = null;
    };

    AtomRunner.prototype.stopAndClose = function() {
      var pane, ref, view;
      ref = this.runnerView(), pane = ref.pane, view = ref.view;
      if (pane != null) {
        pane.removeItem(view);
      }
      return this.stop(view);
    };

    AtomRunner.prototype.execute = function(cmd, editor, view, selection) {
      var args, currentPid, dir, err, splitCmd, startTime;
      this.stop();
      view.clear();
      args = [];
      if (editor.getPath()) {
        editor.save();
        if (!selection) {
          args.push(editor.getPath());
        }
      }
      splitCmd = cmd.split(/\s+/);
      if (splitCmd.length > 1) {
        cmd = splitCmd[0];
        args = splitCmd.slice(1).concat(args);
      }
      try {
        dir = atom.project.getPaths()[0] || '.';
        try {
          if (!fs.statSync(dir).isDirectory()) {
            throw new Error("Bad dir");
          }
        } catch (error) {
          dir = p.dirname(dir);
        }
        this.child = spawn(cmd, args, {
          cwd: dir
        });
        this.timer = setInterval(((function(_this) {
          return function() {
            return view.appendFooter('.');
          };
        })(this)), 750);
        currentPid = this.child.pid;
        this.child.on('error', (function(_this) {
          return function(err) {
            if (err.message.match(/\bENOENT$/)) {
              view.append('Unable to find command: ' + cmd + '\n', 'stderr');
              view.append('Are you sure PATH is configured correctly?\n\n', 'stderr');
              view.append('ENV PATH: ' + process.env.PATH + '\n\n', 'stderr');
            }
            view.append(err.stack, 'stderr');
            view.scrollToBottom();
            _this.child = null;
            if (_this.timer) {
              return clearInterval(_this.timer);
            }
          };
        })(this));
        this.child.stderr.on('data', (function(_this) {
          return function(data) {
            view.append(data, 'stderr');
            return view.scrollToBottom();
          };
        })(this));
        this.child.stdout.on('data', (function(_this) {
          return function(data) {
            view.append(data, 'stdout');
            return view.scrollToBottom();
          };
        })(this));
        this.child.on('close', (function(_this) {
          return function(code, signal) {
            var time;
            if (_this.child && _this.child.pid === currentPid) {
              time = (new Date - startTime) / 1000;
              view.appendFooter(" Exited with code=" + code + " in " + time + " seconds.");
              view.scrollToBottom();
              if (_this.timer) {
                return clearInterval(_this.timer);
              }
            }
          };
        })(this));
      } catch (error) {
        err = error;
        view.append(err.stack, 'stderr');
        view.scrollToBottom();
        this.stop();
      }
      startTime = new Date;
      try {
        if (selection) {
          this.child.stdin.write(editor.getLastSelection().getText());
        } else if (!editor.getPath()) {
          this.child.stdin.write(editor.getText());
        }
        this.child.stdin.end();
      } catch (error) {}
      return view.footer("Running: " + cmd + " (cwd=" + (editor.getPath()) + " pid=" + this.child.pid + ").");
    };

    AtomRunner.prototype.commandFor = function(editor, selection) {
      var boundary, ext, i, j, len, len1, name, ref, ref1, scope, shebang;
      shebang = this.commandForShebang(editor);
      if (shebang != null) {
        return shebang;
      }
      if (!selection) {
        if (editor.getPath() != null) {
          ref = Object.keys(this.extensionMap).sort(function(a, b) {
            return b.length - a.length;
          });
          for (i = 0, len = ref.length; i < len; i++) {
            ext = ref[i];
            boundary = ext.match(/^\b/) ? '' : '\\b';
            if (editor.getPath().match(boundary + ext + '$')) {
              return this.extensionMap[ext];
            }
          }
        }
      }
      scope = editor.getLastCursor().getScopeDescriptor().scopes[0];
      ref1 = Object.keys(this.scopeMap);
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        name = ref1[j];
        if (scope.match('^source\\.' + name + '\\b')) {
          return this.scopeMap[name];
        }
      }
    };

    AtomRunner.prototype.commandForShebang = function(editor) {
      var match;
      match = editor.lineTextForBufferRow(0).match(/^#!\s*(.+)/);
      return match && match[1];
    };

    AtomRunner.prototype.runnerView = function() {
      var i, j, len, len1, pane, ref, ref1, view;
      ref = atom.workspace.getPanes();
      for (i = 0, len = ref.length; i < len; i++) {
        pane = ref[i];
        ref1 = pane.getItems();
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          view = ref1[j];
          if (view instanceof AtomRunnerView) {
            return {
              pane: pane,
              view: view
            };
          }
        }
      }
      return {
        pane: null,
        view: null
      };
    };

    return AtomRunner;

  })();

  module.exports = new AtomRunner;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2F0b20tcnVubmVyL2xpYi9hdG9tLXJ1bm5lci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDZEQUFBO0lBQUE7O0VBQUMsaUJBQWtCLE9BQUEsQ0FBUSxNQUFSOztFQUVuQixLQUFBLEdBQVEsT0FBQSxDQUFRLGVBQVIsQ0FBd0IsQ0FBQzs7RUFDakMsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLEdBQUEsR0FBTSxPQUFBLENBQVEsS0FBUjs7RUFDTixDQUFBLEdBQUksT0FBQSxDQUFRLE1BQVI7O0VBRUosY0FBQSxHQUFpQixPQUFBLENBQVEsb0JBQVI7O0VBRVg7Ozt5QkFDSixNQUFBLEdBQ0U7TUFBQSxnQkFBQSxFQUNFO1FBQUEsS0FBQSxFQUFPLGtCQUFQO1FBQ0EsV0FBQSxFQUFhLHlFQURiO1FBRUEsSUFBQSxFQUFNLFNBRk47UUFHQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBSFQ7UUFJQSxLQUFBLEVBQU8sQ0FKUDtPQURGO01BTUEsa0JBQUEsRUFDRTtRQUFBLEtBQUEsRUFBTyxzQkFBUDtRQUNBLFdBQUEsRUFBYSxzREFEYjtRQUVBLElBQUEsRUFBTSxRQUZOO1FBR0EsQ0FBQSxPQUFBLENBQUEsRUFBUyxPQUhUO1FBSUEsQ0FBQSxJQUFBLENBQUEsRUFBTSxDQUFDLE9BQUQsRUFBVSxNQUFWLEVBQWtCLElBQWxCLEVBQXdCLE1BQXhCLENBSk47T0FQRjs7O3lCQWFGLEdBQUEsR0FDRTtNQUFBLEdBQUEsRUFBSyxtQkFBTDtNQUNBLEtBQUEsRUFBTyxlQURQOzs7eUJBR0YsbUJBQUEsR0FDRTtNQUFBLGFBQUEsRUFBZSxPQUFmO01BQ0EsS0FBQSxFQUFPLGtCQURQO01BRUEsVUFBQSxFQUFZLFNBRlo7Ozt5QkFJRixlQUFBLEdBQ0U7TUFBQSxNQUFBLEVBQVEsUUFBUjtNQUNBLEVBQUEsRUFBSSxN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S0FBbEMsQ0FBSDtBQUNFLGlCQUFPLElBQUMsQ0FBQSxRQUFTLENBQUEsSUFBQSxFQURuQjs7QUFERjtJQWhCVTs7eUJBb0JaLGlCQUFBLEdBQW1CLFNBQUMsTUFBRDtBQUNqQixVQUFBO01BQUEsS0FBQSxHQUFRLE1BQU0sQ0FBQyxvQkFBUCxDQUE0QixDQUE1QixDQUE4QixDQUFDLEtBQS9CLENBQXFDLFlBQXJDO2FBQ1IsS0FBQSxJQUFVLEtBQU0sQ0FBQSxDQUFBO0lBRkM7O3lCQUluQixVQUFBLEdBQVksU0FBQTtBQUNWLFVBQUE7QUFBQTtBQUFBLFdBQUEscUNBQUE7O0FBQ0U7QUFBQSxhQUFBLHdDQUFBOztVQUNFLElBQW1DLElBQUEsWUFBZ0IsY0FBbkQ7QUFBQSxtQkFBTztjQUFDLElBQUEsRUFBTSxJQUFQO2NBQWEsSUFBQSxFQUFNLElBQW5CO2NBQVA7O0FBREY7QUFERjthQUdBO1FBQUMsSUFBQSxFQUFNLElBQVA7UUFBYSxJQUFBLEVBQU0sSUFBbkI7O0lBSlU7Ozs7OztFQU9kLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLElBQUk7QUF0T3JCIiwic291cmNlc0NvbnRlbnQiOlsie0NvbmZpZ09ic2VydmVyfSA9IHJlcXVpcmUgJ2F0b20nXG5cbnNwYXduID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpLnNwYXduXG5mcyA9IHJlcXVpcmUoJ2ZzJylcbnVybCA9IHJlcXVpcmUoJ3VybCcpXG5wID0gcmVxdWlyZSgncGF0aCcpXG5cbkF0b21SdW5uZXJWaWV3ID0gcmVxdWlyZSAnLi9hdG9tLXJ1bm5lci12aWV3J1xuXG5jbGFzcyBBdG9tUnVubmVyXG4gIGNvbmZpZzpcbiAgICBzaG93T3V0cHV0V2luZG93OlxuICAgICAgdGl0bGU6ICdTaG93IE91dHB1dCBQYW5lJ1xuICAgICAgZGVzY3JpcHRpb246ICdEaXNwbGF5cyB0aGUgb3V0cHV0IHBhbmUgd2hlbiBydW5uaW5nIGNvbW1hbmRzLiBVbmNoZWNrIHRvIGhpZGUgb3V0cHV0LidcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgICAgb3JkZXI6IDFcbiAgICBwYW5lU3BsaXREaXJlY3Rpb246XG4gICAgICB0aXRsZTogJ1BhbmUgU3BsaXQgRGlyZWN0aW9uJ1xuICAgICAgZGVzY3JpcHRpb246ICdUaGUgZGlyZWN0aW9uIHRvIHNwbGl0IHdoZW4gb3BlbmluZyB0aGUgb3V0cHV0IHBhbmUuJ1xuICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgIGRlZmF1bHQ6ICdSaWdodCdcbiAgICAgIGVudW06IFsnUmlnaHQnLCAnRG93bicsICdVcCcsICdMZWZ0J11cblxuICBjZmc6XG4gICAgZXh0OiAncnVubmVyLmV4dGVuc2lvbnMnXG4gICAgc2NvcGU6ICdydW5uZXIuc2NvcGVzJ1xuXG4gIGRlZmF1bHRFeHRlbnNpb25NYXA6XG4gICAgJ3NwZWMuY29mZmVlJzogJ21vY2hhJ1xuICAgICdwczEnOiAncG93ZXJzaGVsbCAtZmlsZSdcbiAgICAnX3Rlc3QuZ28nOiAnZ28gdGVzdCdcblxuICBkZWZhdWx0U2NvcGVNYXA6XG4gICAgY29mZmVlOiAnY29mZmVlJ1xuICAgIGpzOiAnbm9kZSdcbiAgICBydWJ5OiAncnVieSdcbiAgICBweXRob246ICdweXRob24nXG4gICAgZ286ICdnbyBydW4nXG4gICAgc2hlbGw6ICdiYXNoJ1xuICAgIHBvd2Vyc2hlbGw6ICdwb3dlcnNoZWxsIC1ub25pbnRlcmFjdGl2ZSAtbm9wcm9maWxlIC1jIC0nXG5cbiAgdGltZXI6IG51bGxcbiAgZXh0ZW5zaW9uTWFwOiBudWxsXG4gIHNjb3BlTWFwOiBudWxsXG4gIHNwbGl0RnVuY0RlZmF1bHQ6ICdzcGxpdFJpZ2h0J1xuICBzcGxpdEZ1bmNzOlxuICAgIFJpZ2h0OiAnc3BsaXRSaWdodCdcbiAgICBMZWZ0OiAnc3BsaXRMZWZ0J1xuICAgIFVwOiAnc3BsaXRVcCdcbiAgICBEb3duOiAnc3BsaXREb3duJ1xuXG4gIGRlYnVnOiAoYXJncy4uLikgLT5cbiAgICBjb25zb2xlLmRlYnVnKCdbYXRvbS1ydW5uZXJdJywgYXJncy4uLilcblxuICBpbml0RW52OiAtPlxuICAgIGlmIHByb2Nlc3MucGxhdGZvcm0gPT0gJ2RhcndpbidcbiAgICAgIFtzaGVsbCwgb3V0XSA9IFtwcm9jZXNzLmVudi5TSEVMTCB8fCAnYmFzaCcsICcnXVxuICAgICAgQGRlYnVnKCdJbXBvcnRpbmcgRU5WIGZyb20nLCBzaGVsbClcbiAgICAgIHBpZCA9IHNwYXduKHNoZWxsLCBbJy0tbG9naW4nLCAnLWMnLCAnZW52J10pXG4gICAgICBwaWQuc3Rkb3V0Lm9uICdkYXRhJywgKGNodW5rKSAtPiBvdXQgKz0gY2h1bmtcbiAgICAgIHBpZC5vbiAnZXJyb3InLCA9PlxuICAgICAgICBAZGVidWcoJ0ZhaWxlZCB0byBpbXBvcnQgRU5WIGZyb20nLCBzaGVsbClcbiAgICAgIHBpZC5vbiAnY2xvc2UnLCA9PlxuICAgICAgICBmb3IgbGluZSBpbiBvdXQuc3BsaXQoJ1xcbicpXG4gICAgICAgICAgbWF0Y2ggPSBsaW5lLm1hdGNoKC9eKFxcUys/KT0oLispLylcbiAgICAgICAgICBwcm9jZXNzLmVudlttYXRjaFsxXV0gPSBtYXRjaFsyXSBpZiBtYXRjaFxuICAgICAgcGlkLnN0ZGluLmVuZCgpXG5cbiAgZGVzdHJveTogLT5cbiAgICBhdG9tLmNvbmZpZy51bm9ic2VydmUgQGNmZy5leHRcbiAgICBhdG9tLmNvbmZpZy51bm9ic2VydmUgQGNmZy5zY29wZVxuXG4gIGFjdGl2YXRlOiAtPlxuICAgIEBpbml0RW52KClcbiAgICBhdG9tLmNvbmZpZy5zZXREZWZhdWx0cyBAY2ZnLmV4dCwgQGRlZmF1bHRFeHRlbnNpb25NYXBcbiAgICBhdG9tLmNvbmZpZy5zZXREZWZhdWx0cyBAY2ZnLnNjb3BlLCBAZGVmYXVsdFNjb3BlTWFwXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSBAY2ZnLmV4dCwgPT5cbiAgICAgIEBleHRlbnNpb25NYXAgPSBhdG9tLmNvbmZpZy5nZXQoQGNmZy5leHQpXG4gICAgYXRvbS5jb25maWcub2JzZXJ2ZSBAY2ZnLnNjb3BlLCA9PlxuICAgICAgQHNjb3BlTWFwID0gYXRvbS5jb25maWcuZ2V0KEBjZmcuc2NvcGUpXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ3J1bjpmaWxlJywgPT4gQHJ1bihmYWxzZSlcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAncnVuOnNlbGVjdGlvbicsID0+IEBydW4odHJ1ZSlcbiAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCAncnVuOnN0b3AnLCA9PiBAc3RvcCgpXG4gICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ3J1bjpjbG9zZScsID0+IEBzdG9wQW5kQ2xvc2UoKVxuICAgIGF0b20uY29tbWFuZHMuYWRkICcuYXRvbS1ydW5uZXInLCAncnVuOmNvcHknLCA9PlxuICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUod2luZG93LmdldFNlbGVjdGlvbigpLnRvU3RyaW5nKCkpXG5cbiAgcnVuOiAoc2VsZWN0aW9uKSAtPlxuICAgIGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yP1xuXG4gICAgcGF0aCA9IGVkaXRvci5nZXRQYXRoKClcbiAgICBjbWQgPSBAY29tbWFuZEZvcihlZGl0b3IsIHNlbGVjdGlvbilcbiAgICB1bmxlc3MgY21kP1xuICAgICAgY29uc29sZS53YXJuKFwiTm8gcmVnaXN0ZXJlZCBleGVjdXRhYmxlIGZvciBmaWxlICcje3BhdGh9J1wiKVxuICAgICAgcmV0dXJuXG5cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tcnVubmVyLnNob3dPdXRwdXRXaW5kb3cnKVxuICAgICAge3BhbmUsIHZpZXd9ID0gQHJ1bm5lclZpZXcoKVxuICAgICAgaWYgbm90IHZpZXc/XG4gICAgICAgIHZpZXcgPSBuZXcgQXRvbVJ1bm5lclZpZXcoZWRpdG9yLmdldFRpdGxlKCkpXG4gICAgICAgIHBhbmVzID0gYXRvbS53b3Jrc3BhY2UuZ2V0UGFuZXMoKVxuICAgICAgICBkaXIgPSBhdG9tLmNvbmZpZy5nZXQoJ2F0b20tcnVubmVyLnBhbmVTcGxpdERpcmVjdGlvbicpXG4gICAgICAgIGRpcmZ1bmMgPSBAc3BsaXRGdW5jc1tkaXJdIHx8IEBzcGxpdEZ1bmNEZWZhdWx0XG4gICAgICAgIHBhbmUgPSBwYW5lc1twYW5lcy5sZW5ndGggLSAxXVtkaXJmdW5jXSh2aWV3KVxuICAgIGVsc2VcbiAgICAgIHZpZXcgPVxuICAgICAgICBtb2NrZWQ6IHRydWVcbiAgICAgICAgYXBwZW5kOiAodGV4dCwgdHlwZSkgLT5cbiAgICAgICAgICBpZiB0eXBlID09ICdzdGRlcnInXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKHRleHQpXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgY29uc29sZS5sb2codGV4dClcbiAgICAgICAgc2Nyb2xsVG9Cb3R0b206IC0+XG4gICAgICAgIGNsZWFyOiAtPlxuICAgICAgICBmb290ZXI6IC0+XG5cbiAgICB1bmxlc3Mgdmlldy5tb2NrZWRcbiAgICAgIHZpZXcuc2V0VGl0bGUoZWRpdG9yLmdldFRpdGxlKCkpXG4gICAgICBwYW5lLmFjdGl2YXRlSXRlbSh2aWV3KVxuXG4gICAgQGV4ZWN1dGUoY21kLCBlZGl0b3IsIHZpZXcsIHNlbGVjdGlvbilcblxuICBzdG9wOiAodmlldykgLT5cbiAgICBpZiBAY2hpbGRcbiAgICAgIHZpZXcgPz0gQHJ1bm5lclZpZXcoKS52aWV3XG4gICAgICBpZiB2aWV3IGFuZCB2aWV3LmlzT25Eb20oKT9cbiAgICAgICAgdmlldy5hcHBlbmQoJ15DJywgJ3N0ZGluJylcbiAgICAgIGVsc2VcbiAgICAgICAgQGRlYnVnKCdLaWxsZWQgY2hpbGQnLCBAY2hpbGQucGlkKVxuICAgICAgQGNoaWxkLmtpbGwoJ1NJR0lOVCcpXG4gICAgICBpZiBAY2hpbGQua2lsbGVkXG4gICAgICAgIEBjaGlsZCA9IG51bGxcbiAgICBjbGVhckludGVydmFsKEB0aW1lcikgaWYgQHRpbWVyXG4gICAgQHRpbWVyID0gbnVsbFxuXG4gIHN0b3BBbmRDbG9zZTogLT5cbiAgICB7cGFuZSwgdmlld30gPSBAcnVubmVyVmlldygpXG4gICAgcGFuZT8ucmVtb3ZlSXRlbSh2aWV3KVxuICAgIEBzdG9wKHZpZXcpXG5cbiAgZXhlY3V0ZTogKGNtZCwgZWRpdG9yLCB2aWV3LCBzZWxlY3Rpb24pIC0+XG4gICAgQHN0b3AoKVxuICAgIHZpZXcuY2xlYXIoKVxuXG4gICAgYXJncyA9IFtdXG4gICAgaWYgZWRpdG9yLmdldFBhdGgoKVxuICAgICAgZWRpdG9yLnNhdmUoKVxuICAgICAgYXJncy5wdXNoKGVkaXRvci5nZXRQYXRoKCkpIGlmICFzZWxlY3Rpb25cbiAgICBzcGxpdENtZCA9IGNtZC5zcGxpdCgvXFxzKy8pXG4gICAgaWYgc3BsaXRDbWQubGVuZ3RoID4gMVxuICAgICAgY21kID0gc3BsaXRDbWRbMF1cbiAgICAgIGFyZ3MgPSBzcGxpdENtZC5zbGljZSgxKS5jb25jYXQoYXJncylcbiAgICB0cnlcbiAgICAgIGRpciA9IGF0b20ucHJvamVjdC5nZXRQYXRocygpWzBdIHx8ICcuJ1xuICAgICAgdHJ5XG4gICAgICAgIGlmIG5vdCBmcy5zdGF0U3luYyhkaXIpLmlzRGlyZWN0b3J5KClcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJCYWQgZGlyXCIpXG4gICAgICBjYXRjaFxuICAgICAgICBkaXIgPSBwLmRpcm5hbWUoZGlyKVxuICAgICAgQGNoaWxkID0gc3Bhd24oY21kLCBhcmdzLCBjd2Q6IGRpcilcbiAgICAgIEB0aW1lciA9IHNldEludGVydmFsKCg9PiB2aWV3LmFwcGVuZEZvb3RlcignLicpKSwgNzUwKVxuICAgICAgY3VycmVudFBpZCA9IEBjaGlsZC5waWRcbiAgICAgIEBjaGlsZC5vbiAnZXJyb3InLCAoZXJyKSA9PlxuICAgICAgICBpZiBlcnIubWVzc2FnZS5tYXRjaCgvXFxiRU5PRU5UJC8pXG4gICAgICAgICAgdmlldy5hcHBlbmQoJ1VuYWJsZSB0byBmaW5kIGNvbW1hbmQ6ICcgKyBjbWQgKyAnXFxuJywgJ3N0ZGVycicpXG4gICAgICAgICAgdmlldy5hcHBlbmQoJ0FyZSB5b3Ugc3VyZSBQQVRIIGlzIGNvbmZpZ3VyZWQgY29ycmVjdGx5P1xcblxcbicsICdzdGRlcnInKVxuICAgICAgICAgIHZpZXcuYXBwZW5kKCdFTlYgUEFUSDogJyArIHByb2Nlc3MuZW52LlBBVEggKyAnXFxuXFxuJywgJ3N0ZGVycicpXG4gICAgICAgIHZpZXcuYXBwZW5kKGVyci5zdGFjaywgJ3N0ZGVycicpXG4gICAgICAgIHZpZXcuc2Nyb2xsVG9Cb3R0b20oKVxuICAgICAgICBAY2hpbGQgPSBudWxsXG4gICAgICAgIGNsZWFySW50ZXJ2YWwoQHRpbWVyKSBpZiBAdGltZXJcbiAgICAgIEBjaGlsZC5zdGRlcnIub24gJ2RhdGEnLCAoZGF0YSkgPT5cbiAgICAgICAgdmlldy5hcHBlbmQoZGF0YSwgJ3N0ZGVycicpXG4gICAgICAgIHZpZXcuc2Nyb2xsVG9Cb3R0b20oKVxuICAgICAgQGNoaWxkLnN0ZG91dC5vbiAnZGF0YScsIChkYXRhKSA9PlxuICAgICAgICB2aWV3LmFwcGVuZChkYXRhLCAnc3Rkb3V0JylcbiAgICAgICAgdmlldy5zY3JvbGxUb0JvdHRvbSgpXG4gICAgICBAY2hpbGQub24gJ2Nsb3NlJywgKGNvZGUsIHNpZ25hbCkgPT5cbiAgICAgICAgaWYgQGNoaWxkICYmIEBjaGlsZC5waWQgPT0gY3VycmVudFBpZFxuICAgICAgICAgIHRpbWUgPSAoKG5ldyBEYXRlIC0gc3RhcnRUaW1lKSAvIDEwMDApXG4gICAgICAgICAgdmlldy5hcHBlbmRGb290ZXIoXCIgRXhpdGVkIHdpdGggY29kZT0je2NvZGV9IGluICN7dGltZX0gc2Vjb25kcy5cIilcbiAgICAgICAgICB2aWV3LnNjcm9sbFRvQm90dG9tKClcbiAgICAgICAgICBjbGVhckludGVydmFsKEB0aW1lcikgaWYgQHRpbWVyXG4gICAgY2F0Y2ggZXJyXG4gICAgICB2aWV3LmFwcGVuZChlcnIuc3RhY2ssICdzdGRlcnInKVxuICAgICAgdmlldy5zY3JvbGxUb0JvdHRvbSgpXG4gICAgICBAc3RvcCgpXG5cbiAgICBzdGFydFRpbWUgPSBuZXcgRGF0ZVxuICAgIHRyeVxuICAgICAgaWYgc2VsZWN0aW9uXG4gICAgICAgIEBjaGlsZC5zdGRpbi53cml0ZShlZGl0b3IuZ2V0TGFzdFNlbGVjdGlvbigpLmdldFRleHQoKSlcbiAgICAgIGVsc2UgaWYgIWVkaXRvci5nZXRQYXRoKClcbiAgICAgICAgQGNoaWxkLnN0ZGluLndyaXRlKGVkaXRvci5nZXRUZXh0KCkpXG4gICAgICBAY2hpbGQuc3RkaW4uZW5kKClcbiAgICB2aWV3LmZvb3RlcihcIlJ1bm5pbmc6ICN7Y21kfSAoY3dkPSN7ZWRpdG9yLmdldFBhdGgoKX0gcGlkPSN7QGNoaWxkLnBpZH0pLlwiKVxuXG4gIGNvbW1hbmRGb3I6IChlZGl0b3IsIHNlbGVjdGlvbikgLT5cbiAgICAjIHRyeSB0byBmaW5kIGEgc2hlYmFuZ1xuICAgIHNoZWJhbmcgPSBAY29tbWFuZEZvclNoZWJhbmcoZWRpdG9yKVxuICAgIHJldHVybiBzaGViYW5nIGlmIHNoZWJhbmc/XG5cbiAgICAjIERvbid0IGxvb2t1cCBieSBleHRlbnNpb24gZnJvbSBzZWxlY3Rpb24uXG4gICAgaWYgKCFzZWxlY3Rpb24pXG4gICAgICAjIHRyeSB0byBsb29rdXAgYnkgZXh0ZW5zaW9uXG4gICAgICBpZiBlZGl0b3IuZ2V0UGF0aCgpP1xuICAgICAgICBmb3IgZXh0IGluIE9iamVjdC5rZXlzKEBleHRlbnNpb25NYXApLnNvcnQoKGEsYikgLT4gYi5sZW5ndGggLSBhLmxlbmd0aClcbiAgICAgICAgICBib3VuZGFyeSA9IGlmIGV4dC5tYXRjaCgvXlxcYi8pIHRoZW4gJycgZWxzZSAnXFxcXGInXG4gICAgICAgICAgaWYgZWRpdG9yLmdldFBhdGgoKS5tYXRjaChib3VuZGFyeSArIGV4dCArICckJylcbiAgICAgICAgICAgIHJldHVybiBAZXh0ZW5zaW9uTWFwW2V4dF1cblxuICAgICMgbG9va3VwIGJ5IGdyYW1tYXJcbiAgICBzY29wZSA9IGVkaXRvci5nZXRMYXN0Q3Vyc29yKCkuZ2V0U2NvcGVEZXNjcmlwdG9yKCkuc2NvcGVzWzBdXG4gICAgZm9yIG5hbWUgaW4gT2JqZWN0LmtleXMoQHNjb3BlTWFwKVxuICAgICAgaWYgc2NvcGUubWF0Y2goJ15zb3VyY2VcXFxcLicgKyBuYW1lICsgJ1xcXFxiJylcbiAgICAgICAgcmV0dXJuIEBzY29wZU1hcFtuYW1lXVxuXG4gIGNvbW1hbmRGb3JTaGViYW5nOiAoZWRpdG9yKSAtPlxuICAgIG1hdGNoID0gZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93KDApLm1hdGNoKC9eIyFcXHMqKC4rKS8pXG4gICAgbWF0Y2ggYW5kIG1hdGNoWzFdXG5cbiAgcnVubmVyVmlldzogLT5cbiAgICBmb3IgcGFuZSBpbiBhdG9tLndvcmtzcGFjZS5nZXRQYW5lcygpXG4gICAgICBmb3IgdmlldyBpbiBwYW5lLmdldEl0ZW1zKClcbiAgICAgICAgcmV0dXJuIHtwYW5lOiBwYW5lLCB2aWV3OiB2aWV3fSBpZiB2aWV3IGluc3RhbmNlb2YgQXRvbVJ1bm5lclZpZXdcbiAgICB7cGFuZTogbnVsbCwgdmlldzogbnVsbH1cblxuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBBdG9tUnVubmVyXG4iXX0=
