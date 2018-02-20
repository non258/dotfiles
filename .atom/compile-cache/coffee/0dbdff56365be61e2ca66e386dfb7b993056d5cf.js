(function() {
  var CompositeDisposable, File, HashCompositeDisposable, Watcher, async, constants, fs, fsStore, log, sep,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  fs = require('fs-plus');

  fsStore = require('imdone-core/lib/mixins/repo-fs-store');

  File = require('imdone-core/lib/file');

  constants = require('imdone-core/lib/constants');

  sep = require('path').sep;

  log = require('./log');

  async = require('async');

  CompositeDisposable = require('atom').CompositeDisposable;

  HashCompositeDisposable = (function(superClass) {
    extend(HashCompositeDisposable, superClass);

    function HashCompositeDisposable(repo1) {
      this.repo = repo1;
      this.watched = {};
      HashCompositeDisposable.__super__.constructor.call(this);
    }

    HashCompositeDisposable.prototype.add = function(path, disposable) {
      if (!this.watched[path]) {
        this.watched[path] = {
          disposables: []
        };
      }
      this.remove(disposable);
      this.watched[path].disposables.push(disposable);
      return HashCompositeDisposable.__super__.add.call(this, disposable);
    };

    HashCompositeDisposable.prototype.remove = function(path) {
      var disposable, i, len, ref;
      if (typeof path !== 'string') {
        return HashCompositeDisposable.__super__.remove.call(this, path);
      }
      if (!(this.watched[path] && this.watched[path].disposables)) {
        return;
      }
      log("disposable removed for " + path);
      ref = this.watched[path].disposables;
      for (i = 0, len = ref.length; i < len; i++) {
        disposable = ref[i];
        HashCompositeDisposable.__super__.remove.call(this, disposable);
      }
      return delete this.watched[path];
    };

    HashCompositeDisposable.prototype.removeDir = function(dir) {
      var path, ref, results, watched;
      this.remove(dir);
      dir += sep;
      ref = this.watched;
      results = [];
      for (path in ref) {
        watched = ref[path];
        if (path.indexOf(dir) === 0) {
          results.push(this.remove(path));
        }
      }
      return results;
    };

    HashCompositeDisposable.prototype.removeDeletedChildren = function(dir) {
      var path, ref, results, watched;
      dir += sep;
      ref = this.watched;
      results = [];
      for (path in ref) {
        watched = ref[path];
        if (path.indexOf(dir) === 0) {
          if (!fs.existsSync(path)) {
            results.push(this.remove(path));
          } else {
            results.push(void 0);
          }
        }
      }
      return results;
    };

    HashCompositeDisposable.prototype.get = function(path) {
      return this.watched[path];
    };

    HashCompositeDisposable.prototype.dispose = function() {
      this.watched = {};
      return HashCompositeDisposable.__super__.dispose.call(this);
    };

    return HashCompositeDisposable;

  })(CompositeDisposable);

  Watcher = (function() {
    function Watcher(repo1) {
      var dir;
      this.repo = repo1;
      dir = ((function() {
        var i, len, ref, results;
        ref = atom.project.getDirectories();
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          dir = ref[i];
          if (dir.getPath() === this.repo.path) {
            results.push(dir);
          }
        }
        return results;
      }).call(this))[0];
      this.watched = new HashCompositeDisposable(this.repo);
      this.files = {};
      this.watchDir(dir);
    }

    Watcher.prototype.close = function() {
      var path, ref, watcher;
      ref = this.watched.watched;
      for (path in ref) {
        watcher = ref[path];
        this.closeWatcher(path);
      }
      return this.watched.dispose();
    };

    Watcher.prototype.closeWatcher = function(path) {
      log("Stopped watching " + path);
      return this.watched.remove(path);
    };

    Watcher.prototype.pause = function() {
      return this.paused = true;
    };

    Watcher.prototype.resume = function() {
      return this.paused = false;
    };

    Watcher.prototype.pathOrEntry = function(pathOrEntry) {
      if (typeof pathOrEntry === 'string') {
        return pathOrEntry;
      } else {
        return pathOrEntry.getPath();
      }
    };

    Watcher.prototype.shouldExclude = function(pathOrEntry) {
      var path, relPath;
      path = this.pathOrEntry(pathOrEntry);
      relPath = this.repo.getRelativePath(path);
      if (relPath.indexOf('.imdone') === 0) {
        return false;
      }
      return this.repo.shouldExclude(relPath);
    };

    Watcher.prototype.isImdoneConfig = function(pathOrEntry) {
      var path, relPath;
      path = this.pathOrEntry(pathOrEntry);
      relPath = this.repo.getRelativePath(path);
      return relPath.indexOf(constants.CONFIG_FILE) > -1;
    };

    Watcher.prototype.isImdoneIgnore = function(pathOrEntry) {
      var path, relPath;
      path = this.pathOrEntry(pathOrEntry);
      relPath = this.repo.getRelativePath(path);
      return relPath.indexOf(constants.IGNORE_FILE) > -1;
    };

    Watcher.prototype.getWatcher = function(pathOrEntry) {
      var path;
      if (!(pathOrEntry && this.watched)) {
        return;
      }
      path = this.pathOrEntry(pathOrEntry);
      return this.watched.get(path);
    };

    Watcher.prototype.setFileStats = function(entry, cb) {
      var _path, watched;
      _path = entry.getPath();
      watched = this.files[_path];
      if (!watched) {
        watched = this.files[_path] = {};
      }
      return fs.stat(_path, function(err, stats) {
        if (err) {
          return log(err);
        }
        watched.mtime = stats.mtime;
        if (cb) {
          return cb();
        }
      });
    };

    Watcher.prototype.getFileStats = function(pathOrEntry) {
      var path;
      path = this.pathOrEntry(pathOrEntry);
      return this.files[path];
    };

    Watcher.prototype.removeFile = function(path) {
      return delete this.files[path];
    };

    Watcher.prototype.isReallyChanged = function(entry, cb) {
      var path;
      if (this.shouldExclude(entry)) {
        return false;
      }
      path = entry.getPath();
      log("Checking if " + (entry.getPath()) + " is really changed");
      return fs.list(entry.getParent().getPath(), (function(_this) {
        return function(err, paths) {
          var watcher;
          if (err != null) {
            return cb(err);
          }
          if (!(paths && paths.indexOf(path) > -1)) {
            return cb(null, true);
          }
          watcher = _this.getFileStats(entry);
          if (!watcher) {
            return cb(null, true);
          }
          return fs.stat(path, function(err, stat) {
            if (err) {
              return cb(err);
            }
            if (!(stat && stat.mtime)) {
              return cb(null, false);
            }
            if (watcher.mtime.getTime() === stat.mtime.getTime()) {
              return cb(null, false);
            }
            watcher.mtime = stat.mtime;
            return cb(null, true);
          });
        };
      })(this));
    };

    Watcher.prototype.isNewEntry = function(pathOrEntry) {
      if (!(this.shouldExclude(pathOrEntry) || this.fileInRepo(pathOrEntry) || this.isImdoneConfig(pathOrEntry) || this.isImdoneIgnore(pathOrEntry) || this.getWatcher(pathOrEntry))) {
        return true;
      }
    };

    Watcher.prototype.hasNewChildren = function(entry, cb) {
      return fs.list(entry.getPath(), (function(_this) {
        return function(err, paths) {
          var i, len, path;
          if (typeof error !== "undefined" && error !== null) {
            return cb(err);
          }
          for (i = 0, len = paths.length; i < len; i++) {
            path = paths[i];
            if (_this.isNewEntry(path)) {
              return cb(null, true);
            }
          }
          return cb(null, false);
        };
      })(this));
    };

    Watcher.prototype.fileInRepo = function(pathOrEntry) {
      var path, relPath;
      path = this.pathOrEntry(pathOrEntry);
      relPath = this.repo.getRelativePath(path);
      return this.repo.getFile(relPath);
    };

    Watcher.prototype.watchDir = function(dir) {
      this.watchPath(dir);
      return dir.getEntries((function(_this) {
        return function(err, entries) {
          var entry, i, len, results;
          results = [];
          for (i = 0, len = entries.length; i < len; i++) {
            entry = entries[i];
            if (entry.isDirectory()) {
              if (!_this.shouldExclude(entry)) {
                results.push(_this.watchDir(entry));
              } else {
                results.push(void 0);
              }
            } else if (entry.isFile()) {
              if (!_this.shouldExclude(entry)) {
                results.push(_this.watchFile(entry));
              } else {
                results.push(void 0);
              }
            } else {
              results.push(void 0);
            }
          }
          return results;
        };
      })(this));
    };

    Watcher.prototype.watchFile = function(entry) {
      this.setFileStats(entry);
      if (!(this.fileInRepo(entry) || this.isImdoneConfig(entry) || this.isImdoneIgnore(entry))) {
        return this.fileAdded(entry);
      }
    };

    Watcher.prototype.watchPath = function(entry) {
      var path;
      if (!this.getWatcher(entry || entry.isFile())) {
        path = entry.getPath();
        log("Watching path " + path);
        return this.watched.add(path, entry.onDidChange((function(_this) {
          return function() {
            if (_this.paused) {
              return;
            }
            log("dirChanged " + (entry.getPath()));
            return _this.dirChanged(entry);
          };
        })(this)));
      }
    };

    Watcher.prototype.removeDeletedEntries = function(entry) {
      var dirPath, exists, path, ref, stats;
      dirPath = entry.getPath() + sep;
      ref = this.files;
      for (path in ref) {
        stats = ref[path];
        if (!(path.indexOf(dirPath) === 0)) {
          continue;
        }
        exists = fs.existsSync(path);
        if (!exists) {
          this.fileDeleted(path);
        }
      }
      return this.watched.removeDeletedChildren(entry.getPath());
    };

    Watcher.prototype.updateChangedChildren = function(dir, cb) {
      var hasChange, processEntry;
      hasChange = false;
      processEntry = (function(_this) {
        return function(entry, cb) {
          if (entry.isFile()) {
            return _this.isReallyChanged(entry, function(err, changed) {
              if (err) {
                return cb(err);
              }
              if (changed) {
                _this.fileChanged(entry);
                hasChange = true;
              }
              return cb();
            });
          }
        };
      })(this);
      return dir.getEntries((function(_this) {
        return function(err, entries) {
          return async.each(entries, processEntry, function(err) {
            log((dir.getPath()) + " hasChange:" + hasChange);
            return cb(err, hasChange);
          });
        };
      })(this));
    };

    Watcher.prototype.dirChanged = function(entry) {
      if (fs.existsSync(entry.getPath())) {
        return this.hasNewChildren(entry, (function(_this) {
          return function(err, hasNew) {
            log("*** " + (entry.getPath()) + " exists and hasNewChildren: " + hasNew);
            if (hasNew && !err) {
              return _this.watchDir(entry);
            } else {
              return _this.updateChangedChildren(entry, function(err, changed) {
                if (!changed) {
                  return _this.removeDeletedEntries(entry);
                }
              });
            }
          };
        })(this));
      } else {
        log("removing children of " + (entry.getPath()));
        this.removeDeletedEntries(entry);
        return this.watched.removeDir(entry.getPath());
      }
    };

    Watcher.prototype.fileChanged = function(entry) {
      var file, relPath;
      log("fileChanged " + (entry.getPath()));
      relPath = this.repo.getRelativePath(entry.getPath());
      file = this.repo.getFile(relPath) || relPath;
      if (this.isImdoneConfig(entry) || this.isImdoneIgnore(entry)) {
        return this.repo.emitConfigUpdate();
      } else {
        return this.repo.fileOK(file, (function(_this) {
          return function(err, ok) {
            if (err || !ok) {
              return;
            }
            return _this.repo.readFile(file, function(err, file) {
              return _this.repo.emitFileUpdate(file);
            });
          };
        })(this));
      }
    };

    Watcher.prototype.fileAdded = function(entry) {
      var file, relPath;
      log("fileAdded " + (entry.getPath()));
      relPath = this.repo.getRelativePath(entry.getPath());
      file = new File({
        repoId: this.repo.getId(),
        filePath: relPath,
        languages: this.repo.languages
      });
      return this.repo.fileOK(file, (function(_this) {
        return function(err, stat) {
          if (err || !stat) {
            return;
          }
          if (stat.mtime <= file.getModifiedTime()) {
            return;
          }
          return _this.repo.readFile(file, function(err, file) {
            return _this.repo.emitFileUpdate(file);
          });
        };
      })(this));
    };

    Watcher.prototype.fileDeleted = function(path) {
      var file, relPath;
      log("fileDeleted " + path);
      relPath = this.repo.getRelativePath(path);
      file = new File({
        repoId: this.repo.getId(),
        filePath: relPath,
        languages: this.repo.languages
      });
      this.removeFile(path);
      this.repo.removeFile(file);
      return this.repo.emitFileUpdate(file);
    };

    return Watcher;

  })();

  module.exports = function(repo) {
    var _destroy, _init, _refresh;
    repo = fsStore(repo, fs);
    _init = repo.init;
    repo.init = function(cb) {
      return _init.call(repo, function(err, files) {
        repo.initWatcher(cb, files);
        if (cb) {
          return cb(err, files);
        }
      });
    };
    _destroy = repo.destroy;
    repo.destroy = function() {
      if (repo.watcher) {
        repo.watcher.close();
      }
      return _destroy.apply(repo);
    };
    _refresh = repo.refresh;
    repo.refresh = function(cb) {
      if (repo.watcher) {
        repo.watcher.close();
      }
      return _refresh.call(repo, function(err, files) {
        repo.initWatcher(cb, files);
        if (cb) {
          return cb(err, files);
        }
      });
    };
    repo.initWatcher = function(cb, files) {
      repo.watcher = new Watcher(repo);
      if (!cb) {
        cb = (function() {});
      }
      return cb(null, files);
    };
    repo.pause = function() {
      if (repo.watcher && repo.watcher.pause) {
        return repo.watcher.pause();
      }
    };
    repo.resume = function() {
      if (repo.watcher && repo.watcher.resume) {
        return repo.watcher.resume();
      }
    };
    return repo;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2ltZG9uZS1hdG9tL2xpYi9zZXJ2aWNlcy9hdG9tLXdhdGNoZWQtZnMtc3RvcmUuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSxvR0FBQTtJQUFBOzs7RUFBQSxFQUFBLEdBQWMsT0FBQSxDQUFRLFNBQVI7O0VBQ2QsT0FBQSxHQUFjLE9BQUEsQ0FBUSxzQ0FBUjs7RUFDZCxJQUFBLEdBQWMsT0FBQSxDQUFRLHNCQUFSOztFQUNkLFNBQUEsR0FBYyxPQUFBLENBQVEsMkJBQVI7O0VBQ2QsR0FBQSxHQUFjLE9BQUEsQ0FBUSxNQUFSLENBQWUsQ0FBQzs7RUFDOUIsR0FBQSxHQUFjLE9BQUEsQ0FBUSxPQUFSOztFQUNkLEtBQUEsR0FBYyxPQUFBLENBQVEsT0FBUjs7RUFDYixzQkFBdUIsT0FBQSxDQUFRLE1BQVI7O0VBR2xCOzs7SUFDUyxpQ0FBQyxLQUFEO01BQUMsSUFBQyxDQUFBLE9BQUQ7TUFDWixJQUFDLENBQUEsT0FBRCxHQUFXO01BQ1gsdURBQUE7SUFGVzs7c0NBSWIsR0FBQSxHQUFLLFNBQUMsSUFBRCxFQUFPLFVBQVA7TUFDSCxJQUFBLENBQXlDLElBQUMsQ0FBQSxPQUFRLENBQUEsSUFBQSxDQUFsRDtRQUFBLElBQUMsQ0FBQSxPQUFRLENBQUEsSUFBQSxDQUFULEdBQWlCO1VBQUMsV0FBQSxFQUFZLEVBQWI7VUFBakI7O01BQ0EsSUFBQyxDQUFBLE1BQUQsQ0FBUSxVQUFSO01BQ0EsSUFBQyxDQUFBLE9BQVEsQ0FBQSxJQUFBLENBQUssQ0FBQyxXQUFXLENBQUMsSUFBM0IsQ0FBZ0MsVUFBaEM7YUFDQSxpREFBTSxVQUFOO0lBSkc7O3NDQU1MLE1BQUEsR0FBUSxTQUFDLElBQUQ7QUFDTixVQUFBO01BQUEsSUFBMEIsT0FBTyxJQUFQLEtBQWUsUUFBekM7QUFBQSxlQUFPLG9EQUFNLElBQU4sRUFBUDs7TUFD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LENBQUMsS0FBVCxDQUFlLElBQWY7SUFGYTtJQUlmLFFBQUEsR0FBVyxJQUFJLENBQUM7SUFDaEIsSUFBSSxDQUFDLE9BQUwsR0FBZSxTQUFDLEVBQUQ7TUFDYixJQUF3QixJQUFJLENBQUMsT0FBN0I7UUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQWIsQ0FBQSxFQUFBOzthQUNBLFFBQVEsQ0FBQyxJQUFULENBQWMsSUFBZCxFQUFvQixTQUFDLEdBQUQsRUFBTSxLQUFOO1FBQ2xCLElBQUksQ0FBQyxXQUFMLENBQWlCLEVBQWpCLEVBQXFCLEtBQXJCO1FBQ0EsSUFBa0IsRUFBbEI7aUJBQUEsRUFBQSxDQUFHLEdBQUgsRUFBUSxLQUFSLEVBQUE7O01BRmtCLENBQXBCO0lBRmE7SUFNZixJQUFJLENBQUMsV0FBTCxHQUFtQixTQUFDLEVBQUQsRUFBSyxLQUFMO01BQ2pCLElBQUksQ0FBQyxPQUFMLEdBQWUsSUFBSSxPQUFKLENBQVksSUFBWjtNQUNmLElBQUEsQ0FBb0IsRUFBcEI7UUFBQSxFQUFBLEdBQUssQ0FBQyxTQUFBLEdBQUEsQ0FBRCxFQUFMOzthQUNBLEVBQUEsQ0FBRyxJQUFILEVBQVMsS0FBVDtJQUhpQjtJQUtuQixJQUFJLENBQUMsS0FBTCxHQUFhLFNBQUE7TUFDWCxJQUF3QixJQUFJLENBQUMsT0FBTCxJQUFnQixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQXJEO2VBQUEsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFiLENBQUEsRUFBQTs7SUFEVztJQUdiLElBQUksQ0FBQyxNQUFMLEdBQWMsU0FBQTtNQUNaLElBQXlCLElBQUksQ0FBQyxPQUFMLElBQWdCLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBdEQ7ZUFBQSxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQWIsQ0FBQSxFQUFBOztJQURZO1dBR2Q7RUFoQ2dCO0FBOU9sQiIsInNvdXJjZXNDb250ZW50IjpbImZzICAgICAgICAgID0gcmVxdWlyZSAnZnMtcGx1cydcbmZzU3RvcmUgICAgID0gcmVxdWlyZSAnaW1kb25lLWNvcmUvbGliL21peGlucy9yZXBvLWZzLXN0b3JlJ1xuRmlsZSAgICAgICAgPSByZXF1aXJlICdpbWRvbmUtY29yZS9saWIvZmlsZSdcbmNvbnN0YW50cyAgID0gcmVxdWlyZSAnaW1kb25lLWNvcmUvbGliL2NvbnN0YW50cydcbnNlcCAgICAgICAgID0gcmVxdWlyZSgncGF0aCcpLnNlcFxubG9nICAgICAgICAgPSByZXF1aXJlICcuL2xvZydcbmFzeW5jICAgICAgID0gcmVxdWlyZSAnYXN5bmMnXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5cbmNsYXNzIEhhc2hDb21wb3NpdGVEaXNwb3NhYmxlIGV4dGVuZHMgQ29tcG9zaXRlRGlzcG9zYWJsZVxuICBjb25zdHJ1Y3RvcjogKEByZXBvKS0+XG4gICAgQHdhdGNoZWQgPSB7fVxuICAgIHN1cGVyKClcblxuICBhZGQ6IChwYXRoLCBkaXNwb3NhYmxlKSAtPlxuICAgIEB3YXRjaGVkW3BhdGhdID0ge2Rpc3Bvc2FibGVzOltdfSB1bmxlc3MgQHdhdGNoZWRbcGF0aF1cbiAgICBAcmVtb3ZlIGRpc3Bvc2FibGVcbiAgICBAd2F0Y2hlZFtwYXRoXS5kaXNwb3NhYmxlcy5wdXNoIGRpc3Bvc2FibGVcbiAgICBzdXBlciBkaXNwb3NhYmxlXG5cbiAgcmVtb3ZlOiAocGF0aCkgLT5cbiAgICByZXR1cm4gc3VwZXIocGF0aCkgdW5sZXNzIHR5cGVvZiBwYXRoIGlzICdzdHJpbmcnXG4gICAgcmV0dXJuIHVubGVzcyBAd2F0Y2hlZFtwYXRoXSAmJiBAd2F0Y2hlZFtwYXRoXS5kaXNwb3NhYmxlc1xuICAgIGxvZyBcImRpc3Bvc2FibGUgcmVtb3ZlZCBmb3IgI3twYXRofVwiXG4gICAgc3VwZXIoZGlzcG9zYWJsZSkgZm9yIGRpc3Bvc2FibGUgaW4gQHdhdGNoZWRbcGF0aF0uZGlzcG9zYWJsZXNcbiAgICBkZWxldGUgQHdhdGNoZWRbcGF0aF1cblxuICByZW1vdmVEaXI6IChkaXIpIC0+XG4gICAgQHJlbW92ZSBkaXJcbiAgICBkaXIgKz0gc2VwXG4gICAgQHJlbW92ZSBwYXRoIGZvciBwYXRoLCB3YXRjaGVkIG9mIEB3YXRjaGVkIHdoZW4gcGF0aC5pbmRleE9mKGRpcikgPT0gMFxuXG4gIHJlbW92ZURlbGV0ZWRDaGlsZHJlbjogKGRpcikgLT5cbiAgICBkaXIgKz0gc2VwXG4gICAgZm9yIHBhdGgsIHdhdGNoZWQgb2YgQHdhdGNoZWQgd2hlbiBwYXRoLmluZGV4T2YoZGlyKSA9PSAwXG4gICAgICBAcmVtb3ZlIHBhdGggdW5sZXNzIGZzLmV4aXN0c1N5bmMgcGF0aFxuXG4gIGdldDogKHBhdGgpIC0+XG4gICAgcmV0dXJuIEB3YXRjaGVkW3BhdGhdXG5cbiAgZGlzcG9zZTogLT5cbiAgICBAd2F0Y2hlZCA9IHt9XG4gICAgc3VwZXIoKVxuXG5jbGFzcyBXYXRjaGVyXG4gIGNvbnN0cnVjdG9yOiAoQHJlcG8pLT5cbiAgICBkaXIgPSAoZGlyIGZvciBkaXIgaW4gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKCkgd2hlbiBkaXIuZ2V0UGF0aCgpIGlzIEByZXBvLnBhdGgpWzBdXG4gICAgQHdhdGNoZWQgPSBuZXcgSGFzaENvbXBvc2l0ZURpc3Bvc2FibGUoQHJlcG8pXG4gICAgQGZpbGVzID0ge31cbiAgICBAd2F0Y2hEaXIgZGlyXG5cbiAgY2xvc2U6IC0+XG4gICAgQGNsb3NlV2F0Y2hlciBwYXRoIGZvciBwYXRoLCB3YXRjaGVyIG9mIEB3YXRjaGVkLndhdGNoZWRcbiAgICBAd2F0Y2hlZC5kaXNwb3NlKClcblxuICBjbG9zZVdhdGNoZXI6IChwYXRoKSAtPlxuICAgIGxvZyBcIlN0b3BwZWQgd2F0Y2hpbmcgI3twYXRofVwiXG4gICAgQHdhdGNoZWQucmVtb3ZlIHBhdGhcblxuICBwYXVzZTogLT5cbiAgICBAcGF1c2VkID0gdHJ1ZVxuXG4gIHJlc3VtZTogLT5cbiAgICBAcGF1c2VkID0gZmFsc2VcblxuICBwYXRoT3JFbnRyeTogKHBhdGhPckVudHJ5KSAtPlxuICAgIGlmIHR5cGVvZiBwYXRoT3JFbnRyeSBpcyAnc3RyaW5nJyB0aGVuIHBhdGhPckVudHJ5IGVsc2UgcGF0aE9yRW50cnkuZ2V0UGF0aCgpXG5cbiAgc2hvdWxkRXhjbHVkZTogKHBhdGhPckVudHJ5KSAtPlxuICAgIHBhdGggPSBAcGF0aE9yRW50cnkocGF0aE9yRW50cnkpXG4gICAgcmVsUGF0aCA9IEByZXBvLmdldFJlbGF0aXZlUGF0aChwYXRoKTtcbiAgICByZXR1cm4gZmFsc2UgaWYgKHJlbFBhdGguaW5kZXhPZignLmltZG9uZScpID09IDApXG4gICAgQHJlcG8uc2hvdWxkRXhjbHVkZShyZWxQYXRoKTtcblxuICBpc0ltZG9uZUNvbmZpZzogKHBhdGhPckVudHJ5KSAtPlxuICAgIHBhdGggPSBAcGF0aE9yRW50cnkocGF0aE9yRW50cnkpXG4gICAgcmVsUGF0aCA9IEByZXBvLmdldFJlbGF0aXZlUGF0aCBwYXRoXG4gICAgcmVsUGF0aC5pbmRleE9mKGNvbnN0YW50cy5DT05GSUdfRklMRSkgPiAtMVxuXG4gIGlzSW1kb25lSWdub3JlOiAocGF0aE9yRW50cnkpIC0+XG4gICAgcGF0aCA9IEBwYXRoT3JFbnRyeShwYXRoT3JFbnRyeSlcbiAgICByZWxQYXRoID0gQHJlcG8uZ2V0UmVsYXRpdmVQYXRoIHBhdGhcbiAgICByZWxQYXRoLmluZGV4T2YoY29uc3RhbnRzLklHTk9SRV9GSUxFKSA+IC0xXG5cbiAgZ2V0V2F0Y2hlcjogKHBhdGhPckVudHJ5KSAtPlxuICAgIHJldHVybiB1bmxlc3MgcGF0aE9yRW50cnkgJiYgQHdhdGNoZWRcbiAgICBwYXRoID0gQHBhdGhPckVudHJ5KHBhdGhPckVudHJ5KVxuICAgIEB3YXRjaGVkLmdldCBwYXRoXG5cbiAgc2V0RmlsZVN0YXRzOiAoZW50cnksIGNiKSAtPlxuICAgIF9wYXRoID0gZW50cnkuZ2V0UGF0aCgpXG4gICAgd2F0Y2hlZCA9IEBmaWxlc1tfcGF0aF1cbiAgICB3YXRjaGVkID0gQGZpbGVzW19wYXRoXSA9IHt9IHVubGVzcyB3YXRjaGVkXG4gICAgZnMuc3RhdCBfcGF0aCwgKGVyciwgc3RhdHMpIC0+XG4gICAgICByZXR1cm4gbG9nIGVyciBpZiBlcnJcbiAgICAgIHdhdGNoZWQubXRpbWUgID0gc3RhdHMubXRpbWVcbiAgICAgIGNiKCkgaWYgY2JcblxuICBnZXRGaWxlU3RhdHM6IChwYXRoT3JFbnRyeSkgLT5cbiAgICBwYXRoID0gQHBhdGhPckVudHJ5KHBhdGhPckVudHJ5KVxuICAgIEBmaWxlc1twYXRoXVxuXG4gIHJlbW92ZUZpbGU6IChwYXRoKSAtPlxuICAgIGRlbGV0ZSBAZmlsZXNbcGF0aF1cblxuICBpc1JlYWxseUNoYW5nZWQ6IChlbnRyeSwgY2IpIC0+XG4gICAgcmV0dXJuIGZhbHNlIGlmIEBzaG91bGRFeGNsdWRlKGVudHJ5KVxuICAgIHBhdGggPSBlbnRyeS5nZXRQYXRoKClcbiAgICBsb2cgXCJDaGVja2luZyBpZiAje2VudHJ5LmdldFBhdGgoKX0gaXMgcmVhbGx5IGNoYW5nZWRcIlxuICAgIGZzLmxpc3QgZW50cnkuZ2V0UGFyZW50KCkuZ2V0UGF0aCgpLCAoZXJyLCBwYXRocykgPT5cbiAgICAgIHJldHVybiBjYihlcnIpIGlmIGVycj9cbiAgICAgIHJldHVybiBjYihudWxsLCB0cnVlKSB1bmxlc3MgcGF0aHMgJiYgcGF0aHMuaW5kZXhPZihwYXRoKSA+IC0xXG4gICAgICB3YXRjaGVyID0gQGdldEZpbGVTdGF0cyBlbnRyeVxuICAgICAgcmV0dXJuIGNiKG51bGwsIHRydWUpIHVubGVzcyB3YXRjaGVyXG4gICAgICBmcy5zdGF0IHBhdGgsIChlcnIsIHN0YXQpIC0+XG4gICAgICAgIHJldHVybiBjYiBlcnIgaWYgZXJyXG4gICAgICAgIHJldHVybiBjYihudWxsLCBmYWxzZSkgdW5sZXNzIHN0YXQgJiYgc3RhdC5tdGltZVxuICAgICAgICByZXR1cm4gY2IobnVsbCwgZmFsc2UpIGlmIHdhdGNoZXIubXRpbWUuZ2V0VGltZSgpID09IHN0YXQubXRpbWUuZ2V0VGltZSgpXG4gICAgICAgIHdhdGNoZXIubXRpbWUgPSBzdGF0Lm10aW1lXG4gICAgICAgICMgZGlnZXN0ID0gZmlsZS5nZXREaWdlc3RTeW5jKClcbiAgICAgICAgIyByZXR1cm4gZmFsc2UgdW5sZXNzIGRpZ2VzdCAhPSB3YXRjaGVyLmRpZ2VzdFxuICAgICAgICAjIHdhdGNoZXIuZGlnZXN0ID0gZGlnZXN0XG4gICAgICAgIGNiIG51bGwsIHRydWVcblxuICBpc05ld0VudHJ5OiAocGF0aE9yRW50cnkpIC0+XG4gICAgcmV0dXJuIHRydWUgdW5sZXNzIEBzaG91bGRFeGNsdWRlKHBhdGhPckVudHJ5KSB8fCBAZmlsZUluUmVwbyhwYXRoT3JFbnRyeSkgfHwgQGlzSW1kb25lQ29uZmlnKHBhdGhPckVudHJ5KSB8fCBAaXNJbWRvbmVJZ25vcmUocGF0aE9yRW50cnkpIHx8IEBnZXRXYXRjaGVyIHBhdGhPckVudHJ5XG5cbiAgaGFzTmV3Q2hpbGRyZW46IChlbnRyeSwgY2IpIC0+XG4gICAgZnMubGlzdCBlbnRyeS5nZXRQYXRoKCksIChlcnIsIHBhdGhzKSA9PlxuICAgICAgcmV0dXJuIGNiKGVycikgaWYgZXJyb3I/XG4gICAgICBmb3IgcGF0aCBpbiBwYXRoc1xuICAgICAgICByZXR1cm4gY2IobnVsbCwgdHJ1ZSkgaWYgQGlzTmV3RW50cnkgcGF0aFxuICAgICAgcmV0dXJuIGNiKG51bGwsIGZhbHNlKVxuXG4gIGZpbGVJblJlcG86IChwYXRoT3JFbnRyeSkgLT5cbiAgICBwYXRoID0gQHBhdGhPckVudHJ5KHBhdGhPckVudHJ5KVxuICAgIHJlbFBhdGggPSBAcmVwby5nZXRSZWxhdGl2ZVBhdGggcGF0aFxuICAgIEByZXBvLmdldEZpbGUocmVsUGF0aClcblxuICB3YXRjaERpcjogKGRpcikgLT5cbiAgICBAd2F0Y2hQYXRoIGRpclxuICAgIGRpci5nZXRFbnRyaWVzIChlcnIsIGVudHJpZXMpID0+XG4gICAgICBmb3IgZW50cnkgaW4gZW50cmllc1xuICAgICAgICBpZiBlbnRyeS5pc0RpcmVjdG9yeSgpXG4gICAgICAgICAgQHdhdGNoRGlyIGVudHJ5IGlmICFAc2hvdWxkRXhjbHVkZShlbnRyeSlcbiAgICAgICAgZWxzZSBpZiBlbnRyeS5pc0ZpbGUoKVxuICAgICAgICAgIEB3YXRjaEZpbGUgZW50cnkgaWYgIUBzaG91bGRFeGNsdWRlKGVudHJ5KVxuXG4gIHdhdGNoRmlsZTogKGVudHJ5KSAtPlxuICAgIEBzZXRGaWxlU3RhdHMgZW50cnlcbiAgICB1bmxlc3MgQGZpbGVJblJlcG8oZW50cnkpIHx8IEBpc0ltZG9uZUNvbmZpZyhlbnRyeSkgfHwgQGlzSW1kb25lSWdub3JlKGVudHJ5KVxuICAgICAgQGZpbGVBZGRlZCBlbnRyeVxuXG4gIHdhdGNoUGF0aDogKGVudHJ5KSAtPlxuICAgIHVubGVzcyBAZ2V0V2F0Y2hlciBlbnRyeSB8fCBlbnRyeS5pc0ZpbGUoKVxuICAgICAgcGF0aCA9IGVudHJ5LmdldFBhdGgoKVxuICAgICAgbG9nIFwiV2F0Y2hpbmcgcGF0aCAje3BhdGh9XCJcbiAgICAgIEB3YXRjaGVkLmFkZCBwYXRoLCBlbnRyeS5vbkRpZENoYW5nZSA9PlxuICAgICAgICByZXR1cm4gaWYgQHBhdXNlZFxuICAgICAgICBsb2cgXCJkaXJDaGFuZ2VkICN7ZW50cnkuZ2V0UGF0aCgpfVwiXG4gICAgICAgIEBkaXJDaGFuZ2VkIGVudHJ5XG5cbiAgcmVtb3ZlRGVsZXRlZEVudHJpZXM6IChlbnRyeSkgLT5cbiAgICBkaXJQYXRoID0gZW50cnkuZ2V0UGF0aCgpICsgc2VwXG4gICAgZm9yIHBhdGgsIHN0YXRzIG9mIEBmaWxlcyB3aGVuIHBhdGguaW5kZXhPZihkaXJQYXRoKSA9PSAwXG4gICAgICBleGlzdHMgPSBmcy5leGlzdHNTeW5jIHBhdGhcbiAgICAgIEBmaWxlRGVsZXRlZCBwYXRoIHVubGVzcyBleGlzdHNcbiAgICBAd2F0Y2hlZC5yZW1vdmVEZWxldGVkQ2hpbGRyZW4gZW50cnkuZ2V0UGF0aCgpXG5cblxuICB1cGRhdGVDaGFuZ2VkQ2hpbGRyZW46IChkaXIsIGNiKSAtPlxuICAgIFxuICAgIGhhc0NoYW5nZSA9IGZhbHNlXG4gICAgXG4gICAgcHJvY2Vzc0VudHJ5ID0gKGVudHJ5LCBjYikgPT5cbiAgICAgIGlmIGVudHJ5LmlzRmlsZSgpXG4gICAgICAgIEBpc1JlYWxseUNoYW5nZWQgZW50cnksIChlcnIsIGNoYW5nZWQpID0+XG4gICAgICAgICAgcmV0dXJuIGNiIGVyciBpZiBlcnJcbiAgICAgICAgICBpZiBjaGFuZ2VkXG4gICAgICAgICAgICBAZmlsZUNoYW5nZWQgZW50cnlcbiAgICAgICAgICAgIGhhc0NoYW5nZSA9IHRydWVcbiAgICAgICAgICBjYigpXG5cbiAgICAjIEJBQ0tMT0c6IFVzZSBmcy5saXN0IGdoOjI2MyBpZDo3MFxuICAgIGRpci5nZXRFbnRyaWVzIChlcnIsIGVudHJpZXMpID0+XG4gICAgICBhc3luYy5lYWNoIGVudHJpZXMsIHByb2Nlc3NFbnRyeSwgKGVycikgPT5cbiAgICAgICAgbG9nIFwiI3tkaXIuZ2V0UGF0aCgpfSBoYXNDaGFuZ2U6I3toYXNDaGFuZ2V9XCJcbiAgICAgICAgY2IgZXJyLCBoYXNDaGFuZ2VcblxuICBkaXJDaGFuZ2VkOiAoZW50cnkpIC0+XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoZW50cnkuZ2V0UGF0aCgpKSlcbiAgICAgIEBoYXNOZXdDaGlsZHJlbiBlbnRyeSwgKGVyciwgaGFzTmV3KSA9PlxuICAgICAgICBsb2cgXCIqKiogI3tlbnRyeS5nZXRQYXRoKCl9IGV4aXN0cyBhbmQgaGFzTmV3Q2hpbGRyZW46ICN7aGFzTmV3fVwiXG4gICAgICAgIGlmIGhhc05ldyAmJiAhZXJyXG4gICAgICAgICAgQHdhdGNoRGlyIGVudHJ5XG4gICAgICAgIGVsc2UgQHVwZGF0ZUNoYW5nZWRDaGlsZHJlbiBlbnRyeSwgKGVyciwgY2hhbmdlZCkgPT5cbiAgICAgICAgICBAcmVtb3ZlRGVsZXRlZEVudHJpZXMgZW50cnkgdW5sZXNzIGNoYW5nZWRcbiAgICAgICMgb24gbWtkaXIgdGhpcyBmaXJlcyBvbmNlIGZvciB0aGUgcGFyZW50IG9mIHRoZSBkaXIgYWRkZWRcbiAgICAgICMgb24gdG91Y2ggdGhpcyBmaXJlcyB0d2ljZSBmb3IgdGhlIHBhcmVudCBvZiB0aGUgZmlsZSB0b3VjaGVkXG4gICAgICAjIG9uIGZpbGUgbW9kaWZpZWQgdGhpcyBmaXJlcyB0d2ljZSBmb3IgcGFyZW50IG9mIHRoZSBmaWxlIG1vZGlmaWVkXG4gICAgICAjIGRpckNoYW5nZWQgZmlyZXMgdHdpY2UgcGVyIGZpbGUgYW5kIGRpciBhZGRlZCBpbiB0aGUgZW50cnlcbiAgICBlbHNlXG4gICAgICAjIGRpckNoYW5nZWQgZmlyZXMgb25jZSBwZXIgY2hpbGQgZmlsZSBhbmQgZGlyIGluIHRoZSBkZWxldGVkIGVudHJ5IGFuZCBvbmNlIGZvciB0aGUgcGFycmVudCBlbnRyeVxuICAgICAgbG9nIFwicmVtb3ZpbmcgY2hpbGRyZW4gb2YgI3tlbnRyeS5nZXRQYXRoKCl9XCJcbiAgICAgIEByZW1vdmVEZWxldGVkRW50cmllcyBlbnRyeVxuICAgICAgQHdhdGNoZWQucmVtb3ZlRGlyKGVudHJ5LmdldFBhdGgoKSlcblxuICBmaWxlQ2hhbmdlZDogKGVudHJ5KSAtPlxuICAgIGxvZyBcImZpbGVDaGFuZ2VkICN7ZW50cnkuZ2V0UGF0aCgpfVwiXG4gICAgcmVsUGF0aCA9IEByZXBvLmdldFJlbGF0aXZlUGF0aCBlbnRyeS5nZXRQYXRoKClcbiAgICBmaWxlID0gQHJlcG8uZ2V0RmlsZShyZWxQYXRoKSB8fCByZWxQYXRoXG4gICAgaWYgKEBpc0ltZG9uZUNvbmZpZyhlbnRyeSkgfHwgQGlzSW1kb25lSWdub3JlKGVudHJ5KSlcbiAgICAgIEByZXBvLmVtaXRDb25maWdVcGRhdGUoKVxuICAgIGVsc2VcbiAgICAgIEByZXBvLmZpbGVPSyBmaWxlLCAoZXJyLCBvaykgPT5cbiAgICAgICAgcmV0dXJuIGlmIChlcnIgfHwgIW9rKVxuICAgICAgICBAcmVwby5yZWFkRmlsZSBmaWxlLCAoZXJyLCBmaWxlKSA9PlxuICAgICAgICAgIEByZXBvLmVtaXRGaWxlVXBkYXRlIGZpbGVcblxuICBmaWxlQWRkZWQ6IChlbnRyeSkgLT5cbiAgICBsb2cgXCJmaWxlQWRkZWQgI3tlbnRyeS5nZXRQYXRoKCl9XCJcbiAgICByZWxQYXRoID0gQHJlcG8uZ2V0UmVsYXRpdmVQYXRoIGVudHJ5LmdldFBhdGgoKVxuICAgIGZpbGUgPSBuZXcgRmlsZShyZXBvSWQ6IEByZXBvLmdldElkKCksIGZpbGVQYXRoOiByZWxQYXRoLCBsYW5ndWFnZXM6IEByZXBvLmxhbmd1YWdlcylcbiAgICBAcmVwby5maWxlT0sgZmlsZSwgKGVyciwgc3RhdCkgPT5cbiAgICAgIHJldHVybiBpZiAoZXJyIHx8ICFzdGF0KVxuICAgICAgcmV0dXJuIGlmIChzdGF0Lm10aW1lIDw9IGZpbGUuZ2V0TW9kaWZpZWRUaW1lKCkpXG4gICAgICBAcmVwby5yZWFkRmlsZSBmaWxlLCAoZXJyLCBmaWxlKSA9PlxuICAgICAgICBAcmVwby5lbWl0RmlsZVVwZGF0ZSBmaWxlXG5cbiAgZmlsZURlbGV0ZWQ6IChwYXRoKSAtPlxuICAgIGxvZyBcImZpbGVEZWxldGVkICN7cGF0aH1cIlxuICAgIHJlbFBhdGggPSBAcmVwby5nZXRSZWxhdGl2ZVBhdGggcGF0aFxuICAgIGZpbGUgPSBuZXcgRmlsZShyZXBvSWQ6IEByZXBvLmdldElkKCksIGZpbGVQYXRoOiByZWxQYXRoLCBsYW5ndWFnZXM6IEByZXBvLmxhbmd1YWdlcylcbiAgICBAcmVtb3ZlRmlsZSBwYXRoXG4gICAgQHJlcG8ucmVtb3ZlRmlsZSBmaWxlXG4gICAgQHJlcG8uZW1pdEZpbGVVcGRhdGUgZmlsZVxuXG5tb2R1bGUuZXhwb3J0cyA9ICAocmVwbykgLT5cbiAgcmVwbyA9IGZzU3RvcmUocmVwbywgZnMpXG5cbiAgX2luaXQgPSByZXBvLmluaXRcbiAgcmVwby5pbml0ID0gKGNiKSAtPlxuICAgIF9pbml0LmNhbGwgcmVwbywgKGVyciwgZmlsZXMpIC0+XG4gICAgICByZXBvLmluaXRXYXRjaGVyIGNiLCBmaWxlc1xuICAgICAgY2IoZXJyLCBmaWxlcykgaWYgY2JcblxuICBfZGVzdHJveSA9IHJlcG8uZGVzdHJveVxuICByZXBvLmRlc3Ryb3kgPSAoKSAtPlxuICAgIHJlcG8ud2F0Y2hlci5jbG9zZSgpIGlmIHJlcG8ud2F0Y2hlclxuICAgIF9kZXN0cm95LmFwcGx5IHJlcG9cblxuICBfcmVmcmVzaCA9IHJlcG8ucmVmcmVzaFxuICByZXBvLnJlZnJlc2ggPSAoY2IpIC0+XG4gICAgcmVwby53YXRjaGVyLmNsb3NlKCkgaWYgcmVwby53YXRjaGVyXG4gICAgX3JlZnJlc2guY2FsbCByZXBvLCAoZXJyLCBmaWxlcykgLT5cbiAgICAgIHJlcG8uaW5pdFdhdGNoZXIgY2IsIGZpbGVzXG4gICAgICBjYihlcnIsIGZpbGVzKSBpZiBjYlxuXG4gIHJlcG8uaW5pdFdhdGNoZXIgPSAoY2IsIGZpbGVzKSAtPlxuICAgIHJlcG8ud2F0Y2hlciA9IG5ldyBXYXRjaGVyKHJlcG8pXG4gICAgY2IgPSAoKCkgLT4pIHVubGVzcyBjYlxuICAgIGNiIG51bGwsIGZpbGVzXG5cbiAgcmVwby5wYXVzZSA9IC0+XG4gICAgcmVwby53YXRjaGVyLnBhdXNlKCkgaWYgcmVwby53YXRjaGVyICYmIHJlcG8ud2F0Y2hlci5wYXVzZVxuXG4gIHJlcG8ucmVzdW1lID0gLT5cbiAgICByZXBvLndhdGNoZXIucmVzdW1lKCkgaWYgcmVwby53YXRjaGVyICYmIHJlcG8ud2F0Y2hlci5yZXN1bWVcblxuICByZXBvXG4iXX0=
