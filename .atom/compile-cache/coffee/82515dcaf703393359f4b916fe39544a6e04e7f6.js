(function() {
  var configHelper, eioClient, engine, log, minimatch;

  engine = null;

  eioClient = null;

  minimatch = null;

  log = null;

  configHelper = require('./imdone-config');

  module.exports = {
    clients: {},
    init: function(port) {
      var http;
      if (!this.getConfig().openIn.enable) {
        return this;
      }
      if (this.isListening) {
        return this;
      }
      engine = require('engine.io');
      eioClient = require('engine.io-client');
      minimatch = require('minimatch');
      log = require('./log');
      http = require('http').createServer();
      http.on('error', (function(_this) {
        return function(err) {
          if (err.code === 'EADDRINUSE') {
            _this.tryProxy(port);
          }
          return log(err);
        };
      })(this));
      http.listen(port, (function(_this) {
        return function() {
          _this.server = engine.attach(http);
          _this.server.on('connection', function(socket) {
            socket.send(JSON.stringify({
              imdone: 'ready'
            }));
            socket.on('message', function(msg) {
              return _this.onMessage(socket, msg);
            });
            return socket.on('close', function() {
              var editor, key, value;
              editor = (function() {
                var ref, results;
                ref = this.clients;
                results = [];
                for (key in ref) {
                  value = ref[key];
                  if (value === socket) {
                    results.push(key);
                  }
                }
                return results;
              }).call(_this);
              if (editor) {
                return delete _this.clients[editor];
              }
            });
          });
          _this.isListening = true;
          return _this.proxy = void 0;
        };
      })(this));
      return this;
    },
    tryProxy: function(port) {
      var socket;
      log('Trying proxy');
      socket = eioClient('ws://localhost:' + port);
      socket.on('open', (function(_this) {
        return function() {
          return socket.send(JSON.stringify({
            hello: 'imdone'
          }));
        };
      })(this));
      socket.on('message', (function(_this) {
        return function(json) {
          var msg;
          msg = JSON.parse(json);
          log('Proxy success');
          if (msg.imdone) {
            return _this.proxy = socket;
          }
        };
      })(this));
      return socket.on('close', (function(_this) {
        return function() {
          log('Proxy server closed connection.  Trying to start server');
          return _this.init(port);
        };
      })(this));
    },
    onMessage: function(socket, json) {
      var error, msg;
      try {
        msg = JSON.parse(json);
        if (msg.hello) {
          this.clients[msg.hello] = socket;
        }
        if (msg.isProxied) {
          this.openFile(msg.project, msg.path, msg.line, function() {});
        }
        return log('message received:', msg);
      } catch (error1) {
        error = error1;
      }
    },
    openFile: function(project, path, line, cb) {
      var editor, isProxied, socket;
      if (!this.getConfig().openIn.enable) {
        return cb();
      }
      editor = this.getEditor(path);
      socket = this.getSocket(editor);
      if (!socket) {
        return cb();
      }
      isProxied = this.proxy ? true : false;
      return socket.send(JSON.stringify({
        project: project,
        path: path,
        line: line,
        isProxied: isProxied
      }), function() {
        return cb(true);
      });
    },
    getEditor: function(path) {
      var editor, openIn, pattern;
      openIn = this.getConfig().openIn;
      for (editor in openIn) {
        pattern = openIn[editor];
        if (pattern && typeof pattern === 'string') {
          minimatch = require('minimatch');
          if (minimatch(path, pattern, {
            matchBase: true
          })) {
            return editor;
          }
        }
      }
      return "atom";
    },
    getSocket: function(editor) {
      var socket;
      if (this.proxy && editor !== 'atom') {
        return this.proxy;
      }
      socket = this.clients[editor];
      if (!(socket && this.server.clients[socket.id] === socket)) {
        return null;
      }
      return socket;
    },
    getConfig: function() {
      return configHelper.getSettings();
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2ltZG9uZS1hdG9tL2xpYi9zZXJ2aWNlcy9maWxlLXNlcnZpY2UuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQSxNQUFBLEdBQVk7O0VBQ1osU0FBQSxHQUFZOztFQUNaLFNBQUEsR0FBWTs7RUFDWixHQUFBLEdBQVk7O0VBQ1osWUFBQSxHQUFlLE9BQUEsQ0FBUSxpQkFBUjs7RUFHZixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsT0FBQSxFQUFTLEVBQVQ7SUFDQSxJQUFBLEVBQU0sU0FBQyxJQUFEO0FBQ0osVUFBQTtNQUFBLElBQUEsQ0FBZ0IsSUFBQyxDQUFBLFNBQUQsQ0FBQSxDQUFZLENBQUMsTUFBTSxDQUFDLE1BQXBDO0FBQUEsZUFBTyxLQUFQOztNQUNBLElBQVksSUFBQyxDQUFBLFdBQWI7QUFBQSxlQUFPLEtBQVA7O01BQ0EsTUFBQSxHQUFZLE9BQUEsQ0FBUSxXQUFSO01BQ1osU0FBQSxHQUFZLE9BQUEsQ0FBUSxrQkFBUjtNQUNaLFNBQUEsR0FBWSxPQUFBLENBQVEsV0FBUjtNQUNaLEdBQUEsR0FBWSxPQUFBLENBQVEsT0FBUjtNQUVaLElBQUEsR0FBTyxPQUFBLENBQVEsTUFBUixDQUFlLENBQUMsWUFBaEIsQ0FBQTtNQUNQLElBQUksQ0FBQyxFQUFMLENBQVEsT0FBUixFQUFpQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUMsR0FBRDtVQUNmLElBQUksR0FBRyxDQUFDLElBQUosS0FBWSxZQUFoQjtZQUVFLEtBQUMsQ0FBQSxRQUFELENBQVUsSUFBVixFQUZGOztpQkFHQSxHQUFBLENBQUksR0FBSjtRQUplO01BQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFqQjtNQUtBLElBQUksQ0FBQyxNQUFMLENBQVksSUFBWixFQUFrQixDQUFBLFNBQUEsS0FBQTtlQUFBLFNBQUE7VUFDaEIsS0FBQyxD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LENBekVYO0lBK0VBLFNBQUEsRUFBVyxTQUFBO2FBQU0sWUFBWSxDQUFDLFdBQWIsQ0FBQTtJQUFOLENBL0VYOztBQVJGIiwic291cmNlc0NvbnRlbnQiOlsiZW5naW5lICAgID0gbnVsbFxuZWlvQ2xpZW50ID0gbnVsbFxubWluaW1hdGNoID0gbnVsbFxubG9nICAgICAgID0gbnVsbFxuY29uZmlnSGVscGVyID0gcmVxdWlyZSAnLi9pbWRvbmUtY29uZmlnJ1xuXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgY2xpZW50czoge31cbiAgaW5pdDogKHBvcnQpIC0+XG4gICAgcmV0dXJuIEAgdW5sZXNzIEBnZXRDb25maWcoKS5vcGVuSW4uZW5hYmxlXG4gICAgcmV0dXJuIEAgaWYgQGlzTGlzdGVuaW5nXG4gICAgZW5naW5lICAgID0gcmVxdWlyZSAnZW5naW5lLmlvJ1xuICAgIGVpb0NsaWVudCA9IHJlcXVpcmUgJ2VuZ2luZS5pby1jbGllbnQnXG4gICAgbWluaW1hdGNoID0gcmVxdWlyZSAnbWluaW1hdGNoJ1xuICAgIGxvZyAgICAgICA9IHJlcXVpcmUgJy4vbG9nJ1xuXG4gICAgaHR0cCA9IHJlcXVpcmUoJ2h0dHAnKS5jcmVhdGVTZXJ2ZXIoKVxuICAgIGh0dHAub24gJ2Vycm9yJywgKGVycikgPT5cbiAgICAgIGlmIChlcnIuY29kZSA9PSAnRUFERFJJTlVTRScpXG4gICAgICAgICNjb25zb2xlLmxvZyAncG9ydCBpbiB1c2UnXG4gICAgICAgIEB0cnlQcm94eSBwb3J0XG4gICAgICBsb2cgZXJyXG4gICAgaHR0cC5saXN0ZW4gcG9ydCwgPT5cbiAgICAgIEBzZXJ2ZXIgPSBlbmdpbmUuYXR0YWNoKGh0dHApO1xuICAgICAgQHNlcnZlci5vbiAnY29ubmVjdGlvbicsIChzb2NrZXQpID0+XG4gICAgICAgIHNvY2tldC5zZW5kIEpTT04uc3RyaW5naWZ5KGltZG9uZTogJ3JlYWR5JylcbiAgICAgICAgc29ja2V0Lm9uICdtZXNzYWdlJywgKG1zZykgPT5cbiAgICAgICAgICBAb25NZXNzYWdlIHNvY2tldCwgbXNnXG4gICAgICAgIHNvY2tldC5vbiAnY2xvc2UnLCAoKSA9PlxuICAgICAgICAgIGVkaXRvciA9IChrZXkgZm9yIGtleSwgdmFsdWUgb2YgQGNsaWVudHMgd2hlbiB2YWx1ZSA9PSBzb2NrZXQpXG4gICAgICAgICAgZGVsZXRlIEBjbGllbnRzW2VkaXRvcl0gaWYgZWRpdG9yXG4gICAgICBAaXNMaXN0ZW5pbmcgPSB0cnVlXG4gICAgICBAcHJveHkgPSB1bmRlZmluZWRcbiAgICBAXG5cbiAgdHJ5UHJveHk6IChwb3J0KSAtPlxuXG5cbiAgICAjIEJBQ0tMT0c6IGlmIGltZG9uZSBpcyBub3QgbGlzdGVuaW5nIHdlIHNob3VsZCBhc2sgZm9yIGFub3RoZXIgcG9ydCBpc3N1ZTo1MiBnaDoyNTcgaWQ6NzlcbiAgICBsb2cgJ1RyeWluZyBwcm94eSdcbiAgICBzb2NrZXQgPSBlaW9DbGllbnQoJ3dzOi8vbG9jYWxob3N0OicgKyBwb3J0KVxuICAgIHNvY2tldC5vbiAnb3BlbicsID0+XG4gICAgICBzb2NrZXQuc2VuZCBKU09OLnN0cmluZ2lmeShoZWxsbzogJ2ltZG9uZScpXG4gICAgc29ja2V0Lm9uICdtZXNzYWdlJywgKGpzb24pID0+XG4gICAgICBtc2cgPSBKU09OLnBhcnNlIGpzb25cbiAgICAgIGxvZyAnUHJveHkgc3VjY2VzcydcbiAgICAgIEBwcm94eSA9IHNvY2tldCBpZiBtc2cuaW1kb25lXG4gICAgc29ja2V0Lm9uICdjbG9zZScsID0+XG4gICAgICBsb2cgJ1Byb3h5IHNlcnZlciBjbG9zZWQgY29ubmVjdGlvbi4gIFRyeWluZyB0byBzdGFydCBzZXJ2ZXInXG4gICAgICBAaW5pdCBwb3J0XG5cbiAgb25NZXNzYWdlOiAoc29ja2V0LCBqc29uKSAtPlxuICAgIHRyeVxuICAgICAgbXNnID0gSlNPTi5wYXJzZSBqc29uXG4gICAgICBpZiAobXNnLmhlbGxvKVxuICAgICAgICBAY2xpZW50c1ttc2cuaGVsbG9dID0gc29ja2V0XG4gICAgICBpZiAobXNnLmlzUHJveGllZClcbiAgICAgICAgQG9wZW5GaWxlIG1zZy5wcm9qZWN0LCBtc2cucGF0aCwgbXNnLmxpbmUsICgpIC0+XG4gICAgICBsb2cgJ21lc3NhZ2UgcmVjZWl2ZWQ6JywgbXNnXG4gICAgY2F0Y2ggZXJyb3JcbiAgICAgICNjb25zb2xlLmxvZyAnRXJyb3IgcmVjZWl2aW5nIG1lc3NhZ2U6JywganNvblxuXG4gIG9wZW5GaWxlOiAocHJvamVjdCwgcGF0aCwgbGluZSwgY2IpIC0+XG4gICAgcmV0dXJuIGNiKCkgdW5sZXNzIEBnZXRDb25maWcoKS5vcGVuSW4uZW5hYmxlXG4gICAgZWRpdG9yID0gQGdldEVkaXRvciBwYXRoXG5cbiAgICBzb2NrZXQgPSBAZ2V0U29ja2V0IGVkaXRvclxuICAgIHJldHVybiBjYigpIHVubGVzcyBzb2NrZXRcbiAgICBpc1Byb3hpZWQgPSBpZiBAcHJveHkgdGhlbiB0cnVlIGVsc2UgZmFsc2VcbiAgICBzb2NrZXQuc2VuZCBKU09OLnN0cmluZ2lmeSh7cHJvamVjdCwgcGF0aCwgbGluZSwgaXNQcm94aWVkfSksICgpIC0+XG4gICAgICBjYih0cnVlKVxuXG4gIGdldEVkaXRvcjogKHBhdGgpIC0+XG4gICAgb3BlbkluID0gQGdldENvbmZpZygpLm9wZW5JblxuICAgIGZvciBlZGl0b3IsIHBhdHRlcm4gb2Ygb3BlbkluXG4gICAgICBpZiBwYXR0ZXJuIGFuZCB0eXBlb2YgcGF0dGVybiBpcyAnc3RyaW5nJ1xuICAgICAgICBtaW5pbWF0Y2ggPSByZXF1aXJlICdtaW5pbWF0Y2gnXG4gICAgICAgIHJldHVybiBlZGl0b3IgaWYgbWluaW1hdGNoKHBhdGgsIHBhdHRlcm4sIHttYXRjaEJhc2U6IHRydWV9KVxuICAgIFwiYXRvbVwiXG5cbiAgZ2V0U29ja2V0OiAoZWRpdG9yKSAtPlxuICAgIHJldHVybiBAcHJveHkgaWYgQHByb3h5ICYmIGVkaXRvciAhPSAnYXRvbSdcbiAgICBzb2NrZXQgPSBAY2xpZW50c1tlZGl0b3JdXG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIHNvY2tldCAmJiBAc2VydmVyLmNsaWVudHNbc29ja2V0LmlkXSA9PSBzb2NrZXRcbiAgICBzb2NrZXRcblxuICBnZXRDb25maWc6ICgpIC0+IGNvbmZpZ0hlbHBlci5nZXRTZXR0aW5ncygpXG4iXX0=
