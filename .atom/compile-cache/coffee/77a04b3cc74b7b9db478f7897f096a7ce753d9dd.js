(function() {
  var $, $$, Citation, CiteView, FindLabels, SelectListView, fs, pathModule, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), SelectListView = ref.SelectListView, $ = ref.$, $$ = ref.$$;

  Citation = require('./citation');

  FindLabels = require('./find-labels');

  fs = require('fs-plus');

  pathModule = require('path');

  module.exports = CiteView = (function(superClass) {
    extend(CiteView, superClass);

    function CiteView() {
      return CiteView.__super__.constructor.apply(this, arguments);
    }

    CiteView.prototype.editor = null;

    CiteView.prototype.panel = null;

    CiteView.prototype.initialize = function() {
      CiteView.__super__.initialize.apply(this, arguments);
      return this.addClass('overlay from-top cite-view');
    };

    CiteView.prototype.show = function(editor) {
      var cites;
      if (editor == null) {
        return;
      }
      this.editor = editor;
      cites = this.getCitations();
      this.setItems(cites);
      if (this.panel == null) {
        this.panel = atom.workspace.addModalPanel({
          item: this
        });
      }
      this.panel.show();
      this.storeFocusedElement();
      return this.focusFilterEditor();
    };

    CiteView.prototype.getEmptyMessage = function() {
      return "No citations found";
    };

    CiteView.prototype.getFilterKey = function() {
      return "filterKey";
    };

    CiteView.prototype.viewForItem = function(arg) {
      var author, key, title;
      title = arg.title, key = arg.key, author = arg.author;
      return "<li><span style='display:block;'>" + title + "</span><span style='display:block;font-size:xx-small;'>" + author + "</span></li>";
    };

    CiteView.prototype.hide = function() {
      var ref1;
      return (ref1 = this.panel) != null ? ref1.hide() : void 0;
    };

    CiteView.prototype.confirmed = function(arg) {
      var author, key, title;
      title = arg.title, key = arg.key, author = arg.author;
      this.editor.insertText(key);
      this.restoreFocus();
      return this.hide();
    };

    CiteView.prototype.cancel = function() {
      CiteView.__super__.cancel.apply(this, arguments);
      return this.hide();
    };

    CiteView.prototype.getCitations = function() {
      var bibFile, bibFiles, cites, i, len;
      cites = [];
      bibFiles = this.getBibFiles();
      for (i = 0, len = bibFiles.length; i < len; i++) {
        bibFile = bibFiles[i];
        cites = cites.concat(this.getCitationsFromPath(bibFile));
      }
      return cites;
    };

    CiteView.prototype.getBibFiles = function() {
      var absolutFilePath, activePaneItemPath, basePath, bfpath, bibFiles, editor, error, file, i, len, match, ref1, result, texRootRex, text;
      editor = atom.workspace.getActivePaneItem();
      file = editor != null ? (ref1 = editor.buffer) != null ? ref1.file : void 0 : void 0;
      basePath = file != null ? file.path : void 0;
      activePaneItemPath = basePath;
      if (basePath.lastIndexOf(pathModule.sep) !== -1) {
        basePath = basePath.substring(0, basePath.lastIndexOf(pathModule.sep));
      }
      bibFiles = this.getBibFileFromText(this.editor.getText());
      if (bibFiles === null || bibFiles.length === 0) {
        texRootRex = /%(\s+)?!TEX root(\s+)?=(\s+)?(.+)/g;
        while ((match = texRootRex.exec(this.editor.getText()))) {
          absolutFilePath = FindLabels.getAbsolutePath(activePaneItemPath, match[4]);
          basePath = pathModule.dirname(absolutFilePath);
          try {
            text = fs.readFileSync(absolutFilePath).toString();
            bibFiles = this.getBibFileFromText(text);
            if (bibFiles !== null && bibFiles.length !== 0) {
              break;
            }
          } catch (error1) {
            error = error1;
            atom.notifications.addError('could not load content ' + match[4], {
              dismissable: true
            });
            console.log(error);
          }
        }
      }
      result = [];
      basePath = basePath + pathModule.sep;
      for (i = 0, len = bibFiles.length; i < len; i++) {
        bfpath = bibFiles[i];
        result = result.concat(FindLabels.getAbsolutePath(basePath, bfpath));
      }
      return result;
    };

    CiteView.prototype.getBibFileFromText = function(text) {
      var bibFiles, bibRex, found, foundBibs, i, len, match;
      bibFiles = [];
      bibRex = /\\(?:bibliography|addbibresource|addglobalbib){([^}]+)}/g;
      while ((match = bibRex.exec(text))) {
        foundBibs = match[1].split(",");
        for (i = 0, len = foundBibs.length; i < len; i++) {
          found = foundBibs[i];
          if (!/\.bib$/.test(found)) {
            found += ".bib";
          }
          bibFiles = bibFiles.concat(found);
        }
      }
      return bibFiles;
    };

    CiteView.prototype.getCitationsFromPath = function(path) {
      var cite, cites, ct, error, filter, i, j, key, len, len1, ref1, text, textSplit;
      cites = [];
      text = null;
      try {
        text = fs.readFileSync(path).toString();
      } catch (error1) {
        error = error1;
        console.log(error);
        return [];
      }
      if (text == null) {
        return [];
      }
      text = text.replace(/(\r\n|\n|\r)/gm, "");
      textSplit = text.split("@");
      textSplit.shift();
      for (i = 0, len = textSplit.length; i < len; i++) {
        cite = textSplit[i];
        if (cite == null) {
          continue;
        }
        ct = new Citation;
        ct.parse(cite);
        filter = "";
        ref1 = atom.config.get("latexer.parameters_to_search_citations_by");
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          key = ref1[j];
          filter += ct.get(key) + " ";
        }
        cites.push({
          title: ct.get("title"),
          key: ct.get("key"),
          author: ct.get("author"),
          filterKey: filter
        });
      }
      return cites;
    };

    return CiteView;

  })(SelectListView);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2xhdGV4ZXIvbGliL2NpdGUtdmlldy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQSxNQUFBLDBFQUFBO0lBQUE7OztFQUFBLE1BQTBCLE9BQUEsQ0FBUSxzQkFBUixDQUExQixFQUFDLG1DQUFELEVBQWlCLFNBQWpCLEVBQW9COztFQUNwQixRQUFBLEdBQVcsT0FBQSxDQUFRLFlBQVI7O0VBQ1gsVUFBQSxHQUFhLE9BQUEsQ0FBUSxlQUFSOztFQUNiLEVBQUEsR0FBSyxPQUFBLENBQVEsU0FBUjs7RUFDTCxVQUFBLEdBQWEsT0FBQSxDQUFRLE1BQVI7O0VBRWIsTUFBTSxDQUFDLE9BQVAsR0FDTTs7Ozs7Ozt1QkFDSixNQUFBLEdBQVE7O3VCQUNSLEtBQUEsR0FBTzs7dUJBRVAsVUFBQSxHQUFZLFNBQUE7TUFDViwwQ0FBQSxTQUFBO2FBQ0EsSUFBQyxDQUFBLFFBQUQsQ0FBVSw0QkFBVjtJQUZVOzt1QkFJWixJQUFBLEdBQU0sU0FBQyxNQUFEO0FBQ0osVUFBQTtNQUFBLElBQWMsY0FBZDtBQUFBLGVBQUE7O01BQ0EsSUFBQyxDQUFBLE1BQUQsR0FBVTtNQUNWLEtBQUEsR0FBUSxJQUFDLENBQUEsWUFBRCxDQUFBO01BQ1IsSUFBQyxDQUFBLFFBQUQsQ0FBVSxLQUFWOztRQUNBLElBQUMsQ0FBQSxRQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBZixDQUE2QjtVQUFBLElBQUEsRUFBTSxJQUFOO1NBQTdCOztNQUNWLElBQUMsQ0FBQSxLQUFLLENBQUMsSUFBUCxDQUFBO01BQ0EsSUFBQyxDQUFBLG1CQUFELENBQUE7YUFDQSxJQUFDLENBQUEsaUJBQUQsQ0FBQTtJQVJJOzt1QkFVTixlQUFBLEdBQWlCLFNBQUE7YUFDZjtJQURlOzt1QkFHakIsWUFBQSxHQUFjLFNBQUE7YUFDWjtJQURZOzt1QkFHZCxXQUFBLEdBQWEsU0FBQyxH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LEdBQUgsQ0FBTyxLQUFQLENBQTlCO1VBQTZDLE1BQUEsRUFBUSxFQUFFLENBQUMsR0FBSCxDQUFPLFFBQVAsQ0FBckQ7VUFBdUUsU0FBQSxFQUFXLE1BQWxGO1NBQVg7QUFQRjthQVFBO0lBbkJvQjs7OztLQW5GRDtBQVB2QiIsInNvdXJjZXNDb250ZW50IjpbIntTZWxlY3RMaXN0VmlldywgJCwgJCR9ID0gcmVxdWlyZSAnYXRvbS1zcGFjZS1wZW4tdmlld3MnXG5DaXRhdGlvbiA9IHJlcXVpcmUgJy4vY2l0YXRpb24nXG5GaW5kTGFiZWxzID0gcmVxdWlyZSAnLi9maW5kLWxhYmVscydcbmZzID0gcmVxdWlyZSAnZnMtcGx1cydcbnBhdGhNb2R1bGUgPSByZXF1aXJlICdwYXRoJ1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5jbGFzcyBDaXRlVmlldyBleHRlbmRzIFNlbGVjdExpc3RWaWV3XG4gIGVkaXRvcjogbnVsbFxuICBwYW5lbDogbnVsbFxuXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXJcbiAgICBAYWRkQ2xhc3MoJ292ZXJsYXkgZnJvbS10b3AgY2l0ZS12aWV3JylcblxuICBzaG93OiAoZWRpdG9yKSAtPlxuICAgIHJldHVybiB1bmxlc3MgZWRpdG9yP1xuICAgIEBlZGl0b3IgPSBlZGl0b3JcbiAgICBjaXRlcyA9IEBnZXRDaXRhdGlvbnMoKVxuICAgIEBzZXRJdGVtcyhjaXRlcylcbiAgICBAcGFuZWwgPz0gYXRvbS53b3Jrc3BhY2UuYWRkTW9kYWxQYW5lbChpdGVtOiB0aGlzKVxuICAgIEBwYW5lbC5zaG93KClcbiAgICBAc3RvcmVGb2N1c2VkRWxlbWVudCgpXG4gICAgQGZvY3VzRmlsdGVyRWRpdG9yKClcblxuICBnZXRFbXB0eU1lc3NhZ2U6IC0+XG4gICAgXCJObyBjaXRhdGlvbnMgZm91bmRcIlxuXG4gIGdldEZpbHRlcktleTogLT5cbiAgICBcImZpbHRlcktleVwiXG5cbiAgdmlld0Zvckl0ZW06ICh7dGl0bGUsIGtleSwgYXV0aG9yfSkgLT5cbiAgICBcIjxsaT48c3BhbiBzdHlsZT0nZGlzcGxheTpibG9jazsnPiN7dGl0bGV9PC9zcGFuPjxzcGFuIHN0eWxlPSdkaXNwbGF5OmJsb2NrO2ZvbnQtc2l6ZTp4eC1zbWFsbDsnPiN7YXV0aG9yfTwvc3Bhbj48L2xpPlwiXG5cbiAgaGlkZTogLT5cbiAgICBAcGFuZWw/LmhpZGUoKVxuXG4gIGNvbmZpcm1lZDogKHt0aXRsZSwga2V5LCBhdXRob3J9KSAtPlxuICAgIEBlZGl0b3IuaW5zZXJ0VGV4dCBrZXlcbiAgICBAcmVzdG9yZUZvY3VzKClcbiAgICBAaGlkZSgpXG4gIGNhbmNlbDogLT5cbiAgICBzdXBlclxuICAgIEBoaWRlKClcblxuICBnZXRDaXRhdGlvbnM6IC0+XG4gICAgY2l0ZXMgPSBbXVxuICAgIGJpYkZpbGVzID0gQGdldEJpYkZpbGVzKClcbiAgICBmb3IgYmliRmlsZSBpbiBiaWJGaWxlc1xuICAgICAgY2l0ZXMgPSBjaXRlcy5jb25jYXQoQGdldENpdGF0aW9uc0Zyb21QYXRoKGJpYkZpbGUpKVxuICAgIGNpdGVzXG5cbiAgZ2V0QmliRmlsZXM6IC0+XG4gICAgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZUl0ZW0oKVxuICAgIGZpbGUgPSBlZGl0b3I/LmJ1ZmZlcj8uZmlsZVxuICAgIGJhc2VQYXRoID0gZmlsZT8ucGF0aFxuICAgIGFjdGl2ZVBhbmVJdGVtUGF0aCA9IGJhc2VQYXRoXG4gICAgaWYgYmFzZVBhdGgubGFzdEluZGV4T2YocGF0aE1vZHVsZS5zZXApIGlzbnQgLTFcbiAgICAgIGJhc2VQYXRoID0gYmFzZVBhdGguc3Vic3RyaW5nIDAsIGJhc2VQYXRoLmxhc3RJbmRleE9mKHBhdGhNb2R1bGUuc2VwKVxuICAgIGJpYkZpbGVzID0gQGdldEJpYkZpbGVGcm9tVGV4dChAZWRpdG9yLmdldFRleHQoKSlcbiAgICBpZiBiaWJGaWxlcyA9PSBudWxsIG9yIGJpYkZpbGVzLmxlbmd0aCA9PSAwXG4gICAgICB0ZXhSb290UmV4ID0gLyUoXFxzKyk/IVRFWCByb290KFxccyspPz0oXFxzKyk/KC4rKS9nXG4gICAgICB3aGlsZShtYXRjaCA9IHRleFJvb3RSZXguZXhlYyhAZWRpdG9yLmdldFRleHQoKSkpXG4gICAgICAgIGFic29sdXRGaWxlUGF0aCA9IEZpbmRMYWJlbHMuZ2V0QWJzb2x1dGVQYXRoKGFjdGl2ZVBhbmVJdGVtUGF0aCxtYXRjaFs0XSlcbiAgICAgICAgYmFzZVBhdGggPSBwYXRoTW9kdWxlLmRpcm5hbWUoYWJzb2x1dEZpbGVQYXRoKVxuICAgICAgICB0cnlcbiAgICAgICAgICB0ZXh0ID0gZnMucmVhZEZpbGVTeW5jKGFic29sdXRGaWxlUGF0aCkudG9TdHJpbmcoKVxuICAgICAgICAgIGJpYkZpbGVzID0gQGdldEJpYkZpbGVGcm9tVGV4dCh0ZXh0KSAjdG9kbyBhcHBlbmQgYmFzZVBhdGggdG8gZWFjaCBCaWJGaWxlcyBpblxuICAgICAgICAgIGlmIGJpYkZpbGVzICE9IG51bGwgYW5kIGJpYkZpbGVzLmxlbmd0aCAhPSAwXG4gICAgICAgICAgICBicmVha1xuICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgIGF0b20ubm90aWZpY2F0aW9ucy5hZGRFcnJvcignY291bGQgbm90IGxvYWQgY29udGVudCAnKyBtYXRjaFs0XSwgeyBkaXNtaXNzYWJsZTogdHJ1ZSB9KVxuICAgICAgICAgIGNvbnNvbGUubG9nKGVycm9yKVxuICAgIHJlc3VsdCA9IFtdXG4gICAgYmFzZVBhdGggPSBiYXNlUGF0aCArIHBhdGhNb2R1bGUuc2VwXG4gICAgZm9yIGJmcGF0aCBpbiBiaWJGaWxlc1xuICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdChGaW5kTGFiZWxzLmdldEFic29sdXRlUGF0aChiYXNlUGF0aCwgYmZwYXRoKSApXG4gICAgcmVzdWx0XG5cbiAgZ2V0QmliRmlsZUZyb21UZXh0OiAodGV4dCkgLT5cbiAgICBiaWJGaWxlcyA9IFtdXG4gICAgYmliUmV4ID0gL1xcXFwoPzpiaWJsaW9ncmFwaHl8YWRkYmlicmVzb3VyY2V8YWRkZ2xvYmFsYmliKXsoW159XSspfS9nXG4gICAgd2hpbGUoIG1hdGNoID0gYmliUmV4LmV4ZWModGV4dCkgKSAjdHJ5IGVkaXRvciB0ZXh0IGZvciBiaWJmaWxlXG4gICAgICBmb3VuZEJpYnMgPSBtYXRjaFsxXS5zcGxpdCBcIixcIlxuICAgICAgZm9yIGZvdW5kIGluIGZvdW5kQmlic1xuICAgICAgICBpZiBub3QgL1xcLmJpYiQvLnRlc3QoZm91bmQpXG4gICAgICAgICAgZm91bmQgKz0gXCIuYmliXCJcbiAgICAgICAgYmliRmlsZXMgPSBiaWJGaWxlcy5jb25jYXQoZm91bmQpXG4gICAgYmliRmlsZXNcblxuICBnZXRDaXRhdGlvbnNGcm9tUGF0aDogKHBhdGgpIC0+XG4gICAgY2l0ZXMgPSBbXVxuICAgIHRleHQgPSBudWxsXG4gICAgdHJ5IHRleHQgPSBmcy5yZWFkRmlsZVN5bmMocGF0aCkudG9TdHJpbmcoKVxuICAgIGNhdGNoIGVycm9yXG4gICAgICAgY29uc29sZS5sb2coZXJyb3IpXG4gICAgICAgcmV0dXJuIFtdXG4gICAgcmV0dXJuIFtdIHVubGVzcyB0ZXh0P1xuICAgIHRleHQgPSB0ZXh0LnJlcGxhY2UoLyhcXHJcXG58XFxufFxccikvZ20sXCJcIilcbiAgICB0ZXh0U3BsaXQgPSB0ZXh0LnNwbGl0KFwiQFwiKVxuICAgIHRleHRTcGxpdC5zaGlmdCgpXG4gICAgZm9yIGNpdGUgaW4gdGV4dFNwbGl0XG4gICAgICBjb250aW51ZSB1bmxlc3MgY2l0ZT9cbiAgICAgIGN0ID0gbmV3IENpdGF0aW9uXG4gICAgICBjdC5wYXJzZShjaXRlKVxuICAgICAgZmlsdGVyID0gXCJcIlxuICAgICAgZm9yIGtleSBpbiBhdG9tLmNvbmZpZy5nZXQoXCJsYXRleGVyLnBhcmFtZXRlcnNfdG9fc2VhcmNoX2NpdGF0aW9uc19ieVwiKVxuICAgICAgICBmaWx0ZXIgKz0gY3QuZ2V0KGtleSkgKyBcIiBcIlxuICAgICAgY2l0ZXMucHVzaCh7dGl0bGU6IGN0LmdldChcInRpdGxlXCIpLCBrZXk6IGN0LmdldChcImtleVwiKSwgYXV0aG9yOiBjdC5nZXQoXCJhdXRob3JcIiksIGZpbHRlcktleTogZmlsdGVyfSlcbiAgICBjaXRlc1xuIl19
