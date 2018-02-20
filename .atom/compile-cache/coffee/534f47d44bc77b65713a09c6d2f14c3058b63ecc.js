
/*
  lib/scroll.coffee
 */

(function() {
  var log,
    slice = [].slice;

  log = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    console.log.apply(console, ['markdown-scroll, scroll:'].concat(args));
    return args[0];
  };

  module.exports = {
    chkScroll: function(eventType, auto) {
      var cursorOfs, scrollFrac;
      if (this.scrollTimeout) {
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = null;
      }
      if (!this.editor.alive) {
        this.stopTracking();
        return;
      }
      if (eventType !== 'changed') {
        this.getVisTopHgtBot();
        if (this.scrnTopOfs !== this.lastScrnTopOfs || this.scrnBotOfs !== this.lastScrnBotOfs || this.previewTopOfs !== this.lastPvwTopOfs || this.previewBotOfs !== this.lastPvwBotOfs) {
          this.lastScrnTopOfs = this.scrnTopOfs;
          this.lastScrnBotOfs = this.scrnBotOfs;
          this.lastPvwTopOfs = this.previewTopOfs;
          this.lastPvwBotOfs = this.previewBotOfs;
          this.setMap(false);
        }
      }
      switch (eventType) {
        case 'init':
          cursorOfs = this.editor.getCursorScreenPosition().row * this.chrHgt;
          if ((this.scrnTopOfs <= cursorOfs && cursorOfs <= this.scrnBotOfs)) {
            return this.setScroll(cursorOfs);
          } else {
            return this.setScroll(this.scrnTopOfs);
          }
          break;
        case 'changed':
        case 'cursorMoved':
          this.setScroll(this.editor.getCursorScreenPosition().row * this.chrHgt);
          return this.ignoreScrnScrollUntil = Date.now() + 500;
        case 'newtop':
          if (this.ignoreScrnScrollUntil && Date.now() < this.ignoreScrnScrollUntil) {
            break;
          }
          this.ignoreScrnScrollUntil = null;
          scrollFrac = this.scrnTopOfs / (this.scrnScrollHgt - this.scrnHeight);
          this.setScroll(this.scrnTopOfs + (this.scrnHeight * scrollFrac));
          if (!auto) {
            return this.scrollTimeout = setTimeout(((function(_this) {
              return function() {
                return _this.chkScroll('newtop', true);
              };
            })(this)), 300);
          }
      }
    },
    setScroll: function(scrnPosPix) {
      var botPix, botRow, i, idx, lastBotPix, lastBotRow, lastMapping, len, mapping, pix1, pix2, pvwPosPix, ref, row1, row2, spanFrac, topPix, topRow, visOfs;
      scrnPosPix = Math.max(0, scrnPosPix);
      lastMapping = null;
      ref = this.map;
      for (idx = i = 0, len = ref.length; i < len; idx = ++i) {
        mapping = ref[idx];
        topPix = mapping[0], botPix = mapping[1], topRow = mapping[2], botRow = mapping[3];
        if (((topRow * this.chrHgt) <= scrnPosPix && scrnPosPix < ((botRow + 1) * this.chrHgt)) || idx === this.map.length - 1) {
          row1 = topRow;
          row2 = botRow + 1;
          pix1 = topPix;
          pix2 = botPix;
          break;
        } else {
          if (lastMapping == null) {
            lastMapping = mapping;
          }
          lastBotPix = lastMapping[1];
          lastBotRow = lastMapping[3] + 1;
          if (((lastBotRow * this.chrHgt) <= scrnPosPix && scrnPosPix < (topRow * this.chrHgt))) {
            row1 = lastBotRow;
            row2 = topRow;
            pix1 = lastBotPix;
            pix2 = topPix;
            break;
          }
        }
        lastMapping = mapping;
      }
      spanFrac = (scrnPosPix - (row1 * this.chrHgt)) / ((row2 - row1) * this.chrHgt);
      visOfs = scrnPosPix - this.scrnTopOfs;
      pvwPosPix = pix1 + ((pix2 - pix1) * spanFrac);
      return this.previewEle.scrollTop = pvwPosPix - visOfs;
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL21hcmtkb3duLXNjcm9sbC1zeW5jL2xpYi9zY3JvbGwuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7OztBQUFBO0FBQUEsTUFBQSxHQUFBO0lBQUE7O0VBSUEsR0FBQSxHQUFNLFNBQUE7QUFDSixRQUFBO0lBREs7SUFDTCxPQUFPLENBQUMsR0FBRyxDQUFDLEtBQVosQ0FBa0IsT0FBbEIsRUFBMkIsQ0FBQywwQkFBRCxDQUE0QixDQUFDLE1BQTdCLENBQW9DLElBQXBDLENBQTNCO1dBQ0EsSUFBSyxDQUFBLENBQUE7RUFGRDs7RUFJTixNQUFNLENBQUMsT0FBUCxHQUVFO0lBQUEsU0FBQSxFQUFXLFNBQUMsU0FBRCxFQUFZLElBQVo7QUFDVCxVQUFBO01BQUEsSUFBRyxJQUFDLENBQUEsYUFBSjtRQUNFLFlBQUEsQ0FBYSxJQUFDLENBQUEsYUFBZDtRQUNBLElBQUMsQ0FBQSxhQUFELEdBQWlCLEtBRm5COztNQUlBLElBQUcsQ0FBSSxJQUFDLENBQUEsTUFBTSxDQUFDLEtBQWY7UUFBMEIsSUFBQyxDQUFBLFlBQUQsQ0FBQTtBQUFpQixlQUEzQzs7TUFFQSxJQUFHLFNBQUEsS0FBZSxTQUFsQjtRQUNFLElBQUMsQ0FBQSxlQUFELENBQUE7UUFDQSxJQUFHLElBQUMsQ0FBQSxVQUFELEtBQW9CLElBQUMsQ0FBQSxjQUFyQixJQUNBLElBQUMsQ0FBQSxVQUFELEtBQW9CLElBQUMsQ0FBQSxjQURyQixJQUVBLElBQUMsQ0FBQSxhQUFELEtBQW9CLElBQUMsQ0FBQSxhQUZyQixJQUdBLElBQUMsQ0FBQSxhQUFELEtBQW9CLElBQUMsQ0FBQSxhQUh4QjtVQUlFLElBQUMsQ0FBQSxjQUFELEdBQWtCLElBQUMsQ0FBQTtVQUNuQixJQUFDLENBQUEsY0FBRCxHQUFrQixJQUFDLENBQUE7VUFDbkIsSUFBQyxDQUFBLGFBQUQsR0FBa0IsSUFBQyxD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R0FBYztBQW5CaEI7TUFxQkEsUUFBQSxHQUFZLENBQUMsVUFBQSxHQUFhLENBQUMsSUFBQSxHQUFPLElBQUMsQ0FBQSxNQUFULENBQWQsQ0FBQSxHQUFrQyxDQUFDLENBQUMsSUFBQSxHQUFPLElBQVIsQ0FBQSxHQUFnQixJQUFDLENBQUEsTUFBbEI7TUFDOUMsTUFBQSxHQUFhLFVBQUEsR0FBYSxJQUFDLENBQUE7TUFDM0IsU0FBQSxHQUFZLElBQUEsR0FBTyxDQUFDLENBQUMsSUFBQSxHQUFPLElBQVIsQ0FBQSxHQUFnQixRQUFqQjthQUNuQixJQUFDLENBQUEsVUFBVSxDQUFDLFNBQVosR0FBd0IsU0FBQSxHQUFZO0lBM0IzQixDQW5EWDs7QUFWRiIsInNvdXJjZXNDb250ZW50IjpbIiMjI1xuICBsaWIvc2Nyb2xsLmNvZmZlZVxuIyMjXG5cbmxvZyA9IChhcmdzLi4uKSAtPiBcbiAgY29uc29sZS5sb2cuYXBwbHkgY29uc29sZSwgWydtYXJrZG93bi1zY3JvbGwsIHNjcm9sbDonXS5jb25jYXQgYXJnc1xuICBhcmdzWzBdXG5cbm1vZHVsZS5leHBvcnRzID1cbiAgXG4gIGNoa1Njcm9sbDogKGV2ZW50VHlwZSwgYXV0bykgLT4gXG4gICAgaWYgQHNjcm9sbFRpbWVvdXRcbiAgICAgIGNsZWFyVGltZW91dCBAc2Nyb2xsVGltZW91dFxuICAgICAgQHNjcm9sbFRpbWVvdXQgPSBudWxsXG4gICAgICBcbiAgICBpZiBub3QgQGVkaXRvci5hbGl2ZSB0aGVuIEBzdG9wVHJhY2tpbmcoKTsgcmV0dXJuXG5cbiAgICBpZiBldmVudFR5cGUgaXNudCAnY2hhbmdlZCdcbiAgICAgIEBnZXRWaXNUb3BIZ3RCb3QoKVxuICAgICAgaWYgQHNjcm5Ub3BPZnMgICAgaXNudCBAbGFzdFNjcm5Ub3BPZnMgb3JcbiAgICAgICAgIEBzY3JuQm90T2ZzICAgIGlzbnQgQGxhc3RTY3JuQm90T2ZzIG9yXG4gICAgICAgICBAcHJldmlld1RvcE9mcyBpc250IEBsYXN0UHZ3VG9wT2ZzICBvclxuICAgICAgICAgQHByZXZpZXdCb3RPZnMgaXNudCBAbGFzdFB2d0JvdE9mc1xuICAgICAgICBAbGFzdFNjcm5Ub3BPZnMgPSBAc2NyblRvcE9mc1xuICAgICAgICBAbGFzdFNjcm5Cb3RPZnMgPSBAc2NybkJvdE9mc1xuICAgICAgICBAbGFzdFB2d1RvcE9mcyAgPSBAcHJldmlld1RvcE9mc1xuICAgICAgICBAbGFzdFB2d0JvdE9mcyAgPSBAcHJldmlld0JvdE9mc1xuICAgIFxuICAgICAgIyB7d2lkdGg6c2NyblcsIGhlaWdodDpzY3JuSH0gPSBAZWRpdG9yVmlldy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgIyB7d2lkdGg6cHZ3VywgaGVpZ2h0OnB2d0h9ICAgPSBAcHJldmlld0VsZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgIyBpZiBzY3JuVyBpc250IEBsYXN0U2Nyblcgb3JcbiAgICAgICMgICAgc2NybkggaXNudCBAbGFzdFNjcm5IIG9yXG4gICAgICAjICAgIHB2d1cgIGlzbnQgQGxhc3RQdndXICBvclxuICAgICAgIyAgICBwdndIICBpc250IEBsYXN0UHZ3SFxuICAgICAgIyAgIEBsYXN0U2NyblcgPSBzY3JuVyAgICBcbiAgICAgICMgICBAbGFzdFNjcm5IID0gc2NybkhcbiAgICAgICMgICBAbGFzdFB2d1cgID0gcHZ3VyBcbiAgICAgICMgICBAbGFzdFB2d0ggID0gcHZ3SCBcbiAgICAgIFxuICAgICAgICBAc2V0TWFwIG5vXG4gICAgXG4gICAgc3dpdGNoIGV2ZW50VHlwZVxuICAgICAgd2hlbiAnaW5pdCdcbiAgICAgICAgY3Vyc29yT2ZzICA9IEBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKS5yb3cgKiBAY2hySGd0XG4gICAgICAgIGlmIEBzY3JuVG9wT2ZzIDw9IGN1cnNvck9mcyA8PSBAc2NybkJvdE9mcyBcbiAgICAgICAgICAgICBAc2V0U2Nyb2xsIGN1cnNvck9mc1xuICAgICAgICBlbHNlIEBzZXRTY3JvbGwgQHNjcm5Ub3BPZnNcbiAgICAgICAgICBcbiAgICAgIHdoZW4gJ2NoYW5nZWQnLCAnY3Vyc29yTW92ZWQnIFxuICAgICAgICBAc2V0U2Nyb2xsIEBlZGl0b3IuZ2V0Q3Vyc29yU2NyZWVuUG9zaXRpb24oKS5yb3cgKiBAY2hySGd0XG4gICAgICAgIEBpZ25vcmVTY3JuU2Nyb2xsVW50aWwgPSBEYXRlLm5vdygpICsgNTAwXG4gICAgICBcbiAgICAgIHdoZW4gJ25ld3RvcCdcbiAgICAgICAgaWYgQGlnbm9yZVNjcm5TY3JvbGxVbnRpbCBhbmRcbiAgICAgICAgICAgRGF0ZS5ub3coKSA8IEBpZ25vcmVTY3JuU2Nyb2xsVW50aWwgdGhlbiBicmVha1xuICAgICAgICBAaWdub3JlU2NyblNjcm9sbFVudGlsID0gbnVsbFxuICAgICAgICBzY3JvbGxGcmFjID0gQHNjcm5Ub3BPZnMgLyAoQHNjcm5TY3JvbGxIZ3QgLSBAc2NybkhlaWdodClcbiAgICAgICAgQHNldFNjcm9sbCAgIEBzY3JuVG9wT2ZzICsgKEBzY3JuSGVpZ2h0ICogc2Nyb2xsRnJhYylcbiAgICAgICAgaWYgbm90IGF1dG9cbiAgICAgICAgICBAc2Nyb2xsVGltZW91dCA9IHNldFRpbWVvdXQgKD0+IEBjaGtTY3JvbGwgJ25ld3RvcCcsIHllcyksIDMwMFxuICBcbiAgc2V0U2Nyb2xsOiAoc2NyblBvc1BpeCkgLT5cbiAgICBzY3JuUG9zUGl4ID0gTWF0aC5tYXggMCwgc2NyblBvc1BpeFxuICAgIGxhc3RNYXBwaW5nID0gbnVsbFxuICAgIGZvciBtYXBwaW5nLCBpZHggaW4gQG1hcFxuICAgICAgW3RvcFBpeCwgYm90UGl4LCB0b3BSb3csIGJvdFJvd10gPSBtYXBwaW5nXG4gICAgICBpZiAodG9wUm93ICogQGNockhndCkgPD0gc2NyblBvc1BpeCA8ICgoYm90Um93KzEpICogQGNockhndCkgb3IgXG4gICAgICAgICAgaWR4IGlzIEBtYXAubGVuZ3RoIC0gMVxuICAgICAgICByb3cxID0gdG9wUm93XG4gICAgICAgIHJvdzIgPSBib3RSb3cgKyAxXG4gICAgICAgIHBpeDEgPSB0b3BQaXhcbiAgICAgICAgcGl4MiA9IGJvdFBpeFxuICAgICAgICBicmVhayAgICAgIFxuICAgICAgZWxzZVxuICAgICAgICBsYXN0TWFwcGluZyA/PSBtYXBwaW5nXG4gICAgICAgIGxhc3RCb3RQaXggPSBsYXN0TWFwcGluZ1sxXVxuICAgICAgICBsYXN0Qm90Um93ID0gbGFzdE1hcHBpbmdbM10gKyAxXG4gICAgICAgIGlmIChsYXN0Qm90Um93ICogQGNockhndCkgPD0gc2NyblBvc1BpeCA8ICh0b3BSb3cgKiBAY2hySGd0KVxuICAgICAgICAgIHJvdzEgPSBsYXN0Qm90Um93XG4gICAgICAgICAgcm93MiA9IHRvcFJvd1xuICAgICAgICAgIHBpeDEgPSBsYXN0Qm90UGl4XG4gICAgICAgICAgcGl4MiA9IHRvcFBpeFxuICAgICAgICAgIGJyZWFrXG4gICAgICBsYXN0TWFwcGluZyA9IG1hcHBpbmdcbiAgICAgIFxuICAgIHNwYW5GcmFjICA9IChzY3JuUG9zUGl4IC0gKHJvdzEgKiBAY2hySGd0KSkgLyAoKHJvdzIgLSByb3cxKSAqIEBjaHJIZ3QpXG4gICAgdmlzT2ZzICAgID0gIHNjcm5Qb3NQaXggLSBAc2NyblRvcE9mc1xuICAgIHB2d1Bvc1BpeCA9IHBpeDEgKyAoKHBpeDIgLSBwaXgxKSAqIHNwYW5GcmFjKVxuICAgIEBwcmV2aWV3RWxlLnNjcm9sbFRvcCA9IHB2d1Bvc1BpeCAtIHZpc09mc1xuICAgIFxuIl19
