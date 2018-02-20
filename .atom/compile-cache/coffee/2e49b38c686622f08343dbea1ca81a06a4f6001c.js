(function() {
  var fs, getClangFlagsCompDB, getClangFlagsDotClangComplete, getFileContents, path;

  path = require('path');

  fs = require('fs');

  module.exports = {
    getClangFlags: function(fileName) {
      var flags;
      flags = getClangFlagsCompDB(fileName);
      if (flags.length === 0) {
        flags = getClangFlagsDotClangComplete(fileName);
      }
      return flags;
    },
    activate: function(state) {}
  };

  getFileContents = function(startFile, fileName) {
    var contents, error, parentDir, searchDir, searchFilePath, searchFileStats;
    searchDir = path.dirname(startFile);
    while (searchDir) {
      searchFilePath = path.join(searchDir, fileName);
      try {
        searchFileStats = fs.statSync(searchFilePath);
        if (searchFileStats.isFile()) {
          try {
            contents = fs.readFileSync(searchFilePath, 'utf8');
            return [searchDir, contents];
          } catch (error1) {
            error = error1;
            console.log("clang-flags for " + fileName + " couldn't read file " + searchFilePath);
            console.log(error);
          }
          return [null, null];
        }
      } catch (error1) {}
      parentDir = path.dirname(searchDir);
      if (parentDir === searchDir) {
        break;
      }
      searchDir = parentDir;
    }
    return [null, null];
  };

  getClangFlagsCompDB = function(fileName) {
    var allArgs, args, compDB, compDBContents, config, doubleArgs, i, it, j, k, l, len, len1, nextArg, ref, ref1, relativeName, searchDir, singleArgs;
    ref = getFileContents(fileName, "compile_commands.json"), searchDir = ref[0], compDBContents = ref[1];
    args = [];
    if (compDBContents !== null && compDBContents.length > 0) {
      compDB = JSON.parse(compDBContents);
      for (j = 0, len = compDB.length; j < len; j++) {
        config = compDB[j];
        relativeName = fileName.slice(searchDir.length + 1, +fileName.length + 1 || 9e9);
        if (fileName === config['file'] || relativeName === config['file']) {
          allArgs = config.command.replace(/\s+/g, " ").split(' ');
          singleArgs = [];
          doubleArgs = [];
          for (i = k = 0, ref1 = allArgs.length - 1; 0 <= ref1 ? k <= ref1 : k >= ref1; i = 0 <= ref1 ? ++k : --k) {
            nextArg = allArgs[i + 1];
            if (allArgs[i][0] === '-' && (!nextArg || nextArg[0] === '-')) {
              singleArgs.push(allArgs[i]);
            }
            if (allArgs[i][0] === '-' && nextArg && (nextArg[0] !== '-')) {
              doubleArgs.push(allArgs[i] + " " + nextArg);
            }
          }
          args = singleArgs;
          for (l = 0, len1 = doubleArgs.length; l < len1; l++) {
            it = doubleArgs[l];
            if (it.slice(0, 8) === '-isystem') {
              args.push(it);
            }
          }
          args = args.concat(["-working-directory=" + searchDir]);
          break;
        }
      }
    }
    return args;
  };

  getClangFlagsDotClangComplete = function(fileName) {
    var args, clangCompleteContents, ref, searchDir;
    ref = getFileContents(fileName, ".clang_complete"), searchDir = ref[0], clangCompleteContents = ref[1];
    args = [];
    if (clangCompleteContents !== null && clangCompleteContents.length > 0) {
      args = clangCompleteContents.trim().split("\n");
      args = args.concat(["-working-directory=" + searchDir]);
    }
    return args;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1jbGFuZy9ub2RlX21vZHVsZXMvY2xhbmctZmxhZ3MvbGliL2NsYW5nLWZsYWdzLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQTtBQUFBLE1BQUE7O0VBQUEsSUFBQSxHQUFPLE9BQUEsQ0FBUSxNQUFSOztFQUNQLEVBQUEsR0FBSyxPQUFBLENBQVEsSUFBUjs7RUFFTCxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsYUFBQSxFQUFlLFNBQUMsUUFBRDtBQUNiLFVBQUE7TUFBQSxLQUFBLEdBQVEsbUJBQUEsQ0FBb0IsUUFBcEI7TUFDUixJQUFHLEtBQUssQ0FBQyxNQUFOLEtBQWdCLENBQW5CO1FBQ0UsS0FBQSxHQUFRLDZCQUFBLENBQThCLFFBQTlCLEVBRFY7O0FBRUEsYUFBTztJQUpNLENBQWY7SUFLQSxRQUFBLEVBQVUsU0FBQyxLQUFELEdBQUEsQ0FMVjs7O0VBT0YsZUFBQSxHQUFrQixTQUFDLFNBQUQsRUFBWSxRQUFaO0FBQ2hCLFFBQUE7SUFBQSxTQUFBLEdBQVksSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiO0FBQ1osV0FBTSxTQUFOO01BQ0UsY0FBQSxHQUFpQixJQUFJLENBQUMsSUFBTCxDQUFVLFNBQVYsRUFBcUIsUUFBckI7QUFDakI7UUFDRSxlQUFBLEdBQWtCLEVBQUUsQ0FBQyxRQUFILENBQVksY0FBWjtRQUNsQixJQUFHLGVBQWUsQ0FBQyxNQUFoQixDQUFBLENBQUg7QUFDRTtZQUNFLFFBQUEsR0FBVyxFQUFFLENBQUMsWUFBSCxDQUFnQixjQUFoQixFQUFnQyxNQUFoQztBQUNYLG1CQUFPLENBQUMsU0FBRCxFQUFZLFFBQVosRUFGVDtXQUFBLGNBQUE7WUFHTTtZQUNKLE9BQU8sQ0FBQyxHQUFSLENBQVksa0JBQUEsR0FBcUIsUUFBckIsR0FBZ0Msc0JBQWhDLEdBQXlELGNBQXJFO1lBQ0EsT0FBTyxDQUFDLEdBQVIsQ0FBWSxLQUFaLEVBTEY7O0FBTUEsaUJBQU8sQ0FBQyxJQUFELEVBQU8sSUFBUCxFQVBUO1NBRkY7T0FBQTtNQVVBLFNBQUEsR0FBWSxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWI7TUFDWixJQUFTLFNBQUEsS0FBYSxTQUF0QjtBQUFBLGNBQUE7O01BQ0EsU0FBQSxHQUFZO0lBZGQ7QUFlQSxXQUFPLENBQUMsSUFBRCxFQUFPLElBQVA7RUFqQlM7O0VBbUJsQixtQkFBQSxHQUFzQixTQUFDLFFBQUQ7QUFDcEIsUUFBQTtJQUFBLE1BQThCLGVBQUEsQ0FBZ0IsUUFBaEIsRUFBMEIsdUJBQTFCLENBQTlCLEVBQUMsa0JBQUQsRUFBWTtJQUNaLElBQUEsR0FBTztJQUNQLElBQUcsY0FBQSxLQUFrQixJQUFsQixJQUEwQixjQUFjLENBQUMsTUFBZixHQUF3QixDQUFyRDtNQUNFLE1BQUEsR0FBUyxJQUFJLENBQUMsS0FBTCxDQUFXLGNBQVg7QUFDVCxXQUFBLHdDQUFBOztRQUVFLFlBQUEsR0FBZSxRQUFTO1FBQ3hCLElBQUcsUUFBQSxLQUFZLE1BQU8sQ0FBQSxNQUFBLENBQW5CLElBQThCLFlBQUEsS0FBZ0IsTUFBTyxDQUFBLE1BQUEsQ0FBeEQ7VUFDRSxPQUFBLEdBQVUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFmLENBQXVCLE1BQXZCLEVBQStCLEdBQS9CLENBQW1DLENBQUMsS0FBcEMsQ0FBMEMsR0FBMUM7VUFDVixVQUFBLEdBQWE7VUFDYixVQUFBLEdBQWE7QUFDYixlQUFTLGtHQUFUO1lBQ0UsT0FBQSxHQUFVLE9BQVEsQ0FBQSxDQUFBLEdBQUUsQ0FBRjtZQUVsQixJQUE4QixPQUFRLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFYLEtBQWlCLEdBQWpCLElBQXlCLENBQUMsQ0FBSSxPQUFKLElBQWUsT0FBUSxDQUFBLENBQUEsQ0FBUixLQUFjLEdBQTlCLENBQXZEO2NBQUEsVUFBVSxDQUFDLElBQVgsQ0FBZ0IsT0FBUSxDQUFBLENBQUEsQ0FBeEIsRUFBQTs7WUFDQSxJQUE4QyxPQUFRLENBQUEsQ0FBQSxDQUFHLENBQUEsQ0FBQSxDQUFYLEtBQWlCLEdBQWpCLElBQXlCLE9BQXpCLElBQXFDLENBQUMsT0FBUSxDQUFBLENBQUEsQ0FBUixLQUFjLEdBQWYsQ0FBbkY7Y0FBQSxVQUFVLENBQUMsSUFBWCxDQUFnQixPQUFRLENBQUEsQ0FBQSxDQUFSLEdBQWEsR0FBYixHQUFtQixPQUFuQyxFQUFBOztBQUpGO1VBS0EsSUFBQSxHQUFPO0FBQ1AsZUFBQSw4Q0FBQTs7Z0JBQXVDLEVBQUcsWUFBSCxLQUFZO2NBQW5ELElBQUksQ0FBQyxJQUFMLENBQVUsRUFBVjs7QUFBQTtVQUNBLElBQUEsR0FBTyxJQUFJLENBQUMsTUFBTCxDQUFZLENBQUMscUJBQUEsR0FBc0IsU0FBdkIsQ0FBWjtBQUNQLGdCQVpGOztBQUhGLE9BRkY7O0FBa0JBLFdBQU87RUFyQmE7O0VBdUJ0Qiw2QkFBQSxHQUFnQyxTQUFDLFFBQUQ7QUFDOUIsUUFBQTtJQUFBLE1BQXFDLGVBQUEsQ0FBZ0IsUUFBaEIsRUFBMEIsaUJBQTFCLENBQXJDLEVBQUMsa0JBQUQsRUFBWTtJQUNaLElBQUEsR0FBTztJQUNQLElBQUcscUJBQUEsS0FBeUIsSUFBekIsSUFBaUMscUJBQXFCLENBQUMsTUFBdEIsR0FBK0IsQ0FBbkU7TUFDRSxJQUFBLEdBQU8scUJBQXFCLENBQUMsSUFBdEIsQ0FBQSxDQUE0QixDQUFDLEtBQTdCLENBQW1DLElBQW5DO01BQ1AsSUFBQSxHQUFPLElBQUksQ0FBQyxNQUFMLENBQVksQ0FBQyxxQkFBQSxHQUFzQixTQUF2QixDQUFaLEVBRlQ7O0FBR0EsV0FBTztFQU51QjtBQXJEaEMiLCJzb3VyY2VzQ29udGVudCI6WyIjIENsYW5nRmxhZ3NWaWV3ID0gcmVxdWlyZSAnLi9jbGFuZy1mbGFncy12aWV3J1xucGF0aCA9IHJlcXVpcmUgJ3BhdGgnXG5mcyA9IHJlcXVpcmUgJ2ZzJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG4gIGdldENsYW5nRmxhZ3M6IChmaWxlTmFtZSkgLT5cbiAgICBmbGFncyA9IGdldENsYW5nRmxhZ3NDb21wREIoZmlsZU5hbWUpXG4gICAgaWYgZmxhZ3MubGVuZ3RoID09IDBcbiAgICAgIGZsYWdzID0gZ2V0Q2xhbmdGbGFnc0RvdENsYW5nQ29tcGxldGUoZmlsZU5hbWUpXG4gICAgcmV0dXJuIGZsYWdzXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG5cbmdldEZpbGVDb250ZW50cyA9IChzdGFydEZpbGUsIGZpbGVOYW1lKSAtPlxuICBzZWFyY2hEaXIgPSBwYXRoLmRpcm5hbWUgc3RhcnRGaWxlXG4gIHdoaWxlIHNlYXJjaERpclxuICAgIHNlYXJjaEZpbGVQYXRoID0gcGF0aC5qb2luIHNlYXJjaERpciwgZmlsZU5hbWVcbiAgICB0cnlcbiAgICAgIHNlYXJjaEZpbGVTdGF0cyA9IGZzLnN0YXRTeW5jIHNlYXJjaEZpbGVQYXRoXG4gICAgICBpZiBzZWFyY2hGaWxlU3RhdHMuaXNGaWxlKClcbiAgICAgICAgdHJ5XG4gICAgICAgICAgY29udGVudHMgPSBmcy5yZWFkRmlsZVN5bmMgc2VhcmNoRmlsZVBhdGgsICd1dGY4J1xuICAgICAgICAgIHJldHVybiBbc2VhcmNoRGlyLCBjb250ZW50c11cbiAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICBjb25zb2xlLmxvZyBcImNsYW5nLWZsYWdzIGZvciBcIiArIGZpbGVOYW1lICsgXCIgY291bGRuJ3QgcmVhZCBmaWxlIFwiICsgc2VhcmNoRmlsZVBhdGhcbiAgICAgICAgICBjb25zb2xlLmxvZyBlcnJvclxuICAgICAgICByZXR1cm4gW251bGwsIG51bGxdXG4gICAgcGFyZW50RGlyID0gcGF0aC5kaXJuYW1lIHNlYXJjaERpclxuICAgIGJyZWFrIGlmIHBhcmVudERpciA9PSBzZWFyY2hEaXJcbiAgICBzZWFyY2hEaXIgPSBwYXJlbnREaXJcbiAgcmV0dXJuIFtudWxsLCBudWxsXVxuXG5nZXRDbGFuZ0ZsYWdzQ29tcERCID0gKGZpbGVOYW1lKSAtPlxuICBbc2VhcmNoRGlyLCBjb21wREJDb250ZW50c10gPSBnZXRGaWxlQ29udGVudHMoZmlsZU5hbWUsIFwiY29tcGlsZV9jb21tYW5kcy5qc29uXCIpXG4gIGFyZ3MgPSBbXVxuICBpZiBjb21wREJDb250ZW50cyAhPSBudWxsICYmIGNvbXBEQkNvbnRlbnRzLmxlbmd0aCA+IDBcbiAgICBjb21wREIgPSBKU09OLnBhcnNlKGNvbXBEQkNvbnRlbnRzKVxuICAgIGZvciBjb25maWcgaW4gY29tcERCXG4gICAgICAjIFdlIG1pZ2h0IGhhdmUgZnVsbCBwYXRocywgb3Igd2UgbWlnaHQgaGF2ZSByZWxhdGl2ZSBwYXRocy4gVHJ5IHRvIGd1ZXNzIHRoZSByZWxhdGl2ZSBwYXRoIGJ5IHJlbW92aW5nIHRoZSBzZWFyY2ggcGF0aCBmcm9tIHRoZSBmaWxlIHBhdGhcbiAgICAgIHJlbGF0aXZlTmFtZSA9IGZpbGVOYW1lW3NlYXJjaERpci5sZW5ndGgrMS4uZmlsZU5hbWUubGVuZ3RoXVxuICAgICAgaWYgZmlsZU5hbWUgPT0gY29uZmlnWydmaWxlJ10gfHwgcmVsYXRpdmVOYW1lID09IGNvbmZpZ1snZmlsZSddXG4gICAgICAgIGFsbEFyZ3MgPSBjb25maWcuY29tbWFuZC5yZXBsYWNlKC9cXHMrL2csIFwiIFwiKS5zcGxpdCgnICcpXG4gICAgICAgIHNpbmdsZUFyZ3MgPSBbXVxuICAgICAgICBkb3VibGVBcmdzID0gW11cbiAgICAgICAgZm9yIGkgaW4gWzAuLmFsbEFyZ3MubGVuZ3RoIC0gMV1cbiAgICAgICAgICBuZXh0QXJnID0gYWxsQXJnc1tpKzFdXG4gICAgICAgICAgIyB3b3JrIG91dCB3aGljaCBhcmUgc3RhbmRhbG9uZSBhcmd1bWVudHMsIGFuZCB3aGljaCB0YWtlIGEgcGFyYW1ldGVyXG4gICAgICAgICAgc2luZ2xlQXJncy5wdXNoIGFsbEFyZ3NbaV0gaWYgYWxsQXJnc1tpXVswXSA9PSAnLScgYW5kIChub3QgbmV4dEFyZyB8fCBuZXh0QXJnWzBdID09ICctJylcbiAgICAgICAgICBkb3VibGVBcmdzLnB1c2ggYWxsQXJnc1tpXSArIFwiIFwiICsgbmV4dEFyZyBpZiBhbGxBcmdzW2ldWzBdID09ICctJyBhbmQgbmV4dEFyZyBhbmQgKG5leHRBcmdbMF0gIT0gJy0nKVxuICAgICAgICBhcmdzID0gc2luZ2xlQXJnc1xuICAgICAgICBhcmdzLnB1c2ggaXQgZm9yIGl0IGluIGRvdWJsZUFyZ3Mgd2hlbiBpdFswLi43XSA9PSAnLWlzeXN0ZW0nXG4gICAgICAgIGFyZ3MgPSBhcmdzLmNvbmNhdCBbXCItd29ya2luZy1kaXJlY3Rvcnk9I3tzZWFyY2hEaXJ9XCJdXG4gICAgICAgIGJyZWFrXG4gIHJldHVybiBhcmdzXG5cbmdldENsYW5nRmxhZ3NEb3RDbGFuZ0NvbXBsZXRlID0gKGZpbGVOYW1lKSAtPlxuICBbc2VhcmNoRGlyLCBjbGFuZ0NvbXBsZXRlQ29udGVudHNdID0gZ2V0RmlsZUNvbnRlbnRzKGZpbGVOYW1lLCBcIi5jbGFuZ19jb21wbGV0ZVwiKVxuICBhcmdzID0gW11cbiAgaWYgY2xhbmdDb21wbGV0ZUNvbnRlbnRzICE9IG51bGwgJiYgY2xhbmdDb21wbGV0ZUNvbnRlbnRzLmxlbmd0aCA+IDBcbiAgICBhcmdzID0gY2xhbmdDb21wbGV0ZUNvbnRlbnRzLnRyaW0oKS5zcGxpdChcIlxcblwiKVxuICAgIGFyZ3MgPSBhcmdzLmNvbmNhdCBbXCItd29ya2luZy1kaXJlY3Rvcnk9I3tzZWFyY2hEaXJ9XCJdXG4gIHJldHVybiBhcmdzXG4iXX0=
