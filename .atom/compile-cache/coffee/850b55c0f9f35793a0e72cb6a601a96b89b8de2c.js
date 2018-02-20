(function() {
  var $$, ProcessingView, View, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), View = ref.View, $$ = ref.$$;

  module.exports = ProcessingView = (function(superClass) {
    extend(ProcessingView, superClass);

    function ProcessingView() {
      return ProcessingView.__super__.constructor.apply(this, arguments);
    }

    ProcessingView.content = function() {
      return this.div((function(_this) {
        return function() {
          var css;
          css = 'tool-panel panel panel-bottom padding script-view native-key-bindings';
          return _this.div({
            "class": css,
            outlet: 'script',
            tabindex: -1
          }, function() {
            return _this.div({
              "class": 'panel-body padded output',
              outlet: 'output'
            });
          });
        };
      })(this));
    };

    ProcessingView.prototype.log = function(line) {
      var height;
      this.output.append($$(function() {
        return this.pre({
          "class": "line"
        }, (function(_this) {
          return function() {
            return _this.raw(line);
          };
        })(this));
      }));
      height = this.script[0].scrollHeight;
      return this.script.scrollTop(height);
    };

    ProcessingView.prototype.clear = function() {
      return this.output.empty();
    };

    return ProcessingView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL3Byb2Nlc3NpbmcvbGliL3Byb2Nlc3Npbmctdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDZCQUFBO0lBQUE7OztFQUFBLE1BQWEsT0FBQSxDQUFRLHNCQUFSLENBQWIsRUFBQyxlQUFELEVBQU87O0VBRVAsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7OztJQUVKLGNBQUMsQ0FBQSxPQUFELEdBQVUsU0FBQTthQUNSLElBQUMsQ0FBQSxHQUFELENBQUssQ0FBQSxTQUFBLEtBQUE7ZUFBQSxTQUFBO0FBRUgsY0FBQTtVQUFBLEdBQUEsR0FBTTtpQkFDTixLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTyxHQUFQO1lBQVksTUFBQSxFQUFRLFFBQXBCO1lBQThCLFFBQUEsRUFBVSxDQUFDLENBQXpDO1dBQUwsRUFBaUQsU0FBQTttQkFDL0MsS0FBQyxDQUFBLEdBQUQsQ0FBSztjQUFBLENBQUEsS0FBQSxDQUFBLEVBQU8sMEJBQVA7Y0FBbUMsTUFBQSxFQUFRLFFBQTNDO2FBQUw7VUFEK0MsQ0FBakQ7UUFIRztNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBTDtJQURROzs2QkFNVixHQUFBLEdBQUssU0FBQyxJQUFEO0FBRUgsVUFBQTtNQUFBLElBQUMsQ0FBQSxNQUFNLENBQUMsTUFBUixDQUFlLEVBQUEsQ0FBRyxTQUFBO2VBQ2hCLElBQUMsQ0FBQSxHQUFELENBQUs7VUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLE1BQVA7U0FBTCxFQUFvQixDQUFBLFNBQUEsS0FBQTtpQkFBQSxTQUFBO21CQUNsQixLQUFDLENBQUEsR0FBRCxDQUFLLElBQUw7VUFEa0I7UUFBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQXBCO01BRGdCLENBQUgsQ0FBZjtNQUdBLE1BQUEsR0FBUyxJQUFDLENBQUEsTUFBTyxDQUFBLENBQUEsQ0FBRSxDQUFDO2FBQ3BCLElBQUMsQ0FBQSxNQUFNLENBQUMsU0FBUixDQUFrQixNQUFsQjtJQU5HOzs2QkFPTCxLQUFBLEdBQU8sU0FBQTthQUNMLElBQUMsQ0FBQSxNQUFNLENBQUMsS0FBUixDQUFBO0lBREs7Ozs7S0Fmb0I7QUFIN0IiLCJzb3VyY2VzQ29udGVudCI6WyJ7VmlldywgJCR9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIFByb2Nlc3NpbmdWaWV3IGV4dGVuZHMgVmlld1xuXG4gIEBjb250ZW50OiAtPlxuICAgIEBkaXYgPT5cbiAgICAgICMgRGlzcGxheSBsYXlvdXQgYW5kIG91dGxldHNcbiAgICAgIGNzcyA9ICd0b29sLXBhbmVsIHBhbmVsIHBhbmVsLWJvdHRvbSBwYWRkaW5nIHNjcmlwdC12aWV3IG5hdGl2ZS1rZXktYmluZGluZ3MnXG4gICAgICBAZGl2IGNsYXNzOiBjc3MsIG91dGxldDogJ3NjcmlwdCcsIHRhYmluZGV4OiAtMSwgPT5cbiAgICAgICAgQGRpdiBjbGFzczogJ3BhbmVsLWJvZHkgcGFkZGVkIG91dHB1dCcsIG91dGxldDogJ291dHB1dCdcbiAgbG9nOiAobGluZSkgLT5cbiAgICAjY29uc29sZS5sb2cobGluZSk7XG4gICAgQG91dHB1dC5hcHBlbmQgJCQgLT5cbiAgICAgIEBwcmUgY2xhc3M6IFwibGluZVwiLCA9PlxuICAgICAgICBAcmF3IGxpbmVcbiAgICBoZWlnaHQgPSBAc2NyaXB0WzBdLnNjcm9sbEhlaWdodDtcbiAgICBAc2NyaXB0LnNjcm9sbFRvcChoZWlnaHQpO1xuICBjbGVhcjogLT5cbiAgICBAb3V0cHV0LmVtcHR5KClcbiJdfQ==
