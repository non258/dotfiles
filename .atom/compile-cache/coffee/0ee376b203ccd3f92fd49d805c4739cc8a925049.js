(function() {
  var CompositeDisposable, ProcessingAutocomplete, Provider;

  Provider = require('./processing-autocomplete-provider');

  CompositeDisposable = require('atom').CompositeDisposable;

  module.exports = ProcessingAutocomplete = {
    activate: function(state) {
      return Provider.loadFunctions();
    },
    provider: function() {
      return Provider;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL3Byb2Nlc3NpbmctYXV0b2NvbXBsZXRlL2xpYi9wcm9jZXNzaW5nLWF1dG9jb21wbGV0ZS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLFFBQUEsR0FBVyxPQUFBLENBQVEsb0NBQVI7O0VBQ1Ysc0JBQXVCLE9BQUEsQ0FBUSxNQUFSOztFQUV4QixNQUFNLENBQUMsT0FBUCxHQUFpQixzQkFBQSxHQUNmO0lBQUEsUUFBQSxFQUFVLFNBQUMsS0FBRDthQUNSLFFBQVEsQ0FBQyxhQUFULENBQUE7SUFEUSxDQUFWO0lBRUEsUUFBQSxFQUFVLFNBQUE7YUFBRztJQUFILENBRlY7O0FBSkYiLCJzb3VyY2VzQ29udGVudCI6WyJQcm92aWRlciA9IHJlcXVpcmUgJy4vcHJvY2Vzc2luZy1hdXRvY29tcGxldGUtcHJvdmlkZXInXG57Q29tcG9zaXRlRGlzcG9zYWJsZX0gPSByZXF1aXJlICdhdG9tJ1xuXG5tb2R1bGUuZXhwb3J0cyA9IFByb2Nlc3NpbmdBdXRvY29tcGxldGUgPVxuICBhY3RpdmF0ZTogKHN0YXRlKSAtPlxuICAgIFByb3ZpZGVyLmxvYWRGdW5jdGlvbnMoKVxuICBwcm92aWRlcjogLT4gUHJvdmlkZXJcbiJdfQ==
