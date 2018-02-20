(function() {
  var ImdoneRepo, atomFsStore, fsStore, getSettings, path, repos;

  ImdoneRepo = require('imdone-core/lib/repository');

  atomFsStore = require('./atom-watched-fs-store');

  fsStore = require('./worker-watched-fs-store');

  path = require('path');

  getSettings = require('./imdone-config').getSettings;

  repos = {};

  module.exports = {
    getRepo: function(pathname, uri) {
      var imdoneRepo;
      if (repos && repos[pathname]) {
        return repos[pathname];
      }
      imdoneRepo = this.fsStore(new ImdoneRepo(pathname));
      this.excludeVcsIgnoresMixin(imdoneRepo);
      repos[pathname] = require('./imdoneio-store')(imdoneRepo);
      return repos[pathname];
    },
    destroyRepos: function() {
      var repo, results;
      results = [];
      for (path in repos) {
        repo = repos[path];
        results.push(repo.destroy());
      }
      return results;
    },
    fsStore: function(repo) {
      if (getSettings().useAlternateFileWatcher) {
        fsStore = atomFsStore;
      }
      return fsStore(repo);
    },
    excludeVcsIgnoresMixin: function(imdoneRepo) {
      var _shouldExclude, repoPath;
      repoPath = imdoneRepo.getPath();
      if (!this.repoForPath(repoPath)) {
        return;
      }
      _shouldExclude = imdoneRepo.shouldExclude;
      return imdoneRepo.shouldExclude = (function(_this) {
        return function(relPath) {
          var excluded, vcsRepo;
          excluded = false;
          vcsRepo = _this.repoForPath(repoPath);
          if (getSettings().excludeVcsIgnoredPaths && vcsRepo) {
            excluded = vcsRepo.isPathIgnored(relPath);
          }
          return excluded || _shouldExclude.call(imdoneRepo, relPath);
        };
      })(this);
    },
    repoForPath: function(repoPath) {
      var i, j, len, projectPath, ref;
      ref = atom.project.getPaths();
      for (i = j = 0, len = ref.length; j < len; i = ++j) {
        projectPath = ref[i];
        if (repoPath === projectPath || repoPath.indexOf(projectPath + path.sep) === 0) {
          return atom.project.getRepositories()[i];
        }
      }
      return null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2ltZG9uZS1hdG9tL2xpYi9zZXJ2aWNlcy9pbWRvbmUtaGVscGVyLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsVUFBQSxHQUFhLE9BQUEsQ0FBUSw0QkFBUjs7RUFDYixXQUFBLEdBQWMsT0FBQSxDQUFRLHlCQUFSOztFQUVkLE9BQUEsR0FBVSxPQUFBLENBQVEsMkJBQVI7O0VBQ1YsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLFdBQUEsR0FBYyxPQUFBLENBQVEsaUJBQVIsQ0FBMEIsQ0FBQzs7RUFDekMsS0FBQSxHQUFROztFQUVSLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxPQUFBLEVBQVMsU0FBQyxRQUFELEVBQVcsR0FBWDtBQUVQLFVBQUE7TUFBQSxJQUEwQixLQUFBLElBQVUsS0FBTSxDQUFBLFFBQUEsQ0FBMUM7QUFBQSxlQUFPLEtBQU0sQ0FBQSxRQUFBLEVBQWI7O01BQ0EsVUFBQSxHQUFhLElBQUMsQ0FBQSxPQUFELENBQVMsSUFBSSxVQUFKLENBQWUsUUFBZixDQUFUO01BQ2IsSUFBQyxDQUFBLHNCQUFELENBQXdCLFVBQXhCO01BQ0EsS0FBTSxDQUFBLFFBQUEsQ0FBTixHQUFrQixPQUFBLENBQVEsa0JBQVIsQ0FBQSxDQUE0QixVQUE1QjthQUNsQixLQUFNLENBQUEsUUFBQTtJQU5DLENBQVQ7SUFRQSxZQUFBLEVBQWMsU0FBQTtBQUNaLFVBQUE7QUFBQTtXQUFBLGFBQUE7O3FCQUNFLElBQUksQ0FBQyxPQUFMLENBQUE7QUFERjs7SUFEWSxDQVJkO0lBWUEsT0FBQSxFQUFTLFNBQUMsSUFBRDtNQUNQLElBQXlCLFdBQUEsQ0FBQSxDQUFhLENBQUMsdUJBQXZDO1FBQUEsT0FBQSxHQUFVLFlBQVY7O2FBQ0EsT0FBQSxDQUFRLElBQVI7SUFGTyxDQVpUO0lBZ0JBLHNCQUFBLEVBQXdCLFNBQUMsVUFBRDtBQUN0QixVQUFBO01BQUEsUUFBQSxHQUFXLFVBQVUsQ0FBQyxPQUFYLENBQUE7TUFDWCxJQUFBLENBQWMsSUFBQyxDQUFBLFdBQUQsQ0FBYSxRQUFiLENBQWQ7QUFBQSxlQUFBOztNQUNBLGNBQUEsR0FBaUIsVUFBVSxDQUFDO2FBQzVCLFVBQVUsQ0FBQyxhQUFYLEdBQTJCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxPQUFEO0FBQ3pCLGNBQUE7VUFBQSxRQUFBLEdBQVc7VUFDWCxPQUFBLEdBQVUsS0FBQyxDQUFBLFdBQUQsQ0FBYSxRQUFiO1VBQ1YsSUFBRyxXQUFBLENBQUEsQ0FBYSxDQUFDLHNCQUFkLElBQXlDLE9BQTVDO1lBQ0UsUUFBQSxHQUFXLE9BQU8sQ0FBQyxhQUFSLENBQXNCLE9BQXRCLEVBRGI7O0FBRUEsaUJBQU8sUUFBQSxJQUFZLGNBQWMsQ0FBQyxJQUFmLENBQW9CLFVBQXBCLEVBQWdDLE9BQWhDO1FBTE07TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBO0lBSkwsQ0FoQnhCO0lBMkJBLFdBQUEsRUFBYSxTQUFDLFFBQUQ7QUFDWCxVQUFBO0FBQUE7QUFBQSxXQUFBLDZDQUFBOztRQUNFLElBQUcsUUFBQSxLQUFZLFdBQVosSUFBMkIsUUFBUSxDQUFDLE9BQVQsQ0FBaUIsV0FBQSxHQUFjLElBQUksQ0FBQyxHQUFwQyxDQUFBLEtBQTRDLENBQTFFO0FBQ0UsaUJBQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxlQUFiLENBQUEsQ0FBK0IsQ0FBQSxDQUFBLEVBRHhDOztBQURGO2FBR0E7SUFKVyxDQTNCYjs7QUFURiIsInNvdXJjZXNDb250ZW50IjpbIkltZG9uZVJlcG8gPSByZXF1aXJlICdpbWRvbmUtY29yZS9saWIvcmVwb3NpdG9yeSdcbmF0b21Gc1N0b3JlID0gcmVxdWlyZSAnLi9hdG9tLXdhdGNoZWQtZnMtc3RvcmUnXG4jIGZzU3RvcmUgPSByZXF1aXJlICdpbWRvbmUtY29yZS9saWIvbWl4aW5zL3JlcG8td2F0Y2hlZC1mcy1zdG9yZSdcbmZzU3RvcmUgPSByZXF1aXJlICcuL3dvcmtlci13YXRjaGVkLWZzLXN0b3JlJ1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5nZXRTZXR0aW5ncyA9IHJlcXVpcmUoJy4vaW1kb25lLWNvbmZpZycpLmdldFNldHRpbmdzXG5yZXBvcyA9IHt9XG5cbm1vZHVsZS5leHBvcnRzID1cbiAgZ2V0UmVwbzogKHBhdGhuYW1lLCB1cmkpIC0+XG4gICAgIyBUT0RPOiBUaGlzIHJldHVybnMgcmVwbyBhbmQgY29ubmVjdG9yTWFuYWdlciwgYnV0IHdlIGNvdWxkIHVzZSB0aGUgY29ubmVjdG9yTWFuYWdlciBjb250YWluZWQgaW4gdGhlIHJlcG8gdGhyb3VnaG91dCBnaDoyMzggaWQ6OTRcbiAgICByZXR1cm4gcmVwb3NbcGF0aG5hbWVdIGlmIHJlcG9zIGFuZCByZXBvc1twYXRobmFtZV1cbiAgICBpbWRvbmVSZXBvID0gQGZzU3RvcmUobmV3IEltZG9uZVJlcG8ocGF0aG5hbWUpKVxuICAgIEBleGNsdWRlVmNzSWdub3Jlc01peGluIGltZG9uZVJlcG9cbiAgICByZXBvc1twYXRobmFtZV0gPSByZXF1aXJlKCcuL2ltZG9uZWlvLXN0b3JlJykgaW1kb25lUmVwb1xuICAgIHJlcG9zW3BhdGhuYW1lXVxuXG4gIGRlc3Ryb3lSZXBvczogKCkgLT5cbiAgICBmb3IgcGF0aCwgcmVwbyBvZiByZXBvc1xuICAgICAgcmVwby5kZXN0cm95KClcblxuICBmc1N0b3JlOiAocmVwbykgLT5cbiAgICBmc1N0b3JlID0gYXRvbUZzU3RvcmUgaWYgZ2V0U2V0dGluZ3MoKS51c2VBbHRlcm5hdGVGaWxlV2F0Y2hlclxuICAgIGZzU3RvcmUocmVwbylcblxuICBleGNsdWRlVmNzSWdub3Jlc01peGluOiAoaW1kb25lUmVwbykgLT5cbiAgICByZXBvUGF0aCA9IGltZG9uZVJlcG8uZ2V0UGF0aCgpXG4gICAgcmV0dXJuIHVubGVzcyBAcmVwb0ZvclBhdGggcmVwb1BhdGhcbiAgICBfc2hvdWxkRXhjbHVkZSA9IGltZG9uZVJlcG8uc2hvdWxkRXhjbHVkZVxuICAgIGltZG9uZVJlcG8uc2hvdWxkRXhjbHVkZSA9IChyZWxQYXRoKSA9PlxuICAgICAgZXhjbHVkZWQgPSBmYWxzZVxuICAgICAgdmNzUmVwbyA9IEByZXBvRm9yUGF0aCByZXBvUGF0aFxuICAgICAgaWYgZ2V0U2V0dGluZ3MoKS5leGNsdWRlVmNzSWdub3JlZFBhdGhzIGFuZCB2Y3NSZXBvXG4gICAgICAgIGV4Y2x1ZGVkID0gdmNzUmVwby5pc1BhdGhJZ25vcmVkIHJlbFBhdGhcbiAgICAgIHJldHVybiBleGNsdWRlZCB8fCBfc2hvdWxkRXhjbHVkZS5jYWxsIGltZG9uZVJlcG8sIHJlbFBhdGhcblxuICByZXBvRm9yUGF0aDogKHJlcG9QYXRoKSAtPlxuICAgIGZvciBwcm9qZWN0UGF0aCwgaSBpbiBhdG9tLnByb2plY3QuZ2V0UGF0aHMoKVxuICAgICAgaWYgcmVwb1BhdGggaXMgcHJvamVjdFBhdGggb3IgcmVwb1BhdGguaW5kZXhPZihwcm9qZWN0UGF0aCArIHBhdGguc2VwKSBpcyAwXG4gICAgICAgIHJldHVybiBhdG9tLnByb2plY3QuZ2V0UmVwb3NpdG9yaWVzKClbaV1cbiAgICBudWxsXG4iXX0=
