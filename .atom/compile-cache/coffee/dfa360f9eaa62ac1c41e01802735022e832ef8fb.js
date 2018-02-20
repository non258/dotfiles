(function() {
  var Emitter, WebhookConnectorPlugin,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  Emitter = require('atom').Emitter;

  module.exports = WebhookConnectorPlugin = (function(superClass) {
    extend(WebhookConnectorPlugin, superClass);

    WebhookConnectorPlugin.PluginView = void 0;

    WebhookConnectorPlugin.pluginName = "webhook-plugin";

    WebhookConnectorPlugin.provider = "webhook";

    WebhookConnectorPlugin.title = "Deliver tasks to a webhook";

    WebhookConnectorPlugin.icon = "server";

    function WebhookConnectorPlugin(repo, imdoneView, connector) {
      this.repo = repo;
      this.imdoneView = imdoneView;
      this.connector = connector;
      this.emit('ready');
    }

    WebhookConnectorPlugin.prototype.setConnector = function(connector) {
      this.connector = connector;
    };

    WebhookConnectorPlugin.prototype.isReady = function() {
      return true;
    };

    return WebhookConnectorPlugin;

  })(Emitter);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2ltZG9uZS1hdG9tL2xpYi9wbHVnaW5zL3dlYmhvb2stcGx1Z2luLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsK0JBQUE7SUFBQTs7O0VBQUMsVUFBVyxPQUFBLENBQVEsTUFBUjs7RUFFWixNQUFNLENBQUMsT0FBUCxHQUNNOzs7SUFDSixzQkFBQyxDQUFBLFVBQUQsR0FBYTs7SUFDYixzQkFBQyxDQUFBLFVBQUQsR0FBYTs7SUFDYixzQkFBQyxDQUFBLFFBQUQsR0FBVzs7SUFDWCxzQkFBQyxDQUFBLEtBQUQsR0FBUTs7SUFDUixzQkFBQyxDQUFBLElBQUQsR0FBTzs7SUFFTSxnQ0FBQyxJQUFELEVBQVEsVUFBUixFQUFxQixTQUFyQjtNQUFDLElBQUMsQ0FBQSxPQUFEO01BQU8sSUFBQyxDQUFBLGFBQUQ7TUFBYSxJQUFDLENBQUEsWUFBRDtNQUFlLElBQUMsQ0FBQSxJQUFELENBQU0sT0FBTjtJQUFwQzs7cUNBRWIsWUFBQSxHQUFjLFNBQUMsU0FBRDtNQUFDLElBQUMsQ0FBQSxZQUFEO0lBQUQ7O3FDQUdkLE9BQUEsR0FBUyxTQUFBO2FBQUc7SUFBSDs7OztLQVowQjtBQUhyQyIsInNvdXJjZXNDb250ZW50IjpbIntFbWl0dGVyfSA9IHJlcXVpcmUgJ2F0b20nXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFdlYmhvb2tDb25uZWN0b3JQbHVnaW4gZXh0ZW5kcyBFbWl0dGVyXG4gIEBQbHVnaW5WaWV3OiB1bmRlZmluZWRcbiAgQHBsdWdpbk5hbWU6IFwid2ViaG9vay1wbHVnaW5cIlxuICBAcHJvdmlkZXI6IFwid2ViaG9va1wiXG4gIEB0aXRsZTogXCJEZWxpdmVyIHRhc2tzIHRvIGEgd2ViaG9va1wiXG4gIEBpY29uOiBcInNlcnZlclwiXG5cbiAgY29uc3RydWN0b3I6IChAcmVwbywgQGltZG9uZVZpZXcsIEBjb25uZWN0b3IpIC0+IEBlbWl0ICdyZWFkeSdcblxuICBzZXRDb25uZWN0b3I6IChAY29ubmVjdG9yKSAtPiBcblxuICAjIEludGVyZmFjZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaXNSZWFkeTogLT4gdHJ1ZVxuIl19
