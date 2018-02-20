(function() {
  var GrammarUtils, OperatingSystem, base, command, os, path, ref, ref1, ref2, ref3, windows;

  path = require('path');

  ref = GrammarUtils = require('../grammar-utils'), OperatingSystem = ref.OperatingSystem, command = ref.command;

  os = OperatingSystem.platform();

  windows = OperatingSystem.isWindows();

  module.exports = {
    '1C (BSL)': {
      'File Based': {
        command: 'oscript',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return ['-encoding=utf-8', filepath];
        }
      }
    },
    Ansible: {
      'File Based': {
        command: 'ansible-playbook',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return [filepath];
        }
      }
    },
    Clojure: {
      'Selection Based': {
        command: 'lein',
        args: function(context) {
          return ['exec', '-e', context.getCode()];
        }
      },
      'File Based': {
        command: 'lein',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return ['exec', filepath];
        }
      }
    },
    Crystal: {
      'Selection Based': {
        command: 'crystal',
        args: function(context) {
          return ['eval', context.getCode()];
        }
      },
      'File Based': {
        command: 'crystal',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return [filepath];
        }
      }
    },
    D: {
      'Selection Based': {
        command: 'rdmd',
        args: function(context) {
          var code, tmpFile;
          code = context.getCode();
          tmpFile = GrammarUtils.D.createTempFileWithCode(code);
          return [tmpFile];
        }
      },
      'File Based': {
        command: 'rdmd',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return [filepath];
        }
      }
    },
    Elixir: {
      'Selection Based': {
        command: 'elixir',
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      'File Based': {
        command: 'elixir',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return ['-r', filepath];
        }
      }
    },
    Erlang: {
      'Selection Based': {
        command: 'erl',
        args: function(context) {
          return ['-noshell', '-eval', (context.getCode()) + ", init:stop()."];
        }
      }
    },
    'F*': {
      'File Based': {
        command: 'fstar',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return [filepath];
        }
      }
    },
    'F#': {
      'File Based': {
        command: windows ? 'fsi' : 'fsharpi',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return ['--exec', filepath];
        }
      }
    },
    Forth: {
      'File Based': {
        command: 'gforth',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return [filepath];
        }
      }
    },
    Gherkin: {
      'File Based': {
        command: 'cucumber',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return ['--color', filepath];
        }
      },
      'Line Number Based': {
        command: 'cucumber',
        args: function(context) {
          return ['--color', context.fileColonLine()];
        }
      }
    },
    Go: {
      'File Based': {
        command: 'go',
        workingDirectory: (ref1 = atom.workspace.getActivePaneItem()) != null ? (ref2 = ref1.buffer) != null ? (ref3 = ref2.file) != null ? typeof ref3.getParent === "function" ? typeof (base = ref3.getParent()).getPath === "function" ? base.getPath() : void 0 : void 0 : void 0 : void 0 : void 0,
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          if (filepath.match(/_test.go/)) {
            return ['test', ''];
          } else {
            return ['run', filepath];
          }
        }
      }
    },
    Groovy: {
      'Selection Based': {
        command: 'groovy',
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      'File Based': {
        command: 'groovy',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return [filepath];
        }
      }
    },
    Hy: {
      'Selection Based': {
        command: 'hy',
        args: function(context) {
          var code, tmpFile;
          code = context.getCode();
          tmpFile = GrammarUtils.createTempFileWithCode(code, '.hy');
          return [tmpFile];
        }
      },
      'File Based': {
        command: 'hy',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return [filepath];
        }
      }
    },
    Idris: {
      'File Based': {
        command: 'idris',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return [filepath, '-o', path.basename(filepath, path.extname(filepath))];
        }
      }
    },
    InnoSetup: {
      'File Based': {
        command: 'ISCC.exe',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return ['/Q', filepath];
        }
      }
    },
    ioLanguage: {
      'Selection Based': {
        command: 'io',
        args: function(context) {
          return [context.getCode()];
        }
      },
      'File Based': {
        command: 'io',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return ['-e', filepath];
        }
      }
    },
    Jolie: {
      'File Based': {
        command: 'jolie',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return [filepath];
        }
      }
    },
    Julia: {
      'Selection Based': {
        command: 'julia',
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      'File Based': {
        command: 'julia',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return [filepath];
        }
      }
    },
    LAMMPS: os === 'darwin' || os === 'linux' ? {
      'File Based': {
        command: 'lammps',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return ['-log', 'none', '-in', filepath];
        }
      }
    } : void 0,
    LilyPond: {
      'File Based': {
        command: 'lilypond',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return [filepath];
        }
      }
    },
    LiveScript: {
      'Selection Based': {
        command: 'lsc',
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      'File Based': {
        command: 'lsc',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return [filepath];
        }
      }
    },
    Makefile: {
      'Selection Based': {
        command: 'bash',
        args: function(context) {
          return ['-c', context.getCode()];
        }
      },
      'File Based': {
        command: 'make',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return ['-f', filepath];
        }
      }
    },
    MATLAB: {
      'Selection Based': {
        command: 'matlab',
        args: function(context) {
          var code, tmpFile;
          code = context.getCode();
          tmpFile = GrammarUtils.MATLAB.createTempFileWithCode(code);
          return ['-nodesktop', '-nosplash', '-r', "try, run('" + tmpFile + "'); while ~isempty(get(0,'Children')); pause(0.5); end; catch ME; disp(ME.message); exit(1); end; exit(0);"];
        }
      },
      'File Based': {
        command: 'matlab',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return ['-nodesktop', '-nosplash', '-r', "try run('" + filepath + "'); while ~isempty(get(0,'Children')); pause(0.5); end; catch ME; disp(ME.message); exit(1); end; exit(0);"];
        }
      }
    },
    'MIPS Assembler': {
      'File Based': {
        command: 'spim',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return ['-f', filepath];
        }
      }
    },
    NCL: {
      'Selection Based': {
        command: 'ncl',
        args: function(context) {
          var code, tmpFile;
          code = context.getCode() + '\n\nexit';
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return [tmpFile];
        }
      },
      'File Based': {
        command: 'ncl',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return [filepath];
        }
      }
    },
    Nim: {
      'File Based': {
        command: command,
        args: function(arg) {
          var commands, dir, file, filepath;
          filepath = arg.filepath;
          file = GrammarUtils.Nim.findNimProjectFile(filepath);
          dir = GrammarUtils.Nim.projectDir(filepath);
          commands = "cd '" + dir + "' && nim c --hints:off --parallelBuild:1 -r '" + file + "' 2>&1";
          return GrammarUtils.formatArgs(commands);
        }
      }
    },
    NSIS: {
      'Selection Based': {
        command: 'makensis',
        args: function(context) {
          var code, tmpFile;
          code = context.getCode();
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return [tmpFile];
        }
      },
      'File Based': {
        command: 'makensis',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return [filepath];
        }
      }
    },
    Octave: {
      'Selection Based': {
        command: 'octave',
        args: function(context) {
          var dir;
          dir = path.dirname(context.filepath);
          return ['-p', path.dirname(context.filepath), '--eval', context.getCode()];
        }
      },
      'File Based': {
        command: 'octave',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return ['-p', path.dirname(filepath), filepath];
        }
      }
    },
    Oz: {
      'Selection Based': {
        command: 'ozc',
        args: function(context) {
          var code, tmpFile;
          code = context.getCode();
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return ['-c', tmpFile];
        }
      },
      'File Based': {
        command: 'ozc',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return ['-c', filepath];
        }
      }
    },
    Pascal: {
      'Selection Based': {
        command: 'fsc',
        args: function(context) {
          var code, tmpFile;
          code = context.getCode();
          tmpFile = GrammarUtils.createTempFileWithCode(code);
          return [tmpFile];
        }
      },
      'File Based': {
        command: 'fsc',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return [filepath];
        }
      }
    },
    Prolog: {
      'File Based': {
        command: command,
        args: function(arg) {
          var commands, dir, filepath;
          filepath = arg.filepath;
          dir = path.dirname(filepath);
          commands = "cd '" + dir + "'; swipl -f '" + filepath + "' -t main --quiet";
          return GrammarUtils.formatArgs(commands);
        }
      }
    },
    PureScript: {
      'File Based': {
        command: command,
        args: function(arg) {
          var dir, filepath;
          filepath = arg.filepath;
          dir = path.dirname(filepath);
          return GrammarUtils.formatArgs("cd '" + dir + "' && pulp run");
        }
      }
    },
    R: {
      'Selection Based': {
        command: 'Rscript',
        args: function(context) {
          var code, tmpFile;
          code = context.getCode();
          tmpFile = GrammarUtils.R.createTempFileWithCode(code);
          return [tmpFile];
        }
      },
      'File Based': {
        command: 'Rscript',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return [filepath];
        }
      }
    },
    Racket: {
      'Selection Based': {
        command: 'racket',
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      'File Based': {
        command: 'racket',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return [filepath];
        }
      }
    },
    "Ren'Py": {
      'File Based': {
        command: 'renpy',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return [filepath.substr(0, filepath.lastIndexOf('/game'))];
        }
      }
    },
    'Robot Framework': {
      'File Based': {
        command: 'robot',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return [filepath];
        }
      }
    },
    Rust: {
      'File Based': {
        command: command,
        args: function(arg) {
          var filename, filepath;
          filepath = arg.filepath, filename = arg.filename;
          if (windows) {
            return ["/c rustc " + filepath + " && " + filename.slice(0, -3) + ".exe"];
          } else {
            return ['-c', "rustc '" + filepath + "' -o /tmp/rs.out && /tmp/rs.out"];
          }
        }
      }
    },
    Scala: {
      'Selection Based': {
        command: 'scala',
        args: function(context) {
          return ['-e', context.getCode()];
        }
      },
      'File Based': {
        command: 'scala',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return [filepath];
        }
      }
    },
    Stata: {
      'Selection Based': {
        command: 'stata',
        args: function(context) {
          return ['do', context.getCode()];
        }
      },
      'File Based': {
        command: 'stata',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return ['do', filepath];
        }
      }
    },
    Turing: {
      'File Based': {
        command: 'turing',
        args: function(arg) {
          var filepath;
          filepath = arg.filepath;
          return ['-run', filepath];
        }
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL3NjcmlwdC9saWIvZ3JhbW1hcnMvaW5kZXguY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUdBO0FBQUEsTUFBQTs7RUFBQSxJQUFBLEdBQU8sT0FBQSxDQUFRLE1BQVI7O0VBQ1AsTUFBNkIsWUFBQSxHQUFlLE9BQUEsQ0FBUSxrQkFBUixDQUE1QyxFQUFDLHFDQUFELEVBQWtCOztFQUVsQixFQUFBLEdBQUssZUFBZSxDQUFDLFFBQWhCLENBQUE7O0VBQ0wsT0FBQSxHQUFVLGVBQWUsQ0FBQyxTQUFoQixDQUFBOztFQUVWLE1BQU0sQ0FBQyxPQUFQLEdBQ0U7SUFBQSxVQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsU0FBVDtRQUNBLElBQUEsRUFBTSxTQUFDLEdBQUQ7QUFBZ0IsY0FBQTtVQUFkLFdBQUQ7aUJBQWUsQ0FBQyxpQkFBRCxFQUFvQixRQUFwQjtRQUFoQixDQUROO09BREY7S0FERjtJQUtBLE9BQUEsRUFDRTtNQUFBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxrQkFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLEdBQUQ7QUFBZ0IsY0FBQTtVQUFkLFdBQUQ7aUJBQWUsQ0FBQyxRQUFEO1FBQWhCLENBRE47T0FERjtLQU5GO0lBVUEsT0FBQSxFQUNFO01BQUEsaUJBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxNQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsT0FBRDtpQkFBYSxDQUFDLE1BQUQsRUFBUyxJQUFULEVBQWUsT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFmO1FBQWIsQ0FETjtPQURGO01BR0EsWUFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE1BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxHQUFEO0FBQWdCLGNBQUE7VUFBZCxXQUFEO2lCQUFlLENBQUMsTUFBRCxFQUFTLFFBQVQ7UUFBaEIsQ0FETjtPQUpGO0tBWEY7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QUQ7aUJBQWUsQ0FBQyxRQUFEO1FBQWhCLENBRE47T0FKRjtLQW5TRjtJQTBTQSxLQUFBLEVBQ0U7TUFBQSxpQkFBQSxFQUNFO1FBQUEsT0FBQSxFQUFTLE9BQVQ7UUFDQSxJQUFBLEVBQU0sU0FBQyxPQUFEO2lCQUFhLENBQUMsSUFBRCxFQUFPLE9BQU8sQ0FBQyxPQUFSLENBQUEsQ0FBUDtRQUFiLENBRE47T0FERjtNQUdBLFlBQUEsRUFDRTtRQUFBLE9BQUEsRUFBUyxPQUFUO1FBQ0EsSUFBQSxFQUFNLFNBQUMsR0FBRDtBQUFnQixjQUFBO1VBQWQsV0FBRDtpQkFBZSxDQUFDLElBQUQsRUFBTyxRQUFQO1FBQWhCLENBRE47T0FKRjtLQTNTRjtJQWtUQSxNQUFBLEVBQ0U7TUFBQSxZQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQVMsUUFBVDtRQUNBLElBQUEsRUFBTSxTQUFDLEdBQUQ7QUFBZ0IsY0FBQTtVQUFkLFdBQUQ7aUJBQWUsQ0FBQyxNQUFELEVBQVMsUUFBVDtRQUFoQixDQUROO09BREY7S0FuVEY7O0FBUEYiLCJzb3VyY2VzQ29udGVudCI6WyIjIE1hcHMgQXRvbSBHcmFtbWFyIG5hbWVzIHRvIHRoZSBjb21tYW5kIHVzZWQgYnkgdGhhdCBsYW5ndWFnZVxuIyBBcyB3ZWxsIGFzIGFueSBzcGVjaWFsIHNldHVwIGZvciBhcmd1bWVudHMuXG5cbnBhdGggPSByZXF1aXJlICdwYXRoJ1xue09wZXJhdGluZ1N5c3RlbSwgY29tbWFuZH0gPSBHcmFtbWFyVXRpbHMgPSByZXF1aXJlICcuLi9ncmFtbWFyLXV0aWxzJ1xuXG5vcyA9IE9wZXJhdGluZ1N5c3RlbS5wbGF0Zm9ybSgpXG53aW5kb3dzID0gT3BlcmF0aW5nU3lzdGVtLmlzV2luZG93cygpXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgJzFDIChCU0wpJzpcbiAgICAnRmlsZSBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAnb3NjcmlwdCdcbiAgICAgIGFyZ3M6ICh7ZmlsZXBhdGh9KSAtPiBbJy1lbmNvZGluZz11dGYtOCcsIGZpbGVwYXRoXVxuXG4gIEFuc2libGU6XG4gICAgJ0ZpbGUgQmFzZWQnOlxuICAgICAgY29tbWFuZDogJ2Fuc2libGUtcGxheWJvb2snXG4gICAgICBhcmdzOiAoe2ZpbGVwYXRofSkgLT4gW2ZpbGVwYXRoXVxuXG4gIENsb2p1cmU6XG4gICAgJ1NlbGVjdGlvbiBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAnbGVpbidcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPiBbJ2V4ZWMnLCAnLWUnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICAnRmlsZSBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAnbGVpbidcbiAgICAgIGFyZ3M6ICh7ZmlsZXBhdGh9KSAtPiBbJ2V4ZWMnLCBmaWxlcGF0aF1cblxuICBDcnlzdGFsOlxuICAgICdTZWxlY3Rpb24gQmFzZWQnOlxuICAgICAgY29tbWFuZDogJ2NyeXN0YWwnXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWydldmFsJywgY29udGV4dC5nZXRDb2RlKCldXG4gICAgJ0ZpbGUgQmFzZWQnOlxuICAgICAgY29tbWFuZDogJ2NyeXN0YWwnXG4gICAgICBhcmdzOiAoe2ZpbGVwYXRofSkgLT4gW2ZpbGVwYXRoXVxuXG4gIEQ6XG4gICAgJ1NlbGVjdGlvbiBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAncmRtZCdcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBjb2RlID0gY29udGV4dC5nZXRDb2RlKClcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5ELmNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSlcbiAgICAgICAgcmV0dXJuIFt0bXBGaWxlXVxuICAgICdGaWxlIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdyZG1kJ1xuICAgICAgYXJnczogKHtmaWxlcGF0aH0pIC0+IFtmaWxlcGF0aF1cblxuICBFbGl4aXI6XG4gICAgJ1NlbGVjdGlvbiBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAnZWxpeGlyJ1xuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLWUnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICAnRmlsZSBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAnZWxpeGlyJ1xuICAgICAgYXJnczogKHtmaWxlcGF0aH0pIC0+IFsnLXInLCBmaWxlcGF0aF1cblxuICBFcmxhbmc6XG4gICAgJ1NlbGVjdGlvbiBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAnZXJsJ1xuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLW5vc2hlbGwnLCAnLWV2YWwnLCBcIiN7Y29udGV4dC5nZXRDb2RlKCl9LCBpbml0OnN0b3AoKS5cIl1cblxuICAnRionOlxuICAgICdGaWxlIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdmc3RhcidcbiAgICAgIGFyZ3M6ICh7ZmlsZXBhdGh9KSAtPiBbZmlsZXBhdGhdXG5cbiAgJ0YjJzpcbiAgICAnRmlsZSBCYXNlZCc6XG4gICAgICBjb21tYW5kOiBpZiB3aW5kb3dzIHRoZW4gJ2ZzaScgZWxzZSAnZnNoYXJwaSdcbiAgICAgIGFyZ3M6ICh7ZmlsZXBhdGh9KSAtPiBbJy0tZXhlYycsIGZpbGVwYXRoXVxuXG4gIEZvcnRoOlxuICAgICdGaWxlIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdnZm9ydGgnXG4gICAgICBhcmdzOiAoe2ZpbGVwYXRofSkgLT4gW2ZpbGVwYXRoXVxuXG4gIEdoZXJraW46XG4gICAgJ0ZpbGUgQmFzZWQnOlxuICAgICAgY29tbWFuZDogJ2N1Y3VtYmVyJ1xuICAgICAgYXJnczogKHtmaWxlcGF0aH0pIC0+IFsnLS1jb2xvcicsIGZpbGVwYXRoXVxuICAgICdMaW5lIE51bWJlciBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAnY3VjdW1iZXInXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctLWNvbG9yJywgY29udGV4dC5maWxlQ29sb25MaW5lKCldXG5cbiAgR286XG4gICAgJ0ZpbGUgQmFzZWQnOlxuICAgICAgY29tbWFuZDogJ2dvJ1xuICAgICAgd29ya2luZ0RpcmVjdG9yeTogYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKT8uYnVmZmVyPy5maWxlPy5nZXRQYXJlbnQ/KCkuZ2V0UGF0aD8oKVxuICAgICAgYXJnczogKHtmaWxlcGF0aH0pIC0+XG4gICAgICAgIGlmIGZpbGVwYXRoLm1hdGNoKC9fdGVzdC5nby8pIHRoZW4gWyd0ZXN0JywgJyddXG4gICAgICAgIGVsc2UgWydydW4nLCBmaWxlcGF0aF1cblxuICBHcm9vdnk6XG4gICAgJ1NlbGVjdGlvbiBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAnZ3Jvb3Z5J1xuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLWUnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICAnRmlsZSBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAnZ3Jvb3Z5J1xuICAgICAgYXJnczogKHtmaWxlcGF0aH0pIC0+IFtmaWxlcGF0aF1cblxuICBIeTpcbiAgICAnU2VsZWN0aW9uIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdoeSdcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBjb2RlID0gY29udGV4dC5nZXRDb2RlKClcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUsICcuaHknKVxuICAgICAgICByZXR1cm4gW3RtcEZpbGVdXG4gICAgJ0ZpbGUgQmFzZWQnOlxuICAgICAgY29tbWFuZDogJ2h5J1xuICAgICAgYXJnczogKHtmaWxlcGF0aH0pIC0+IFtmaWxlcGF0aF1cblxuICBJZHJpczpcbiAgICAnRmlsZSBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAnaWRyaXMnXG4gICAgICBhcmdzOiAoe2ZpbGVwYXRofSkgLT4gW2ZpbGVwYXRoLCAnLW8nLCBwYXRoLmJhc2VuYW1lKGZpbGVwYXRoLCBwYXRoLmV4dG5hbWUoZmlsZXBhdGgpKV1cblxuICBJbm5vU2V0dXA6XG4gICAgJ0ZpbGUgQmFzZWQnOlxuICAgICAgY29tbWFuZDogJ0lTQ0MuZXhlJ1xuICAgICAgYXJnczogKHtmaWxlcGF0aH0pIC0+IFsnL1EnLCBmaWxlcGF0aF1cblxuICBpb0xhbmd1YWdlOlxuICAgICdTZWxlY3Rpb24gQmFzZWQnOlxuICAgICAgY29tbWFuZDogJ2lvJ1xuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFtjb250ZXh0LmdldENvZGUoKV1cbiAgICAnRmlsZSBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAnaW8nXG4gICAgICBhcmdzOiAoe2ZpbGVwYXRofSkgLT4gWyctZScsIGZpbGVwYXRoXVxuXG4gIEpvbGllOlxuICAgICdGaWxlIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdqb2xpZSdcbiAgICAgIGFyZ3M6ICh7ZmlsZXBhdGh9KSAtPiBbZmlsZXBhdGhdXG5cbiAgSnVsaWE6XG4gICAgJ1NlbGVjdGlvbiBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAnanVsaWEnXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctZScsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgICdGaWxlIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdqdWxpYSdcbiAgICAgIGFyZ3M6ICh7ZmlsZXBhdGh9KSAtPiBbZmlsZXBhdGhdXG5cbiAgTEFNTVBTOlxuICAgIGlmIG9zIGluIFsnZGFyd2luJywgJ2xpbnV4J11cbiAgICAgICdGaWxlIEJhc2VkJzpcbiAgICAgICAgY29tbWFuZDogJ2xhbW1wcydcbiAgICAgICAgYXJnczogKHtmaWxlcGF0aH0pIC0+IFsnLWxvZycsICdub25lJywgJy1pbicsIGZpbGVwYXRoXVxuXG4gIExpbHlQb25kOlxuICAgICdGaWxlIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdsaWx5cG9uZCdcbiAgICAgIGFyZ3M6ICh7ZmlsZXBhdGh9KSAtPiBbZmlsZXBhdGhdXG5cbiAgTGl2ZVNjcmlwdDpcbiAgICAnU2VsZWN0aW9uIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdsc2MnXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctZScsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgICdGaWxlIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdsc2MnXG4gICAgICBhcmdzOiAoe2ZpbGVwYXRofSkgLT4gW2ZpbGVwYXRoXVxuXG4gIE1ha2VmaWxlOlxuICAgICdTZWxlY3Rpb24gQmFzZWQnOlxuICAgICAgY29tbWFuZDogJ2Jhc2gnXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctYycsIGNvbnRleHQuZ2V0Q29kZSgpXVxuXG4gICAgJ0ZpbGUgQmFzZWQnOlxuICAgICAgY29tbWFuZDogJ21ha2UnXG4gICAgICBhcmdzOiAoe2ZpbGVwYXRofSkgLT4gWyctZicsIGZpbGVwYXRoXVxuXG4gIE1BVExBQjpcbiAgICAnU2VsZWN0aW9uIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdtYXRsYWInXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT5cbiAgICAgICAgY29kZSA9IGNvbnRleHQuZ2V0Q29kZSgpXG4gICAgICAgIHRtcEZpbGUgPSBHcmFtbWFyVXRpbHMuTUFUTEFCLmNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSlcbiAgICAgICAgcmV0dXJuIFsnLW5vZGVza3RvcCcsICctbm9zcGxhc2gnLCAnLXInLCBcInRyeSwgcnVuKCcje3RtcEZpbGV9Jyk7IHdoaWxlIH5pc2VtcHR5KGdldCgwLCdDaGlsZHJlbicpKTsgcGF1c2UoMC41KTsgZW5kOyBjYXRjaCBNRTsgZGlzcChNRS5tZXNzYWdlKTsgZXhpdCgxKTsgZW5kOyBleGl0KDApO1wiXVxuICAgICdGaWxlIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdtYXRsYWInXG4gICAgICBhcmdzOiAoe2ZpbGVwYXRofSkgLT4gWyctbm9kZXNrdG9wJywgJy1ub3NwbGFzaCcsICctcicsIFwidHJ5IHJ1bignI3tmaWxlcGF0aH0nKTsgd2hpbGUgfmlzZW1wdHkoZ2V0KDAsJ0NoaWxkcmVuJykpOyBwYXVzZSgwLjUpOyBlbmQ7IGNhdGNoIE1FOyBkaXNwKE1FLm1lc3NhZ2UpOyBleGl0KDEpOyBlbmQ7IGV4aXQoMCk7XCJdXG5cbiAgJ01JUFMgQXNzZW1ibGVyJzpcbiAgICAnRmlsZSBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAnc3BpbSdcbiAgICAgIGFyZ3M6ICh7ZmlsZXBhdGh9KSAtPiBbJy1mJywgZmlsZXBhdGhdXG5cbiAgTkNMOlxuICAgICdTZWxlY3Rpb24gQmFzZWQnOlxuICAgICAgY29tbWFuZDogJ25jbCdcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBjb2RlID0gY29udGV4dC5nZXRDb2RlKCkgKyAnXFxuXFxuZXhpdCdcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUpXG4gICAgICAgIHJldHVybiBbdG1wRmlsZV1cbiAgICAnRmlsZSBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAnbmNsJ1xuICAgICAgYXJnczogKHtmaWxlcGF0aH0pIC0+IFtmaWxlcGF0aF1cblxuICBOaW06XG4gICAgJ0ZpbGUgQmFzZWQnOiB7XG4gICAgICBjb21tYW5kXG4gICAgICBhcmdzOiAoe2ZpbGVwYXRofSkgLT5cbiAgICAgICAgZmlsZSA9IEdyYW1tYXJVdGlscy5OaW0uZmluZE5pbVByb2plY3RGaWxlKGZpbGVwYXRoKVxuICAgICAgICBkaXIgPSBHcmFtbWFyVXRpbHMuTmltLnByb2plY3REaXIoZmlsZXBhdGgpXG4gICAgICAgIGNvbW1hbmRzID0gXCJjZCAnI3tkaXJ9JyAmJiBuaW0gYyAtLWhpbnRzOm9mZiAtLXBhcmFsbGVsQnVpbGQ6MSAtciAnI3tmaWxlfScgMj4mMVwiXG4gICAgICAgIHJldHVybiBHcmFtbWFyVXRpbHMuZm9ybWF0QXJncyhjb21tYW5kcylcbiAgICB9XG4gIE5TSVM6XG4gICAgJ1NlbGVjdGlvbiBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAnbWFrZW5zaXMnXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT5cbiAgICAgICAgY29kZSA9IGNvbnRleHQuZ2V0Q29kZSgpXG4gICAgICAgIHRtcEZpbGUgPSBHcmFtbWFyVXRpbHMuY3JlYXRlVGVtcEZpbGVXaXRoQ29kZShjb2RlKVxuICAgICAgICByZXR1cm4gW3RtcEZpbGVdXG4gICAgJ0ZpbGUgQmFzZWQnOlxuICAgICAgY29tbWFuZDogJ21ha2Vuc2lzJ1xuICAgICAgYXJnczogKHtmaWxlcGF0aH0pIC0+IFtmaWxlcGF0aF1cblxuICBPY3RhdmU6XG4gICAgJ1NlbGVjdGlvbiBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAnb2N0YXZlJ1xuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGRpciA9IHBhdGguZGlybmFtZShjb250ZXh0LmZpbGVwYXRoKVxuICAgICAgICByZXR1cm4gWyctcCcsIHBhdGguZGlybmFtZShjb250ZXh0LmZpbGVwYXRoKSwgJy0tZXZhbCcsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgICdGaWxlIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdvY3RhdmUnXG4gICAgICBhcmdzOiAoe2ZpbGVwYXRofSkgLT4gWyctcCcsIHBhdGguZGlybmFtZShmaWxlcGF0aCksIGZpbGVwYXRoXVxuXG4gIE96OlxuICAgICdTZWxlY3Rpb24gQmFzZWQnOlxuICAgICAgY29tbWFuZDogJ296YydcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBjb2RlID0gY29udGV4dC5nZXRDb2RlKClcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5jcmVhdGVUZW1wRmlsZVdpdGhDb2RlKGNvZGUpXG4gICAgICAgIHJldHVybiBbJy1jJywgdG1wRmlsZV1cbiAgICAnRmlsZSBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAnb3pjJ1xuICAgICAgYXJnczogKHtmaWxlcGF0aH0pIC0+IFsnLWMnLCBmaWxlcGF0aF1cblxuICBQYXNjYWw6XG4gICAgJ1NlbGVjdGlvbiBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAnZnNjJ1xuICAgICAgYXJnczogKGNvbnRleHQpIC0+XG4gICAgICAgIGNvZGUgPSBjb250ZXh0LmdldENvZGUoKVxuICAgICAgICB0bXBGaWxlID0gR3JhbW1hclV0aWxzLmNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSlcbiAgICAgICAgcmV0dXJuIFt0bXBGaWxlXVxuICAgICdGaWxlIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdmc2MnXG4gICAgICBhcmdzOiAoe2ZpbGVwYXRofSkgLT4gW2ZpbGVwYXRoXVxuXG4gIFByb2xvZzpcbiAgICAnRmlsZSBCYXNlZCc6IHtcbiAgICAgIGNvbW1hbmRcbiAgICAgIGFyZ3M6ICh7ZmlsZXBhdGh9KSAtPlxuICAgICAgICBkaXIgPSBwYXRoLmRpcm5hbWUoZmlsZXBhdGgpXG4gICAgICAgIGNvbW1hbmRzID0gXCJjZCAnI3tkaXJ9Jzsgc3dpcGwgLWYgJyN7ZmlsZXBhdGh9JyAtdCBtYWluIC0tcXVpZXRcIlxuICAgICAgICByZXR1cm4gR3JhbW1hclV0aWxzLmZvcm1hdEFyZ3MoY29tbWFuZHMpXG4gICAgfVxuICBQdXJlU2NyaXB0OlxuICAgICdGaWxlIEJhc2VkJzoge1xuICAgICAgY29tbWFuZFxuICAgICAgYXJnczogKHtmaWxlcGF0aH0pIC0+XG4gICAgICAgIGRpciA9IHBhdGguZGlybmFtZShmaWxlcGF0aClcbiAgICAgICAgcmV0dXJuIEdyYW1tYXJVdGlscy5mb3JtYXRBcmdzKFwiY2QgJyN7ZGlyfScgJiYgcHVscCBydW5cIilcbiAgICB9XG4gIFI6XG4gICAgJ1NlbGVjdGlvbiBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAnUnNjcmlwdCdcbiAgICAgIGFyZ3M6IChjb250ZXh0KSAtPlxuICAgICAgICBjb2RlID0gY29udGV4dC5nZXRDb2RlKClcbiAgICAgICAgdG1wRmlsZSA9IEdyYW1tYXJVdGlscy5SLmNyZWF0ZVRlbXBGaWxlV2l0aENvZGUoY29kZSlcbiAgICAgICAgcmV0dXJuIFt0bXBGaWxlXVxuICAgICdGaWxlIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdSc2NyaXB0J1xuICAgICAgYXJnczogKHtmaWxlcGF0aH0pIC0+IFtmaWxlcGF0aF1cblxuICBSYWNrZXQ6XG4gICAgJ1NlbGVjdGlvbiBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAncmFja2V0J1xuICAgICAgYXJnczogKGNvbnRleHQpIC0+IFsnLWUnLCBjb250ZXh0LmdldENvZGUoKV1cbiAgICAnRmlsZSBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAncmFja2V0J1xuICAgICAgYXJnczogKHtmaWxlcGF0aH0pIC0+IFtmaWxlcGF0aF1cblxuICBcIlJlbidQeVwiOlxuICAgICdGaWxlIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdyZW5weSdcbiAgICAgIGFyZ3M6ICh7ZmlsZXBhdGh9KSAtPiBbZmlsZXBhdGguc3Vic3RyKDAsIGZpbGVwYXRoLmxhc3RJbmRleE9mKCcvZ2FtZScpKV1cblxuICAnUm9ib3QgRnJhbWV3b3JrJzpcbiAgICAnRmlsZSBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAncm9ib3QnXG4gICAgICBhcmdzOiAoe2ZpbGVwYXRofSkgLT4gW2ZpbGVwYXRoXVxuXG4gIFJ1c3Q6XG4gICAgJ0ZpbGUgQmFzZWQnOiB7XG4gICAgICBjb21tYW5kXG4gICAgICBhcmdzOiAoe2ZpbGVwYXRoLCBmaWxlbmFtZX0pIC0+XG4gICAgICAgIGlmIHdpbmRvd3NcbiAgICAgICAgICByZXR1cm4gW1wiL2MgcnVzdGMgI3tmaWxlcGF0aH0gJiYgI3tmaWxlbmFtZVsuLi00XX0uZXhlXCJdXG4gICAgICAgIGVsc2UgWyctYycsIFwicnVzdGMgJyN7ZmlsZXBhdGh9JyAtbyAvdG1wL3JzLm91dCAmJiAvdG1wL3JzLm91dFwiXVxuICAgIH1cbiAgU2NhbGE6XG4gICAgJ1NlbGVjdGlvbiBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAnc2NhbGEnXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWyctZScsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgICdGaWxlIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdzY2FsYSdcbiAgICAgIGFyZ3M6ICh7ZmlsZXBhdGh9KSAtPiBbZmlsZXBhdGhdXG5cbiAgU3RhdGE6XG4gICAgJ1NlbGVjdGlvbiBCYXNlZCc6XG4gICAgICBjb21tYW5kOiAnc3RhdGEnXG4gICAgICBhcmdzOiAoY29udGV4dCkgLT4gWydkbycsIGNvbnRleHQuZ2V0Q29kZSgpXVxuICAgICdGaWxlIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICdzdGF0YSdcbiAgICAgIGFyZ3M6ICh7ZmlsZXBhdGh9KSAtPiBbJ2RvJywgZmlsZXBhdGhdXG5cbiAgVHVyaW5nOlxuICAgICdGaWxlIEJhc2VkJzpcbiAgICAgIGNvbW1hbmQ6ICd0dXJpbmcnXG4gICAgICBhcmdzOiAoe2ZpbGVwYXRofSkgLT4gWyctcnVuJywgZmlsZXBhdGhdXG4iXX0=
