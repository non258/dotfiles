(function() {
  module.exports = {
    Context: {
      "atom-workspace": {
        "application:inspect": "要素の検証"
      },
      "atom-text-editor": {
        "color-picker:open": "カラーピッカー",
        "minimap:toggle": "ミニマップ切替"
      },
      "atom-text-editor, .overlayer": {
        "core:undo": "取り消す",
        "core:redo": "やり直す",
        "core:cut": "カット",
        "core:copy": "コピー",
        "core:paste": "ペースト",
        "core:delete": "削除",
        "core:select-all": "すべて選択",
        "pane:split-up-and-copy-active-item": "ペイン分割･複製 ↑",
        "pane:split-down-and-copy-active-item": "ペイン分割･複製 ↓",
        "pane:split-left-and-copy-active-item": "ペイン分割･複製 ←",
        "pane:split-right-and-copy-active-item": "ペイン分割･複製 →",
        "pane:close": "ペインを閉じる"
      },
      "atom-pane": {
        "pane:split-up-and-copy-active-item": "ペイン分割 ↑",
        "pane:split-down-and-copy-active-item": "ペイン分割 ↓",
        "pane:split-left-and-copy-active-item": "ペイン分割 ←",
        "pane:split-right-and-copy-active-item": "ペイン分割 →",
        "pane:close": "ペインを閉じる"
      },
      "atom-text-editor:not([mini])": {
        "encoding-selector:show": "エンコーディング選択",
        "spell-check:correct-misspelling": "スペル修正",
        "symbols-view:go-to-declaration": "宣言に移動"
      },
      ".tree-view li.directory": {
        "project-find:show-in-current-directory": "ディレクトリ内を検索"
      },
      ".path-details.list-item": {
        "find-and-replace:copy-path": "Copy Path"
      },
      ".overlayer": {
        "autocomplete:toggle": "オートコンプリート",
        "grammar-selector:show": "文法を選択"
      },
      ".image-view": {
        "image-view:reload": "画像をリロード"
      },
      ".markdown-preview": {
        "core:copy": "HTMLをコピー",
        "core:save-as": "HTMLを保存..."
      },
      ".tree-view .file .name[data-name$=\\.markdown]": {
        "markdown-preview:preview-file": "Markdownプレビュー"
      },
      ".tree-view .file .name[data-name$=\\.md]": {
        "markdown-preview:preview-file": "Markdownプレビュー"
      },
      ".tree-view .file .name[data-name$=\\.mdown]": {
        "markdown-preview:preview-file": "Markdownプレビュー"
      },
      ".tree-view .file .name[data-name$=\\.mkd]": {
        "markdown-preview:preview-file": "Markdownプレビュー"
      },
      ".tree-view .file .name[data-name$=\\.mkdown]": {
        "markdown-preview:preview-file": "Markdownプレビュー"
      },
      ".tree-view .file .name[data-name$=\\.ron]": {
        "markdown-preview:preview-file": "Markdownプレビュー"
      },
      ".tree-view .file .name[data-name$=\\.txt]": {
        "markdown-preview:preview-file": "Markdownプレビュー"
      },
      ".tab": {
        "tabs:close-tab": "タブを閉じる",
        "tabs:close-other-tabs": "他のタブをすべて閉じる",
        "tabs:close-tabs-to-right": "右側のタブを閉じる",
        "tabs:close-tabs-to-left": "左側のタブを閉じる",
        "tabs:close-saved-tabs": "保存したタブを閉じる",
        "tabs:close-all-tabs": "タブをすべて閉じる",
        "tabs:split-up": "ペイン分割 ↑",
        "tabs:split-down": "ペイン分割 ↓",
        "tabs:split-left": "ペイン分割 ←",
        "tabs:split-right": "ペイン分割 →"
      },
      ".tab.texteditor": {
        "tabs:open-in-new-window": "新規ウインドウで開く"
      },
      ".tab.pending-tab": {
        "tabs:keep-pending-tab": "プレビュー状態を解除"
      },
      ".tab-bar": {
        "pane:reopen-closed-item": "閉じたタブを開く"
      },
      ".tree-view .full-menu": {
        "tree-view:add-file": "新規ファイル",
        "tree-view:add-folder": "新規フォルダ",
        "tree-view:move": "移動・名前を変更...",
        "tree-view:duplicate": "複製",
        "tree-view:remove": "削除",
        "tree-view:copy": "コピー",
        "tree-view:cut": "カット",
        "tree-view:paste": "ペースト",
        "application:add-project-folder": "プロジェクトフォルダを追加...",
        "tree-view:copy-full-path": "フルパスをコピー",
        "tree-view:copy-project-path": "プロジェクトパスをコピー",
        "tree-view:open-in-new-window": "新規ウインドウで開く"
      },
      '.tree-view .full-menu [is="tree-view-file"]': {
        "tree-view:open-selected-entry-up": "ペイン分割 ↑",
        "tree-view:open-selected-entry-down": "ペイン分割 ↓",
        "tree-view:open-selected-entry-left": "ペイン分割 ←",
        "tree-view:open-selected-entry-right": "ペイン分割 →"
      },
      ".tree-view .full-menu .project-root > .header": {
        "tree-view:add-file": "新規ファイル",
        "tree-view:add-folder": "新規フォルダ",
        "tree-view:move": "移動・名前を変更...",
        "tree-view:duplicate": "複製",
        "tree-view:remove": "削除",
        "tree-view:copy": "コピー",
        "tree-view:cut": "カット",
        "tree-view:paste": "ペースト",
        "application:add-project-folder": "プロジェクトフォルダを追加...",
        "tree-view:remove-project-folder": "プロジェクトフォルダを除去",
        "tree-view:copy-full-path": "フルパスをコピー",
        "tree-view:copy-project-path": "プロジェクトパスをコピー",
        "tree-view:open-in-new-window": "新規ウインドウで開く"
      },
      ".platform-darwin .tree-view .full-menu": {
        "tree-view:show-in-file-manager": "Finder で表示"
      },
      ".platform-win32 .tree-view .full-menu": {
        "tree-view:show-in-file-manager": "エクスプローラで表示"
      },
      ".platform-linux .tree-view .full-menu": {
        "tree-view:show-in-file-manager": "ファイルマネージャで表示"
      },
      ".tree-view.multi-select": {
        "tree-view:remove": "削除",
        "tree-view:copy": "コピー",
        "tree-view:cut": "カット",
        "tree-view:paste": "ペースト"
      },
      "atom-pane[data-active-item-path] .item-views": {
        "tree-view:reveal-active-file": "ツリービューに表示"
      },
      "atom-pane[data-active-item-path] .tab.active": {
        "tree-view:rename": "移動・名前を変更...",
        "tree-view:reveal-active-file": "ツリービューに表示"
      },
      ".platform-darwin atom-pane[data-active-item-path] .tab.active": {
        "tree-view:show-current-file-in-file-manager": "Finder で表示"
      },
      ".platform-win32 atom-pane[data-active-item-path] .tab.active": {
        "tree-view:show-current-file-in-file-manager": "エクスプローラで表示"
      },
      ".platform-linux atom-pane[data-active-item-path] .tab.active": {
        "tree-view:show-current-file-in-file-manager": "ファイルマネージャで表示"
      },
      ".platform-darwin atom-text-editor:not([mini])": {
        "tree-view:show-current-file-in-file-manager": "Finder で表示"
      },
      ".platform-win32 atom-text-editor:not([mini])": {
        "tree-view:show-current-file-in-file-manager": "エクスプローラで表示"
      },
      ".platform-linux atom-text-editor:not([mini])": {
        "tree-view:show-current-file-in-file-manager": "ファイルマネージャで表示"
      }
    }
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvbm96b21pLy5hdG9tL3BhY2thZ2VzL2phcGFuZXNlLW1lbnUvZGVmL2NvbnRleHQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQUEsTUFBTSxDQUFDLE9BQVAsR0FBaUI7SUFDakIsT0FBQSxFQUNFO01BQUEsZ0JBQUEsRUFDRTtRQUFBLHFCQUFBLEVBQXVCLE9BQXZCO09BREY7TUFFQSxrQkFBQSxFQUNFO1FBQUEsbUJBQUEsRUFBcUIsU0FBckI7UUFDQSxnQkFBQSxFQUFrQixTQURsQjtPQUhGO01BS0EsOEJBQUEsRUFDRTtRQUFBLFdBQUEsRUFBYSxNQUFiO1FBQ0EsV0FBQSxFQUFhLE1BRGI7UUFFQSxVQUFBLEVBQVksS0FGWjtRQUdBLFdBQUEsRUFBYSxLQUhiO1FBSUEsWUFBQSxFQUFjLE1BSmQ7UUFLQSxhQUFBLEVBQWUsSUFMZjtRQU1BLGlCQUFBLEVBQW1CLE9BTm5CO1FBT0Esb0NBQUEsRUFBc0MsWUFQdEM7UUFRQSxzQ0FBQSxFQUF3QyxZQVJ4QztRQVNBLHNDQUFBLEVBQXdDLFlBVHhDO1FBVUEsdUNBQUEsRUFBeUMsWUFWekM7UUFXQSxZQUFBLEVBQWMsU0FYZDtPQU5GO01Ba0JBLFdBQUEsRUFDRTtRQUFBLG9DQUFBLEVBQXNDLFNBQXRDO1FBQ0Esc0NBQUEsRUFBd0MsU0FEeEM7UUFFQSxzQ0FBQSxFQUF3QyxTQUZ4QztRQUdBLHVDQUFBLEVBQXlDLFNBSHpDO1FBSUEsWUFBQSxFQUFjLFNBSmQ7T0FuQkY7TUF3QkEsOEJBQUEsRUFDRTtRQUFBLHdCQUFBLEVBQTBCLFlBQTFCO1FBQ0EsaUNBQUEsRUFBbUMsT0FEbkM7UUFFQSxnQ0FBQSxFQUFrQyxPQUZsQztPQXpCRjtNQTRCQSx5QkFBQSxFQUNFO1FBQUEsd0NBQUEsRUFBMEMsWUFBMUM7T0E3QkY7TUE4QkEseUJBQUEsRUFDRTtRQUFBLDRCQUFBLEVBQThCLFdBQTlCO09BL0JGO01BZ0NBLFlBQUEs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QSxFQUFrQixLQURsQjtRQUVBLGVBQUEsRUFBaUIsS0FGakI7UUFHQSxpQkFBQSxFQUFtQixNQUhuQjtPQTlHRjtNQWtIQSw4Q0FBQSxFQUNFO1FBQUEsOEJBQUEsRUFBZ0MsV0FBaEM7T0FuSEY7TUFvSEEsOENBQUEsRUFDRTtRQUFBLGtCQUFBLEVBQW9CLGFBQXBCO1FBQ0EsOEJBQUEsRUFBZ0MsV0FEaEM7T0FySEY7TUF1SEEsK0RBQUEsRUFDRTtRQUFBLDZDQUFBLEVBQStDLFlBQS9DO09BeEhGO01BeUhBLDhEQUFBLEVBQ0U7UUFBQSw2Q0FBQSxFQUErQyxZQUEvQztPQTFIRjtNQTJIQSw4REFBQSxFQUNFO1FBQUEsNkNBQUEsRUFBK0MsY0FBL0M7T0E1SEY7TUE2SEEsK0NBQUEsRUFDRTtRQUFBLDZDQUFBLEVBQStDLFlBQS9DO09BOUhGO01BK0hBLDhDQUFBLEVBQ0U7UUFBQSw2Q0FBQSxFQUErQyxZQUEvQztPQWhJRjtNQWlJQSw4Q0FBQSxFQUNFO1FBQUEsNkNBQUEsRUFBK0MsY0FBL0M7T0FsSUY7S0FGZTs7QUFBakIiLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IHtcbkNvbnRleHQ6XG4gIFwiYXRvbS13b3Jrc3BhY2VcIjpcbiAgICBcImFwcGxpY2F0aW9uOmluc3BlY3RcIjogXCLopoHntKDjga7mpJzoqLxcIlxuICBcImF0b20tdGV4dC1lZGl0b3JcIjpcbiAgICBcImNvbG9yLXBpY2tlcjpvcGVuXCI6IFwi44Kr44Op44O844OU44OD44Kr44O8XCJcbiAgICBcIm1pbmltYXA6dG9nZ2xlXCI6IFwi44Of44OL44Oe44OD44OX5YiH5pu/XCJcbiAgXCJhdG9tLXRleHQtZWRpdG9yLCAub3ZlcmxheWVyXCI6XG4gICAgXCJjb3JlOnVuZG9cIjogXCLlj5bjgormtojjgZlcIlxuICAgIFwiY29yZTpyZWRvXCI6IFwi44KE44KK55u044GZXCJcbiAgICBcImNvcmU6Y3V0XCI6IFwi44Kr44OD44OIXCJcbiAgICBcImNvcmU6Y29weVwiOiBcIuOCs+ODlOODvFwiXG4gICAgXCJjb3JlOnBhc3RlXCI6IFwi44Oa44O844K544OIXCJcbiAgICBcImNvcmU6ZGVsZXRlXCI6IFwi5YmK6ZmkXCJcbiAgICBcImNvcmU6c2VsZWN0LWFsbFwiOiBcIuOBmeOBueOBpumBuOaKnlwiXG4gICAgXCJwYW5lOnNwbGl0LXVwLWFuZC1jb3B5LWFjdGl2ZS1pdGVtXCI6IFwi44Oa44Kk44Oz5YiG5Ymy772l6KSH6KO9IOKGkVwiXG4gICAgXCJwYW5lOnNwbGl0LWRvd24tYW5kLWNvcHktYWN0aXZlLWl0ZW1cIjogXCLjg5rjgqTjg7PliIblibLvvaXopIfoo70g4oaTXCJcbiAgICBcInBhbmU6c3BsaXQtbGVmdC1hbmQtY29weS1hY3RpdmUtaXRlbVwiOiBcIuODmuOCpOODs+WIhuWJsu+9peikh+ijvSDihpBcIlxuICAgIFwicGFuZTpzcGxpdC1yaWdodC1hbmQtY29weS1hY3RpdmUtaXRlbVwiOiBcIuODmuOCpOODs+WIhuWJsu+9peikh+ijvSDihpJcIlxuICAgIFwicGFuZTpjbG9zZVwiOiBcIuODmuOCpOODs+OCkumWieOBmOOCi1wiXG4gIFwiYXRvbS1wYW5lXCI6XG4gICAgXCJwYW5lOnNwbGl0LXVwLWFuZC1jb3B5LWFjdGl2ZS1pdGVtXCI6IFwi44Oa44Kk44Oz5YiG5YmyIOKGkVwiXG4gICAgXCJwYW5lOnNwbGl0LWRvd24tYW5kLWNvcHktYWN0aXZlLWl0ZW1cIjogXCLjg5rjgqTjg7PliIblibIg4oaTXCJcbiAgICBcInBhbmU6c3BsaXQtbGVmdC1hbmQtY29weS1hY3RpdmUtaXRlbVwiOiBcIuODmuOCpOODs+WIhuWJsiDihpBcIlxuICAgIFwicGFuZTpzcGxpdC1yaWdodC1hbmQtY29weS1hY3RpdmUtaXRlbVwiOiBcIuODmuOCpOODs+WIhuWJsiDihpJcIlxuICAgIFwicGFuZTpjbG9zZVwiOiBcIuODmuOCpOODs+OCkumWieOBmOOCi1wiXG4gIFwiYXRvbS10ZXh0LWVkaXRvcjpub3QoW21pbmldKVwiOlxuICAgIFwiZW5jb2Rpbmctc2VsZWN0b3I6c2hvd1wiOiBcIuOCqOODs+OCs+ODvOODh+OCo+ODs+OCsOmBuOaKnlwiXG4gICAgXCJzcGVsbC1jaGVjazpjb3JyZWN0LW1pc3NwZWxsaW5nXCI6IFwi44K544Oa44Or5L+u5q2jXCJcbiAgICBcInN5bWJvbHMtdmlldzpnby10by1kZWNsYXJhdGlvblwiOiBcIuWuo+iogOOBq+enu+WLlVwiXG4gIFwiLnRyZWUtdmlldyBsaS5kaXJlY3RvcnlcIjpcbiAgICBcInByb2plY3QtZmluZDpzaG93LWluLWN1cnJlbnQtZGlyZWN0b3J5XCI6IFwi44OH44Kj44Os44Kv44OI44Oq5YaF44KS5qSc57SiXCJcbiAgXCIucGF0aC1kZXRhaWxzLmxpc3QtaXRlbVwiOlxuICAgIFwiZmluZC1hbmQtcmVwbGFjZTpjb3B5LXBhdGhcIjogXCJDb3B5IFBhdGhcIlxuICBcIi5vdmVybGF5ZXJcIjpcbiAgICBcImF1dG9jb21wbGV0ZTp0b2dnbGVcIjogXCLjgqrjg7zjg4jjgrPjg7Pjg5fjg6rjg7zjg4hcIlxuICAgIFwiZ3JhbW1hci1zZWxlY3RvcjpzaG93XCI6IFwi5paH5rOV44KS6YG45oqeXCJcbiAgXCIuaW1hZ2Utdmlld1wiOlxuICAgIFwiaW1hZ2UtdmlldzpyZWxvYWRcIjogXCLnlLvlg4/jgpLjg6rjg63jg7zjg4lcIlxuICBcIi5tYXJrZG93bi1wcmV2aWV3XCI6XG4gICAgXCJjb3JlOmNvcHlcIjogXCJIVE1M44KS44Kz44OU44O8XCJcbiAgICBcImNvcmU6c2F2ZS1hc1wiOiBcIkhUTUzjgpLkv53lrZguLi5cIlxuICBcIi50cmVlLXZpZXcgLmZpbGUgLm5hbWVbZGF0YS1uYW1lJD1cXFxcLm1hcmtkb3duXVwiOlxuICAgIFwibWFya2Rvd24tcHJldmlldzpwcmV2aWV3LWZpbGVcIjogXCJNYXJrZG93buODl+ODrOODk+ODpeODvFwiXG4gIFwiLnRyZWUtdmlldyAuZmlsZSAubmFtZVtkYXRhLW5hbWUkPVxcXFwubWRdXCI6XG4gICAgXCJtYXJrZG93bi1wcmV2aWV3OnByZXZpZXctZmlsZVwiOiBcIk1hcmtkb3du44OX44Os44OT44Ol44O8XCJcbiAgXCIudHJlZS12aWV3IC5maWxlIC5uYW1lW2RhdGEtbmFtZSQ9XFxcXC5tZG93bl1cIjpcbiAgICBcIm1hcmtkb3duLXByZXZpZXc6cHJldmlldy1maWxlXCI6IFwiTWFya2Rvd27jg5fjg6zjg5Pjg6Xjg7xcIlxuICBcIi50cmVlLXZpZXcgLmZpbGUgLm5hbWVbZGF0YS1uYW1lJD1cXFxcLm1rZF1cIjpcbiAgICBcIm1hcmtkb3duLXByZXZpZXc6cHJldmlldy1maWxlXCI6IFwiTWFya2Rvd27jg5fjg6zjg5Pjg6Xjg7xcIlxuICBcIi50cmVlLXZpZXcgLmZpbGUgLm5hbWVbZGF0YS1uYW1lJD1cXFxcLm1rZG93bl1cIjpcbiAgICBcIm1hcmtkb3duLXByZXZpZXc6cHJldmlldy1maWxlXCI6IFwiTWFya2Rvd27jg5fjg6zjg5Pjg6Xjg7xcIlxuICBcIi50cmVlLXZpZXcgLmZpbGUgLm5hbWVbZGF0YS1uYW1lJD1cXFxcLnJvbl1cIjpcbiAgICBcIm1hcmtkb3duLXByZXZpZXc6cHJldmlldy1maWxlXCI6IFwiTWFya2Rvd27jg5fjg6zjg5Pjg6Xjg7xcIlxuICBcIi50cmVlLXZpZXcgLmZpbGUgLm5hbWVbZGF0YS1uYW1lJD1cXFxcLnR4dF1cIjpcbiAgICBcIm1hcmtkb3duLXByZXZpZXc6cHJldmlldy1maWxlXCI6IFwiTWFya2Rvd27jg5fjg6zjg5Pjg6Xjg7xcIlxuICBcIi50YWJcIjpcbiAgICBcInRhYnM6Y2xvc2UtdGFiXCI6IFwi44K/44OW44KS6ZaJ44GY44KLXCJcbiAgICBcInRhYnM6Y2xvc2Utb3RoZXItdGFic1wiOiBcIuS7luOBruOCv+ODluOCkuOBmeOBueOBpumWieOBmOOCi1wiXG4gICAgXCJ0YWJzOmNsb3NlLXRhYnMtdG8tcmlnaHRcIjogXCLlj7PlgbTjga7jgr/jg5bjgpLplonjgZjjgotcIlxuICAgIFwidGFiczpjbG9zZS10YWJzLXRvLWxlZnRcIjogXCLlt6blgbTjga7jgr/jg5bjgpLplonjgZjjgotcIlxuICAgIFwidGFiczpjbG9zZS1zYXZlZC10YWJzXCI6IFwi5L+d5a2Y44GX44Gf44K/44OW44KS6ZaJ44GY44KLXCJcbiAgICBcInRhYnM6Y2xvc2UtYWxsLXRhYnNcIjogXCLjgr/jg5bjgpLjgZnjgbnjgabplonjgZjjgotcIlxuICAgIFwidGFiczpzcGxpdC11cFwiOiBcIuODmuOCpOODs+WIhuWJsiDihpFcIlxuICAgIFwidGFiczpzcGxpdC1kb3duXCI6IFwi44Oa44Kk44Oz5YiG5YmyIOKGk1wiXG4gICAgXCJ0YWJzOnNwbGl0LWxlZnRcIjogXCLjg5rjgqTjg7PliIblibIg4oaQXCJcbiAgICBcInRhYnM6c3BsaXQtcmlnaHRcIjogXCLjg5rjgqTjg7PliIblibIg4oaSXCJcbiAgXCIudGFiLnRleHRlZGl0b3JcIjpcbiAgICBcInRhYnM6b3Blbi1pbi1uZXctd2luZG93XCI6IFwi5paw6KaP44Km44Kk44Oz44OJ44Km44Gn6ZaL44GPXCJcbiAgXCIudGFiLnBlbmRpbmctdGFiXCI6XG4gICAgXCJ0YWJzOmtlZXAtcGVuZGluZy10YWJcIjogXCLjg5fjg6zjg5Pjg6Xjg7znirbmhYvjgpLop6PpmaRcIlxuICBcIi50YWItYmFyXCI6XG4gICAgXCJwYW5lOnJlb3Blbi1jbG9zZWQtaXRlbVwiOiBcIumWieOBmOOBn+OCv+ODluOCkumWi+OBj1wiXG4gIFwiLnRyZWUtdmlldyAuZnVsbC1tZW51XCI6XG4gICAgXCJ0cmVlLXZpZXc6YWRkLWZpbGVcIjogXCLmlrDopo/jg5XjgqHjgqTjg6tcIlxuICAgIFwidHJlZS12aWV3OmFkZC1mb2xkZXJcIjogXCLmlrDopo/jg5Xjgqnjg6vjg4BcIlxuICAgIFwidHJlZS12aWV3Om1vdmVcIjogXCLnp7vli5Xjg7vlkI3liY3jgpLlpInmm7QuLi5cIlxuICAgIFwidHJlZS12aWV3OmR1cGxpY2F0ZVwiOiBcIuikh+ijvVwiXG4gICAgXCJ0cmVlLXZpZXc6cmVtb3ZlXCI6IFwi5YmK6ZmkXCJcbiAgICBcInRyZWUtdmlldzpjb3B5XCI6IFwi44Kz44OU44O8XCJcbiAgICBcInRyZWUtdmlldzpjdXRcIjogXCLjgqvjg4Pjg4hcIlxuICAgIFwidHJlZS12aWV3OnBhc3RlXCI6IFwi44Oa44O844K544OIXCJcbiAgICBcImFwcGxpY2F0aW9uOmFkZC1wcm9qZWN0LWZvbGRlclwiOiBcIuODl+ODreOCuOOCp+OCr+ODiOODleOCqeODq+ODgOOCkui/veWKoC4uLlwiXG4gICAgXCJ0cmVlLXZpZXc6Y29weS1mdWxsLXBhdGhcIjogXCLjg5Xjg6vjg5HjgrnjgpLjgrPjg5Tjg7xcIlxuICAgIFwidHJlZS12aWV3OmNvcHktcHJvamVjdC1wYXRoXCI6IFwi44OX44Ot44K444Kn44Kv44OI44OR44K544KS44Kz44OU44O8XCJcbiAgICBcInRyZWUtdmlldzpvcGVuLWluLW5ldy13aW5kb3dcIjogXCLmlrDopo/jgqbjgqTjg7Pjg4njgqbjgafplovjgY9cIlxuICAnLnRyZWUtdmlldyAuZnVsbC1tZW51IFtpcz1cInRyZWUtdmlldy1maWxlXCJdJzpcbiAgICBcInRyZWUtdmlldzpvcGVuLXNlbGVjdGVkLWVudHJ5LXVwXCI6IFwi44Oa44Kk44Oz5YiG5YmyIOKGkVwiXG4gICAgXCJ0cmVlLXZpZXc6b3Blbi1zZWxlY3RlZC1lbnRyeS1kb3duXCI6IFwi44Oa44Kk44Oz5YiG5YmyIOKGk1wiXG4gICAgXCJ0cmVlLXZpZXc6b3Blbi1zZWxlY3RlZC1lbnRyeS1sZWZ0XCI6IFwi44Oa44Kk44Oz5YiG5YmyIOKGkFwiXG4gICAgXCJ0cmVlLXZpZXc6b3Blbi1zZWxlY3RlZC1lbnRyeS1yaWdodFwiOiBcIuODmuOCpOODs+WIhuWJsiDihpJcIlxuICBcIi50cmVlLXZpZXcgLmZ1bGwtbWVudSAucHJvamVjdC1yb290ID4gLmhlYWRlclwiOlxuICAgIFwidHJlZS12aWV3OmFkZC1maWxlXCI6IFwi5paw6KaP44OV44Kh44Kk44OrXCJcbiAgICBcInRyZWUtdmlldzphZGQtZm9sZGVyXCI6IFwi5paw6KaP44OV44Kp44Or44OAXCJcbiAgICBcInRyZWUtdmlldzptb3ZlXCI6IFwi56e75YuV44O75ZCN5YmN44KS5aSJ5pu0Li4uXCJcbiAgICBcInRyZWUtdmlldzpkdXBsaWNhdGVcIjogXCLopIfoo71cIlxuICAgIFwidHJlZS12aWV3OnJlbW92ZVwiOiBcIuWJiumZpFwiXG4gICAgXCJ0cmVlLXZpZXc6Y29weVwiOiBcIuOCs+ODlOODvFwiXG4gICAgXCJ0cmVlLXZpZXc6Y3V0XCI6IFwi44Kr44OD44OIXCJcbiAgICBcInRyZWUtdmlldzpwYXN0ZVwiOiBcIuODmuODvOOCueODiFwiXG4gICAgXCJhcHBsaWNhdGlvbjphZGQtcHJvamVjdC1mb2xkZXJcIjogXCLjg5fjg63jgrjjgqfjgq/jg4jjg5Xjgqnjg6vjg4DjgpLov73liqAuLi5cIlxuICAgIFwidHJlZS12aWV3OnJlbW92ZS1wcm9qZWN0LWZvbGRlclwiOiBcIuODl+ODreOCuOOCp+OCr+ODiOODleOCqeODq+ODgOOCkumZpOWOu1wiXG4gICAgXCJ0cmVlLXZpZXc6Y29weS1mdWxsLXBhdGhcIjogXCLjg5Xjg6vjg5HjgrnjgpLjgrPjg5Tjg7xcIlxuICAgIFwidHJlZS12aWV3OmNvcHktcHJvamVjdC1wYXRoXCI6IFwi44OX44Ot44K444Kn44Kv44OI44OR44K544KS44Kz44OU44O8XCJcbiAgICBcInRyZWUtdmlldzpvcGVuLWluLW5ldy13aW5kb3dcIjogXCLmlrDopo/jgqbjgqTjg7Pjg4njgqbjgafplovjgY9cIlxuICBcIi5wbGF0Zm9ybS1kYXJ3aW4gLnRyZWUtdmlldyAuZnVsbC1tZW51XCI6XG4gICAgXCJ0cmVlLXZpZXc6c2hvdy1pbi1maWxlLW1hbmFnZXJcIjogXCJGaW5kZXIg44Gn6KGo56S6XCJcbiAgXCIucGxhdGZvcm0td2luMzIgLnRyZWUtdmlldyAuZnVsbC1tZW51XCI6XG4gICAgXCJ0cmVlLXZpZXc6c2hvdy1pbi1maWxlLW1hbmFnZXJcIjogXCLjgqjjgq/jgrnjg5fjg63jg7zjg6njgafooajnpLpcIlxuICBcIi5wbGF0Zm9ybS1saW51eCAudHJlZS12aWV3IC5mdWxsLW1lbnVcIjpcbiAgICBcInRyZWUtdmlldzpzaG93LWluLWZpbGUtbWFuYWdlclwiOiBcIuODleOCoeOCpOODq+ODnuODjeODvOOCuOODo+OBp+ihqOekulwiXG4gIFwiLnRyZWUtdmlldy5tdWx0aS1zZWxlY3RcIjpcbiAgICBcInRyZWUtdmlldzpyZW1vdmVcIjogXCLliYrpmaRcIlxuICAgIFwidHJlZS12aWV3OmNvcHlcIjogXCLjgrPjg5Tjg7xcIlxuICAgIFwidHJlZS12aWV3OmN1dFwiOiBcIuOCq+ODg+ODiFwiXG4gICAgXCJ0cmVlLXZpZXc6cGFzdGVcIjogXCLjg5rjg7zjgrnjg4hcIlxuICBcImF0b20tcGFuZVtkYXRhLWFjdGl2ZS1pdGVtLXBhdGhdIC5pdGVtLXZpZXdzXCI6XG4gICAgXCJ0cmVlLXZpZXc6cmV2ZWFsLWFjdGl2ZS1maWxlXCI6IFwi44OE44Oq44O844OT44Ol44O844Gr6KGo56S6XCJcbiAgXCJhdG9tLXBhbmVbZGF0YS1hY3RpdmUtaXRlbS1wYXRoXSAudGFiLmFjdGl2ZVwiOlxuICAgIFwidHJlZS12aWV3OnJlbmFtZVwiOiBcIuenu+WLleODu+WQjeWJjeOCkuWkieabtC4uLlwiXG4gICAgXCJ0cmVlLXZpZXc6cmV2ZWFsLWFjdGl2ZS1maWxlXCI6IFwi44OE44Oq44O844OT44Ol44O844Gr6KGo56S6XCJcbiAgXCIucGxhdGZvcm0tZGFyd2luIGF0b20tcGFuZVtkYXRhLWFjdGl2ZS1pdGVtLXBhdGhdIC50YWIuYWN0aXZlXCI6XG4gICAgXCJ0cmVlLXZpZXc6c2hvdy1jdXJyZW50LWZpbGUtaW4tZmlsZS1tYW5hZ2VyXCI6IFwiRmluZGVyIOOBp+ihqOekulwiXG4gIFwiLnBsYXRmb3JtLXdpbjMyIGF0b20tcGFuZVtkYXRhLWFjdGl2ZS1pdGVtLXBhdGhdIC50YWIuYWN0aXZlXCI6XG4gICAgXCJ0cmVlLXZpZXc6c2hvdy1jdXJyZW50LWZpbGUtaW4tZmlsZS1tYW5hZ2VyXCI6IFwi44Ko44Kv44K544OX44Ot44O844Op44Gn6KGo56S6XCJcbiAgXCIucGxhdGZvcm0tbGludXggYXRvbS1wYW5lW2RhdGEtYWN0aXZlLWl0ZW0tcGF0aF0gLnRhYi5hY3RpdmVcIjpcbiAgICBcInRyZWUtdmlldzpzaG93LWN1cnJlbnQtZmlsZS1pbi1maWxlLW1hbmFnZXJcIjogXCLjg5XjgqHjgqTjg6vjg57jg43jg7zjgrjjg6PjgafooajnpLpcIlxuICBcIi5wbGF0Zm9ybS1kYXJ3aW4gYXRvbS10ZXh0LWVkaXRvcjpub3QoW21pbmldKVwiOlxuICAgIFwidHJlZS12aWV3OnNob3ctY3VycmVudC1maWxlLWluLWZpbGUtbWFuYWdlclwiOiBcIkZpbmRlciDjgafooajnpLpcIlxuICBcIi5wbGF0Zm9ybS13aW4zMiBhdG9tLXRleHQtZWRpdG9yOm5vdChbbWluaV0pXCI6XG4gICAgXCJ0cmVlLXZpZXc6c2hvdy1jdXJyZW50LWZpbGUtaW4tZmlsZS1tYW5hZ2VyXCI6IFwi44Ko44Kv44K544OX44Ot44O844Op44Gn6KGo56S6XCJcbiAgXCIucGxhdGZvcm0tbGludXggYXRvbS10ZXh0LWVkaXRvcjpub3QoW21pbmldKVwiOlxuICAgIFwidHJlZS12aWV3OnNob3ctY3VycmVudC1maWxlLWluLWZpbGUtbWFuYWdlclwiOiBcIuODleOCoeOCpOODq+ODnuODjeODvOOCuOODo+OBp+ihqOekulwiXG59XG4iXX0=
