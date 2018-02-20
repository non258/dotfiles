Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

'use babel';

var AtomClockView = (function () {
  function AtomClockView(statusBar) {
    _classCallCheck(this, AtomClockView);

    this.statusBar = statusBar;
    this.subscriptions = new _atom.CompositeDisposable();
  }

  _createClass(AtomClockView, [{
    key: 'start',
    value: function start() {
      this.drawElement();
      this.initialize();
    }
  }, {
    key: 'initialize',
    value: function initialize() {
      var _this = this;

      this.setConfigValues();
      this.setTooltip(this.showTooltip);
      this.setIcon(this.showIcon);
      this.setUTCClass(this.showUTC);
      this.startTicker();

      this.subscriptions.add(atom.commands.add('atom-workspace', {
        'atom-clock:toggle': function atomClockToggle() {
          return _this.toggle();
        },
        'atom-clock:utc-mode': function atomClockUtcMode() {
          return atom.config.set('atom-clock.showUTC', !_this.showUTC);
        }
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.dateFormat', function () {
        _this.refreshTicker();
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.showTooltip', function () {
        _this.setConfigValues();
        _this.setTooltip(_this.showTooltip);
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.tooltipDateFormat', function () {
        _this.refreshTicker();
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.locale', function () {
        _this.refreshTicker();
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.showUTC', function () {
        _this.refreshTicker();
        _this.setUTCClass(_this.showUTC);
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.refreshInterval', function () {
        _this.refreshTicker();
      }));

      this.subscriptions.add(atom.config.onDidChange('atom-clock.showClockIcon', function () {
        _this.setConfigValues();
        _this.setIcon(_this.showIcon);
      }));
    }
  }, {
    key: 'drawElement',
    value: function drawElement() {
      this.element = document.createElement('div');
      this.element.classList.add('atom-clock', 'inline-block');

      this.iconElement = document.createElement('span');
      this.iconElement.classList.add('atom-clock-icon');

      this.timeElement = document.createElement('span');
      this.timeElement.classList.add('atom-clock-time');

      this.element.appendChild(this.iconElement);
      this.element.appendChild(this.timeElement);

      this.statusBar.addRightTile({
        item: this.element,
        priority: -500
      });
    }
  }, {
    key: 'setConfigValues',
    value: function setConfigValues() {
      this.dateFormat = atom.config.get('atom-clock.dateFormat');
      this.showTooltip = atom.config.get('atom-clock.showTooltip');
      this.tooltipDateFormat = atom.config.get('atom-clock.tooltipDateFormat');
      this.locale = atom.config.get('atom-clock.locale');
      this.showUTC = atom.config.get('atom-clock.showUTC');
      this.refreshInterval = atom.config.get('atom-clock.refreshInterval') * 1000;
      this.showIcon = atom.config.get('atom-clock.showClockIcon');
    }
  }, {
    key: 'startTicker',
    value: function startTicker() {
      var _this2 = this;

      this.setDate();
      var nextTick = this.refreshInterval - Date.now() % this.refreshInterval;
      this.tick = setTimeout(function () {
        _this2.startTicker();
      }, nextTick);
    }
  }, {
    key: 'clearTicker',
    value: function clearTicker() {
      if (this.tick) clearTimeout(this.tick);
    }
  }, {
    key: 'refreshTicker',
    value: function refreshTicker() {
      this.setConfigValues();
      this.clearTicker();
      this.startTicker();
    }
  }, {
    key: 'setDate',
    value: function setDate() {
      this.date = this.getDate(this.locale, this.dateFormat);
      this.timeElement.textContent = this.date;
    }
  }, {
    key: 'getDate',
    value: function getDate(locale, format) {
      if (!this.Moment) this.Moment = require('moment');

      var moment = this.Moment().locale(locale);

      if (this.showUTC) moment.utc();

      return moment.format(format);
    }
  }, {
    key: 'setIcon',
    value: function setIcon(toSet) {
      if (toSet) this.iconElement.classList.add('icon', 'icon-clock');else this.iconElement.classList.remove('icon', 'icon-clock');
    }
  }, {
    key: 'setTooltip',
    value: function setTooltip(toSet) {
      var _this3 = this;

      if (this.tooltip === undefined) this.tooltip = atom.tooltips.add(this.element, {
        title: function title() {
          return _this3.getDate(_this3.locale, _this3.tooltipDateFormat);
        },
        'class': 'atom-clock-tooltip'
      });

      if (toSet) atom.tooltips.findTooltips(this.element)[0].enable();else atom.tooltips.findTooltips(this.element)[0].disable();
    }
  }, {
    key: 'setUTCClass',
    value: function setUTCClass(toSet) {
      if (toSet) {
        this.element.classList.add('atom-clock-utc');
        atom.tooltips.findTooltips(this.element)[0].getTooltipElement().classList.add('atom-clock-utc');
      } else {
        this.element.classList.remove('atom-clock-utc');
        atom.tooltips.findTooltips(this.element)[0].getTooltipElement().classList.remove('atom-clock-utc');
      }
    }
  }, {
    key: 'toggle',
    value: function toggle() {
      var style = this.element.style.display;
      this.element.style.display = style === 'none' ? '' : 'none';
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this.clearTicker();
      this.subscriptions.dispose();
      this.tooltip.dispose();
      this.element.remove();
    }
  }]);

  return AtomClockView;
})();

exports['default'] = AtomClockView;
module.exports = exports['default'];
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL25vem9taS8uYXRvbS9wYWNrYWdlcy9hdG9tLWNsb2NrL2xpYi9hdG9tLWNsb2NrLXZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7b0JBRW9DLE1BQU07O0FBRjFDLFdBQVcsQ0FBQzs7SUFJUyxhQUFhO0FBRXJCLFdBRlEsYUFBYSxDQUVwQixTQUFTLEVBQUU7MEJBRkosYUFBYTs7QUFHOUIsUUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUE7QUFDMUIsUUFBSSxDQUFDLGFBQWEsR0FBRywrQkFBeUIsQ0FBQTtHQUMvQzs7ZUFMa0IsYUFBYTs7V0FPM0IsaUJBQUc7QUFDTixVQUFJLENBQUMsV0FBVyxFQUFFLENBQUE7QUFDbEIsVUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFBO0tBQ2xCOzs7V0FFUyxzQkFBRzs7O0FBQ1gsVUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFBO0FBQ3RCLFVBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFBO0FBQ2pDLFVBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0FBQzNCLFVBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0FBQzlCLFVBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQTs7QUFFbEIsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUU7QUFDekQsMkJBQW1CLEVBQUU7aUJBQU0sTUFBSyxNQUFNLEVBQUU7U0FBQTtBQUN4Qyw2QkFBcUIsRUFBRTtpQkFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLE1BQUssT0FBTyxDQUFDO1NBQUE7T0FDbEYsQ0FBQyxDQUFDLENBQUE7O0FBRUgsVUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFX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ZS9ub3pvbWkvLmF0b20vcGFja2FnZXMvYXRvbS1jbG9jay9saWIvYXRvbS1jbG9jay12aWV3LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG5cbmltcG9ydCB7IENvbXBvc2l0ZURpc3Bvc2FibGUgfSBmcm9tICdhdG9tJ1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBBdG9tQ2xvY2tWaWV3IHtcblxuICBjb25zdHJ1Y3RvcihzdGF0dXNCYXIpIHtcbiAgICB0aGlzLnN0YXR1c0JhciA9IHN0YXR1c0JhclxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKClcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIHRoaXMuZHJhd0VsZW1lbnQoKVxuICAgIHRoaXMuaW5pdGlhbGl6ZSgpXG4gIH1cblxuICBpbml0aWFsaXplKCkge1xuICAgIHRoaXMuc2V0Q29uZmlnVmFsdWVzKClcbiAgICB0aGlzLnNldFRvb2x0aXAodGhpcy5zaG93VG9vbHRpcClcbiAgICB0aGlzLnNldEljb24odGhpcy5zaG93SWNvbilcbiAgICB0aGlzLnNldFVUQ0NsYXNzKHRoaXMuc2hvd1VUQylcbiAgICB0aGlzLnN0YXJ0VGlja2VyKClcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgJ2F0b20tY2xvY2s6dG9nZ2xlJzogKCkgPT4gdGhpcy50b2dnbGUoKSxcbiAgICAgICdhdG9tLWNsb2NrOnV0Yy1tb2RlJzogKCkgPT4gYXRvbS5jb25maWcuc2V0KCdhdG9tLWNsb2NrLnNob3dVVEMnLCAhdGhpcy5zaG93VVRDKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnYXRvbS1jbG9jay5kYXRlRm9ybWF0JywgKCkgPT4ge1xuICAgICAgdGhpcy5yZWZyZXNoVGlja2VyKClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F0b20tY2xvY2suc2hvd1Rvb2x0aXAnLCAoKSA9PiB7XG4gICAgICB0aGlzLnNldENvbmZpZ1ZhbHVlcygpXG4gICAgICB0aGlzLnNldFRvb2x0aXAodGhpcy5zaG93VG9vbHRpcClcbiAgICB9KSlcblxuICAgIHRoaXMuc3Vic2NyaXB0aW9ucy5hZGQoYXRvbS5jb25maWcub25EaWRDaGFuZ2UoJ2F0b20tY2xvY2sudG9vbHRpcERhdGVGb3JtYXQnLCAoKSA9PiB7XG4gICAgICB0aGlzLnJlZnJlc2hUaWNrZXIoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnYXRvbS1jbG9jay5sb2NhbGUnLCAoKSA9PiB7XG4gICAgICB0aGlzLnJlZnJlc2hUaWNrZXIoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnYXRvbS1jbG9jay5zaG93VVRDJywgKCkgPT4ge1xuICAgICAgdGhpcy5yZWZyZXNoVGlja2VyKClcbiAgICAgIHRoaXMuc2V0VVRDQ2xhc3ModGhpcy5zaG93VVRDKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnYXRvbS1jbG9jay5yZWZyZXNoSW50ZXJ2YWwnLCAoKSA9PiB7XG4gICAgICB0aGlzLnJlZnJlc2hUaWNrZXIoKVxuICAgIH0pKVxuXG4gICAgdGhpcy5zdWJzY3JpcHRpb25zLmFkZChhdG9tLmNvbmZpZy5vbkRpZENoYW5nZSgnYXRvbS1jbG9jay5zaG93Q2xvY2tJY29uJywgKCkgPT4ge1xuICAgICAgdGhpcy5zZXRDb25maWdWYWx1ZXMoKVxuICAgICAgdGhpcy5zZXRJY29uKHRoaXMuc2hvd0ljb24pXG4gICAgfSkpXG5cbiAgfVxuXG4gIGRyYXdFbGVtZW50KCkge1xuICAgIHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2F0b20tY2xvY2snLCAnaW5saW5lLWJsb2NrJylcblxuICAgIHRoaXMuaWNvbkVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJylcbiAgICB0aGlzLmljb25FbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2F0b20tY2xvY2staWNvbicpXG5cbiAgICB0aGlzLnRpbWVFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgdGhpcy50aW1lRWxlbWVudC5jbGFzc0xpc3QuYWRkKCdhdG9tLWNsb2NrLXRpbWUnKVxuXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuaWNvbkVsZW1lbnQpXG4gICAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMudGltZUVsZW1lbnQpXG5cbiAgICB0aGlzLnN0YXR1c0Jhci5hZGRSaWdodFRpbGUoe1xuICAgICAgaXRlbTogdGhpcy5lbGVtZW50LFxuICAgICAgcHJpb3JpdHk6IC01MDBcbiAgICB9KVxuICB9XG5cbiAgc2V0Q29uZmlnVmFsdWVzKCkge1xuICAgIHRoaXMuZGF0ZUZvcm1hdCA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1jbG9jay5kYXRlRm9ybWF0JylcbiAgICB0aGlzLnNob3dUb29sdGlwID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWNsb2NrLnNob3dUb29sdGlwJylcbiAgICB0aGlzLnRvb2x0aXBEYXRlRm9ybWF0ID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWNsb2NrLnRvb2x0aXBEYXRlRm9ybWF0JylcbiAgICB0aGlzLmxvY2FsZSA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1jbG9jay5sb2NhbGUnKVxuICAgIHRoaXMuc2hvd1VUQyA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1jbG9jay5zaG93VVRDJylcbiAgICB0aGlzLnJlZnJlc2hJbnRlcnZhbCA9IGF0b20uY29uZmlnLmdldCgnYXRvbS1jbG9jay5yZWZyZXNoSW50ZXJ2YWwnKSAqIDEwMDBcbiAgICB0aGlzLnNob3dJY29uID0gYXRvbS5jb25maWcuZ2V0KCdhdG9tLWNsb2NrLnNob3dDbG9ja0ljb24nKVxuICB9XG5cbiAgc3RhcnRUaWNrZXIoKSB7XG4gICAgdGhpcy5zZXREYXRlKClcbiAgICB2YXIgbmV4dFRpY2sgPSB0aGlzLnJlZnJlc2hJbnRlcnZhbCAtIChEYXRlLm5vdygpICUgdGhpcy5yZWZyZXNoSW50ZXJ2YWwpXG4gICAgdGhpcy50aWNrID0gc2V0VGltZW91dCAoKCkgPT4gIHsgdGhpcy5zdGFydFRpY2tlcigpIH0sIG5leHRUaWNrKVxuICB9XG5cbiAgY2xlYXJUaWNrZXIoKSB7XG4gICAgaWYgKHRoaXMudGljaylcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLnRpY2spXG4gIH1cblxuICByZWZyZXNoVGlja2VyKCkge1xuICAgIHRoaXMuc2V0Q29uZmlnVmFsdWVzKClcbiAgICB0aGlzLmNsZWFyVGlja2VyKClcbiAgICB0aGlzLnN0YXJ0VGlja2VyKClcbiAgfVxuXG4gIHNldERhdGUoKSB7XG4gICAgdGhpcy5kYXRlID0gdGhpcy5nZXREYXRlKHRoaXMubG9jYWxlLCB0aGlzLmRhdGVGb3JtYXQpXG4gICAgdGhpcy50aW1lRWxlbWVudC50ZXh0Q29udGVudCA9IHRoaXMuZGF0ZVxuICB9XG5cbiAgZ2V0RGF0ZShsb2NhbGUsIGZvcm1hdCkge1xuICAgIGlmICghdGhpcy5Nb21lbnQpXG4gICAgICB0aGlzLk1vbWVudCA9IHJlcXVpcmUoJ21vbWVudCcpXG5cbiAgICB2YXIgbW9tZW50ID0gdGhpcy5Nb21lbnQoKS5sb2NhbGUobG9jYWxlKVxuXG4gICAgaWYgKHRoaXMuc2hvd1VUQylcbiAgICAgIG1vbWVudC51dGMoKVxuXG4gICAgcmV0dXJuIG1vbWVudC5mb3JtYXQoZm9ybWF0KVxuICB9XG5cbiAgc2V0SWNvbih0b1NldCkge1xuICAgIGlmICh0b1NldClcbiAgICAgIHRoaXMuaWNvbkVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaWNvbicsICdpY29uLWNsb2NrJylcbiAgICBlbHNlXG4gICAgICB0aGlzLmljb25FbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2ljb24nLCAnaWNvbi1jbG9jaycpXG4gIH1cblxuICBzZXRUb29sdGlwKHRvU2V0KSB7XG4gICAgaWYgKHRoaXMudG9vbHRpcCA9PT0gdW5kZWZpbmVkKVxuICAgICAgdGhpcy50b29sdGlwID0gYXRvbS50b29sdGlwcy5hZGQodGhpcy5lbGVtZW50LCB7XG4gICAgICAgIHRpdGxlOiAoKSA9PiB0aGlzLmdldERhdGUodGhpcy5sb2NhbGUsIHRoaXMudG9vbHRpcERhdGVGb3JtYXQpLFxuICAgICAgICBjbGFzczogJ2F0b20tY2xvY2stdG9vbHRpcCdcbiAgICAgIH0pXG5cbiAgICBpZiAodG9TZXQpXG4gICAgICBhdG9tLnRvb2x0aXBzLmZpbmRUb29sdGlwcyh0aGlzLmVsZW1lbnQpWzBdLmVuYWJsZSgpXG4gICAgZWxzZVxuICAgICAgYXRvbS50b29sdGlwcy5maW5kVG9vbHRpcHModGhpcy5lbGVtZW50KVswXS5kaXNhYmxlKClcbiAgfVxuXG4gIHNldFVUQ0NsYXNzKHRvU2V0KSB7XG4gICAgaWYgKHRvU2V0KSB7XG4gICAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnYXRvbS1jbG9jay11dGMnKVxuICAgICAgYXRvbS50b29sdGlwcy5maW5kVG9vbHRpcHModGhpcy5lbGVtZW50KVswXS5nZXRUb29sdGlwRWxlbWVudCgpLmNsYXNzTGlzdC5hZGQoJ2F0b20tY2xvY2stdXRjJylcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2F0b20tY2xvY2stdXRjJylcbiAgICAgIGF0b20udG9vbHRpcHMuZmluZFRvb2x0aXBzKHRoaXMuZWxlbWVudClbMF0uZ2V0VG9vbHRpcEVsZW1lbnQoKS5jbGFzc0xpc3QucmVtb3ZlKCdhdG9tLWNsb2NrLXV0YycpXG4gICAgfVxuICB9XG5cblxuICB0b2dnbGUoKSB7XG4gICAgdmFyIHN0eWxlID0gdGhpcy5lbGVtZW50LnN0eWxlLmRpc3BsYXlcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGUuZGlzcGxheSA9IHN0eWxlID09PSAnbm9uZScgPyAnJyA6ICdub25lJ1xuICB9XG5cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLmNsZWFyVGlja2VyKClcbiAgICB0aGlzLnN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpXG4gICAgdGhpcy50b29sdGlwLmRpc3Bvc2UoKVxuICAgIHRoaXMuZWxlbWVudC5yZW1vdmUoKVxuICB9XG59XG4iXX0=