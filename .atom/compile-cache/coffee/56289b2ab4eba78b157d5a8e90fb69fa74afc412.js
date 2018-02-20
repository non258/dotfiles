(function() {
  var Emitter, PluginManager, _;

  Emitter = require('atom').Emitter;

  _ = require('lodash');

  module.exports = PluginManager = {
    emitter: new Emitter,
    defaultPlugins: require('../plugins'),
    plugins: {},
    addPlugin: function(Plugin) {
      if (!(Plugin && Plugin.pluginName)) {
        return;
      }
      this.plugins[Plugin.pluginName] = Plugin;
      return this.emitter.emit('plugin.added', Plugin);
    },
    removePlugin: function(Plugin) {
      if (!(Plugin && Plugin.pluginName && this.plugins[Plugin.pluginName])) {
        return;
      }
      return this.removeByName(Plugin.pluginName);
    },
    removeByName: function(pluginName) {
      var Plugin;
      Plugin = this.plugins[pluginName];
      delete this.plugins[pluginName];
      return this.emitter.emit('plugin.removed', Plugin);
    },
    getAll: function() {
      var key, ref, results, val;
      ref = this.plugins;
      results = [];
      for (key in ref) {
        val = ref[key];
        results.push(val);
      }
      return results;
    },
    getByProvider: function(provider) {
      return _.find(this.getAll(), {
        provider: provider
      }) || _.find(this.defaultPlugins, {
        provider: provider
      });
    },
    init: function() {
      var i, len, plugin, ref, results;
      ref = this.defaultPlugins;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        plugin = ref[i];
        results.push(PluginManager.addPlugin(plugin));
      }
      return results;
    },
    removeDefaultPlugins: function() {
      var i, len, plugin, ref, results;
      ref = this.defaultPlugins;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        plugin = ref[i];
        results.push(PluginManager.removePlugin(plugin));
      }
      return results;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2ltZG9uZS1hdG9tL2xpYi9zZXJ2aWNlcy9wbHVnaW4tbWFuYWdlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLFVBQVcsT0FBQSxDQUFRLE1BQVI7O0VBQ1osQ0FBQSxHQUFJLE9BQUEsQ0FBUSxRQUFSOztFQUdKLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLGFBQUEsR0FDZjtJQUFBLE9BQUEsRUFBUyxJQUFJLE9BQWI7SUFDQSxjQUFBLEVBQWdCLE9BQUEsQ0FBUSxZQUFSLENBRGhCO0lBRUEsT0FBQSxFQUFTLEVBRlQ7SUFJQSxTQUFBLEVBQVcsU0FBQyxNQUFEO01BQ1QsSUFBQSxDQUFBLENBQWMsTUFBQSxJQUFVLE1BQU0sQ0FBQyxVQUEvQixDQUFBO0FBQUEsZUFBQTs7TUFDQSxJQUFDLENBQUEsT0FBUSxDQUFBLE1BQU0sQ0FBQyxVQUFQLENBQVQsR0FBOEI7YUFDOUIsSUFBQyxDQUFBLE9BQU8sQ0FBQyxJQUFULENBQWMsY0FBZCxFQUE4QixNQUE5QjtJQUhTLENBSlg7SUFTQSxZQUFBLEVBQWMsU0FBQyxNQUFEO01BQ1osSUFBQSxDQUFBLENBQWMsTUFBQSxJQUFVLE1BQU0sQ0FBQyxVQUFqQixJQUErQixJQUFDLENBQUEsT0FBUSxDQUFBLE1BQU0sQ0FBQyxVQUFQLENBQXRELENBQUE7QUFBQSxlQUFBOzthQUNBLElBQUMsQ0FBQSxZQUFELENBQWMsTUFBTSxDQUFDLFVBQXJCO0lBRlksQ0FUZDtJQWFBLFlBQUEsRUFBYyxTQUFDLFVBQUQ7QUFDWixVQUFBO01BQUEsTUFBQSxHQUFTLElBQUMsQ0FBQSxPQUFRLENBQUEsVUFBQTtNQUNsQixPQUFPLElBQUMsQ0FBQSxPQUFRLENBQUEsVUFBQTthQUNoQixJQUFDLENBQUEsT0FBTyxDQUFDLElBQVQsQ0FBYyxnQkFBZCxFQUFnQyxNQUFoQztJQUhZLENBYmQ7SUFrQkEsTUFBQSxFQUFRLFNBQUE7QUFBRyxVQUFBO0FBQUM7QUFBQTtXQUFBLFVBQUE7O3FCQUFBO0FBQUE7O0lBQUosQ0FsQlI7SUFvQkEsYUFBQSxFQUFlLFNBQUMsUUFBRDthQUNiLENBQUMsQ0FBQyxJQUFGLENBQU8sSUFBQyxDQUFBLE1BQUQsQ0FBQSxDQUFQLEVBQWtCO1FBQUEsUUFBQSxFQUFVLFFBQVY7T0FBbEIsQ0FBQSxJQUF5QyxDQUFDLENBQUMsSUFBRixDQUFPLElBQUMsQ0FBQSxjQUFSLEVBQXdCO1FBQUEsUUFBQSxFQUFVLFFBQVY7T0FBeEI7SUFENUIsQ0FwQmY7SUF1QkEsSUFBQSxFQUFNLFNBQUE7QUFDSixVQUFBO0FBQUE7QUFBQTtXQUFBLHFDQUFBOztxQkFDRSxhQUFhLENBQUMsU0FBZCxDQUF3QixNQUF4QjtBQURGOztJQURJLENBdkJOO0lBMkJBLG9CQUFBLEVBQXNCLFNBQUE7QUFDcEIsVUFBQTtBQUFBO0FBQUE7V0FBQSxxQ0FBQTs7cUJBQ0UsYUFBYSxDQUFDLFlBQWQsQ0FBMkIsTUFBM0I7QUFERjs7SUFEb0IsQ0EzQnRCOztBQUxGIiwic291cmNlc0NvbnRlbnQiOlsie0VtaXR0ZXJ9ID0gcmVxdWlyZSAnYXRvbSdcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cblxubW9kdWxlLmV4cG9ydHMgPSBQbHVnaW5NYW5hZ2VyID1cbiAgZW1pdHRlcjogbmV3IEVtaXR0ZXJcbiAgZGVmYXVsdFBsdWdpbnM6IHJlcXVpcmUgJy4uL3BsdWdpbnMnXG4gIHBsdWdpbnM6IHt9XG5cbiAgYWRkUGx1Z2luOiAoUGx1Z2luKSAtPlxuICAgIHJldHVybiB1bmxlc3MgUGx1Z2luICYmIFBsdWdpbi5wbHVnaW5OYW1lXG4gICAgQHBsdWdpbnNbUGx1Z2luLnBsdWdpbk5hbWVdID0gUGx1Z2luXG4gICAgQGVtaXR0ZXIuZW1pdCAncGx1Z2luLmFkZGVkJywgUGx1Z2luXG5cbiAgcmVtb3ZlUGx1Z2luOiAoUGx1Z2luKSAtPlxuICAgIHJldHVybiB1bmxlc3MgUGx1Z2luICYmIFBsdWdpbi5wbHVnaW5OYW1lICYmIEBwbHVnaW5zW1BsdWdpbi5wbHVnaW5OYW1lXVxuICAgIEByZW1vdmVCeU5hbWUgUGx1Z2luLnBsdWdpbk5hbWVcblxuICByZW1vdmVCeU5hbWU6IChwbHVnaW5OYW1lKSAtPlxuICAgIFBsdWdpbiA9IEBwbHVnaW5zW3BsdWdpbk5hbWVdXG4gICAgZGVsZXRlIEBwbHVnaW5zW3BsdWdpbk5hbWVdXG4gICAgQGVtaXR0ZXIuZW1pdCAncGx1Z2luLnJlbW92ZWQnLCBQbHVnaW5cblxuICBnZXRBbGw6IC0+ICh2YWwgZm9yIGtleSwgdmFsIG9mIEBwbHVnaW5zKVxuXG4gIGdldEJ5UHJvdmlkZXI6IChwcm92aWRlcikgLT5cbiAgICBfLmZpbmQoQGdldEFsbCgpLCBwcm92aWRlcjogcHJvdmlkZXIpIHx8IF8uZmluZChAZGVmYXVsdFBsdWdpbnMsIHByb3ZpZGVyOiBwcm92aWRlcilcblxuICBpbml0OiAtPlxuICAgIGZvciBwbHVnaW4gaW4gQGRlZmF1bHRQbHVnaW5zXG4gICAgICBQbHVnaW5NYW5hZ2VyLmFkZFBsdWdpbiBwbHVnaW5cblxuICByZW1vdmVEZWZhdWx0UGx1Z2luczogLT5cbiAgICBmb3IgcGx1Z2luIGluIEBkZWZhdWx0UGx1Z2luc1xuICAgICAgUGx1Z2luTWFuYWdlci5yZW1vdmVQbHVnaW4gcGx1Z2luXG4iXX0=
