(function() {
  var BufferedProcess, DESCRIPTION, ForkGistIdInputView, GitHubApi, PackageManager, REMOVE_KEYS, SyncSettings, _, fs, ref,
    hasProp = {}.hasOwnProperty;

  BufferedProcess = require('atom').BufferedProcess;

  fs = require('fs');

  _ = require('underscore-plus');

  ref = [], GitHubApi = ref[0], PackageManager = ref[1];

  ForkGistIdInputView = null;

  DESCRIPTION = 'Atom configuration storage operated by http://atom.io/packages/sync-settings';

  REMOVE_KEYS = ['sync-settings.gistId', 'sync-settings.personalAccessToken', 'sync-settings._analyticsUserId', 'sync-settings._lastBackupHash'];

  SyncSettings = {
    config: require('./config.coffee'),
    activate: function() {
      return setImmediate((function(_this) {
        return function() {
          var mandatorySettingsApplied;
          if (GitHubApi == null) {
            GitHubApi = require('github');
          }
          if (PackageManager == null) {
            PackageManager = require('./package-manager');
          }
          atom.commands.add('atom-workspace', "sync-settings:backup", function() {
            return _this.backup();
          });
          atom.commands.add('atom-workspace', "sync-settings:restore", function() {
            return _this.restore();
          });
          atom.commands.add('atom-workspace', "sync-settings:view-backup", function() {
            return _this.viewBackup();
          });
          atom.commands.add('atom-workspace', "sync-settings:check-backup", function() {
            return _this.checkForUpdate();
          });
          atom.commands.add('atom-workspace', "sync-settings:fork", function() {
            return _this.inputForkGistId();
          });
          mandatorySettingsApplied = _this.checkMandatorySettings();
          if (atom.config.get('sync-settings.checkForUpdatedBackup') && mandatorySettingsApplied) {
            return _this.checkForUpdate();
          }
        };
      })(this));
    },
    deactivate: function() {
      var ref1;
      return (ref1 = this.inputView) != null ? ref1.destroy() : void 0;
    },
    serialize: function() {},
    getGistId: function() {
      var gistId;
      gistId = atom.config.get('sync-settings.gistId');
      if (gistId) {
        gistId = gistId.trim();
      }
      return gistId;
    },
    getPersonalAccessToken: function() {
      var token;
      token = atom.config.get('sync-settings.personalAccessToken') || process.env.GITHUB_TOKEN;
      if (token) {
        token = token.trim();
      }
      return token;
    },
    checkMandatorySettings: function() {
      var missingSettings;
      missingSettings = [];
      if (!this.getGistId()) {
        missingSettings.push("Gist ID");
      }
      if (!this.getPersonalAccessToken()) {
        missingSettings.push("GitHub personal access token");
      }
      if (missingSettings.length) {
        this.notifyMissingMandatorySettings(missingSettings);
      }
      return missingSettings.length === 0;
    },
    checkForUpdate: function(cb) {
      if (cb == null) {
        cb = null;
      }
      if (this.getGistId()) {
        console.debug('checking latest backup...');
        return this.createClient().gists.get({
          id: this.getGistId()
        }, (function(_this) {
          return function(err, res) {
            var SyntaxError, message, ref1, ref2;
            if (err) {
              console.error("error while retrieving the gist. does it exists?", err);
              try {
                message = JSON.parse(err.message).message;
                if (message === 'Not Found') {
                  message = 'Gist ID Not Found';
                }
              } catch (error1) {
                SyntaxError = error1;
                message = err.message;
              }
              atom.notifications.addError("sync-settings: Error retrieving your settings. (" + message + ")");
              return typeof cb === "function" ? cb() : void 0;
            }
            if ((res != null ? (ref1 = res.history) != null ? (ref2 = ref1[0]) != null ? ref2.version : void 0 : void 0 : void 0) == null) {
              console.error("could not interpret result:", res);
              atom.notifications.addError("sync-settings: Error retrieving your settings.");
              return typeof cb === "function" ? cb() : void 0;
            }
            console.debug("latest backup version " + res.history[0].version);
            if (res.history[0].version !== atom.config.get('sync-settings._lastBackupHash')) {
              _this.notifyNewerBackup();
            } else if (!atom.config.get('sync-settings.quietUpdateCheck')) {
              _this.notifyBackupUptodate();
            }
            return typeof cb === "function" ? cb() : void 0;
          };
        })(this));
      } else {
        return this.notifyMissingMandatorySettings(["Gist ID"]);
      }
    },
    notifyNewerBackup: function() {
      var notification, workspaceElement;
      workspaceElement = atom.views.getView(atom.workspace);
      return notification = atom.notifications.addWarning("sync-settings: Your settings are out of date.", {
        dismissable: true,
        buttons: [
          {
            text: "Backup",
            onDidClick: function() {
              atom.commands.dispatch(workspaceElement, "sync-settings:backup");
              return notification.dismiss();
            }
          }, {
            text: "View backup",
            onDidClick: function() {
              return atom.commands.dispatch(workspaceElement, "sync-settings:view-backup");
            }
          }, {
            text: "Restore",
            onDidClick: function() {
              atom.commands.dispatch(workspaceElement, "sync-settings:restore");
              return notification.dismiss();
            }
          }, {
            text: "Dismiss",
            onDidClick: function() {
              return notification.dismiss();
            }
          }
        ]
      });
    },
    notifyBackupUptodate: function() {
      return atom.notifications.addSuccess("sync-settings: Latest backup is already applied.");
    },
    notifyMissingMandatorySettings: function(missingSettings) {
      var context, errorMsg, notification;
      context = this;
      errorMsg = "sync-settings: Mandatory settings missing: " + missingSettings.join(', ');
      return notification = atom.notifications.addError(errorMsg, {
        dismissable: true,
        buttons: [
          {
            text: "Package settings",
            onDidClick: function() {
              context.goToPackageSettings();
              return notification.dismiss();
            }
          }
        ]
      });
    },
    backup: function(cb) {
      var cmtend, cmtstart, ext, file, files, initPath, j, len, path, ref1, ref2, ref3, ref4, ref5, ref6, ref7;
      if (cb == null) {
        cb = null;
      }
      files = {};
      if (atom.config.get('sync-settings.syncSettings')) {
        files["settings.json"] = {
          content: this.getFilteredSettings()
        };
      }
      if (atom.config.get('sync-settings.syncPackages')) {
        files["packages.json"] = {
          content: JSON.stringify(this.getPackages(), null, '\t')
        };
      }
      if (atom.config.get('sync-settings.syncKeymap')) {
        files["keymap.cson"] = {
          content: (ref1 = this.fileContent(atom.keymaps.getUserKeymapPath())) != null ? ref1 : "# keymap file (not found)"
        };
      }
      if (atom.config.get('sync-settings.syncStyles')) {
        files["styles.less"] = {
          content: (ref2 = this.fileContent(atom.styles.getUserStyleSheetPath())) != null ? ref2 : "// styles file (not found)"
        };
      }
      if (atom.config.get('sync-settings.syncInit')) {
        initPath = atom.getUserInitScriptPath();
        path = require('path');
        files[path.basename(initPath)] = {
          content: (ref3 = this.fileContent(initPath)) != null ? ref3 : "# initialization file (not found)"
        };
      }
      if (atom.config.get('sync-settings.syncSnippets')) {
        files["snippets.cson"] = {
          content: (ref4 = this.fileContent(atom.config.configDirPath + "/snippets.cson")) != null ? ref4 : "# snippets file (not found)"
        };
      }
      ref6 = (ref5 = atom.config.get('sync-settings.extraFiles')) != null ? ref5 : [];
      for (j = 0, len = ref6.length; j < len; j++) {
        file = ref6[j];
        ext = file.slice(file.lastIndexOf(".")).toLowerCase();
        cmtstart = "#";
        if (ext === ".less" || ext === ".scss" || ext === ".js") {
          cmtstart = "//";
        }
        if (ext === ".css") {
          cmtstart = "/*";
        }
        cmtend = "";
        if (ext === ".css") {
          cmtend = "*/";
        }
        files[file] = {
          content: (ref7 = this.fileContent(atom.config.configDirPath + ("/" + file))) != null ? ref7 : cmtstart + " " + file + " (not found) " + cmtend
        };
      }
      return this.createClient().gists.edit({
        id: this.getGistId(),
        description: atom.config.get('sync-settings.gistDescription'),
        files: files
      }, function(err, res) {
        var SyntaxError, message;
        if (err) {
          console.error("error backing up data: " + err.message, err);
          try {
            message = JSON.parse(err.message).message;
            if (message === 'Not Found') {
              message = 'Gist ID Not Found';
            }
          } catch (error1) {
            SyntaxError = error1;
            message = err.message;
          }
          atom.notifications.addError("sync-settings: Error backing up your settings. (" + message + ")");
        } else {
          atom.config.set('sync-settings._lastBackupHash', res.history[0].version);
          atom.notifications.addSuccess("sync-settings: Your settings were successfully backed up. <br/><a href='" + res.html_url + "'>Click here to open your Gist.</a>");
        }
        return typeof cb === "function" ? cb(err, res) : void 0;
      });
    },
    viewBackup: function() {
      var Shell, gistId;
      Shell = require('shell');
      gistId = this.getGistId();
      return Shell.openExternal("https://gist.github.com/" + gistId);
    },
    getPackages: function() {
      var apmInstallSource, i, metadata, name, packages, ref1, theme, version;
      packages = [];
      ref1 = this._getAvailablePackageMetadataWithoutDuplicates();
      for (i in ref1) {
        metadata = ref1[i];
        name = metadata.name, version = metadata.version, theme = metadata.theme, apmInstallSource = metadata.apmInstallSource;
        packages.push({
          name: name,
          version: version,
          theme: theme,
          apmInstallSource: apmInstallSource
        });
      }
      return _.sortBy(packages, 'name');
    },
    _getAvailablePackageMetadataWithoutDuplicates: function() {
      var i, j, len, package_metadata, packages, path, path2metadata, pkg_name, pkg_path, ref1, ref2;
      path2metadata = {};
      package_metadata = atom.packages.getAvailablePackageMetadata();
      ref1 = atom.packages.getAvailablePackagePaths();
      for (i = j = 0, len = ref1.length; j < len; i = ++j) {
        path = ref1[i];
        path2metadata[fs.realpathSync(path)] = package_metadata[i];
      }
      packages = [];
      ref2 = atom.packages.getAvailablePackageNames();
      for (i in ref2) {
        pkg_name = ref2[i];
        pkg_path = atom.packages.resolvePackagePath(pkg_name);
        if (path2metadata[pkg_path]) {
          packages.push(path2metadata[pkg_path]);
        } else {
          console.error('could not correlate package name, path, and metadata');
        }
      }
      return packages;
    },
    restore: function(cb) {
      if (cb == null) {
        cb = null;
      }
      return this.createClient().gists.get({
        id: this.getGistId()
      }, (function(_this) {
        return function(err, res) {
          var SyntaxError, callbackAsync, file, filename, message, ref1;
          if (err) {
            console.error("error while retrieving the gist. does it exists?", err);
            try {
              message = JSON.parse(err.message).message;
              if (message === 'Not Found') {
                message = 'Gist ID Not Found';
              }
            } catch (error1) {
              SyntaxError = error1;
              message = err.message;
            }
            atom.notifications.addError("sync-settings: Error retrieving your settings. (" + message + ")");
            return;
          }
          callbackAsync = false;
          ref1 = res.files;
          for (filename in ref1) {
            if (!hasProp.call(ref1, filename)) continue;
            file = ref1[filename];
            switch (filename) {
              case 'settings.json':
                if (atom.config.get('sync-settings.syncSettings')) {
                  _this.applySettings('', JSON.parse(file.content));
                }
                break;
              case 'packages.json':
                if (atom.config.get('sync-settings.syncPackages')) {
                  callbackAsync = true;
                  _this.installMissingPackages(JSON.parse(file.content), cb);
                  if (atom.config.get('sync-settings.removeObsoletePackages')) {
                    _this.removeObsoletePackages(JSON.parse(file.content), cb);
                  }
                }
                break;
              case 'keymap.cson':
                if (atom.config.get('sync-settings.syncKeymap')) {
                  fs.writeFileSync(atom.keymaps.getUserKeymapPath(), file.content);
                }
                break;
              case 'styles.less':
                if (atom.config.get('sync-settings.syncStyles')) {
                  fs.writeFileSync(atom.styles.getUserStyleSheetPath(), file.content);
                }
                break;
              case 'init.coffee':
                if (atom.config.get('sync-settings.syncInit')) {
                  fs.writeFileSync(atom.config.configDirPath + "/init.coffee", file.content);
                }
                break;
              case 'init.js':
                if (atom.config.get('sync-settings.syncInit')) {
                  fs.writeFileSync(atom.config.configDirPath + "/init.js", file.content);
                }
                break;
              case 'snippets.cson':
                if (atom.config.get('sync-settings.syncSnippets')) {
                  fs.writeFileSync(atom.config.configDirPath + "/snippets.cson", file.content);
                }
                break;
              default:
                fs.writeFileSync(atom.config.configDirPath + "/" + filename, file.content);
            }
          }
          atom.config.set('sync-settings._lastBackupHash', res.history[0].version);
          atom.notifications.addSuccess("sync-settings: Your settings were successfully synchronized.");
          if (!callbackAsync) {
            return typeof cb === "function" ? cb() : void 0;
          }
        };
      })(this));
    },
    createClient: function() {
      var github, token;
      token = this.getPersonalAccessToken();
      console.debug("Creating GitHubApi client with token = " + token);
      github = new GitHubApi({
        version: '3.0.0',
        protocol: 'https'
      });
      github.authenticate({
        type: 'oauth',
        token: token
      });
      return github;
    },
    getFilteredSettings: function() {
      var blacklistedKey, blacklistedKeys, j, len, ref1, settings;
      settings = JSON.parse(JSON.stringify(atom.config.settings));
      blacklistedKeys = REMOVE_KEYS.concat((ref1 = atom.config.get('sync-settings.blacklistedKeys')) != null ? ref1 : []);
      for (j = 0, len = blacklistedKeys.length; j < len; j++) {
        blacklistedKey = blacklistedKeys[j];
        blacklistedKey = blacklistedKey.split(".");
        this._removeProperty(settings, blacklistedKey);
      }
      return JSON.stringify(settings, null, '\t');
    },
    _removeProperty: function(obj, key) {
      var currentKey, lastKey;
      lastKey = key.length === 1;
      currentKey = key.shift();
      if (!lastKey && _.isObject(obj[currentKey]) && !_.isArray(obj[currentKey])) {
        return this._removeProperty(obj[currentKey], key);
      } else {
        return delete obj[currentKey];
      }
    },
    goToPackageSettings: function() {
      return atom.workspace.open("atom://config/packages/sync-settings");
    },
    applySettings: function(pref, settings) {
      var colorKeys, isColor, key, keyPath, results, value, valueKeys;
      results = [];
      for (key in settings) {
        value = settings[key];
        keyPath = pref + "." + key;
        isColor = false;
        if (_.isObject(value)) {
          valueKeys = Object.keys(value);
          colorKeys = ['alpha', 'blue', 'green', 'red'];
          isColor = _.isEqual(_.sortBy(valueKeys), colorKeys);
        }
        if (_.isObject(value) && !_.isArray(value) && !isColor) {
          results.push(this.applySettings(keyPath, value));
        } else {
          console.debug("config.set " + keyPath.slice(1) + "=" + value);
          results.push(atom.config.set(keyPath.slice(1), value));
        }
      }
      return results;
    },
    removeObsoletePackages: function(remaining_packages, cb) {
      var concurrency, failed, i, installed_packages, j, k, keep_installed_package, len, notifications, obsolete_packages, p, pkg, ref1, removeNextPackage, results, succeeded;
      installed_packages = this.getPackages();
      obsolete_packages = [];
      for (j = 0, len = installed_packages.length; j < len; j++) {
        pkg = installed_packages[j];
        keep_installed_package = (function() {
          var k, len1, results;
          results = [];
          for (k = 0, len1 = remaining_packages.length; k < len1; k++) {
            p = remaining_packages[k];
            if (p.name === pkg.name) {
              results.push(p);
            }
          }
          return results;
        })();
        if (keep_installed_package.length === 0) {
          obsolete_packages.push(pkg);
        }
      }
      if (obsolete_packages.length === 0) {
        atom.notifications.addInfo("Sync-settings: no packages to remove");
        return typeof cb === "function" ? cb() : void 0;
      }
      notifications = {};
      succeeded = [];
      failed = [];
      removeNextPackage = (function(_this) {
        return function() {
          var count, failedStr, i;
          if (obsolete_packages.length > 0) {
            pkg = obsolete_packages.shift();
            i = succeeded.length + failed.length + Object.keys(notifications).length + 1;
            count = i + obsolete_packages.length;
            notifications[pkg.name] = atom.notifications.addInfo("Sync-settings: removing " + pkg.name + " (" + i + "/" + count + ")", {
              dismissable: true
            });
            return (function(pkg) {
              return _this.removePackage(pkg, function(error) {
                notifications[pkg.name].dismiss();
                delete notifications[pkg.name];
                if (error != null) {
                  failed.push(pkg.name);
                  atom.notifications.addWarning("Sync-settings: failed to remove " + pkg.name);
                } else {
                  succeeded.push(pkg.name);
                }
                return removeNextPackage();
              });
            })(pkg);
          } else if (Object.keys(notifications).length === 0) {
            if (failed.length === 0) {
              atom.notifications.addSuccess("Sync-settings: finished removing " + succeeded.length + " packages");
            } else {
              failed.sort();
              failedStr = failed.join(', ');
              atom.notifications.addWarning("Sync-settings: finished removing packages (" + failed.length + " failed: " + failedStr + ")", {
                dismissable: true
              });
            }
            return typeof cb === "function" ? cb() : void 0;
          }
        };
      })(this);
      concurrency = Math.min(obsolete_packages.length, 8);
      results = [];
      for (i = k = 0, ref1 = concurrency; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
        results.push(removeNextPackage());
      }
      return results;
    },
    removePackage: function(pack, cb) {
      var packageManager, type;
      type = pack.theme ? 'theme' : 'package';
      console.info("Removing " + type + " " + pack.name + "...");
      packageManager = new PackageManager();
      return packageManager.uninstall(pack, function(error) {
        var ref1;
        if (error != null) {
          console.error("Removing " + type + " " + pack.name + " failed", (ref1 = error.stack) != null ? ref1 : error, error.stderr);
        } else {
          console.info("Removing " + type + " " + pack.name);
        }
        return typeof cb === "function" ? cb(error) : void 0;
      });
    },
    installMissingPackages: function(packages, cb) {
      var available_package, available_packages, concurrency, failed, i, installNextPackage, j, k, len, missing_packages, notifications, p, pkg, ref1, results, succeeded;
      available_packages = this.getPackages();
      missing_packages = [];
      for (j = 0, len = packages.length; j < len; j++) {
        pkg = packages[j];
        available_package = (function() {
          var k, len1, results;
          results = [];
          for (k = 0, len1 = available_packages.length; k < len1; k++) {
            p = available_packages[k];
            if (p.name === pkg.name) {
              results.push(p);
            }
          }
          return results;
        })();
        if (available_package.length === 0) {
          missing_packages.push(pkg);
        } else if (!(!!pkg.apmInstallSource === !!available_package[0].apmInstallSource)) {
          missing_packages.push(pkg);
        }
      }
      if (missing_packages.length === 0) {
        atom.notifications.addInfo("Sync-settings: no packages to install");
        return typeof cb === "function" ? cb() : void 0;
      }
      notifications = {};
      succeeded = [];
      failed = [];
      installNextPackage = (function(_this) {
        return function() {
          var count, failedStr, i;
          if (missing_packages.length > 0) {
            pkg = missing_packages.shift();
            i = succeeded.length + failed.length + Object.keys(notifications).length + 1;
            count = i + missing_packages.length;
            notifications[pkg.name] = atom.notifications.addInfo("Sync-settings: installing " + pkg.name + " (" + i + "/" + count + ")", {
              dismissable: true
            });
            return (function(pkg) {
              return _this.installPackage(pkg, function(error) {
                notifications[pkg.name].dismiss();
                delete notifications[pkg.name];
                if (error != null) {
                  failed.push(pkg.name);
                  atom.notifications.addWarning("Sync-settings: failed to install " + pkg.name);
                } else {
                  succeeded.push(pkg.name);
                }
                return installNextPackage();
              });
            })(pkg);
          } else if (Object.keys(notifications).length === 0) {
            if (failed.length === 0) {
              atom.notifications.addSuccess("Sync-settings: finished installing " + succeeded.length + " packages");
            } else {
              failed.sort();
              failedStr = failed.join(', ');
              atom.notifications.addWarning("Sync-settings: finished installing packages (" + failed.length + " failed: " + failedStr + ")", {
                dismissable: true
              });
            }
            return typeof cb === "function" ? cb() : void 0;
          }
        };
      })(this);
      concurrency = Math.min(missing_packages.length, 8);
      results = [];
      for (i = k = 0, ref1 = concurrency; 0 <= ref1 ? k < ref1 : k > ref1; i = 0 <= ref1 ? ++k : --k) {
        results.push(installNextPackage());
      }
      return results;
    },
    installPackage: function(pack, cb) {
      var packageManager, type;
      type = pack.theme ? 'theme' : 'package';
      console.info("Installing " + type + " " + pack.name + "...");
      packageManager = new PackageManager();
      return packageManager.install(pack, function(error) {
        var ref1;
        if (error != null) {
          console.error("Installing " + type + " " + pack.name + " failed", (ref1 = error.stack) != null ? ref1 : error, error.stderr);
        } else {
          console.info("Installed " + type + " " + pack.name);
        }
        return typeof cb === "function" ? cb(error) : void 0;
      });
    },
    fileContent: function(filePath) {
      var e;
      try {
        return fs.readFileSync(filePath, {
          encoding: 'utf8'
        }) || null;
      } catch (error1) {
        e = error1;
        console.error("Error reading file " + filePath + ". Probably doesn't exist.", e);
        return null;
      }
    },
    inputForkGistId: function() {
      if (ForkGistIdInputView == null) {
        ForkGistIdInputView = require('./fork-gistid-input-view');
      }
      this.inputView = new ForkGistIdInputView();
      return this.inputView.setCallbackInstance(this);
    },
    forkGistId: function(forkId) {
      return this.createClient().gists.fork({
        id: forkId
      }, function(err, res) {
        var SyntaxError, message;
        if (err) {
          try {
            message = JSON.parse(err.message).message;
            if (message === "Not Found") {
              message = "Gist ID Not Found";
            }
          } catch (error1) {
            SyntaxError = error1;
            message = err.message;
          }
          atom.notifications.addError("sync-settings: Error forking settings. (" + message + ")");
          return typeof cb === "function" ? cb() : void 0;
        }
        if (res.id) {
          atom.config.set("sync-settings.gistId", res.id);
          atom.notifications.addSuccess("sync-settings: Forked successfully to the new Gist ID " + res.id + " which has been saved to your config.");
        } else {
          atom.notifications.addError("sync-settings: Error forking settings");
        }
        return typeof cb === "function" ? cb() : void 0;
      });
    }
  };

  module.exports = SyncSettings;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL3N5bmMtc2V0dGluZ3MvbGliL3N5bmMtc2V0dGluZ3MuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQSxtSEFBQTtJQUFBOztFQUFDLGtCQUFtQixPQUFBLENBQVEsTUFBUjs7RUFDcEIsRUFBQSxHQUFLLE9BQUEsQ0FBUSxJQUFSOztFQUNMLENBQUEsR0FBSSxPQUFBLENBQVEsaUJBQVI7O0VBQ0osTUFBOEIsRUFBOUIsRUFBQyxrQkFBRCxFQUFZOztFQUNaLG1CQUFBLEdBQXNCOztFQUd0QixXQUFBLEdBQWM7O0VBQ2QsV0FBQSxHQUFjLENBQ1osc0JBRFksRUFFWixtQ0FGWSxFQUdaLGdDQUhZLEVBSVosK0JBSlk7O0VBT2QsWUFBQSxHQUNFO0lBQUEsTUFBQSxFQUFRLE9BQUEsQ0FBUSxpQkFBUixDQUFSO0lBRUEsUUFBQSxFQUFVLFNBQUE7YUFFUixZQUFBLENBQWEsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBRVgsY0FBQTs7WUFBQSxZQUFhLE9BQUEsQ0FBUSxRQUFSOzs7WUFDYixpQkFBa0IsT0FBQSxDQUFRLG1CQUFSOztVQUVsQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQWQsQ0FBa0IsZ0JBQWxCLEVBQW9DLHNCQUFwQyxFQUE0RCxTQUFBO21CQUMxRCxLQUFDLENBQUEsTUFBRCxDQUFBO1VBRDBELENBQTVEO1VBRUEsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFkLENBQWtCLGdCQUFsQixFQUFvQyx1QkFBcEMsRUFBNkQsU0FBQTttQkFDM0QsS0FBQyxDQUFBLE9BQUQsQ0FBQTtVQUQyRCxDQUE3RDtVQUVBLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBZCxDQUFrQixnQkFBbEIsRUFBb0MsMkJBQXBDLEVBQWlFLFNBQUE7bUJBQy9ELEtBQUMsQ0FBQSxVQUFELENBQUE7VUFEK0QsQ0FBakU7VUFFQSxJQUFJLENB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QixDQUE4Qix3REFBQSxHQUEyRCxHQUFHLENBQUMsRUFBL0QsR0FBb0UsdUNBQWxHLEVBRkY7U0FBQSxNQUFBO1VBSUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFuQixDQUE0Qix1Q0FBNUIsRUFKRjs7MENBTUE7TUFoQkEsQ0FGRjtJQURVLENBeGFaOzs7RUE2YkYsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUE3Y2pCIiwic291cmNlc0NvbnRlbnQiOlsiIyBpbXBvcnRzXG57QnVmZmVyZWRQcm9jZXNzfSA9IHJlcXVpcmUgJ2F0b20nXG5mcyA9IHJlcXVpcmUgJ2ZzJ1xuXyA9IHJlcXVpcmUgJ3VuZGVyc2NvcmUtcGx1cydcbltHaXRIdWJBcGksIFBhY2thZ2VNYW5hZ2VyXSA9IFtdXG5Gb3JrR2lzdElkSW5wdXRWaWV3ID0gbnVsbFxuXG4jIGNvbnN0YW50c1xuREVTQ1JJUFRJT04gPSAnQXRvbSBjb25maWd1cmF0aW9uIHN0b3JhZ2Ugb3BlcmF0ZWQgYnkgaHR0cDovL2F0b20uaW8vcGFja2FnZXMvc3luYy1zZXR0aW5ncydcblJFTU9WRV9LRVlTID0gW1xuICAnc3luYy1zZXR0aW5ncy5naXN0SWQnLFxuICAnc3luYy1zZXR0aW5ncy5wZXJzb25hbEFjY2Vzc1Rva2VuJyxcbiAgJ3N5bmMtc2V0dGluZ3MuX2FuYWx5dGljc1VzZXJJZCcsICAjIGtlZXAgbGVnYWN5IGtleSBpbiBibGFja2xpc3RcbiAgJ3N5bmMtc2V0dGluZ3MuX2xhc3RCYWNrdXBIYXNoJyxcbl1cblxuU3luY1NldHRpbmdzID1cbiAgY29uZmlnOiByZXF1aXJlKCcuL2NvbmZpZy5jb2ZmZWUnKVxuXG4gIGFjdGl2YXRlOiAtPlxuICAgICMgc3BlZWR1cCBhY3RpdmF0aW9uIGJ5IGFzeW5jIGluaXRpYWxpemluZ1xuICAgIHNldEltbWVkaWF0ZSA9PlxuICAgICAgIyBhY3R1YWwgaW5pdGlhbGl6YXRpb24gYWZ0ZXIgYXRvbSBoYXMgbG9hZGVkXG4gICAgICBHaXRIdWJBcGkgPz0gcmVxdWlyZSAnZ2l0aHViJ1xuICAgICAgUGFja2FnZU1hbmFnZXIgPz0gcmVxdWlyZSAnLi9wYWNrYWdlLW1hbmFnZXInXG5cbiAgICAgIGF0b20uY29tbWFuZHMuYWRkICdhdG9tLXdvcmtzcGFjZScsIFwic3luYy1zZXR0aW5nczpiYWNrdXBcIiwgPT5cbiAgICAgICAgQGJhY2t1cCgpXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCBcInN5bmMtc2V0dGluZ3M6cmVzdG9yZVwiLCA9PlxuICAgICAgICBAcmVzdG9yZSgpXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCAnYXRvbS13b3Jrc3BhY2UnLCBcInN5bmMtc2V0dGluZ3M6dmlldy1iYWNrdXBcIiwgPT5cbiAgICAgICAgQHZpZXdCYWNrdXAoKVxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgXCJzeW5jLXNldHRpbmdzOmNoZWNrLWJhY2t1cFwiLCA9PlxuICAgICAgICBAY2hlY2tGb3JVcGRhdGUoKVxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQgJ2F0b20td29ya3NwYWNlJywgXCJzeW5jLXNldHRpbmdzOmZvcmtcIiwgPT5cbiAgICAgICAgQGlucHV0Rm9ya0dpc3RJZCgpXG5cbiAgICAgIG1hbmRhdG9yeVNldHRpbmdzQXBwbGllZCA9IEBjaGVja01hbmRhdG9yeVNldHRpbmdzKClcbiAgICAgIEBjaGVja0ZvclVwZGF0ZSgpIGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5jaGVja0ZvclVwZGF0ZWRCYWNrdXAnKSBhbmQgbWFuZGF0b3J5U2V0dGluZ3NBcHBsaWVkXG5cbiAgZGVhY3RpdmF0ZTogLT5cbiAgICBAaW5wdXRWaWV3Py5kZXN0cm95KClcblxuICBzZXJpYWxpemU6IC0+XG5cbiAgZ2V0R2lzdElkOiAtPlxuICAgIGdpc3RJZCA9IGF0b20uY29uZmlnLmdldCAnc3luYy1zZXR0aW5ncy5naXN0SWQnXG4gICAgaWYgZ2lzdElkXG4gICAgICBnaXN0SWQgPSBnaXN0SWQudHJpbSgpXG4gICAgcmV0dXJuIGdpc3RJZFxuXG4gIGdldFBlcnNvbmFsQWNjZXNzVG9rZW46IC0+XG4gICAgdG9rZW4gPSBhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3MucGVyc29uYWxBY2Nlc3NUb2tlbicpIG9yIHByb2Nlc3MuZW52LkdJVEhVQl9UT0tFTlxuICAgIGlmIHRva2VuXG4gICAgICB0b2tlbiA9IHRva2VuLnRyaW0oKVxuICAgIHJldHVybiB0b2tlblxuXG4gIGNoZWNrTWFuZGF0b3J5U2V0dGluZ3M6IC0+XG4gICAgbWlzc2luZ1NldHRpbmdzID0gW11cbiAgICBpZiBub3QgQGdldEdpc3RJZCgpXG4gICAgICBtaXNzaW5nU2V0dGluZ3MucHVzaChcIkdpc3QgSURcIilcbiAgICBpZiBub3QgQGdldFBlcnNvbmFsQWNjZXNzVG9rZW4oKVxuICAgICAgbWlzc2luZ1NldHRpbmdzLnB1c2goXCJHaXRIdWIgcGVyc29uYWwgYWNjZXNzIHRva2VuXCIpXG4gICAgaWYgbWlzc2luZ1NldHRpbmdzLmxlbmd0aFxuICAgICAgQG5vdGlmeU1pc3NpbmdNYW5kYXRvcnlTZXR0aW5ncyhtaXNzaW5nU2V0dGluZ3MpXG4gICAgcmV0dXJuIG1pc3NpbmdTZXR0aW5ncy5sZW5ndGggaXMgMFxuXG4gIGNoZWNrRm9yVXBkYXRlOiAoY2I9bnVsbCkgLT5cbiAgICBpZiBAZ2V0R2lzdElkKClcbiAgICAgIGNvbnNvbGUuZGVidWcoJ2NoZWNraW5nIGxhdGVzdCBiYWNrdXAuLi4nKVxuICAgICAgQGNyZWF0ZUNsaWVudCgpLmdpc3RzLmdldFxuICAgICAgICBpZDogQGdldEdpc3RJZCgpXG4gICAgICAsIChlcnIsIHJlcykgPT5cbiAgICAgICAgaWYgZXJyXG4gICAgICAgICAgY29uc29sZS5lcnJvciBcImVycm9yIHdoaWxlIHJldHJpZXZpbmcgdGhlIGdpc3QuIGRvZXMgaXQgZXhpc3RzP1wiLCBlcnJcbiAgICAgICAgICB0cnlcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBKU09OLnBhcnNlKGVyci5tZXNzYWdlKS5tZXNzYWdlXG4gICAgICAgICAgICBtZXNzYWdlID0gJ0dpc3QgSUQgTm90IEZvdW5kJyBpZiBtZXNzYWdlIGlzICdOb3QgRm91bmQnXG4gICAgICAgICAgY2F0Y2ggU3ludGF4RXJyb3JcbiAgICAgICAgICAgIG1lc3NhZ2UgPSBlcnIubWVzc2FnZVxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBcInN5bmMtc2V0dGluZ3M6IEVycm9yIHJldHJpZXZpbmcgeW91ciBzZXR0aW5ncy4gKFwiK21lc3NhZ2UrXCIpXCJcbiAgICAgICAgICByZXR1cm4gY2I/KClcblxuICAgICAgICBpZiBub3QgcmVzPy5oaXN0b3J5P1swXT8udmVyc2lvbj9cbiAgICAgICAgICBjb25zb2xlLmVycm9yIFwiY291bGQgbm90IGludGVycHJldCByZXN1bHQ6XCIsIHJlc1xuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBcInN5bmMtc2V0dGluZ3M6IEVycm9yIHJldHJpZXZpbmcgeW91ciBzZXR0aW5ncy5cIlxuICAgICAgICAgIHJldHVybiBjYj8oKVxuXG4gICAgICAgIGNvbnNvbGUuZGVidWcoXCJsYXRlc3QgYmFja3VwIHZlcnNpb24gI3tyZXMuaGlzdG9yeVswXS52ZXJzaW9ufVwiKVxuICAgICAgICBpZiByZXMuaGlzdG9yeVswXS52ZXJzaW9uIGlzbnQgYXRvbS5jb25maWcuZ2V0KCdzeW5jLXNldHRpbmdzLl9sYXN0QmFja3VwSGFzaCcpXG4gICAgICAgICAgQG5vdGlmeU5ld2VyQmFja3VwKClcbiAgICAgICAgZWxzZSBpZiBub3QgYXRvbS5jb25maWcuZ2V0KCdzeW5jLXNldHRpbmdzLnF1aWV0VXBkYXRlQ2hlY2snKVxuICAgICAgICAgIEBub3RpZnlCYWNrdXBVcHRvZGF0ZSgpXG5cbiAgICAgICAgY2I/KClcbiAgICBlbHNlXG4gICAgICBAbm90aWZ5TWlzc2luZ01hbmRhdG9yeVNldHRpbmdzKFtcIkdpc3QgSURcIl0pXG5cbiAgbm90aWZ5TmV3ZXJCYWNrdXA6IC0+XG4gICAgIyB3ZSBuZWVkIHRoZSBhY3R1YWwgZWxlbWVudCBmb3IgZGlzcGF0Y2hpbmcgb24gaXRcbiAgICB3b3Jrc3BhY2VFbGVtZW50ID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICAgIG5vdGlmaWNhdGlvbiA9IGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nIFwic3luYy1zZXR0aW5nczogWW91ciBzZXR0aW5ncyBhcmUgb3V0IG9mIGRhdGUuXCIsXG4gICAgICBkaXNtaXNzYWJsZTogdHJ1ZVxuICAgICAgYnV0dG9uczogW3tcbiAgICAgICAgdGV4dDogXCJCYWNrdXBcIlxuICAgICAgICBvbkRpZENsaWNrOiAtPlxuICAgICAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2ggd29ya3NwYWNlRWxlbWVudCwgXCJzeW5jLXNldHRpbmdzOmJhY2t1cFwiXG4gICAgICAgICAgbm90aWZpY2F0aW9uLmRpc21pc3MoKVxuICAgICAgfSwge1xuICAgICAgICB0ZXh0OiBcIlZpZXcgYmFja3VwXCJcbiAgICAgICAgb25EaWRDbGljazogLT5cbiAgICAgICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoIHdvcmtzcGFjZUVsZW1lbnQsIFwic3luYy1zZXR0aW5nczp2aWV3LWJhY2t1cFwiXG4gICAgICB9LCB7XG4gICAgICAgIHRleHQ6IFwiUmVzdG9yZVwiXG4gICAgICAgIG9uRGlkQ2xpY2s6IC0+XG4gICAgICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaCB3b3Jrc3BhY2VFbGVtZW50LCBcInN5bmMtc2V0dGluZ3M6cmVzdG9yZVwiXG4gICAgICAgICAgbm90aWZpY2F0aW9uLmRpc21pc3MoKVxuICAgICAgfSwge1xuICAgICAgICB0ZXh0OiBcIkRpc21pc3NcIlxuICAgICAgICBvbkRpZENsaWNrOiAtPiBub3RpZmljYXRpb24uZGlzbWlzcygpXG4gICAgICB9XVxuXG4gIG5vdGlmeUJhY2t1cFVwdG9kYXRlOiAtPlxuICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzIFwic3luYy1zZXR0aW5nczogTGF0ZXN0IGJhY2t1cCBpcyBhbHJlYWR5IGFwcGxpZWQuXCJcblxuXG4gIG5vdGlmeU1pc3NpbmdNYW5kYXRvcnlTZXR0aW5nczogKG1pc3NpbmdTZXR0aW5ncykgLT5cbiAgICBjb250ZXh0ID0gdGhpc1xuICAgIGVycm9yTXNnID0gXCJzeW5jLXNldHRpbmdzOiBNYW5kYXRvcnkgc2V0dGluZ3MgbWlzc2luZzogXCIgKyBtaXNzaW5nU2V0dGluZ3Muam9pbignLCAnKVxuXG4gICAgbm90aWZpY2F0aW9uID0gYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIGVycm9yTXNnLFxuICAgICAgZGlzbWlzc2FibGU6IHRydWVcbiAgICAgIGJ1dHRvbnM6IFt7XG4gICAgICAgIHRleHQ6IFwiUGFja2FnZSBzZXR0aW5nc1wiXG4gICAgICAgIG9uRGlkQ2xpY2s6IC0+XG4gICAgICAgICAgICBjb250ZXh0LmdvVG9QYWNrYWdlU2V0dGluZ3MoKVxuICAgICAgICAgICAgbm90aWZpY2F0aW9uLmRpc21pc3MoKVxuICAgICAgfV1cblxuICBiYWNrdXA6IChjYj1udWxsKSAtPlxuICAgIGZpbGVzID0ge31cbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3Muc3luY1NldHRpbmdzJylcbiAgICAgIGZpbGVzW1wic2V0dGluZ3MuanNvblwiXSA9IGNvbnRlbnQ6IEBnZXRGaWx0ZXJlZFNldHRpbmdzKClcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3Muc3luY1BhY2thZ2VzJylcbiAgICAgIGZpbGVzW1wicGFja2FnZXMuanNvblwiXSA9IGNvbnRlbnQ6IEpTT04uc3RyaW5naWZ5KEBnZXRQYWNrYWdlcygpLCBudWxsLCAnXFx0JylcbiAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3Muc3luY0tleW1hcCcpXG4gICAgICBmaWxlc1tcImtleW1hcC5jc29uXCJdID0gY29udGVudDogKEBmaWxlQ29udGVudCBhdG9tLmtleW1hcHMuZ2V0VXNlcktleW1hcFBhdGgoKSkgPyBcIiMga2V5bWFwIGZpbGUgKG5vdCBmb3VuZClcIlxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5zeW5jU3R5bGVzJylcbiAgICAgIGZpbGVzW1wic3R5bGVzLmxlc3NcIl0gPSBjb250ZW50OiAoQGZpbGVDb250ZW50IGF0b20uc3R5bGVzLmdldFVzZXJTdHlsZVNoZWV0UGF0aCgpKSA/IFwiLy8gc3R5bGVzIGZpbGUgKG5vdCBmb3VuZClcIlxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5zeW5jSW5pdCcpXG4gICAgICBpbml0UGF0aCA9IGF0b20uZ2V0VXNlckluaXRTY3JpcHRQYXRoKClcbiAgICAgIHBhdGggPSByZXF1aXJlKCdwYXRoJylcbiAgICAgIGZpbGVzW3BhdGguYmFzZW5hbWUoaW5pdFBhdGgpXSA9IGNvbnRlbnQ6IChAZmlsZUNvbnRlbnQgaW5pdFBhdGgpID8gXCIjIGluaXRpYWxpemF0aW9uIGZpbGUgKG5vdCBmb3VuZClcIlxuICAgIGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5zeW5jU25pcHBldHMnKVxuICAgICAgZmlsZXNbXCJzbmlwcGV0cy5jc29uXCJdID0gY29udGVudDogKEBmaWxlQ29udGVudCBhdG9tLmNvbmZpZy5jb25maWdEaXJQYXRoICsgXCIvc25pcHBldHMuY3NvblwiKSA/IFwiIyBzbmlwcGV0cyBmaWxlIChub3QgZm91bmQpXCJcblxuICAgIGZvciBmaWxlIGluIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5leHRyYUZpbGVzJykgPyBbXVxuICAgICAgZXh0ID0gZmlsZS5zbGljZShmaWxlLmxhc3RJbmRleE9mKFwiLlwiKSkudG9Mb3dlckNhc2UoKVxuICAgICAgY210c3RhcnQgPSBcIiNcIlxuICAgICAgY210c3RhcnQgPSBcIi8vXCIgaWYgZXh0IGluIFtcIi5sZXNzXCIsIFwiLnNjc3NcIiwgXCIuanNcIl1cbiAgICAgIGNtdHN0YXJ0ID0gXCIvKlwiIGlmIGV4dCBpbiBbXCIuY3NzXCJdXG4gICAgICBjbXRlbmQgPSBcIlwiXG4gICAgICBjbXRlbmQgPSBcIiovXCIgaWYgZXh0IGluIFtcIi5jc3NcIl1cbiAgICAgIGZpbGVzW2ZpbGVdID1cbiAgICAgICAgY29udGVudDogKEBmaWxlQ29udGVudCBhdG9tLmNvbmZpZy5jb25maWdEaXJQYXRoICsgXCIvI3tmaWxlfVwiKSA/IFwiI3tjbXRzdGFydH0gI3tmaWxlfSAobm90IGZvdW5kKSAje2NtdGVuZH1cIlxuXG4gICAgQGNyZWF0ZUNsaWVudCgpLmdpc3RzLmVkaXRcbiAgICAgIGlkOiBAZ2V0R2lzdElkKClcbiAgICAgIGRlc2NyaXB0aW9uOiBhdG9tLmNvbmZpZy5nZXQgJ3N5bmMtc2V0dGluZ3MuZ2lzdERlc2NyaXB0aW9uJ1xuICAgICAgZmlsZXM6IGZpbGVzXG4gICAgLCAoZXJyLCByZXMpIC0+XG4gICAgICBpZiBlcnJcbiAgICAgICAgY29uc29sZS5lcnJvciBcImVycm9yIGJhY2tpbmcgdXAgZGF0YTogXCIrZXJyLm1lc3NhZ2UsIGVyclxuICAgICAgICB0cnlcbiAgICAgICAgICBtZXNzYWdlID0gSlNPTi5wYXJzZShlcnIubWVzc2FnZSkubWVzc2FnZVxuICAgICAgICAgIG1lc3NhZ2UgPSAnR2lzdCBJRCBOb3QgRm91bmQnIGlmIG1lc3NhZ2UgaXMgJ05vdCBGb3VuZCdcbiAgICAgICAgY2F0Y2ggU3ludGF4RXJyb3JcbiAgICAgICAgICBtZXNzYWdlID0gZXJyLm1lc3NhZ2VcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yIFwic3luYy1zZXR0aW5nczogRXJyb3IgYmFja2luZyB1cCB5b3VyIHNldHRpbmdzLiAoXCIrbWVzc2FnZStcIilcIlxuICAgICAgZWxzZVxuICAgICAgICBhdG9tLmNvbmZpZy5zZXQoJ3N5bmMtc2V0dGluZ3MuX2xhc3RCYWNrdXBIYXNoJywgcmVzLmhpc3RvcnlbMF0udmVyc2lvbilcbiAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MgXCJzeW5jLXNldHRpbmdzOiBZb3VyIHNldHRpbmdzIHdlcmUgc3VjY2Vzc2Z1bGx5IGJhY2tlZCB1cC4gPGJyLz48YSBocmVmPSdcIityZXMuaHRtbF91cmwrXCInPkNsaWNrIGhlcmUgdG8gb3BlbiB5b3VyIEdpc3QuPC9hPlwiXG4gICAgICBjYj8oZXJyLCByZXMpXG5cbiAgdmlld0JhY2t1cDogLT5cbiAgICBTaGVsbCA9IHJlcXVpcmUgJ3NoZWxsJ1xuICAgIGdpc3RJZCA9IEBnZXRHaXN0SWQoKVxuICAgIFNoZWxsLm9wZW5FeHRlcm5hbCBcImh0dHBzOi8vZ2lzdC5naXRodWIuY29tLyN7Z2lzdElkfVwiXG5cbiAgZ2V0UGFja2FnZXM6IC0+XG4gICAgcGFja2FnZXMgPSBbXVxuICAgIGZvciBpLCBtZXRhZGF0YSBvZiBAX2dldEF2YWlsYWJsZVBhY2thZ2VNZXRhZGF0YVdpdGhvdXREdXBsaWNhdGVzKClcbiAgICAgIHtuYW1lLCB2ZXJzaW9uLCB0aGVtZSwgYXBtSW5zdGFsbFNvdXJjZX0gPSBtZXRhZGF0YVxuICAgICAgcGFja2FnZXMucHVzaCh7bmFtZSwgdmVyc2lvbiwgdGhlbWUsIGFwbUluc3RhbGxTb3VyY2V9KVxuICAgIF8uc29ydEJ5KHBhY2thZ2VzLCAnbmFtZScpXG5cbiAgX2dldEF2YWlsYWJsZVBhY2thZ2VNZXRhZGF0YVdpdGhvdXREdXBsaWNhdGVzOiAtPlxuICAgIHBhdGgybWV0YWRhdGEgPSB7fVxuICAgIHBhY2thZ2VfbWV0YWRhdGEgPSBhdG9tLnBhY2thZ2VzLmdldEF2YWlsYWJsZVBhY2thZ2VNZXRhZGF0YSgpXG4gICAgZm9yIHBhdGgsIGkgaW4gYXRvbS5wYWNrYWdlcy5nZXRBdmFpbGFibGVQYWNrYWdlUGF0aHMoKVxuICAgICAgcGF0aDJtZXRhZGF0YVtmcy5yZWFscGF0aFN5bmMocGF0aCldID0gcGFja2FnZV9tZXRhZGF0YVtpXVxuXG4gICAgcGFja2FnZXMgPSBbXVxuICAgIGZvciBpLCBwa2dfbmFtZSBvZiBhdG9tLnBhY2thZ2VzLmdldEF2YWlsYWJsZVBhY2thZ2VOYW1lcygpXG4gICAgICBwa2dfcGF0aCA9IGF0b20ucGFja2FnZXMucmVzb2x2ZVBhY2thZ2VQYXRoKHBrZ19uYW1lKVxuICAgICAgaWYgcGF0aDJtZXRhZGF0YVtwa2dfcGF0aF1cbiAgICAgICAgcGFja2FnZXMucHVzaChwYXRoMm1ldGFkYXRhW3BrZ19wYXRoXSlcbiAgICAgIGVsc2VcbiAgICAgICAgY29uc29sZS5lcnJvcignY291bGQgbm90IGNvcnJlbGF0ZSBwYWNrYWdlIG5hbWUsIHBhdGgsIGFuZCBtZXRhZGF0YScpXG4gICAgcGFja2FnZXNcblxuICByZXN0b3JlOiAoY2I9bnVsbCkgLT5cbiAgICBAY3JlYXRlQ2xpZW50KCkuZ2lzdHMuZ2V0XG4gICAgICBpZDogQGdldEdpc3RJZCgpXG4gICAgLCAoZXJyLCByZXMpID0+XG4gICAgICBpZiBlcnJcbiAgICAgICAgY29uc29sZS5lcnJvciBcImVycm9yIHdoaWxlIHJldHJpZXZpbmcgdGhlIGdpc3QuIGRvZXMgaXQgZXhpc3RzP1wiLCBlcnJcbiAgICAgICAgdHJ5XG4gICAgICAgICAgbWVzc2FnZSA9IEpTT04ucGFyc2UoZXJyLm1lc3NhZ2UpLm1lc3NhZ2VcbiAgICAgICAgICBtZXNzYWdlID0gJ0dpc3QgSUQgTm90IEZvdW5kJyBpZiBtZXNzYWdlIGlzICdOb3QgRm91bmQnXG4gICAgICAgIGNhdGNoIFN5bnRheEVycm9yXG4gICAgICAgICAgbWVzc2FnZSA9IGVyci5tZXNzYWdlXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBcInN5bmMtc2V0dGluZ3M6IEVycm9yIHJldHJpZXZpbmcgeW91ciBzZXR0aW5ncy4gKFwiK21lc3NhZ2UrXCIpXCJcbiAgICAgICAgcmV0dXJuXG5cbiAgICAgIGNhbGxiYWNrQXN5bmMgPSBmYWxzZVxuXG4gICAgICBmb3Igb3duIGZpbGVuYW1lLCBmaWxlIG9mIHJlcy5maWxlc1xuICAgICAgICBzd2l0Y2ggZmlsZW5hbWVcbiAgICAgICAgICB3aGVuICdzZXR0aW5ncy5qc29uJ1xuICAgICAgICAgICAgQGFwcGx5U2V0dGluZ3MgJycsIEpTT04ucGFyc2UoZmlsZS5jb250ZW50KSBpZiBhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3Muc3luY1NldHRpbmdzJylcblxuICAgICAgICAgIHdoZW4gJ3BhY2thZ2VzLmpzb24nXG4gICAgICAgICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3Muc3luY1BhY2thZ2VzJylcbiAgICAgICAgICAgICAgY2FsbGJhY2tBc3luYyA9IHRydWVcbiAgICAgICAgICAgICAgQGluc3RhbGxNaXNzaW5nUGFja2FnZXMgSlNPTi5wYXJzZShmaWxlLmNvbnRlbnQpLCBjYlxuICAgICAgICAgICAgICBpZiBhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3MucmVtb3ZlT2Jzb2xldGVQYWNrYWdlcycpXG4gICAgICAgICAgICAgICAgQHJlbW92ZU9ic29sZXRlUGFja2FnZXMgSlNPTi5wYXJzZShmaWxlLmNvbnRlbnQpLCBjYlxuXG4gICAgICAgICAgd2hlbiAna2V5bWFwLmNzb24nXG4gICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jIGF0b20ua2V5bWFwcy5nZXRVc2VyS2V5bWFwUGF0aCgpLCBmaWxlLmNvbnRlbnQgaWYgYXRvbS5jb25maWcuZ2V0KCdzeW5jLXNldHRpbmdzLnN5bmNLZXltYXAnKVxuXG4gICAgICAgICAgd2hlbiAnc3R5bGVzLmxlc3MnXG4gICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jIGF0b20uc3R5bGVzLmdldFVzZXJTdHlsZVNoZWV0UGF0aCgpLCBmaWxlLmNvbnRlbnQgaWYgYXRvbS5jb25maWcuZ2V0KCdzeW5jLXNldHRpbmdzLnN5bmNTdHlsZXMnKVxuXG4gICAgICAgICAgd2hlbiAnaW5pdC5jb2ZmZWUnXG4gICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jIGF0b20uY29uZmlnLmNvbmZpZ0RpclBhdGggKyBcIi9pbml0LmNvZmZlZVwiLCBmaWxlLmNvbnRlbnQgaWYgYXRvbS5jb25maWcuZ2V0KCdzeW5jLXNldHRpbmdzLnN5bmNJbml0JylcblxuICAgICAgICAgIHdoZW4gJ2luaXQuanMnXG4gICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jIGF0b20uY29uZmlnLmNvbmZpZ0RpclBhdGggKyBcIi9pbml0LmpzXCIsIGZpbGUuY29udGVudCBpZiBhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3Muc3luY0luaXQnKVxuXG4gICAgICAgICAgd2hlbiAnc25pcHBldHMuY3NvbidcbiAgICAgICAgICAgIGZzLndyaXRlRmlsZVN5bmMgYXRvbS5jb25maWcuY29uZmlnRGlyUGF0aCArIFwiL3NuaXBwZXRzLmNzb25cIiwgZmlsZS5jb250ZW50IGlmIGF0b20uY29uZmlnLmdldCgnc3luYy1zZXR0aW5ncy5zeW5jU25pcHBldHMnKVxuXG4gICAgICAgICAgZWxzZSBmcy53cml0ZUZpbGVTeW5jIFwiI3thdG9tLmNvbmZpZy5jb25maWdEaXJQYXRofS8je2ZpbGVuYW1lfVwiLCBmaWxlLmNvbnRlbnRcblxuICAgICAgYXRvbS5jb25maWcuc2V0KCdzeW5jLXNldHRpbmdzLl9sYXN0QmFja3VwSGFzaCcsIHJlcy5oaXN0b3J5WzBdLnZlcnNpb24pXG5cbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzIFwic3luYy1zZXR0aW5nczogWW91ciBzZXR0aW5ncyB3ZXJlIHN1Y2Nlc3NmdWxseSBzeW5jaHJvbml6ZWQuXCJcblxuICAgICAgY2I/KCkgdW5sZXNzIGNhbGxiYWNrQXN5bmNcblxuICBjcmVhdGVDbGllbnQ6IC0+XG4gICAgdG9rZW4gPSBAZ2V0UGVyc29uYWxBY2Nlc3NUb2tlbigpXG4gICAgY29uc29sZS5kZWJ1ZyBcIkNyZWF0aW5nIEdpdEh1YkFwaSBjbGllbnQgd2l0aCB0b2tlbiA9ICN7dG9rZW59XCJcbiAgICBnaXRodWIgPSBuZXcgR2l0SHViQXBpXG4gICAgICB2ZXJzaW9uOiAnMy4wLjAnXG4gICAgICAjIGRlYnVnOiB0cnVlXG4gICAgICBwcm90b2NvbDogJ2h0dHBzJ1xuICAgIGdpdGh1Yi5hdXRoZW50aWNhdGVcbiAgICAgIHR5cGU6ICdvYXV0aCdcbiAgICAgIHRva2VuOiB0b2tlblxuICAgIGdpdGh1YlxuXG4gIGdldEZpbHRlcmVkU2V0dGluZ3M6IC0+XG4gICAgIyBfLmNsb25lKCkgZG9lc24ndCBkZWVwIGNsb25lIHRodXMgd2UgYXJlIHVzaW5nIEpTT04gcGFyc2UgdHJpY2tcbiAgICBzZXR0aW5ncyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoYXRvbS5jb25maWcuc2V0dGluZ3MpKVxuICAgIGJsYWNrbGlzdGVkS2V5cyA9IFJFTU9WRV9LRVlTLmNvbmNhdChhdG9tLmNvbmZpZy5nZXQoJ3N5bmMtc2V0dGluZ3MuYmxhY2tsaXN0ZWRLZXlzJykgPyBbXSlcbiAgICBmb3IgYmxhY2tsaXN0ZWRLZXkgaW4gYmxhY2tsaXN0ZWRLZXlzXG4gICAgICBibGFja2xpc3RlZEtleSA9IGJsYWNrbGlzdGVkS2V5LnNwbGl0KFwiLlwiKVxuICAgICAgQF9yZW1vdmVQcm9wZXJ0eShzZXR0aW5ncywgYmxhY2tsaXN0ZWRLZXkpXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHNldHRpbmdzLCBudWxsLCAnXFx0JylcblxuICBfcmVtb3ZlUHJvcGVydHk6IChvYmosIGtleSkgLT5cbiAgICBsYXN0S2V5ID0ga2V5Lmxlbmd0aCBpcyAxXG4gICAgY3VycmVudEtleSA9IGtleS5zaGlmdCgpXG5cbiAgICBpZiBub3QgbGFzdEtleSBhbmQgXy5pc09iamVjdChvYmpbY3VycmVudEtleV0pIGFuZCBub3QgXy5pc0FycmF5KG9ialtjdXJyZW50S2V5XSlcbiAgICAgIEBfcmVtb3ZlUHJvcGVydHkob2JqW2N1cnJlbnRLZXldLCBrZXkpXG4gICAgZWxzZVxuICAgICAgZGVsZXRlIG9ialtjdXJyZW50S2V5XVxuXG4gIGdvVG9QYWNrYWdlU2V0dGluZ3M6IC0+XG4gICAgYXRvbS53b3Jrc3BhY2Uub3BlbihcImF0b206Ly9jb25maWcvcGFja2FnZXMvc3luYy1zZXR0aW5nc1wiKVxuXG4gIGFwcGx5U2V0dGluZ3M6IChwcmVmLCBzZXR0aW5ncykgLT5cbiAgICBmb3Iga2V5LCB2YWx1ZSBvZiBzZXR0aW5nc1xuICAgICAga2V5UGF0aCA9IFwiI3twcmVmfS4je2tleX1cIlxuICAgICAgaXNDb2xvciA9IGZhbHNlXG4gICAgICBpZiBfLmlzT2JqZWN0KHZhbHVlKVxuICAgICAgICB2YWx1ZUtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSlcbiAgICAgICAgY29sb3JLZXlzID0gWydhbHBoYScsICdibHVlJywgJ2dyZWVuJywgJ3JlZCddXG4gICAgICAgIGlzQ29sb3IgPSBfLmlzRXF1YWwoXy5zb3J0QnkodmFsdWVLZXlzKSwgY29sb3JLZXlzKVxuICAgICAgaWYgXy5pc09iamVjdCh2YWx1ZSkgYW5kIG5vdCBfLmlzQXJyYXkodmFsdWUpIGFuZCBub3QgaXNDb2xvclxuICAgICAgICBAYXBwbHlTZXR0aW5ncyBrZXlQYXRoLCB2YWx1ZVxuICAgICAgZWxzZVxuICAgICAgICBjb25zb2xlLmRlYnVnIFwiY29uZmlnLnNldCAje2tleVBhdGhbMS4uLl19PSN7dmFsdWV9XCJcbiAgICAgICAgYXRvbS5jb25maWcuc2V0IGtleVBhdGhbMS4uLl0sIHZhbHVlXG5cbiAgcmVtb3ZlT2Jzb2xldGVQYWNrYWdlczogKHJlbWFpbmluZ19wYWNrYWdlcywgY2IpIC0+XG4gICAgaW5zdGFsbGVkX3BhY2thZ2VzID0gQGdldFBhY2thZ2VzKClcbiAgICBvYnNvbGV0ZV9wYWNrYWdlcyA9IFtdXG4gICAgZm9yIHBrZyBpbiBpbnN0YWxsZWRfcGFja2FnZXNcbiAgICAgIGtlZXBfaW5zdGFsbGVkX3BhY2thZ2UgPSAocCBmb3IgcCBpbiByZW1haW5pbmdfcGFja2FnZXMgd2hlbiBwLm5hbWUgaXMgcGtnLm5hbWUpXG4gICAgICBpZiBrZWVwX2luc3RhbGxlZF9wYWNrYWdlLmxlbmd0aCBpcyAwXG4gICAgICAgIG9ic29sZXRlX3BhY2thZ2VzLnB1c2gocGtnKVxuICAgIGlmIG9ic29sZXRlX3BhY2thZ2VzLmxlbmd0aCBpcyAwXG4gICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyBcIlN5bmMtc2V0dGluZ3M6IG5vIHBhY2thZ2VzIHRvIHJlbW92ZVwiXG4gICAgICByZXR1cm4gY2I/KClcblxuICAgIG5vdGlmaWNhdGlvbnMgPSB7fVxuICAgIHN1Y2NlZWRlZCA9IFtdXG4gICAgZmFpbGVkID0gW11cbiAgICByZW1vdmVOZXh0UGFja2FnZSA9ID0+XG4gICAgICBpZiBvYnNvbGV0ZV9wYWNrYWdlcy5sZW5ndGggPiAwXG4gICAgICAgICMgc3RhcnQgcmVtb3ZpbmcgbmV4dCBwYWNrYWdlXG4gICAgICAgIHBrZyA9IG9ic29sZXRlX3BhY2thZ2VzLnNoaWZ0KClcbiAgICAgICAgaSA9IHN1Y2NlZWRlZC5sZW5ndGggKyBmYWlsZWQubGVuZ3RoICsgT2JqZWN0LmtleXMobm90aWZpY2F0aW9ucykubGVuZ3RoICsgMVxuICAgICAgICBjb3VudCA9IGkgKyBvYnNvbGV0ZV9wYWNrYWdlcy5sZW5ndGhcbiAgICAgICAgbm90aWZpY2F0aW9uc1twa2cubmFtZV0gPSBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyBcIlN5bmMtc2V0dGluZ3M6IHJlbW92aW5nICN7cGtnLm5hbWV9ICgje2l9LyN7Y291bnR9KVwiLCB7ZGlzbWlzc2FibGU6IHRydWV9XG4gICAgICAgIGRvIChwa2cpID0+XG4gICAgICAgICAgQHJlbW92ZVBhY2thZ2UgcGtnLCAoZXJyb3IpIC0+XG4gICAgICAgICAgICAjIHJlbW92YWwgb2YgcGFja2FnZSBmaW5pc2hlZFxuICAgICAgICAgICAgbm90aWZpY2F0aW9uc1twa2cubmFtZV0uZGlzbWlzcygpXG4gICAgICAgICAgICBkZWxldGUgbm90aWZpY2F0aW9uc1twa2cubmFtZV1cbiAgICAgICAgICAgIGlmIGVycm9yP1xuICAgICAgICAgICAgICBmYWlsZWQucHVzaChwa2cubmFtZSlcbiAgICAgICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcgXCJTeW5jLXNldHRpbmdzOiBmYWlsZWQgdG8gcmVtb3ZlICN7cGtnLm5hbWV9XCJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgc3VjY2VlZGVkLnB1c2gocGtnLm5hbWUpXG4gICAgICAgICAgICAjIHRyaWdnZXIgbmV4dCBwYWNrYWdlXG4gICAgICAgICAgICByZW1vdmVOZXh0UGFja2FnZSgpXG4gICAgICBlbHNlIGlmIE9iamVjdC5rZXlzKG5vdGlmaWNhdGlvbnMpLmxlbmd0aCBpcyAwXG4gICAgICAgICMgbGFzdCBwYWNrYWdlIHJlbW92YWwgZmluaXNoZWRcbiAgICAgICAgaWYgZmFpbGVkLmxlbmd0aCBpcyAwXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MgXCJTeW5jLXNldHRpbmdzOiBmaW5pc2hlZCByZW1vdmluZyAje3N1Y2NlZWRlZC5sZW5ndGh9IHBhY2thZ2VzXCJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGZhaWxlZC5zb3J0KClcbiAgICAgICAgICBmYWlsZWRTdHIgPSBmYWlsZWQuam9pbignLCAnKVxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRXYXJuaW5nIFwiU3luYy1zZXR0aW5nczogZmluaXNoZWQgcmVtb3ZpbmcgcGFja2FnZXMgKCN7ZmFpbGVkLmxlbmd0aH0gZmFpbGVkOiAje2ZhaWxlZFN0cn0pXCIsIHtkaXNtaXNzYWJsZTogdHJ1ZX1cbiAgICAgICAgY2I/KClcbiAgICAjIHN0YXJ0IGFzIG1hbnkgcGFja2FnZSByZW1vdmFsIGluIHBhcmFsbGVsIGFzIGRlc2lyZWRcbiAgICBjb25jdXJyZW5jeSA9IE1hdGgubWluIG9ic29sZXRlX3BhY2thZ2VzLmxlbmd0aCwgOFxuICAgIGZvciBpIGluIFswLi4uY29uY3VycmVuY3ldXG4gICAgICByZW1vdmVOZXh0UGFja2FnZSgpXG5cbiAgcmVtb3ZlUGFja2FnZTogKHBhY2ssIGNiKSAtPlxuICAgIHR5cGUgPSBpZiBwYWNrLnRoZW1lIHRoZW4gJ3RoZW1lJyBlbHNlICdwYWNrYWdlJ1xuICAgIGNvbnNvbGUuaW5mbyhcIlJlbW92aW5nICN7dHlwZX0gI3twYWNrLm5hbWV9Li4uXCIpXG4gICAgcGFja2FnZU1hbmFnZXIgPSBuZXcgUGFja2FnZU1hbmFnZXIoKVxuICAgIHBhY2thZ2VNYW5hZ2VyLnVuaW5zdGFsbCBwYWNrLCAoZXJyb3IpIC0+XG4gICAgICBpZiBlcnJvcj9cbiAgICAgICAgY29uc29sZS5lcnJvcihcIlJlbW92aW5nICN7dHlwZX0gI3twYWNrLm5hbWV9IGZhaWxlZFwiLCBlcnJvci5zdGFjayA/IGVycm9yLCBlcnJvci5zdGRlcnIpXG4gICAgICBlbHNlXG4gICAgICAgIGNvbnNvbGUuaW5mbyhcIlJlbW92aW5nICN7dHlwZX0gI3twYWNrLm5hbWV9XCIpXG4gICAgICBjYj8oZXJyb3IpXG5cbiAgaW5zdGFsbE1pc3NpbmdQYWNrYWdlczogKHBhY2thZ2VzLCBjYikgLT5cbiAgICBhdmFpbGFibGVfcGFja2FnZXMgPSBAZ2V0UGFja2FnZXMoKVxuICAgIG1pc3NpbmdfcGFja2FnZXMgPSBbXVxuICAgIGZvciBwa2cgaW4gcGFja2FnZXNcbiAgICAgIGF2YWlsYWJsZV9wYWNrYWdlID0gKHAgZm9yIHAgaW4gYXZhaWxhYmxlX3BhY2thZ2VzIHdoZW4gcC5uYW1lIGlzIHBrZy5uYW1lKVxuICAgICAgaWYgYXZhaWxhYmxlX3BhY2thZ2UubGVuZ3RoIGlzIDBcbiAgICAgICAgIyBtaXNzaW5nIGlmIG5vdCB5ZXQgaW5zdGFsbGVkXG4gICAgICAgIG1pc3NpbmdfcGFja2FnZXMucHVzaChwa2cpXG4gICAgICBlbHNlIGlmIG5vdCghIXBrZy5hcG1JbnN0YWxsU291cmNlIGlzICEhYXZhaWxhYmxlX3BhY2thZ2VbMF0uYXBtSW5zdGFsbFNvdXJjZSlcbiAgICAgICAgIyBvciBpbnN0YWxsZWQgYnV0IHdpdGggZGlmZmVyZW50IGFwbSBpbnN0YWxsIHNvdXJjZVxuICAgICAgICBtaXNzaW5nX3BhY2thZ2VzLnB1c2gocGtnKVxuICAgIGlmIG1pc3NpbmdfcGFja2FnZXMubGVuZ3RoIGlzIDBcbiAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRJbmZvIFwiU3luYy1zZXR0aW5nczogbm8gcGFja2FnZXMgdG8gaW5zdGFsbFwiXG4gICAgICByZXR1cm4gY2I/KClcblxuICAgIG5vdGlmaWNhdGlvbnMgPSB7fVxuICAgIHN1Y2NlZWRlZCA9IFtdXG4gICAgZmFpbGVkID0gW11cbiAgICBpbnN0YWxsTmV4dFBhY2thZ2UgPSA9PlxuICAgICAgaWYgbWlzc2luZ19wYWNrYWdlcy5sZW5ndGggPiAwXG4gICAgICAgICMgc3RhcnQgaW5zdGFsbGluZyBuZXh0IHBhY2thZ2VcbiAgICAgICAgcGtnID0gbWlzc2luZ19wYWNrYWdlcy5zaGlmdCgpXG4gICAgICAgIGkgPSBzdWNjZWVkZWQubGVuZ3RoICsgZmFpbGVkLmxlbmd0aCArIE9iamVjdC5rZXlzKG5vdGlmaWNhdGlvbnMpLmxlbmd0aCArIDFcbiAgICAgICAgY291bnQgPSBpICsgbWlzc2luZ19wYWNrYWdlcy5sZW5ndGhcbiAgICAgICAgbm90aWZpY2F0aW9uc1twa2cubmFtZV0gPSBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkSW5mbyBcIlN5bmMtc2V0dGluZ3M6IGluc3RhbGxpbmcgI3twa2cubmFtZX0gKCN7aX0vI3tjb3VudH0pXCIsIHtkaXNtaXNzYWJsZTogdHJ1ZX1cbiAgICAgICAgZG8gKHBrZykgPT5cbiAgICAgICAgICBAaW5zdGFsbFBhY2thZ2UgcGtnLCAoZXJyb3IpIC0+XG4gICAgICAgICAgICAjIGluc3RhbGxhdGlvbiBvZiBwYWNrYWdlIGZpbmlzaGVkXG4gICAgICAgICAgICBub3RpZmljYXRpb25zW3BrZy5uYW1lXS5kaXNtaXNzKClcbiAgICAgICAgICAgIGRlbGV0ZSBub3RpZmljYXRpb25zW3BrZy5uYW1lXVxuICAgICAgICAgICAgaWYgZXJyb3I/XG4gICAgICAgICAgICAgIGZhaWxlZC5wdXNoKHBrZy5uYW1lKVxuICAgICAgICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkV2FybmluZyBcIlN5bmMtc2V0dGluZ3M6IGZhaWxlZCB0byBpbnN0YWxsICN7cGtnLm5hbWV9XCJcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgc3VjY2VlZGVkLnB1c2gocGtnLm5hbWUpXG4gICAgICAgICAgICAjIHRyaWdnZXIgbmV4dCBwYWNrYWdlXG4gICAgICAgICAgICBpbnN0YWxsTmV4dFBhY2thZ2UoKVxuICAgICAgZWxzZSBpZiBPYmplY3Qua2V5cyhub3RpZmljYXRpb25zKS5sZW5ndGggaXMgMFxuICAgICAgICAjIGxhc3QgcGFja2FnZSBpbnN0YWxsYXRpb24gZmluaXNoZWRcbiAgICAgICAgaWYgZmFpbGVkLmxlbmd0aCBpcyAwXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFN1Y2Nlc3MgXCJTeW5jLXNldHRpbmdzOiBmaW5pc2hlZCBpbnN0YWxsaW5nICN7c3VjY2VlZGVkLmxlbmd0aH0gcGFja2FnZXNcIlxuICAgICAgICBlbHNlXG4gICAgICAgICAgZmFpbGVkLnNvcnQoKVxuICAgICAgICAgIGZhaWxlZFN0ciA9IGZhaWxlZC5qb2luKCcsICcpXG4gICAgICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZFdhcm5pbmcgXCJTeW5jLXNldHRpbmdzOiBmaW5pc2hlZCBpbnN0YWxsaW5nIHBhY2thZ2VzICgje2ZhaWxlZC5sZW5ndGh9IGZhaWxlZDogI3tmYWlsZWRTdHJ9KVwiLCB7ZGlzbWlzc2FibGU6IHRydWV9XG4gICAgICAgIGNiPygpXG4gICAgIyBzdGFydCBhcyBtYW55IHBhY2thZ2UgaW5zdGFsbGF0aW9ucyBpbiBwYXJhbGxlbCBhcyBkZXNpcmVkXG4gICAgY29uY3VycmVuY3kgPSBNYXRoLm1pbiBtaXNzaW5nX3BhY2thZ2VzLmxlbmd0aCwgOFxuICAgIGZvciBpIGluIFswLi4uY29uY3VycmVuY3ldXG4gICAgICBpbnN0YWxsTmV4dFBhY2thZ2UoKVxuXG4gIGluc3RhbGxQYWNrYWdlOiAocGFjaywgY2IpIC0+XG4gICAgdHlwZSA9IGlmIHBhY2sudGhlbWUgdGhlbiAndGhlbWUnIGVsc2UgJ3BhY2thZ2UnXG4gICAgY29uc29sZS5pbmZvKFwiSW5zdGFsbGluZyAje3R5cGV9ICN7cGFjay5uYW1lfS4uLlwiKVxuICAgIHBhY2thZ2VNYW5hZ2VyID0gbmV3IFBhY2thZ2VNYW5hZ2VyKClcbiAgICBwYWNrYWdlTWFuYWdlci5pbnN0YWxsIHBhY2ssIChlcnJvcikgLT5cbiAgICAgIGlmIGVycm9yP1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiSW5zdGFsbGluZyAje3R5cGV9ICN7cGFjay5uYW1lfSBmYWlsZWRcIiwgZXJyb3Iuc3RhY2sgPyBlcnJvciwgZXJyb3Iuc3RkZXJyKVxuICAgICAgZWxzZVxuICAgICAgICBjb25zb2xlLmluZm8oXCJJbnN0YWxsZWQgI3t0eXBlfSAje3BhY2submFtZX1cIilcbiAgICAgIGNiPyhlcnJvcilcblxuICBmaWxlQ29udGVudDogKGZpbGVQYXRoKSAtPlxuICAgIHRyeVxuICAgICAgcmV0dXJuIGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwge2VuY29kaW5nOiAndXRmOCd9KSBvciBudWxsXG4gICAgY2F0Y2ggZVxuICAgICAgY29uc29sZS5lcnJvciBcIkVycm9yIHJlYWRpbmcgZmlsZSAje2ZpbGVQYXRofS4gUHJvYmFibHkgZG9lc24ndCBleGlzdC5cIiwgZVxuICAgICAgbnVsbFxuXG4gIGlucHV0Rm9ya0dpc3RJZDogLT5cbiAgICBGb3JrR2lzdElkSW5wdXRWaWV3ID89IHJlcXVpcmUgJy4vZm9yay1naXN0aWQtaW5wdXQtdmlldydcbiAgICBAaW5wdXRWaWV3ID0gbmV3IEZvcmtHaXN0SWRJbnB1dFZpZXcoKVxuICAgIEBpbnB1dFZpZXcuc2V0Q2FsbGJhY2tJbnN0YW5jZSh0aGlzKVxuXG4gIGZvcmtHaXN0SWQ6IChmb3JrSWQpIC0+XG4gICAgQGNyZWF0ZUNsaWVudCgpLmdpc3RzLmZvcmtcbiAgICAgIGlkOiBmb3JrSWRcbiAgICAsIChlcnIsIHJlcykgLT5cbiAgICAgIGlmIGVyclxuICAgICAgICB0cnlcbiAgICAgICAgICBtZXNzYWdlID0gSlNPTi5wYXJzZShlcnIubWVzc2FnZSkubWVzc2FnZVxuICAgICAgICAgIG1lc3NhZ2UgPSBcIkdpc3QgSUQgTm90IEZvdW5kXCIgaWYgbWVzc2FnZSBpcyBcIk5vdCBGb3VuZFwiXG4gICAgICAgIGNhdGNoIFN5bnRheEVycm9yXG4gICAgICAgICAgbWVzc2FnZSA9IGVyci5tZXNzYWdlXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvciBcInN5bmMtc2V0dGluZ3M6IEVycm9yIGZvcmtpbmcgc2V0dGluZ3MuIChcIittZXNzYWdlK1wiKVwiXG4gICAgICAgIHJldHVybiBjYj8oKVxuXG4gICAgICBpZiByZXMuaWRcbiAgICAgICAgYXRvbS5jb25maWcuc2V0IFwic3luYy1zZXR0aW5ncy5naXN0SWRcIiwgcmVzLmlkXG4gICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRTdWNjZXNzIFwic3luYy1zZXR0aW5nczogRm9ya2VkIHN1Y2Nlc3NmdWxseSB0byB0aGUgbmV3IEdpc3QgSUQgXCIgKyByZXMuaWQgKyBcIiB3aGljaCBoYXMgYmVlbiBzYXZlZCB0byB5b3VyIGNvbmZpZy5cIlxuICAgICAgZWxzZVxuICAgICAgICBhdG9tLm5vdGlmaWNhdGlvbnMuYWRkRXJyb3IgXCJzeW5jLXNldHRpbmdzOiBFcnJvciBmb3JraW5nIHNldHRpbmdzXCJcblxuICAgICAgY2I/KClcblxubW9kdWxlLmV4cG9ydHMgPSBTeW5jU2V0dGluZ3NcbiJdfQ==
