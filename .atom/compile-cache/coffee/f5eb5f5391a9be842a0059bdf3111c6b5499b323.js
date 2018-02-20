
/*
  lib/map.coffee
 */

(function() {
  var log,
    slice = [].slice;

  log = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return console.log.apply(console, ['markdown-scroll, map:'].concat(args));
  };

  module.exports = {
    setMap: function(getVis) {
      var addNodeToMap, bot, botRow, bufRow, firstNode, hgt, i, idx, idxMatch, j, k, l, len, len1, len2, line, match, matches, maxLen, node, nodeMatch, nodePtr, ref, ref1, ref2, ref3, ref4, ref5, ref6, start, target, text, timings, top, topRow, wlkr;
      if (getVis == null) {
        getVis = true;
      }
      start = Date.now();
      timings = {};
      if (getVis) {
        this.getVisTopHgtBot();
        timings['getVisTopHgtBot'] = Date.now() - start;
        start = Date.now();
      }
      this.nodes = [];
      wlkr = document.createTreeWalker(this.previewEle, NodeFilter.SHOW_TEXT, null, true);
      while ((node = wlkr.nextNode())) {
        text = node.textContent;
        if (!/\w+/.test(text)) {
          continue;
        }
        ref = this.getEleTopHgtBot(node.parentNode, false), top = ref[0], hgt = ref[1], bot = ref[2];
        this.nodes.push([top, bot, null, null, text, null]);
      }
      timings['tree walk'] = Date.now() - start;
      start = Date.now();
      nodePtr = 0;
      for (bufRow = i = 0, ref1 = this.editor.getLastBufferRow(); 0 <= ref1 ? i <= ref1 : i >= ref1; bufRow = 0 <= ref1 ? ++i : --i) {
        line = this.editor.lineTextForBufferRow(bufRow);
        if (!(matches = line.match(/[a-z0-9-\s]+/ig))) {
          continue;
        }
        maxLen = 0;
        target = null;
        for (j = 0, len = matches.length; j < len; j++) {
          match = matches[j];
          if (!(/\w+/.test(match))) {
            continue;
          }
          match = match.replace(/^\s+|\s+$/g, '');
          if (match.length > maxLen) {
            maxLen = match.length;
            target = match;
          }
        }
        if (target) {
          nodeMatch = null;
          ref2 = this.nodes.slice(nodePtr);
          for (idx = k = 0, len1 = ref2.length; k < len1; idx = ++k) {
            node = ref2[idx];
            if (node[4].includes(target)) {
              if (nodeMatch) {
                nodeMatch = 'dup';
                break;
              }
              nodeMatch = node;
              idxMatch = idx;
            }
          }
          if (!nodeMatch || nodeMatch === 'dup') {
            continue;
          }
          ref3 = this.editor.screenRangeForBufferRange([[bufRow, 0], [bufRow, 9e9]]), (ref4 = ref3.start, topRow = ref4.row), (ref5 = ref3.end, botRow = ref5.row);
          nodeMatch[2] = topRow;
          nodeMatch[3] = botRow;
          nodeMatch[5] = target;
          nodePtr = idxMatch;
        }
      }
      timings['node match'] = Date.now() - start;
      start = Date.now();
      this.map = [[0, 0, 0, 0]];
      this.lastTopPix = this.lastBotPix = this.lastTopRow = this.lastBotRow = 0;
      firstNode = true;
      addNodeToMap = (function(_this) {
        return function(node) {
          var botPix, topPix;
          topPix = node[0], botPix = node[1], topRow = node[2], botRow = node[3];
          if (topPix < _this.lastBotPix || topRow <= _this.lastBotRow) {
            _this.lastTopPix = Math.min(topPix, _this.lastTopPix);
            _this.lastBotPix = Math.max(botPix, _this.lastBotPix);
            _this.lastTopRow = Math.min(topRow, _this.lastTopRow);
            _this.lastBotRow = Math.max(botRow, _this.lastBotRow);
            _this.map[_this.map.length - 1] = [_this.lastTopPix, _this.lastBotPix, _this.lastTopRow, _this.lastBotRow];
          } else {
            if (firstNode) {
              _this.map[0][1] = topPix;
              _this.map[0][3] = Math.max(0, topRow - 1);
            }
            _this.map.push([_this.lastTopPix = topPix, _this.lastBotPix = botPix, _this.lastTopRow = topRow, _this.lastBotRow = botRow]);
          }
          return firstNode = false;
        };
      })(this);
      ref6 = this.nodes;
      for (l = 0, len2 = ref6.length; l < len2; l++) {
        node = ref6[l];
        if (node[2] !== null) {
          addNodeToMap(node);
        }
      }
      botRow = this.editor.getLastScreenRow();
      topRow = Math.min(botRow, this.lastBotRow + 1);
      addNodeToMap([this.lastBotPix, this.previewEle.scrollHeight, topRow, botRow]);
      return this.nodes = null;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXNjcm9sbC1zeW5jL2xpYi9tYXAuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0FBQUEsTUFBQSxHQUFBO0lBQUE7O0VBSUEsR0FBQSxHQUFNLFNBQUE7QUFDSixRQUFBO0lBREs7V0FDTCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQVosQ0FBa0IsT0FBbEIsRUFBMkIsQ0FBQyx1QkFBRCxDQUF5QixDQUFDLE1BQTFCLENBQWlDLElBQWpDLENBQTNCO0VBREk7O0VBR04sTUFBTSxDQUFDLE9BQVAsR0FFRTtJQUFBLE1BQUEsRUFBUSxTQUFDLE1BQUQ7QUFDTixVQUFBOztRQURPLFNBQVM7O01BQ2hCLEtBQUEsR0FBUSxJQUFJLENBQUMsR0FBTCxDQUFBO01BQ1IsT0FBQSxHQUFVO01BRVYsSUFBRyxNQUFIO1FBQ0UsSUFBQyxDQUFBLGVBQUQsQ0FBQTtRQUNBLE9BQVEsQ0FBQSxpQkFBQSxDQUFSLEdBQTZCLElBQUksQ0FBQyxHQUFMLENBQUEsQ0FBQSxHQUFhO1FBQU8sS0FBQSxHQUFRLElBQUksQ0FBQyxHQUFMLENBQUEsRUFGM0Q7O01BSUEsSUFBQyxDQUFBLEtBQUQsR0FBUztNQUNULElBQUEsR0FBTyxRQUFRLENBQUMsZ0JBQVQsQ0FBMEIsSUFBQyxDQUFBLFVBQTNCLEVBQXVDLFVBQVUsQ0FBQyxTQUFsRCxFQUE2RCxJQUE3RCxFQUFtRSxJQUFuRTtBQUNQLGFBQU0sQ0FBQyxJQUFBLEdBQU8sSUFBSSxDQUFDLFFBQUwsQ0FBQSxDQUFSLENBQU47UUFDRSxJQUFBLEdBQU8sSUFBSSxDQUFDO1FBQ1osSUFBRyxDQUFJLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWCxDQUFQO0FBQTRCLG1CQUE1Qjs7UUFDQSxNQUFrQixJQUFDLENBQUEsZUFBRCxDQUFpQixJQUFJLENBQUMsVUFBdEIsRUFBa0MsS0FBbEMs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QyxFQUFnRCxNQUFoRCxDQUFiO2FBRUEsSUFBQyxDQUFBLEtBQUQsR0FBUztJQTdFSCxDQUFSOztBQVRGIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gIGxpYi9tYXAuY29mZmVlXG4jIyNcblxubG9nID0gKGFyZ3MuLi4pIC0+IFxuICBjb25zb2xlLmxvZy5hcHBseSBjb25zb2xlLCBbJ21hcmtkb3duLXNjcm9sbCwgbWFwOiddLmNvbmNhdCBhcmdzXG5cbm1vZHVsZS5leHBvcnRzID1cblxuICBzZXRNYXA6IChnZXRWaXMgPSB5ZXMpIC0+XG4gICAgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgdGltaW5ncyA9IHt9XG4gICAgXG4gICAgaWYgZ2V0VmlzIFxuICAgICAgQGdldFZpc1RvcEhndEJvdCgpXG4gICAgICB0aW1pbmdzWydnZXRWaXNUb3BIZ3RCb3QnXSA9IERhdGUubm93KCkgLSBzdGFydDsgc3RhcnQgPSBEYXRlLm5vdygpXG4gICBcbiAgICBAbm9kZXMgPSBbXVxuICAgIHdsa3IgPSBkb2N1bWVudC5jcmVhdGVUcmVlV2Fsa2VyIEBwcmV2aWV3RWxlLCBOb2RlRmlsdGVyLlNIT1dfVEVYVCwgbnVsbCwgeWVzXG4gICAgd2hpbGUgKG5vZGUgPSB3bGtyLm5leHROb2RlKCkpXG4gICAgICB0ZXh0ID0gbm9kZS50ZXh0Q29udGVudFxuICAgICAgaWYgbm90IC9cXHcrLy50ZXN0IHRleHQgdGhlbiBjb250aW51ZVxuICAgICAgW3RvcCwgaGd0LCBib3RdID0gQGdldEVsZVRvcEhndEJvdCBub2RlLnBhcmVudE5vZGUsIG5vXG4gICAgICBAbm9kZXMucHVzaCBbdG9wLCBib3QsIG51bGwsIG51bGwsIHRleHQsIG51bGxdXG4gICAgICBcbiAgICB0aW1pbmdzWyd0cmVlIHdhbGsnXSA9IERhdGUubm93KCkgLSBzdGFydDsgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgXG4gICAgbm9kZVB0ciA9IDBcbiAgICBmb3IgYnVmUm93IGluIFswLi5AZWRpdG9yLmdldExhc3RCdWZmZXJSb3coKV1cbiAgICAgIGxpbmUgPSBAZWRpdG9yLmxpbmVUZXh0Rm9yQnVmZmVyUm93IGJ1ZlJvd1xuICAgICAgaWYgbm90IChtYXRjaGVzID0gbGluZS5tYXRjaCAvW2EtejAtOS1cXHNdKy9pZykgdGhlbiBjb250aW51ZVxuICAgICAgbWF4TGVuID0gMFxuICAgICAgdGFyZ2V0ID0gbnVsbFxuICAgICAgZm9yIG1hdGNoIGluIG1hdGNoZXMgd2hlbiAvXFx3Ky8udGVzdCBtYXRjaFxuICAgICAgICBtYXRjaCA9IG1hdGNoLnJlcGxhY2UgL15cXHMrfFxccyskL2csICcnXG4gICAgICAgIGlmIG1hdGNoLmxlbmd0aCA+IG1heExlblxuICAgICAgICAgIG1heExlbiA9IG1hdGNoLmxlbmd0aFxuICAgICAgICAgIHRhcmdldCA9IG1hdGNoXG4gICAgICBpZiB0YXJnZXRcbiAgICAgICAgbm9kZU1hdGNoID0gbnVsbFxuICAgICAgICBmb3Igbm9kZSwgaWR4IGluIEBub2Rlc1tub2RlUHRyLi4uXVxuICAgICAgICAgIGlmIG5vZGVbNF0uaW5jbHVkZXMgdGFyZ2V0XG4gICAgICAgICAgICBpZiBub2RlTWF0Y2ggdGhlbiBub2RlTWF0Y2ggPSAnZHVwJzsgYnJlYWtcbiAgICAgICAgICAgIG5vZGVNYXRjaCA9IG5vZGVcbiAgICAgICAgICAgIGlkeE1hdGNoID0gaWR4XG4gICAgICAgIGlmIG5vdCBub2RlTWF0Y2ggb3Igbm9kZU1hdGNoIGlzICdkdXAnIHRoZW4gY29udGludWVcbiAgICAgICAge3N0YXJ0Ontyb3c6dG9wUm93fSxlbmQ6e3Jvdzpib3RSb3d9fSA9XG4gICAgICAgICAgQGVkaXRvci5zY3JlZW5SYW5nZUZvckJ1ZmZlclJhbmdlIFtbYnVmUm93LCAwXSxbYnVmUm93LCA5ZTldXVxuICAgICAgICBub2RlTWF0Y2hbMl0gPSB0b3BSb3dcbiAgICAgICAgbm9kZU1hdGNoWzNdID0gYm90Um93XG4gICAgICAgIG5vZGVNYXRjaFs1XSA9IHRhcmdldCAgIyBERUJVR1xuICAgICAgICBub2RlUHRyID0gaWR4TWF0Y2hcbiAgICAgICAgXG4gICAgdGltaW5nc1snbm9kZSBtYXRjaCddID0gRGF0ZS5ub3coKSAtIHN0YXJ0OyBzdGFydCA9IERhdGUubm93KClcbiAgICBcbiAgICBAbWFwID0gW1swLDAsMCwwXV1cbiAgICBAbGFzdFRvcFBpeCA9IEBsYXN0Qm90UGl4ID0gQGxhc3RUb3BSb3cgPSBAbGFzdEJvdFJvdyA9IDBcbiAgICBmaXJzdE5vZGUgPSB5ZXNcbiAgICBcbiAgICBhZGROb2RlVG9NYXAgPSAobm9kZSkgPT5cbiAgICAgIFt0b3BQaXgsIGJvdFBpeCwgdG9wUm93LCBib3RSb3ddID0gbm9kZVxuICAgICAgaWYgdG9wUGl4IDwgIEBsYXN0Qm90UGl4IG9yXG4gICAgICAgICB0b3BSb3cgPD0gQGxhc3RCb3RSb3dcbiAgICAgICAgQGxhc3RUb3BQaXggPSBNYXRoLm1pbiB0b3BQaXgsIEBsYXN0VG9wUGl4XG4gICAgICAgIEBsYXN0Qm90UGl4ID0gTWF0aC5tYXggYm90UGl4LCBAbGFzdEJvdFBpeFxuICAgICAgICBAbGFzdFRvcFJvdyA9IE1hdGgubWluIHRvcFJvdywgQGxhc3RUb3BSb3dcbiAgICAgICAgQGxhc3RCb3RSb3cgPSBNYXRoLm1heCBib3RSb3csIEBsYXN0Qm90Um93XG4gICAgICAgIEBtYXBbQG1hcC5sZW5ndGggLSAxXSA9IFxuICAgICAgICAgIFtAbGFzdFRvcFBpeCwgQGxhc3RCb3RQaXgsIEBsYXN0VG9wUm93LCBAbGFzdEJvdFJvd11cbiAgICAgIGVsc2VcbiAgICAgICAgaWYgZmlyc3ROb2RlXG4gICAgICAgICAgQG1hcFswXVsxXSA9IHRvcFBpeFxuICAgICAgICAgIEBtYXBbMF1bM10gPSBNYXRoLm1heCAwLCB0b3BSb3cgLSAxXG4gICAgICAgIEBtYXAucHVzaCBbQGxhc3RUb3BQaXggPSB0b3BQaXgsXG4gICAgICAgICAgICAgICAgICAgQGxhc3RCb3RQaXggPSBib3RQaXgsIFxuICAgICAgICAgICAgICAgICAgIEBsYXN0VG9wUm93ID0gdG9wUm93LCBcbiAgICAgICAgICAgICAgICAgICBAbGFzdEJvdFJvdyA9IGJvdFJvd11cbiAgICAgIGZpcnN0Tm9kZSA9IG5vXG4gICAgICBcbiAgICBmb3Igbm9kZSBpbiBAbm9kZXMgd2hlbiBub2RlWzJdIGlzbnQgbnVsbFxuICAgICAgYWRkTm9kZVRvTWFwIG5vZGVcbiAgICBcbiAgICBib3RSb3cgPSBAZWRpdG9yLmdldExhc3RTY3JlZW5Sb3coKVxuICAgIHRvcFJvdyA9IE1hdGgubWluICBib3RSb3csIEBsYXN0Qm90Um93ICsgMVxuICAgIGFkZE5vZGVUb01hcCBbQGxhc3RCb3RQaXgsIEBwcmV2aWV3RWxlLnNjcm9sbEhlaWdodCwgdG9wUm93LCBib3RSb3ddXG4gICAgXG4gICAgQG5vZGVzID0gbnVsbFxuICAgICAgXG4gICAgIyB0aW1pbmdzWydtYXAgbWVyZ2UnXSA9IERhdGUubm93KCkgLSBzdGFydDsgc3RhcnQgPSBEYXRlLm5vdygpXG4gICAgIyBzdHIgPSAnJ1xuICAgICMgZm9yIGssIHYgb2YgdGltaW5ncyB0aGVuIHN0ciArPSAgJyAgJyArIGsgKyAnOiAnICsgdlxuICAgICMgbG9nICd0aW1pbmdzJywgc3RyXG4iXX0=
