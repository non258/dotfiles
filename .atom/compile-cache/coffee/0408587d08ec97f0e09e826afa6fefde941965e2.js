(function() {
  var Point, clangSourceScopeDictionary;

  Point = require('atom').Point;

  clangSourceScopeDictionary = {
    'source.cpp': 'c++',
    'source.c': 'c',
    'source.objc': 'objective-c',
    'source.objcpp': 'objective-c++',
    'source.c++': 'c++',
    'source.objc++': 'objective-c++'
  };

  module.exports = {
    getFirstCursorSourceScopeLang: function(editor) {
      var scopes;
      scopes = this.getFirstCursorScopes(editor);
      return this.getSourceScopeLang(scopes);
    },
    getFirstCursorScopes: function(editor) {
      var firstPosition, scopeDescriptor, scopes;
      if (editor.getCursors) {
        firstPosition = editor.getCursors()[0].getBufferPosition();
        scopeDescriptor = editor.scopeDescriptorForBufferPosition(firstPosition);
        return scopes = scopeDescriptor.getScopesArray();
      } else {
        return scopes = [];
      }
    },
    getSourceScopeLang: function(scopes, scopeDictionary) {
      var i, lang, len, scope;
      if (scopeDictionary == null) {
        scopeDictionary = clangSourceScopeDictionary;
      }
      lang = null;
      for (i = 0, len = scopes.length; i < len; i++) {
        scope = scopes[i];
        if (scope in scopeDictionary) {
          return scopeDictionary[scope];
        }
      }
    },
    prefixAtPosition: function(editor, bufferPosition) {
      var line, ref, regex;
      regex = /\w+$/;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      return ((ref = line.match(regex)) != null ? ref[0] : void 0) || '';
    },
    nearestSymbolPosition: function(editor, bufferPosition) {
      var line, matches, regex, symbol, symbolColumn;
      regex = /(\W+)\w*$/;
      line = editor.getTextInRange([[bufferPosition.row, 0], bufferPosition]);
      matches = line.match(regex);
      if (matches) {
        symbol = matches[1];
        symbolColumn = matches[0].indexOf(symbol) + symbol.length + (line.length - matches[0].length);
        return [new Point(bufferPosition.row, symbolColumn), symbol.slice(-1)];
      } else {
        return [bufferPosition, ''];
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2F1dG9jb21wbGV0ZS1jbGFuZy9saWIvdXRpbC5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBOztFQUFDLFFBQVMsT0FBQSxDQUFRLE1BQVI7O0VBRVYsMEJBQUEsR0FBNkI7SUFDM0IsWUFBQSxFQUFrQixLQURTO0lBRTNCLFVBQUEsRUFBa0IsR0FGUztJQUczQixhQUFBLEVBQWtCLGFBSFM7SUFJM0IsZUFBQSxFQUFrQixlQUpTO0lBTzNCLFlBQUEsRUFBa0IsS0FQUztJQVEzQixlQUFBLEVBQWtCLGVBUlM7OztFQVc3QixNQUFNLENBQUMsT0FBUCxHQUNFO0lBQUEsNkJBQUEsRUFBK0IsU0FBQyxNQUFEO0FBQzdCLFVBQUE7TUFBQSxNQUFBLEdBQVMsSUFBQyxDQUFBLG9CQUFELENBQXNCLE1BQXRCO0FBQ1QsYUFBTyxJQUFDLENBQUEsa0JBQUQsQ0FBb0IsTUFBcEI7SUFGc0IsQ0FBL0I7SUFJQSxvQkFBQSxFQUFzQixTQUFDLE1BQUQ7QUFDcEIsVUFBQTtNQUFBLElBQUcsTUFBTSxDQUFDLFVBQVY7UUFDRSxhQUFBLEdBQWdCLE1BQU0sQ0FBQyxVQUFQLENBQUEsQ0FBb0IsQ0FBQSxDQUFBLENBQUUsQ0FBQyxpQkFBdkIsQ0FBQTtRQUNoQixlQUFBLEdBQWtCLE1BQU0sQ0FBQyxnQ0FBUCxDQUF3QyxhQUF4QztlQUNsQixNQUFBLEdBQVMsZUFBZSxDQUFDLGNBQWhCLENBQUEsRUFIWDtPQUFBLE1BQUE7ZUFLRSxNQUFBLEdBQVMsR0FMWDs7SUFEb0IsQ0FKdEI7SUFZQSxrQkFBQSxFQUFvQixTQUFDLE1BQUQsRUFBUyxlQUFUO0FBQ2xCLFVBQUE7O1FBRDJCLGtCQUFnQjs7TUFDM0MsSUFBQSxHQUFPO0FBQ1AsV0FBQSx3Q0FBQTs7UUFDRSxJQUFHLEtBQUEsSUFBUyxlQUFaO0FBQ0UsaUJBQU8sZUFBZ0IsQ0FBQSxLQUFBLEVBRHpCOztBQURGO0lBRmtCLENBWnBCO0lBa0JBLGdCQUFBLEVBQWtCLFNBQUMsTUFBRCxFQUFTLGNBQVQ7QUFDaEIsVUFBQTtNQUFBLEtBQUEsR0FBUTtNQUNSLElBQUEsR0FBTyxNQUFNLENBQUMsY0FBUCxDQUFzQixDQUFDLENBQUMsY0FBYyxDQUFDLEdBQWhCLEVBQXFCLENBQXJCLENBQUQsRUFBMEIsY0FBMUIsQ0FBdEI7cURBQ1ksQ0FBQSxDQUFBLFdBQW5CLElBQXlCO0lBSFQsQ0FsQmxCO0lBdUJBLHFCQUFBLEVBQXVCLFNBQUMsTUFBRCxFQUFTLGNBQVQ7QUFDckIsVUFBQTtNQUFBLEtBQUEsR0FBUTtNQUNSLElBQUEsR0FBTyxNQUFNLENBQUMsY0FBUCxDQUFzQixDQUFDLENBQUMsY0FBYyxDQUFDLEdBQWhCLEVBQXFCLENBQXJCLENBQUQsRUFBMEIsY0FBMUIsQ0FBdEI7TUFDUCxPQUFBLEdBQVUsSUFBSSxDQUFDLEtBQUwsQ0FBVyxLQUFYO01BQ1YsSUFBRyxPQUFIO1FBQ0UsTUFBQSxHQUFTLE9BQVEsQ0FBQSxDQUFBO1FBQ2pCLFlBQUEsR0FBZSxPQUFRLENBQUEsQ0FBQSxDQUFFLENBQUMsT0FBWCxDQUFtQixNQUFuQixDQUFBLEdBQTZCLE1BQU0sQ0FBQyxNQUFwQyxHQUE2QyxDQUFDLElBQUksQ0FBQyxNQUFMLEdBQWMsT0FBUSxDQUFBLENBQUEsQ0FBRSxDQUFDLE1BQTFCO2VBQzVELENBQUMsSUFBSSxLQUFKLENBQVUsY0FBYyxDQUFDLEdBQXpCLEVBQThCLFlBQTlCLENBQUQsRUFBNkMsTUFBTyxVQUFwRCxFQUhGO09BQUEsTUFBQTtlQUtFLENBQUMsY0FBRCxFQUFnQixFQUFoQixFQUxGOztJQUpxQixDQXZCdkI7O0FBZEYiLCJzb3VyY2VzQ29udGVudCI6WyJ7UG9pbnR9ID0gcmVxdWlyZSAnYXRvbSdcblxuY2xhbmdTb3VyY2VTY29wZURpY3Rpb25hcnkgPSB7XG4gICdzb3VyY2UuY3BwJyAgICA6ICdjKysnICxcbiAgJ3NvdXJjZS5jJyAgICAgIDogJ2MnICxcbiAgJ3NvdXJjZS5vYmpjJyAgIDogJ29iamVjdGl2ZS1jJyAsXG4gICdzb3VyY2Uub2JqY3BwJyA6ICdvYmplY3RpdmUtYysrJyAsXG5cbiAgIyBGb3IgYmFja3dhcmQtY29tcGF0aWJpbGl0eSB3aXRoIHZlcnNpb25zIG9mIEF0b20gPCAwLjE2NlxuICAnc291cmNlLmMrKycgICAgOiAnYysrJyAsXG4gICdzb3VyY2Uub2JqYysrJyA6ICdvYmplY3RpdmUtYysrJyAsXG59XG5cbm1vZHVsZS5leHBvcnRzID1cbiAgZ2V0Rmlyc3RDdXJzb3JTb3VyY2VTY29wZUxhbmc6IChlZGl0b3IpIC0+XG4gICAgc2NvcGVzID0gQGdldEZpcnN0Q3Vyc29yU2NvcGVzIGVkaXRvclxuICAgIHJldHVybiBAZ2V0U291cmNlU2NvcGVMYW5nIHNjb3Blc1xuXG4gIGdldEZpcnN0Q3Vyc29yU2NvcGVzOiAoZWRpdG9yKSAtPlxuICAgIGlmIGVkaXRvci5nZXRDdXJzb3JzXG4gICAgICBmaXJzdFBvc2l0aW9uID0gZWRpdG9yLmdldEN1cnNvcnMoKVswXS5nZXRCdWZmZXJQb3NpdGlvbigpXG4gICAgICBzY29wZURlc2NyaXB0b3IgPSBlZGl0b3Iuc2NvcGVEZXNjcmlwdG9yRm9yQnVmZmVyUG9zaXRpb24oZmlyc3RQb3NpdGlvbilcbiAgICAgIHNjb3BlcyA9IHNjb3BlRGVzY3JpcHRvci5nZXRTY29wZXNBcnJheSgpXG4gICAgZWxzZVxuICAgICAgc2NvcGVzID0gW11cblxuICBnZXRTb3VyY2VTY29wZUxhbmc6IChzY29wZXMsIHNjb3BlRGljdGlvbmFyeT1jbGFuZ1NvdXJjZVNjb3BlRGljdGlvbmFyeSkgLT5cbiAgICBsYW5nID0gbnVsbFxuICAgIGZvciBzY29wZSBpbiBzY29wZXNcbiAgICAgIGlmIHNjb3BlIG9mIHNjb3BlRGljdGlvbmFyeVxuICAgICAgICByZXR1cm4gc2NvcGVEaWN0aW9uYXJ5W3Njb3BlXVxuXG4gIHByZWZpeEF0UG9zaXRpb246IChlZGl0b3IsIGJ1ZmZlclBvc2l0aW9uKSAtPlxuICAgIHJlZ2V4ID0gL1xcdyskL1xuICAgIGxpbmUgPSBlZGl0b3IuZ2V0VGV4dEluUmFuZ2UoW1tidWZmZXJQb3NpdGlvbi5yb3csIDBdLCBidWZmZXJQb3NpdGlvbl0pXG4gICAgbGluZS5tYXRjaChyZWdleCk/WzBdIG9yICcnXG5cbiAgbmVhcmVzdFN5bWJvbFBvc2l0aW9uOiAoZWRpdG9yLCBidWZmZXJQb3NpdGlvbikgLT5cbiAgICByZWdleCA9IC8oXFxXKylcXHcqJC9cbiAgICBsaW5lID0gZWRpdG9yLmdldFRleHRJblJhbmdlKFtbYnVmZmVyUG9zaXRpb24ucm93LCAwXSwgYnVmZmVyUG9zaXRpb25dKVxuICAgIG1hdGNoZXMgPSBsaW5lLm1hdGNoKHJlZ2V4KVxuICAgIGlmIG1hdGNoZXNcbiAgICAgIHN5bWJvbCA9IG1hdGNoZXNbMV1cbiAgICAgIHN5bWJvbENvbHVtbiA9IG1hdGNoZXNbMF0uaW5kZXhPZihzeW1ib2wpICsgc3ltYm9sLmxlbmd0aCArIChsaW5lLmxlbmd0aCAtIG1hdGNoZXNbMF0ubGVuZ3RoKVxuICAgICAgW25ldyBQb2ludChidWZmZXJQb3NpdGlvbi5yb3csIHN5bWJvbENvbHVtbiksc3ltYm9sWy0xLi5dXVxuICAgIGVsc2VcbiAgICAgIFtidWZmZXJQb3NpdGlvbiwnJ11cbiJdfQ==
