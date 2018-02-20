(function() {
  var ExNormalModeInputElement, Input, ViewModel;

  ExNormalModeInputElement = require('./ex-normal-mode-input-element');

  ViewModel = (function() {
    function ViewModel(command, opts) {
      var ref;
      this.command = command;
      if (opts == null) {
        opts = {};
      }
      ref = this.command, this.editor = ref.editor, this.exState = ref.exState;
      this.view = new ExNormalModeInputElement().initialize(this, opts);
      this.editor.normalModeInputView = this.view;
      this.exState.onDidFailToExecute((function(_this) {
        return function() {
          return _this.view.remove();
        };
      })(this));
      this.done = false;
    }

    ViewModel.prototype.confirm = function(view) {
      this.exState.pushOperations(new Input(this.view.value));
      return this.done = true;
    };

    ViewModel.prototype.cancel = function(view) {
      if (!this.done) {
        this.exState.pushOperations(new Input(''));
        return this.done = true;
      }
    };

    return ViewModel;

  })();

  Input = (function() {
    function Input(characters) {
      this.characters = characters;
    }

    return Input;

  })();

  module.exports = {
    ViewModel: ViewModel,
    Input: Input
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2V4LW1vZGUvbGliL3ZpZXctbW9kZWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSx3QkFBQSxHQUEyQixPQUFBLENBQVEsZ0NBQVI7O0VBRXJCO0lBQ1MsbUJBQUMsT0FBRCxFQUFXLElBQVg7QUFDWCxVQUFBO01BRFksSUFBQyxDQUFBLFVBQUQ7O1FBQVUsT0FBSzs7TUFDM0IsTUFBc0IsSUFBQyxDQUFBLE9BQXZCLEVBQUMsSUFBQyxDQUFBLGFBQUEsTUFBRixFQUFVLElBQUMsQ0FBQSxjQUFBO01BRVgsSUFBQyxDQUFBLElBQUQsR0FBUSxJQUFJLHdCQUFKLENBQUEsQ0FBOEIsQ0FBQyxVQUEvQixDQUEwQyxJQUExQyxFQUE2QyxJQUE3QztNQUNSLElBQUMsQ0FBQSxNQUFNLENBQUMsbUJBQVIsR0FBOEIsSUFBQyxDQUFBO01BQy9CLElBQUMsQ0FBQSxPQUFPLENBQUMsa0JBQVQsQ0FBNEIsQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO2lCQUFHLEtBQUMsQ0FBQSxJQUFJLENBQUMsTUFBTixDQUFBO1FBQUg7TUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQTVCO01BQ0EsSUFBQyxDQUFBLElBQUQsR0FBUTtJQU5HOzt3QkFRYixPQUFBLEdBQVMsU0FBQyxJQUFEO01BQ1AsSUFBQyxDQUFBLE9BQU8sQ0FBQyxjQUFULENBQXdCLElBQUksS0FBSixDQUFVLElBQUMsQ0FBQSxJQUFJLENBQUMsS0FBaEIsQ0FBeEI7YUFDQSxJQUFDLENBQUEsSUFBRCxHQUFRO0lBRkQ7O3dCQUlULE1BQUEsR0FBUSxTQUFDLElBQUQ7TUFDTixJQUFBLENBQU8sSUFBQyxDQUFBLElBQVI7UUFDRSxJQUFDLENBQUEsT0FBTyxDQUFDLGNBQVQsQ0FBd0IsSUFBSSxLQUFKLENBQVUsRUFBVixDQUF4QjtlQUNBLElBQUMsQ0FBQSxJQUFELEdBQVEsS0FGVjs7SUFETTs7Ozs7O0VBS0o7SUFDUyxlQUFDLFVBQUQ7TUFBQyxJQUFDLENBQUEsYUFBRDtJQUFEOzs7Ozs7RUFFZixNQUFNLENBQUMsT0FBUCxHQUFpQjtJQUNmLFdBQUEsU0FEZTtJQUNKLE9BQUEsS0FESTs7QUF2QmpCIiwic291cmNlc0NvbnRlbnQiOlsiRXhOb3JtYWxNb2RlSW5wdXRFbGVtZW50ID0gcmVxdWlyZSAnLi9leC1ub3JtYWwtbW9kZS1pbnB1dC1lbGVtZW50J1xuXG5jbGFzcyBWaWV3TW9kZWxcbiAgY29uc3RydWN0b3I6IChAY29tbWFuZCwgb3B0cz17fSkgLT5cbiAgICB7QGVkaXRvciwgQGV4U3RhdGV9ID0gQGNvbW1hbmRcblxuICAgIEB2aWV3ID0gbmV3IEV4Tm9ybWFsTW9kZUlucHV0RWxlbWVudCgpLmluaXRpYWxpemUoQCwgb3B0cylcbiAgICBAZWRpdG9yLm5vcm1hbE1vZGVJbnB1dFZpZXcgPSBAdmlld1xuICAgIEBleFN0YXRlLm9uRGlkRmFpbFRvRXhlY3V0ZSA9PiBAdmlldy5yZW1vdmUoKVxuICAgIEBkb25lID0gZmFsc2VcblxuICBjb25maXJtOiAodmlldykgLT5cbiAgICBAZXhTdGF0ZS5wdXNoT3BlcmF0aW9ucyhuZXcgSW5wdXQoQHZpZXcudmFsdWUpKVxuICAgIEBkb25lID0gdHJ1ZVxuXG4gIGNhbmNlbDogKHZpZXcpIC0+XG4gICAgdW5sZXNzIEBkb25lXG4gICAgICBAZXhTdGF0ZS5wdXNoT3BlcmF0aW9ucyhuZXcgSW5wdXQoJycpKVxuICAgICAgQGRvbmUgPSB0cnVlXG5cbmNsYXNzIElucHV0XG4gIGNvbnN0cnVjdG9yOiAoQGNoYXJhY3RlcnMpIC0+XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBWaWV3TW9kZWwsIElucHV0XG59XG4iXX0=
