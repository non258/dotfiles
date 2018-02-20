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
      $filters = $el.div({
        "class": 'task-filters'
      });
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2ltZG9uZS1hdG9tL2xpYi92aWV3cy9pbWRvbmUtYXRvbS12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsZ0tBQUE7SUFBQTs7OztFQUFBLE1BQTJCLE9BQUEsQ0FBUSxzQkFBUixDQUEzQixFQUFDLFNBQUQsRUFBSSxXQUFKLEVBQVEsYUFBUixFQUFhOztFQUNiLEdBQUEsR0FBTSxPQUFBLENBQVEsU0FBUjs7RUFDTCxVQUFXLE9BQUEsQ0FBUSxNQUFSOztFQUNaLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFDTCxRQUFBLEdBQVc7O0VBQ1gsVUFBQSxHQUFhOztFQUNiLElBQUEsR0FBTzs7RUFDUCxJQUFBLEdBQU87O0VBQ1AsUUFBQSxHQUFXOztFQUNYLGFBQUEsR0FBZ0I7O0VBQ2hCLFdBQUEsR0FBYzs7RUFDZCxHQUFBLEdBQU07O0VBQ04sQ0FBQSxHQUFJOztFQUNKLE1BQUEsR0FBUyxPQUFBLENBQVEsMkJBQVI7O0VBQ1QsU0FBQSxHQUFZLE9BQUEsQ0FBUSxjQUFSOztFQUVaLE1BQU0sQ0FBQyxPQUFQLEdBQ007QUFFSixRQUFBOzs7O0lBQU07OztNQUNTLDZCQUFDLFVBQUQ7UUFBQyxJQUFDLENBQUEsYUFBRDtRQUNaLG1EQUFBO01BRFc7O29DQUViLE9BQUEsR0FBUyxTQUFBO2VBQUc7TUFBSDs7b0NBQ1QsVUFBQSxHQUFZLFNBQUMsRUFBRDtlQUNWLElBQUMsQ0FBQSxVQUFVLENBQUMsVUFBWixDQUF1QixFQUF2QjtNQURVOztvQ0FFWixVQUFBLEdBQVksU0FBQyxNQUFEO1FBQ1YsSUFBQSxDQUFjLE1BQU0sQ0FBQyxPQUFyQjtBQUFBLGlCQUFBOztlQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQXZCLENBQWtDLE1BQWxDO01BRlU7Ozs7T0FOb0I7OzZCQVVsQyxVQUFBLEdB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VUFBQSxHQUFhLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQWYsQ0FBQSxDQUFoQjtRQUNFLFFBQUEsR0FBVyxDQUFDLFVBQUEsR0FBVyxDQUFaLEVBQWUsQ0FBZjtRQUNYLFVBQVUsQ0FBQyx1QkFBWCxDQUFtQyxRQUFuQyxFQUE2QztVQUFBLFVBQUEsRUFBWSxLQUFaO1NBQTdDO2VBQ0EsVUFBVSxDQUFDLHNCQUFYLENBQWtDO1VBQUEsTUFBQSxFQUFRLElBQVI7U0FBbEMsRUFIRjs7SUFIWTs7NkJBUWQsVUFBQSxHQUFZLFNBQUMsRUFBRDtNQUNWLElBQUMsQ0FBQSxjQUFELENBQUE7YUFDQSxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxRQUFBLEdBQVMsRUFBckIsQ0FBMEIsQ0FBQyxRQUEzQixDQUFvQyxVQUFwQztJQUZVOzs2QkFJWixjQUFBLEdBQWdCLFNBQUE7YUFDZCxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxPQUFaLENBQW9CLENBQUMsV0FBckIsQ0FBaUMsVUFBakM7SUFEYzs7OztLQXRwQlc7QUFqQjdCIiwic291cmNlc0NvbnRlbnQiOlsieyQsICQkLCAkJCQsIFNjcm9sbFZpZXd9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG4kZWwgPSByZXF1aXJlICdsYWNvbmljJ1xue0VtaXR0ZXJ9ID0gcmVxdWlyZSAnYXRvbSdcbmZzID0gcmVxdWlyZSAnZnMnXG5NZW51VmlldyA9IG51bGxcbkJvdHRvbVZpZXcgPSBudWxsXG5wYXRoID0gbnVsbFxudXRpbCA9IG51bGxcblNvcnRhYmxlID0gbnVsbFxucGx1Z2luTWFuYWdlciA9IG51bGxcbmZpbGVTZXJ2aWNlID0gbnVsbFxubG9nID0gbnVsbFxuXyA9IG51bGxcbmNvbmZpZyA9IHJlcXVpcmUgJy4uL3NlcnZpY2VzL2ltZG9uZS1jb25maWcnXG5lbnZDb25maWcgPSByZXF1aXJlICcuLi8uLi9jb25maWcnXG4jICNCQUNLTE9HOiBBZGQga2VlbiBzdGF0cyBmb3IgZmVhdHVyZXMgZ2g6MjQwIGlkOjg5XG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBJbWRvbmVBdG9tVmlldyBleHRlbmRzIFNjcm9sbFZpZXdcblxuICBjbGFzcyBQbHVnaW5WaWV3SW50ZXJmYWNlIGV4dGVuZHMgRW1pdHRlclxuICAgIGNvbnN0cnVjdG9yOiAoQGltZG9uZVZpZXcpLT5cbiAgICAgIHN1cGVyKClcbiAgICBlbWl0dGVyOiAtPiBAICMgQ0hBTkdFRDogZGVwcmVjYXRlZCBnaDoyNDUgaWQ6NzRcbiAgICBzZWxlY3RUYXNrOiAoaWQpIC0+XG4gICAgICBAaW1kb25lVmlldy5zZWxlY3RUYXNrIGlkXG4gICAgc2hvd1BsdWdpbjogKHBsdWdpbikgLT5cbiAgICAgIHJldHVybiB1bmxlc3MgcGx1Z2luLmdldFZpZXdcbiAgICAgIEBpbWRvbmVWaWV3LmJvdHRvbVZpZXcuc2hvd1BsdWdpbiBwbHVnaW5cblxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyXG4gICAgQHpvb20gY29uZmlnLmdldFNldHRpbmdzKCkuem9vbUxldmVsXG4gICAgIyBpbWRvbmUgaWNvbiBzdHVmZlxuICAgIHN2Z1BhdGggPSBwYXRoLmpvaW4gY29uZmlnLmdldFBhY2thZ2VQYXRoKCksICdpbWFnZXMnLCAnaWNvbnMuc3ZnJ1xuICAgIGZzLnJlYWRGaWxlIHN2Z1BhdGgsIChlcnIsIGRhdGEpID0+XG4gICAgICByZXR1cm4gaWYgZXJyXG4gICAgICBAJHN2Zy5odG1sIGRhdGEudG9TdHJpbmcoKVxuXG4gIGNvbnN0cnVjdG9yOiAoe0BpbWRvbmVSZXBvLCBAcGF0aCwgQHVyaX0pIC0+XG4gICAgc3VwZXJcbiAgICB1dGlsID0gcmVxdWlyZSAndXRpbCdcbiAgICBTb3J0YWJsZSA9IHJlcXVpcmUgJ3NvcnRhYmxlanMnXG4gICAgcGx1Z2luTWFuYWdlciA9IHJlcXVpcmUgJy4uL3NlcnZpY2VzL3BsdWdpbi1tYW5hZ2VyJ1xuICAgIGZpbGVTZXJ2aWNlID0gcmVxdWlyZSAnLi4vc2VydmljZXMvZmlsZS1zZXJ2aWNlJ1xuICAgIGxvZyA9IHJlcXVpcmUgJy4uL3NlcnZpY2VzL2xvZydcbiAgICBfID0gcmVxdWlyZSAnbG9kYXNoJ1xuICAgIHJlcXVpcmUoJy4vanEtdXRpbHMnKSgkKVxuXG4gICAgQHRpdGxlID0gXCIje3BhdGguYmFzZW5hbWUoQHBhdGgpfSBUYXNrc1wiXG4gICAgQHBsdWdpbnMgPSB7fVxuXG4gICAgQGhhbmRsZUV2ZW50cygpXG5cbiAgICBAaW1kb25lUmVwby5maWxlU3RhdHMgKGVyciwgZmlsZXMpID0+XG4gICAgICBAbnVtRmlsZXMgPSBmaWxlcy5sZW5ndGhcbiAgICAgIEBtZXNzYWdlcy5hcHBlbmQgXCI8cD5Gb3VuZCAje2ZpbGVzLmxlbmd0aH0gZmlsZXMgaW4gI3twYXRoLmJhc2VuYW1lKEBwYXRoKX08L3A+XCJcblxuICAgICAgaWYgQG51bUZpbGVzID4gY29uZmlnLmdldFNldHRpbmdzKCkubWF4RmlsZXNQcm9tcHRcbiAgICAgICAgQGlnbm9yZVByb21wdC5zaG93KClcbiAgICAgIGVsc2VcbiAgICAgICAgQG1lc3NhZ2VzLmFwcGVuZCBcIjxwPkxvb2tpbmcgZm9yIFRPRE8ncyB3aXRoIHRoZSBmb2xsb3dpbmcgdG9rZW5zOjwvcD4gPHA+I3tAaW1kb25lUmVwby5jb25maWcuY29kZS5pbmNsdWRlX2xpc3RzLmpvaW4oJzxici8+Jyl9PC9wPlwiXG4gICAgICAgIEBpbml0SW1kb25lKClcblxuICBzZXJpYWxpemU6IC0+XG4gICAgZGVzZXJpYWxpemVyOiAnSW1kb25lQXRvbVZpZXcnXG4gICAgcGF0aDogQHBhdGhcbiAgICB1cmk6IEB1cmlcblxuICB6b29tOiAoZGlyKSAtPlxuICAgIHpvb21hYmxlID0gQGZpbmQgJy56b29tYWJsZSdcbiAgICByZXR1cm4gem9vbWFibGUuY3NzICd6b29tJywgZGlyIGlmIHR5cGVvZiBkaXIgaXMgJ251bWJlcidcbiAgICB6b29tVmFsID0gbmV3IE51bWJlcih6b29tYWJsZS5jc3MgJ3pvb20nKVxuICAgIHpvb21WYWwgPSBpZiBkaXIgPT0gJ2luJyB0aGVuIHpvb21WYWwrLjA1IGVsc2Ugem9vbVZhbC0uMDVcbiAgICB6b29tYWJsZS5jc3MgJ3pvb20nLCB6b29tVmFsXG5cbiAgQGNvbnRlbnQ6IChwYXJhbXMpIC0+XG4gICAgTWVudVZpZXcgPSByZXF1aXJlICcuL21lbnUtdmlldydcbiAgICBCb3R0b21WaWV3ID0gcmVxdWlyZSAnLi9ib3R0b20tdmlldydcbiAgICBwYXRoID0gcmVxdWlyZSAncGF0aCdcbiAgICBAZGl2IHRhYmluZGV4OiAtMSwgY2xhc3M6ICdpbWRvbmUtYXRvbSBwYW5lLWl0ZW0nLCA9PlxuICAgICAgQGRpdiBvdXRsZXQ6ICckc3ZnJ1xuICAgICAgQGRpdiBvdXRsZXQ6ICdsb2FkaW5nJywgY2xhc3M6ICdpbWRvbmUtbG9hZGluZycsID0+XG4gICAgICAgIEBoMSBcIlNjYW5uaW5nIGZpbGVzIGluICN7cGF0aC5iYXNlbmFtZShwYXJhbXMucGF0aCl9LlwiXG4gICAgICAgIEBwIFwiR2V0IHJlYWR5IGZvciBhd2Vzb21lISEhXCJcbiAgICAgICAgQGRpdiBvdXRsZXQ6ICdtZXNzYWdlcycsIGNsYXNzOiAnaW1kb25lLW1lc3NhZ2VzJ1xuXG4gICAgICAgIEBkaXYgb3V0bGV0OiAnaWdub3JlUHJvbXB0JywgY2xhc3M6ICdpZ25vcmUtcHJvbXB0Jywgc3R5bGU6ICdkaXNwbGF5OiBub25lOycsID0+XG4gICAgICAgICAgQGgyIGNsYXNzOid0ZXh0LXdhcm5pbmcnLCBcIkhlbHAhICBEb24ndCBtYWtlIG1lIGNyYXNoIVwiXG4gICAgICAgICAgQHAgXCJUb28gbWFueSBmaWxlcyBtYWtlIG1lIGJsb2F0ZWQuICBJZ25vcmluZyBmaWxlcyBhbmQgZGlyZWN0b3JpZXMgaW4gLmltZG9uZWlnbm9yZSBjYW4gbWFrZSBtZSBmZWVsIGJldHRlci5cIlxuICAgICAgICAgIEBkaXYgY2xhc3M6ICdibG9jaycsID0+XG4gICAgICAgICAgICBAYnV0dG9uIGNsaWNrOiAnb3Blbklnbm9yZScsIGNsYXNzOidpbmxpbmUtYmxvY2stdGlnaHQgYnRuIGJ0bi1wcmltYXJ5JywgXCJFZGl0IC5pbWRvbmVpZ25vcmVcIlxuICAgICAgICAgICAgQGJ1dHRvbiBjbGljazogJ2luaXRJbWRvbmUnLCBjbGFzczonaW5saW5lLWJsb2NrLXRpZ2h0IGJ0biBidG4td2FybmluZycsIFwiV2hvIGNhcmVzLCBrZWVwIGdvaW5nXCJcbiAgICAgICAgQGRpdiBvdXRsZXQ6ICdwcm9ncmVzc0NvbnRhaW5lcicsIHN0eWxlOiAnZGlzcGxheTpub25lOycsID0+XG4gICAgICAgICAgQHByb2dyZXNzIGNsYXNzOidpbmxpbmUtYmxvY2snLCBvdXRsZXQ6ICdwcm9ncmVzcycsIG1heDoxMDAsIHZhbHVlOjFcbiAgICAgIEBkaXYgb3V0bGV0OiAnZXJyb3InLCBjbGFzczogJ2ltZG9uZS1lcnJvcidcbiAgICAgIEBkaXYgb3V0bGV0OiAnbWFzaycsIGNsYXNzOiAnbWFzaycsID0+XG4gICAgICAgIEBkaXYgY2xhc3M6ICdzcGlubmVyLW1hc2snXG4gICAgICAgIEBkaXYgY2xhc3M6ICdzcGlubmVyLWNvbnRhaW5lcicsID0+XG4gICAgICAgICAgQGRpdiBjbGFzczogJ3NwaW5uZXInLCA9PlxuICAgICAgICAgICAgQHAgb3V0bGV0OiAnc3Bpbm5lck1lc3NhZ2UnXG4gICAgICAgICAgICBAcCA9PlxuICAgICAgICAgICAgICBAc3BhbiBjbGFzczonbG9hZGluZyBsb2FkaW5nLXNwaW5uZXItc21hbGwgaW5saW5lLWJsb2NrJ1xuICAgICAgQGRpdiBvdXRsZXQ6J21haW5Db250YWluZXInLCBjbGFzczonaW1kb25lLW1haW4tY29udGFpbmVyJywgPT5cbiAgICAgICAgQGRpdiBvdXRsZXQ6ICdhcHBDb250YWluZXInLCBjbGFzczonaW1kb25lLWFwcC1jb250YWluZXInLCA9PlxuICAgICAgICAgIEBzdWJ2aWV3ICdtZW51VmlldycsIG5ldyBNZW51VmlldyhwYXJhbXMpXG4gICAgICAgICAgQGRpdiBvdXRsZXQ6ICdib2FyZFdyYXBwZXInLCBjbGFzczogJ2ltZG9uZS1ib2FyZC13cmFwcGVyIG5hdGl2ZS1rZXktYmluZGluZ3MnLCA9PlxuICAgICAgICAgICAgIyBAZGl2IG91dGxldDogJ21lc3NhZ2VzJywgXCJIQUhBSFwiXG4gICAgICAgICAgICBAZGl2IG91dGxldDogJ2JvYXJkJywgY2xhc3M6ICdpbWRvbmUtYm9hcmQgem9vbWFibGUnXG4gICAgICAgICAgQGRpdiBvdXRsZXQ6ICdjb25maWdXcmFwcGVyJywgY2xhc3M6J2ltZG9uZS1jb25maWctd3JhcHBlcicsID0+XG4gICAgICAgICAgICBAc3VidmlldyAnYm90dG9tVmlldycsIG5ldyBCb3R0b21WaWV3KHBhcmFtcylcblxuICBnZXRUaXRsZTogLT4gQHRpdGxlXG5cbiAgZ2V0SWNvbk5hbWU6IC0+IFwiY2hlY2tsaXN0XCJcblxuICBnZXRVUkk6IC0+IEB1cmlcblxuICBhZGRSZXBvTGlzdGVuZXJzOiAtPlxuICAgIHJldHVybiBpZiBAbGlzdGVuZXJzSW5pdGlhbGl6ZWRcbiAgICByZXBvID0gQGltZG9uZVJlcG9cbiAgICBlbWl0dGVyID0gQGVtaXR0ZXJcbiAgICBoYW5kbGVycyA9IHt9XG4gICAgaGFuZGxlID0gKGV2ZW50KSAtPlxuICAgICAgKGRhdGEpIC0+IGVtaXR0ZXIuZW1pdCBldmVudCwgZGF0YVxuICAgIGV2ZW50cyA9IFsnbGlzdC5tb2RpZmllZCcsICdwcm9qZWN0Lm5vdC1mb3VuZCcsICdwcm9qZWN0LnJlbW92ZWQnLCAncHJvamVjdC5mb3VuZCcsICdwcm9kdWN0LmxpbmtlZCcsXG4gICAgICAncHJvZHVjdC51bmxpbmtlZCcsICd0YXNrcy51cGRhdGVkJywgJ3Rhc2tzLnN5bmNpbmcnLCAnc3luYy5lcnJvcicsICdpbml0aWFsaXplZCcsICdmaWxlLnVwZGF0ZScsICd0YXNrcy5tb3ZlZCcsXG4gICAgICAnY29uZmlnLnVwZGF0ZScsICdjb25maWcubG9hZGVkJywgJ2Vycm9yJywgJ2ZpbGUucmVhZCcsICdzeW5jLnBlcmNlbnQnLCAnY29ubmVjdG9yLmVuYWJsZWQnLCAnYXV0aGVudGljYXRlZCcsICd1bmF1dGhlbnRpY2F0ZWQnLFxuICAgICAgJ2F1dGhlbnRpY2F0aW9uLWZhaWxlZCcsICd1bmF2YWlsYWJsZSddXG5cbiAgICBmb3IgZXZlbnQgaW4gZXZlbnRzXG4gICAgICBoYW5kbGVyID0gaGFuZGxlcnNbZXZlbnRdID0gaGFuZGxlIGV2ZW50XG4gICAgICByZXBvLm9uIGV2ZW50LCBoYW5kbGVyXG5cbiAgICBAcmVtb3ZlQWxsUmVwb0xpc3RlbmVycyA9ICgpIC0+XG4gICAgICByZXBvLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBoYW5kbGVyc1tldmVudF0pIGZvciBldmVudCBpbiBldmVudHNcbiAgICBAbGlzdGVuZXJzSW5pdGlhbGl6ZWQgPSB0cnVlXG5cbiAgaGFuZGxlRXZlbnRzOiAtPlxuICAgIHJlcG8gPSBAaW1kb25lUmVwb1xuICAgIEBlbWl0dGVyID0gQHZpZXdJbnRlcmZhY2UgPSBuZXcgUGx1Z2luVmlld0ludGVyZmFjZSBAXG4gICAgQGFkZFJlcG9MaXN0ZW5lcnMoKVxuICAgIEBtZW51Vmlldy5oYW5kbGVFdmVudHMgQGVtaXR0ZXJcbiAgICBAYm90dG9tVmlldy5oYW5kbGVFdmVudHMgQGVtaXR0ZXJcblxuICAgIEBlbWl0dGVyLm9uICdhdXRoZW50aWNhdGlvbi1mYWlsZWQnLCAoe3N0YXR1cywgcmV0cmllc30pID0+XG4gICAgICBAaGlkZU1hc2soKSBpZiBzdGF0dXMgPT0gXCJ1bmF2YWlsYWJsZVwiICYmIHJldHJpZXNcbiAgICAgICNjb25zb2xlLmxvZyBcImF1dGgtZmFpbGVkXCIgaWYgc3RhdHVzID09IFwiZmFpbGVkXCJcblxuICAgIEBlbWl0dGVyLm9uICdhdXRoZW50aWNhdGVkJywgPT4gcGx1Z2luTWFuYWdlci5pbml0KClcblxuICAgIEBlbWl0dGVyLm9uICd1bmF2YWlsYWJsZScsID0+XG4gICAgICBAaGlkZU1hc2soKVxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEluZm8gXCIje2VudkNvbmZpZy5uYW1lfSBpcyB1bmF2YWlsYWJsZVwiLCBkZXRhaWw6IFwiQ2xpY2sgbG9naW4gdG8gcmV0cnlcIiwgZGlzbWlzc2FibGU6IHRydWUsIGljb246ICdhbGVydCdcblxuXG4gICAgIyBAZW1pdHRlci5vbiAndGFza3Muc3luY2luZycsID0+IEBzaG93TWFzayBcIlN5bmNpbmcgd2l0aCAje2VudkNvbmZpZy5uYW1lfS4uLlwiXG5cbiAgICBAZW1pdHRlci5vbiAnc3luYy5lcnJvcicsID0+IEBoaWRlTWFzaygpXG5cbiAgICBAZW1pdHRlci5vbiAndGFza3MudXBkYXRlZCcsICh0YXNrcykgPT5cbiAgICAgIEBvblJlcG9VcGRhdGUodGFza3MpICMgVE9ETzogRm9yIFVJIHBlcmZvcm1hbmNlIG9ubHkgdXBkYXRlIHRoZSBsaXN0cyB0aGF0IGhhdmUgY2hhbmdlZC4gK2VuaGFuY2VtZW50IGdoOjIwNSBpZDo4M1xuXG4gICAgQGVtaXR0ZXIub24gJ2luaXRpYWxpemVkJywgPT5cbiAgICAgIEBhZGRQbHVnaW4oUGx1Z2luKSBmb3IgUGx1Z2luIGluIHBsdWdpbk1hbmFnZXIuZ2V0QWxsKClcbiAgICAgIEBvblJlcG9VcGRhdGUgQGltZG9uZVJlcG8uZ2V0VGFza3MoKVxuXG4gICAgQGVtaXR0ZXIub24gJ2xpc3QubW9kaWZpZWQnLCAobGlzdCkgPT5cbiAgICAgIEBvblJlcG9VcGRhdGUgQGltZG9uZVJlcG8uZ2V0VGFza3NJbkxpc3QobGlzdClcblxuICAgIEBlbWl0dGVyLm9uICdmaWxlLnVwZGF0ZScsIChmaWxlKSA9PlxuICAgICAgI2NvbnNvbGUubG9nICdmaWxlLnVwZGF0ZTogJXMnLCBmaWxlICYmIGZpbGUuZ2V0UGF0aCgpXG4gICAgICBAb25SZXBvVXBkYXRlKGZpbGUuZ2V0VGFza3MoKSkgaWYgZmlsZS5nZXRQYXRoKClcblxuICAgIEBlbWl0dGVyLm9uICd0YXNrcy5tb3ZlZCcsICh0YXNrcykgPT5cbiAgICAgICNjb25zb2xlLmxvZyAndGFza3MubW92ZWQnLCB0YXNrc1xuICAgICAgQG9uUmVwb1VwZGF0ZSh0YXNrcykgIyBUT0RPOiBGb3IgcGVyZm9ybWFuY2UgbWF5YmUgb25seSB1cGRhdGUgdGhlIGxpc3RzIHRoYXQgaGF2ZSBjaGFuZ2VkIGdoOjI1OSBpZDo5OFxuXG4gICAgQGVtaXR0ZXIub24gJ2NvbmZpZy51cGRhdGUnLCA9PlxuICAgICAgI2NvbnNvbGUubG9nICdjb25maWcudXBkYXRlJ1xuICAgICAgcmVwby5yZWZyZXNoKClcblxuICAgIEBlbWl0dGVyLm9uICdlcnJvcicsIChtZE1zZykgPT4gYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcgXCJPT1BTIVwiLCBkZXNjcmlwdGlvbjogbWRNc2csIGRpc21pc3NhYmxlOiB0cnVlLCBpY29uOiAnYWxlcnQnXG5cbiAgICBAZW1pdHRlci5vbiAndGFzay5tb2RpZmllZCcsICh0YXNrKSA9PiBAb25SZXBvVXBkYXRlKClcbiAgICAgICNjb25zb2xlLmxvZyBcIlRhc2sgbW9kaWZpZWQuICBTeW5jaW5nIHdpdGggaW1kb25lLmlvXCJcbiAgICAgICMgQGltZG9uZVJlcG8uc3luY1Rhc2tzIFt0YXNrXSwgKGVycikgPT4gQG9uUmVwb1VwZGF0ZSgpXG5cbiAgICBAZW1pdHRlci5vbiAnbWVudS50b2dnbGUnLCA9PlxuICAgICAgQGJvYXJkV3JhcHBlci50b2dnbGVDbGFzcyAnc2hpZnQnXG5cbiAgICBAZW1pdHRlci5vbiAnZmlsdGVyJywgKHRleHQpID0+XG4gICAgICBAZmlsdGVyIHRleHRcblxuICAgIEBlbWl0dGVyLm9uICdmaWx0ZXIuY2xlYXInLCA9PlxuICAgICAgQGJvYXJkLmZpbmQoJy50YXNrJykuc2hvdygpXG5cbiAgICBAZW1pdHRlci5vbiAndmlzaWJsZS5vcGVuJywgPT5cbiAgICAgIHBhdGhzID0ge31cbiAgICAgIGZvciB0YXNrIGluIEB2aXNpYmxlVGFza3MoKVxuICAgICAgICBmaWxlID0gQGltZG9uZVJlcG8uZ2V0RmlsZUZvclRhc2sodGFzaylcbiAgICAgICAgZnVsbFBhdGggPSBAaW1kb25lUmVwby5nZXRGdWxsUGF0aCBmaWxlXG4gICAgICAgIHBhdGhzW2Z1bGxQYXRoXSA9IHRhc2subGluZVxuXG4gICAgICBudW1GaWxlcyA9IF8ua2V5cyhwYXRocykubGVuZ3RoXG4gICAgICBpZiBudW1GaWxlcyA8IDUgfHwgd2luZG93LmNvbmZpcm0gXCJpbWRvbmUgaXMgYWJvdXQgdG8gb3BlbiAje251bUZpbGVzfSBmaWxlcy4gIENvbnRpbnVlP1wiXG4gICAgICAgIGZvciBmcGF0aCwgbGluZSBvZiBwYXRoc1xuICAgICAgICAgICNjb25zb2xlLmxvZyBmcGF0aCwgbGluZVxuICAgICAgICAgIEBvcGVuUGF0aCBmcGF0aCwgbGluZVxuXG4gICAgQGVtaXR0ZXIub24gJ3Rhc2tzLmRlbGV0ZScsID0+XG4gICAgICB2aXNpYmxlVGFza3MgPSBAaW1kb25lUmVwby52aXNpYmxlVGFza3MoKVxuICAgICAgcmV0dXJuIHVubGVzcyB2aXNpYmxlVGFza3NcbiAgICAgIHJldHVybiB1bmxlc3Mgd2luZG93LmNvbmZpcm0gXCJpbWRvbmUgaXMgYWJvdXQgdG8gZGVsZXRlICN7dmlzaWJsZVRhc2tzLmxlbmd0aH0gdGFza3MuICBDb250aW51ZT9cIlxuICAgICAgQHNob3dNYXNrIFwiZGVsZXRpbmcgI3t2aXNpYmxlVGFza3MubGVuZ3RofSB0YXNrc1wiXG4gICAgICBAaW1kb25lUmVwby5kZWxldGVWaXNpYmxlVGFza3MgKGVycikgLT5cbiAgICAgICAgQGhpZGVNYXNrKClcblxuICAgIEBlbWl0dGVyLm9uICdyZWFkbWUub3BlbicsID0+XG4gICAgICBmaWxlID0gQGltZG9uZVJlcG8uZ2V0UmVhZG1lKClcbiAgICAgIHVubGVzcyBmaWxlXG4gICAgICAgIEBlbWl0dGVyLmVtaXQgJ2Vycm9yJywgJ1NvcnJ5IG5vIHJlYWRtZSA6KCdcbiAgICAgICAgcmV0dXJuXG4gICAgICBlbHNlXG4gICAgICAgIEBvcGVuUGF0aCBAaW1kb25lUmVwby5nZXRGdWxsUGF0aChmaWxlKVxuXG4gICAgQGVtaXR0ZXIub24gJ2NvbmZpZy5jbG9zZScsID0+XG4gICAgICBAYm9hcmRXcmFwcGVyLnJlbW92ZUNsYXNzICdzaGlmdC1ib3R0b20nXG4gICAgICBAYm9hcmRXcmFwcGVyLmNzcyAnYm90dG9tJywgJydcbiAgICAgIEBjbGVhclNlbGVjdGlvbigpXG5cbiAgICBAZW1pdHRlci5vbiAnY29uZmlnLm9wZW4nLCA9PlxuICAgICAgQGJvYXJkV3JhcHBlci5hZGRDbGFzcyAnc2hpZnQtYm90dG9tJ1xuXG4gICAgQGVtaXR0ZXIub24gJ3Jlc2l6ZS5jaGFuZ2UnLCAoaGVpZ2h0KSA9PlxuICAgICAgQGJvYXJkV3JhcHBlci5jc3MoJ2JvdHRvbScsIGhlaWdodCArICdweCcpXG5cbiAgICBAZW1pdHRlci5vbiAnem9vbScsIChkaXIpID0+IEB6b29tIGRpclxuXG4gICAgQG9uICdjbGljaycsICcuc291cmNlLWxpbmsnLCAgKGUpID0+XG4gICAgICBsaW5rID0gZS50YXJnZXRcbiAgICAgIEBvcGVuUGF0aCBsaW5rLmRhdGFzZXQudXJpLCBsaW5rLmRhdGFzZXQubGluZVxuXG4gICAgICBpZiBjb25maWcuZ2V0U2V0dGluZ3MoKS5zaG93Tm90aWZpY2F0aW9ucyAmJiAhJChsaW5rKS5oYXNDbGFzcygnaW5mby1saW5rJylcbiAgICAgICAgdGFza0lkID0gJChsaW5rKS5jbG9zZXN0KCcudGFzaycpLmF0dHIgJ2lkJ1xuICAgICAgICB0YXNrID0gQGltZG9uZVJlcG8uZ2V0VGFzayB0YXNrSWRcbiAgICAgICAgZmlsZSA9IEBpbWRvbmVSZXBvLmdldEZpbGVGb3JUYXNrKHRhc2spXG4gICAgICAgIGZ1bGxQYXRoID0gQGltZG9uZVJlcG8uZ2V0RnVsbFBhdGggZmlsZVxuICAgICAgICBsaW5lID0gdGFzay5saW5lXG4gICAgICAgIG5ld0xpbmsgPSAkKGxpbmsuY2xvbmVOb2RlKHRydWUpKTtcbiAgICAgICAgbmV3TGluay5hZGRDbGFzcyAnaW5mby1saW5rJ1xuICAgICAgICBkZXNjcmlwdGlvbiA9IFwiI3t0YXNrLnRleHR9XFxuXFxuI3tuZXdMaW5rWzBdLm91dGVySFRNTH1cIlxuXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvIHRhc2subGlzdCwgZGVzY3JpcHRpb246IGRlc2NyaXB0aW9uLCBkaXNtaXNzYWJsZTogdHJ1ZSwgaWNvbjogJ2NoZWNrJ1xuXG4gICAgQG9uICdjbGljaycsICcubGlzdC1uYW1lJywgKGUpID0+XG4gICAgICBuYW1lID0gZS50YXJnZXQuZGF0YXNldC5saXN0XG4gICAgICBAYm90dG9tVmlldy5lZGl0TGlzdE5hbWUobmFtZSlcblxuICAgIEBvbiAnY2xpY2snLCAnLmRlbGV0ZS1saXN0JywgKGUpID0+XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIHRhcmdldCA9IGUudGFyZ2V0XG4gICAgICBuYW1lID0gdGFyZ2V0LmRhdGFzZXQubGlzdCB8fCB0YXJnZXQucGFyZW50RWxlbWVudC5kYXRhc2V0Lmxpc3RcbiAgICAgIHJlcG8ucmVtb3ZlTGlzdChuYW1lKVxuXG4gICAgQG9uICdjbGljaycsICcuZmlsdGVyLWxpbmsnLCAoZSkgPT5cbiAgICAgIHRhcmdldCA9IGUudGFyZ2V0XG4gICAgICBmaWx0ZXIgPSB0YXJnZXQuZGF0YXNldC5maWx0ZXIgfHwgdGFyZ2V0LnBhcmVudEVsZW1lbnQuZGF0YXNldC5maWx0ZXJcbiAgICAgIEBzZXRGaWx0ZXIgZmlsdGVyXG5cbiAgICBAb24gJ2NsaWNrJywgJ1tocmVmXj1cIiNmaWx0ZXIvXCJdJywgKGUpID0+XG4gICAgICB0YXJnZXQgPSBlLnRhcmdldFxuICAgICAgdGFyZ2V0ID0gdGFyZ2V0LmNsb3Nlc3QoJ2EnKSB1bmxlc3MgKHRhcmdldC5ub2RlTmFtZSA9PSAnQScpXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgICBlLnByZXZlbnREZWZhdWx0KClcbiAgICAgIGZpbHRlckFyeSA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKS5zcGxpdCgnLycpO1xuICAgICAgZmlsdGVyQXJ5LnNoaWZ0KClcbiAgICAgIGZpbHRlciA9IGZpbHRlckFyeS5qb2luICcvJyA7XG4gICAgICBAc2V0RmlsdGVyIGZpbHRlclxuXG4gICAgQG9uICdjaGFuZ2UnLCAndWwuY2hlY2tsaXN0PmxpPmlucHV0W3R5cGU9Y2hlY2tib3hdJywgKGUpID0+XG4gICAgICB0YXJnZXQgPSBlLnRhcmdldFxuICAgICAgJHRhc2sgPSB0YXJnZXQuY2xvc2VzdCgnLnRhc2snKVxuICAgICAgdGFza0lkID0gJHRhc2suaWRcbiAgICAgIGl0ZW1zID0gJHRhc2sucXVlcnlTZWxlY3RvckFsbCgnLnRhc2stZGVzY3JpcHRpb24gLmNoZWNrbGlzdC1pdGVtJylcbiAgICAgIFtdLmZvckVhY2guY2FsbCBpdGVtcywgKGVsKSAtPlxuICAgICAgICBpZiAoZWwuY2hlY2tlZCkgdGhlbiBlbC5zZXRBdHRyaWJ1dGUoJ2NoZWNrZWQnLCB0cnVlKSBlbHNlIGVsLnJlbW92ZUF0dHJpYnV0ZSgnY2hlY2tlZCcpXG4gICAgICByZXBvLm1vZGlmeVRhc2tGcm9tSHRtbCByZXBvLmdldFRhc2sodGFza0lkKSwgJHRhc2sucXVlcnlTZWxlY3RvcignLnRhc2stdGV4dCcpLmlubmVySFRNTFxuXG4gICAgcGx1Z2luTWFuYWdlci5lbWl0dGVyLm9uICdwbHVnaW4uYWRkZWQnLCAoUGx1Z2luKSA9PlxuICAgICAgaWYgKHJlcG8uZ2V0Q29uZmlnKCkpXG4gICAgICAgIEBhZGRQbHVnaW4oUGx1Z2luKVxuICAgICAgZWxzZVxuICAgICAgICBAZW1pdHRlci5vbiAnaW5pdGlhbGl6ZWQnLCA9PiBAYWRkUGx1Z2luKFBsdWdpbilcblxuICAgIHBsdWdpbk1hbmFnZXIuZW1pdHRlci5vbiAncGx1Z2luLnJlbW92ZWQnLCAoUGx1Z2luKSA9PiBAcmVtb3ZlUGx1Z2luIFBsdWdpblxuXG4gICAgQGVtaXR0ZXIub24gJ2Nvbm5lY3Rvci5kaXNhYmxlZCcsIChjb25uZWN0b3IpID0+IEByZW1vdmVQbHVnaW5CeVByb3ZpZGVyIGNvbm5lY3Rvci5uYW1lXG4gICAgQGVtaXR0ZXIub24gJ2Nvbm5lY3Rvci5lbmFibGVkJywgKGNvbm5lY3RvcikgPT4gQGFkZFBsdWdpbkJ5UHJvdmlkZXIgY29ubmVjdG9yLm5hbWVcbiAgICBAZW1pdHRlci5vbiAncHJvZHVjdC51bmxpbmtlZCcsIChwcm9kdWN0KSA9PiBAcmVtb3ZlUGx1Z2luQnlQcm92aWRlciBwcm9kdWN0Lm5hbWVcbiAgICBAZW1pdHRlci5vbiAnY29ubmVjdG9yLmNoYW5nZWQnLCAocHJvZHVjdCkgPT5cbiAgICAgIEBhZGRQbHVnaW5CeVByb3ZpZGVyIHByb2R1Y3QuY29ubmVjdG9yLm5hbWVcbiAgICAgIGZvciBuYW1lLCBwbHVnaW4gb2YgQHBsdWdpbnNcbiAgICAgICAgcGx1Z2luLnNldENvbm5lY3RvciBwcm9kdWN0LmNvbm5lY3RvciBpZiBwbHVnaW4uY29uc3RydWN0b3IucHJvdmlkZXIgPT0gcHJvZHVjdC5uYW1lXG5cbiAgICBAZW1pdHRlci5vbiAnbG9nb2ZmJywgPT4gcGx1Z2luTWFuYWdlci5yZW1vdmVEZWZhdWx0UGx1Z2lucygpXG4gICAgQGVtaXR0ZXIub24gJ3Byb2plY3QucmVtb3ZlZCcsID0+IHBsdWdpbk1hbmFnZXIucmVtb3ZlRGVmYXVsdFBsdWdpbnMoKVxuXG5cbiAgYWRkUGx1Z2luQnV0dG9uczogLT5cbiAgICBAYWRkUGx1Z2luVGFza0J1dHRvbnMoKVxuICAgIEBhZGRQbHVnaW5Qcm9qZWN0QnV0dG9ucygpXG5cbiAgYWRkUGx1Z2luVGFza0J1dHRvbnM6IC0+XG4gICAgQGJvYXJkLmZpbmQoJy5pbWRvbmUtdGFzay1wbHVnaW5zJykuZW1wdHkoKVxuICAgIHJldHVybiB1bmxlc3MgQGhhc1BsdWdpbnMoKVxuICAgIHBsdWdpbnMgPSBAcGx1Z2luc1xuICAgIEBib2FyZC5maW5kKCcudGFzaycpLmVhY2ggLT5cbiAgICAgICR0YXNrID0gJCh0aGlzKVxuICAgICAgJHRhc2tQbHVnaW5zID0gJHRhc2suZmluZCAnLmltZG9uZS10YXNrLXBsdWdpbnMnXG4gICAgICBpZCA9ICR0YXNrLmF0dHIoJ2lkJylcbiAgICAgIGZvciBuYW1lLCBwbHVnaW4gb2YgcGx1Z2luc1xuICAgICAgICBpZiB0eXBlb2YgcGx1Z2luLnRhc2tCdXR0b24gaXMgJ2Z1bmN0aW9uJ1xuICAgICAgICAgICRidXR0b24gPSBwbHVnaW4udGFza0J1dHRvbihpZClcbiAgICAgICAgICBpZiAkYnV0dG9uXG4gICAgICAgICAgICBpZiAkYnV0dG9uLmNsYXNzTGlzdFxuICAgICAgICAgICAgICAkYnV0dG9uLmNsYXNzTGlzdC5hZGQgJ3Rhc2stcGx1Z2luLWJ1dHRvbidcbiAgICAgICAgICAgIGVsc2UgJGJ1dHRvbi5hZGRDbGFzcyAndGFzay1wbHVnaW4tYnV0dG9uJ1xuICAgICAgICAgICAgJHRhc2tQbHVnaW5zLmFwcGVuZCAkYnV0dG9uXG5cbiAgYWRkUGx1Z2luUHJvamVjdEJ1dHRvbnM6IC0+IEBtZW51Vmlldy5hZGRQbHVnaW5Qcm9qZWN0QnV0dG9ucyBAcGx1Z2luc1xuXG4gIGFkZFBsdWdpblZpZXc6IChwbHVnaW4pIC0+XG4gICAgcmV0dXJuIHVubGVzcyBwbHVnaW4uZ2V0Vmlld1xuICAgIEBib3R0b21WaWV3LmFkZFBsdWdpbiBwbHVnaW5cblxuICBpbml0UGx1Z2luVmlldzogKHBsdWdpbikgLT5cbiAgICBAYWRkUGx1Z2luQnV0dG9ucygpXG4gICAgQGFkZFBsdWdpblZpZXcgcGx1Z2luXG5cbiAgYWRkUGx1Z2luOiAoUGx1Z2luKSAtPlxuICAgIHJldHVybiB1bmxlc3MgUGx1Z2luXG4gICAgQGltZG9uZVJlcG8uZ2V0UHJvZHVjdCBQbHVnaW4ucHJvdmlkZXIsIChlcnIsIHByb2R1Y3QpID0+XG4gICAgICByZXR1cm4gaWYgZXJyIHx8IChwcm9kdWN0ICYmICFwcm9kdWN0LmlzRW5hYmxlZCgpKVxuICAgICAgY29ubmVjdG9yID0gcHJvZHVjdCAmJiBwcm9kdWN0LmNvbm5lY3RvclxuICAgICAgaWYgQHBsdWdpbnNbUGx1Z2luLnBsdWdpbk5hbWVdXG4gICAgICAgIEBhZGRQbHVnaW5CdXR0b25zKClcbiAgICAgIGVsc2VcbiAgICAgICAgcGx1Z2luID0gbmV3IFBsdWdpbiBAaW1kb25lUmVwbywgQHZpZXdJbnRlcmZhY2UsIGNvbm5lY3RvclxuICAgICAgICBAcGx1Z2luc1tQbHVnaW4ucGx1Z2luTmFtZV0gPSBwbHVnaW5cbiAgICAgICAgQGltZG9uZVJlcG8uYWRkUGx1Z2luIHBsdWdpblxuICAgICAgICBpZiBwbHVnaW4gaW5zdGFuY2VvZiBFbWl0dGVyXG4gICAgICAgICAgaWYgcGx1Z2luLmlzUmVhZHkoKVxuICAgICAgICAgICAgQGluaXRQbHVnaW5WaWV3IHBsdWdpblxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHBsdWdpbi5vbiAncmVhZHknLCA9PiBAaW5pdFBsdWdpblZpZXcgcGx1Z2luXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBAaW5pdFBsdWdpblZpZXcgcGx1Z2luXG5cbiAgYWRkUGx1Z2luQnlQcm92aWRlcjogKHByb3ZpZGVyKSAtPlxuICAgIEBhZGRQbHVnaW4gcGx1Z2luTWFuYWdlci5nZXRCeVByb3ZpZGVyKHByb3ZpZGVyKVxuXG4gIHJlbW92ZVBsdWdpbjogKFBsdWdpbikgLT5cbiAgICByZXR1cm4gdW5sZXNzIFBsdWdpblxuICAgIHBsdWdpbiA9IEBwbHVnaW5zW1BsdWdpbi5wbHVnaW5OYW1lXVxuICAgIEBpbWRvbmVSZXBvLnJlbW92ZVBsdWdpbiBwbHVnaW5cbiAgICBAYm90dG9tVmlldy5yZW1vdmVQbHVnaW4gcGx1Z2luIGlmIHBsdWdpbiAmJiBwbHVnaW4uZ2V0Vmlld1xuICAgIGRlbGV0ZSBAcGx1Z2luc1tQbHVnaW4ucGx1Z2luTmFtZV1cbiAgICBAYWRkUGx1Z2luQnV0dG9ucygpXG5cbiAgcmVtb3ZlUGx1Z2luQnlQcm92aWRlcjogKHByb3ZpZGVyKSAtPlxuICAgIEByZW1vdmVQbHVnaW4gcGx1Z2luTWFuYWdlci5nZXRCeVByb3ZpZGVyKHByb3ZpZGVyKVxuXG4gIGhhc1BsdWdpbnM6IC0+XG4gICAgT2JqZWN0LmtleXMoQHBsdWdpbnMpLmxlbmd0aCA+IDBcblxuICBzZXRGaWx0ZXI6ICh0ZXh0KSAtPlxuICAgIEBtZW51Vmlldy5zZXRGaWx0ZXIgdGV4dFxuICAgIEBtZW51Vmlldy5vcGVuTWVudSgpXG4gICAgQGJvYXJkV3JhcHBlci5hZGRDbGFzcyAnc2hpZnQnXG5cbiAgZ2V0RmlsdGVyOiAtPiBAbWVudVZpZXcuZ2V0RmlsdGVyKClcblxuICBmaWx0ZXI6ICh0ZXh0KSAtPlxuICAgIHRleHQgPSBAZ2V0RmlsdGVyKCkgdW5sZXNzIHRleHRcbiAgICBAbGFzdEZpbHRlciA9IHRleHRcbiAgICBpZiB0ZXh0ID09ICcnXG4gICAgICBAYm9hcmQuZmluZCgnLnRhc2snKS5zaG93KClcbiAgICBlbHNlXG4gICAgICBAYm9hcmQuZmluZCgnLnRhc2snKS5oaWRlKClcbiAgICAgIEBmaWx0ZXJCeVBhdGggdGV4dFxuICAgICAgQGZpbHRlckJ5Q29udGVudCB0ZXh0XG4gICAgQGVtaXR0ZXIuZW1pdCAnYm9hcmQudXBkYXRlJ1xuXG4gIGZpbHRlckJ5UGF0aDogKHRleHQpIC0+IEBib2FyZC5maW5kKHV0aWwuZm9ybWF0KCcudGFzazphdHRyQ29udGFpbnNSZWdleChkYXRhLXBhdGgsJXMpJywgdGV4dCkpLmVhY2ggLT4gJCh0aGlzKS5zaG93KCkuYXR0cignaWQnKVxuXG4gIGZpbHRlckJ5Q29udGVudDogKHRleHQpIC0+IEBib2FyZC5maW5kKHV0aWwuZm9ybWF0KCcudGFzay1mdWxsLXRleHQ6Y29udGFpbnNSZWdleChcIiVzXCIpJywgdGV4dCkpLmVhY2ggLT4gJCh0aGlzKS5jbG9zZXN0KCcudGFzaycpLnNob3coKS5hdHRyKCdpZCcpXG5cbiAgdmlzaWJsZVRhc2tzOiAobGlzdE5hbWUpIC0+XG4gICAgcmV0dXJuIFtdIHVubGVzcyBAaW1kb25lUmVwb1xuICAgIEBpbWRvbmVSZXBvLnZpc2libGVUYXNrcyBsaXN0TmFtZVxuXG4gIGluaXRJbWRvbmU6ICgpIC0+XG4gICAgaWYgQGltZG9uZVJlcG8uaW5pdGlhbGl6ZWRcbiAgICAgIEBvblJlcG9VcGRhdGUoQGltZG9uZVJlcG8uZ2V0VGFza3MoKSlcbiAgICAgIEBtZW51Vmlldy51cGRhdGVNZW51KClcbiAgICAgIEBpbWRvbmVSZXBvLmluaXRQcm9kdWN0cygpXG4gICAgICByZXR1cm5cbiAgICBpZiBAbnVtRmlsZXMgPiAxMDAwXG4gICAgICBAaWdub3JlUHJvbXB0LmhpZGUoKVxuICAgICAgQHByb2dyZXNzQ29udGFpbmVyLnNob3coKVxuICAgICAgQGVtaXR0ZXIub24gJ2ZpbGUucmVhZCcsIChkYXRhKSA9PlxuICAgICAgICBjb21wbGV0ZSA9IE1hdGguY2VpbCAoZGF0YS5jb21wbGV0ZWQvQG51bUZpbGVzKSoxMDBcbiAgICAgICAgQHByb2dyZXNzLmF0dHIgJ3ZhbHVlJywgY29tcGxldGVcbiAgICBAaW1kb25lUmVwby5pbml0KClcblxuICBvcGVuSWdub3JlOiAoKSAtPlxuICAgIGlnbm9yZVBhdGggPSBwYXRoLmpvaW4oQGltZG9uZVJlcG8ucGF0aCwgJy5pbWRvbmVpZ25vcmUnKVxuICAgIGl0ZW0gPSBAXG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbihpZ25vcmVQYXRoLCBzcGxpdDogJ2xlZnQnKS50aGVuID0+XG4gICAgICBpdGVtLmRlc3Ryb3koKVxuXG4gIG9uUmVwb1VwZGF0ZTogKHRhc2tzKSAtPlxuICAgICMgQkFDS0xPRzogVGhpcyBzaG91bGQgYmUgcXVldWVkIHNvIHR3byB1cGRhdGVzIGRvbid0IGNvbGlkZSBnaDoyNDEgaWQ6OTBcbiAgICBAdXBkYXRlQm9hcmQodGFza3MpXG4gICAgQGJvYXJkV3JhcHBlci5jc3MgJ2JvdHRvbScsIDBcbiAgICBAYm90dG9tVmlldy5hdHRyICdzdHlsZScsICcnXG4gICAgQGxvYWRpbmcuaGlkZSgpXG4gICAgQG1haW5Db250YWluZXIuc2hvdygpXG4gICAgQGhpZGVNYXNrKClcblxuICBzaG93TWFzazogKG1zZyktPlxuICAgIEBzcGlubmVyTWVzc2FnZS5odG1sIG1zZyBpZiBtc2dcbiAgICBAbWFzay5zaG93KClcblxuICBoaWRlTWFzazogLT4gQG1hc2suaGlkZSgpIGlmIEBtYXNrXG5cbiAgZ2VuRmlsdGVyTGluazogKG9wdHMpIC0+XG4gICAgbGlua1ByZWZpeCA9IGlmIG9wdHMuZGlzcGxheVByZWZpeCB0aGVuIG9wdHMubGlua1ByZWZpeCBlbHNlIFwiXCJcbiAgICAkbGluayA9ICRlbC5hIGhyZWY6XCIjXCIsIHRpdGxlOiBcImp1c3Qgc2hvdyBtZSB0YXNrcyB3aXRoICN7b3B0cy5saW5rVGV4dH1cIiwgY2xhc3M6IFwiZmlsdGVyLWxpbmtcIixcbiAgICAgICRlbC5zcGFuIGNsYXNzOiBvcHRzLmxpbmtDbGFzcywgXCIje2xpbmtQcmVmaXh9I3tvcHRzLmxpbmtUZXh0fVwiXG4gICAgJGxpbmsuZGF0YXNldC5maWx0ZXIgPSBvcHRzLmxpbmtQcmVmaXgucmVwbGFjZSggXCIrXCIsIFwiXFxcXCtcIiApK29wdHMubGlua1RleHRcbiAgICAkbGlua1xuICAjIFRPRE86IFVzZSB3ZWIgY29tcG9uZW50cyB0byBtYWtlIHRoZSBVSSBtb3JlIHRlc3RhYmxlIGFuZCBwb3J0YWJsZS4gK2VuaGFuY2VtZW50IGdoOjI5NyBpZDo3NVxuICAjIC0gQ3JlYXRlIGEgdGFzayBjb21wb25lbnRcbiAgIyAtIFdyaXRlIHRhc2sgY29tcG9uZW50IHRlc3RzXG4gICMgLSBVc2UgdGhlIG5ldyBjb21wb25lbnQgaW4gdGhlIFVJXG4gIGdldFRhc2s6ICh0YXNrKSA9PlxuICAgIHNlbGYgPSBAO1xuICAgIHJlcG8gPSBAaW1kb25lUmVwb1xuICAgIGNvbnRleHRzID0gdGFzay5nZXRDb250ZXh0KClcbiAgICB0YWdzID0gdGFzay5nZXRUYWdzKClcbiAgICBkYXRlRHVlID0gdGFzay5nZXREYXRlRHVlKClcbiAgICBkYXRlQ3JlYXRlZCA9IHRhc2suZ2V0RGF0ZUNyZWF0ZWQoKVxuICAgIGRhdGVDb21wbGV0ZWQgPSB0YXNrLmdldERhdGVDb21wbGV0ZWQoKVxuICAgICR0YXNrVGV4dCA9ICRlbC5kaXYgY2xhc3M6ICd0YXNrLXRleHQgbmF0aXZlLWtleS1iaW5kaW5ncydcbiAgICAkZmlsdGVycyA9ICRlbC5kaXYgY2xhc3M6ICd0YXNrLWZpbHRlcnMnXG4gICAgJHRhc2tNZXRhVGFibGUgPSAkZWwudGFibGUoKVxuICAgICR0YXNrTWV0YSA9ICRlbC5kaXYgY2xhc3M6ICd0YXNrLW1ldGEnLCAkdGFza01ldGFUYWJsZVxuICAgIG9wdHMgPSAkLmV4dGVuZCB7fSwge3N0cmlwTWV0YTogdHJ1ZSwgc3RyaXBEYXRlczogdHJ1ZSwgc2FuaXRpemU6IHRydWV9LCByZXBvLmdldENvbmZpZygpLm1hcmtlZFxuICAgIHRhc2tIdG1sID0gdGFzay5nZXRIdG1sKG9wdHMpXG4gICAgc2hvd1RhZ3NJbmxpbmUgPSBjb25maWcuZ2V0U2V0dGluZ3MoKS5zaG93VGFnc0lubGluZVxuICAgIGlmIHNob3dUYWdzSW5saW5lXG4gICAgICBpZiBjb250ZXh0c1xuICAgICAgICBmb3IgY29udGV4dCwgaSBpbiBjb250ZXh0c1xuICAgICAgICAgIGRvIChjb250ZXh0LCBpKSA9PlxuICAgICAgICAgICAgJGxpbmsgPSBAZ2VuRmlsdGVyTGluayBsaW5rUHJlZml4OiBcIkBcIiwgbGlua1RleHQ6IGNvbnRleHQsIGxpbmtDbGFzczogXCJ0YXNrLWNvbnRleHRcIiwgZGlzcGxheVByZWZpeDogdHJ1ZVxuICAgICAgICAgICAgdGFza0h0bWwgPSB0YXNrSHRtbC5yZXBsYWNlKCBcIkAje2NvbnRleHR9XCIsICRlbC5kaXYoJGxpbmspLmlubmVySFRNTCApXG5cbiAgICAgIGlmIHRhZ3NcbiAgICAgICAgZm9yIHRhZywgaSBpbiB0YWdzXG4gICAgICAgICAgZG8gKHRhZywgaSkgPT5cbiAgICAgICAgICAgICRsaW5rID0gQGdlbkZpbHRlckxpbmsgbGlua1ByZWZpeDogXCIrXCIsIGxpbmtUZXh0OiB0YWcsIGxpbmtDbGFzczogXCJ0YXNrLXRhZ3NcIiwgZGlzcGxheVByZWZpeDogdHJ1ZVxuICAgICAgICAgICAgdGFza0h0bWwgPSB0YXNrSHRtbC5yZXBsYWNlKCBcIisje3RhZ31cIiwgJGVsLmRpdigkbGluaykuaW5uZXJIVE1MIClcbiAgICBlbHNlXG4gICAgICB0YXNrSHRtbCA9IHRhc2suZ2V0SHRtbCAkLmV4dGVuZCh7c3RyaXBUYWdzOiB0cnVlLCBzdHJpcENvbnRleHQ6IHRydWV9LCBvcHRzKVxuICAgICAgaWYgY29udGV4dHNcbiAgICAgICAgJGRpdiA9ICRlbC5kaXYoKVxuICAgICAgICAkZmlsdGVycy5hcHBlbmRDaGlsZCAkZGl2XG4gICAgICAgIGZvciBjb250ZXh0LCBpIGluIGNvbnRleHRzXG4gICAgICAgICAgZG8gKGNvbnRleHQsIGkpID0+XG4gICAgICAgICAgICAkZGl2LmFwcGVuZENoaWxkKHNlbGYuZ2VuRmlsdGVyTGluayBsaW5rUHJlZml4OiBcIkBcIiwgbGlua1RleHQ6IGNvbnRleHQsIGxpbmtDbGFzczogXCJ0YXNrLWNvbnRleHRcIilcbiAgICAgICAgICAgICRkaXYuYXBwZW5kQ2hpbGQoJGVsLnNwYW4gXCIsIFwiKSBpZiAoaSA8IGNvbnRleHRzLmxlbmd0aC0xKVxuICAgICAgaWYgdGFnc1xuICAgICAgICAkZGl2ID0gJGVsLmRpdigpXG4gICAgICAgICRmaWx0ZXJzLmFwcGVuZENoaWxkICRkaXZcbiAgICAgICAgZm9yIHRhZywgaSBpbiB0YWdzXG4gICAgICAgICAgZG8gKHRhZywgaSkgPT5cbiAgICAgICAgICAgICRkaXYuYXBwZW5kQ2hpbGQoc2VsZi5nZW5GaWx0ZXJMaW5rIGxpbmtQcmVmaXg6IFwiK1wiLCBsaW5rVGV4dDogdGFnLCBsaW5rQ2xhc3M6IFwidGFzay10YWdzXCIpXG4gICAgICAgICAgICAkZGl2LmFwcGVuZENoaWxkKCRlbC5zcGFuIFwiLCBcIikgaWYgKGkgPCB0YWdzLmxlbmd0aC0xKVxuXG4gICAgJHRhc2tUZXh0LmlubmVySFRNTCA9IHRhc2tIdG1sXG5cbiAgICBpZiBkYXRlQ3JlYXRlZFxuICAgICAgJHRyID0gJGVsLnRyIGNsYXNzOidtZXRhLWRhdGEtcm93JyxcbiAgICAgICAgJGVsLnRkIFwiY3JlYXRlZFwiXG4gICAgICAgICRlbC50ZCBkYXRlQ3JlYXRlZFxuICAgICAgICAkZWwudGQgY2xhc3M6ICdtZXRhLWZpbHRlcicsXG4gICAgICAgICAgJGVsLmEgaHJlZjpcIiNcIiwgdGl0bGU6IFwiZmlsdGVyIGJ5IGNyZWF0ZWQgb24gI3tkYXRlQ3JlYXRlZH1cIiwgY2xhc3M6IFwiZmlsdGVyLWxpbmtcIiwgXCJkYXRhLWZpbHRlclwiOiBcIih4XFxcXHNcXFxcZHs0fS1cXFxcZHsyfS1cXFxcZHsyfVxcXFxzKT8je2RhdGVDcmVhdGVkfVwiLFxuICAgICAgICAgICAgJGVsLnNwYW4gY2xhc3M6XCJpY29uIGljb24tbGlnaHQtYnVsYlwiXG4gICAgICAkdGFza01ldGFUYWJsZS5hcHBlbmRDaGlsZCAkdHJcbiAgICBpZiBkYXRlQ29tcGxldGVkXG4gICAgICAkdHIgPSAkZWwudHIgY2xhc3M6J21ldGEtZGF0YS1yb3cnLFxuICAgICAgICAkZWwudGQgXCJjb21wbGV0ZWRcIlxuICAgICAgICAkZWwudGQgZGF0ZUNvbXBsZXRlZFxuICAgICAgICAkZWwudGQgY2xhc3M6ICdtZXRhLWZpbHRlcicsXG4gICAgICAgICAgJGVsLmEgaHJlZjpcIiNcIiwgdGl0bGU6IFwiZmlsdGVyIGJ5IGNvbXBsZXRlZCBvbiAje2RhdGVDb21wbGV0ZWR9XCIsIGNsYXNzOiBcImZpbHRlci1saW5rXCIsIFwiZGF0YS1maWx0ZXJcIjogXCJ4ICN7ZGF0ZUNvbXBsZXRlZH1cIixcbiAgICAgICAgICAgICRlbC5zcGFuIGNsYXNzOlwiaWNvbiBpY29uLWxpZ2h0LWJ1bGJcIlxuICAgICAgJHRhc2tNZXRhVGFibGUuYXBwZW5kQ2hpbGQgJHRyXG5cbiAgICBmb3IgZGF0YSBpbiB0YXNrLmdldE1ldGFEYXRhV2l0aExpbmtzKHJlcG8uZ2V0Q29uZmlnKCkpXG4gICAgICBkbyAoZGF0YSkgPT5cbiAgICAgICAgJGljb25zID0gJGVsLnRkKClcbiAgICAgICAgaWYgZGF0YS5saW5rXG4gICAgICAgICAgJGxpbmsgPSAkZWwuYSBocmVmOiBkYXRhLmxpbmsudXJsLCB0aXRsZTogZGF0YS5saW5rLnRpdGxlLFxuICAgICAgICAgICAgJGVsLnNwYW4gY2xhc3M6XCJpY29uICN7ZGF0YS5saW5rLmljb24gfHwgJ2ljb24tbGluay1leHRlcm5hbCd9XCJcbiAgICAgICAgICAkaWNvbnMuYXBwZW5kQ2hpbGQgJGxpbmtcbiAgICAgICAgJGZpbHRlckxpbmsgPSAkZWwuYSBocmVmOlwiI1wiLCB0aXRsZTogXCJqdXN0IHNob3cgbWUgdGFza3Mgd2l0aCAje2RhdGEua2V5fToje2RhdGEudmFsdWV9XCIsIGNsYXNzOiBcImZpbHRlci1saW5rXCIsIFwiZGF0YS1maWx0ZXJcIjogXCIje2RhdGEua2V5fToje2RhdGEudmFsdWV9XCIsXG4gICAgICAgICAgJGVsLnNwYW4gY2xhc3M6XCJpY29uIGljb24tbGlnaHQtYnVsYlwiXG4gICAgICAgICRpY29ucy5hcHBlbmRDaGlsZCAkZmlsdGVyTGlua1xuXG4gICAgICAgICR0ciA9ICRlbC50ciBjbGFzczonbWV0YS1kYXRhLXJvdycsXG4gICAgICAgICAgJGVsLnRkIGRhdGEua2V5XG4gICAgICAgICAgJGVsLnRkIGRhdGEudmFsdWVcbiAgICAgICAgICAkaWNvbnNcbiAgICAgICAgJHRhc2tNZXRhVGFibGUuYXBwZW5kQ2hpbGQgJHRyXG5cbiAgICAkZWwubGkgY2xhc3M6ICd0YXNrIHdlbGwgbmF0aXZlLWtleS1iaW5kaW5ncycsIGlkOiBcIiN7dGFzay5pZH1cIiwgdGFiaW5kZXg6IC0xLCBcImRhdGEtcGF0aFwiOiB0YXNrLnNvdXJjZS5wYXRoLCBcImRhdGEtbGluZVwiOiB0YXNrLmxpbmUsXG4gICAgICAkZWwuZGl2IGNsYXNzOiAnaW1kb25lLXRhc2stcGx1Z2lucydcbiAgICAgICRlbC5kaXYgY2xhc3M6ICd0YXNrLWZ1bGwtdGV4dCBoaWRkZW4nLCB0YXNrLmdldFRleHRBbmREZXNjcmlwdGlvbigpXG4gICAgICAkdGFza1RleHRcbiAgICAgICRmaWx0ZXJzXG4gICAgICAkdGFza01ldGFcbiAgICAgICRlbC5kaXYgY2xhc3M6ICd0YXNrLXNvdXJjZScsXG4gICAgICAgICRlbC5hIGhyZWY6ICcjJywgY2xhc3M6ICdzb3VyY2UtbGluaycsIHRpdGxlOiAndGFrZSBtZSB0byB0aGUgc291cmNlJywgJ2RhdGEtdXJpJzogXCIje3JlcG8uZ2V0RnVsbFBhdGgodGFzay5zb3VyY2UucGF0aCl9XCIsICdkYXRhLWxpbmUnOiB0YXNrLmxpbmUsIFwiI3t0YXNrLnNvdXJjZS5wYXRoICsgJzonICsgdGFzay5saW5lfVwiXG4gICAgICAgICRlbC5zcGFuICcgfCAnXG4gICAgICAgICRlbC5hIGhyZWY6XCIjXCIsIHRpdGxlOiBcImp1c3Qgc2hvdyBtZSB0YXNrcyBpbiAje3Rhc2suc291cmNlLnBhdGh9XCIsIGNsYXNzOiBcImZpbHRlci1saW5rXCIsIFwiZGF0YS1maWx0ZXJcIjogXCIje3Rhc2suc291cmNlLnBhdGh9XCIsXG4gICAgICAgICAgJGVsLnNwYW4gY2xhc3M6XCJpY29uIGljb24tbGlnaHQtYnVsYlwiXG5cbiAgZ2V0TGlzdDogKGxpc3QpID0+XG4gICAgc2VsZiA9IEBcbiAgICByZXBvID0gQGltZG9uZVJlcG9cbiAgICB0YXNrcyA9IHJlcG8uZ2V0VGFza3NJbkxpc3QobGlzdC5uYW1lKVxuICAgICRsaXN0ID0gJCQgLT5cbiAgICAgIEBkaXYgY2xhc3M6ICd0b3AgbGlzdCB3ZWxsJywgJ2RhdGEtbmFtZSc6IGxpc3QubmFtZSwgPT5cbiAgICAgICAgQGRpdiBjbGFzczogJ2xpc3QtbmFtZS13cmFwcGVyIHdlbGwnLCA9PlxuICAgICAgICAgIEBkaXYgY2xhc3M6ICdsaXN0LW5hbWUnLCAnZGF0YS1saXN0JzogbGlzdC5uYW1lLCB0aXRsZTogXCJJIGRvbid0IGxpa2UgdGhpcyBuYW1lXCIsID0+XG4gICAgICAgICAgICBAcmF3IGxpc3QubmFtZVxuXG4gICAgICAgICAgICBpZiAodGFza3MubGVuZ3RoIDwgMSlcbiAgICAgICAgICAgICAgQGEgaHJlZjogJyMnLCB0aXRsZTogXCJkZWxldGUgI3tsaXN0Lm5hbWV9XCIsIGNsYXNzOiAnZGVsZXRlLWxpc3QnLCBcImRhdGEtbGlzdFwiOiBsaXN0Lm5hbWUsID0+XG4gICAgICAgICAgICAgICAgQHNwYW4gY2xhc3M6J2ljb24gaWNvbi10cmFzaGNhbidcbiAgICAgICAgQG9sIGNsYXNzOiAndGFza3MnLCBcImRhdGEtbGlzdFwiOlwiI3tsaXN0Lm5hbWV9XCIsID0+XG4gICAgJHRhc2tzID0gJGxpc3QuZmluZCgnLnRhc2tzJylcbiAgICAkdGFza3MuYXBwZW5kKHNlbGYuZ2V0VGFzayB0YXNrKSBmb3IgdGFzayBpbiB0YXNrc1xuICAgICRsaXN0XG5cbiAgbGlzdE9uQm9hcmQ6IChuYW1lKSAtPiBAYm9hcmQuZmluZCBcIi5saXN0W2RhdGEtbmFtZT0nI3tuYW1lfSddIG9sLnRhc2tzXCJcblxuICBhZGRMaXN0VG9Cb2FyZDogKG5hbWUpIC0+XG4gICAgcG9zaXRpb24gPSBfLmZpbmRJbmRleCBAaW1kb25lUmVwby5nZXRMaXN0cygpLCBuYW1lOiBuYW1lXG4gICAgbGlzdCA9IF8uZmluZCBAaW1kb25lUmVwby5nZXRMaXN0cygpLCBuYW1lOiBuYW1lXG4gICAgQGJvYXJkLmZpbmQoXCIubGlzdDplcSgje3Bvc2l0aW9ufSlcIikuYWZ0ZXIoQGdldExpc3QgbGlzdClcblxuICBhZGRUYXNrVG9Cb2FyZDogKHRhc2spIC0+XG4gICAgQGxpc3RPbkJvYXJkKHRhc2subGlzdCkucHJlcGVuZCBAZ2V0VGFzayB0YXNrXG5cbiAgYWRkVGFza3NUb0JvYXJkOiAodGFza3MpIC0+XG4gICAgbGlzdHMgPSBfLmdyb3VwQnkgdGFza3MsICdsaXN0J1xuICAgIGZvciBsaXN0TmFtZSwgbGlzdE9mVGFza3Mgb2YgbGlzdHNcbiAgICAgIGlmIEBsaXN0T25Cb2FyZChsaXN0TmFtZSkubGVuZ3RoID09IDBcbiAgICAgICAgQGFkZExpc3RUb0JvYXJkIGxpc3ROYW1lXG4gICAgICBlbHNlIEBhZGRUYXNrVG9Cb2FyZCB0YXNrIGZvciB0YXNrIGluIGxpc3RPZlRhc2tzXG5cbiAgdXBkYXRlVGFza3NPbkJvYXJkOiAodGFza3MpIC0+XG4gICAgcmV0dXJuIGZhbHNlIGlmIHRhc2tzLmxlbmd0aCA9PSAwXG4gICAgcmV0dXJuIGZhbHNlIGlmIHRhc2tzLmxlbmd0aCA9PSBAaW1kb25lUmVwby5nZXRUYXNrcygpLmxlbmd0aFxuICAgIHNlbGYgPSBAXG4gICAgQGRlc3Ryb3lTb3J0YWJsZXMoKVxuICAgIHRhc2tzQnlMaXN0ID0gXy5ncm91cEJ5IHRhc2tzLCAnbGlzdCdcbiAgICBpZiBfLmtleXModGFza3NCeUxpc3QpLmxlbmd0aCA9PSAxXG4gICAgICBsaXN0TmFtZSA9IHRhc2tzWzBdLmxpc3RcbiAgICAgIHNlbGYuYm9hcmQuZmluZChcIi5saXN0W2RhdGEtbmFtZT0nI3tsaXN0TmFtZX0nXVwiKS5yZW1vdmUoKVxuICAgICAgQGFkZFRhc2tzVG9Cb2FyZCBAaW1kb25lUmVwby5nZXRUYXNrc0luTGlzdChsaXN0TmFtZSlcbiAgICBlbHNlXG4gICAgICAjIFVwZGF0ZSB0YXNrcyBieSBmaWxlXG4gICAgICBmaWxlcyA9IF8udW5pcShfLm1hcCB0YXNrcywgJ3NvdXJjZS5wYXRoJylcbiAgICAgIHRhc2tzSW5GaWxlcyA9IFtdXG4gICAgICBmb3IgZmlsZSBpbiBmaWxlc1xuICAgICAgICAjIFJlbW92ZSBUYXNrcyBmb3IgZWFjaCBmaWxlIGJ5IGRhdGEtcGF0aCBhdHRyaWJ1dGVcbiAgICAgICAgQGJvYXJkLmZpbmQoXCJsaVtkYXRhLXBhdGg9JyN7ZmlsZX0nXVwiKS5yZW1vdmUoKVxuICAgICAgICAjIEFkZCB0YXNrcyBmcm9tIGFsbCBmaWxlcy4uLlxuICAgICAgICB0YXNrc0luRmlsZXMgPSB0YXNrc0luRmlsZXMuY29uY2F0IEBpbWRvbmVSZXBvLmdldEZpbGUoZmlsZSkuZ2V0VGFza3MoKVxuICAgICAgQGFkZFRhc2tzVG9Cb2FyZCB0YXNrc0luRmlsZXNcbiAgICAjIHJlbW92ZSBsaXN0cyB0aGF0IGFyZSBoaWRkZW5cbiAgICBAYm9hcmQuZmluZCgnLmxpc3QnKS5lYWNoIC0+XG4gICAgICAkbGlzdCA9ICQodGhpcylcbiAgICAgIGxpc3ROYW1lID0gJGxpc3QuYXR0ciAnZGF0YS1uYW1lJ1xuICAgICAgJGxpc3QucmVtb3ZlKCkgdW5sZXNzIHNlbGYuaW1kb25lUmVwby5pc0xpc3RWaXNpYmxlIGxpc3ROYW1lXG4gICAgQGFkZFBsdWdpbkJ1dHRvbnMoKVxuICAgIEBtYWtlVGFza3NTb3J0YWJsZSgpXG4gICAgQGhpZGVNYXNrKClcbiAgICBAZW1pdHRlci5lbWl0ICdib2FyZC51cGRhdGUnXG5cblxuICAjIEJBQ0tMT0c6IFNwbGl0IHRoaXMgYXBhcnQgaW50byBpdCdzIG93biBjbGFzcyB0byBzaW1wbGlmeS4gQ2FsbCBpdCBCb2FyZFZpZXcgK3JlZmFjdG9yIGdoOjI0NiBpZDo4NFxuICB1cGRhdGVCb2FyZDogKHRhc2tzKSAtPlxuICAgICMgVE9ETzogT25seSB1cGRhdGUgYm9hcmQgd2l0aCBjaGFuZ2VkIHRhc2tzIGdoOjIwNSArbWFzdGVyIGlkOjk5XG4gICAgIyByZXR1cm4gaWYgQHVwZGF0ZVRhc2tzT25Cb2FyZCB0YXNrc1xuICAgIHNlbGYgPSBAXG4gICAgQGRlc3Ryb3lTb3J0YWJsZXMoKVxuICAgIEBib2FyZC5lbXB0eSgpLmhpZGUoKVxuICAgIHJlcG8gPSBAaW1kb25lUmVwb1xuICAgIHJlcG8uJGJvYXJkID0gQGJvYXJkXG4gICAgbGlzdHMgPSByZXBvLmdldFZpc2libGVMaXN0cygpXG4gICAgd2lkdGggPSAzNzgqbGlzdHMubGVuZ3RoICsgXCJweFwiXG4gICAgQGJvYXJkLmNzcygnd2lkdGgnLCB3aWR0aClcbiAgICBAYm9hcmQuYXBwZW5kICg9PiBAZ2V0TGlzdCBsaXN0IGZvciBsaXN0IGluIGxpc3RzKVxuICAgIEBhZGRQbHVnaW5CdXR0b25zKClcbiAgICBAZmlsdGVyKClcbiAgICBAYm9hcmQuc2hvdygpXG4gICAgQGhpZGVNYXNrKClcbiAgICBAbWFrZVRhc2tzU29ydGFibGUoKVxuICAgIEBlbWl0dGVyLmVtaXQgJ2JvYXJkLnVwZGF0ZSdcblxuICBkZXN0cm95U29ydGFibGVzOiAtPlxuICAgIGlmIEB0YXNrc1NvcnRhYmxlc1xuICAgICAgZm9yIHNvcnRhYmxlIGluIEB0YXNrc1NvcnRhYmxlc1xuICAgICAgICBzb3J0YWJsZS5kZXN0cm95KCkgaWYgc29ydGFibGUuZWxcblxuICBtYWtlVGFza3NTb3J0YWJsZTogLT5cbiAgICBvcHRzID1cbiAgICAgIGRyYWdnYWJsZTogJy50YXNrJ1xuICAgICAgZ3JvdXA6ICd0YXNrcydcbiAgICAgIHNvcnQ6IHRydWVcbiAgICAgIGdob3N0Q2xhc3M6ICdpbWRvbmUtZ2hvc3QnXG4gICAgICBzY3JvbGw6IEBib2FyZFdyYXBwZXJbMF1cbiAgICAgIG9uRW5kOiAoZXZ0KSA9PlxuICAgICAgICBpZCA9IGV2dC5pdGVtLmlkXG4gICAgICAgIHBvcyA9IGV2dC5uZXdJbmRleFxuICAgICAgICBsaXN0ID0gZXZ0Lml0ZW0ucGFyZW50Tm9kZS5kYXRhc2V0Lmxpc3RcbiAgICAgICAgZmlsZVBhdGggPSBAaW1kb25lUmVwby5nZXRGdWxsUGF0aCBldnQuaXRlbS5kYXRhc2V0LnBhdGhcbiAgICAgICAgdGFzayA9IEBpbWRvbmVSZXBvLmdldFRhc2sgaWRcbiAgICAgICAgQHNob3dNYXNrIFwiTW92aW5nIFRhc2tzXCJcbiAgICAgICAgQGltZG9uZVJlcG8ubW92ZVRhc2tzIFt0YXNrXSwgbGlzdCwgcG9zXG5cbiAgICBAdGFza3NTb3J0YWJsZXMgPSB0YXNrc1NvcnRhYmxlcyA9IFtdXG4gICAgQGZpbmQoJy50YXNrcycpLmVhY2ggLT5cbiAgICAgIHRhc2tzU29ydGFibGVzLnB1c2goU29ydGFibGUuY3JlYXRlICQodGhpcykuZ2V0KDApLCBvcHRzKVxuXG4gIGRlc3Ryb3k6IC0+XG4gICAgQHJlbW92ZUFsbFJlcG9MaXN0ZW5lcnMoKVxuICAgIEByZW1vdmUoKVxuICAgIEBlbWl0dGVyLmVtaXQgJ2RpZC1kZXN0cm95JywgQFxuICAgIEBlbWl0dGVyLmRpc3Bvc2UoKVxuXG4gIG9uRGlkRGVzdHJveTogKGNhbGxiYWNrKSAtPlxuICAgIEBlbWl0dGVyLm9uICdkaWQtZGVzdHJveScsIGNhbGxiYWNrXG5cbiAgb3BlblBhdGg6IChmaWxlUGF0aCwgbGluZSkgLT5cbiAgICByZXR1cm4gdW5sZXNzIGZpbGVQYXRoXG5cbiAgICBmaWxlU2VydmljZS5vcGVuRmlsZSBAcGF0aCwgZmlsZVBhdGgsIGxpbmUsIChzdWNjZXNzKSA9PlxuICAgICAgcmV0dXJuIGlmIHN1Y2Nlc3NcbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgsIHNwbGl0OiAnbGVmdCcpLnRoZW4gPT5cbiAgICAgICAgQG1vdmVDdXJzb3JUbyhsaW5lKSBpZiBsaW5lXG5cbiAgbW92ZUN1cnNvclRvOiAobGluZU51bWJlcikgLT5cbiAgICBsaW5lTnVtYmVyID0gcGFyc2VJbnQobGluZU51bWJlcilcblxuICAgIGlmIHRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKClcbiAgICAgIHBvc2l0aW9uID0gW2xpbmVOdW1iZXItMSwgMF1cbiAgICAgIHRleHRFZGl0b3Iuc2V0Q3Vyc29yQnVmZmVyUG9zaXRpb24ocG9zaXRpb24sIGF1dG9zY3JvbGw6IGZhbHNlKVxuICAgICAgdGV4dEVkaXRvci5zY3JvbGxUb0N1cnNvclBvc2l0aW9uKGNlbnRlcjogdHJ1ZSlcblxuICBzZWxlY3RUYXNrOiAoaWQpIC0+XG4gICAgQGNsZWFyU2VsZWN0aW9uKClcbiAgICBAYm9hcmQuZmluZChcIi50YXNrIyN7aWR9XCIpLmFkZENsYXNzICdzZWxlY3RlZCdcblxuICBjbGVhclNlbGVjdGlvbjogLT5cbiAgICBAYm9hcmQuZmluZCgnLnRhc2snKS5yZW1vdmVDbGFzcyAnc2VsZWN0ZWQnXG4iXX0=
