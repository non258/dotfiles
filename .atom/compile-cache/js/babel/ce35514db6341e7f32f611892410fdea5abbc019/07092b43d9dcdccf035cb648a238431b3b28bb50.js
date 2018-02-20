Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fastPackageView = require('./fast-package-view');

var _fastPackageView2 = _interopRequireDefault(_fastPackageView);

var _atom = require('atom');

'use babel';

exports['default'] = {

  fastPackageView: null,
  modalPanel: null,
  subscriptions: null,

  activate: function activate(state) {
    var _this = this;

    this.fastPackageView = new _fastPackageView2['default'](state.fastPackageViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.fastPackageView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new _atom.CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'fast-package:toggle': function fastPackageToggle() {
        return _this.toggle();
      }
    }));
  },

  deactivate: function deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.fastPackageView.destroy();
  },

  serialize: function serialize() {
    return {
      fastPackageViewState: this.fastPackageView.serialize()
    };
  },

  toggle: function toggle() {
    console.log('FastPackage was toggled!');
    return this.modalPanel.isVisible() ? this.modalPanel.hide() : this.modalPanel.show();
  }

};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL25vem9taS9naXRodWIvZmFzdC1wYWNrYWdlL2xpYi9mYXN0LXBhY2thZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OytCQUU0QixxQkFBcUI7Ozs7b0JBQ2IsTUFBTTs7QUFIMUMsV0FBVyxDQUFDOztxQkFLRzs7QUFFYixpQkFBZSxFQUFFLElBQUk7QUFDckIsWUFBVSxFQUFFLElBQUk7QUFDaEIsZUFBYSxFQUFFLElBQUk7O0FBRW5CLFVBQVEsRUFBQSxrQkFBQyxLQUFLLEVBQUU7OztBQUNkLFFBQUksQ0FBQyxlQUFlLEdBQUcsaUNBQW9CLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQ3ZFLFFBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUM7QUFDN0MsVUFBSSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFO0FBQ3ZDLGFBQU8sRUFBRSxLQUFLO0tBQ2YsQ0FBQyxDQUFDOzs7QUFHSCxRQUFJLENBQUMsYUFBYSxHQUFHLCtCQUF5QixDQUFDOzs7QUFHL0MsUUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDekQsMkJBQXFCLEVBQUU7ZUFBTSxNQUFLLE1BQU0sRUFBRTtPQUFBO0tBQzNDLENBQUMsQ0FBQyxDQUFDO0dBQ0w7O0FBRUQsWUFBVSxFQUFBLHNCQUFHO0FBQ1gsUUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUMxQixRQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzdCLFFBQUksQ0FBQyxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7R0FDaEM7O0FBRUQsV0FBUyxFQUFBLHFCQUFHO0FBQ1YsV0FBTztBQUNMLDBCQUFvQixFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFO0tBQ3ZELENBQUM7R0FDSDs7QUFFRCxRQUFNLEVBQUEsa0JBQUc7QUFDUCxXQUFPLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLENBQUM7QUFDeEMsV0FDRSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSxHQUMzQixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxHQUN0QixJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUN0QjtHQUNIOztDQUVGIiwiZmlsZSI6Ii9ob21lL25vem9taS9naXRodWIvZmFzdC1wYWNrYWdlL2xpYi9mYXN0LXBhY2thZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IEZhc3RQYWNrYWdlVmlldyBmcm9tICcuL2Zhc3QtcGFja2FnZS12aWV3JztcbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJztcblxuZXhwb3J0IGRlZmF1bHQge1xuXG4gIGZhc3RQYWNrYWdlVmlldzogbnVsbCxcbiAgbW9kYWxQYW5lbDogbnVsbCxcbiAgc3Vic2NyaXB0aW9uczogbnVsbCxcblxuICBhY3RpdmF0ZShzdGF0ZSkge1xuICAgIHRoaXMuZmFzdFBhY2thZ2VWaWV3ID0gbmV3IEZhc3RQYWNrYWdlVmlldyhzdGF0ZS5mYXN0UGFja2FnZVZpZXdTdGF0ZSk7XG4gICAgdGhpcy5tb2RhbFBhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbCh7XG4gICAgICBpdGVtOiB0aGlzLmZhc3RQYWNrYWdlVmlldy5nZXRFbGVtZW50KCksXG4gICAgICB2aXNpYmxlOiBmYWxzZVxuICAgIH0pO1xuXG4gICAgLy8gRXZlbnRzIHN1YnNjcmliZWQgdG8gaW4gYXRvbSdzIHN5c3RlbSBjYW4gYmUgZWFzaWx5IGNsZWFuZWQgdXAgd2l0aCBhIENvbXBvc2l0ZURpc3Bvc2FibGVcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuXG4gICAgLy8gUmVnaXN0ZXIgY29tbWFuZCB0aGF0IHRvZ2dsZXMgdGhpcyB2aWV3XG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAnZmFzdC1wYWNrYWdlOnRvZ2dsZSc6ICgpID0+IHRoaXMudG9nZ2xlKClcbiAgICB9KSk7XG4gIH0sXG5cbiAgZGVhY3RpdmF0ZSgpIHtcbiAgICB0aGlzLm1vZGFsUGFuZWwuZGVzdHJveSgpO1xuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgdGhpcy5mYXN0UGFja2FnZVZpZXcuZGVzdHJveSgpO1xuICB9LFxuXG4gIHNlcmlhbGl6ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgZmFzdFBhY2thZ2VWaWV3U3RhdGU6IHRoaXMuZmFzdFBhY2thZ2VWaWV3LnNlcmlhbGl6ZSgpXG4gICAgfTtcbiAgfSxcblxuICB0b2dnbGUoKSB7XG4gICAgY29uc29sZS5sb2coJ0Zhc3RQYWNrYWdlIHdhcyB0b2dnbGVkIScpO1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLm1vZGFsUGFuZWwuaXNWaXNpYmxlKCkgP1xuICAgICAgdGhpcy5tb2RhbFBhbmVsLmhpZGUoKSA6XG4gICAgICB0aGlzLm1vZGFsUGFuZWwuc2hvdygpXG4gICAgKTtcbiAgfVxuXG59O1xuIl19