(function() {
  var $el, ConnectorPlugin, Emitter, _, config, gitup, shell,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Emitter = require('atom').Emitter;

  gitup = require('git-up');

  config = require('../../config');

  _ = require('lodash');

  shell = require('shell');

  $el = require('laconic');

  module.exports = ConnectorPlugin = (function(superClass) {
    extend(ConnectorPlugin, superClass);

    ConnectorPlugin.PluginView = require('./plugin-view');

    ConnectorPlugin.pluginName = "github-connector-plugin";

    ConnectorPlugin.provider = "github";

    ConnectorPlugin.title = "Update linked github issues (imdone.io)";

    ConnectorPlugin.icon = "mark-github";

    ConnectorPlugin.prototype.ready = false;

    function ConnectorPlugin(repo, imdoneView, connector1) {
      this.repo = repo;
      this.imdoneView = imdoneView;
      this.connector = connector1;
      ConnectorPlugin.__super__.constructor.apply(this, arguments);
      this.view = new this.constructor.PluginView({
        repo: this.repo,
        imdoneView: this.imdoneView,
        connector: this.connector
      });
      this.imdoneView.on('board.update', (function(_this) {
        return function() {
          if (!(_this.view && _this.view.is(':visible'))) {
            return;
          }
          return _this.imdoneView.selectTask(_this.task.id);
        };
      })(this));
      this.addMetaKeyConfig((function(_this) {
        return function() {
          _this.ready = true;
          return _this.emit('ready');
        };
      })(this));
    }

    ConnectorPlugin.prototype.setConnector = function(connector1) {
      this.connector = connector1;
      return this.view.setConnector(this.connector);
    };

    ConnectorPlugin.prototype.githubProjectInfo = function() {
      var dotPos, gitUrl, info, len, pathInfo, projectName;
      gitUrl = _.get(this.connector, 'config.repoURL');
      if (!gitUrl) {
        return;
      }
      info = gitup(gitUrl);
      pathInfo = info.pathname.split('/');
      if (pathInfo.length > 2) {
        len = pathInfo.length;
        projectName = pathInfo[len - 1];
        dotPos = projectName.indexOf('.');
        if (dotPos > 0) {
          info.projectName = projectName.substring(0, dotPos);
        }
        info.accountName = pathInfo[len - 2];
      }
      return info;
    };

    ConnectorPlugin.prototype.isReady = function() {
      return this.ready;
    };

    ConnectorPlugin.prototype.getView = function() {
      return this.view;
    };

    ConnectorPlugin.prototype.idMetaKey = function() {
      return this.connector.config.idMetaKey;
    };

    ConnectorPlugin.prototype.metaKeyConfig = function() {
      return this.repo.config.meta && this.repo.config.meta[this.idMetaKey()];
    };

    ConnectorPlugin.prototype.issuesUrlBase = function() {
      var projectInfo;
      projectInfo = this.githubProjectInfo();
      if (!projectInfo) {
        return;
      }
      return "https://github.com/" + projectInfo.accountName + "/" + projectInfo.projectName + "/issues";
    };

    ConnectorPlugin.prototype.addMetaKeyConfig = function(cb) {
      var issuesUrl, projectInfo;
      projectInfo = this.githubProjectInfo();
      if (this.metaKeyConfig() || !this.idMetaKey() || !projectInfo) {
        return cb();
      }
      if (!this.repo.config.meta) {
        this.repo.config.meta = {};
      }
      issuesUrl = this.issuesUrlBase();
      if (!issuesUrl) {
        return cb();
      }
      this.repo.config.meta[this.idMetaKey()] = {
        urlTemplate: issuesUrl + "/%s",
        titleTemplate: "View github issue %s",
        icon: "icon-octoface"
      };
      return this.repo.saveConfig(cb);
    };

    ConnectorPlugin.prototype.taskButton = function(id) {
      var $, $$, $$$, $btn, icon, onClick, pluginName, ref, task, title;
      ref = require('atom-space-pen-views'), $ = ref.$, $$ = ref.$$, $$$ = ref.$$$;
      if (!this.repo) {
        return;
      }
      task = this.repo.getTask(id);
      title = this.constructor.title;
      pluginName = this.constructor.pluginName;
      icon = this.constructor.icon;
      onClick = (function(_this) {
        return function(e) {
          $(e.target).find('.task');
          _this.task = task;
          _this.imdoneView.showPlugin(_this);
          _this.imdoneView.selectTask(id);
          _this.view.setTask(task);
          return _this.view.show(_this.view.getIssueIds(task));
        };
      })(this);
      return $btn = $el.a({
        href: '#',
        title: title,
        "class": "" + pluginName,
        onclick: onClick
      }, $el.span({
        "class": "icon icon-" + icon
      }));
    };

    ConnectorPlugin.prototype.projectButtons = function() {
      var $, $$, $$$, $githubbtn, $imdonebtn, $wafflebtn, connector, icon, issuesUrlBase, pluginName, ref, title;
      ref = require('atom-space-pen-views'), $ = ref.$, $$ = ref.$$, $$$ = ref.$$$;
      if (!this.repo) {
        return;
      }
      connector = this.connector;
      title = this.connector.config.waffleIoProject + " waffles!";
      pluginName = this.constructor.pluginName;
      icon = this.constructor.icon;
      issuesUrlBase = this.issuesUrlBase();
      if (!issuesUrlBase) {
        return;
      }
      $imdonebtn = $$(function() {
        return this.div({
          "class": 'imdone-icon imdone-toolbar-button'
        }, (function(_this) {
          return function() {
            return _this.a({
              href: "#",
              title: ""
            }, function() {
              _this.i({
                "class": 'icon'
              }, function() {
                return _this.tag('svg', function() {
                  return _this.tag('use', {
                    "xlink:href": "#imdone-logo-icon"
                  });
                });
              });
              return _this.span({
                "class": 'tool-text'
              }, 'Configure integrations');
            });
          };
        })(this));
      });
      $imdonebtn.on('click', (function(_this) {
        return function(e) {
          return _this.openImdoneio();
        };
      })(this));
      $wafflebtn = $$(function() {
        return this.div({
          "class": "imdone-icon imdone-toolbar-button"
        }, (function(_this) {
          return function() {
            return _this.a({
              href: "",
              title: title,
              "class": pluginName + "-waffle"
            }, function() {
              _this.i({
                "class": 'icon'
              }, function() {
                return _this.tag('svg', {
                  "class": 'waffle-logo'
                }, function() {
                  return _this.tag('use', {
                    "xlink:href": "#waffle-logo-icon"
                  });
                });
              });
              return _this.span({
                "class": 'tool-text waffle-logo'
              }, "Open waffle.io board");
            });
          };
        })(this));
      });
      $wafflebtn.on('click', (function(_this) {
        return function(e) {
          return _this.openWaffle();
        };
      })(this));
      $githubbtn = $$(function() {
        return this.div({
          "class": "imdone-icon imdone-toolbar-button"
        }, (function(_this) {
          return function() {
            return _this.a({
              href: "",
              title: "GitHub issues",
              "class": "" + pluginName
            }, function() {
              _this.i({
                "class": "icon icon-octoface toolbar-icon"
              });
              return _this.span({
                "class": "tool-text"
              }, "Open GitHub issues");
            });
          };
        })(this));
      });
      $githubbtn.on('click', (function(_this) {
        return function(e) {
          return _this.openGithub();
        };
      })(this));
      return [$imdonebtn, $wafflebtn, $githubbtn];
      return $($btn);
    };

    ConnectorPlugin.prototype.openWaffle = function() {
      return shell.openExternal(this.getWaffleURL());
    };

    ConnectorPlugin.prototype.openImdoneio = function() {
      return shell.openExternal(config.baseUrl + "/account/projects#" + this.connector._project);
    };

    ConnectorPlugin.prototype.openGithub = function() {
      return shell.openExternal(this.issuesUrlBase());
    };

    ConnectorPlugin.prototype.getWaffleURL = function() {
      return "https://waffle.io/" + this.connector.config.waffleIoProject;
    };

    return ConnectorPlugin;

  })(Emitter);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2ltZG9uZS1hdG9tL2xpYi9wbHVnaW5zL3BsdWdpbi5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLHNEQUFBO0lBQUE7OztFQUFDLFVBQVcsT0FBQSxDQUFRLE1BQVI7O0VBQ1osS0FBQSxHQUFRLE9BQUEsQ0FBUSxRQUFSOztFQUNSLE1BQUEsR0FBUyxPQUFBLENBQVEsY0FBUjs7RUFDVCxDQUFBLEdBQUksT0FBQSxDQUFRLFFBQVI7O0VBQ0osS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSOztFQUNSLEdBQUEsR0FBTSxPQUFBLENBQVEsU0FBUjs7RUFDTixNQUFNLENBQUMsT0FBUCxHQUNNOzs7SUFDSixlQUFDLENBQUEsVUFBRCxHQUFhLE9BQUEsQ0FBUSxlQUFSOztJQUNiLGVBQUMsQ0FBQSxVQUFELEdBQWE7O0lBQ2IsZUFBQyxDQUFBLFFBQUQsR0FBVzs7SUFDWCxlQUFDLENBQUEsS0FBRCxHQUFROztJQUNSLGVBQUMsQ0FBQSxJQUFELEdBQU87OzhCQUVQLEtBQUEsR0FBTzs7SUFFTSx5QkFBQyxJQUFELEVBQVEsVUFBUixFQUFxQixVQUFyQjtNQUFDLElBQUMsQ0FBQSxPQUFEO01BQU8sSUFBQyxDQUFBLGFBQUQ7TUFBYSxJQUFDLENBQUEsWUFBRDtNQUVoQyxrREFBQSxTQUFBO01BQ0EsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFJLElBQUMsQ0FBQSxXQUFXLENBQUMsVUFBakIsQ0FBNEI7UUFBRSxNQUFELElBQUMsQ0FBQSxJQUFGO1FBQVMsWUFBRCxJQUFDLENBQUEsVUFBVDtRQUFzQixXQUFELElBQUMsQ0FBQSxTQUF0QjtPQUE1QjtNQUNSLElBQUMsQ0FBQSxVQUFVLENBQUMsRUFBWixDQUFlLGNBQWYsRUFBK0IsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO1VBQzdCLElBQUEsQ0FBQSxDQUFjLEtBQUMsQ0FB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QUFHLEtBQUssQ0FBQyxZQUFOLENBQXNCLE1BQU0sQ0FBQyxPQUFSLEdBQWdCLG9CQUFoQixHQUFvQyxJQUFDLENBQUEsU0FBUyxDQUFDLFFBQXBFO0lBQUg7OzhCQUNkLFVBQUEsR0FBWSxTQUFBO2FBQUcsS0FBSyxDQUFDLFlBQU4sQ0FBbUIsSUFBQyxDQUFBLGFBQUQsQ0FBQSxDQUFuQjtJQUFIOzs4QkFDWixZQUFBLEdBQWMsU0FBQTthQUFHLG9CQUFBLEdBQXFCLElBQUMsQ0FBQSxTQUFTLENBQUMsTUFBTSxDQUFDO0lBQTFDOzs7O0tBOUhjO0FBUDlCIiwic291cmNlc0NvbnRlbnQiOlsie0VtaXR0ZXJ9ID0gcmVxdWlyZSAnYXRvbSdcbmdpdHVwID0gcmVxdWlyZSAnZ2l0LXVwJ1xuY29uZmlnID0gcmVxdWlyZSAnLi4vLi4vY29uZmlnJ1xuXyA9IHJlcXVpcmUgJ2xvZGFzaCdcbnNoZWxsID0gcmVxdWlyZSAnc2hlbGwnXG4kZWwgPSByZXF1aXJlICdsYWNvbmljJ1xubW9kdWxlLmV4cG9ydHMgPVxuY2xhc3MgQ29ubmVjdG9yUGx1Z2luIGV4dGVuZHMgRW1pdHRlclxuICBAUGx1Z2luVmlldzogcmVxdWlyZSgnLi9wbHVnaW4tdmlldycpXG4gIEBwbHVnaW5OYW1lOiBcImdpdGh1Yi1jb25uZWN0b3ItcGx1Z2luXCJcbiAgQHByb3ZpZGVyOiBcImdpdGh1YlwiXG4gIEB0aXRsZTogXCJVcGRhdGUgbGlua2VkIGdpdGh1YiBpc3N1ZXMgKGltZG9uZS5pbylcIlxuICBAaWNvbjogXCJtYXJrLWdpdGh1YlwiXG5cbiAgcmVhZHk6IGZhbHNlXG5cbiAgY29uc3RydWN0b3I6IChAcmVwbywgQGltZG9uZVZpZXcsIEBjb25uZWN0b3IpIC0+XG4gICAgIyBXZSBuZWVkIHNvbWUgd2F5IHRvIGdldCB0aGUgY29ubmVjdG9yIVxuICAgIHN1cGVyXG4gICAgQHZpZXcgPSBuZXcgQGNvbnN0cnVjdG9yLlBsdWdpblZpZXcoe0ByZXBvLCBAaW1kb25lVmlldywgQGNvbm5lY3Rvcn0pXG4gICAgQGltZG9uZVZpZXcub24gJ2JvYXJkLnVwZGF0ZScsID0+XG4gICAgICByZXR1cm4gdW5sZXNzIEB2aWV3ICYmIEB2aWV3LmlzICc6dmlzaWJsZSdcbiAgICAgIEBpbWRvbmVWaWV3LnNlbGVjdFRhc2sgQHRhc2suaWRcbiAgICBAYWRkTWV0YUtleUNvbmZpZyA9PlxuICAgICAgQHJlYWR5ID0gdHJ1ZVxuICAgICAgQGVtaXQgJ3JlYWR5J1xuXG4gIHNldENvbm5lY3RvcjogKEBjb25uZWN0b3IpIC0+IEB2aWV3LnNldENvbm5lY3RvciBAY29ubmVjdG9yXG5cbiAgZ2l0aHViUHJvamVjdEluZm86IC0+XG4gICAgZ2l0VXJsID0gXy5nZXQgQGNvbm5lY3RvciwgJ2NvbmZpZy5yZXBvVVJMJ1xuICAgIHJldHVybiB1bmxlc3MgZ2l0VXJsXG4gICAgaW5mbyA9IGdpdHVwIGdpdFVybFxuICAgIHBhdGhJbmZvID0gaW5mby5wYXRobmFtZS5zcGxpdCAnLydcbiAgICBpZiBwYXRoSW5mby5sZW5ndGggPiAyXG4gICAgICBsZW4gPSBwYXRoSW5mby5sZW5ndGhcbiAgICAgIHByb2plY3ROYW1lID0gcGF0aEluZm9bbGVuLTFdXG4gICAgICBkb3RQb3MgPSBwcm9qZWN0TmFtZS5pbmRleE9mICcuJ1xuICAgICAgaW5mby5wcm9qZWN0TmFtZSA9IHByb2plY3ROYW1lLnN1YnN0cmluZyAwLCBkb3RQb3MgaWYgZG90UG9zID4gMFxuICAgICAgaW5mby5hY2NvdW50TmFtZSA9IHBhdGhJbmZvW2xlbi0yXVxuICAgIGluZm9cblxuICAjIEludGVyZmFjZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaXNSZWFkeTogLT4gQHJlYWR5XG4gIGdldFZpZXc6IC0+IEB2aWV3XG4gIGlkTWV0YUtleTogLT4gQGNvbm5lY3Rvci5jb25maWcuaWRNZXRhS2V5XG4gIG1ldGFLZXlDb25maWc6IC0+IEByZXBvLmNvbmZpZy5tZXRhICYmIEByZXBvLmNvbmZpZy5tZXRhW0BpZE1ldGFLZXkoKV1cbiAgaXNzdWVzVXJsQmFzZTogLT5cbiAgICBwcm9qZWN0SW5mbyA9IEBnaXRodWJQcm9qZWN0SW5mbygpXG4gICAgcmV0dXJuIHVubGVzcyBwcm9qZWN0SW5mb1xuICAgIFwiaHR0cHM6Ly9naXRodWIuY29tLyN7cHJvamVjdEluZm8uYWNjb3VudE5hbWV9LyN7cHJvamVjdEluZm8ucHJvamVjdE5hbWV9L2lzc3Vlc1wiXG4gIGFkZE1ldGFLZXlDb25maWc6IChjYikgLT5cbiAgICBwcm9qZWN0SW5mbyA9IEBnaXRodWJQcm9qZWN0SW5mbygpXG4gICAgcmV0dXJuIGNiKCkgaWYgQG1ldGFLZXlDb25maWcoKSB8fCAhQGlkTWV0YUtleSgpIHx8ICFwcm9qZWN0SW5mb1xuICAgIEByZXBvLmNvbmZpZy5tZXRhID0ge30gdW5sZXNzIEByZXBvLmNvbmZpZy5tZXRhXG4gICAgaXNzdWVzVXJsID0gQGlzc3Vlc1VybEJhc2UoKVxuICAgIHJldHVybiBjYigpIHVubGVzcyBpc3N1ZXNVcmxcbiAgICBAcmVwby5jb25maWcubWV0YVtAaWRNZXRhS2V5KCldID1cbiAgICAgIHVybFRlbXBsYXRlOiBcIiN7aXNzdWVzVXJsfS8lc1wiXG4gICAgICB0aXRsZVRlbXBsYXRlOiBcIlZpZXcgZ2l0aHViIGlzc3VlICVzXCJcbiAgICAgIGljb246IFwiaWNvbi1vY3RvZmFjZVwiXG4gICAgQHJlcG8uc2F2ZUNvbmZpZyBjYlxuXG4gIHRhc2tCdXR0b246IChpZCkgLT5cbiAgICB7JCwgJCQsICQkJH0gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbiAgICByZXR1cm4gdW5sZXNzIEByZXBvXG4gICAgdGFzayA9IEByZXBvLmdldFRhc2soaWQpXG4gICAgdGl0bGUgPSBAY29uc3RydWN0b3IudGl0bGVcbiAgICBwbHVnaW5OYW1lID0gQGNvbnN0cnVjdG9yLnBsdWdpbk5hbWVcbiAgICBpY29uID0gQGNvbnN0cnVjdG9yLmljb25cbiAgICBvbkNsaWNrID0gKGUpID0+XG4gICAgICAkKGUudGFyZ2V0KS5maW5kKCcudGFzaycpXG4gICAgICBAdGFzayA9IHRhc2tcbiAgICAgIEBpbWRvbmVWaWV3LnNob3dQbHVnaW4gQFxuICAgICAgQGltZG9uZVZpZXcuc2VsZWN0VGFzayBpZFxuICAgICAgQHZpZXcuc2V0VGFzayB0YXNrXG4gICAgICBAdmlldy5zaG93IEB2aWV3LmdldElzc3VlSWRzKHRhc2spXG5cbiAgICAkYnRuID0gJGVsLmEgaHJlZjogJyMnLCB0aXRsZTogdGl0bGUsIGNsYXNzOiBcIiN7cGx1Z2luTmFtZX1cIiwgb25jbGljazogb25DbGljayxcbiAgICAgICRlbC5zcGFuIGNsYXNzOlwiaWNvbiBpY29uLSN7aWNvbn1cIlxuICAgICMgJGJ0bi5vbiAnY2xpY2snLCAoZSkgPT5cbiAgICAjICAgJChlLnRhcmdldCkuZmluZCgnLnRhc2snKVxuICAgICMgICBAdGFzayA9IHRhc2tcbiAgICAjICAgQGltZG9uZVZpZXcuc2hvd1BsdWdpbiBAXG4gICAgIyAgIEBpbWRvbmVWaWV3LnNlbGVjdFRhc2sgaWRcbiAgICAjICAgQHZpZXcuc2V0VGFzayB0YXNrXG4gICAgIyAgIEB2aWV3LnNob3cgQHZpZXcuZ2V0SXNzdWVJZHModGFzaylcblxuICBwcm9qZWN0QnV0dG9uczogKCkgLT5cbiAgICB7JCwgJCQsICQkJH0gPSByZXF1aXJlICdhdG9tLXNwYWNlLXBlbi12aWV3cydcbiAgICByZXR1cm4gdW5sZXNzIEByZXBvXG4gICAgY29ubmVjdG9yID0gQGNvbm5lY3RvclxuICAgIHRpdGxlID0gXCIje0Bjb25uZWN0b3IuY29uZmlnLndhZmZsZUlvUHJvamVjdH0gd2FmZmxlcyFcIlxuICAgIHBsdWdpbk5hbWUgPSBAY29uc3RydWN0b3IucGx1Z2luTmFtZVxuICAgIGljb24gPSBAY29uc3RydWN0b3IuaWNvblxuICAgIGlzc3Vlc1VybEJhc2UgPSBAaXNzdWVzVXJsQmFzZSgpXG4gICAgcmV0dXJuIHVubGVzcyBpc3N1ZXNVcmxCYXNlXG4gICAgJGltZG9uZWJ0biA9ICQkIC0+XG4gICAgICBAZGl2IGNsYXNzOidpbWRvbmUtaWNvbiBpbWRvbmUtdG9vbGJhci1idXR0b24nLCA9PlxuICAgICAgICBAYSBocmVmOiBcIiNcIiwgdGl0bGU6IFwiXCIsID0+XG4gICAgICAgICAgQGkgY2xhc3M6J2ljb24nLCA9PlxuICAgICAgICAgICAgQHRhZyAnc3ZnJywgPT4gQHRhZyAndXNlJywgXCJ4bGluazpocmVmXCI6XCIjaW1kb25lLWxvZ28taWNvblwiXG4gICAgICAgICAgQHNwYW4gY2xhc3M6J3Rvb2wtdGV4dCcsICdDb25maWd1cmUgaW50ZWdyYXRpb25zJ1xuICAgICRpbWRvbmVidG4ub24gJ2NsaWNrJywgKGUpID0+IEBvcGVuSW1kb25laW8oKVxuICAgICR3YWZmbGVidG4gPSAkJCAtPlxuICAgICAgQGRpdiBjbGFzczpcImltZG9uZS1pY29uIGltZG9uZS10b29sYmFyLWJ1dHRvblwiLCA9PlxuICAgICAgICBAYSBocmVmOiBcIiN7fVwiLCB0aXRsZTogdGl0bGUsIGNsYXNzOiBcIiN7cGx1Z2luTmFtZX0td2FmZmxlXCIsID0+XG4gICAgICAgICAgQGkgY2xhc3M6J2ljb24nLCA9PlxuICAgICAgICAgICAgQHRhZyAnc3ZnJywgY2xhc3M6J3dhZmZsZS1sb2dvJywgPT4gQHRhZyAndXNlJywgXCJ4bGluazpocmVmXCI6XCIjd2FmZmxlLWxvZ28taWNvblwiXG4gICAgICAgICAgQHNwYW4gY2xhc3M6J3Rvb2wtdGV4dCB3YWZmbGUtbG9nbycsIFwiT3BlbiB3YWZmbGUuaW8gYm9hcmRcIlxuICAgICR3YWZmbGVidG4ub24gJ2NsaWNrJywgKGUpID0+IEBvcGVuV2FmZmxlKClcbiAgICAkZ2l0aHViYnRuID0gJCQgLT5cbiAgICAgIEBkaXYgY2xhc3M6XCJpbWRvbmUtaWNvbiBpbWRvbmUtdG9vbGJhci1idXR0b25cIiwgPT5cbiAgICAgICAgQGEgaHJlZjogXCJcIiwgdGl0bGU6IFwiR2l0SHViIGlzc3Vlc1wiLCBjbGFzczogXCIje3BsdWdpbk5hbWV9XCIsID0+XG4gICAgICAgICAgQGkgY2xhc3M6XCJpY29uIGljb24tb2N0b2ZhY2UgdG9vbGJhci1pY29uXCJcbiAgICAgICAgICBAc3BhbiBjbGFzczpcInRvb2wtdGV4dFwiLCBcIk9wZW4gR2l0SHViIGlzc3Vlc1wiXG4gICAgJGdpdGh1YmJ0bi5vbiAnY2xpY2snLCAoZSkgPT4gQG9wZW5HaXRodWIoKVxuICAgIHJldHVybiBbJGltZG9uZWJ0biwkd2FmZmxlYnRuLCRnaXRodWJidG5dXG5cblxuICAgICMgb3BlbldhZmZsZSA9IEBvcGVuV2FmZmxlXG4gICAgIyAkYnRuID0gJGVsLmRpdiBjbGFzczpcImltZG9uZS1pY29uIGltZG9uZS10b29sYmFyLWJ1dHRvblwiLFxuICAgICMgICAkZWwuYSBocmVmOlwiI3t9XCIsIHRpdGxlOiB0aXRsZSwgY2xhc3M6IFwiI3twbHVnaW5OYW1lfS13YWZmbGVcIixcbiAgICAjICAgICAkZWwuaSBjbGFzczonaWNvbicsXG4gICAgIyAgICAgICAkZWwgJ3N2ZycsIGNsYXNzOid3YWZmbGUtbG9nbycsXG4gICAgIyAgICAgICAgICRlbCAndXNlJywgXCJ4bGluazpocmVmXCI6XCIjd2FmZmxlLWxvZ28taWNvblwiXG4gICAgIyAgICAgJGVsLnNwYW4gY2xhc3M6J3Rvb2wtdGV4dCB3YWZmbGUtbG9nbycsIFwiT3BlbiB3YWZmbGUuaW8gYm9hcmRcIlxuICAgICMgJGJ0bi5vbmNsaWNrID0gKCkgPT4gQG9wZW5XYWZmbGUoKVxuICAgICQoJGJ0bilcblxuICBvcGVuV2FmZmxlOiAtPiBzaGVsbC5vcGVuRXh0ZXJuYWwgQGdldFdhZmZsZVVSTCgpXG4gIG9wZW5JbWRvbmVpbzogLT4gc2hlbGwub3BlbkV4dGVybmFsIFwiI3tjb25maWcuYmFzZVVybH0vYWNjb3VudC9wcm9qZWN0cyMje0Bjb25uZWN0b3IuX3Byb2plY3R9XCJcbiAgb3BlbkdpdGh1YjogLT4gc2hlbGwub3BlbkV4dGVybmFsIEBpc3N1ZXNVcmxCYXNlKClcbiAgZ2V0V2FmZmxlVVJMOiAtPiBcImh0dHBzOi8vd2FmZmxlLmlvLyN7QGNvbm5lY3Rvci5jb25maWcud2FmZmxlSW9Qcm9qZWN0fVwiXG4iXX0=
