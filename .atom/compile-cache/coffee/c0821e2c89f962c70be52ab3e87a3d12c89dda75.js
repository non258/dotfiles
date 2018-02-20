(function() {
  var $, $$, $$$, ConnectorPluginView, TextEditorView, View, _, async, ref,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  ref = require('atom-space-pen-views'), $ = ref.$, $$ = ref.$$, $$$ = ref.$$$, View = ref.View, TextEditorView = ref.TextEditorView;

  async = require('async');

  _ = require('lodash');

  module.exports = ConnectorPluginView = (function(superClass) {
    extend(ConnectorPluginView, superClass);

    ConnectorPluginView.content = function(params) {
      var defaultSearch;
      defaultSearch = _.get(params, 'connector.defaultSerach' || '');
      return this.div({
        "class": "imdoneio-plugin-view"
      }, (function(_this) {
        return function() {
          _this.div({
            outlet: 'findIssues',
            "class": 'block find-issues'
          }, function() {
            _this.div({
              "class": 'input-med'
            }, function() {
              return _this.subview('findIssuesField', new TextEditorView({
                mini: true,
                placeholderText: defaultSearch
              }));
            });
            return _this.div({
              "class": 'btn-group btn-group-find'
            }, function() {
              _this.button({
                click: 'doFind',
                "class": 'btn btn-primary inline-block-tight'
              }, function() {
                return _this.span({
                  "class": 'icon icon-mark-github'
                }, 'Find Issues');
              });
              return _this.button({
                click: 'newIssue',
                "class": 'btn btn-success inline-block-tight'
              }, 'New Issue');
            });
          });
          return _this.div({
            "class": 'issues-container'
          }, function() {
            _this.div({
              outlet: 'searchResult',
              "class": 'issue-list search-result'
            });
            return _this.div({
              outlet: 'relatedIssues',
              "class": 'issue-list related-issues'
            });
          });
        };
      })(this));
    };

    function ConnectorPluginView(arg) {
      this.repo = arg.repo, this.imdoneView = arg.imdoneView, this.connector = arg.connector;
      ConnectorPluginView.__super__.constructor.apply(this, arguments);
      this.client = require('../services/imdoneio-client').instance;
      this.handleEvents();
    }

    ConnectorPluginView.prototype.setTask = function(task1) {
      this.task = task1;
    };

    ConnectorPluginView.prototype.setConnector = function(connector) {
      this.connector = connector;
    };

    ConnectorPluginView.prototype.getIssueIds = function(task) {
      var metaData;
      this.idMetaKey = this.connector.config.idMetaKey;
      if (!task) {
        task = this.task;
      }
      if (!task) {
        return null;
      }
      metaData = task.getMetaData();
      if (this.idMetaKey && metaData) {
        return metaData[this.idMetaKey];
      }
    };

    ConnectorPluginView.prototype.handleEvents = function() {
      var self;
      self = this;
      this.findIssuesField.on('keyup', (function(_this) {
        return function(e) {
          var code;
          code = e.keyCode || e.which;
          if (code === 13) {
            return _this.doFind();
          }
        };
      })(this));
      this.on('click', '.issue-add', function(e) {
        var id;
        id = $(this).attr('data-issue-number');
        $(this).closest('li').remove();
        self.task.addMetaData(self.idMetaKey, id);
        return self.repo.modifyTask(self.task, true, function(err, result) {
          self.issues = self.getIssueIds();
          self.showRelatedIssues();
          return self.imdoneView.emit("task.modified", self.task);
        });
      });
      return this.on('click', '.issue-remove', function(e) {
        var id;
        id = $(this).attr('data-issue-number');
        $(this).closest('li').remove();
        self.task.removeMetaData(self.idMetaKey, id);
        return self.repo.modifyTask(self.task, true, function(err, result) {
          self.issues = self.getIssueIds();
          self.doFind();
          return self.imdoneView.emit("task.modified", self.task);
        });
      });
    };

    ConnectorPluginView.prototype.show = function(issues1) {
      this.issues = issues1;
      this.findIssuesField.focus();
      this.showRelatedIssues();
      return this.doFind();
    };

    ConnectorPluginView.prototype.showRelatedIssues = function() {
      this.relatedIssues.empty();
      if (!this.issues) {
        return;
      }
      this.relatedIssues.html(this.$spinner());
      return async.map(this.issues, (function(_this) {
        return function(number, cb) {
          return _this.client.getIssue(_this.connector, number, function(err, issue) {
            return cb(err, issue);
          });
        };
      })(this), (function(_this) {
        return function(err, results) {
          if (err) {

          } else {
            return _this.relatedIssues.html(_this.$issueList(results));
          }
        };
      })(this));
    };

    ConnectorPluginView.prototype.getSearchQry = function() {
      var qry;
      qry = this.findIssuesField.getModel().getText();
      if (!qry) {
        return this.connector.defaultSearch;
      }
      return qry;
    };

    ConnectorPluginView.prototype.doFind = function(e) {
      var searchText;
      this.searchResult.html(this.$spinner());
      searchText = this.getSearchQry();
      return this.client.findIssues(this.connector, searchText, (function(_this) {
        return function(e, data) {
          if (data) {
            return _this.searchResult.html(_this.$issueList(data.items, true));
          } else {
            return _this.searchResult.html('No issues found');
          }
        };
      })(this));
    };

    ConnectorPluginView.prototype.newIssue = function() {
      return this.client.newIssue(this.connector, {
        title: this.task.text
      }, (function(_this) {
        return function(e, data) {
          _this.task.addMetaData(_this.idMetaKey, data.number);
          return _this.repo.modifyTask(_this.task, true, function(err, result) {
            _this.issues = _this.getIssueIds();
            _this.imdoneView.emit("task.modified", _this.task);
            return _this.showRelatedIssues();
          });
        };
      })(this));
    };

    ConnectorPluginView.prototype.$spinner = function() {
      return $$(function() {
        return this.div({
          "class": 'spinner'
        }, (function(_this) {
          return function() {
            return _this.span({
              "class": 'loading loading-spinner-large inline-block'
            });
          };
        })(this));
      });
    };

    ConnectorPluginView.prototype.$issueList = function(issues, search) {
      var numbers;
      numbers = this.issues;
      return $$(function() {
        return this.ol((function(_this) {
          return function() {
            var i, issue, len, results1;
            results1 = [];
            for (i = 0, len = issues.length; i < len; i++) {
              issue = issues[i];
              if (!(search && numbers && numbers.indexOf(issue.number.toString()) > -1)) {
                results1.push(_this.li({
                  "class": 'issue well',
                  "data-issue-id": issue.id
                }, function() {
                  _this.div({
                    "class": 'issue-title'
                  }, function() {
                    return _this.p(function() {
                      _this.span(issue.title + " ");
                      return _this.a({
                        href: issue.html_url,
                        "class": 'issue-number'
                      }, "#" + issue.number);
                    });
                  });
                  return _this.div({
                    "class": 'issue-state'
                  }, function() {
                    return _this.p(function() {
                      if (issue.state === "open") {
                        _this.span({
                          "class": 'badge badge-success icon icon-issue-opened'
                        }, 'Open');
                      } else {
                        _this.span({
                          "class": 'badge badge-error icon icon-issue-closed'
                        }, 'Closed');
                      }
                      if (search) {
                        return _this.a({
                          href: '#',
                          "class": 'issue-add',
                          "data-issue-number": issue.number
                        }, function() {
                          return _this.span({
                            "class": 'icon icon-diff-added mega-icon pull-right'
                          });
                        });
                      } else {
                        return _this.a({
                          href: '#',
                          "class": 'issue-remove',
                          "data-issue-number": issue.number
                        }, function() {
                          return _this.span({
                            "class": 'icon icon-diff-removed mega-icon pull-right'
                          });
                        });
                      }
                    });
                  });
                }));
              } else {
                results1.push(void 0);
              }
            }
            return results1;
          };
        })(this));
      });
    };

    return ConnectorPluginView;

  })(View);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2ltZG9uZS1hdG9tL2xpYi9wbHVnaW5zL3BsdWdpbi12aWV3LmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUFBLE1BQUEsb0VBQUE7SUFBQTs7O0VBQUEsTUFBcUMsT0FBQSxDQUFRLHNCQUFSLENBQXJDLEVBQUMsU0FBRCxFQUFJLFdBQUosRUFBUSxhQUFSLEVBQWEsZUFBYixFQUFtQjs7RUFDbkIsS0FBQSxHQUFRLE9BQUEsQ0FBUSxPQUFSOztFQUNSLENBQUEsR0FBSSxPQUFBLENBQVEsUUFBUjs7RUFFSixNQUFNLENBQUMsT0FBUCxHQUNNOzs7SUFDSixtQkFBQyxDQUFBLE9BQUQsR0FBVSxTQUFDLE1BQUQ7QUFDUixVQUFBO01BQUEsYUFBQSxHQUFnQixDQUFDLENBQUMsR0FBRixDQUFNLE1BQU4sRUFBYyx5QkFBQSxJQUE2QixFQUEzQzthQUNoQixJQUFDLENBQUEsR0FBRCxDQUFLO1FBQUEsQ0FBQSxLQUFBLENBQUEsRUFBTSxzQkFBTjtPQUFMLEVBQW1DLENBQUEsU0FBQSxLQUFBO2VBQUEsU0FBQTtVQUNqQyxLQUFDLENBQUEsR0FBRCxDQUFLO1lBQUEsTUFBQSxFQUFPLFlBQVA7WUFBcUIsQ0FBQSxLQUFBLENBQUEsRUFBTyxtQkFBNUI7V0FBTCxFQUFzRCxTQUFBO1lBQ3BELEtBQUMsQ0FBQSxHQUFELENBQUs7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFPLFdBQVA7YUFBTCxFQUF5QixTQUFBO3FCQUN2QixLQUFDLENBQUEsT0FBRCxDQUFTLGlCQUFULEVBQTRCLElBQUksY0FBSixDQUFtQjtnQkFBQSxJQUFBLEVBQU0sSUFBTjtnQkFBWSxlQUFBLEVBQWlCLGFBQTdCO2VBQW5CLENBQTVCO1lBRHVCLENBQXpCO21CQUVBLEtBQUMsQ0FBQSxHQUFELENBQUs7Y0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFNLDBCQUFOO2FBQUws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IFZpZXcsIFRleHRFZGl0b3JWaWV3fSA9IHJlcXVpcmUgJ2F0b20tc3BhY2UtcGVuLXZpZXdzJ1xuYXN5bmMgPSByZXF1aXJlICdhc3luYydcbl8gPSByZXF1aXJlICdsb2Rhc2gnXG5cbm1vZHVsZS5leHBvcnRzID1cbmNsYXNzIENvbm5lY3RvclBsdWdpblZpZXcgZXh0ZW5kcyBWaWV3XG4gIEBjb250ZW50OiAocGFyYW1zKS0+XG4gICAgZGVmYXVsdFNlYXJjaCA9IF8uZ2V0IHBhcmFtcywgJ2Nvbm5lY3Rvci5kZWZhdWx0U2VyYWNoJyB8fCAnJ1xuICAgIEBkaXYgY2xhc3M6XCJpbWRvbmVpby1wbHVnaW4tdmlld1wiLCA9PlxuICAgICAgQGRpdiBvdXRsZXQ6J2ZpbmRJc3N1ZXMnLCBjbGFzczogJ2Jsb2NrIGZpbmQtaXNzdWVzJywgPT5cbiAgICAgICAgQGRpdiBjbGFzczogJ2lucHV0LW1lZCcsID0+XG4gICAgICAgICAgQHN1YnZpZXcgJ2ZpbmRJc3N1ZXNGaWVsZCcsIG5ldyBUZXh0RWRpdG9yVmlldyhtaW5pOiB0cnVlLCBwbGFjZWhvbGRlclRleHQ6IGRlZmF1bHRTZWFyY2gpXG4gICAgICAgIEBkaXYgY2xhc3M6J2J0bi1ncm91cCBidG4tZ3JvdXAtZmluZCcsID0+XG4gICAgICAgICAgQGJ1dHRvbiBjbGljazogJ2RvRmluZCcsIGNsYXNzOididG4gYnRuLXByaW1hcnkgaW5saW5lLWJsb2NrLXRpZ2h0JywgPT5cbiAgICAgICAgICAgIEBzcGFuIGNsYXNzOidpY29uIGljb24tbWFyay1naXRodWInLCAnRmluZCBJc3N1ZXMnXG4gICAgICAgICAgQGJ1dHRvbiBjbGljazogJ25ld0lzc3VlJywgY2xhc3M6J2J0biBidG4tc3VjY2VzcyBpbmxpbmUtYmxvY2stdGlnaHQnLCAnTmV3IElzc3VlJ1xuICAgICAgQGRpdiBjbGFzczonaXNzdWVzLWNvbnRhaW5lcicsID0+XG4gICAgICAgIEBkaXYgb3V0bGV0OiAnc2VhcmNoUmVzdWx0JywgY2xhc3M6ICdpc3N1ZS1saXN0IHNlYXJjaC1yZXN1bHQnXG4gICAgICAgIEBkaXYgb3V0bGV0OiAncmVsYXRlZElzc3VlcycsIGNsYXNzOiAnaXNzdWUtbGlzdCByZWxhdGVkLWlzc3VlcydcblxuICBjb25zdHJ1Y3RvcjogKHtAcmVwbywgQGltZG9uZVZpZXcsIEBjb25uZWN0b3J9KSAtPlxuICAgIHN1cGVyXG4gICAgQGNsaWVudCA9IHJlcXVpcmUoJy4uL3NlcnZpY2VzL2ltZG9uZWlvLWNsaWVudCcpLmluc3RhbmNlXG4gICAgQGhhbmRsZUV2ZW50cygpXG5cbiAgc2V0VGFzazogKEB0YXNrKSAtPlxuXG4gIHNldENvbm5lY3RvcjogKEBjb25uZWN0b3IpIC0+XG5cbiAgZ2V0SXNzdWVJZHM6ICh0YXNrKSAtPlxuICAgIEBpZE1ldGFLZXkgPSBAY29ubmVjdG9yLmNvbmZpZy5pZE1ldGFLZXk7XG4gICAgdGFzayA9IEB0YXNrIHVubGVzcyB0YXNrXG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIHRhc2tcbiAgICBtZXRhRGF0YSA9IHRhc2suZ2V0TWV0YURhdGEoKVxuICAgIG1ldGFEYXRhW0BpZE1ldGFLZXldIGlmIChAaWRNZXRhS2V5ICYmIG1ldGFEYXRhKVxuXG4gIGhhbmRsZUV2ZW50czogKCktPlxuICAgIHNlbGYgPSBAXG4gICAgQGZpbmRJc3N1ZXNGaWVsZC5vbiAna2V5dXAnLCAoZSkgPT5cbiAgICAgIGNvZGUgPSBlLmtleUNvZGUgfHwgZS53aGljaFxuICAgICAgQGRvRmluZCgpIGlmKGNvZGUgPT0gMTMpXG5cbiAgICBAb24gJ2NsaWNrJywgJy5pc3N1ZS1hZGQnLCAoZSkgLT5cbiAgICAgIGlkID0gJChAKS5hdHRyKCdkYXRhLWlzc3VlLW51bWJlcicpXG4gICAgICAkKEApLmNsb3Nlc3QoJ2xpJykucmVtb3ZlKCk7XG4gICAgICBzZWxmLnRhc2suYWRkTWV0YURhdGEgc2VsZi5pZE1ldGFLZXksIGlkXG4gICAgICBzZWxmLnJlcG8ubW9kaWZ5VGFzayBzZWxmLnRhc2ssIHRydWUsIChlcnIsIHJlc3VsdCkgLT5cbiAgICAgICAgI2NvbnNvbGUubG9nIGVyciwgcmVzdWx0XG4gICAgICAgIHNlbGYuaXNzdWVzID0gc2VsZi5nZXRJc3N1ZUlkcygpXG4gICAgICAgIHNlbGYuc2hvd1JlbGF0ZWRJc3N1ZXMoKVxuICAgICAgICBzZWxmLmltZG9uZVZpZXcuZW1pdCBcInRhc2subW9kaWZpZWRcIiwgc2VsZi50YXNrXG5cbiAgICBAb24gJ2NsaWNrJywgJy5pc3N1ZS1yZW1vdmUnLCAoZSkgLT5cbiAgICAgIGlkID0gJChAKS5hdHRyKCdkYXRhLWlzc3VlLW51bWJlcicpXG4gICAgICAkKEApLmNsb3Nlc3QoJ2xpJykucmVtb3ZlKCk7XG4gICAgICBzZWxmLnRhc2sucmVtb3ZlTWV0YURhdGEgc2VsZi5pZE1ldGFLZXksIGlkXG5cbiAgICAgIHNlbGYucmVwby5tb2RpZnlUYXNrIHNlbGYudGFzaywgdHJ1ZSwgKGVyciwgcmVzdWx0KSAtPlxuICAgICAgICAjY29uc29sZS5sb2cgZXJyLCByZXN1bHRcbiAgICAgICAgc2VsZi5pc3N1ZXMgPSBzZWxmLmdldElzc3VlSWRzKClcbiAgICAgICAgc2VsZi5kb0ZpbmQoKVxuICAgICAgICBzZWxmLmltZG9uZVZpZXcuZW1pdCBcInRhc2subW9kaWZpZWRcIiwgc2VsZi50YXNrXG5cbiAgc2hvdzogKEBpc3N1ZXMpIC0+XG4gICAgQGZpbmRJc3N1ZXNGaWVsZC5mb2N1cygpXG4gICAgQHNob3dSZWxhdGVkSXNzdWVzKClcbiAgICBAZG9GaW5kKClcblxuICAjIFRPRE86IEltcHJvdmUgR2l0SHViIGlzc3VlIGludGVncmF0aW9uLiAgQWxsb3cgZm9yIGNoZWNraW5nIG9mIHRhc2tzIHRvIHVwZGF0ZSBpc3N1ZSBmb3IgRG9ELiBnaDoyODYgaWQ6NjlcbiAgc2hvd1JlbGF0ZWRJc3N1ZXM6ICgpIC0+XG4gICAgQHJlbGF0ZWRJc3N1ZXMuZW1wdHkoKVxuICAgIHJldHVybiB1bmxlc3MgQGlzc3Vlc1xuICAgIEByZWxhdGVkSXNzdWVzLmh0bWwgQCRzcGlubmVyKClcbiAgICBhc3luYy5tYXAgQGlzc3VlcywgKG51bWJlciwgY2IpID0+XG5cbiAgICAgIEBjbGllbnQuZ2V0SXNzdWUgQGNvbm5lY3RvciwgbnVtYmVyLCAoZXJyLCBpc3N1ZSkgPT5cbiAgICAgICAgY2IoZXJyLCBpc3N1ZSlcbiAgICAsIChlcnIsIHJlc3VsdHMpID0+XG4gICAgICAjIFRPRE86IENoZWNrIGVycm9yIGZvciA0MDQvTm90IEZvdW5kIHdoZW4gZ2V0dGluZyBhbiBpc3N1ZSBmcm9tIHByb3ZpZGVyLiArZW5oYW5jZW1lbnQgZ2g6MjAzIGlkOjc4XG4gICAgICAjIFRPRE86IEJlIHN1cmUgdG8gZmlyZSB3YWZmbGUgcnVsZXMgb24gdGhlIHNhbWUgcmVxdWVzdCBhcyB0aGUgZ2l0aHViIGlzc3VlIGNyZWF0aW9uIHRvIGVuc3VyZSBpdCBzdGFydHMgb2ZmIGluIHRoZSByaWdodCB3YWZmbGUgbGlzdCArZW5oYW5jZW1lbnQgZ2g6MjA0IGlkOjkzXG4gICAgICBpZiBlcnJcbiAgICAgICAgI2NvbnNvbGUubG9nIFwiZXJyb3I6XCIsIGVyclxuICAgICAgZWxzZVxuICAgICAgICBAcmVsYXRlZElzc3Vlcy5odG1sIEAkaXNzdWVMaXN0KHJlc3VsdHMpXG5cbiAgZ2V0U2VhcmNoUXJ5OiAtPlxuICAgIHFyeSA9IEBmaW5kSXNzdWVzRmllbGQuZ2V0TW9kZWwoKS5nZXRUZXh0KClcbiAgICByZXR1cm4gQGNvbm5lY3Rvci5kZWZhdWx0U2VhcmNoIHVubGVzcyBxcnlcbiAgICBxcnlcblxuICBkb0ZpbmQ6IChlKSAtPlxuICAgIEBzZWFyY2hSZXN1bHQuaHRtbCBAJHNwaW5uZXIoKVxuICAgIHNlYXJjaFRleHQgPSBAZ2V0U2VhcmNoUXJ5KClcbiAgICBAY2xpZW50LmZpbmRJc3N1ZXMgQGNvbm5lY3Rvciwgc2VhcmNoVGV4dCwgKGUsIGRhdGEpID0+XG4gICAgICBpZiBkYXRhXG4gICAgICAgIEBzZWFyY2hSZXN1bHQuaHRtbCBAJGlzc3VlTGlzdChkYXRhLml0ZW1zLCB0cnVlKVxuICAgICAgZWxzZVxuICAgICAgICBAc2VhcmNoUmVzdWx0Lmh0bWwgJ05vIGlzc3VlcyBmb3VuZCdcblxuICBuZXdJc3N1ZTogLT5cbiAgICAjIFRPRE86IEFsc28gYWRkIHRoZSB0YXNrIGxpc3QgYXMgYSBsYWJlbCB3aGVuIGNyZWF0aW5nIGFuIGlzc3VlIG9uIGdpdGh1Yi4gK25ldyBpZDo2NyBnaDozMDAgaWM6Z2hcbiAgICAjIC0gSSB0aGluayB0aGlzIGlzIGRvbmVcbiAgICBAY2xpZW50Lm5ld0lzc3VlIEBjb25uZWN0b3IsIHt0aXRsZTpAdGFzay50ZXh0fSwgKGUsIGRhdGEpID0+XG4gICAgICBAdGFzay5hZGRNZXRhRGF0YSBAaWRNZXRhS2V5LCBkYXRhLm51bWJlclxuICAgICAgQHJlcG8ubW9kaWZ5VGFzayBAdGFzaywgdHJ1ZSwgKGVyciwgcmVzdWx0KSA9PlxuICAgICAgICAjY29uc29sZS5sb2cgZXJyLCByZXN1bHRcbiAgICAgICAgQGlzc3VlcyA9IEBnZXRJc3N1ZUlkcygpXG4gICAgICAgIEBpbWRvbmVWaWV3LmVtaXQgXCJ0YXNrLm1vZGlmaWVkXCIsIEB0YXNrXG4gICAgICAgIEBzaG93UmVsYXRlZElzc3VlcygpXG5cbiAgJHNwaW5uZXI6IC0+XG4gICAgJCQgLT5cbiAgICAgIEBkaXYgY2xhc3M6ICdzcGlubmVyJywgPT5cbiAgICAgICAgQHNwYW4gY2xhc3M6J2xvYWRpbmcgbG9hZGluZy1zcGlubmVyLWxhcmdlIGlubGluZS1ibG9jaydcblxuICAkaXNzdWVMaXN0OiAoaXNzdWVzLCBzZWFyY2gpIC0+XG4gICAgbnVtYmVycyA9IEBpc3N1ZXNcbiAgICAkJCAtPlxuICAgICAgQG9sID0+XG4gICAgICAgIGZvciBpc3N1ZSBpbiBpc3N1ZXNcbiAgICAgICAgICB1bmxlc3Mgc2VhcmNoICYmIG51bWJlcnMgJiYgbnVtYmVycy5pbmRleE9mKGlzc3VlLm51bWJlci50b1N0cmluZygpKSA+IC0xXG4gICAgICAgICAgICBAbGkgY2xhc3M6J2lzc3VlIHdlbGwnLCBcImRhdGEtaXNzdWUtaWRcIjppc3N1ZS5pZCwgPT5cbiAgICAgICAgICAgICAgQGRpdiBjbGFzczonaXNzdWUtdGl0bGUnLCA9PlxuICAgICAgICAgICAgICAgIEBwID0+XG4gICAgICAgICAgICAgICAgICBAc3BhbiBcIiN7aXNzdWUudGl0bGV9IFwiXG4gICAgICAgICAgICAgICAgICBAYSBocmVmOmlzc3VlLmh0bWxfdXJsLCBjbGFzczonaXNzdWUtbnVtYmVyJywgXCIjI3tpc3N1ZS5udW1iZXJ9XCJcbiAgICAgICAgICAgICAgQGRpdiBjbGFzczonaXNzdWUtc3RhdGUnLCA9PlxuICAgICAgICAgICAgICAgIEBwID0+XG4gICAgICAgICAgICAgICAgICBpZiBpc3N1ZS5zdGF0ZSA9PSBcIm9wZW5cIlxuICAgICAgICAgICAgICAgICAgICBAc3BhbiBjbGFzczonYmFkZ2UgYmFkZ2Utc3VjY2VzcyBpY29uIGljb24taXNzdWUtb3BlbmVkJywgJ09wZW4nXG4gICAgICAgICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgICAgIEBzcGFuIGNsYXNzOidiYWRnZSBiYWRnZS1lcnJvciBpY29uIGljb24taXNzdWUtY2xvc2VkJywgJ0Nsb3NlZCdcbiAgICAgICAgICAgICAgICAgIGlmIHNlYXJjaFxuICAgICAgICAgICAgICAgICAgICBAYSBocmVmOicjJywgY2xhc3M6J2lzc3VlLWFkZCcsIFwiZGF0YS1pc3N1ZS1udW1iZXJcIjppc3N1ZS5udW1iZXIsID0+XG4gICAgICAgICAgICAgICAgICAgICAgQHNwYW4gY2xhc3M6J2ljb24gaWNvbi1kaWZmLWFkZGVkIG1lZ2EtaWNvbiBwdWxsLXJpZ2h0J1xuICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICBAYSBocmVmOicjJywgY2xhc3M6J2lzc3VlLXJlbW92ZScsIFwiZGF0YS1pc3N1ZS1udW1iZXJcIjppc3N1ZS5udW1iZXIsID0+XG4gICAgICAgICAgICAgICAgICAgICAgQHNwYW4gY2xhc3M6J2ljb24gaWNvbi1kaWZmLXJlbW92ZWQgbWVnYS1pY29uIHB1bGwtcmlnaHQnXG4iXX0=
