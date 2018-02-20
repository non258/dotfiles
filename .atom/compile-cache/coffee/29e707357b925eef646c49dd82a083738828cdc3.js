(function() {
  var $, $$, $$$, $el, BottomView, Emitter, ImdoneAtomView, MenuView, ScrollView, Sortable, _, config, envConfig, fileService, fs, log, path, pluginManager, ref, util,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $ = ref.$, $$ = ref.$$, $$$ = ref.$$$, ScrollView = ref.ScrollView;

  $el = require('laconic');

  Emitter = require('atom').Emitter;

  fs = require('fs');

  MenuView = null;

  BottomView = null;

  path = null;

  util = null;

  Sortable = null;

  pluginManager = null;

  fileService = null;

  log = null;

  _ = null;

  config = require('../services/imdone-config');

  envConfig = require('../../config');

  module.exports = ImdoneAtomView = (function(superClass) {
    var PluginViewInterface;

    extend(ImdoneAtomView, superClass);

    PluginViewInterface = (function(superClass1) {
      extend(PluginViewInterface, superClass1);

      function PluginViewInterface(imdoneView) {
        this.imdoneView = imdoneView;
        PluginViewInterface.__super__.constructor.call(this);
      }

      PluginViewInterface.prototype.emitter = function() {
        return this;
      };

      PluginViewInterface.prototype.selectTask = function(id) {
        return this.imdoneView.selectTask(id);
      };

      PluginViewInterface.prototype.showPlugin = function(plugin) {
        if (!plugin.getView) {
          return;
        }
        return this.imdoneView.bottomView.showPlugin(plugin);
      };

      return PluginViewInterface;

    })(Emitter);

    ImdoneAtomView.prototype.initialize = function() {
      var svgPath;
      ImdoneAtomView.__super__.initialize.apply(this, arguments);
      this.zoom(config.getSettings().zoomLevel);
      svgPath = path.join(config.getPackagePath(), 'images', 'icons.svg');
      return fs.readFile(svgPath, (function(_this) {
        return function(err, data) {
          if (err) {
            return;
          }
          return _this.$svg.html(data.toString());
        };
      })(this));
    };

    function ImdoneAtomView(arg) {
      this.imdoneRepo = arg.imdoneRepo, this.path = arg.path, this.uri = arg.uri;
      this.getList = bind(this.getList, this);
      this.getTask = bind(this.getTask, this);
      ImdoneAtomView.__super__.constructor.apply(this, arguments);
      util = require('util');
      Sortable = require('sortablejs');
      pluginManager = require('../services/plugin-manager');
      fileService = require('../services/file-service');
      log = require('../services/log');
      _ = require('lodash');
      require('./jq-utils')($);
      this.title = (path.basename(this.path)) + " Tasks";
      this.plugins = {};
      this.handleEvents();
      this.imdoneRepo.fileStats((function(_this) {
        return function(err, files) {
          _this.numFiles = files.length;
          _this.messages.append("<p>Found " + files.length + " files in " + (path.basename(_this.path)) + "</p>");
          if (_this.numFiles > config.getSettings().maxFilesPrompt) {
            return _this.ignorePrompt.show();
          } else {
            _this.messages.append("<p>Looking for TODO's with the following tokens:</p> <p>" + (_this.imdoneRepo.config.code.include_lists.join('<br/>')) + "</p>");
            return _this.initImdone();
          }
        };
      })(this));
    }

    ImdoneAtomView.prototype.serialize = function() {
      return {
        deserializer: 'ImdoneAtomView',
        path: this.path,
        uri: this.uri
      };
    };

    ImdoneAtomView.prototype.zoom = function(dir) {
      var zoomVal, zoomable;
      zoomable = this.find('.zoomable');
      if (typeof dir === 'number') {
        return zoomable.css('zoom', dir);
      }
      zoomVal = new Number(zoomable.css('zoom'));
      zoomVal = dir === 'in' ? zoomVal + .05 : zoomVal - .05;
      return zoomable.css('zoom', zoomVal);
    };

    ImdoneAtomView.content = function(params) {
      MenuView = require('./menu-view');
      BottomView = require('./bottom-view');
      path = require('path');
      return this.div({
        tabindex: -1,
        "class": 'imdone-atom pane-item'
      }, (function(_this) {
        return function() {
          _this.div({
            outlet: '$svg'
          });
          _this.div({
            outlet: 'loading',
            "class": 'imdone-loading'
          }, function() {
            _this.h1("Scanning files in " + (path.basename(params.path)) + ".");
            _this.p("Get ready for awesome!!!");
            _this.div({
              outlet: 'messages',
              "class": 'imdone-messages'
            });
            _this.div({
              outlet: 'ignorePrompt',
              "class": 'ignore-prompt',
              style: 'display: none;'
            }, function() {
              _this.h2({
                "class": 'text-warning'
              }, "Help!  Don't make me crash!");
              _this.p("Too many files make me bloated.  Ignoring files and directories in .imdoneignore can make me feel better.");
              return _this.div({
                "class": 'block'
              }, function() {
                _this.button({
                  click: 'openIgnore',
                  "class": 'inline-block-tight btn btn-primary'
                }, "Edit .imdoneignore");
                return _this.button({
                  click: 'initImdone',
                  "class": 'inline-block-tight btn btn-warning'
                }, "Who cares, keep going");
              });
            });
            return _this.div({
              outlet: 'progressContainer',
              style: 'display:none;'
            }, function() {
              return _this.progress({
                "class": 'inline-block',
                outlet: 'progress',
                max: 100,
                value: 1
              });
            });
          });
          _this.div({
            outlet: 'error',
            "class": 'imdone-error'
          });
          _this.div({
            outlet: 'mask',
            "class": 'mask'
          }, function() {
            _this.div({
              "class": 'spinner-mask'
            });
            return _this.div({
              "class": 'spinner-container'
            }, function() {
              return _this.div({
                "class": 'spinner'
              }, function() {
                _this.p({
                  outlet: 'spinnerMessage'
                });
                return _this.p(function() {
                  return _this.span({
                    "class": 'loading loading-spinner-small inline-block'
                  });
                });
              });
            });
          });
          return _this.div({
            outlet: 'mainContainer',
            "class": 'imdone-main-container'
          }, function() {
            return _this.div({
              outlet: 'appContainer',
              "class": 'imdone-app-container'
            }, function() {
              _this.subview('menuView', new MenuView(params));
              _this.div({
                outlet: 'boardWrapper',
                "class": 'imdone-board-wrapper native-key-bindings'
              }, function() {
                return _this.div({
                  outlet: 'board',
                  "class": 'imdone-board zoomable'
                });
              });
              return _this.div({
                outlet: 'configWrapper',
                "class": 'imdone-config-wrapper'
              }, function() {
                return _this.subview('bottomView', new BottomView(params));
              });
            });
          });
        };
      })(this));
    };

    ImdoneAtomView.prototype.getTitle = function() {
      return this.title;
    };

    ImdoneAtomView.prototype.getIconName = function() {
      return "checklist";
    };

    ImdoneAtomView.prototype.getURI = function() {
      return this.uri;
    };

    ImdoneAtomView.prototype.addRepoListeners = function() {
      var emitter, event, events, handle, handler, handlers, j, len, repo;
      if (this.listenersInitialized) {
        return;
      }
      repo = this.imdoneRepo;
      emitter = this.emitter;
      handlers = {};
      handle = function(event) {
        return function(data) {
          return emitter.emit(event, data);
        };
      };
      events = ['list.modified', 'project.not-found', 'project.removed', 'project.found', 'product.linked', 'product.unlinked', 'tasks.updated', 'tasks.syncing', 'sync.error', 'initialized', 'file.update', 'tasks.moved', 'config.update', 'config.loaded', 'error', 'file.read', 'sync.percent', 'connector.enabled', 'authenticated', 'unauthenticated', 'authentication-failed', 'unavailable'];
      for (j = 0, len = events.length; j < len; j++) {
        event = events[j];
        handler = handlers[event] = handle(event);
        repo.on(event, handler);
      }
      this.removeAllRepoListeners = function() {
        var k, len1, results;
        results = [];
        for (k = 0, len1 = events.length; k < len1; k++) {
          event = events[k];
          results.push(repo.removeListener(event, handlers[event]));
        }
        return results;
      };
      return this.listenersInitialized = true;
    };

    ImdoneAtomView.prototype.handleEvents = function() {
      var repo;
      repo = this.imdoneRepo;
      this.emitter = this.viewInterface = new PluginViewInterface(this);
      this.addRepoListeners();
      this.menuView.handleEvents(this.emitter);
      this.bottomView.handleEvents(this.emitter);
      this.emitter.on('authentication-failed', (function(_this) {
        return function(arg) {
          var retries, status;
          status = arg.status, retries = arg.retries;
          if (status === "unavailable" && retries) {
            return _this.hideMask();
          }
        };
      })(this));
      this.emitter.on('authenticated', (function(_this) {
        return function() {
          return pluginManager.init();
        };
      })(this));
      this.emitter.on('unavailable', (function(_this) {
        return function() {
          _this.hideMask();
          return atom.notifications.addInfo(envConfig.name + " is unavailable", {
            detail: "Click login to retry",
            dismissable: true,
            icon: 'alert'
          });
        };
      })(this));
      this.emitter.on('sync.error', (function(_this) {
        return function() {
          return _this.hideMask();
        };
      })(this));
      this.emitter.on('tasks.updated', (function(_this) {
        return function(tasks) {
          return _this.onRepoUpdate(tasks);
        };
      })(this));
      this.emitter.on('initialized', (function(_this) {
        return function() {
          var Plugin, j, len, ref1;
          ref1 = pluginManager.getAll();
          for (j = 0, len = ref1.length; j < len; j++) {
            Plugin = ref1[j];
            _this.addPlugin(Plugin);
          }
          return _this.onRepoUpdate(_this.imdoneRepo.getTasks());
        };
      })(this));
      this.emitter.on('list.modified', (function(_this) {
        return function(list) {
          return _this.onRepoUpdate(_this.imdoneRepo.getTasksInList(list));
        };
      })(this));
      this.emitter.on('file.update', (function(_this) {
        return function(file) {
          if (file.getPath()) {
            return _this.onRepoUpdate(file.getTasks());
          }
        };
      })(this));
      this.emitter.on('tasks.moved', (function(_this) {
        return function(tasks) {
          return _this.onRepoUpdate(tasks);
        };
      })(this));
      this.emitter.on('config.update', (function(_this) {
        return function() {
          return repo.refresh();
        };
      })(this));
      this.emitter.on('error', (function(_this) {
        return function(mdMsg) {
          return atom.notifications.addWarning("OOPS!", {
            description: mdMsg,
            dismissable: true,
            icon: 'alert'
          });
        };
      })(this));
      this.emitter.on('task.modified', (function(_this) {
        return function(task) {
          return _this.onRepoUpdate();
        };
      })(this));
      this.emitter.on('menu.toggle', (function(_this) {
        return function() {
          return _this.boardWrapper.toggleClass('shift');
        };
      })(this));
      this.emitter.on('filter', (function(_this) {
        return function(text) {
          return _this.filter(text);
        };
      })(this));
      this.emitter.on('filter.clear', (function(_this) {
        return function() {
          return _this.board.find('.task').show();
        };
      })(this));
      this.emitter.on('visible.open', (function(_this) {
        return function() {
          var file, fpath, fullPath, j, len, line, numFiles, paths, ref1, results, task;
          paths = {};
          ref1 = _this.visibleTasks();
          for (j = 0, len = ref1.length; j < len; j++) {
            task = ref1[j];
            file = _this.imdoneRepo.getFileForTask(task);
            fullPath = _this.imdoneRepo.getFullPath(file);
            paths[fullPath] = task.line;
          }
          numFiles = _.keys(paths).length;
          if (numFiles < 5 || window.confirm("imdone is about to open " + numFiles + " files.  Continue?")) {
            results = [];
            for (fpath in paths) {
              line = paths[fpath];
              results.push(_this.openPath(fpath, line));
            }
            return results;
          }
        };
      })(this));
      this.emitter.on('tasks.delete', (function(_this) {
        return function() {
          var visibleTasks;
          visibleTasks = _this.imdoneRepo.visibleTasks();
          if (!visibleTasks) {
            return;
          }
          if (!window.confirm("imdone is about to delete " + visibleTasks.length + " tasks.  Continue?")) {
            return;
          }
          _this.showMask("deleting " + visibleTasks.length + " tasks");
          return _this.imdoneRepo.deleteVisibleTasks(function(err) {
            return this.hideMask();
          });
        };
      })(this));
      this.emitter.on('readme.open', (function(_this) {
        return function() {
          var file;
          file = _this.imdoneRepo.getReadme();
          if (!file) {
            _this.emitter.emit('error', 'Sorry no readme :(');
          } else {
            return _this.openPath(_this.imdoneRepo.getFullPath(file));
          }
        };
      })(this));
      this.emitter.on('config.close', (function(_this) {
        return function() {
          _this.boardWrapper.removeClass('shift-bottom');
          _this.boardWrapper.css('bottom', '');
          return _this.clearSelection();
        };
      })(this));
      this.emitter.on('config.open', (function(_this) {
        return function() {
          return _this.boardWrapper.addClass('shift-bottom');
        };
      })(this));
      this.emitter.on('resize.change', (function(_this) {
        return function(height) {
          return _this.boardWrapper.css('bottom', height + 'px');
        };
      })(this));
      this.emitter.on('zoom', (function(_this) {
        return function(dir) {
          return _this.zoom(dir);
        };
      })(this));
      this.on('click', '.source-link', (function(_this) {
        return function(e) {
          var description, file, fullPath, line, link, newLink, task, taskId;
          link = e.target;
          _this.openPath(link.dataset.uri, link.dataset.line);
          if (config.getSettings().showNotifications && !$(link).hasClass('info-link')) {
            taskId = $(link).closest('.task').attr('id');
            task = _this.imdoneRepo.getTask(taskId);
            file = _this.imdoneRepo.getFileForTask(task);
            fullPath = _this.imdoneRepo.getFullPath(file);
            line = task.line;
            newLink = $(link.cloneNode(true));
            newLink.addClass('info-link');
            description = task.text + "\n\n" + newLink[0].outerHTML;
            return atom.notifications.addInfo(task.list, {
              description: description,
              dismissable: true,
              icon: 'check'
            });
          }
        };
      })(this));
      this.on('click', '.list-name', (function(_this) {
        return function(e) {
          var name;
          name = e.target.dataset.list;
          return _this.bottomView.editListName(name);
        };
      })(this));
      this.on('click', '.delete-list', (function(_this) {
        return function(e) {
          var name, target;
          e.stopPropagation();
          e.preventDefault();
          target = e.target;
          name = target.dataset.list || target.parentElement.dataset.list;
          return repo.removeList(name);
        };
      })(this));
      this.on('click', '.filter-link', (function(_this) {
        return function(e) {
          var filter, target;
          target = e.target;
          filter = target.dataset.filter || target.parentElement.dataset.filter;
          return _this.setFilter(filter);
        };
      })(this));
      this.on('click', '[href^="#filter/"]', (function(_this) {
        return function(e) {
          var filter, filterAry, target;
          target = e.target;
          if (!(target.nodeName === 'A')) {
            target = target.closest('a');
          }
          e.stopPropagation();
          e.preventDefault();
          filterAry = target.getAttribute('href').split('/');
          filterAry.shift();
          filter = filterAry.join('/');
          return _this.setFilter(filter);
        };
      })(this));
      this.on('change', 'ul.checklist>li>input[type=checkbox]', (function(_this) {
        return function(e) {
          var $task, items, target, taskId;
          target = e.target;
          $task = target.closest('.task');
          taskId = $task.id;
          items = $task.querySelectorAll('.task-description .checklist-item');
          [].forEach.call(items, function(el) {
            if (el.checked) {
              return el.setAttribute('checked', true);
            } else {
              return el.removeAttribute('checked');
            }
          });
          return repo.modifyTaskFromHtml(repo.getTask(taskId), $task.querySelector('.task-text').innerHTML);
        };
      })(this));
      pluginManager.emitter.on('plugin.added', (function(_this) {
        return function(Plugin) {
          if (repo.getConfig()) {
            return _this.addPlugin(Plugin);
          } else {
            return _this.emitter.on('initialized', function() {
              return _this.addPlugin(Plugin);
            });
          }
        };
      })(this));
      pluginManager.emitter.on('plugin.removed', (function(_this) {
        return function(Plugin) {
          return _this.removePlugin(Plugin);
        };
      })(this));
      this.emitter.on('connector.disabled', (function(_this) {
        return function(connector) {
          return _this.removePluginByProvider(connector.name);
        };
      })(this));
      this.emitter.on('connector.enabled', (function(_this) {
        return function(connector) {
          return _this.addPluginByProvider(connector.name);
        };
      })(this));
      this.emitter.on('product.unlinked', (function(_this) {
        return function(product) {
          return _this.removePluginByProvider(product.name);
        };
      })(this));
      this.emitter.on('connector.changed', (function(_this) {
        return function(product) {
          var name, plugin, ref1, results;
          _this.addPluginByProvider(product.connector.name);
          ref1 = _this.plugins;
          results = [];
          for (name in ref1) {
            plugin = ref1[name];
            if (plugin.constructor.provider === product.name) {
              results.push(plugin.setConnector(product.connector));
            } else {
              results.push(void 0);
            }
          }
          return results;
        };
      })(this));
      this.emitter.on('logoff', (function(_this) {
        return function() {
          return pluginManager.removeDefaultPlugins();
        };
      })(this));
      return this.emitter.on('project.removed', (function(_this) {
        return function() {
          return pluginManager.removeDefaultPlugins();
        };
      })(this));
    };

    ImdoneAtomView.prototype.addPluginButtons = function() {
      this.addPluginTaskButtons();
      return this.addPluginProjectButtons();
    };

    ImdoneAtomView.prototype.addPluginTaskButtons = function() {
      var plugins;
      this.board.find('.imdone-task-plugins').empty();
      if (!this.hasPlugins()) {
        return;
      }
      plugins = this.plugins;
      return this.board.find('.task').each(function() {
        var $button, $task, $taskPlugins, id, name, plugin, results;
        $task = $(this);
        $taskPlugins = $task.find('.imdone-task-plugins');
        id = $task.attr('id');
        results = [];
        for (name in plugins) {
          plugin = plugins[name];
          if (typeof plugin.taskButton === 'function') {
            $button = plugin.taskButton(id);
            if ($button) {
              if ($button.classList) {
                $button.classList.add('task-plugin-button');
              } else {
                $button.addClass('task-plugin-button');
              }
              results.push($taskPlugins.append($button));
            } else {
              results.push(void 0);
            }
          } else {
            results.push(void 0);
          }
        }
        return results;
      });
    };

    ImdoneAtomView.prototype.addPluginProjectButtons = function() {
      return this.menuView.addPluginProjectButtons(this.plugins);
    };

    ImdoneAtomView.prototype.addPluginView = function(plugin) {
      if (!plugin.getView) {
        return;
      }
      return this.bottomView.addPlugin(plugin);
    };

    ImdoneAtomView.prototype.initPluginView = function(plugin) {
      this.addPluginButtons();
      return this.addPluginView(plugin);
    };

    ImdoneAtomView.prototype.addPlugin = function(Plugin) {
      if (!Plugin) {
        return;
      }
      return this.imdoneRepo.getProduct(Plugin.provider, (function(_this) {
        return function(err, product) {
          var connector, plugin;
          if (err || (product && !product.isEnabled())) {
            return;
          }
          connector = product && product.connector;
          if (_this.plugins[Plugin.pluginName]) {
            return _this.addPluginButtons();
          } else {
            plugin = new Plugin(_this.imdoneRepo, _this.viewInterface, connector);
            _this.plugins[Plugin.pluginName] = plugin;
            _this.imdoneRepo.addPlugin(plugin);
            if (plugin instanceof Emitter) {
              if (plugin.isReady()) {
                return _this.initPluginView(plugin);
              } else {
                return plugin.on('ready', function() {
                  return _this.initPluginView(plugin);
                });
              }
            } else {
              return _this.initPluginView(plugin);
            }
          }
        };
      })(this));
    };

    ImdoneAtomView.prototype.addPluginByProvider = function(provider) {
      return this.addPlugin(pluginManager.getByProvider(provider));
    };

    ImdoneAtomView.prototype.removePlugin = function(Plugin) {
      var plugin;
      if (!Plugin) {
        return;
      }
      plugin = this.plugins[Plugin.pluginName];
      this.imdoneRepo.removePlugin(plugin);
      if (plugin && plugin.getView) {
        this.bottomView.removePlugin(plugin);
      }
      delete this.plugins[Plugin.pluginName];
      return this.addPluginButtons();
    };

    ImdoneAtomView.prototype.removePluginByProvider = function(provider) {
      return this.removePlugin(pluginManager.getByProvider(provider));
    };

    ImdoneAtomView.prototype.hasPlugins = function() {
      return Object.keys(this.plugins).length > 0;
    };

    ImdoneAtomView.prototype.setFilter = function(text) {
      this.menuView.setFilter(text);
      this.menuView.openMenu();
      return this.boardWrapper.addClass('shift');
    };

    ImdoneAtomView.prototype.getFilter = function() {
      return this.menuView.getFilter();
    };

    ImdoneAtomView.prototype.filter = function(text) {
      if (!text) {
        text = this.getFilter();
      }
      this.lastFilter = text;
      if (text === '') {
        this.board.find('.task').show();
      } else {
        this.board.find('.task').hide();
        this.filterByPath(text);
        this.filterByContent(text);
      }
      return this.emitter.emit('board.update');
    };

    ImdoneAtomView.prototype.filterByPath = function(text) {
      return this.board.find(util.format('.task:attrContainsRegex(data-path,%s)', text)).each(function() {
        return $(this).show().attr('id');
      });
    };

    ImdoneAtomView.prototype.filterByContent = function(text) {
      return this.board.find(util.format('.task-full-text:containsRegex("%s")', text)).each(function() {
        return $(this).closest('.task').show().attr('id');
      });
    };

    ImdoneAtomView.prototype.visibleTasks = function(listName) {
      if (!this.imdoneRepo) {
        return [];
      }
      return this.imdoneRepo.visibleTasks(listName);
    };

    ImdoneAtomView.prototype.initImdone = function() {
      if (this.imdoneRepo.initialized) {
        this.onRepoUpdate(this.imdoneRepo.getTasks());
        this.menuView.updateMenu();
        this.imdoneRepo.initProducts();
        return;
      }
      if (this.numFiles > 1000) {
        this.ignorePrompt.hide();
        this.progressContainer.show();
        this.emitter.on('file.read', (function(_this) {
          return function(data) {
            var complete;
            complete = Math.ceil((data.completed / _this.numFiles) * 100);
            return _this.progress.attr('value', complete);
          };
        })(this));
      }
      return this.imdoneRepo.init();
    };

    ImdoneAtomView.prototype.openIgnore = function() {
      var ignorePath, item;
      ignorePath = path.join(this.imdoneRepo.path, '.imdoneignore');
      item = this;
      return atom.workspace.open(ignorePath, {
        split: 'left'
      }).then((function(_this) {
        return function() {
          return item.destroy();
        };
      })(this));
    };

    ImdoneAtomView.prototype.onRepoUpdate = function(tasks) {
      this.updateBoard(tasks);
      this.boardWrapper.css('bottom', 0);
      this.bottomView.attr('style', '');
      this.loading.hide();
      this.mainContainer.show();
      return this.hideMask();
    };

    ImdoneAtomView.prototype.showMask = function(msg) {
      if (msg) {
        this.spinnerMessage.html(msg);
      }
      return this.mask.show();
    };

    ImdoneAtomView.prototype.hideMask = function() {
      if (this.mask) {
        return this.mask.hide();
      }
    };

    ImdoneAtomView.prototype.genFilterLink = function(opts) {
      var $link, linkPrefix;
      linkPrefix = opts.displayPrefix ? opts.linkPrefix : "";
      $link = $el.a({
        href: "#",
        title: "just show me tasks with " + opts.linkText,
        "class": "filter-link"
      }, $el.span({
        "class": opts.linkClass
      }, "" + linkPrefix + opts.linkText));
      $link.dataset.filter = opts.linkPrefix.replace("+", "\\+") + opts.linkText;
      return $link;
    };

    ImdoneAtomView.prototype.getTask = function(task) {
      var $div, $filters, $taskMeta, $taskMetaTable, $taskText, $tr, context, contexts, data, dateCompleted, dateCreated, dateDue, fn, fn1, fn2, fn3, fn4, i, j, k, l, len, len1, len2, len3, len4, m, n, opts, ref1, repo, self, showTagsInline, tag, tags, taskHtml;
      self = this;
      repo = this.imdoneRepo;
      contexts = task.getContext();
      tags = task.getTags();
      dateDue = task.getDateDue();
      dateCreated = task.getDateCreated();
      dateCompleted = task.getDateCompleted();
      $taskText = $el.div({
        "class": 'task-text native-key-bindings'
      });
      $filters = $el.div();
      $taskMetaTable = $el.table();
      $taskMeta = $el.div({
        "class": 'task-meta'
      }, $taskMetaTable);
      opts = $.extend({}, {
        stripMeta: true,
        stripDates: true,
        sanitize: true
      }, repo.getConfig().marked);
      taskHtml = task.getHtml(opts);
      showTagsInline = config.getSettings().showTagsInline;
      if (showTagsInline) {
        if (contexts) {
          fn = (function(_this) {
            return function(context, i) {
              var $link;
              $link = _this.genFilterLink({
                linkPrefix: "@",
                linkText: context,
                linkClass: "task-context",
                displayPrefix: true
              });
              return taskHtml = taskHtml.replace("@" + context, $el.div($link).innerHTML);
            };
          })(this);
          for (i = j = 0, len = contexts.length; j < len; i = ++j) {
            context = contexts[i];
            fn(context, i);
          }
        }
        if (tags) {
          fn1 = (function(_this) {
            return function(tag, i) {
              var $link;
              $link = _this.genFilterLink({
                linkPrefix: "+",
                linkText: tag,
                linkClass: "task-tags",
                displayPrefix: true
              });
              return taskHtml = taskHtml.replace("+" + tag, $el.div($link).innerHTML);
            };
          })(this);
          for (i = k = 0, len1 = tags.length; k < len1; i = ++k) {
            tag = tags[i];
            fn1(tag, i);
          }
        }
      } else {
        taskHtml = task.getHtml($.extend({
          stripTags: true,
          stripContext: true
        }, opts));
        if (contexts) {
          $div = $el.div();
          $filters.appendChild($div);
          fn2 = (function(_this) {
            return function(context, i) {
              $div.appendChild(self.genFilterLink({
                linkPrefix: "@",
                linkText: context,
                linkClass: "task-context"
              }));
              if (i < contexts.length - 1) {
                return $div.appendChild($el.span(", "));
              }
            };
          })(this);
          for (i = l = 0, len2 = contexts.length; l < len2; i = ++l) {
            context = contexts[i];
            fn2(context, i);
          }
        }
        if (tags) {
          $div = $el.div();
          $filters.appendChild($div);
          fn3 = (function(_this) {
            return function(tag, i) {
              $div.appendChild(self.genFilterLink({
                linkPrefix: "+",
                linkText: tag,
                linkClass: "task-tags"
              }));
              if (i < tags.length - 1) {
                return $div.appendChild($el.span(", "));
              }
            };
          })(this);
          for (i = m = 0, len3 = tags.length; m < len3; i = ++m) {
            tag = tags[i];
            fn3(tag, i);
          }
        }
      }
      $taskText.innerHTML = taskHtml;
      if (dateCreated) {
        $tr = $el.tr({
          "class": 'meta-data-row'
        }, $el.td("created"), $el.td(dateCreated), $el.td({
          "class": 'meta-filter'
        }, $el.a({
          href: "#",
          title: "filter by created on " + dateCreated,
          "class": "filter-link",
          "data-filter": "(x\\s\\d{4}-\\d{2}-\\d{2}\\s)?" + dateCreated
        }, $el.span({
          "class": "icon icon-light-bulb"
        }))));
        $taskMetaTable.appendChild($tr);
      }
      if (dateCompleted) {
        $tr = $el.tr({
          "class": 'meta-data-row'
        }, $el.td("completed"), $el.td(dateCompleted), $el.td({
          "class": 'meta-filter'
        }, $el.a({
          href: "#",
          title: "filter by completed on " + dateCompleted,
          "class": "filter-link",
          "data-filter": "x " + dateCompleted
        }, $el.span({
          "class": "icon icon-light-bulb"
        }))));
        $taskMetaTable.appendChild($tr);
      }
      ref1 = task.getMetaDataWithLinks(repo.getConfig());
      fn4 = (function(_this) {
        return function(data) {
          var $filterLink, $icons, $link;
          $icons = $el.td();
          if (data.link) {
            $link = $el.a({
              href: data.link.url,
              title: data.link.title
            }, $el.span({
              "class": "icon " + (data.link.icon || 'icon-link-external')
            }));
            $icons.appendChild($link);
          }
          $filterLink = $el.a({
            href: "#",
            title: "just show me tasks with " + data.key + ":" + data.value,
            "class": "filter-link",
            "data-filter": data.key + ":" + data.value
          }, $el.span({
            "class": "icon icon-light-bulb"
          }));
          $icons.appendChild($filterLink);
          $tr = $el.tr({
            "class": 'meta-data-row'
          }, $el.td(data.key), $el.td(data.value), $icons);
          return $taskMetaTable.appendChild($tr);
        };
      })(this);
      for (n = 0, len4 = ref1.length; n < len4; n++) {
        data = ref1[n];
        fn4(data);
      }
      return $el.li({
        "class": 'task well native-key-bindings',
        id: "" + task.id,
        tabindex: -1,
        "data-path": task.source.path,
        "data-line": task.line
      }, $el.div({
        "class": 'imdone-task-plugins'
      }), $el.div({
        "class": 'task-full-text hidden'
      }, task.getTextAndDescription()), $taskText, $filters, $taskMeta, $el.div({
        "class": 'task-source'
      }, $el.a({
        href: '#',
        "class": 'source-link',
        title: 'take me to the source',
        'data-uri': "" + (repo.getFullPath(task.source.path)),
        'data-line': task.line
      }, "" + (task.source.path + ':' + task.line)), $el.span(' | '), $el.a({
        href: "#",
        title: "just show me tasks in " + task.source.path,
        "class": "filter-link",
        "data-filter": "" + task.source.path
      }, $el.span({
        "class": "icon icon-light-bulb"
      }))));
    };

    ImdoneAtomView.prototype.getList = function(list) {
      var $list, $tasks, j, len, repo, self, task, tasks;
      self = this;
      repo = this.imdoneRepo;
      tasks = repo.getTasksInList(list.name);
      $list = $$(function() {
        return this.div({
          "class": 'top list well',
          'data-name': list.name
        }, (function(_this) {
          return function() {
            _this.div({
              "class": 'list-name-wrapper well'
            }, function() {
              return _this.div({
                "class": 'list-name',
                'data-list': list.name,
                title: "I don't like this name"
              }, function() {
                _this.raw(list.name);
                if (tasks.length < 1) {
                  return _this.a({
                    href: '#',
                    title: "delete " + list.name,
                    "class": 'delete-list',
                    "data-list": list.name
                  }, function() {
                    return _this.span({
                      "class": 'icon icon-trashcan'
                    });
                  });
                }
              });
            });
            return _this.ol({
              "class": 'tasks',
              "data-list": "" + list.name
            }, function() {});
          };
        })(this));
      });
      $tasks = $list.find('.tasks');
      for (j = 0, len = tasks.length; j < len; j++) {
        task = tasks[j];
        $tasks.append(self.getTask(task));
      }
      return $list;
    };

    ImdoneAtomView.prototype.listOnBoard = function(name) {
      return this.board.find(".list[data-name='" + name + "'] ol.tasks");
    };

    ImdoneAtomView.prototype.addListToBoard = function(name) {
      var list, position;
      position = _.findIndex(this.imdoneRepo.getLists(), {
        name: name
      });
      list = _.find(this.imdoneRepo.getLists(), {
        name: name
      });
      return this.board.find(".list:eq(" + position + ")").after(this.getList(list));
    };

    ImdoneAtomView.prototype.addTaskToBoard = function(task) {
      return this.listOnBoard(task.list).prepend(this.getTask(task));
    };

    ImdoneAtomView.prototype.addTasksToBoard = function(tasks) {
      var listName, listOfTasks, lists, results, task;
      lists = _.groupBy(tasks, 'list');
      results = [];
      for (listName in lists) {
        listOfTasks = lists[listName];
        if (this.listOnBoard(listName).length === 0) {
          results.push(this.addListToBoard(listName));
        } else {
          results.push((function() {
            var j, len, results1;
            results1 = [];
            for (j = 0, len = listOfTasks.length; j < len; j++) {
              task = listOfTasks[j];
              results1.push(this.addTaskToBoard(task));
            }
            return results1;
          }).call(this));
        }
      }
      return results;
    };

    ImdoneAtomView.prototype.updateTasksOnBoard = function(tasks) {
      var file, files, j, len, listName, self, tasksByList, tasksInFiles;
      if (tasks.length === 0) {
        return false;
      }
      if (tasks.length === this.imdoneRepo.getTasks().length) {
        return false;
      }
      self = this;
      this.destroySortables();
      tasksByList = _.groupBy(tasks, 'list');
      if (_.keys(tasksByList).length === 1) {
        listName = tasks[0].list;
        self.board.find(".list[data-name='" + listName + "']").remove();
        this.addTasksToBoard(this.imdoneRepo.getTasksInList(listName));
      } else {
        files = _.uniq(_.map(tasks, 'source.path'));
        tasksInFiles = [];
        for (j = 0, len = files.length; j < len; j++) {
          file = files[j];
          this.board.find("li[data-path='" + file + "']").remove();
          tasksInFiles = tasksInFiles.concat(this.imdoneRepo.getFile(file).getTasks());
        }
        this.addTasksToBoard(tasksInFiles);
      }
      this.board.find('.list').each(function() {
        var $list;
        $list = $(this);
        listName = $list.attr('data-name');
        if (!self.imdoneRepo.isListVisible(listName)) {
          return $list.remove();
        }
      });
      this.addPluginButtons();
      this.makeTasksSortable();
      this.hideMask();
      return this.emitter.emit('board.update');
    };

    ImdoneAtomView.prototype.updateBoard = function(tasks) {
      var lists, repo, self, width;
      self = this;
      this.destroySortables();
      this.board.empty().hide();
      repo = this.imdoneRepo;
      repo.$board = this.board;
      lists = repo.getVisibleLists();
      width = 378 * lists.length + "px";
      this.board.css('width', width);
      this.board.append(((function(_this) {
        return function() {
          var j, len, list, results;
          results = [];
          for (j = 0, len = lists.length; j < len; j++) {
            list = lists[j];
            results.push(_this.getList(list));
          }
          return results;
        };
      })(this)));
      this.addPluginButtons();
      this.filter();
      this.board.show();
      this.hideMask();
      this.makeTasksSortable();
      return this.emitter.emit('board.update');
    };

    ImdoneAtomView.prototype.destroySortables = function() {
      var j, len, ref1, results, sortable;
      if (this.tasksSortables) {
        ref1 = this.tasksSortables;
        results = [];
        for (j = 0, len = ref1.length; j < len; j++) {
          sortable = ref1[j];
          if (sortable.el) {
            results.push(sortable.destroy());
          } else {
            results.push(void 0);
          }
        }
        return results;
      }
    };

    ImdoneAtomView.prototype.makeTasksSortable = function() {
      var opts, tasksSortables;
      opts = {
        draggable: '.task',
        group: 'tasks',
        sort: true,
        ghostClass: 'imdone-ghost',
        scroll: this.boardWrapper[0],
        onEnd: (function(_this) {
          return function(evt) {
            var filePath, id, list, pos, task;
            id = evt.item.id;
            pos = evt.newIndex;
            list = evt.item.parentNode.dataset.list;
            filePath = _this.imdoneRepo.getFullPath(evt.item.dataset.path);
            task = _this.imdoneRepo.getTask(id);
            _this.showMask("Moving Tasks");
            return _this.imdoneRepo.moveTasks([task], list, pos);
          };
        })(this)
      };
      this.tasksSortables = tasksSortables = [];
      return this.find('.tasks').each(function() {
        return tasksSortables.push(Sortable.create($(this).get(0), opts));
      });
    };

    ImdoneAtomView.prototype.destroy = function() {
      this.removeAllRepoListeners();
      this.remove();
      this.emitter.emit('did-destroy', this);
      return this.emitter.dispose();
    };

    ImdoneAtomView.prototype.onDidDestroy = function(callback) {
      return this.emitter.on('did-destroy', callback);
    };

    ImdoneAtomView.prototype.openPath = function(filePath, line) {
      if (!filePath) {
        return;
      }
      return fileService.openFile(this.path, filePath, line, (function(_this) {
        return function(success) {
          if (success) {
            return;
          }
          return atom.workspace.open(filePath, {
            split: 'left'
          }).then(function() {
            if (line) {
              return _this.moveCursorTo(line);
            }
          });
        };
      })(this));
    };

    ImdoneAtomView.prototype.moveCursorTo = function(lineNumber) {
      var position, textEditor;
      lineNumber = parseInt(lineNumber);
      if (textEditor = atom.workspace.getActiveTextEditor()) {
        position = [lineNumber - 1, 0];
        textEditor.setCursorBufferPosition(position, {
          autoscroll: false
        });
        return textEditor.scrollToCursorPosition({
          center: true
        });
      }
    };

    ImdoneAtomView.prototype.selectTask = function(id) {
      this.clearSelection();
      return this.board.find(".task#" + id).addClass('selected');
    };

    ImdoneAtomView.prototype.clearSelection = function() {
      return this.board.find('.task').removeClass('selected');
    };

    return ImdoneAtomView;

  })(ScrollView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2ltZG9uZS1hdG9tL2xpYi92aWV3cy9pbWRvbmUtYXRvbS12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsZ0tBQUE7SUFBQTs7OztFQUFBLE1BQTJCLE9BQUEsQ0FBUSxzQkFBUixDQUEzQixFQUFDLFNBQUQsRUFBSSxXQUFKLEVBQVEsYUFBUixFQUFhOztFQUNiLEdBQUEsR0FBTSxPQUFBLENBQVEsU0FBUjs7RUFDTCxVQUFXLE9BQUEsQ0FBUSxNQUFSOztFQUNaLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxRQUFBLEdBQVc7O0VBQ1gsVUFBQSxHQUFhOztFQUNiLElBQUEsR0FBTzs7RUFDUCxJQUFBLEdBQU87O0VBQ1AsUUFBQSxHQUFXOztFQUNYLGFBQUEsR0FBZ0I7O0VBQ2hCLFdBQUEsR0FBYzs7RUFDZCxHQUFBLEdBQU07O0VBQ04sQ0FBQSxHQUFJOztFQUNKLE1BQUEsR0FBUyxPQUFBLENBQVEsMkJBQVI7O0VBQ1QsU0FBQSxHQUFZLE9BQUEsQ0FBUSxjQUFSOztFQUVaLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFFSixRQUFBOzs7O0lBQU07OztNQUNTLDZCQUFDLFVBQUQ7UUFBQyxJQUFDLENBQUEsYUFBRDtRQUNaLG1EQUFBO01BRFc7O29DQUViLE9BQUEsR0FBUyxTQUFBO2VBQUc7TUFBSDs7b0NBQ1QsVUFBQSxHQUFZLFNBQUMsRUFBRDtlQUNWLElBQUMsQ0FBQSxVQUFVLENBQUMsVUFBWixDQUF1QixFQUF2QjtNQURVOztvQ0FFWixVQUFBLEdBQVksU0FBQyxNQUFEO1FBQ1YsSUFBQSxDQUFjLE1BQU0sQ0FBQyxPQUFyQjtBQUFBLGlCQUFBOztlQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQXZCLENBQWtDLE1BQWxDO01BRlU7Ozs7T0FOb0I7OzZCQVVsQyxVQUFBLEdB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LENBQUEsQ0FBaEI7UUFDRSxRQUFBLEdBQVcsQ0FBQyxVQUFBLEdBQVcsQ0FBWixFQUFlLENBQWY7UUFDWCxVQUFVLENBQUMsdUJBQVgsQ0FBbUMsUUFBbkMsRUFBNkM7VUFBQSxVQUFBLEVBQVksS0FBWjtTQUE3QztlQUNBLFVBQVUsQ0FBQyxzQkFBWCxDQUFrQztVQUFBLE1BQUEsRUFBUSxJQUFSO1NBQWxDLEVBSEY7O0lBSFk7OzZCQVFkLFVBQUEsR0FBWSxTQUFDLEVBQUQ7TUFDVixJQUFDLENBQUEsY0FBRCxDQUFBO2FBQ0EsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksUUFBQSxHQUFTLEVBQXJCLENBQTBCLENBQUMsUUFBM0IsQ0FBb0MsVUFBcEM7SUFGVTs7NkJBSVosY0FBQSxHQUFnQixTQUFBO2FBQ2QsSUFBQyxDQUFBLEtBQUssQ0FBQyxJQUFQLENBQVksT0FBWixDQUFvQixDQUFDLFdBQXJCLENBQWlDLFVBQWpDO0lBRGM7Ozs7S0F0cEJXO0FBakI3QiIsInNvdXJjZXNDb250ZW50IjpbInskLCAkJCwgJCQkLCBTY3JvbGxWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuJGVsID0gcmVxdWlyZSAnbGFjb25pYydcbntFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG5mcyA9IHJlcXVpcmUgJ2ZzJ1xuTWVudVZpZXcgPSBudWxsXG5Cb3R0b21WaWV3ID0gbnVsbFxucGF0aCA9IG51bGxcbnV0aWwgPSBudWxsXG5Tb3J0YWJsZSA9IG51bGxcbnBsdWdpbk1hbmFnZXIgPSBudWxsXG5maWxlU2VydmljZSA9IG51bGxcbmxvZyA9IG51bGxcbl8gPSBudWxsXG5jb25maWcgPSByZXF1aXJlICcuLi9zZXJ2aWNlcy9pbWRvbmUtY29uZmlnJ1xuZW52Q29uZmlnID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnJ1xuIyAjQkFDS0xPRzogQWRkIGtlZW4gc3RhdHMgZm9yIGZlYXR1cmVzIGdoOjI0MCBpZDo4OVxubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgSW1kb25lQXRvbVZpZXcgZXh0ZW5kcyBTY3JvbGxWaWV3XG5cbiAgY2xhc3MgUGx1Z2luVmlld0ludGVyZmFjZSBleHRlbmRzIEVtaXR0ZXJcbiAgICBjb25zdHJ1Y3RvcjogKEBpbWRvbmVWaWV3KS0+XG4gICAgICBzdXBlcigpXG4gICAgZW1pdHRlcjogLT4gQCAjIENIQU5HRUQ6IGRlcHJlY2F0ZWQgZ2g6MjQ1IGlkOjc0XG4gICAgc2VsZWN0VGFzazogKGlkKSAtPlxuICAgICAgQGltZG9uZVZpZXcuc2VsZWN0VGFzayBpZFxuICAgIHNob3dQbHVnaW46IChwbHVnaW4pIC0+XG4gICAgICByZXR1cm4gdW5sZXNzIHBsdWdpbi5nZXRWaWV3XG4gICAgICBAaW1kb25lVmlldy5ib3R0b21WaWV3LnNob3dQbHVnaW4gcGx1Z2luXG5cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlclxuICAgIEB6b29tIGNvbmZpZy5nZXRTZXR0aW5ncygpLnpvb21MZXZlbFxuICAgICMgaW1kb25lIGljb24gc3R1ZmZcbiAgICBzdmdQYXRoID0gcGF0aC5qb2luIGNvbmZpZy5nZXRQYWNrYWdlUGF0aCgpLCAnaW1hZ2VzJywgJ2ljb25zLnN2ZydcbiAgICBmcy5yZWFkRmlsZSBzdmdQYXRoLCAoZXJyLCBkYXRhKSA9PlxuICAgICAgcmV0dXJuIGlmIGVyclxuICAgICAgQCRzdmcuaHRtbCBkYXRhLnRvU3RyaW5nKClcblxuICBjb25zdHJ1Y3RvcjogKHtAaW1kb25lUmVwbywgQHBhdGgsIEB1cml9KSAtPlxuICAgIHN1cGVyXG4gICAgdXRpbCA9IHJlcXVpcmUgJ3V0aWwnXG4gICAgU29ydGFibGUgPSByZXF1aXJlICdzb3J0YWJsZWpzJ1xuICAgIHBsdWdpbk1hbmFnZXIgPSByZXF1aXJlICcuLi9zZXJ2aWNlcy9wbHVnaW4tbWFuYWdlcidcbiAgICBmaWxlU2VydmljZSA9IHJlcXVpcmUgJy4uL3NlcnZpY2VzL2ZpbGUtc2VydmljZSdcbiAgICBsb2cgPSByZXF1aXJlICcuLi9zZXJ2aWNlcy9sb2cnXG4gICAgXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbiAgICByZXF1aXJlKCcuL2pxLXV0aWxzJykoJClcblxuICAgIEB0aXRsZSA9IFwiI3twYXRoLmJhc2VuYW1lKEBwYXRoKX0gVGFza3NcIlxuICAgIEBwbHVnaW5zID0ge31cblxuICAgIEBoYW5kbGVFdmVudHMoKVxuXG4gICAgQGltZG9uZVJlcG8uZmlsZVN0YXRzIChlcnIsIGZpbGVzKSA9PlxuICAgICAgQG51bUZpbGVzID0gZmlsZXMubGVuZ3RoXG4gICAgICBAbWVzc2FnZXMuYXBwZW5kIFwiPHA+Rm91bmQgI3tmaWxlcy5sZW5ndGh9IGZpbGVzIGluICN7cGF0aC5iYXNlbmFtZShAcGF0aCl9PC9wPlwiXG5cbiAgICAgIGlmIEBudW1GaWxlcyA+IGNvbmZpZy5nZXRTZXR0aW5ncygpLm1heEZpbGVzUHJvbXB0XG4gICAgICAgIEBpZ25vcmVQcm9tcHQuc2hvdygpXG4gICAgICBlbHNlXG4gICAgICAgIEBtZXNzYWdlcy5hcHBlbmQgXCI8cD5Mb29raW5nIGZvciBUT0RPJ3Mgd2l0aCB0aGUgZm9sbG93aW5nIHRva2Vuczo8L3A+IDxwPiN7QGltZG9uZVJlcG8uY29uZmlnLmNvZGUuaW5jbHVkZV9saXN0cy5qb2luKCc8YnIvPicpfTwvcD5cIlxuICAgICAgICBAaW5pdEltZG9uZSgpXG5cbiAgc2VyaWFsaXplOiAtPlxuICAgIGRlc2VyaWFsaXplcjogJ0ltZG9uZUF0b21WaWV3J1xuICAgIHBhdGg6IEBwYXRoXG4gICAgdXJpOiBAdXJpXG5cbiAgem9vbTogKGRpcikgLT5cbiAgICB6b29tYWJsZSA9IEBmaW5kICcuem9vbWFibGUnXG4gICAgcmV0dXJuIHpvb21hYmxlLmNzcyAnem9vbScsIGRpciBpZiB0eXBlb2YgZGlyIGlzICdudW1iZXInXG4gICAgem9vbVZhbCA9IG5ldyBOdW1iZXIoem9vbWFibGUuY3NzICd6b29tJylcbiAgICB6b29tVmFsID0gaWYgZGlyID09ICdpbicgdGhlbiB6b29tVmFsKy4wNSBlbHNlIHpvb21WYWwtLjA1XG4gICAgem9vbWFibGUuY3NzICd6b29tJywgem9vbVZhbFxuXG4gIEBjb250ZW50OiAocGFyYW1zKSAtPlxuICAgIE1lbnVWaWV3ID0gcmVxdWlyZSAnLi9tZW51LXZpZXcnXG4gICAgQm90dG9tVmlldyA9IHJlcXVpcmUgJy4vYm90dG9tLXZpZXcnXG4gICAgcGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG4gICAgQGRpdiB0YWJpbmRleDogLTEsIGNsYXNzOiAnaW1kb25lLWF0b20gcGFuZS1pdGVtJywgPT5cbiAgICAgIEBkaXYgb3V0bGV0OiAnJHN2ZydcbiAgICAgIEBkaXYgb3V0bGV0OiAnbG9hZGluZycsIGNsYXNzOiAnaW1kb25lLWxvYWRpbmcnLCA9PlxuICAgICAgICBAaDEgXCJTY2FubmluZyBmaWxlcyBpbiAje3BhdGguYmFzZW5hbWUocGFyYW1zLnBhdGgpfS5cIlxuICAgICAgICBAcCBcIkdldCByZWFkeSBmb3IgYXdlc29tZSEhIVwiXG4gICAgICAgIEBkaXYgb3V0bGV0OiAnbWVzc2FnZXMnLCBjbGFzczogJ2ltZG9uZS1tZXNzYWdlcydcblxuICAgICAgICBAZGl2IG91dGxldDogJ2lnbm9yZVByb21wdCcsIGNsYXNzOiAnaWdub3JlLXByb21wdCcsIHN0eWxlOiAnZGlzcGxheTogbm9uZTsnLCA9PlxuICAgICAgICAgIEBoMiBjbGFzczondGV4dC13YXJuaW5nJywgXCJIZWxwISAgRG9uJ3QgbWFrZSBtZSBjcmFzaCFcIlxuICAgICAgICAgIEBwIFwiVG9vIG1hbnkgZmlsZXMgbWFrZSBtZSBibG9hdGVkLiAgSWdub3JpbmcgZmlsZXMgYW5kIGRpcmVjdG9yaWVzIGluIC5pbWRvbmVpZ25vcmUgY2FuIG1ha2UgbWUgZmVlbCBiZXR0ZXIuXCJcbiAgICAgICAgICBAZGl2IGNsYXNzOiAnYmxvY2snLCA9PlxuICAgICAgICAgICAgQGJ1dHRvbiBjbGljazogJ29wZW5JZ25vcmUnLCBjbGFzczonaW5saW5lLWJsb2NrLXRpZ2h0IGJ0biBidG4tcHJpbWFyeScsIFwiRWRpdCAuaW1kb25laWdub3JlXCJcbiAgICAgICAgICAgIEBidXR0b24gY2xpY2s6ICdpbml0SW1kb25lJywgY2xhc3M6J2lubGluZS1ibG9jay10aWdodCBidG4gYnRuLXdhcm5pbmcnLCBcIldobyBjYXJlcywga2VlcCBnb2luZ1wiXG4gICAgICAgIEBkaXYgb3V0bGV0OiAncHJvZ3Jlc3NDb250YWluZXInLCBzdHlsZTogJ2Rpc3BsYXk6bm9uZTsnLCA9PlxuICAgICAgICAgIEBwcm9ncmVzcyBjbGFzczonaW5saW5lLWJsb2NrJywgb3V0bGV0OiAncHJvZ3Jlc3MnLCBtYXg6MTAwLCB2YWx1ZToxXG4gICAgICBAZGl2IG91dGxldDogJ2Vycm9yJywgY2xhc3M6ICdpbWRvbmUtZXJyb3InXG4gICAgICBAZGl2IG91dGxldDogJ21hc2snLCBjbGFzczogJ21hc2snLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiAnc3Bpbm5lci1tYXNrJ1xuICAgICAgICBAZGl2IGNsYXNzOiAnc3Bpbm5lci1jb250YWluZXInLCA9PlxuICAgICAgICAgIEBkaXYgY2xhc3M6ICdzcGlubmVyJywgPT5cbiAgICAgICAgICAgIEBwIG91dGxldDogJ3NwaW5uZXJNZXNzYWdlJ1xuICAgICAgICAgICAgQHAgPT5cbiAgICAgICAgICAgICAgQHNwYW4gY2xhc3M6J2xvYWRpbmcgbG9hZGluZy1zcGlubmVyLXNtYWxsIGlubGluZS1ibG9jaydcbiAgICAgIEBkaXYgb3V0bGV0OidtYWluQ29udGFpbmVyJywgY2xhc3M6J2ltZG9uZS1tYWluLWNvbnRhaW5lcicsID0+XG4gICAgICAgIEBkaXYgb3V0bGV0OiAnYXBwQ29udGFpbmVyJywgY2xhc3M6J2ltZG9uZS1hcHAtY29udGFpbmVyJywgPT5cbiAgICAgICAgICBAc3VidmlldyAnbWVudVZpZXcnLCBuZXcgTWVudVZpZXcocGFyYW1zKVxuICAgICAgICAgIEBkaXYgb3V0bGV0OiAnYm9hcmRXcmFwcGVyJywgY2xhc3M6ICdpbWRvbmUtYm9hcmQtd3JhcHBlciBuYXRpdmUta2V5LWJpbmRpbmdzJywgPT5cbiAgICAgICAgICAgICMgQGRpdiBvdXRsZXQ6ICdtZXNzYWdlcycsIFwiSEFIQUhcIlxuICAgICAgICAgICAgQGRpdiBvdXRsZXQ6ICdib2FyZCcsIGNsYXNzOiAnaW1kb25lLWJvYXJkIHpvb21hYmxlJ1xuICAgICAgICAgIEBkaXYgb3V0bGV0OiAnY29uZmlnV3JhcHBlcicsIGNsYXNzOidpbWRvbmUtY29uZmlnLXdyYXBwZXInLCA9PlxuICAgICAgICAgICAgQHN1YnZpZXcgJ2JvdHRvbVZpZXcnLCBuZXcgQm90dG9tVmlldyhwYXJhbXMpXG5cbiAgZ2V0VGl0bGU6IC0+IEB0aXRsZVxuXG4gIGdldEljb25OYW1lOiAtPiBcImNoZWNrbGlzdFwiXG5cbiAgZ2V0VVJJOiAtPiBAdXJpXG5cbiAgYWRkUmVwb0xpc3RlbmVyczogLT5cbiAgICByZXR1cm4gaWYgQGxpc3RlbmVyc0luaXRpYWxpemVkXG4gICAgcmVwbyA9IEBpbWRvbmVSZXBvXG4gICAgZW1pdHRlciA9IEBlbWl0dGVyXG4gICAgaGFuZGxlcnMgPSB7fVxuICAgIGhhbmRsZSA9IChldmVudCkgLT5cbiAgICAgIChkYXRhKSAtPiBlbWl0dGVyLmVtaXQgZXZlbnQsIGRhdGFcbiAgICBldmVudHMgPSBbJ2xpc3QubW9kaWZpZWQnLCAncHJvamVjdC5ub3QtZm91bmQnLCAncHJvamVjdC5yZW1vdmVkJywgJ3Byb2plY3QuZm91bmQnLCAncHJvZHVjdC5saW5rZWQnLFxuICAgICAgJ3Byb2R1Y3QudW5saW5rZWQnLCAndGFza3MudXBkYXRlZCcsICd0YXNrcy5zeW5jaW5nJywgJ3N5bmMuZXJyb3InLCAnaW5pdGlhbGl6ZWQnLCAnZmlsZS51cGRhdGUnLCAndGFza3MubW92ZWQnLFxuICAgICAgJ2NvbmZpZy51cGRhdGUnLCAnY29uZmlnLmxvYWRlZCcsICdlcnJvcicsICdmaWxlLnJlYWQnLCAnc3luYy5wZXJjZW50JywgJ2Nvbm5lY3Rvci5lbmFibGVkJywgJ2F1dGhlbnRpY2F0ZWQnLCAndW5hdXRoZW50aWNhdGVkJyxcbiAgICAgICdhdXRoZW50aWNhdGlvbi1mYWlsZWQnLCAndW5hdmFpbGFibGUnXVxuXG4gICAgZm9yIGV2ZW50IGluIGV2ZW50c1xuICAgICAgaGFuZGxlciA9IGhhbmRsZXJzW2V2ZW50XSA9IGhhbmRsZSBldmVudFxuICAgICAgcmVwby5vbiBldmVudCwgaGFuZGxlclxuXG4gICAgQHJlbW92ZUFsbFJlcG9MaXN0ZW5lcnMgPSAoKSAtPlxuICAgICAgcmVwby5yZW1vdmVMaXN0ZW5lcihldmVudCwgaGFuZGxlcnNbZXZlbnRdKSBmb3IgZXZlbnQgaW4gZXZlbnRzXG4gICAgQGxpc3RlbmVyc0luaXRpYWxpemVkID0gdHJ1ZVxuXG4gIGhhbmRsZUV2ZW50czogLT5cbiAgICByZXBvID0gQGltZG9uZVJlcG9cbiAgICBAZW1pdHRlciA9IEB2aWV3SW50ZXJmYWNlID0gbmV3IFBsdWdpblZpZXdJbnRlcmZhY2UgQFxuICAgIEBhZGRSZXBvTGlzdGVuZXJzKClcbiAgICBAbWVudVZpZXcuaGFuZGxlRXZlbnRzIEBlbWl0dGVyXG4gICAgQGJvdHRvbVZpZXcuaGFuZGxlRXZlbnRzIEBlbWl0dGVyXG5cbiAgICBAZW1pdHRlci5vbiAnYXV0aGVudGljYXRpb24tZmFpbGVkJywgKHtzdGF0dXMsIHJldHJpZXN9KSA9PlxuICAgICAgQGhpZGVNYXNrKCkgaWYgc3RhdHVzID09IFwidW5hdmFpbGFibGVcIiAmJiByZXRyaWVzXG4gICAgICAjY29uc29sZS5sb2cgXCJhdXRoLWZhaWxlZFwiIGlmIHN0YXR1cyA9PSBcImZhaWxlZFwiXG5cbiAgICBAZW1pdHRlci5vbiAnYXV0aGVudGljYXRlZCcsID0+IHBsdWdpbk1hbmFnZXIuaW5pdCgpXG5cbiAgICBAZW1pdHRlci5vbiAndW5hdmFpbGFibGUnLCA9PlxuICAgICAgQGhpZGVNYXNrKClcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvIFwiI3tlbnZDb25maWcubmFtZX0gaXMgdW5hdmFpbGFibGVcIiwgZGV0YWlsOiBcIkNsaWNrIGxvZ2luIHRvIHJldHJ5XCIsIGRpc21pc3NhYmxlOiB0cnVlLCBpY29uOiAnYWxlcnQnXG5cblxuICAgICMgQGVtaXR0ZXIub24gJ3Rhc2tzLnN5bmNpbmcnLCA9PiBAc2hvd01hc2sgXCJTeW5jaW5nIHdpdGggI3tlbnZDb25maWcubmFtZX0uLi5cIlxuXG4gICAgQGVtaXR0ZXIub24gJ3N5bmMuZXJyb3InLCA9PiBAaGlkZU1hc2soKVxuXG4gICAgQGVtaXR0ZXIub24gJ3Rhc2tzLnVwZGF0ZWQnLCAodGFza3MpID0+XG4gICAgICBAb25SZXBvVXBkYXRlKHRhc2tzKSAjIFRPRE86IEZvciBVSSBwZXJmb3JtYW5jZSBvbmx5IHVwZGF0ZSB0aGUgbGlzdHMgdGhhdCBoYXZlIGNoYW5nZWQuICtlbmhhbmNlbWVudCBnaDoyMDUgaWQ6ODNcblxuICAgIEBlbWl0dGVyLm9uICdpbml0aWFsaXplZCcsID0+XG4gICAgICBAYWRkUGx1Z2luKFBsdWdpbikgZm9yIFBsdWdpbiBpbiBwbHVnaW5NYW5hZ2VyLmdldEFsbCgpXG4gICAgICBAb25SZXBvVXBkYXRlIEBpbWRvbmVSZXBvLmdldFRhc2tzKClcblxuICAgIEBlbWl0dGVyLm9uICdsaXN0Lm1vZGlmaWVkJywgKGxpc3QpID0+XG4gICAgICBAb25SZXBvVXBkYXRlIEBpbWRvbmVSZXBvLmdldFRhc2tzSW5MaXN0KGxpc3QpXG5cbiAgICBAZW1pdHRlci5vbiAnZmlsZS51cGRhdGUnLCAoZmlsZSkgPT5cbiAgICAgICNjb25zb2xlLmxvZyAnZmlsZS51cGRhdGU6ICVzJywgZmlsZSAmJiBmaWxlLmdldFBhdGgoKVxuICAgICAgQG9uUmVwb1VwZGF0ZShmaWxlLmdldFRhc2tzKCkpIGlmIGZpbGUuZ2V0UGF0aCgpXG5cbiAgICBAZW1pdHRlci5vbiAndGFza3MubW92ZWQnLCAodGFza3MpID0+XG4gICAgICAjY29uc29sZS5sb2cgJ3Rhc2tzLm1vdmVkJywgdGFza3NcbiAgICAgIEBvblJlcG9VcGRhdGUodGFza3MpICMgVE9ETzogRm9yIHBlcmZvcm1hbmNlIG1heWJlIG9ubHkgdXBkYXRlIHRoZSBsaXN0cyB0aGF0IGhhdmUgY2hhbmdlZCBnaDoyNTkgaWQ6OThcblxuICAgIEBlbWl0dGVyLm9uICdjb25maWcudXBkYXRlJywgPT5cbiAgICAgICNjb25zb2xlLmxvZyAnY29uZmlnLnVwZGF0ZSdcbiAgICAgIHJlcG8ucmVmcmVzaCgpXG5cbiAgICBAZW1pdHRlci5vbiAnZXJyb3InLCAobWRNc2cpID0+IGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nIFwiT09QUyFcIiwgZGVzY3JpcHRpb246IG1kTXNnLCBkaXNtaXNzYWJsZTogdHJ1ZSwgaWNvbjogJ2FsZXJ0J1xuXG4gICAgQGVtaXR0ZXIub24gJ3Rhc2subW9kaWZpZWQnLCAodGFzaykgPT4gQG9uUmVwb1VwZGF0ZSgpXG4gICAgICAjY29uc29sZS5sb2cgXCJUYXNrIG1vZGlmaWVkLiAgU3luY2luZyB3aXRoIGltZG9uZS5pb1wiXG4gICAgICAjIEBpbWRvbmVSZXBvLnN5bmNUYXNrcyBbdGFza10sIChlcnIpID0+IEBvblJlcG9VcGRhdGUoKVxuXG4gICAgQGVtaXR0ZXIub24gJ21lbnUudG9nZ2xlJywgPT5cbiAgICAgIEBib2FyZFdyYXBwZXIudG9nZ2xlQ2xhc3MgJ3NoaWZ0J1xuXG4gICAgQGVtaXR0ZXIub24gJ2ZpbHRlcicsICh0ZXh0KSA9PlxuICAgICAgQGZpbHRlciB0ZXh0XG5cbiAgICBAZW1pdHRlci5vbiAnZmlsdGVyLmNsZWFyJywgPT5cbiAgICAgIEBib2FyZC5maW5kKCcudGFzaycpLnNob3coKVxuXG4gICAgQGVtaXR0ZXIub24gJ3Zpc2libGUub3BlbicsID0+XG4gICAgICBwYXRocyA9IHt9XG4gICAgICBmb3IgdGFzayBpbiBAdmlzaWJsZVRhc2tzKClcbiAgICAgICAgZmlsZSA9IEBpbWRvbmVSZXBvLmdldEZpbGVGb3JUYXNrKHRhc2spXG4gICAgICAgIGZ1bGxQYXRoID0gQGltZG9uZVJlcG8uZ2V0RnVsbFBhdGggZmlsZVxuICAgICAgICBwYXRoc1tmdWxsUGF0aF0gPSB0YXNrLmxpbmVcblxuICAgICAgbnVtRmlsZXMgPSBfLmtleXMocGF0aHMpLmxlbmd0aFxuICAgICAgaWYgbnVtRmlsZXMgPCA1IHx8IHdpbmRvdy5jb25maXJtIFwiaW1kb25lIGlzIGFib3V0IHRvIG9wZW4gI3tudW1GaWxlc30gZmlsZXMuICBDb250aW51ZT9cIlxuICAgICAgICBmb3IgZnBhdGgsIGxpbmUgb2YgcGF0aHNcbiAgICAgICAgICAjY29uc29sZS5sb2cgZnBhdGgsIGxpbmVcbiAgICAgICAgICBAb3BlblBhdGggZnBhdGgsIGxpbmVcblxuICAgIEBlbWl0dGVyLm9uICd0YXNrcy5kZWxldGUnLCA9PlxuICAgICAgdmlzaWJsZVRhc2tzID0gQGltZG9uZVJlcG8udmlzaWJsZVRhc2tzKClcbiAgICAgIHJldHVybiB1bmxlc3MgdmlzaWJsZVRhc2tzXG4gICAgICByZXR1cm4gdW5sZXNzIHdpbmRvdy5jb25maXJtIFwiaW1kb25lIGlzIGFib3V0IHRvIGRlbGV0ZSAje3Zpc2libGVUYXNrcy5sZW5ndGh9IHRhc2tzLiAgQ29udGludWU/XCJcbiAgICAgIEBzaG93TWFzayBcImRlbGV0aW5nICN7dmlzaWJsZVRhc2tzLmxlbmd0aH0gdGFza3NcIlxuICAgICAgQGltZG9uZVJlcG8uZGVsZXRlVmlzaWJsZVRhc2tzIChlcnIpIC0+XG4gICAgICAgIEBoaWRlTWFzaygpXG5cbiAgICBAZW1pdHRlci5vbiAncmVhZG1lLm9wZW4nLCA9PlxuICAgICAgZmlsZSA9IEBpbWRvbmVSZXBvLmdldFJlYWRtZSgpXG4gICAgICB1bmxlc3MgZmlsZVxuICAgICAgICBAZW1pdHRlci5lbWl0ICdlcnJvcicsICdTb3JyeSBubyByZWFkbWUgOignXG4gICAgICAgIHJldHVyblxuICAgICAgZWxzZVxuICAgICAgICBAb3BlblBhdGggQGltZG9uZVJlcG8uZ2V0RnVsbFBhdGgoZmlsZSlcblxuICAgIEBlbWl0dGVyLm9uICdjb25maWcuY2xvc2UnLCA9PlxuICAgICAgQGJvYXJkV3JhcHBlci5yZW1vdmVDbGFzcyAnc2hpZnQtYm90dG9tJ1xuICAgICAgQGJvYXJkV3JhcHBlci5jc3MgJ2JvdHRvbScsICcnXG4gICAgICBAY2xlYXJTZWxlY3Rpb24oKVxuXG4gICAgQGVtaXR0ZXIub24gJ2NvbmZpZy5vcGVuJywgPT5cbiAgICAgIEBib2FyZFdyYXBwZXIuYWRkQ2xhc3MgJ3NoaWZ0LWJvdHRvbSdcblxuICAgIEBlbWl0dGVyLm9uICdyZXNpemUuY2hhbmdlJywgKGhlaWdodCkgPT5cbiAgICAgIEBib2FyZFdyYXBwZXIuY3NzKCdib3R0b20nLCBoZWlnaHQgKyAncHgnKVxuXG4gICAgQGVtaXR0ZXIub24gJ3pvb20nLCAoZGlyKSA9PiBAem9vbSBkaXJcblxuICAgIEBvbiAnY2xpY2snLCAnLnNvdXJjZS1saW5rJywgIChlKSA9PlxuICAgICAgbGluayA9IGUudGFyZ2V0XG4gICAgICBAb3BlblBhdGggbGluay5kYXRhc2V0LnVyaSwgbGluay5kYXRhc2V0LmxpbmVcblxuICAgICAgaWYgY29uZmlnLmdldFNldHRpbmdzKCkuc2hvd05vdGlmaWNhdGlvbnMgJiYgISQobGluaykuaGFzQ2xhc3MoJ2luZm8tbGluaycpXG4gICAgICAgIHRhc2tJZCA9ICQobGluaykuY2xvc2VzdCgnLnRhc2snKS5hdHRyICdpZCdcbiAgICAgICAgdGFzayA9IEBpbWRvbmVSZXBvLmdldFRhc2sgdGFza0lkXG4gICAgICAgIGZpbGUgPSBAaW1kb25lUmVwby5nZXRGaWxlRm9yVGFzayh0YXNrKVxuICAgICAgICBmdWxsUGF0aCA9IEBpbWRvbmVSZXBvLmdldEZ1bGxQYXRoIGZpbGVcbiAgICAgICAgbGluZSA9IHRhc2subGluZVxuICAgICAgICBuZXdMaW5rID0gJChsaW5rLmNsb25lTm9kZSh0cnVlKSk7XG4gICAgICAgIG5ld0xpbmsuYWRkQ2xhc3MgJ2luZm8tbGluaydcbiAgICAgICAgZGVzY3JpcHRpb24gPSBcIiN7dGFzay50ZXh0fVxcblxcbiN7bmV3TGlua1swXS5vdXRlckhUTUx9XCJcblxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyB0YXNrLmxpc3QsIGRlc2NyaXB0aW9uOiBkZXNjcmlwdGlvbiwgZGlzbWlzc2FibGU6IHRydWUsIGljb246ICdjaGVjaydcblxuICAgIEBvbiAnY2xpY2snLCAnLmxpc3QtbmFtZScsIChlKSA9PlxuICAgICAgbmFtZSA9IGUudGFyZ2V0LmRhdGFzZXQubGlzdFxuICAgICAgQGJvdHRvbVZpZXcuZWRpdExpc3ROYW1lKG5hbWUpXG5cbiAgICBAb24gJ2NsaWNrJywgJy5kZWxldGUtbGlzdCcsIChlKSA9PlxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB0YXJnZXQgPSBlLnRhcmdldFxuICAgICAgbmFtZSA9IHRhcmdldC5kYXRhc2V0Lmxpc3QgfHwgdGFyZ2V0LnBhcmVudEVsZW1lbnQuZGF0YXNldC5saXN0XG4gICAgICByZXBvLnJlbW92ZUxpc3QobmFtZSlcblxuICAgIEBvbiAnY2xpY2snLCAnLmZpbHRlci1saW5rJywgKGUpID0+XG4gICAgICB0YXJnZXQgPSBlLnRhcmdldFxuICAgICAgZmlsdGVyID0gdGFyZ2V0LmRhdGFzZXQuZmlsdGVyIHx8IHRhcmdldC5wYXJlbnRFbGVtZW50LmRhdGFzZXQuZmlsdGVyXG4gICAgICBAc2V0RmlsdGVyIGZpbHRlclxuXG4gICAgQG9uICdjbGljaycsICdbaHJlZl49XCIjZmlsdGVyL1wiXScsIChlKSA9PlxuICAgICAgdGFyZ2V0ID0gZS50YXJnZXRcbiAgICAgIHRhcmdldCA9IHRhcmdldC5jbG9zZXN0KCdhJykgdW5sZXNzICh0YXJnZXQubm9kZU5hbWUgPT0gJ0EnKVxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKVxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICBmaWx0ZXJBcnkgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdocmVmJykuc3BsaXQoJy8nKTtcbiAgICAgIGZpbHRlckFyeS5zaGlmdCgpXG4gICAgICBmaWx0ZXIgPSBmaWx0ZXJBcnkuam9pbiAnLycgO1xuICAgICAgQHNldEZpbHRlciBmaWx0ZXJcblxuICAgIEBvbiAnY2hhbmdlJywgJ3VsLmNoZWNrbGlzdD5saT5pbnB1dFt0eXBlPWNoZWNrYm94XScsIChlKSA9PlxuICAgICAgdGFyZ2V0ID0gZS50YXJnZXRcbiAgICAgICR0YXNrID0gdGFyZ2V0LmNsb3Nlc3QoJy50YXNrJylcbiAgICAgIHRhc2tJZCA9ICR0YXNrLmlkXG4gICAgICBpdGVtcyA9ICR0YXNrLnF1ZXJ5U2VsZWN0b3JBbGwoJy50YXNrLWRlc2NyaXB0aW9uIC5jaGVja2xpc3QtaXRlbScpXG4gICAgICBbXS5mb3JFYWNoLmNhbGwgaXRlbXMsIChlbCkgLT5cbiAgICAgICAgaWYgKGVsLmNoZWNrZWQpIHRoZW4gZWwuc2V0QXR0cmlidXRlKCdjaGVja2VkJywgdHJ1ZSkgZWxzZSBlbC5yZW1vdmVBdHRyaWJ1dGUoJ2NoZWNrZWQnKVxuICAgICAgcmVwby5tb2RpZnlUYXNrRnJvbUh0bWwgcmVwby5nZXRUYXNrKHRhc2tJZCksICR0YXNrLnF1ZXJ5U2VsZWN0b3IoJy50YXNrLXRleHQnKS5pbm5lckhUTUxcblxuICAgIHBsdWdpbk1hbmFnZXIuZW1pdHRlci5vbiAncGx1Z2luLmFkZGVkJywgKFBsdWdpbikgPT5cbiAgICAgIGlmIChyZXBvLmdldENvbmZpZygpKVxuICAgICAgICBAYWRkUGx1Z2luKFBsdWdpbilcbiAgICAgIGVsc2VcbiAgICAgICAgQGVtaXR0ZXIub24gJ2luaXRpYWxpemVkJywgPT4gQGFkZFBsdWdpbihQbHVnaW4pXG5cbiAgICBwbHVnaW5NYW5hZ2VyLmVtaXR0ZXIub24gJ3BsdWdpbi5yZW1vdmVkJywgKFBsdWdpbikgPT4gQHJlbW92ZVBsdWdpbiBQbHVnaW5cblxuICAgIEBlbWl0dGVyLm9uICdjb25uZWN0b3IuZGlzYWJsZWQnLCAoY29ubmVjdG9yKSA9PiBAcmVtb3ZlUGx1Z2luQnlQcm92aWRlciBjb25uZWN0b3IubmFtZVxuICAgIEBlbWl0dGVyLm9uICdjb25uZWN0b3IuZW5hYmxlZCcsIChjb25uZWN0b3IpID0+IEBhZGRQbHVnaW5CeVByb3ZpZGVyIGNvbm5lY3Rvci5uYW1lXG4gICAgQGVtaXR0ZXIub24gJ3Byb2R1Y3QudW5saW5rZWQnLCAocHJvZHVjdCkgPT4gQHJlbW92ZVBsdWdpbkJ5UHJvdmlkZXIgcHJvZHVjdC5uYW1lXG4gICAgQGVtaXR0ZXIub24gJ2Nvbm5lY3Rvci5jaGFuZ2VkJywgKHByb2R1Y3QpID0+XG4gICAgICBAYWRkUGx1Z2luQnlQcm92aWRlciBwcm9kdWN0LmNvbm5lY3Rvci5uYW1lXG4gICAgICBmb3IgbmFtZSwgcGx1Z2luIG9mIEBwbHVnaW5zXG4gICAgICAgIHBsdWdpbi5zZXRDb25uZWN0b3IgcHJvZHVjdC5jb25uZWN0b3IgaWYgcGx1Z2luLmNvbnN0cnVjdG9yLnByb3ZpZGVyID09IHByb2R1Y3QubmFtZVxuXG4gICAgQGVtaXR0ZXIub24gJ2xvZ29mZicsID0+IHBsdWdpbk1hbmFnZXIucmVtb3ZlRGVmYXVsdFBsdWdpbnMoKVxuICAgIEBlbWl0dGVyLm9uICdwcm9qZWN0LnJlbW92ZWQnLCA9PiBwbHVnaW5NYW5hZ2VyLnJlbW92ZURlZmF1bHRQbHVnaW5zKClcblxuXG4gIGFkZFBsdWdpbkJ1dHRvbnM6IC0+XG4gICAgQGFkZFBsdWdpblRhc2tCdXR0b25zKClcbiAgICBAYWRkUGx1Z2luUHJvamVjdEJ1dHRvbnMoKVxuXG4gIGFkZFBsdWdpblRhc2tCdXR0b25zOiAtPlxuICAgIEBib2FyZC5maW5kKCcuaW1kb25lLXRhc2stcGx1Z2lucycpLmVtcHR5KClcbiAgICByZXR1cm4gdW5sZXNzIEBoYXNQbHVnaW5zKClcbiAgICBwbHVnaW5zID0gQHBsdWdpbnNcbiAgICBAYm9hcmQuZmluZCgnLnRhc2snKS5lYWNoIC0+XG4gICAgICAkdGFzayA9ICQodGhpcylcbiAgICAgICR0YXNrUGx1Z2lucyA9ICR0YXNrLmZpbmQgJy5pbWRvbmUtdGFzay1wbHVnaW5zJ1xuICAgICAgaWQgPSAkdGFzay5hdHRyKCdpZCcpXG4gICAgICBmb3IgbmFtZSwgcGx1Z2luIG9mIHBsdWdpbnNcbiAgICAgICAgaWYgdHlwZW9mIHBsdWdpbi50YXNrQnV0dG9uIGlzICdmdW5jdGlvbidcbiAgICAgICAgICAkYnV0dG9uID0gcGx1Z2luLnRhc2tCdXR0b24oaWQpXG4gICAgICAgICAgaWYgJGJ1dHRvblxuICAgICAgICAgICAgaWYgJGJ1dHRvbi5jbGFzc0xpc3RcbiAgICAgICAgICAgICAgJGJ1dHRvbi5jbGFzc0xpc3QuYWRkICd0YXNrLXBsdWdpbi1idXR0b24nXG4gICAgICAgICAgICBlbHNlICRidXR0b24uYWRkQ2xhc3MgJ3Rhc2stcGx1Z2luLWJ1dHRvbidcbiAgICAgICAgICAgICR0YXNrUGx1Z2lucy5hcHBlbmQgJGJ1dHRvblxuXG4gIGFkZFBsdWdpblByb2plY3RCdXR0b25zOiAtPiBAbWVudVZpZXcuYWRkUGx1Z2luUHJvamVjdEJ1dHRvbnMgQHBsdWdpbnNcblxuICBhZGRQbHVnaW5WaWV3OiAocGx1Z2luKSAtPlxuICAgIHJldHVybiB1bmxlc3MgcGx1Z2luLmdldFZpZXdcbiAgICBAYm90dG9tVmlldy5hZGRQbHVnaW4gcGx1Z2luXG5cbiAgaW5pdFBsdWdpblZpZXc6IChwbHVnaW4pIC0+XG4gICAgQGFkZFBsdWdpbkJ1dHRvbnMoKVxuICAgIEBhZGRQbHVnaW5WaWV3IHBsdWdpblxuXG4gIGFkZFBsdWdpbjogKFBsdWdpbikgLT5cbiAgICByZXR1cm4gdW5sZXNzIFBsdWdpblxuICAgIEBpbWRvbmVSZXBvLmdldFByb2R1Y3QgUGx1Z2luLnByb3ZpZGVyLCAoZXJyLCBwcm9kdWN0KSA9PlxuICAgICAgcmV0dXJuIGlmIGVyciB8fCAocHJvZHVjdCAmJiAhcHJvZHVjdC5pc0VuYWJsZWQoKSlcbiAgICAgIGNvbm5lY3RvciA9IHByb2R1Y3QgJiYgcHJvZHVjdC5jb25uZWN0b3JcbiAgICAgIGlmIEBwbHVnaW5zW1BsdWdpbi5wbHVnaW5OYW1lXVxuICAgICAgICBAYWRkUGx1Z2luQnV0dG9ucygpXG4gICAgICBlbHNlXG4gICAgICAgIHBsdWdpbiA9IG5ldyBQbHVnaW4gQGltZG9uZVJlcG8sIEB2aWV3SW50ZXJmYWNlLCBjb25uZWN0b3JcbiAgICAgICAgQHBsdWdpbnNbUGx1Z2luLnBsdWdpbk5hbWVdID0gcGx1Z2luXG4gICAgICAgIEBpbWRvbmVSZXBvLmFkZFBsdWdpbiBwbHVnaW5cbiAgICAgICAgaWYgcGx1Z2luIGluc3RhbmNlb2YgRW1pdHRlclxuICAgICAgICAgIGlmIHBsdWdpbi5pc1JlYWR5KClcbiAgICAgICAgICAgIEBpbml0UGx1Z2luVmlldyBwbHVnaW5cbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBwbHVnaW4ub24gJ3JlYWR5JywgPT4gQGluaXRQbHVnaW5WaWV3IHBsdWdpblxuICAgICAgICBlbHNlXG4gICAgICAgICAgQGluaXRQbHVnaW5WaWV3IHBsdWdpblxuXG4gIGFkZFBsdWdpbkJ5UHJvdmlkZXI6IChwcm92aWRlcikgLT5cbiAgICBAYWRkUGx1Z2luIHBsdWdpbk1hbmFnZXIuZ2V0QnlQcm92aWRlcihwcm92aWRlcilcblxuICByZW1vdmVQbHVnaW46IChQbHVnaW4pIC0+XG4gICAgcmV0dXJuIHVubGVzcyBQbHVnaW5cbiAgICBwbHVnaW4gPSBAcGx1Z2luc1tQbHVnaW4ucGx1Z2luTmFtZV1cbiAgICBAaW1kb25lUmVwby5yZW1vdmVQbHVnaW4gcGx1Z2luXG4gICAgQGJvdHRvbVZpZXcucmVtb3ZlUGx1Z2luIHBsdWdpbiBpZiBwbHVnaW4gJiYgcGx1Z2luLmdldFZpZXdcbiAgICBkZWxldGUgQHBsdWdpbnNbUGx1Z2luLnBsdWdpbk5hbWVdXG4gICAgQGFkZFBsdWdpbkJ1dHRvbnMoKVxuXG4gIHJlbW92ZVBsdWdpbkJ5UHJvdmlkZXI6IChwcm92aWRlcikgLT5cbiAgICBAcmVtb3ZlUGx1Z2luIHBsdWdpbk1hbmFnZXIuZ2V0QnlQcm92aWRlcihwcm92aWRlcilcblxuICBoYXNQbHVnaW5zOiAtPlxuICAgIE9iamVjdC5rZXlzKEBwbHVnaW5zKS5sZW5ndGggPiAwXG5cbiAgc2V0RmlsdGVyOiAodGV4dCkgLT5cbiAgICBAbWVudVZpZXcuc2V0RmlsdGVyIHRleHRcbiAgICBAbWVudVZpZXcub3Blbk1lbnUoKVxuICAgIEBib2FyZFdyYXBwZXIuYWRkQ2xhc3MgJ3NoaWZ0J1xuXG4gIGdldEZpbHRlcjogLT4gQG1lbnVWaWV3LmdldEZpbHRlcigpXG5cbiAgZmlsdGVyOiAodGV4dCkgLT5cbiAgICB0ZXh0ID0gQGdldEZpbHRlcigpIHVubGVzcyB0ZXh0XG4gICAgQGxhc3RGaWx0ZXIgPSB0ZXh0XG4gICAgaWYgdGV4dCA9PSAnJ1xuICAgICAgQGJvYXJkLmZpbmQoJy50YXNrJykuc2hvdygpXG4gICAgZWxzZVxuICAgICAgQGJvYXJkLmZpbmQoJy50YXNrJykuaGlkZSgpXG4gICAgICBAZmlsdGVyQnlQYXRoIHRleHRcbiAgICAgIEBmaWx0ZXJCeUNvbnRlbnQgdGV4dFxuICAgIEBlbWl0dGVyLmVtaXQgJ2JvYXJkLnVwZGF0ZSdcblxuICBmaWx0ZXJCeVBhdGg6ICh0ZXh0KSAtPiBAYm9hcmQuZmluZCh1dGlsLmZvcm1hdCgnLnRhc2s6YXR0ckNvbnRhaW5zUmVnZXgoZGF0YS1wYXRoLCVzKScsIHRleHQpKS5lYWNoIC0+ICQodGhpcykuc2hvdygpLmF0dHIoJ2lkJylcblxuICBmaWx0ZXJCeUNvbnRlbnQ6ICh0ZXh0KSAtPiBAYm9hcmQuZmluZCh1dGlsLmZvcm1hdCgnLnRhc2stZnVsbC10ZXh0OmNvbnRhaW5zUmVnZXgoXCIlc1wiKScsIHRleHQpKS5lYWNoIC0+ICQodGhpcykuY2xvc2VzdCgnLnRhc2snKS5zaG93KCkuYXR0cignaWQnKVxuXG4gIHZpc2libGVUYXNrczogKGxpc3ROYW1lKSAtPlxuICAgIHJldHVybiBbXSB1bmxlc3MgQGltZG9uZVJlcG9cbiAgICBAaW1kb25lUmVwby52aXNpYmxlVGFza3MgbGlzdE5hbWVcblxuICBpbml0SW1kb25lOiAoKSAtPlxuICAgIGlmIEBpbWRvbmVSZXBvLmluaXRpYWxpemVkXG4gICAgICBAb25SZXBvVXBkYXRlKEBpbWRvbmVSZXBvLmdldFRhc2tzKCkpXG4gICAgICBAbWVudVZpZXcudXBkYXRlTWVudSgpXG4gICAgICBAaW1kb25lUmVwby5pbml0UHJvZHVjdHMoKVxuICAgICAgcmV0dXJuXG4gICAgaWYgQG51bUZpbGVzID4gMTAwMFxuICAgICAgQGlnbm9yZVByb21wdC5oaWRlKClcbiAgICAgIEBwcm9ncmVzc0NvbnRhaW5lci5zaG93KClcbiAgICAgIEBlbWl0dGVyLm9uICdmaWxlLnJlYWQnLCAoZGF0YSkgPT5cbiAgICAgICAgY29tcGxldGUgPSBNYXRoLmNlaWwgKGRhdGEuY29tcGxldGVkL0BudW1GaWxlcykqMTAwXG4gICAgICAgIEBwcm9ncmVzcy5hdHRyICd2YWx1ZScsIGNvbXBsZXRlXG4gICAgQGltZG9uZVJlcG8uaW5pdCgpXG5cbiAgb3Blbklnbm9yZTogKCkgLT5cbiAgICBpZ25vcmVQYXRoID0gcGF0aC5qb2luKEBpbWRvbmVSZXBvLnBhdGgsICcuaW1kb25laWdub3JlJylcbiAgICBpdGVtID0gQFxuICAgIGF0b20ud29ya3NwYWNlLm9wZW4oaWdub3JlUGF0aCwgc3BsaXQ6ICdsZWZ0JykudGhlbiA9PlxuICAgICAgaXRlbS5kZXN0cm95KClcblxuICBvblJlcG9VcGRhdGU6ICh0YXNrcykgLT5cbiAgICAjIEJBQ0tMT0c6IFRoaXMgc2hvdWxkIGJlIHF1ZXVlZCBzbyB0d28gdXBkYXRlcyBkb24ndCBjb2xpZGUgZ2g6MjQxIGlkOjkwXG4gICAgQHVwZGF0ZUJvYXJkKHRhc2tzKVxuICAgIEBib2FyZFdyYXBwZXIuY3NzICdib3R0b20nLCAwXG4gICAgQGJvdHRvbVZpZXcuYXR0ciAnc3R5bGUnLCAnJ1xuICAgIEBsb2FkaW5nLmhpZGUoKVxuICAgIEBtYWluQ29udGFpbmVyLnNob3coKVxuICAgIEBoaWRlTWFzaygpXG5cbiAgc2hvd01hc2s6IChtc2cpLT5cbiAgICBAc3Bpbm5lck1lc3NhZ2UuaHRtbCBtc2cgaWYgbXNnXG4gICAgQG1hc2suc2hvdygpXG5cbiAgaGlkZU1hc2s6IC0+IEBtYXNrLmhpZGUoKSBpZiBAbWFza1xuXG4gIGdlbkZpbHRlckxpbms6IChvcHRzKSAtPlxuICAgIGxpbmtQcmVmaXggPSBpZiBvcHRzLmRpc3BsYXlQcmVmaXggdGhlbiBvcHRzLmxpbmtQcmVmaXggZWxzZSBcIlwiXG4gICAgJGxpbmsgPSAkZWwuYSBocmVmOlwiI1wiLCB0aXRsZTogXCJqdXN0IHNob3cgbWUgdGFza3Mgd2l0aCAje29wdHMubGlua1RleHR9XCIsIGNsYXNzOiBcImZpbHRlci1saW5rXCIsXG4gICAgICAkZWwuc3BhbiBjbGFzczogb3B0cy5saW5rQ2xhc3MsIFwiI3tsaW5rUHJlZml4fSN7b3B0cy5saW5rVGV4dH1cIlxuICAgICRsaW5rLmRhdGFzZXQuZmlsdGVyID0gb3B0cy5saW5rUHJlZml4LnJlcGxhY2UoIFwiK1wiLCBcIlxcXFwrXCIgKStvcHRzLmxpbmtUZXh0XG4gICAgJGxpbmtcbiAgIyBUT0RPOiBVc2Ugd2ViIGNvbXBvbmVudHMgdG8gbWFrZSB0aGUgVUkgbW9yZSB0ZXN0YWJsZSBhbmQgcG9ydGFibGUuICtlbmhhbmNlbWVudCBnaDoyOTcgaWQ6NzVcbiAgIyAtIENyZWF0ZSBhIHRhc2sgY29tcG9uZW50XG4gICMgLSBXcml0ZSB0YXNrIGNvbXBvbmVudCB0ZXN0c1xuICAjIC0gVXNlIHRoZSBuZXcgY29tcG9uZW50IGluIHRoZSBVSVxuICBnZXRUYXNrOiAodGFzaykgPT5cbiAgICBzZWxmID0gQDtcbiAgICByZXBvID0gQGltZG9uZVJlcG9cbiAgICBjb250ZXh0cyA9IHRhc2suZ2V0Q29udGV4dCgpXG4gICAgdGFncyA9IHRhc2suZ2V0VGFncygpXG4gICAgZGF0ZUR1ZSA9IHRhc2suZ2V0RGF0ZUR1ZSgpXG4gICAgZGF0ZUNyZWF0ZWQgPSB0YXNrLmdldERhdGVDcmVhdGVkKClcbiAgICBkYXRlQ29tcGxldGVkID0gdGFzay5nZXREYXRlQ29tcGxldGVkKClcbiAgICAkdGFza1RleHQgPSAkZWwuZGl2IGNsYXNzOiAndGFzay10ZXh0IG5hdGl2ZS1rZXktYmluZGluZ3MnXG4gICAgJGZpbHRlcnMgPSAkZWwuZGl2KClcbiAgICAkdGFza01ldGFUYWJsZSA9ICRlbC50YWJsZSgpXG4gICAgJHRhc2tNZXRhID0gJGVsLmRpdiBjbGFzczogJ3Rhc2stbWV0YScsICR0YXNrTWV0YVRhYmxlXG4gICAgb3B0cyA9ICQuZXh0ZW5kIHt9LCB7c3RyaXBNZXRhOiB0cnVlLCBzdHJpcERhdGVzOiB0cnVlLCBzYW5pdGl6ZTogdHJ1ZX0sIHJlcG8uZ2V0Q29uZmlnKCkubWFya2VkXG4gICAgdGFza0h0bWwgPSB0YXNrLmdldEh0bWwob3B0cylcbiAgICBzaG93VGFnc0lubGluZSA9IGNvbmZpZy5nZXRTZXR0aW5ncygpLnNob3dUYWdzSW5saW5lXG4gICAgaWYgc2hvd1RhZ3NJbmxpbmVcbiAgICAgIGlmIGNvbnRleHRzXG4gICAgICAgIGZvciBjb250ZXh0LCBpIGluIGNvbnRleHRzXG4gICAgICAgICAgZG8gKGNvbnRleHQsIGkpID0+XG4gICAgICAgICAgICAkbGluayA9IEBnZW5GaWx0ZXJMaW5rIGxpbmtQcmVmaXg6IFwiQFwiLCBsaW5rVGV4dDogY29udGV4dCwgbGlua0NsYXNzOiBcInRhc2stY29udGV4dFwiLCBkaXNwbGF5UHJlZml4OiB0cnVlXG4gICAgICAgICAgICB0YXNrSHRtbCA9IHRhc2tIdG1sLnJlcGxhY2UoIFwiQCN7Y29udGV4dH1cIiwgJGVsLmRpdigkbGluaykuaW5uZXJIVE1MIClcblxuICAgICAgaWYgdGFnc1xuICAgICAgICBmb3IgdGFnLCBpIGluIHRhZ3NcbiAgICAgICAgICBkbyAodGFnLCBpKSA9PlxuICAgICAgICAgICAgJGxpbmsgPSBAZ2VuRmlsdGVyTGluayBsaW5rUHJlZml4OiBcIitcIiwgbGlua1RleHQ6IHRhZywgbGlua0NsYXNzOiBcInRhc2stdGFnc1wiLCBkaXNwbGF5UHJlZml4OiB0cnVlXG4gICAgICAgICAgICB0YXNrSHRtbCA9IHRhc2tIdG1sLnJlcGxhY2UoIFwiKyN7dGFnfVwiLCAkZWwuZGl2KCRsaW5rKS5pbm5lckhUTUwgKVxuICAgIGVsc2VcbiAgICAgIHRhc2tIdG1sID0gdGFzay5nZXRIdG1sICQuZXh0ZW5kKHtzdHJpcFRhZ3M6IHRydWUsIHN0cmlwQ29udGV4dDogdHJ1ZX0sIG9wdHMpXG4gICAgICBpZiBjb250ZXh0c1xuICAgICAgICAkZGl2ID0gJGVsLmRpdigpXG4gICAgICAgICRmaWx0ZXJzLmFwcGVuZENoaWxkICRkaXZcbiAgICAgICAgZm9yIGNvbnRleHQsIGkgaW4gY29udGV4dHNcbiAgICAgICAgICBkbyAoY29udGV4dCwgaSkgPT5cbiAgICAgICAgICAgICRkaXYuYXBwZW5kQ2hpbGQoc2VsZi5nZW5GaWx0ZXJMaW5rIGxpbmtQcmVmaXg6IFwiQFwiLCBsaW5rVGV4dDogY29udGV4dCwgbGlua0NsYXNzOiBcInRhc2stY29udGV4dFwiKVxuICAgICAgICAgICAgJGRpdi5hcHBlbmRDaGlsZCgkZWwuc3BhbiBcIiwgXCIpIGlmIChpIDwgY29udGV4dHMubGVuZ3RoLTEpXG4gICAgICBpZiB0YWdzXG4gICAgICAgICRkaXYgPSAkZWwuZGl2KClcbiAgICAgICAgJGZpbHRlcnMuYXBwZW5kQ2hpbGQgJGRpdlxuICAgICAgICBmb3IgdGFnLCBpIGluIHRhZ3NcbiAgICAgICAgICBkbyAodGFnLCBpKSA9PlxuICAgICAgICAgICAgJGRpdi5hcHBlbmRDaGlsZChzZWxmLmdlbkZpbHRlckxpbmsgbGlua1ByZWZpeDogXCIrXCIsIGxpbmtUZXh0OiB0YWcsIGxpbmtDbGFzczogXCJ0YXNrLXRhZ3NcIilcbiAgICAgICAgICAgICRkaXYuYXBwZW5kQ2hpbGQoJGVsLnNwYW4gXCIsIFwiKSBpZiAoaSA8IHRhZ3MubGVuZ3RoLTEpXG5cbiAgICAkdGFza1RleHQuaW5uZXJIVE1MID0gdGFza0h0bWxcblxuICAgIGlmIGRhdGVDcmVhdGVkXG4gICAgICAkdHIgPSAkZWwudHIgY2xhc3M6J21ldGEtZGF0YS1yb3cnLFxuICAgICAgICAkZWwudGQgXCJjcmVhdGVkXCJcbiAgICAgICAgJGVsLnRkIGRhdGVDcmVhdGVkXG4gICAgICAgICRlbC50ZCBjbGFzczogJ21ldGEtZmlsdGVyJyxcbiAgICAgICAgICAkZWwuYSBocmVmOlwiI1wiLCB0aXRsZTogXCJmaWx0ZXIgYnkgY3JlYXRlZCBvbiAje2RhdGVDcmVhdGVkfVwiLCBjbGFzczogXCJmaWx0ZXItbGlua1wiLCBcImRhdGEtZmlsdGVyXCI6IFwiKHhcXFxcc1xcXFxkezR9LVxcXFxkezJ9LVxcXFxkezJ9XFxcXHMpPyN7ZGF0ZUNyZWF0ZWR9XCIsXG4gICAgICAgICAgICAkZWwuc3BhbiBjbGFzczpcImljb24gaWNvbi1saWdodC1idWxiXCJcbiAgICAgICR0YXNrTWV0YVRhYmxlLmFwcGVuZENoaWxkICR0clxuICAgIGlmIGRhdGVDb21wbGV0ZWRcbiAgICAgICR0ciA9ICRlbC50ciBjbGFzczonbWV0YS1kYXRhLXJvdycsXG4gICAgICAgICRlbC50ZCBcImNvbXBsZXRlZFwiXG4gICAgICAgICRlbC50ZCBkYXRlQ29tcGxldGVkXG4gICAgICAgICRlbC50ZCBjbGFzczogJ21ldGEtZmlsdGVyJyxcbiAgICAgICAgICAkZWwuYSBocmVmOlwiI1wiLCB0aXRsZTogXCJmaWx0ZXIgYnkgY29tcGxldGVkIG9uICN7ZGF0ZUNvbXBsZXRlZH1cIiwgY2xhc3M6IFwiZmlsdGVyLWxpbmtcIiwgXCJkYXRhLWZpbHRlclwiOiBcInggI3tkYXRlQ29tcGxldGVkfVwiLFxuICAgICAgICAgICAgJGVsLnNwYW4gY2xhc3M6XCJpY29uIGljb24tbGlnaHQtYnVsYlwiXG4gICAgICAkdGFza01ldGFUYWJsZS5hcHBlbmRDaGlsZCAkdHJcblxuICAgIGZvciBkYXRhIGluIHRhc2suZ2V0TWV0YURhdGFXaXRoTGlua3MocmVwby5nZXRDb25maWcoKSlcbiAgICAgIGRvIChkYXRhKSA9PlxuICAgICAgICAkaWNvbnMgPSAkZWwudGQoKVxuICAgICAgICBpZiBkYXRhLmxpbmtcbiAgICAgICAgICAkbGluayA9ICRlbC5hIGhyZWY6IGRhdGEubGluay51cmwsIHRpdGxlOiBkYXRhLmxpbmsudGl0bGUsXG4gICAgICAgICAgICAkZWwuc3BhbiBjbGFzczpcImljb24gI3tkYXRhLmxpbmsuaWNvbiB8fCAnaWNvbi1saW5rLWV4dGVybmFsJ31cIlxuICAgICAgICAgICRpY29ucy5hcHBlbmRDaGlsZCAkbGlua1xuICAgICAgICAkZmlsdGVyTGluayA9ICRlbC5hIGhyZWY6XCIjXCIsIHRpdGxlOiBcImp1c3Qgc2hvdyBtZSB0YXNrcyB3aXRoICN7ZGF0YS5rZXl9OiN7ZGF0YS52YWx1ZX1cIiwgY2xhc3M6IFwiZmlsdGVyLWxpbmtcIiwgXCJkYXRhLWZpbHRlclwiOiBcIiN7ZGF0YS5rZXl9OiN7ZGF0YS52YWx1ZX1cIixcbiAgICAgICAgICAkZWwuc3BhbiBjbGFzczpcImljb24gaWNvbi1saWdodC1idWxiXCJcbiAgICAgICAgJGljb25zLmFwcGVuZENoaWxkICRmaWx0ZXJMaW5rXG5cbiAgICAgICAgJHRyID0gJGVsLnRyIGNsYXNzOidtZXRhLWRhdGEtcm93JyxcbiAgICAgICAgICAkZWwudGQgZGF0YS5rZXlcbiAgICAgICAgICAkZWwudGQgZGF0YS52YWx1ZVxuICAgICAgICAgICRpY29uc1xuICAgICAgICAkdGFza01ldGFUYWJsZS5hcHBlbmRDaGlsZCAkdHJcblxuICAgICRlbC5saSBjbGFzczogJ3Rhc2sgd2VsbCBuYXRpdmUta2V5LWJpbmRpbmdzJywgaWQ6IFwiI3t0YXNrLmlkfVwiLCB0YWJpbmRleDogLTEsIFwiZGF0YS1wYXRoXCI6IHRhc2suc291cmNlLnBhdGgsIFwiZGF0YS1saW5lXCI6IHRhc2subGluZSxcbiAgICAgICRlbC5kaXYgY2xhc3M6ICdpbWRvbmUtdGFzay1wbHVnaW5zJ1xuICAgICAgJGVsLmRpdiBjbGFzczogJ3Rhc2stZnVsbC10ZXh0IGhpZGRlbicsIHRhc2suZ2V0VGV4dEFuZERlc2NyaXB0aW9uKClcbiAgICAgICR0YXNrVGV4dFxuICAgICAgJGZpbHRlcnNcbiAgICAgICR0YXNrTWV0YVxuICAgICAgJGVsLmRpdiBjbGFzczogJ3Rhc2stc291cmNlJyxcbiAgICAgICAgJGVsLmEgaHJlZjogJyMnLCBjbGFzczogJ3NvdXJjZS1saW5rJywgdGl0bGU6ICd0YWtlIG1lIHRvIHRoZSBzb3VyY2UnLCAnZGF0YS11cmknOiBcIiN7cmVwby5nZXRGdWxsUGF0aCh0YXNrLnNvdXJjZS5wYXRoKX1cIiwgJ2RhdGEtbGluZSc6IHRhc2subGluZSwgXCIje3Rhc2suc291cmNlLnBhdGggKyAnOicgKyB0YXNrLmxpbmV9XCJcbiAgICAgICAgJGVsLnNwYW4gJyB8ICdcbiAgICAgICAgJGVsLmEgaHJlZjpcIiNcIiwgdGl0bGU6IFwianVzdCBzaG93IG1lIHRhc2tzIGluICN7dGFzay5zb3VyY2UucGF0aH1cIiwgY2xhc3M6IFwiZmlsdGVyLWxpbmtcIiwgXCJkYXRhLWZpbHRlclwiOiBcIiN7dGFzay5zb3VyY2UucGF0aH1cIixcbiAgICAgICAgICAkZWwuc3BhbiBjbGFzczpcImljb24gaWNvbi1saWdodC1idWxiXCJcblxuICBnZXRMaXN0OiAobGlzdCkgPT5cbiAgICBzZWxmID0gQFxuICAgIHJlcG8gPSBAaW1kb25lUmVwb1xuICAgIHRhc2tzID0gcmVwby5nZXRUYXNrc0luTGlzdChsaXN0Lm5hbWUpXG4gICAgJGxpc3QgPSAkJCAtPlxuICAgICAgQGRpdiBjbGFzczogJ3RvcCBsaXN0IHdlbGwnLCAnZGF0YS1uYW1lJzogbGlzdC5uYW1lLCA9PlxuICAgICAgICBAZGl2IGNsYXNzOiAnbGlzdC1uYW1lLXdyYXBwZXIgd2VsbCcsID0+XG4gICAgICAgICAgQGRpdiBjbGFzczogJ2xpc3QtbmFtZScsICdkYXRhLWxpc3QnOiBsaXN0Lm5hbWUsIHRpdGxlOiBcIkkgZG9uJ3QgbGlrZSB0aGlzIG5hbWVcIiwgPT5cbiAgICAgICAgICAgIEByYXcgbGlzdC5uYW1lXG5cbiAgICAgICAgICAgIGlmICh0YXNrcy5sZW5ndGggPCAxKVxuICAgICAgICAgICAgICBAYSBocmVmOiAnIycsIHRpdGxlOiBcImRlbGV0ZSAje2xpc3QubmFtZX1cIiwgY2xhc3M6ICdkZWxldGUtbGlzdCcsIFwiZGF0YS1saXN0XCI6IGxpc3QubmFtZSwgPT5cbiAgICAgICAgICAgICAgICBAc3BhbiBjbGFzczonaWNvbiBpY29uLXRyYXNoY2FuJ1xuICAgICAgICBAb2wgY2xhc3M6ICd0YXNrcycsIFwiZGF0YS1saXN0XCI6XCIje2xpc3QubmFtZX1cIiwgPT5cbiAgICAkdGFza3MgPSAkbGlzdC5maW5kKCcudGFza3MnKVxuICAgICR0YXNrcy5hcHBlbmQoc2VsZi5nZXRUYXNrIHRhc2spIGZvciB0YXNrIGluIHRhc2tzXG4gICAgJGxpc3RcblxuICBsaXN0T25Cb2FyZDogKG5hbWUpIC0+IEBib2FyZC5maW5kIFwiLmxpc3RbZGF0YS1uYW1lPScje25hbWV9J10gb2wudGFza3NcIlxuXG4gIGFkZExpc3RUb0JvYXJkOiAobmFtZSkgLT5cbiAgICBwb3NpdGlvbiA9IF8uZmluZEluZGV4IEBpbWRvbmVSZXBvLmdldExpc3RzKCksIG5hbWU6IG5hbWVcbiAgICBsaXN0ID0gXy5maW5kIEBpbWRvbmVSZXBvLmdldExpc3RzKCksIG5hbWU6IG5hbWVcbiAgICBAYm9hcmQuZmluZChcIi5saXN0OmVxKCN7cG9zaXRpb259KVwiKS5hZnRlcihAZ2V0TGlzdCBsaXN0KVxuXG4gIGFkZFRhc2tUb0JvYXJkOiAodGFzaykgLT5cbiAgICBAbGlzdE9uQm9hcmQodGFzay5saXN0KS5wcmVwZW5kIEBnZXRUYXNrIHRhc2tcblxuICBhZGRUYXNrc1RvQm9hcmQ6ICh0YXNrcykgLT5cbiAgICBsaXN0cyA9IF8uZ3JvdXBCeSB0YXNrcywgJ2xpc3QnXG4gICAgZm9yIGxpc3ROYW1lLCBsaXN0T2ZUYXNrcyBvZiBsaXN0c1xuICAgICAgaWYgQGxpc3RPbkJvYXJkKGxpc3ROYW1lKS5sZW5ndGggPT0gMFxuICAgICAgICBAYWRkTGlzdFRvQm9hcmQgbGlzdE5hbWVcbiAgICAgIGVsc2UgQGFkZFRhc2tUb0JvYXJkIHRhc2sgZm9yIHRhc2sgaW4gbGlzdE9mVGFza3NcblxuICB1cGRhdGVUYXNrc09uQm9hcmQ6ICh0YXNrcykgLT5cbiAgICByZXR1cm4gZmFsc2UgaWYgdGFza3MubGVuZ3RoID09IDBcbiAgICByZXR1cm4gZmFsc2UgaWYgdGFza3MubGVuZ3RoID09IEBpbWRvbmVSZXBvLmdldFRhc2tzKCkubGVuZ3RoXG4gICAgc2VsZiA9IEBcbiAgICBAZGVzdHJveVNvcnRhYmxlcygpXG4gICAgdGFza3NCeUxpc3QgPSBfLmdyb3VwQnkgdGFza3MsICdsaXN0J1xuICAgIGlmIF8ua2V5cyh0YXNrc0J5TGlzdCkubGVuZ3RoID09IDFcbiAgICAgIGxpc3ROYW1lID0gdGFza3NbMF0ubGlzdFxuICAgICAgc2VsZi5ib2FyZC5maW5kKFwiLmxpc3RbZGF0YS1uYW1lPScje2xpc3ROYW1lfSddXCIpLnJlbW92ZSgpXG4gICAgICBAYWRkVGFza3NUb0JvYXJkIEBpbWRvbmVSZXBvLmdldFRhc2tzSW5MaXN0KGxpc3ROYW1lKVxuICAgIGVsc2VcbiAgICAgICMgVXBkYXRlIHRhc2tzIGJ5IGZpbGVcbiAgICAgIGZpbGVzID0gXy51bmlxKF8ubWFwIHRhc2tzLCAnc291cmNlLnBhdGgnKVxuICAgICAgdGFza3NJbkZpbGVzID0gW11cbiAgICAgIGZvciBmaWxlIGluIGZpbGVzXG4gICAgICAgICMgUmVtb3ZlIFRhc2tzIGZvciBlYWNoIGZpbGUgYnkgZGF0YS1wYXRoIGF0dHJpYnV0ZVxuICAgICAgICBAYm9hcmQuZmluZChcImxpW2RhdGEtcGF0aD0nI3tmaWxlfSddXCIpLnJlbW92ZSgpXG4gICAgICAgICMgQWRkIHRhc2tzIGZyb20gYWxsIGZpbGVzLi4uXG4gICAgICAgIHRhc2tzSW5GaWxlcyA9IHRhc2tzSW5GaWxlcy5jb25jYXQgQGltZG9uZVJlcG8uZ2V0RmlsZShmaWxlKS5nZXRUYXNrcygpXG4gICAgICBAYWRkVGFza3NUb0JvYXJkIHRhc2tzSW5GaWxlc1xuICAgICMgcmVtb3ZlIGxpc3RzIHRoYXQgYXJlIGhpZGRlblxuICAgIEBib2FyZC5maW5kKCcubGlzdCcpLmVhY2ggLT5cbiAgICAgICRsaXN0ID0gJCh0aGlzKVxuICAgICAgbGlzdE5hbWUgPSAkbGlzdC5hdHRyICdkYXRhLW5hbWUnXG4gICAgICAkbGlzdC5yZW1vdmUoKSB1bmxlc3Mgc2VsZi5pbWRvbmVSZXBvLmlzTGlzdFZpc2libGUgbGlzdE5hbWVcbiAgICBAYWRkUGx1Z2luQnV0dG9ucygpXG4gICAgQG1ha2VUYXNrc1NvcnRhYmxlKClcbiAgICBAaGlkZU1hc2soKVxuICAgIEBlbWl0dGVyLmVtaXQgJ2JvYXJkLnVwZGF0ZSdcblxuXG4gICMgQkFDS0xPRzogU3BsaXQgdGhpcyBhcGFydCBpbnRvIGl0J3Mgb3duIGNsYXNzIHRvIHNpbXBsaWZ5LiBDYWxsIGl0IEJvYXJkVmlldyArcmVmYWN0b3IgZ2g6MjQ2IGlkOjg0XG4gIHVwZGF0ZUJvYXJkOiAodGFza3MpIC0+XG4gICAgIyBUT0RPOiBPbmx5IHVwZGF0ZSBib2FyZCB3aXRoIGNoYW5nZWQgdGFza3MgZ2g6MjA1ICttYXN0ZXIgaWQ6OTlcbiAgICAjIHJldHVybiBpZiBAdXBkYXRlVGFza3NPbkJvYXJkIHRhc2tzXG4gICAgc2VsZiA9IEBcbiAgICBAZGVzdHJveVNvcnRhYmxlcygpXG4gICAgQGJvYXJkLmVtcHR5KCkuaGlkZSgpXG4gICAgcmVwbyA9IEBpbWRvbmVSZXBvXG4gICAgcmVwby4kYm9hcmQgPSBAYm9hcmRcbiAgICBsaXN0cyA9IHJlcG8uZ2V0VmlzaWJsZUxpc3RzKClcbiAgICB3aWR0aCA9IDM3OCpsaXN0cy5sZW5ndGggKyBcInB4XCJcbiAgICBAYm9hcmQuY3NzKCd3aWR0aCcsIHdpZHRoKVxuICAgIEBib2FyZC5hcHBlbmQgKD0+IEBnZXRMaXN0IGxpc3QgZm9yIGxpc3QgaW4gbGlzdHMpXG4gICAgQGFkZFBsdWdpbkJ1dHRvbnMoKVxuICAgIEBmaWx0ZXIoKVxuICAgIEBib2FyZC5zaG93KClcbiAgICBAaGlkZU1hc2soKVxuICAgIEBtYWtlVGFza3NTb3J0YWJsZSgpXG4gICAgQGVtaXR0ZXIuZW1pdCAnYm9hcmQudXBkYXRlJ1xuXG4gIGRlc3Ryb3lTb3J0YWJsZXM6IC0+XG4gICAgaWYgQHRhc2tzU29ydGFibGVzXG4gICAgICBmb3Igc29ydGFibGUgaW4gQHRhc2tzU29ydGFibGVzXG4gICAgICAgIHNvcnRhYmxlLmRlc3Ryb3koKSBpZiBzb3J0YWJsZS5lbFxuXG4gIG1ha2VUYXNrc1NvcnRhYmxlOiAtPlxuICAgIG9wdHMgPVxuICAgICAgZHJhZ2dhYmxlOiAnLnRhc2snXG4gICAgICBncm91cDogJ3Rhc2tzJ1xuICAgICAgc29ydDogdHJ1ZVxuICAgICAgZ2hvc3RDbGFzczogJ2ltZG9uZS1naG9zdCdcbiAgICAgIHNjcm9sbDogQGJvYXJkV3JhcHBlclswXVxuICAgICAgb25FbmQ6IChldnQpID0+XG4gICAgICAgIGlkID0gZXZ0Lml0ZW0uaWRcbiAgICAgICAgcG9zID0gZXZ0Lm5ld0luZGV4XG4gICAgICAgIGxpc3QgPSBldnQuaXRlbS5wYXJlbnROb2RlLmRhdGFzZXQubGlzdFxuICAgICAgICBmaWxlUGF0aCA9IEBpbWRvbmVSZXBvLmdldEZ1bGxQYXRoIGV2dC5pdGVtLmRhdGFzZXQucGF0aFxuICAgICAgICB0YXNrID0gQGltZG9uZVJlcG8uZ2V0VGFzayBpZFxuICAgICAgICBAc2hvd01hc2sgXCJNb3ZpbmcgVGFza3NcIlxuICAgICAgICBAaW1kb25lUmVwby5tb3ZlVGFza3MgW3Rhc2tdLCBsaXN0LCBwb3NcblxuICAgIEB0YXNrc1NvcnRhYmxlcyA9IHRhc2tzU29ydGFibGVzID0gW11cbiAgICBAZmluZCgnLnRhc2tzJykuZWFjaCAtPlxuICAgICAgdGFza3NTb3J0YWJsZXMucHVzaChTb3J0YWJsZS5jcmVhdGUgJCh0aGlzKS5nZXQoMCksIG9wdHMpXG5cbiAgZGVzdHJveTogLT5cbiAgICBAcmVtb3ZlQWxsUmVwb0xpc3RlbmVycygpXG4gICAgQHJlbW92ZSgpXG4gICAgQGVtaXR0ZXIuZW1pdCAnZGlkLWRlc3Ryb3knLCBAXG4gICAgQGVtaXR0ZXIuZGlzcG9zZSgpXG5cbiAgb25EaWREZXN0cm95OiAoY2FsbGJhY2spIC0+XG4gICAgQGVtaXR0ZXIub24gJ2RpZC1kZXN0cm95JywgY2FsbGJhY2tcblxuICBvcGVuUGF0aDogKGZpbGVQYXRoLCBsaW5lKSAtPlxuICAgIHJldHVybiB1bmxlc3MgZmlsZVBhdGhcblxuICAgIGZpbGVTZXJ2aWNlLm9wZW5GaWxlIEBwYXRoLCBmaWxlUGF0aCwgbGluZSwgKHN1Y2Nlc3MpID0+XG4gICAgICByZXR1cm4gaWYgc3VjY2Vzc1xuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlUGF0aCwgc3BsaXQ6ICdsZWZ0JykudGhlbiA9PlxuICAgICAgICBAbW92ZUN1cnNvclRvKGxpbmUpIGlmIGxpbmVcblxuICBtb3ZlQ3Vyc29yVG86IChsaW5lTnVtYmVyKSAtPlxuICAgIGxpbmVOdW1iZXIgPSBwYXJzZUludChsaW5lTnVtYmVyKVxuXG4gICAgaWYgdGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKVxuICAgICAgcG9zaXRpb24gPSBbbGluZU51bWJlci0xLCAwXVxuICAgICAgdGV4dEVkaXRvci5zZXRDdXJzb3JCdWZmZXJQb3NpdGlvbihwb3NpdGlvbiwgYXV0b3Njcm9sbDogZmFsc2UpXG4gICAgICB0ZXh0RWRpdG9yLnNjcm9sbFRvQ3Vyc29yUG9zaXRpb24oY2VudGVyOiB0cnVlKVxuXG4gIHNlbGVjdFRhc2s6IChpZCkgLT5cbiAgICBAY2xlYXJTZWxlY3Rpb24oKVxuICAgIEBib2FyZC5maW5kKFwiLnRhc2sjI3tpZH1cIikuYWRkQ2xhc3MgJ3NlbGVjdGVkJ1xuXG4gIGNsZWFyU2VsZWN0aW9uOiAtPlxuICAgIEBib2FyZC5maW5kKCcudGFzaycpLnJlbW92ZUNsYXNzICdzZWxlY3RlZCdcbiJdfQ==
