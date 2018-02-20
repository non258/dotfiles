(function() {
  var CompositeDisposable, ImdoneAtom, ImdoneAtomView, _, configHelper, imdoneHelper, path, url;

  path = require('path');

  url = null;

  CompositeDisposable = null;

  _ = null;

  ImdoneAtomView = null;

  imdoneHelper = null;

  configHelper = require('./services/imdone-config');

  module.exports = ImdoneAtom = {
    config: {
      showLoginOnLaunch: {
        description: "Display imdone.io login panel on startup if user is not logged in.",
        type: 'boolean',
        "default": true
      },
      useAlternateFileWatcher: {
        description: "If your board won't update when you edit files, then try the alternate file watcher",
        type: 'boolean',
        "default": false
      },
      showTagsInline: {
        description: 'Display inline tag and context links in task text?',
        type: 'boolean',
        "default": false
      },
      maxFilesPrompt: {
        description: 'How many files is too many to parse without prompting to add ignores?',
        type: 'integer',
        "default": 2000,
        minimum: 1000,
        maximum: 10000
      },
      excludeVcsIgnoredPaths: {
        description: 'Exclude files that are ignored by your version control system',
        type: 'boolean',
        "default": true
      },
      showNotifications: {
        description: 'Show notifications upon clicking task source link.',
        type: 'boolean',
        "default": false
      },
      zoomLevel: {
        description: 'Set the default zoom level on startup',
        type: 'number',
        "default": 1,
        minimum: .2,
        maximum: 2.5
      },
      openIn: {
        title: 'File Opener',
        description: 'Open files in a different IDE or editor',
        type: 'object',
        properties: {
          enable: {
            order: 1,
            title: 'Enable file opener',
            type: 'boolean',
            "default": false
          },
          port: {
            order: 2,
            title: 'File Opener Port',
            description: 'Port the file opener communicates on',
            type: 'integer',
            "default": 9799
          },
          intellij: {
            order: 3,
            description: '[Glob pattern](https://github.com/isaacs/node-glob) for files that should open in Intellij.',
            type: 'string',
            "default": 'Glob pattern'
          }
        }
      },
      todaysJournal: {
        type: 'object',
        properties: {
          directory: {
            description: 'Where do you want your global journal files to live?',
            type: 'string',
            "default": "" + (path.join(process.env.HOME || process.env.USERPROFILE, 'notes'))
          },
          fileNameTemplate: {
            description: 'How do you want your global journal files to be named?',
            type: 'string',
            "default": '${date}.md'
          },
          projectFileNameTemplate: {
            description: 'How do you want your project journal files to be named?',
            type: 'string',
            "default": 'journal/${month}/${date}.md'
          },
          dateFormat: {
            description: 'How would you like your `date` variable formatted for use in directory or file name template?',
            type: 'string',
            "default": 'YYYY-MM-DD'
          },
          monthFormat: {
            description: 'How would you like your `month` variable formatted for use in directory or file name template?',
            type: 'string',
            "default": 'YYYY-MM'
          }
        }
      }
    },
    subscriptions: null,
    activate: function(state) {
      _ = require('lodash');
      url = require('url');
      if (ImdoneAtomView == null) {
        ImdoneAtomView = require('./views/imdone-atom-view');
      }
      CompositeDisposable = require('atom').CompositeDisposable;
      _.templateSettings.interpolate = /\${([\s\S]+?)}/g;
      this.subscriptions = new CompositeDisposable;
      this.subscriptions.add(atom.commands.add('atom-workspace', "imdone-atom:tasks", (function(_this) {
        return function(evt) {
          var projectPath, projectRoot, target;
          evt.stopPropagation();
          evt.stopImmediatePropagation();
          target = evt.target;
          projectRoot = target.closest('.project-root');
          if (projectRoot) {
            projectPath = projectRoot.getElementsByClassName('name')[0].dataset.path;
          }
          return _this.tasks(projectPath);
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', "imdone-atom:todays-journal", (function(_this) {
        return function(evt) {
          evt.stopPropagation();
          evt.stopImmediatePropagation();
          return _this.openJournalFile();
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', "imdone-atom:todays-project-journal", (function(_this) {
        return function(evt) {
          evt.stopPropagation();
          evt.stopImmediatePropagation();
          return _this.openJournalFile(_this.getCurrentProject());
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'imdone-atom:board-zoom-in', (function(_this) {
        return function(evt) {
          return _this.zoom('in');
        };
      })(this)));
      this.subscriptions.add(atom.commands.add('atom-workspace', 'imdone-atom:board-zoom-out', (function(_this) {
        return function(evt) {
          return _this.zoom('out');
        };
      })(this)));
      atom.workspace.addOpener((function(_this) {
        return function(uriToOpen) {
          var host, pathname, protocol, ref;
          ref = url.parse(uriToOpen), protocol = ref.protocol, host = ref.host, pathname = ref.pathname;
          if (protocol !== 'imdone:') {
            return;
          }
          return _this.viewForUri(uriToOpen);
        };
      })(this));
      return this.fileService = require('./services/file-service').init(configHelper.getSettings().openIn.port);
    },
    emit: function(name, data) {
      var active;
      active = atom.workspace.getActivePaneItem();
      if (!(active instanceof ImdoneAtomView)) {
        return;
      }
      return active.emitter.emit(name, data);
    },
    zoom: function(dir) {
      return this.emit('zoom', dir);
    },
    tasks: function(projectPath) {
      var previousActivePane, uri;
      previousActivePane = atom.workspace.getActivePane();
      uri = this.uriForProject(projectPath);
      if (!uri) {
        return;
      }
      return atom.workspace.open(uri, {
        searchAllPanes: true
      }).then((function(_this) {
        return function(imdoneAtomView) {
          if (!(imdoneAtomView instanceof ImdoneAtomView)) {
            return;
          }
          return previousActivePane.activate();
        };
      })(this));
    },
    deactivate: function() {
      imdoneHelper = require('./services/imdone-helper');
      imdoneHelper.destroyRepos();
      return this.subscriptions.dispose();
    },
    getCurrentProject: function() {
      var active, i, len, paths, projectPath;
      paths = atom.project.getPaths();
      if (!(paths.length > 0)) {
        return;
      }
      active = atom.workspace.getActivePaneItem();
      if (active && active.getPath && active.getPath()) {
        for (i = 0, len = paths.length; i < len; i++) {
          projectPath = paths[i];
          if (active.getPath().indexOf(projectPath + path.sep) === 0) {
            return projectPath;
          }
        }
      } else {
        return paths[0];
      }
    },
    provideService: function() {
      return require('./services/plugin-manager');
    },
    openJournalFile: function(projectDir) {
      var config, date, dir, file, filePath, mkdirp, moment, month, template;
      moment = require('moment');
      mkdirp = require('mkdirp');
      config = configHelper.getSettings().todaysJournal;
      date = moment().format(config.dateFormat);
      month = moment().format(config.monthFormat);
      template = function(t) {
        return t.replace("${date}", date).replace("${month}", month);
      };
      if (projectDir) {
        file = template(config.projectFileNameTemplate);
        return atom.workspace.open(path.join(projectDir, file));
      } else {
        file = template(config.fileNameTemplate);
        dir = template(config.directory);
        filePath = path.join(dir, file);
        return mkdirp(dir, function(err) {
          if (err) {
            atom.notifications.addError("Can't open journal file " + filePath);
            return;
          }
          atom.project.addPath(dir);
          return atom.workspace.open(filePath);
        });
      }
    },
    uriForProject: function(projectPath) {
      projectPath = projectPath || this.getCurrentProject();
      if (!projectPath) {
        return;
      }
      projectPath = encodeURIComponent(projectPath);
      return 'imdone://tasks/' + projectPath;
    },
    viewForUri: function(uri) {
      var host, pathname, protocol, ref;
      ref = url.parse(uri), protocol = ref.protocol, host = ref.host, pathname = ref.pathname;
      if (!pathname) {
        return;
      }
      pathname = decodeURIComponent(pathname.split('/')[1]);
      return this.createImdoneAtomView({
        path: pathname,
        uri: uri
      });
    },
    createImdoneAtomView: function(arg) {
      var path, repo, uri, view;
      path = arg.path, uri = arg.uri;
      if (ImdoneAtomView == null) {
        ImdoneAtomView = require('./views/imdone-atom-view');
      }
      if (imdoneHelper == null) {
        imdoneHelper = require('./services/imdone-helper');
      }
      repo = imdoneHelper.getRepo(path, uri);
      return view = new ImdoneAtomView({
        imdoneRepo: repo,
        path: path,
        uri: uri
      });
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2ltZG9uZS1hdG9tL2xpYi9pbWRvbmUtYXRvbS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBc0IsT0FBQSxDQUFRLE1BQVI7O0VBQ3RCLEdBQUEsR0FBc0I7O0VBQ3RCLG1CQUFBLEdBQXNCOztFQUN0QixDQUFBLEdBQXNCOztFQUN0QixjQUFBLEdBQXNCOztFQUN0QixZQUFBLEdBQXNCOztFQUN0QixZQUFBLEdBQXNCLE9BQUEsQ0FBUSwwQkFBUjs7RUFFdEIsTUFBTSxDQUFDLE9BQVAsR0FBaUIsVUFBQSxHQUNmO0lBQUEsTUFBQSxFQUNFO01BQUEsaUJBQUEsRUFDRTtRQUFBLFdBQUEsRUFBYSxvRUFBYjtRQUNBLElBQUEsRUFBTSxTQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxJQUZUO09BREY7TUFJQSx1QkFBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLHFGQUFiO1FBQ0EsSUFBQSxFQUFNLFNBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLEtBRlQ7T0FMRjtNQVFBLGNBQUEsRUFDRTtRQUFBLFdBQUEsRUFBYSxvREFBYjtRQUNBLElBQUEsRUFBTSxTQUROO1FBRUEsQ0FBQSxPQUFBLENBQUEsRUFBUyxLQUZUO09BVEY7TUFZQSxjQUFBLEVBQ0U7UUFBQSxXQUFBLEVBQWEsdUVBQWI7UUFDQSxJQUFBLEVBQU0sU0FETjtRQUVBLENBQUEsT0FBQSxDQUFBLEVBQVMsSUFGVDtRQUdBLE9BQUEsRUFBUyxJQUhUO1FBSUEsT0FBQSxFQUFTLEtBSlQ7T0FiRjtNQWtCQSxzQkFBQSxFQUNFO1FBQUEsV0FBQSxFQUFhLCtEQUFiO1FBQ0EsSUFBQSxFQUFNLFNBRE47UUFFQSxDQUFBLE9BQUEsQ0FBQSxFQUFTLElBRlQ7T0FuQkY7TUFzQkEsaUJBQUEsRUFDRTtRQUFBLFdBQUEsRUFBYSxvREFB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QW9CLFFBQXBCO1FBTFUsQ0FBWixFQVBGOztJQVBlLENBaEtqQjtJQXFMQSxhQUFBLEVBQWUsU0FBQyxXQUFEO01BQ2IsV0FBQSxHQUFjLFdBQUEsSUFBZSxJQUFDLENBQUEsaUJBQUQsQ0FBQTtNQUM3QixJQUFBLENBQWMsV0FBZDtBQUFBLGVBQUE7O01BQ0EsV0FBQSxHQUFjLGtCQUFBLENBQW1CLFdBQW5CO2FBQ2QsaUJBQUEsR0FBb0I7SUFKUCxDQXJMZjtJQTJMQSxVQUFBLEVBQVksU0FBQyxHQUFEO0FBQ1YsVUFBQTtNQUFBLE1BQTZCLEdBQUcsQ0FBQyxLQUFKLENBQVUsR0FBVixDQUE3QixFQUFDLHVCQUFELEVBQVcsZUFBWCxFQUFpQjtNQUNqQixJQUFBLENBQWMsUUFBZDtBQUFBLGVBQUE7O01BQ0EsUUFBQSxHQUFXLGtCQUFBLENBQW1CLFFBQVEsQ0FBQyxLQUFULENBQWUsR0FBZixDQUFvQixDQUFBLENBQUEsQ0FBdkM7YUFDWCxJQUFDLENBQUEsb0JBQUQsQ0FBc0I7UUFBQSxJQUFBLEVBQU0sUUFBTjtRQUFnQixHQUFBLEVBQUssR0FBckI7T0FBdEI7SUFKVSxDQTNMWjtJQWlNQSxvQkFBQSxFQUFzQixTQUFDLEdBQUQ7QUFDcEIsVUFBQTtNQURzQixpQkFBTTs7UUFDNUIsaUJBQWtCLE9BQUEsQ0FBUSwwQkFBUjs7O1FBQ2xCLGVBQWdCLE9BQUEsQ0FBUSwwQkFBUjs7TUFDaEIsSUFBQSxHQUFPLFlBQVksQ0FBQyxPQUFiLENBQXFCLElBQXJCLEVBQTJCLEdBQTNCO2FBRVAsSUFBQSxHQUFPLElBQUksY0FBSixDQUFtQjtRQUFBLFVBQUEsRUFBWSxJQUFaO1FBQWtCLElBQUEsRUFBTSxJQUF4QjtRQUE4QixHQUFBLEVBQUssR0FBbkM7T0FBbkI7SUFMYSxDQWpNdEI7O0FBVEYiLCJzb3VyY2VzQ29udGVudCI6WyJwYXRoICAgICAgICAgICAgICAgID0gcmVxdWlyZSAncGF0aCdcbnVybCAgICAgICAgICAgICAgICAgPSBudWxsXG5Db21wb3NpdGVEaXNwb3NhYmxlID0gbnVsbFxuXyAgICAgICAgICAgICAgICAgICA9IG51bGxcbkltZG9uZUF0b21WaWV3ICAgICAgPSBudWxsXG5pbWRvbmVIZWxwZXIgICAgICAgID0gbnVsbFxuY29uZmlnSGVscGVyICAgICAgICA9IHJlcXVpcmUgJy4vc2VydmljZXMvaW1kb25lLWNvbmZpZydcblxubW9kdWxlLmV4cG9ydHMgPSBJbWRvbmVBdG9tID1cbiAgY29uZmlnOlxuICAgIHNob3dMb2dpbk9uTGF1bmNoOlxuICAgICAgZGVzY3JpcHRpb246IFwiRGlzcGxheSBpbWRvbmUuaW8gbG9naW4gcGFuZWwgb24gc3RhcnR1cCBpZiB1c2VyIGlzIG5vdCBsb2dnZWQgaW4uXCJcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogdHJ1ZVxuICAgIHVzZUFsdGVybmF0ZUZpbGVXYXRjaGVyOlxuICAgICAgZGVzY3JpcHRpb246IFwiSWYgeW91ciBib2FyZCB3b24ndCB1cGRhdGUgd2hlbiB5b3UgZWRpdCBmaWxlcywgdGhlbiB0cnkgdGhlIGFsdGVybmF0ZSBmaWxlIHdhdGNoZXJcIlxuICAgICAgdHlwZTogJ2Jvb2xlYW4nXG4gICAgICBkZWZhdWx0OiBmYWxzZVxuICAgIHNob3dUYWdzSW5saW5lOlxuICAgICAgZGVzY3JpcHRpb246ICdEaXNwbGF5IGlubGluZSB0YWcgYW5kIGNvbnRleHQgbGlua3MgaW4gdGFzayB0ZXh0PydcbiAgICAgIHR5cGU6ICdib29sZWFuJ1xuICAgICAgZGVmYXVsdDogZmFsc2VcbiAgICBtYXhGaWxlc1Byb21wdDpcbiAgICAgIGRlc2NyaXB0aW9uOiAnSG93IG1hbnkgZmlsZXMgaXMgdG9vIG1hbnkgdG8gcGFyc2Ugd2l0aG91dCBwcm9tcHRpbmcgdG8gYWRkIGlnbm9yZXM/J1xuICAgICAgdHlwZTogJ2ludGVnZXInXG4gICAgICBkZWZhdWx0OiAyMDAwXG4gICAgICBtaW5pbXVtOiAxMDAwXG4gICAgICBtYXhpbXVtOiAxMDAwMFxuICAgIGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHM6XG4gICAgICBkZXNjcmlwdGlvbjogJ0V4Y2x1ZGUgZmlsZXMgdGhhdCBhcmUgaWdub3JlZCBieSB5b3VyIHZlcnNpb24gY29udHJvbCBzeXN0ZW0nXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IHRydWVcbiAgICBzaG93Tm90aWZpY2F0aW9uczpcbiAgICAgIGRlc2NyaXB0aW9uOiAnU2hvdyBub3RpZmljYXRpb25zIHVwb24gY2xpY2tpbmcgdGFzayBzb3VyY2UgbGluay4nXG4gICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgIGRlZmF1bHQ6IGZhbHNlXG4gICAgem9vbUxldmVsOlxuICAgICAgZGVzY3JpcHRpb246ICdTZXQgdGhlIGRlZmF1bHQgem9vbSBsZXZlbCBvbiBzdGFydHVwJ1xuICAgICAgdHlwZTogJ251bWJlcidcbiAgICAgIGRlZmF1bHQ6IDFcbiAgICAgIG1pbmltdW06IC4yXG4gICAgICBtYXhpbXVtOiAyLjVcblxuICAgIG9wZW5JbjpcbiAgICAgIHRpdGxlOiAnRmlsZSBPcGVuZXInXG4gICAgICBkZXNjcmlwdGlvbjogJ09wZW4gZmlsZXMgaW4gYSBkaWZmZXJlbnQgSURFIG9yIGVkaXRvcidcbiAgICAgIHR5cGU6ICdvYmplY3QnXG4gICAgICBwcm9wZXJ0aWVzOlxuICAgICAgICBlbmFibGU6XG4gICAgICAgICAgb3JkZXI6IDFcbiAgICAgICAgICB0aXRsZTogJ0VuYWJsZSBmaWxlIG9wZW5lcidcbiAgICAgICAgICB0eXBlOiAnYm9vbGVhbidcbiAgICAgICAgICBkZWZhdWx0OiBmYWxzZVxuICAgICAgICBwb3J0OlxuICAgICAgICAgIG9yZGVyOiAyXG4gICAgICAgICAgdGl0bGU6ICdGaWxlIE9wZW5lciBQb3J0J1xuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnUG9ydCB0aGUgZmlsZSBvcGVuZXIgY29tbXVuaWNhdGVzIG9uJ1xuICAgICAgICAgIHR5cGU6ICdpbnRlZ2VyJ1xuICAgICAgICAgIGRlZmF1bHQ6IDk3OTlcbiAgICAgICAgaW50ZWxsaWo6XG4gICAgICAgICAgb3JkZXI6IDNcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ1tHbG9iIHBhdHRlcm5dKGh0dHBzOi8vZ2l0aHViLmNvbS9pc2FhY3Mvbm9kZS1nbG9iKSBmb3IgZmlsZXMgdGhhdCBzaG91bGQgb3BlbiBpbiBJbnRlbGxpai4nXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnR2xvYiBwYXR0ZXJuJ1xuICAgIHRvZGF5c0pvdXJuYWw6XG4gICAgICB0eXBlOiAnb2JqZWN0J1xuICAgICAgcHJvcGVydGllczpcbiAgICAgICAgZGlyZWN0b3J5OlxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnV2hlcmUgZG8geW91IHdhbnQgeW91ciBnbG9iYWwgam91cm5hbCBmaWxlcyB0byBsaXZlPydcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6IFwiI3twYXRoLmpvaW4ocHJvY2Vzcy5lbnYuSE9NRSB8fCBwcm9jZXNzLmVudi5VU0VSUFJPRklMRSwgJ25vdGVzJyl9XCJcbiAgICAgICAgZmlsZU5hbWVUZW1wbGF0ZTpcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0hvdyBkbyB5b3Ugd2FudCB5b3VyIGdsb2JhbCBqb3VybmFsIGZpbGVzIHRvIGJlIG5hbWVkPydcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICcke2RhdGV9Lm1kJ1xuICAgICAgICBwcm9qZWN0RmlsZU5hbWVUZW1wbGF0ZTpcbiAgICAgICAgICBkZXNjcmlwdGlvbjogJ0hvdyBkbyB5b3Ugd2FudCB5b3VyIHByb2plY3Qgam91cm5hbCBmaWxlcyB0byBiZSBuYW1lZD8nXG4gICAgICAgICAgdHlwZTogJ3N0cmluZydcbiAgICAgICAgICBkZWZhdWx0OiAnam91cm5hbC8ke21vbnRofS8ke2RhdGV9Lm1kJ1xuICAgICAgICBkYXRlRm9ybWF0OlxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnSG93IHdvdWxkIHlvdSBsaWtlIHlvdXIgYGRhdGVgIHZhcmlhYmxlIGZvcm1hdHRlZCBmb3IgdXNlIGluIGRpcmVjdG9yeSBvciBmaWxlIG5hbWUgdGVtcGxhdGU/J1xuICAgICAgICAgIHR5cGU6ICdzdHJpbmcnXG4gICAgICAgICAgZGVmYXVsdDogJ1lZWVktTU0tREQnXG4gICAgICAgIG1vbnRoRm9ybWF0OlxuICAgICAgICAgIGRlc2NyaXB0aW9uOiAnSG93IHdvdWxkIHlvdSBsaWtlIHlvdXIgYG1vbnRoYCB2YXJpYWJsZSBmb3JtYXR0ZWQgZm9yIHVzZSBpbiBkaXJlY3Rvcnkgb3IgZmlsZSBuYW1lIHRlbXBsYXRlPydcbiAgICAgICAgICB0eXBlOiAnc3RyaW5nJ1xuICAgICAgICAgIGRlZmF1bHQ6ICdZWVlZLU1NJ1xuICBzdWJzY3JpcHRpb25zOiBudWxsXG4gICNcbiAgIyBzZXJpYWxpemU6IC0+XG4gICMgICB2aWV3cyA9IGF0b20ud29ya3NwYWNlLmdldFBhbmVJdGVtcygpLmZpbHRlciAodmlldykgLT4gdmlldyBpbnN0YW5jZW9mIEltZG9uZUF0b21WaWV3XG4gICMgICBzZXJpYWxpemVkID0gdmlld3MubWFwICh2aWV3KSAtPiB2aWV3LnNlcmlhbGl6ZSgpXG4gICMgICAjY29uc29sZS5sb2cgJ3NlcmlhbGl6ZWRWaWV3czonLCBzZXJpYWxpemVkXG4gICMgICBzZXJpYWxpemVkXG5cbiAgYWN0aXZhdGU6IChzdGF0ZSkgLT5cblxuICAgIF8gPSByZXF1aXJlICdsb2Rhc2gnXG4gICAgdXJsID0gcmVxdWlyZSAndXJsJ1xuICAgIEltZG9uZUF0b21WaWV3ID89IHJlcXVpcmUgJy4vdmlld3MvaW1kb25lLWF0b20tdmlldydcbiAgICB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuICAgIF8udGVtcGxhdGVTZXR0aW5ncy5pbnRlcnBvbGF0ZSA9IC9cXCR7KFtcXHNcXFNdKz8pfS9nO1xuICAgICMgc3RhdGUuZm9yRWFjaCAodmlldykgLT4gYXRvbS5kZXNlcmlhbGl6ZXJzLmRlc2VyaWFsaXplKHZpZXcpIGlmIHN0YXRlXG4gICAgQHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsIFwiaW1kb25lLWF0b206dGFza3NcIiwgKGV2dCkgPT5cbiAgICAgIGV2dC5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgZXZ0LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpXG4gICAgICB0YXJnZXQgPSBldnQudGFyZ2V0XG4gICAgICBwcm9qZWN0Um9vdCA9IHRhcmdldC5jbG9zZXN0ICcucHJvamVjdC1yb290J1xuICAgICAgaWYgcHJvamVjdFJvb3RcbiAgICAgICAgcHJvamVjdFBhdGggPSBwcm9qZWN0Um9vdC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCduYW1lJylbMF0uZGF0YXNldC5wYXRoXG4gICAgICBAdGFza3MocHJvamVjdFBhdGgpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgXCJpbWRvbmUtYXRvbTp0b2RheXMtam91cm5hbFwiLCAoZXZ0KSA9PlxuICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICBldnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICAgIEBvcGVuSm91cm5hbEZpbGUoKVxuXG4gICAgQHN1YnNjcmlwdGlvbnMuYWRkIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsIFwiaW1kb25lLWF0b206dG9kYXlzLXByb2plY3Qtam91cm5hbFwiLCAoZXZ0KSA9PlxuICAgICAgZXZ0LnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICBldnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKClcbiAgICAgIEBvcGVuSm91cm5hbEZpbGUoQGdldEN1cnJlbnRQcm9qZWN0KCkpXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2ltZG9uZS1hdG9tOmJvYXJkLXpvb20taW4nLCAoZXZ0KSA9PiBAem9vbSAnaW4nXG5cbiAgICBAc3Vic2NyaXB0aW9ucy5hZGQgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgJ2ltZG9uZS1hdG9tOmJvYXJkLXpvb20tb3V0JywgKGV2dCkgPT4gQHpvb20gJ291dCdcblxuICAgIGF0b20ud29ya3NwYWNlLmFkZE9wZW5lciAodXJpVG9PcGVuKSA9PlxuICAgICAge3Byb3RvY29sLCBob3N0LCBwYXRobmFtZX0gPSB1cmwucGFyc2UodXJpVG9PcGVuKVxuICAgICAgcmV0dXJuIHVubGVzcyBwcm90b2NvbCBpcyAnaW1kb25lOidcbiAgICAgIEB2aWV3Rm9yVXJpKHVyaVRvT3BlbilcblxuICAgIEBmaWxlU2VydmljZSA9IHJlcXVpcmUoJy4vc2VydmljZXMvZmlsZS1zZXJ2aWNlJykuaW5pdCBjb25maWdIZWxwZXIuZ2V0U2V0dGluZ3MoKS5vcGVuSW4ucG9ydFxuXG5cblxuICBlbWl0OiAobmFtZSwgZGF0YSkgLT5cbiAgICBhY3RpdmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lSXRlbSgpXG4gICAgcmV0dXJuIHVubGVzcyBhY3RpdmUgaW5zdGFuY2VvZiBJbWRvbmVBdG9tVmlld1xuICAgIGFjdGl2ZS5lbWl0dGVyLmVtaXQgbmFtZSwgZGF0YVxuXG4gIHpvb206IChkaXIpIC0+IEBlbWl0ICd6b29tJywgZGlyXG5cbiAgdGFza3M6IChwcm9qZWN0UGF0aCkgLT5cbiAgICBwcmV2aW91c0FjdGl2ZVBhbmUgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKClcbiAgICB1cmkgPSBAdXJpRm9yUHJvamVjdChwcm9qZWN0UGF0aClcbiAgICByZXR1cm4gdW5sZXNzIHVyaVxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4odXJpLCBzZWFyY2hBbGxQYW5lczogdHJ1ZSkudGhlbiAoaW1kb25lQXRvbVZpZXcpID0+XG4gICAgICByZXR1cm4gdW5sZXNzIGltZG9uZUF0b21WaWV3IGluc3RhbmNlb2YgSW1kb25lQXRvbVZpZXdcbiAgICAgIHByZXZpb3VzQWN0aXZlUGFuZS5hY3RpdmF0ZSgpXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBpbWRvbmVIZWxwZXIgPSByZXF1aXJlICcuL3NlcnZpY2VzL2ltZG9uZS1oZWxwZXInXG4gICAgaW1kb25lSGVscGVyLmRlc3Ryb3lSZXBvcygpXG4gICAgQHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG5cbiAgZ2V0Q3VycmVudFByb2plY3Q6IC0+XG4gICAgcGF0aHMgPSBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVxuICAgIHJldHVybiB1bmxlc3MgcGF0aHMubGVuZ3RoID4gMFxuICAgIGFjdGl2ZSA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmVJdGVtKClcbiAgICBpZiBhY3RpdmUgJiYgYWN0aXZlLmdldFBhdGggJiYgYWN0aXZlLmdldFBhdGgoKVxuXG4gICAgICByZXR1cm4gcHJvamVjdFBhdGggZm9yIHByb2plY3RQYXRoIGluIHBhdGhzIHdoZW4gYWN0aXZlLmdldFBhdGgoKS5pbmRleE9mKHByb2plY3RQYXRoK3BhdGguc2VwKSA9PSAwXG4gICAgZWxzZVxuICAgICAgcGF0aHNbMF1cblxuICBwcm92aWRlU2VydmljZTogLT4gcmVxdWlyZSAnLi9zZXJ2aWNlcy9wbHVnaW4tbWFuYWdlcidcblxuICBvcGVuSm91cm5hbEZpbGU6IChwcm9qZWN0RGlyKSAtPlxuICAgIG1vbWVudCA9IHJlcXVpcmUgJ21vbWVudCdcbiAgICBta2RpcnAgPSByZXF1aXJlICdta2RpcnAnXG4gICAgY29uZmlnID0gY29uZmlnSGVscGVyLmdldFNldHRpbmdzKCkudG9kYXlzSm91cm5hbFxuICAgIGRhdGUgPSBtb21lbnQoKS5mb3JtYXQgY29uZmlnLmRhdGVGb3JtYXRcbiAgICBtb250aCA9IG1vbWVudCgpLmZvcm1hdCBjb25maWcubW9udGhGb3JtYXRcbiAgICB0ZW1wbGF0ZSA9ICh0KSAtPiB0LnJlcGxhY2UoXCIke2RhdGV9XCIsZGF0ZSkucmVwbGFjZShcIiR7bW9udGh9XCIsIG1vbnRoKVxuICAgIGlmIHByb2plY3REaXJcbiAgICAgIGZpbGUgPSB0ZW1wbGF0ZSBjb25maWcucHJvamVjdEZpbGVOYW1lVGVtcGxhdGVcbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4ocGF0aC5qb2luIHByb2plY3REaXIsIGZpbGUpXG4gICAgZWxzZVxuICAgICAgZmlsZSA9IHRlbXBsYXRlIGNvbmZpZy5maWxlTmFtZVRlbXBsYXRlXG4gICAgICBkaXIgPSB0ZW1wbGF0ZSBjb25maWcuZGlyZWN0b3J5XG4gICAgICBmaWxlUGF0aCA9IHBhdGguam9pbiBkaXIsIGZpbGVcbiAgICAgIG1rZGlycCBkaXIsIChlcnIpIC0+XG4gICAgICAgIGlmIChlcnIpXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIFwiQ2FuJ3Qgb3BlbiBqb3VybmFsIGZpbGUgI3tmaWxlUGF0aH1cIlxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgYXRvbS5wcm9qZWN0LmFkZFBhdGggZGlyXG4gICAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4gZmlsZVBhdGhcblxuICB1cmlGb3JQcm9qZWN0OiAocHJvamVjdFBhdGgpIC0+XG4gICAgcHJvamVjdFBhdGggPSBwcm9qZWN0UGF0aCB8fCBAZ2V0Q3VycmVudFByb2plY3QoKVxuICAgIHJldHVybiB1bmxlc3MgcHJvamVjdFBhdGhcbiAgICBwcm9qZWN0UGF0aCA9IGVuY29kZVVSSUNvbXBvbmVudChwcm9qZWN0UGF0aClcbiAgICAnaW1kb25lOi8vdGFza3MvJyArIHByb2plY3RQYXRoXG5cbiAgdmlld0ZvclVyaTogKHVyaSkgLT5cbiAgICB7cHJvdG9jb2wsIGhvc3QsIHBhdGhuYW1lfSA9IHVybC5wYXJzZSh1cmkpXG4gICAgcmV0dXJuIHVubGVzcyBwYXRobmFtZVxuICAgIHBhdGhuYW1lID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhdGhuYW1lLnNwbGl0KCcvJylbMV0pXG4gICAgQGNyZWF0ZUltZG9uZUF0b21WaWV3KHBhdGg6IHBhdGhuYW1lLCB1cmk6IHVyaSlcblxuICBjcmVhdGVJbWRvbmVBdG9tVmlldzogKHtwYXRoLCB1cml9KSAtPlxuICAgIEltZG9uZUF0b21WaWV3ID89IHJlcXVpcmUgJy4vdmlld3MvaW1kb25lLWF0b20tdmlldydcbiAgICBpbWRvbmVIZWxwZXIgPz0gcmVxdWlyZSAnLi9zZXJ2aWNlcy9pbWRvbmUtaGVscGVyJ1xuICAgIHJlcG8gPSBpbWRvbmVIZWxwZXIuZ2V0UmVwbyBwYXRoLCB1cmlcblxuICAgIHZpZXcgPSBuZXcgSW1kb25lQXRvbVZpZXcoaW1kb25lUmVwbzogcmVwbywgcGF0aDogcGF0aCwgdXJpOiB1cmkpXG4iXX0=
