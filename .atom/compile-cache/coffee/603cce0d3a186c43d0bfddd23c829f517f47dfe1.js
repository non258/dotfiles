(function() {
  var FindAndReplace, PU;

  PU = require('./preferences-util');

  FindAndReplace = (function() {
    function FindAndReplace() {}

    FindAndReplace._targetCommands = ['project-find:show', 'project-find:toggle', 'find-and-replace:show', 'find-and-replace:toggle', 'find-and-replace:show-replace'];

    FindAndReplace.localize = function(defF) {
      this.defF = defF;
      return atom.commands.onDidDispatch((function(_this) {
        return function(e) {
          var i, len, panel, ref, results;
          if (_this._targetCommands.includes(e.type)) {
            try {
              ref = atom.workspace.getBottomPanels();
              results = [];
              for (i = 0, len = ref.length; i < len; i++) {
                panel = ref[i];
                switch (panel.item.constructor.name) {
                  case 'ProjectFindView':
                    results.push(_this.localizeProjectFindView(panel));
                    break;
                  case 'FindView':
                    results.push(_this.localizeFindView(panel));
                    break;
                  default:
                    results.push(void 0);
                }
              }
              return results;
            } catch (error) {
              e = error;
              return console.error(e);
            }
          }
        };
      })(this));
    };

    FindAndReplace.localizeProjectFindView = function(panel) {
      var def, items, opt, panelElement;
      def = FindAndReplace.defF.ProjectFindView;
      items = panel.getItem();
      items.refs['descriptionLabel'].innerHTML = def.descriptionLabel;
      items.refs['findEditor'].placeholderText = def.findEditor;
      items.refs['findAllButton'].textContent = def.findAllButton;
      items.refs['replaceEditor'].placeholderText = def.replaceEditor;
      items.refs['replaceAllButton'].textContent = def.replaceAllButton;
      items.refs['pathsEditor'].placeholderText = def.pathsEditor;
      panelElement = document.querySelector('atom-panel > .project-find');
      FindAndReplace.localizeOnChangeOptions(items, panelElement, def);
      opt = panelElement.querySelector('.options-label .options');
      return opt.addEventListener('DOMSubtreeModified', function() {
        return FindAndReplace.localizeOnChangeOptions(items, panelElement, def);
      });
    };

    FindAndReplace.localizeFindView = function(panel) {
      var def, items, opt, panelElement;
      def = FindAndReplace.defF.FindView;
      items = panel.getItem();
      items.refs['findEditor'].placeholderText = def.findEditor;
      items.refs['nextButton'].textContent = def.nextButton;
      items.refs['findAllButton'].textContent = def.findAllButton;
      items.refs['replaceEditor'].placeholderText = def.replaceEditor;
      items.refs['replaceNextButton'].textContent = def.replaceNextButton;
      items.refs['replaceAllButton'].textContent = def.replaceAllButton;
      panelElement = document.querySelector('atom-panel > .find-and-replace');
      FindAndReplace.localizeOnChangeOptions(items, panelElement, def);
      opt = panelElement.querySelector('.options-label .options');
      return opt.addEventListener('DOMSubtreeModified', function() {
        return FindAndReplace.localizeOnChangeOptions(items, panelElement, def);
      });
    };

    FindAndReplace.localizeOnChangeOptions = function(items, panelElement, def) {
      var ol, opt, optLbl, txt;
      items.refs['descriptionLabel'].innerHTML = def.descriptionLabel;
      ol = def.OptionsLabel;
      optLbl = panelElement.querySelector('.options-label > span:first-child');
      optLbl.textContent = ol.Heading;
      opt = panelElement.querySelector('.options-label .options');
      txt = opt.textContent;
      txt = txt.replace('Regex', ol.Regex);
      txt = txt.replace('Case Sensitive', ol.CaseSensitive);
      txt = txt.replace('Case Insensitive', ol.CaseInsensitive);
      txt = txt.replace('Within Current Selection', ol.WithinCurrentSelection);
      txt = txt.replace('Whole Word', ol.WholeWord);
      return opt.textContent = txt;
    };

    return FindAndReplace;

  })();

  module.exports = FindAndReplace;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2phcGFuZXNlLW1lbnUvbGliL2ZpbmRhbmRyZXBsYWNlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsRUFBQSxHQUFLLE9BQUEsQ0FBUSxvQkFBUjs7RUFFQzs7O0lBRUosY0FBQyxDQUFBLGVBQUQsR0FBa0IsQ0FDaEIsbUJBRGdCLEVBRWhCLHFCQUZnQixFQUdoQix1QkFIZ0IsRUFJaEIseUJBSmdCLEVBS2hCLCtCQUxnQjs7SUFRbEIsY0FBQyxDQUFBLFFBQUQsR0FBVyxTQUFDLElBQUQ7TUFDVCxJQUFDLENBQUEsSUFBRCxHQUFRO2FBQ1IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFkLENBQTRCLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQyxDQUFEO0FBQzFCLGNBQUE7VUFBQSxJQUFHLEtBQUMsQ0FBQSxlQUFlLENBQUMsUUFBakIsQ0FBMEIsQ0FBQyxDQUFDLElBQTVCLENBQUg7QUFDRTtBQUNFO0FBQUE7bUJBQUEscUNBQUE7O0FBQ0Usd0JBQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBOUI7QUFBQSx1QkFDTyxpQkFEUDtpQ0FDOEIsS0FBQyxDQUFBLHVCQUFELENBQXlCLEtBQXpCO0FBQXZCO0FBRFAsdUJBRU8sVUFGUDtpQ0FFdUIsS0FBQyxDQUFBLGdCQUFELENBQWtCLEtBQWxCO0FBQWhCO0FBRlA7O0FBQUE7QUFERjs2QkFERjthQUFBLGFBQUE7Y0FLTTtxQkFDSixPQUFPLENBQUMsS0FBUixDQUFjLENBQWQsRUFORjthQURGOztRQUQwQjtNQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBNUI7SUFGUzs7SUFZWCxjQUFDLENBQUEsdUJBQUQsR0FBMEIsU0FBQyxLQUFEO0FBQ3hCLFVBQUE7TUFBQSxHQUFBLEdBQU0sY0FBQyxDQUFBLElBQUksQ0FBQztNQUNaLEtBQUEsR0FB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LENBQUMsS0FBeEI7TUFDTixHQUFBLEdBQU0sR0FBRyxDQUFDLE9BQUosQ0FBWSxnQkFBWixFQUE4QixFQUFFLENBQUMsYUFBakM7TUFDTixHQUFBLEdBQU0sR0FBRyxDQUFDLE9BQUosQ0FBWSxrQkFBWixFQUFnQyxFQUFFLENBQUMsZUFBbkM7TUFDTixHQUFBLEdBQU0sR0FBRyxDQUFDLE9BQUosQ0FBWSwwQkFBWixFQUF3QyxFQUFFLENBQUMsc0JBQTNDO01BQ04sR0FBQSxHQUFNLEdBQUcsQ0FBQyxPQUFKLENBQVksWUFBWixFQUEwQixFQUFFLENBQUMsU0FBN0I7YUFDTixHQUFHLENBQUMsV0FBSixHQUFrQjtJQVpNOzs7Ozs7RUFjNUIsTUFBTSxDQUFDLE9BQVAsR0FBaUI7QUF0RWpCIiwic291cmNlc0NvbnRlbnQiOlsiUFUgPSByZXF1aXJlICcuL3ByZWZlcmVuY2VzLXV0aWwnXG5cbmNsYXNzIEZpbmRBbmRSZXBsYWNlXG5cbiAgQF90YXJnZXRDb21tYW5kczogW1xuICAgICdwcm9qZWN0LWZpbmQ6c2hvdydcbiAgICAncHJvamVjdC1maW5kOnRvZ2dsZSdcbiAgICAnZmluZC1hbmQtcmVwbGFjZTpzaG93J1xuICAgICdmaW5kLWFuZC1yZXBsYWNlOnRvZ2dsZSdcbiAgICAnZmluZC1hbmQtcmVwbGFjZTpzaG93LXJlcGxhY2UnXG4gIF1cblxuICBAbG9jYWxpemU6IChkZWZGKSAtPlxuICAgIEBkZWZGID0gZGVmRlxuICAgIGF0b20uY29tbWFuZHMub25EaWREaXNwYXRjaCAoZSkgPT5cbiAgICAgIGlmIEBfdGFyZ2V0Q29tbWFuZHMuaW5jbHVkZXMoZS50eXBlKVxuICAgICAgICB0cnlcbiAgICAgICAgICBmb3IgcGFuZWwgaW4gYXRvbS53b3Jrc3BhY2UuZ2V0Qm90dG9tUGFuZWxzKClcbiAgICAgICAgICAgIHN3aXRjaCBwYW5lbC5pdGVtLmNvbnN0cnVjdG9yLm5hbWVcbiAgICAgICAgICAgICAgd2hlbiAnUHJvamVjdEZpbmRWaWV3JyB0aGVuIEBsb2NhbGl6ZVByb2plY3RGaW5kVmlldyhwYW5lbClcbiAgICAgICAgICAgICAgd2hlbiAnRmluZFZpZXcnIHRoZW4gQGxvY2FsaXplRmluZFZpZXcocGFuZWwpXG4gICAgICAgIGNhdGNoIGVcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGUpXG5cbiAgQGxvY2FsaXplUHJvamVjdEZpbmRWaWV3OiAocGFuZWwpID0+XG4gICAgZGVmID0gQGRlZkYuUHJvamVjdEZpbmRWaWV3XG4gICAgaXRlbXMgPSBwYW5lbC5nZXRJdGVtKClcbiAgICBpdGVtcy5yZWZzWydkZXNjcmlwdGlvbkxhYmVsJ10uaW5uZXJIVE1MID0gZGVmLmRlc2NyaXB0aW9uTGFiZWxcbiAgICBpdGVtcy5yZWZzWydmaW5kRWRpdG9yJ10ucGxhY2Vob2xkZXJUZXh0ID0gZGVmLmZpbmRFZGl0b3JcbiAgICBpdGVtcy5yZWZzWydmaW5kQWxsQnV0dG9uJ10udGV4dENvbnRlbnQgPSBkZWYuZmluZEFsbEJ1dHRvblxuICAgIGl0ZW1zLnJlZnNbJ3JlcGxhY2VFZGl0b3InXS5wbGFjZWhvbGRlclRleHQgPSBkZWYucmVwbGFjZUVkaXRvclxuICAgIGl0ZW1zLnJlZnNbJ3JlcGxhY2VBbGxCdXR0b24nXS50ZXh0Q29udGVudCA9IGRlZi5yZXBsYWNlQWxsQnV0dG9uXG4gICAgaXRlbXMucmVmc1sncGF0aHNFZGl0b3InXS5wbGFjZWhvbGRlclRleHQgPSBkZWYucGF0aHNFZGl0b3JcbiAgICBcbiAgICBwYW5lbEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdhdG9tLXBhbmVsID4gLnByb2plY3QtZmluZCcpXG4gICAgQGxvY2FsaXplT25DaGFuZ2VPcHRpb25zKGl0ZW1zLCBwYW5lbEVsZW1lbnQsIGRlZilcbiAgICBvcHQgPSBwYW5lbEVsZW1lbnQucXVlcnlTZWxlY3RvcignLm9wdGlvbnMtbGFiZWwgLm9wdGlvbnMnKVxuICAgIG9wdC5hZGRFdmVudExpc3RlbmVyICdET01TdWJ0cmVlTW9kaWZpZWQnLCAoKSA9PlxuICAgICAgQGxvY2FsaXplT25DaGFuZ2VPcHRpb25zKGl0ZW1zLCBwYW5lbEVsZW1lbnQsIGRlZilcblxuICBAbG9jYWxpemVGaW5kVmlldzogKHBhbmVsKSA9PlxuICAgIGRlZiA9IEBkZWZGLkZpbmRWaWV3XG4gICAgaXRlbXMgPSBwYW5lbC5nZXRJdGVtKClcbiAgICBpdGVtcy5yZWZzWydmaW5kRWRpdG9yJ10ucGxhY2Vob2xkZXJUZXh0ID0gZGVmLmZpbmRFZGl0b3JcbiAgICBpdGVtcy5yZWZzWyduZXh0QnV0dG9uJ10udGV4dENvbnRlbnQgPSBkZWYubmV4dEJ1dHRvblxuICAgIGl0ZW1zLnJlZnNbJ2ZpbmRBbGxCdXR0b24nXS50ZXh0Q29udGVudCA9IGRlZi5maW5kQWxsQnV0dG9uXG4gICAgaXRlbXMucmVmc1sncmVwbGFjZUVkaXRvciddLnBsYWNlaG9sZGVyVGV4dCA9IGRlZi5yZXBsYWNlRWRpdG9yXG4gICAgaXRlbXMucmVmc1sncmVwbGFjZU5leHRCdXR0b24nXS50ZXh0Q29udGVudCA9IGRlZi5yZXBsYWNlTmV4dEJ1dHRvblxuICAgIGl0ZW1zLnJlZnNbJ3JlcGxhY2VBbGxCdXR0b24nXS50ZXh0Q29udGVudCA9IGRlZi5yZXBsYWNlQWxsQnV0dG9uXG4gICAgXG4gICAgcGFuZWxFbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYXRvbS1wYW5lbCA+IC5maW5kLWFuZC1yZXBsYWNlJylcbiAgICBAbG9jYWxpemVPbkNoYW5nZU9wdGlvbnMoaXRlbXMsIHBhbmVsRWxlbWVudCwgZGVmKVxuICAgIG9wdCA9IHBhbmVsRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcub3B0aW9ucy1sYWJlbCAub3B0aW9ucycpXG4gICAgb3B0LmFkZEV2ZW50TGlzdGVuZXIgJ0RPTVN1YnRyZWVNb2RpZmllZCcsICgpID0+XG4gICAgICBAbG9jYWxpemVPbkNoYW5nZU9wdGlvbnMoaXRlbXMsIHBhbmVsRWxlbWVudCwgZGVmKVxuXG4gIEBsb2NhbGl6ZU9uQ2hhbmdlT3B0aW9uczogKGl0ZW1zLCBwYW5lbEVsZW1lbnQsIGRlZikgPT5cbiAgICBpdGVtcy5yZWZzWydkZXNjcmlwdGlvbkxhYmVsJ10uaW5uZXJIVE1MID0gZGVmLmRlc2NyaXB0aW9uTGFiZWxcbiAgICBvbCA9IGRlZi5PcHRpb25zTGFiZWxcbiAgICBvcHRMYmwgPSBwYW5lbEVsZW1lbnQucXVlcnlTZWxlY3RvcignLm9wdGlvbnMtbGFiZWwgPiBzcGFuOmZpcnN0LWNoaWxkJylcbiAgICBvcHRMYmwudGV4dENvbnRlbnQgPSBvbC5IZWFkaW5nXG4gICAgb3B0ID0gcGFuZWxFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5vcHRpb25zLWxhYmVsIC5vcHRpb25zJylcbiAgICB0eHQgPSBvcHQudGV4dENvbnRlbnRcbiAgICB0eHQgPSB0eHQucmVwbGFjZSAnUmVnZXgnLCBvbC5SZWdleFxuICAgIHR4dCA9IHR4dC5yZXBsYWNlICdDYXNlIFNlbnNpdGl2ZScsIG9sLkNhc2VTZW5zaXRpdmVcbiAgICB0eHQgPSB0eHQucmVwbGFjZSAnQ2FzZSBJbnNlbnNpdGl2ZScsIG9sLkNhc2VJbnNlbnNpdGl2ZVxuICAgIHR4dCA9IHR4dC5yZXBsYWNlICdXaXRoaW4gQ3VycmVudCBTZWxlY3Rpb24nLCBvbC5XaXRoaW5DdXJyZW50U2VsZWN0aW9uXG4gICAgdHh0ID0gdHh0LnJlcGxhY2UgJ1dob2xlIFdvcmQnLCBvbC5XaG9sZVdvcmRcbiAgICBvcHQudGV4dENvbnRlbnQgPSB0eHRcblxubW9kdWxlLmV4cG9ydHMgPSBGaW5kQW5kUmVwbGFjZVxuIl19
