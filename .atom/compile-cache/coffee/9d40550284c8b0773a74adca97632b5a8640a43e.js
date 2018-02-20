(function() {
  var fuse;

  fuse = require("./fuse.js");

  module.exports = {
    selector: '.source.processing',
    funcs: [],
    loadFunctions: function() {
      var classes, classfunctions, classname, cls, func, funcname, functions, i, j, k, len, len1, properties, property;
      functions = require("../reference/functions.json");
      for (funcname in functions) {
        properties = functions[funcname];
        func = {};
        func.text = funcname;
        func.snippet = funcname + "(";
        for (i = j = 0, len = properties.length; j < len; i = ++j) {
          property = properties[i];
          if (i > 0) {
            func.snippet += ",";
          }
          func.snippet += "${" + (i + 1) + ":" + property + "}";
        }
        func.type = "function";
        func.snippet += ")";
        this.funcs.push(func);
      }
      classes = require("../reference/classes.json");
      for (classname in classes) {
        classfunctions = classes[classname];
        cls = {};
        cls.text = classname;
        cls.type = "class";
        this.funcs.push(cls);
        for (funcname in classfunctions) {
          properties = classfunctions[funcname];
          func = {};
          func.text = funcname;
          func.snippet = funcname + "(";
          func.leftLabel = classname + ".";
          for (i = k = 0, len1 = properties.length; k < len1; i = ++k) {
            property = properties[i];
            if (i > 0) {
              func.snippet += ",";
            }
            func.snippet += "${" + (i + 1) + ":" + property + "}";
          }
          func.type = "function";
          func.snippet += ")";
          this.funcs.push(func);
        }
      }
      return console.log(this.funcs);
    },
    getSuggestions: function(arg) {
      var bufferPosition, completions, editor, f, func, j, len, options, prefix, scopeDescriptor;
      editor = arg.editor, bufferPosition = arg.bufferPosition, scopeDescriptor = arg.scopeDescriptor, prefix = arg.prefix;
      completions = [];
      options = {
        keys: ['text'],
        threshold: 0.25
      };
      f = new fuse(this.funcs, options);
      completions = f.search(prefix);
      for (j = 0, len = completions.length; j < len; j++) {
        func = completions[j];
        func.replacementPrefix = prefix;
      }
      return completions;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL3Byb2Nlc3NpbmctYXV0b2NvbXBsZXRlL2xpYi9wcm9jZXNzaW5nLWF1dG9jb21wbGV0ZS1wcm92aWRlci5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFBLElBQUEsR0FBTyxPQUFBLENBQVEsV0FBUjs7RUFDUCxNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsUUFBQSxFQUFVLG9CQUFWO0lBRUEsS0FBQSxFQUFPLEVBRlA7SUFJQSxhQUFBLEVBQWUsU0FBQTtBQUNiLFVBQUE7TUFBQSxTQUFBLEdBQVksT0FBQSxDQUFRLDZCQUFSO0FBQ1osV0FBQSxxQkFBQTs7UUFDRSxJQUFBLEdBQU87UUFDUCxJQUFJLENBQUMsSUFBTCxHQUFZO1FBQ1osSUFBSSxDQUFDLE9BQUwsR0FBZSxRQUFBLEdBQVM7QUFDeEIsYUFBQSxvREFBQTs7VUFDRSxJQUFHLENBQUEsR0FBRSxDQUFMO1lBQ0UsSUFBSSxDQUFDLE9BQUwsSUFBZ0IsSUFEbEI7O1VBRUEsSUFBSSxDQUFDLE9BQUwsSUFBZ0IsSUFBQSxHQUFLLENBQUMsQ0FBQSxHQUFFLENBQUgsQ0FBTCxHQUFXLEdBQVgsR0FBZSxRQUFmLEdBQXdCO0FBSDFDO1FBSUEsSUFBSSxDQUFDLElBQUwsR0FBWTtRQUNaLElBQUksQ0FBQyxPQUFMLElBQWM7UUFDZCxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxJQUFaO0FBVkY7TUFXQSxPQUFBLEdBQVUsT0FBQSxDQUFRLDJCQUFSO0FBQ1YsV0FBQSxvQkFBQTs7UUFDRSxHQUFBLEdBQU07UUFDTixHQUFHLENBQUMsSUFBSixHQUFXO1FBQ1gsR0FBRyxDQUFDLElBQUosR0FBVztRQUNYLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFZLEdBQVo7QUFDQSxhQUFBLDBCQUFBOztVQUNFLElBQUEsR0FBTztVQUNQLElBQUksQ0FBQyxJQUFMLEdBQVk7VUFDWixJQUFJLENBQUMsT0FBTCxHQUFlLFFBQUEsR0FBUztVQUN4QixJQUFJLENBQUMsU0FBTCxHQUFpQixTQUFBLEdBQVU7QUFDM0IsZUFBQSxzREFBQTs7WUFDRSxJQUFHLENBQUEsR0FBRSxDQUFMO2NBQ0UsSUFBSSxDQUFDLE9BQUwsSUFBZ0IsSUFEbEI7O1lBRUEsSUFBSSxDQUFDLE9BQUwsSUFBZ0IsSUFBQSxHQUFLLENBQUMsQ0FBQSxHQUFFLENBQUgsQ0FBTCxHQUFXLEdBQVgsR0FBZSxRQUFmLEdBQXdCO0FBSDFDO1VBSUEsSUFBSSxDQUFDLElBQUwsR0FBWTtVQUNaLElBQUksQ0FBQyxPQUFMLElBQWM7VUFDZCxJQUFDLENBQUEsS0FBSyxDQUFDLElBQVAsQ0FBWSxJQUFaO0FBWEY7QUFMRjthQW1CQSxPQUFPLENBQUMsR0FBUixDQUFZLElBQUMsQ0FBQSxLQUFiO0lBakNhLENBSmY7SUF1Q0EsY0FBQSxFQUFnQixTQUFDLEdBQUQ7QUFDZCxVQUFBO01BRGdCLHFCQUFRLHFDQUFnQix1Q0FBaUI7TUFDekQsV0FBQSxHQUFjO01BQ2QsT0FBQSxHQUFVO1FBQ1IsSUFBQSxFQUFNLENBQUMsTUFBRCxDQURFO1FBRVIsU0FBQSxFQUFXLElBRkg7O01BSVYsQ0FBQSxHQUFJLElBQUksSUFBSixDQUFTLElBQUMsQ0FBQSxLQUFWLEVBQWlCLE9BQWpCO01BQ0osV0FBQSxHQUFjLENBQUMsQ0FBQyxNQUFGLENBQVMsTUFBVDtBQUNkLFdBQUEsNkNBQUE7O1FBQ0UsSUFBSSxDQUFDLGlCQUFMLEdBQXlCO0FBRDNCO2FBRUE7SUFWYyxDQXZDaEI7O0FBRkYiLCJzb3VyY2VzQ29udGVudCI6WyJmdXNlID0gcmVxdWlyZShcIi4vZnVzZS5qc1wiKVxubW9kdWxlLmV4cG9ydHMgPVxuICBzZWxlY3RvcjogJy5zb3VyY2UucHJvY2Vzc2luZydcblxuICBmdW5jczogW11cblxuICBsb2FkRnVuY3Rpb25zOiAtPlxuICAgIGZ1bmN0aW9ucyA9IHJlcXVpcmUoXCIuLi9yZWZlcmVuY2UvZnVuY3Rpb25zLmpzb25cIilcbiAgICBmb3IgZnVuY25hbWUscHJvcGVydGllcyBvZiBmdW5jdGlvbnNcbiAgICAgIGZ1bmMgPSB7fVxuICAgICAgZnVuYy50ZXh0ID0gZnVuY25hbWVcbiAgICAgIGZ1bmMuc25pcHBldCA9IGZ1bmNuYW1lK1wiKFwiXG4gICAgICBmb3IgcHJvcGVydHksaSBpbiBwcm9wZXJ0aWVzXG4gICAgICAgIGlmKGk+MClcbiAgICAgICAgICBmdW5jLnNuaXBwZXQgKz0gXCIsXCJcbiAgICAgICAgZnVuYy5zbmlwcGV0ICs9IFwiJHtcIisoaSsxKStcIjpcIitwcm9wZXJ0eStcIn1cIlxuICAgICAgZnVuYy50eXBlID0gXCJmdW5jdGlvblwiXG4gICAgICBmdW5jLnNuaXBwZXQrPVwiKVwiXG4gICAgICBAZnVuY3MucHVzaChmdW5jKVxuICAgIGNsYXNzZXMgPSByZXF1aXJlKFwiLi4vcmVmZXJlbmNlL2NsYXNzZXMuanNvblwiKVxuICAgIGZvciBjbGFzc25hbWUsY2xhc3NmdW5jdGlvbnMgb2YgY2xhc3Nlc1xuICAgICAgY2xzID0ge31cbiAgICAgIGNscy50ZXh0ID0gY2xhc3NuYW1lXG4gICAgICBjbHMudHlwZSA9IFwiY2xhc3NcIlxuICAgICAgQGZ1bmNzLnB1c2goY2xzKVxuICAgICAgZm9yIGZ1bmNuYW1lLHByb3BlcnRpZXMgb2YgY2xhc3NmdW5jdGlvbnNcbiAgICAgICAgZnVuYyA9IHt9XG4gICAgICAgIGZ1bmMudGV4dCA9IGZ1bmNuYW1lXG4gICAgICAgIGZ1bmMuc25pcHBldCA9IGZ1bmNuYW1lK1wiKFwiXG4gICAgICAgIGZ1bmMubGVmdExhYmVsID0gY2xhc3NuYW1lK1wiLlwiXG4gICAgICAgIGZvciBwcm9wZXJ0eSxpIGluIHByb3BlcnRpZXNcbiAgICAgICAgICBpZihpPjApXG4gICAgICAgICAgICBmdW5jLnNuaXBwZXQgKz0gXCIsXCJcbiAgICAgICAgICBmdW5jLnNuaXBwZXQgKz0gXCIke1wiKyhpKzEpK1wiOlwiK3Byb3BlcnR5K1wifVwiXG4gICAgICAgIGZ1bmMudHlwZSA9IFwiZnVuY3Rpb25cIlxuICAgICAgICBmdW5jLnNuaXBwZXQrPVwiKVwiXG4gICAgICAgIEBmdW5jcy5wdXNoKGZ1bmMpXG5cblxuICAgIGNvbnNvbGUubG9nKEBmdW5jcylcblxuICBnZXRTdWdnZXN0aW9uczogKHtlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uLCBzY29wZURlc2NyaXB0b3IsIHByZWZpeH0pIC0+XG4gICAgY29tcGxldGlvbnMgPSBbXVxuICAgIG9wdGlvbnMgPSB7XG4gICAgICBrZXlzOiBbJ3RleHQnXSxcbiAgICAgIHRocmVzaG9sZDogMC4yNVxuICAgIH1cbiAgICBmID0gbmV3IGZ1c2UoQGZ1bmNzLCBvcHRpb25zKVxuICAgIGNvbXBsZXRpb25zID0gZi5zZWFyY2gocHJlZml4KVxuICAgIGZvciBmdW5jIGluIGNvbXBsZXRpb25zXG4gICAgICBmdW5jLnJlcGxhY2VtZW50UHJlZml4ID0gcHJlZml4XG4gICAgY29tcGxldGlvbnNcbiJdfQ==
