(function() {
  var SelectStageFiles, git;

  git = require('../git');

  SelectStageFiles = require('../views/select-stage-files-view-beta');

  module.exports = function(repo) {
    var stagedFiles, unstagedFiles;
    unstagedFiles = git.unstagedFiles(repo, {
      showUntracked: true
    });
    stagedFiles = git.stagedFiles(repo);
    return Promise.all([unstagedFiles, stagedFiles]).then(function(data) {
      return new SelectStageFiles(repo, data[0].concat(data[1]));
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvZ2l0LXN0YWdlLWZpbGVzLWJldGEuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sZ0JBQUEsR0FBbUIsT0FBQSxDQUFRLHVDQUFSOztFQUVuQixNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFDLElBQUQ7QUFDZixRQUFBO0lBQUEsYUFBQSxHQUFnQixHQUFHLENBQUMsYUFBSixDQUFrQixJQUFsQixFQUF3QjtNQUFBLGFBQUEsRUFBZSxJQUFmO0tBQXhCO0lBQ2hCLFdBQUEsR0FBYyxHQUFHLENBQUMsV0FBSixDQUFnQixJQUFoQjtXQUNkLE9BQU8sQ0FBQyxHQUFSLENBQVksQ0FBQyxhQUFELEVBQWdCLFdBQWhCLENBQVosQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7YUFBVSxJQUFJLGdCQUFKLENBQXFCLElBQXJCLEVBQTJCLElBQUssQ0FBQSxDQUFBLENBQUUsQ0FBQyxNQUFSLENBQWUsSUFBSyxDQUFBLENBQUEsQ0FBcEIsQ0FBM0I7SUFBVixDQUROO0VBSGU7QUFIakIiLCJzb3VyY2VzQ29udGVudCI6WyJnaXQgPSByZXF1aXJlICcuLi9naXQnXG5TZWxlY3RTdGFnZUZpbGVzID0gcmVxdWlyZSAnLi4vdmlld3Mvc2VsZWN0LXN0YWdlLWZpbGVzLXZpZXctYmV0YSdcblxubW9kdWxlLmV4cG9ydHMgPSAocmVwbykgLT5cbiAgdW5zdGFnZWRGaWxlcyA9IGdpdC51bnN0YWdlZEZpbGVzKHJlcG8sIHNob3dVbnRyYWNrZWQ6IHRydWUpXG4gIHN0YWdlZEZpbGVzID0gZ2l0LnN0YWdlZEZpbGVzKHJlcG8pXG4gIFByb21pc2UuYWxsKFt1bnN0YWdlZEZpbGVzLCBzdGFnZWRGaWxlc10pXG4gIC50aGVuIChkYXRhKSAtPiBuZXcgU2VsZWN0U3RhZ2VGaWxlcyhyZXBvLCBkYXRhWzBdLmNvbmNhdChkYXRhWzFdKSlcbiJdfQ==
