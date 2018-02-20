
/*
  lib/utils.coffee
 */

(function() {
  var log,
    slice = [].slice;

  log = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return console.log.apply(console, ['markdown-scroll, utils:'].concat(args));
  };

  module.exports = {
    getVisTopHgtBot: function() {
      var botScrnScrollRow, edtBotBnd, i, j, len, len1, lineEle, lineEles, lineTopBnd, lines, pvwBotBnd, ref, ref1, refLine, refRow, refTopBnd;
      ref = this.editorView.getBoundingClientRect(), this.edtTopBnd = ref.top, edtBotBnd = ref.bottom;
      lineEles = this.editorView.shadowRoot.querySelectorAll('.lines .line[data-screen-row]');
      lines = [];
      for (i = 0, len = lineEles.length; i < len; i++) {
        lineEle = lineEles[i];
        lineTopBnd = lineEle.getBoundingClientRect().top;
        lines.push([+lineEle.getAttribute('data-screen-row'), lineTopBnd]);
      }
      if (lines.length === 0) {
        log('no visible lines in editor');
        this.scrnTopOfs = this.scrnBotOfs = this.pvwTopB = this.previewTopOfs = this.previewBotOfs = 0;
        return;
      }
      lines.sort();
      for (j = 0, len1 = lines.length; j < len1; j++) {
        refLine = lines[j];
        if (refLine[1] >= this.edtTopBnd) {
          break;
        }
      }
      refRow = refLine[0], refTopBnd = refLine[1];
      this.scrnTopOfs = (refRow * this.chrHgt) - (refTopBnd - this.edtTopBnd);
      this.scrnHeight = edtBotBnd - this.edtTopBnd;
      this.scrnBotOfs = this.scrnTopOfs + this.scrnHeight;
      botScrnScrollRow = this.editor.clipScreenPosition([9e9, 9e9]).row;
      this.scrnScrollHgt = (botScrnScrollRow + 1) * this.chrHgt;
      ref1 = this.previewEle.getBoundingClientRect(), this.pvwTopBnd = ref1.top, pvwBotBnd = ref1.bottom;
      this.previewTopOfs = this.previewEle.scrollTop;
      return this.previewBotOfs = this.previewTopOfs + (pvwBotBnd - this.pvwTopBnd);
    },
    getEleTopHgtBot: function(ele, scrn) {
      var bot, eleBotBnd, eleTopBnd, hgt, ref, top;
      if (scrn == null) {
        scrn = true;
      }
      ref = ele.getBoundingClientRect(), eleTopBnd = ref.top, eleBotBnd = ref.bottom;
      top = scrn ? this.scrnTopOfs + (eleTopBnd - this.edtTopBnd) : this.previewTopOfs + (eleTopBnd - this.pvwTopBnd);
      hgt = eleBotBnd - eleTopBnd;
      bot = top + hgt;
      return [top, hgt, bot];
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXNjcm9sbC1zeW5jL2xpYi91dGlscy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBOzs7O0FBQUE7QUFBQSxNQUFBLEdBQUE7SUFBQTs7RUFJQSxHQUFBLEdBQU0sU0FBQTtBQUNKLFFBQUE7SUFESztXQUNMLE9BQU8sQ0FBQyxHQUFHLENBQUMsS0FBWixDQUFrQixPQUFsQixFQUEyQixDQUFDLHlCQUFELENBQTJCLENBQUMsTUFBNUIsQ0FBbUMsSUFBbkMsQ0FBM0I7RUFESTs7RUFHTixNQUFNLENBQUMsT0FBUCxHQUVFO0lBQUEsZUFBQSxFQUFpQixTQUFBO0FBQ2YsVUFBQTtNQUFBLE1BQXVDLElBQUMsQ0FBQSxVQUFVLENBQUMscUJBQVosQ0FBQSxDQUF2QyxFQUFNLElBQUMsQ0FBQSxnQkFBTixHQUFELEVBQTBCLGdCQUFSO01BQ2xCLFFBQUEsR0FBVyxJQUFDLENBQUEsVUFBVSxDQUFDLFVBQVUsQ0FBQyxnQkFBdkIsQ0FBd0MsK0JBQXhDO01BQ1gsS0FBQSxHQUFRO0FBQ1IsV0FBQSwwQ0FBQTs7UUFDUSxhQUFjLE9BQU8sQ0FBQyxxQkFBUixDQUFBLEVBQW5CO1FBQ0QsS0FBSyxDQUFDLElBQU4sQ0FBVyxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVIsQ0FBcUIsaUJBQXJCLENBQUYsRUFBMkMsVUFBM0MsQ0FBWDtBQUZGO01BR0EsSUFBRyxLQUFLLENBQUMsTUFBTixLQUFnQixDQUFuQjtRQUNFLEdBQUEsQ0FBSSw0QkFBSjtRQUNBLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUEsT0FBRCxHQUFXLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUMsQ0FBQSxhQUFELEdBQWlCO0FBQ3pFLGVBSEY7O01BSUEsS0FBSyxDQUFDLElBQU4sQ0FBQTtBQUNBLFdBQUEseUNBQUE7O1FBQ0UsSUFBRyxPQUFRLENBQUEsQ0FBQSxDQUFSLElBQWMsSUFBQyxDQUFBLFNBQWxCO0FBQWlDLGdCQUFqQzs7QUFERjtNQUVDLG1CQUFELEVBQVM7TUFDVCxJQUFDLENBQUEsVUFBRCxHQUFjLENBQUMsTUFBQSxHQUFTLElBQUMsQ0FBQSxNQUFYLENBQUEsR0FBcUIsQ0FBQyxTQUFBLEdBQVksSUFBQyxDQUFBLFNBQWQ7TUFDbkMsSUFBQyxDQUFBLFVBQUQsR0FBYyxTQUFBLEdBQVksSUFBQyxDQUFBO01BQzNCLElBQUMsQ0FBQSxVQUFELEdBQWMsSUFBQyxDQUFBLFVBQUQsR0FBYyxJQUFDLENBQUE7TUFDN0IsZ0JBQUEsR0FBbUIsSUFBQyxDQUFBLE1BQU0sQ0FBQyxrQkFBUixDQUEyQixDQUFDLEdBQUQsRUFBTSxHQUFOLENBQTNCLENBQXNDLENBQUM7TUFDMUQsSUFBQyxDQUFBLGFBQUQsR0FBaUIsQ0FBQyxnQkFBQSxHQUFtQixDQUFwQixDQUFBLEdBQXlCLElBQUMsQ0FBQTtNQUUzQyxPQUF1QyxJQUFDLENBQUEsVUFBVSxDQUFDLHFCQUFaLENBQUEsQ0FBdkMsRUFBTSxJQUFDLENBQUEsaUJBQU4sR0FBRCxFQUEwQixpQkFBUjtNQUNsQixJQUFDLENBQUEsYUFBRCxHQUFpQixJQUFDLENBQUEsVUFBVSxDQUFDO2FBQzdCLElBQUMsQ0FBQSxhQUFELEdBQWlCLElBQUMsQ0FBQSxhQUFELEdBQWlCLENBQUMsU0FBQSxHQUFZLElBQUMsQ0FBQSxTQUFkO0lBdkJuQixDQUFqQjtJQXlCQSxlQUFBLEVBQWlCLFNBQUMsR0FBRCxFQUFNLElBQU47QUFDZixVQUFBOztRQURxQixPQUFPOztNQUM1QixNQUFxQyxHQUFHLENBQUMscUJBQUosQ0FBQSxDQUFyQyxFQUFLLGdCQUFKLEdBQUQsRUFBd0IsZ0JBQVI7TUFDaEIsR0FBQSxHQUFTLElBQUgsR0FBYSxJQUFDLENBQUEsVUFBRCxHQUFpQixDQUFDLFNBQUEsR0FBWSxJQUFDLENBQUEsU0FBZCxDQUE5QixHQUNhLElBQUMsQ0FBQSxhQUFELEdBQWlCLENBQUMsU0FBQSxHQUFZLElBQUMsQ0FBQSxTQUFkO01BQ3BDLEdBQUEsR0FBTSxTQUFBLEdBQVk7TUFDbEIsR0FBQSxHQUFNLEdBQUEsR0FBTTthQUNaLENBQUMsR0FBRCxFQUFNLEdBQU4sRUFBVyxHQUFYO0lBTmUsQ0F6QmpCOztBQVRGIiwic291cmNlc0NvbnRlbnQiOlsiIyMjXG4gIGxpYi91dGlscy5jb2ZmZWVcbiMjI1xuXG5sb2cgPSAoYXJncy4uLikgLT4gXG4gIGNvbnNvbGUubG9nLmFwcGx5IGNvbnNvbGUsIFsnbWFya2Rvd24tc2Nyb2xsLCB1dGlsczonXS5jb25jYXQgYXJnc1xuXG5tb2R1bGUuZXhwb3J0cyA9XG5cbiAgZ2V0VmlzVG9wSGd0Qm90OiAtPlxuICAgIHt0b3A6IEBlZHRUb3BCbmQsIGJvdHRvbTogZWR0Qm90Qm5kfSA9IEBlZGl0b3JWaWV3LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgbGluZUVsZXMgPSBAZWRpdG9yVmlldy5zaGFkb3dSb290LnF1ZXJ5U2VsZWN0b3JBbGwgJy5saW5lcyAubGluZVtkYXRhLXNjcmVlbi1yb3ddJ1xuICAgIGxpbmVzID0gW11cbiAgICBmb3IgbGluZUVsZSBpbiBsaW5lRWxlc1xuICAgICAge3RvcDogbGluZVRvcEJuZH0gPSBsaW5lRWxlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICBsaW5lcy5wdXNoIFsrbGluZUVsZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtc2NyZWVuLXJvdycpLCBsaW5lVG9wQm5kXVxuICAgIGlmIGxpbmVzLmxlbmd0aCBpcyAwXG4gICAgICBsb2cgJ25vIHZpc2libGUgbGluZXMgaW4gZWRpdG9yJ1xuICAgICAgQHNjcm5Ub3BPZnMgPSBAc2NybkJvdE9mcyA9IEBwdndUb3BCID0gQHByZXZpZXdUb3BPZnMgPSBAcHJldmlld0JvdE9mcyA9IDBcbiAgICAgIHJldHVyblxuICAgIGxpbmVzLnNvcnQoKVxuICAgIGZvciByZWZMaW5lIGluIGxpbmVzXG4gICAgICBpZiByZWZMaW5lWzFdID49IEBlZHRUb3BCbmQgdGhlbiBicmVha1xuICAgIFtyZWZSb3csIHJlZlRvcEJuZF0gPSByZWZMaW5lXG4gICAgQHNjcm5Ub3BPZnMgPSAocmVmUm93ICogQGNockhndCkgLSAocmVmVG9wQm5kIC0gQGVkdFRvcEJuZClcbiAgICBAc2NybkhlaWdodCA9IGVkdEJvdEJuZCAtIEBlZHRUb3BCbmRcbiAgICBAc2NybkJvdE9mcyA9IEBzY3JuVG9wT2ZzICsgQHNjcm5IZWlnaHRcbiAgICBib3RTY3JuU2Nyb2xsUm93ID0gQGVkaXRvci5jbGlwU2NyZWVuUG9zaXRpb24oWzllOSwgOWU5XSkucm93XG4gICAgQHNjcm5TY3JvbGxIZ3QgPSAoYm90U2NyblNjcm9sbFJvdyArIDEpICogQGNockhndFxuICAgIFxuICAgIHt0b3A6IEBwdndUb3BCbmQsIGJvdHRvbTogcHZ3Qm90Qm5kfSA9IEBwcmV2aWV3RWxlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgQHByZXZpZXdUb3BPZnMgPSBAcHJldmlld0VsZS5zY3JvbGxUb3BcbiAgICBAcHJldmlld0JvdE9mcyA9IEBwcmV2aWV3VG9wT2ZzICsgKHB2d0JvdEJuZCAtIEBwdndUb3BCbmQpXG5cbiAgZ2V0RWxlVG9wSGd0Qm90OiAoZWxlLCBzY3JuID0geWVzKSAtPlxuICAgIHt0b3A6ZWxlVG9wQm5kLCBib3R0b206IGVsZUJvdEJuZH0gPSBlbGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICB0b3AgPSBpZiBzY3JuIHRoZW4gQHNjcm5Ub3BPZnMgICAgKyAoZWxlVG9wQm5kIC0gQGVkdFRvcEJuZCkgXFxcbiAgICAgICAgICAgICAgICAgIGVsc2UgQHByZXZpZXdUb3BPZnMgKyAoZWxlVG9wQm5kIC0gQHB2d1RvcEJuZClcbiAgICBoZ3QgPSBlbGVCb3RCbmQgLSBlbGVUb3BCbmRcbiAgICBib3QgPSB0b3AgKyBoZ3RcbiAgICBbdG9wLCBoZ3QsIGJvdF1cbiAgIl19
