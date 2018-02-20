(function() {
  var pkg;

  pkg = require('../../package.json');

  module.exports = {
    getPackageName: function() {
      return pkg.name;
    },
    getPackagePath: function() {
      return atom.packages.getLoadedPackage(pkg.name).path;
    },
    getSettings: function() {
      if (!(atom && atom.config)) {
        return {};
      }
      return atom.config.get(("" + pkg.name) || {});
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2ltZG9uZS1hdG9tL2xpYi9zZXJ2aWNlcy9pbWRvbmUtY29uZmlnLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUE7O0VBQUEsR0FBQSxHQUFNLE9BQUEsQ0FBUSxvQkFBUjs7RUFFTixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsY0FBQSxFQUFnQixTQUFBO2FBQU0sR0FBRyxDQUFDO0lBQVYsQ0FBaEI7SUFFQSxjQUFBLEVBQWdCLFNBQUE7YUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFkLENBQStCLEdBQUcsQ0FBQyxJQUFuQyxDQUF3QyxDQUFDO0lBQS9DLENBRmhCO0lBSUEsV0FBQSxFQUFhLFNBQUE7TUFDWCxJQUFBLENBQUEsQ0FBaUIsSUFBQSxJQUFRLElBQUksQ0FBQyxNQUE5QixDQUFBO0FBQUEsZUFBTyxHQUFQOzthQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsR0FBWixDQUFnQixDQUFBLEVBQUEsR0FBRyxHQUFHLENBQUMsSUFBUCxDQUFBLElBQWlCLEVBQWpDO0lBRlcsQ0FKYjs7QUFIRiIsInNvdXJjZXNDb250ZW50IjpbIlxucGtnID0gcmVxdWlyZSAnLi4vLi4vcGFja2FnZS5qc29uJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGdldFBhY2thZ2VOYW1lOiAoKSAtPiBwa2cubmFtZVxuXG4gIGdldFBhY2thZ2VQYXRoOiAoKSAtPiBhdG9tLnBhY2thZ2VzLmdldExvYWRlZFBhY2thZ2UocGtnLm5hbWUpLnBhdGhcblxuICBnZXRTZXR0aW5nczogKCkgLT5cbiAgICByZXR1cm4ge30gdW5sZXNzIGF0b20gJiYgYXRvbS5jb25maWdcbiAgICBhdG9tLmNvbmZpZy5nZXQgXCIje3BrZy5uYW1lfVwiIHx8IHt9XG4iXX0=
