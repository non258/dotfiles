(function() {
  var Citation;

  module.exports = Citation = (function() {
    function Citation() {}

    Citation.key = null;

    Citation.properties = null;

    Citation.prototype.get = function(field) {
      var j, len, property, ref;
      if (this.properties == null) {
        return null;
      }
      if (field === "key") {
        return this.key;
      }
      ref = this.properties;
      for (j = 0, len = ref.length; j < len; j++) {
        property = ref[j];
        if (property.name === field) {
          return property.content;
        }
      }
      return null;
    };

    Citation.prototype.splitBib = function(text) {
      var balance, ch, delim, i, j, last, len, splits;
      splits = [];
      balance = 0;
      last = -1;
      for (i = j = 0, len = text.length; j < len; i = ++j) {
        ch = text[i];
        if ((ch === ',') && (balance === 0)) {
          splits.push(text.substring(last + 1, i));
          last = i;
        } else if ((ch === '\"') && (balance === 0)) {
          delim = "\"";
          balance++;
        } else if ((ch === '{') && (balance === 0)) {
          delim = '{';
          balance++;
        } else if (balance !== 0) {
          if ((ch === delim) && (delim === '{')) {
            balance++;
          }
          if ((ch === '}') && (delim === '{')) {
            balance--;
          }
          if ((ch === delim) && (delim === "\"")) {
            balance = 0;
          }
        }
      }
      if ((last + 1) !== (text.length - 1)) {
        splits.push(text.substring(last + 1, text.length));
      }
      return splits;
    };

    Citation.prototype.parse = function(text) {
      var bInd, balance, ch, content, eq, i, it, item, items, j, k, len, len1, name, qInd, results, term, termInd;
      if (text == null) {
        return;
      }
      text = text.replace(/\n|\r/g, " ");
      if (text.indexOf("}") === -1) {
        return;
      }
      balance = 1;
      it = text.indexOf("{") + 1;
      if (it === 0) {
        return;
      }
      text = text.substring(it);
      balance = 1;
      for (i = j = 0, len = text.length; j < len; i = ++j) {
        ch = text[i];
        if (ch === '{') {
          balance++;
        }
        if (ch === '}') {
          balance--;
        }
        if (balance === 0) {
          break;
        }
      }
      if (balance !== 0) {
        return;
      }
      text = text.substring(0, i);
      items = this.splitBib(text);
      if (items.length === 0) {
        return;
      }
      this.key = items[0];
      items.splice(0, 1);
      this.key = this.key.replace(/\s+/g, "");
      this.properties = [];
      results = [];
      for (k = 0, len1 = items.length; k < len1; k++) {
        item = items[k];
        eq = item.indexOf("=");
        if (eq === -1 || eq === (item.length - 1)) {
          continue;
        }
        name = item.substring(0, eq).replace(/\s+/g, "").toLowerCase();
        content = item.substring(eq + 1);
        qInd = content.indexOf("\"");
        bInd = content.indexOf("{");
        if ((qInd < 0) && (bInd < 0)) {
          continue;
        }
        if ((qInd !== -1 && qInd < bInd) || (bInd === -1)) {
          content = content.substring(qInd + 1);
          term = "\"";
        } else {
          content = content.substring(bInd + 1);
          term = "}";
        }
        termInd = content.lastIndexOf(term);
        if (termInd < 0) {
          continue;
        }
        content = content.substring(0, termInd);
        content = content.replace(/\s+/g, " ");
        results.push(this.properties.push({
          name: name,
          content: content
        }));
      }
      return results;
    };

    return Citation;

  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2xhdGV4ZXIvbGliL2NpdGF0aW9uLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUE7O0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FDTTs7O0lBQ0osUUFBQyxDQUFBLEdBQUQsR0FBTTs7SUFDTixRQUFDLENBQUEsVUFBRCxHQUFhOzt1QkFDYixHQUFBLEdBQUssU0FBQyxLQUFEO0FBQ0gsVUFBQTtNQUFBLElBQW1CLHVCQUFuQjtBQUFBLGVBQU8sS0FBUDs7TUFDQSxJQUFHLEtBQUEsS0FBUyxLQUFaO0FBQ0UsZUFBTyxJQUFDLENBQUEsSUFEVjs7QUFFQTtBQUFBLFdBQUEscUNBQUE7O1FBQ0UsSUFBMkIsUUFBUSxDQUFDLElBQVQsS0FBaUIsS0FBNUM7QUFBQSxpQkFBTyxRQUFRLENBQUMsUUFBaEI7O0FBREY7QUFFQSxhQUFPO0lBTko7O3VCQU9MLFFBQUEsR0FBVSxTQUFDLElBQUQ7QUFDUixVQUFBO01BQUEsTUFBQSxHQUFTO01BQ1QsT0FBQSxHQUFVO01BQ1YsSUFBQSxHQUFPLENBQUM7QUFDUixXQUFBLDhDQUFBOztRQUNFLElBQUcsQ0FBQyxFQUFBLEtBQU0sR0FBUCxDQUFBLElBQWdCLENBQUMsT0FBQSxLQUFXLENBQVosQ0FBbkI7VUFDRSxNQUFNLENBQUMsSUFBUCxDQUFZLElBQUksQ0FBQyxTQUFMLENBQWUsSUFBQSxHQUFLLENBQXBCLEVBQXVCLENBQXZCLENBQVo7VUFDQSxJQUFBLEdBQU8sRUFGVDtTQUFBLE1BR0ssSUFBRyxDQUFDLEVBQUEsS0FBTSxJQUFQLENBQUEsSUFBaUIsQ0FBQyxPQUFBLEtBQVcsQ0FBWixDQUFwQjtVQUNILEtBQUEsR0FBUTtVQUNSLE9BQUEsR0FGRztTQUFBLE1BR0EsSUFBRyxDQUFDLEVBQUEsS0FBTSxHQUFQLENBQUEsSUFBZ0IsQ0FBQyxPQUFBLEtBQVcsQ0FBWixDQUFuQjtV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QU8sQ0FBUixDQUE1QjtBQUFBLG1CQUFBOztRQUNBLElBQUcsQ0FBQyxJQUFBLEtBQVUsQ0FBQyxDQUFYLElBQWlCLElBQUEsR0FBTyxJQUF6QixDQUFBLElBQWtDLENBQUMsSUFBQSxLQUFRLENBQUMsQ0FBVixDQUFyQztVQUNFLE9BQUEsR0FBVSxPQUFPLENBQUMsU0FBUixDQUFrQixJQUFBLEdBQUssQ0FBdkI7VUFDVixJQUFBLEdBQU8sS0FGVDtTQUFBLE1BQUE7VUFJRSxPQUFBLEdBQVUsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsSUFBQSxHQUFLLENBQXZCO1VBQ1YsSUFBQSxHQUFPLElBTFQ7O1FBTUEsT0FBQSxHQUFVLE9BQU8sQ0FBQyxXQUFSLENBQW9CLElBQXBCO1FBQ1YsSUFBWSxPQUFBLEdBQVUsQ0FBdEI7QUFBQSxtQkFBQTs7UUFDQSxPQUFBLEdBQVUsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsQ0FBbEIsRUFBcUIsT0FBckI7UUFDVixPQUFBLEdBQVUsT0FBTyxDQUFDLE9BQVIsQ0FBZ0IsTUFBaEIsRUFBdUIsR0FBdkI7cUJBQ1YsSUFBQyxDQUFBLFVBQVUsQ0FBQyxJQUFaLENBQWlCO1VBQUMsSUFBQSxFQUFNLElBQVA7VUFBYSxPQUFBLEVBQVMsT0FBdEI7U0FBakI7QUFsQkY7O0lBdEJLOzs7OztBQWpDVCIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzPVxuY2xhc3MgQ2l0YXRpb25cbiAgQGtleTogbnVsbFxuICBAcHJvcGVydGllczogbnVsbFxuICBnZXQ6IChmaWVsZCktPlxuICAgIHJldHVybiBudWxsIGlmIG5vdCBAcHJvcGVydGllcz9cbiAgICBpZiBmaWVsZCBpcyBcImtleVwiXG4gICAgICByZXR1cm4gQGtleVxuICAgIGZvciBwcm9wZXJ0eSBpbiBAcHJvcGVydGllc1xuICAgICAgcmV0dXJuIHByb3BlcnR5LmNvbnRlbnQgaWYgcHJvcGVydHkubmFtZSBpcyBmaWVsZFxuICAgIHJldHVybiBudWxsXG4gIHNwbGl0QmliOiAodGV4dCktPlxuICAgIHNwbGl0cyA9IFtdXG4gICAgYmFsYW5jZSA9IDBcbiAgICBsYXN0ID0gLTFcbiAgICBmb3IgY2gsIGkgaW4gdGV4dFxuICAgICAgaWYgKGNoIGlzICcsJykgYW5kIChiYWxhbmNlIGlzIDApXG4gICAgICAgIHNwbGl0cy5wdXNoKHRleHQuc3Vic3RyaW5nKGxhc3QrMSwgaSkpXG4gICAgICAgIGxhc3QgPSBpXG4gICAgICBlbHNlIGlmIChjaCBpcyAnXFxcIicpIGFuZCAoYmFsYW5jZSBpcyAwKVxuICAgICAgICBkZWxpbSA9IFwiXFxcIlwiXG4gICAgICAgIGJhbGFuY2UrK1xuICAgICAgZWxzZSBpZiAoY2ggaXMgJ3snKSBhbmQgKGJhbGFuY2UgaXMgMClcbiAgICAgICAgZGVsaW0gPSAneydcbiAgICAgICAgYmFsYW5jZSsrXG4gICAgICBlbHNlIGlmIGJhbGFuY2UgaXNudCAwXG4gICAgICAgIGJhbGFuY2UrKyBpZiAoY2ggaXMgZGVsaW0pIGFuZCAoZGVsaW0gaXMgJ3snKVxuICAgICAgICBiYWxhbmNlLS0gaWYgKGNoIGlzICd9JykgYW5kIChkZWxpbSBpcyAneycpXG4gICAgICAgIGJhbGFuY2UgPSAwIGlmIChjaCBpcyBkZWxpbSkgYW5kIChkZWxpbSBpcyBcIlxcXCJcIilcbiAgICBpZiAobGFzdCsxKSBpc250ICh0ZXh0Lmxlbmd0aC0xKVxuICAgICAgc3BsaXRzLnB1c2godGV4dC5zdWJzdHJpbmcobGFzdCsxLHRleHQubGVuZ3RoKSlcbiAgICBzcGxpdHNcblxuICBwYXJzZTogKHRleHQpLT5cbiAgICByZXR1cm4gdW5sZXNzIHRleHQ/XG4gICAgdGV4dCA9IHRleHQucmVwbGFjZSgvXFxufFxcci9nLCBcIiBcIilcbiAgICByZXR1cm4gaWYgdGV4dC5pbmRleE9mKFwifVwiKSBpcyAtMVxuICAgIGJhbGFuY2UgPSAxXG4gICAgaXQgPSB0ZXh0LmluZGV4T2YoXCJ7XCIpICsgMVxuICAgIHJldHVybiBpZiBpdCBpcyAwXG4gICAgdGV4dCA9IHRleHQuc3Vic3RyaW5nKGl0KVxuICAgICNXZSBmaXJzdCBzdHJpcCB0aGUgYmliIGVudHJ5IGludG8gdGhlIGJpdCBpbiBiZXR3ZWVuIEB7Li4ufSBhcyB0aGVyZSBtYXkgYmUgY29tbWVudHMgb3V0c2lkZVxuICAgIGJhbGFuY2UgPSAxXG4gICAgZm9yIGNoLCBpIGluIHRleHRcbiAgICAgIGJhbGFuY2UrKyBpZiBjaCBpcyAneydcbiAgICAgIGJhbGFuY2UtLSBpZiBjaCBpcyAnfSdcbiAgICAgIGJyZWFrIGlmIGJhbGFuY2UgaXMgMFxuICAgIHJldHVybiBpZiBiYWxhbmNlIGlzbnQgMFxuICAgIHRleHQgPSB0ZXh0LnN1YnN0cmluZygwLGkpXG4gICAgaXRlbXMgPSBAc3BsaXRCaWIodGV4dClcbiAgICByZXR1cm4gaWYgaXRlbXMubGVuZ3RoIGlzIDBcbiAgICBAa2V5ID0gaXRlbXNbMF1cbiAgICBpdGVtcy5zcGxpY2UoMCwgMSlcbiAgICBAa2V5ID0gQGtleS5yZXBsYWNlKC9cXHMrL2csXCJcIilcbiAgICBAcHJvcGVydGllcyA9IFtdXG4gICAgZm9yIGl0ZW0gaW4gaXRlbXNcbiAgICAgIGVxID0gaXRlbS5pbmRleE9mKFwiPVwiKVxuICAgICAgY29udGludWUgaWYgZXEgaXMgLTEgb3IgZXEgaXMgKGl0ZW0ubGVuZ3RoIC0gMSlcbiAgICAgIG5hbWUgPSBpdGVtLnN1YnN0cmluZygwLGVxKS5yZXBsYWNlKC9cXHMrL2csXCJcIikudG9Mb3dlckNhc2UoKVxuICAgICAgY29udGVudCA9IGl0ZW0uc3Vic3RyaW5nKGVxKzEpXG4gICAgICBxSW5kID0gY29udGVudC5pbmRleE9mKFwiXFxcIlwiKVxuICAgICAgYkluZCA9IGNvbnRlbnQuaW5kZXhPZihcIntcIilcbiAgICAgIGNvbnRpbnVlIGlmICgocUluZCA8IDApIGFuZCAoYkluZCA8IDApKSAjb3IgKHFJbmQgPiBjb250ZW50Lmxlbmd0aCgpLTEpIG9yIChiSW5kID4gY29udGVudC5sZW5ndGgoKS0xKVxuICAgICAgaWYgKHFJbmQgaXNudCAtMSBhbmQgcUluZCA8IGJJbmQpIG9yIChiSW5kIGlzIC0xKVxuICAgICAgICBjb250ZW50ID0gY29udGVudC5zdWJzdHJpbmcocUluZCsxKVxuICAgICAgICB0ZXJtID0gXCJcXFwiXCJcbiAgICAgIGVsc2VcbiAgICAgICAgY29udGVudCA9IGNvbnRlbnQuc3Vic3RyaW5nKGJJbmQrMSlcbiAgICAgICAgdGVybSA9IFwifVwiXG4gICAgICB0ZXJtSW5kID0gY29udGVudC5sYXN0SW5kZXhPZih0ZXJtKVxuICAgICAgY29udGludWUgaWYgdGVybUluZCA8IDBcbiAgICAgIGNvbnRlbnQgPSBjb250ZW50LnN1YnN0cmluZygwLCB0ZXJtSW5kKVxuICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvXFxzKy9nLFwiIFwiKVxuICAgICAgQHByb3BlcnRpZXMucHVzaCh7bmFtZTogbmFtZSwgY29udGVudDogY29udGVudH0pXG4iXX0=
