(function() {
  var SelectStageHunkFile, git, gitStageHunk;

  git = require('../git');

  SelectStageHunkFile = require('../views/select-stage-hunk-file-view');

  gitStageHunk = function(repo) {
    return git.unstagedFiles(repo).then(function(data) {
      return new SelectStageHunkFile(repo, data);
    });
  };

  module.exports = gitStageHunk;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2dpdC1wbHVzL2xpYi9tb2RlbHMvZ2l0LXN0YWdlLWh1bmsuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxHQUFBLEdBQU0sT0FBQSxDQUFRLFFBQVI7O0VBQ04sbUJBQUEsR0FBc0IsT0FBQSxDQUFRLHNDQUFSOztFQUV0QixZQUFBLEdBQWUsU0FBQyxJQUFEO1dBQ2IsR0FBRyxDQUFDLGFBQUosQ0FBa0IsSUFBbEIsQ0FDQSxDQUFDLElBREQsQ0FDTSxTQUFDLElBQUQ7YUFBVSxJQUFJLG1CQUFKLENBQXdCLElBQXhCLEVBQThCLElBQTlCO0lBQVYsQ0FETjtFQURhOztFQUlmLE1BQU0sQ0FBQyxPQUFQLEdBQWlCO0FBUGpCIiwic291cmNlc0NvbnRlbnQiOlsiZ2l0ID0gcmVxdWlyZSAnLi4vZ2l0J1xuU2VsZWN0U3RhZ2VIdW5rRmlsZSA9IHJlcXVpcmUgJy4uL3ZpZXdzL3NlbGVjdC1zdGFnZS1odW5rLWZpbGUtdmlldydcblxuZ2l0U3RhZ2VIdW5rID0gKHJlcG8pIC0+XG4gIGdpdC51bnN0YWdlZEZpbGVzKHJlcG8pXG4gIC50aGVuIChkYXRhKSAtPiBuZXcgU2VsZWN0U3RhZ2VIdW5rRmlsZShyZXBvLCBkYXRhKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGdpdFN0YWdlSHVua1xuIl19
