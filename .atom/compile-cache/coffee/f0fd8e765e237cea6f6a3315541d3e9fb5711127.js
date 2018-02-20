(function() {
  var ContextMenu, FindAndReplace, JapaneseMenu, Menu, Preferences,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  Menu = require('./menu');

  ContextMenu = require('./context-menu');

  Preferences = require('./preferences');

  FindAndReplace = require('./findandreplace');

  JapaneseMenu = (function() {
    JapaneseMenu.prototype.pref = {
      done: false
    };

    function JapaneseMenu() {
      this.delay = bind(this.delay, this);
      this.defM = require("../def/menu_" + process.platform);
      this.defC = require("../def/context");
      this.defS = require("../def/settings");
      this.defF = require("../def/findandreplace");
    }

    JapaneseMenu.prototype.activate = function(state) {
      return setTimeout(this.delay, 0);
    };

    JapaneseMenu.prototype.delay = function() {
      Menu.localize(this.defM);
      ContextMenu.localize(this.defC);
      Preferences.localize(this.defS);
      return FindAndReplace.localize(this.defF);
    };

    return JapaneseMenu;

  })();

  module.exports = window.JapaneseMenu = new JapaneseMenu();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2phcGFuZXNlLW1lbnUvbGliL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQSw0REFBQTtJQUFBOztFQUFBLElBQUEsR0FBYyxPQUFBLENBQVEsUUFBUjs7RUFDZCxXQUFBLEdBQWMsT0FBQSxDQUFRLGdCQUFSOztFQUNkLFdBQUEsR0FBYyxPQUFBLENBQVEsZUFBUjs7RUFDZCxjQUFBLEdBQWlCLE9BQUEsQ0FBUSxrQkFBUjs7RUFFWDsyQkFFSixJQUFBLEdBQU07TUFBQyxJQUFBLEVBQU0sS0FBUDs7O0lBRU8sc0JBQUE7O01BQ1gsSUFBQyxDQUFBLElBQUQsR0FBUSxPQUFBLENBQVEsY0FBQSxHQUFlLE9BQU8sQ0FBQyxRQUEvQjtNQUNSLElBQUMsQ0FBQSxJQUFELEdBQVEsT0FBQSxDQUFRLGdCQUFSO01BQ1IsSUFBQyxDQUFBLElBQUQsR0FBUSxPQUFBLENBQVEsaUJBQVI7TUFDUixJQUFDLENBQUEsSUFBRCxHQUFRLE9BQUEsQ0FBUSx1QkFBUjtJQUpHOzsyQkFNYixRQUFBLEdBQVUsU0FBQyxLQUFEO2FBQ1IsVUFBQSxDQUFXLElBQUMsQ0FBQSxLQUFaLEVBQW1CLENBQW5CO0lBRFE7OzJCQUdWLEtBQUEsR0FBTyxTQUFBO01BQ0wsSUFBSSxDQUFDLFFBQUwsQ0FBYyxJQUFDLENBQUEsSUFBZjtNQUNBLFdBQVcsQ0FBQyxRQUFaLENBQXFCLElBQUMsQ0FBQSxJQUF0QjtNQUNBLFdBQVcsQ0FBQyxRQUFaLENBQXFCLElBQUMsQ0FBQSxJQUF0QjthQUNBLGNBQWMsQ0FBQyxRQUFmLENBQXdCLElBQUMsQ0FBQSxJQUF6QjtJQUpLOzs7Ozs7RUFNVCxNQUFNLENBQUMsT0FBUCxHQUFpQixNQUFNLENBQUMsWUFBUCxHQUFzQixJQUFJLFlBQUosQ0FBQTtBQXhCdkMiLCJzb3VyY2VzQ29udGVudCI6WyJNZW51ICAgICAgICA9IHJlcXVpcmUgJy4vbWVudSdcbkNvbnRleHRNZW51ID0gcmVxdWlyZSAnLi9jb250ZXh0LW1lbnUnXG5QcmVmZXJlbmNlcyA9IHJlcXVpcmUgJy4vcHJlZmVyZW5jZXMnXG5GaW5kQW5kUmVwbGFjZSA9IHJlcXVpcmUgJy4vZmluZGFuZHJlcGxhY2UnXG5cbmNsYXNzIEphcGFuZXNlTWVudVxuXG4gIHByZWY6IHtkb25lOiBmYWxzZX1cblxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAZGVmTSA9IHJlcXVpcmUgXCIuLi9kZWYvbWVudV8je3Byb2Nlc3MucGxhdGZvcm19XCJcbiAgICBAZGVmQyA9IHJlcXVpcmUgXCIuLi9kZWYvY29udGV4dFwiXG4gICAgQGRlZlMgPSByZXF1aXJlIFwiLi4vZGVmL3NldHRpbmdzXCJcbiAgICBAZGVmRiA9IHJlcXVpcmUgXCIuLi9kZWYvZmluZGFuZHJlcGxhY2VcIlxuXG4gIGFjdGl2YXRlOiAoc3RhdGUpIC0+XG4gICAgc2V0VGltZW91dChAZGVsYXksIDApXG5cbiAgZGVsYXk6ICgpID0+XG4gICAgTWVudS5sb2NhbGl6ZShAZGVmTSlcbiAgICBDb250ZXh0TWVudS5sb2NhbGl6ZShAZGVmQylcbiAgICBQcmVmZXJlbmNlcy5sb2NhbGl6ZShAZGVmUylcbiAgICBGaW5kQW5kUmVwbGFjZS5sb2NhbGl6ZShAZGVmRilcblxubW9kdWxlLmV4cG9ydHMgPSB3aW5kb3cuSmFwYW5lc2VNZW51ID0gbmV3IEphcGFuZXNlTWVudSgpXG4iXX0=
