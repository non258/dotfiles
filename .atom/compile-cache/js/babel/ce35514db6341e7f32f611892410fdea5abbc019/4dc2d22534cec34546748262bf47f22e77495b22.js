Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _atomClockView = require('./atom-clock-view');

var _atomClockView2 = _interopRequireDefault(_atomClockView);

'use babel';

exports['default'] = {

  config: {
    dateFormat: {
      type: 'string',
      title: 'Time format',
      description: 'Specify the time format. [Here](http://momentjs.com/docs/#/displaying/format/) you can find all the available formats.',
      'default': 'H:mm',
      order: 1
    }, locale: {
      type: 'string',
      title: 'Locale',
      description: 'Specify the time locale. [Here](https://github.com/moment/moment/tree/master/locale) you can find all the available locales.',
      'default': 'en',
      order: 2
    }, refreshInterval: {
      type: 'integer',
      title: 'Clock interval',
      description: 'Specify the refresh interval (in seconds) for the plugin to evaluate the date.',
      'default': 60,
      minimum: 1,
      order: 3
    }, showTooltip: {
      type: 'boolean',
      title: 'Enable tooltip',
      description: 'Enables a customisable tooltip when you hover over the time.',
      'default': false,
      order: 4
    }, tooltipDateFormat: {
      type: 'string',
      title: 'Tooltip time format',
      description: 'Specify the time format in the tooltip. [Here](http://momentjs.com/docs/#/displaying/format/) you can find all the available formats.',
      'default': 'LLLL',
      order: 5
    }, showUTC: {
      type: 'boolean',
      title: 'Display UTC time',
      description: 'Use UTC to display the time instead of local time.',
      'default': false,
      order: 6
    }, showClockIcon: {
      type: 'boolean',
      title: 'Icon clock',
      description: 'Show a clock icon next to the time in the status bar.',
      'default': false,
      order: 7
    }
  },

  activate: function activate(state) {},

  deactivate: function deactivate() {
    if (this.atomClockView) this.atomClockView.destroy();
  },

  consumeStatusBar: function consumeStatusBar(statusBar) {
    this.atomClockView = new _atomClockView2['default'](statusBar);
    this.atomClockView.start();
  }

};
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL25vem9taS8uYXRvbS9wYWNrYWdlcy9hdG9tLWNsb2NrL2xpYi9hdG9tLWNsb2NrLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs2QkFFMEIsbUJBQW1COzs7O0FBRjdDLFdBQVcsQ0FBQzs7cUJBSUc7O0FBRWIsUUFBTSxFQUFFO0FBQ04sY0FBVSxFQUFFO0FBQ1YsVUFBSSxFQUFFLFFBQVE7QUFDZCxXQUFLLEVBQUUsYUFBYTtBQUNwQixpQkFBVyxFQUFFLHdIQUF3SDtBQUNySSxpQkFBUyxNQUFNO0FBQ2YsV0FBSyxFQUFFLENBQUM7S0FDVCxFQUFFLE1BQU0sRUFBRTtBQUNULFVBQUksRUFBRSxRQUFRO0FBQ2QsV0FBSyxFQUFFLFFBQVE7QUFDZixpQkFBVyxFQUFFLDhIQUE4SDtBQUMzSSxpQkFBUyxJQUFJO0FBQ2IsV0FBSyxFQUFFLENBQUM7S0FDVCxFQUFFLGVBQWUsRUFBRTtBQUNsQixVQUFJLEVBQUUsU0FBUztBQUNmLFdBQUssRUFBRSxnQkFBZ0I7QUFDdkIsaUJBQVcsRUFBRSxnRkFBZ0Y7QUFDN0YsaUJBQVMsRUFBRTtBQUNYLGFBQU8sRUFBRSxDQUFDO0FBQ1YsV0FBSyxFQUFFLENBQUM7S0FDVCxFQUFFLFdBQVcsRUFBRTtBQUNkLFVBQUksRUFBRSxTQUFTO0FBQ2YsV0FBSyxFQUFFLGdCQUFnQjtBQUN2QixpQkFBVyxFQUFFLDhEQUE4RDtBQUMzRSxpQkFBUyxLQUFLO0FBQ2QsV0FBSyxFQUFFLENBQUM7S0FDVCxFQUFFLGlCQUFpQixFQUFFO0FBQ3BCLFVBQUksRUFBRSxRQUFRO0FBQ2QsV0FBSyxFQUFFLHFCQUFxQjtBQUM1QixpQkFBVyxFQUFFLHVJQUF1STtBQUNwSixpQkFBUyxNQUFNO0FBQ2YsV0FBSyxFQUFFLENBQUM7S0FDVCxFQUFFLE9BQU8sRUFBRTtBQUNWLFVBQUksRUFBRSxTQUFTO0FBQ2YsV0FBSyxFQUFFLGtCQUFrQjtBQUN6QixpQkFBVyxFQUFFLG9EQUFvRDtBQUNqRSxpQkFBUyxLQUFLO0FBQ2QsV0FBSyxFQUFFLENBQUM7S0FDVCxFQUFFLGFBQWEsRUFBRTtBQUNoQixVQUFJLEVBQUUsU0FBUztBQUNmLFdBQUssRUFBRSxZQUFZO0FBQ25CLGlCQUFXLEVBQUUsdURBQXVEO0FBQ3BFLGlCQUFTLEtBQUs7QUFDZCxXQUFLLEVBQUUsQ0FBQztLQUNUO0dBQ0Y7O0FBRUQsVUFBUSxFQUFBLGtCQUFDLEtBQUssRUFBRSxFQUFFOztBQUVsQixZQUFVLEVBQUEsc0JBQUc7QUFDWCxRQUFJLElBQUksQ0FBQyxhQUFhLEVBQ3BCLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLENBQUE7R0FDL0I7O0FBRUQsa0JBQWdCLEVBQUEsMEJBQUMsU0FBUyxFQUFFO0FBQzFCLFFBQUksQ0FBQyxhQUFhLEdBQUcsK0JBQWtCLFNBQVMsQ0FBQyxDQUFBO0FBQ2pELFFBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUE7R0FDM0I7O0NBRUYiLCJmaWxlIjoiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2F0b20tY2xvY2svbGliL2F0b20tY2xvY2suanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcblxuaW1wb3J0IEF0b21DbG9ja1ZpZXcgZnJvbSAnLi9hdG9tLWNsb2NrLXZpZXcnXG5cbmV4cG9ydCBkZWZhdWx0IHtcblxuICBjb25maWc6IHtcbiAgICBkYXRlRm9ybWF0OiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIHRpdGxlOiAnVGltZSBmb3JtYXQnLFxuICAgICAgZGVzY3JpcHRpb246ICdTcGVjaWZ5IHRoZSB0aW1lIGZvcm1hdC4gW0hlcmVdKGh0dHA6Ly9tb21lbnRqcy5jb20vZG9jcy8jL2Rpc3BsYXlpbmcvZm9ybWF0LykgeW91IGNhbiBmaW5kIGFsbCB0aGUgYXZhaWxhYmxlIGZvcm1hdHMuJyxcbiAgICAgIGRlZmF1bHQ6ICdIOm1tJyxcbiAgICAgIG9yZGVyOiAxXG4gICAgfSwgbG9jYWxlOiB7XG4gICAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICAgIHRpdGxlOiAnTG9jYWxlJyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU3BlY2lmeSB0aGUgdGltZSBsb2NhbGUuIFtIZXJlXShodHRwczovL2dpdGh1Yi5jb20vbW9tZW50L21vbWVudC90cmVlL21hc3Rlci9sb2NhbGUpIHlvdSBjYW4gZmluZCBhbGwgdGhlIGF2YWlsYWJsZSBsb2NhbGVzLicsXG4gICAgICBkZWZhdWx0OiAnZW4nLFxuICAgICAgb3JkZXI6IDJcbiAgICB9LCByZWZyZXNoSW50ZXJ2YWw6IHtcbiAgICAgIHR5cGU6ICdpbnRlZ2VyJyxcbiAgICAgIHRpdGxlOiAnQ2xvY2sgaW50ZXJ2YWwnLFxuICAgICAgZGVzY3JpcHRpb246ICdTcGVjaWZ5IHRoZSByZWZyZXNoIGludGVydmFsIChpbiBzZWNvbmRzKSBmb3IgdGhlIHBsdWdpbiB0byBldmFsdWF0ZSB0aGUgZGF0ZS4nLFxuICAgICAgZGVmYXVsdDogNjAsXG4gICAgICBtaW5pbXVtOiAxLFxuICAgICAgb3JkZXI6IDNcbiAgICB9LCBzaG93VG9vbHRpcDoge1xuICAgICAgdHlwZTogJ2Jvb2xlYW4nLFxuICAgICAgdGl0bGU6ICdFbmFibGUgdG9vbHRpcCcsXG4gICAgICBkZXNjcmlwdGlvbjogJ0VuYWJsZXMgYSBjdXN0b21pc2FibGUgdG9vbHRpcCB3aGVuIHlvdSBob3ZlciBvdmVyIHRoZSB0aW1lLicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIG9yZGVyOiA0XG4gICAgfSwgdG9vbHRpcERhdGVGb3JtYXQ6IHtcbiAgICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgICAgdGl0bGU6ICdUb29sdGlwIHRpbWUgZm9ybWF0JyxcbiAgICAgIGRlc2NyaXB0aW9uOiAnU3BlY2lmeSB0aGUgdGltZSBmb3JtYXQgaW4gdGhlIHRvb2x0aXAuIFtIZXJlXShodHRwOi8vbW9tZW50anMuY29tL2RvY3MvIy9kaXNwbGF5aW5nL2Zvcm1hdC8pIHlvdSBjYW4gZmluZCBhbGwgdGhlIGF2YWlsYWJsZSBmb3JtYXRzLicsXG4gICAgICBkZWZhdWx0OiAnTExMTCcsXG4gICAgICBvcmRlcjogNVxuICAgIH0sIHNob3dVVEM6IHtcbiAgICAgIHR5cGU6ICdib29sZWFuJyxcbiAgICAgIHRpdGxlOiAnRGlzcGxheSBVVEMgdGltZScsXG4gICAgICBkZXNjcmlwdGlvbjogJ1VzZSBVVEMgdG8gZGlzcGxheSB0aGUgdGltZSBpbnN0ZWFkIG9mIGxvY2FsIHRpbWUuJyxcbiAgICAgIGRlZmF1bHQ6IGZhbHNlLFxuICAgICAgb3JkZXI6IDZcbiAgICB9LCBzaG93Q2xvY2tJY29uOiB7XG4gICAgICB0eXBlOiAnYm9vbGVhbicsXG4gICAgICB0aXRsZTogJ0ljb24gY2xvY2snLFxuICAgICAgZGVzY3JpcHRpb246ICdTaG93IGEgY2xvY2sgaWNvbiBuZXh0IHRvIHRoZSB0aW1lIGluIHRoZSBzdGF0dXMgYmFyLicsXG4gICAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICAgIG9yZGVyOiA3XG4gICAgfVxuICB9LFxuXG4gIGFjdGl2YXRlKHN0YXRlKSB7fSxcblxuICBkZWFjdGl2YXRlKCkge1xuICAgIGlmICh0aGlzLmF0b21DbG9ja1ZpZXcpXG4gICAgICB0aGlzLmF0b21DbG9ja1ZpZXcuZGVzdHJveSgpXG4gIH0sXG5cbiAgY29uc3VtZVN0YXR1c0JhcihzdGF0dXNCYXIpIHtcbiAgICB0aGlzLmF0b21DbG9ja1ZpZXcgPSBuZXcgQXRvbUNsb2NrVmlldyhzdGF0dXNCYXIpXG4gICAgdGhpcy5hdG9tQ2xvY2tWaWV3LnN0YXJ0KClcbiAgfVxuXG59XG4iXX0=