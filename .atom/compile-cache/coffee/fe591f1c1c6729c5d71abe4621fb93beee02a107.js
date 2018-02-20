(function() {
  var GrammarUtils, command, windows;

  command = (GrammarUtils = require('../grammar-utils')).command;

  windows = GrammarUtils.OperatingSystem.isWindows();

  module.exports = {
    BuckleScript: {
      'Selection Based': {
        command: 'bsc',
        args: function(context) {
          var code, tmpFile;
          code = context.getCode();
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return ['-c', tmpFile];
        }
      },
      'File Based': {
        command: 'bsc',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return ['-c', filepath];
        }
      }
    },
    OCaml: {
      'File Based': {
        command: 'ocaml',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return [filepath];
        }
      }
    },
    Reason: {
      'File Based': {
        command: command,
        args: function(arg) {
          var file, filename;
          filename = arg.filename;
          file = filename.replace(/\.re$/, '.native');
          return GrammarUtils.formatArgs("rebuild '" + file + "' && '" + file + "'");
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvZ3JhbW1hcnMvbWwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQUEsTUFBQTs7RUFBQyxVQUFXLENBQUEsWUFBQSxHQUFlLE9BQUEsQ0FBUSxrQkFBUixDQUFmOztFQUVaLE9BQUEsR0FBVSxZQUFZLENBQUMsZUFBZSxDQUFDLFNBQTdCLENBQUE7O0VBRVYsTUFBTSxDQUFDLE9BQVAsR0FFRTtJQUFBLFlBQUEsRUFDRTtNQUFBLGlCQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsS0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLE9BQUQ7QUFDSixjQUFBO1VBQUEsSUFBQSxHQUFPLE9BQU8sQ0FBQyxPQUFSLENBQUE7VUFDUCxPQUFBLEdBQVUsWUFBWSxDQUFDLHNCQUFiLENBQW9DLElBQXBDO0FBQ1YsaUJBQU8sQ0FBQyxJQUFELEVBQU8sT0FBUDtRQUhILENBRE47T0FERjtNQU9BLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxLQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsR0FBRDtBQUFnQixjQUFBO1VBQWQsV0FBRDtpQkFBZSxDQUFDLElBQUQsRUFBTyxRQUFQO1FBQWhCLENBRE47T0FSRjtLQURGO0lBWUEsS0FBQSxFQUNFO01BQUEsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE9BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxHQUFEO0FBQWdCLGNBQUE7VUFBZCxXQUFEO2lCQUFlLENBQUMsUUFBRDtRQUFoQixDQUROO09BREY7S0FiRjtJQWlCQSxNQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQWM7UUFDWixTQUFBLE9BRFk7UUFFWixJQUFBLEVBQU0sU0FBQyxHQUFEO0FBQ0osY0FBQTtVQURNLFdBQUQ7VUFDTCxJQUFBLEdBQU8sUUFBUSxDQUFDLE9BQVQsQ0FBaUIsT0FBakIsRUFBMEIsU0FBMUI7aUJBQ1AsWUFBWSxDQUFDLFVBQWIsQ0FBd0IsV0FBQSxHQUFZLElBQVosR0FBaUIsUUFBakIsR0FBeUIsSUFBekIsR0FBOEIsR0FBdEQ7UUFGSSxDQUZNO09BQWQ7S0FsQkY7O0FBTkYiLCJzb3VyY2VzQ29udGVudCI6WyJ7Y29tbWFuZH0gPSBHcmFtbWFyVXRpbHMgPSByZXF1aXJlICcuLi9ncmFtbWFyLXV0aWxzJ1xuXG53aW5kb3dzID0gR3JhbW1hclV0aWxzLk9wZXJhdGluZ1N5c3RlbS5pc1dpbmRvd3MoKVxuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgQnVja2xlU2NyaXB0OlxuICAgICdTZWxlY3Rpb24gQmFzZWQnOlxuICAgICAgY29tbWFuZDogJ2JzYydcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBjb2RlID0gY29udGV4dC5nZXRDb2RlKClcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUpXG4gICAgICAgIHJldHVybiBbJy1jJywgdG1wRmlsZV1cblxuICAgICdGaWxlIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdic2MnXG4gICAgICBhcmdzOiAoe2ZpbGVwYXRofSkgLT4gWyctYycsIGZpbGVwYXRoXVxuXG4gIE9DYW1sOlxuICAgICdGaWxlIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdvY2FtbCdcbiAgICAgIGFyZ3M6ICh7ZmlsZXBhdGh9KSAtPiBbZmlsZXBhdGhdXG5cbiAgUmVhc29uOlxuICAgICdGaWxlIEJhc2VkJzoge1xuICAgICAgY29tbWFuZFxuICAgICAgYXJnczogKHtmaWxlbmFtZX0pIC0+XG4gICAgICAgIGZpbGUgPSBmaWxlbmFtZS5yZXBsYWNlIC9cXC5yZSQvLCAnLm5hdGl2ZSdcbiAgICAgICAgR3JhbW1hclV0aWxzLmZvcm1hdEFyZ3MoXCJyZWJ1aWxkICcje2ZpbGV9JyAmJiAnI3tmaWxlfSdcIilcbiAgICB9XG4iXX0=
