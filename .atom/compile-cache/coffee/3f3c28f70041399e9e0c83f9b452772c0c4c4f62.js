(function() {
  var FindLabels, fs, fsPlus, path;

  fsPlus = require('fs-plus');

  fs = require('fs-plus');

  path = require('path');

  module.exports = FindLabels = {
    getLabelsByText: function(text, file) {
      var inputRex, labelRex, match, matches;
      if (file == null) {
        file = "";
      }
      labelRex = /\\(?:th)?label{([^}]+)}/g;
      matches = [];
      while ((match = labelRex.exec(text))) {
        matches.push({
          label: match[1]
        });
      }
      if (file == null) {
        return matches;
      }
      inputRex = /\\(input|include){([^}]+)}/g;
      while ((match = inputRex.exec(text))) {
        matches = matches.concat(this.getLabels(this.getAbsolutePath(file, match[2])));
      }
      return matches;
    },
    getLabels: function(file) {
      var text;
      if (!fsPlus.isFileSync(file)) {
        file = fsPlus.resolveExtension(file, ['tex']);
      }
      if (!fsPlus.isFileSync(file)) {
        return [];
      }
      text = fs.readFileSync(file).toString();
      return this.getLabelsByText(text, file);
    },
    getAbsolutePath: function(file, relativePath) {
      var ind;
      if ((ind = file.lastIndexOf(path.sep)) !== file.length) {
        file = file.substring(0, ind);
      }
      return path.resolve(file, relativePath);
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2xhdGV4ZXIvbGliL2ZpbmQtbGFiZWxzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBQSxHQUFTLE9BQUEsQ0FBUSxTQUFSOztFQUNULEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FDQSxVQUFBLEdBQ0U7SUFBQSxlQUFBLEVBQWlCLFNBQUMsSUFBRCxFQUFPLElBQVA7QUFDZixVQUFBOztRQURzQixPQUFPOztNQUM3QixRQUFBLEdBQVc7TUFDWCxPQUFBLEdBQVU7QUFDVixhQUFNLENBQUMsS0FBQSxHQUFRLFFBQVEsQ0FBQyxJQUFULENBQWMsSUFBZCxDQUFULENBQU47UUFDRSxPQUFPLENBQUMsSUFBUixDQUFhO1VBQUMsS0FBQSxFQUFPLEtBQU0sQ0FBQSxDQUFBLENBQWQ7U0FBYjtNQURGO01BRUEsSUFBc0IsWUFBdEI7QUFBQSxlQUFPLFFBQVA7O01BQ0EsUUFBQSxHQUFXO0FBQ1gsYUFBTSxDQUFDLEtBQUEsR0FBUSxRQUFRLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FBVCxDQUFOO1FBQ0UsT0FBQSxHQUFVLE9BQU8sQ0FBQyxNQUFSLENBQWUsSUFBQyxDQUFBLFNBQUQsQ0FBVyxJQUFDLENBQUEsZUFBRCxDQUFpQixJQUFqQixFQUF1QixLQUFNLENBQUEsQ0FBQSxDQUE3QixDQUFYLENBQWY7TUFEWjthQUVBO0lBVGUsQ0FBakI7SUFXQSxTQUFBLEVBQVcsU0FBQyxJQUFEO0FBQ1QsVUFBQTtNQUFBLElBQUcsQ0FBSSxNQUFNLENBQUMsVUFBUCxDQUFrQixJQUFsQixDQUFQO1FBQ0UsSUFBQSxHQUFPLE1BQU0sQ0FBQyxnQkFBUCxDQUF3QixJQUF4QixFQUE4QixDQUFDLEtBQUQsQ0FBOUIsRUFEVDs7TUFFQSxJQUFBLENBQWlCLE1BQU0sQ0FBQyxVQUFQLENBQWtCLElBQWxCLENBQWpCO0FBQUEsZUFBTyxHQUFQOztNQUNBLElBQUEsR0FBTyxFQUFFLENBQUMsWUFBSCxDQUFnQixJQUFoQixDQUFxQixDQUFDLFFBQXRCLENBQUE7YUFDUCxJQUFDLENBQUEsZUFBRCxDQUFpQixJQUFqQixFQUF1QixJQUF2QjtJQUxTLENBWFg7SUFrQkEsZUFBQSxFQUFpQixTQUFDLElBQUQsRUFBTyxZQUFQO0FBQ2YsVUFBQTtNQUFBLElBQUcsQ0FBQyxHQUFBLEdBQU0sSUFBSSxDQUFDLFdBQUwsQ0FBaUIsSUFBSSxDQUFDLEdBQXRCLENBQVAsQ0FBQSxLQUF3QyxJQUFJLENBQUMsTUFBaEQ7UUFDRSxJQUFBLEdBQU8sSUFBSSxDQUFDLFNBQUwsQ0FBZSxDQUFmLEVBQWlCLEdBQWpCLEVBRFQ7O2FBRUEsSUFBSSxDQUFDLE9BQUwsQ0FBYSxJQUFiLEVBQW1CLFlBQW5CO0lBSGUsQ0FsQmpCOztBQU5GIiwic291cmNlc0NvbnRlbnQiOlsiZnNQbHVzID0gcmVxdWlyZSAnZnMtcGx1cydcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcbnBhdGggPSByZXF1aXJlICdwYXRoJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5GaW5kTGFiZWxzID1cbiAgZ2V0TGFiZWxzQnlUZXh0OiAodGV4dCwgZmlsZSA9IFwiXCIpIC0+XG4gICAgbGFiZWxSZXggPSAvXFxcXCg/OnRoKT9sYWJlbHsoW159XSspfS9nXG4gICAgbWF0Y2hlcyA9IFtdXG4gICAgd2hpbGUgKG1hdGNoID0gbGFiZWxSZXguZXhlYyh0ZXh0KSlcbiAgICAgIG1hdGNoZXMucHVzaCB7bGFiZWw6IG1hdGNoWzFdfVxuICAgIHJldHVybiBtYXRjaGVzIHVubGVzcyBmaWxlP1xuICAgIGlucHV0UmV4ID0gL1xcXFwoaW5wdXR8aW5jbHVkZSl7KFtefV0rKX0vZ1xuICAgIHdoaWxlIChtYXRjaCA9IGlucHV0UmV4LmV4ZWModGV4dCkpXG4gICAgICBtYXRjaGVzID0gbWF0Y2hlcy5jb25jYXQoQGdldExhYmVscyhAZ2V0QWJzb2x1dGVQYXRoKGZpbGUsIG1hdGNoWzJdKSkpXG4gICAgbWF0Y2hlc1xuXG4gIGdldExhYmVsczogKGZpbGUpIC0+XG4gICAgaWYgbm90IGZzUGx1cy5pc0ZpbGVTeW5jKGZpbGUpICNpZiBmaWxlIGlzIG5vdCB0aGVyZSB0cnkgYWRkIHBvc3NpYmxlIGV4dGVuc2lvbnNcbiAgICAgIGZpbGUgPSBmc1BsdXMucmVzb2x2ZUV4dGVuc2lvbihmaWxlLCBbJ3RleCddKVxuICAgIHJldHVybiBbXSB1bmxlc3MgZnNQbHVzLmlzRmlsZVN5bmMoZmlsZSlcbiAgICB0ZXh0ID0gZnMucmVhZEZpbGVTeW5jKGZpbGUpLnRvU3RyaW5nKClcbiAgICBAZ2V0TGFiZWxzQnlUZXh0KHRleHQsIGZpbGUpXG5cbiAgZ2V0QWJzb2x1dGVQYXRoOiAoZmlsZSwgcmVsYXRpdmVQYXRoKSAtPlxuICAgIGlmIChpbmQgPSBmaWxlLmxhc3RJbmRleE9mKHBhdGguc2VwKSkgaXNudCBmaWxlLmxlbmd0aFxuICAgICAgZmlsZSA9IGZpbGUuc3Vic3RyaW5nKDAsaW5kKVxuICAgIHBhdGgucmVzb2x2ZShmaWxlLCByZWxhdGl2ZVBhdGgpXG4iXX0=
