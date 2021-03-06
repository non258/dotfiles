let g:ycm_global_ycm_extra_conf = '~/.ycm_extra_conf.py'

if has('nvim')
  " ターミナルをESCで抜けられるように
  tnoremap <silent> <ESC> <C-\><C-n> 
endif

" モード切替
" -----------------------------------------------------
""inoremap <silent> jj <ESC> 
" -----------------------------------------------------

" filetype設定
" -----------------------------------------------------
autocmd BufRead,BufNewFile *.rs setfiletype rust
autocmd BufRead,BufNewFile *.vue setfiletype html

autocmd FileType php :setlocal expandtab
autocmd FileType php :setlocal softtabstop=4
autocmd FileType php :setlocal shiftwidth=4
" -----------------------------------------------------

" タブ,ウインドウ設定
" -----------------------------------------------------
nnoremap s <Nop>
nnoremap st :<C-u>tabnew<CR>
nnoremap s= <C-w>=

" ウインドウ分割
nnoremap sv :sv<CR>
nnoremap vs :vs<CR>

" ウインドウ移動
nnoremap sh :call MaximumWindow("h")<CR>
nnoremap sj :call MaximumWindow("j")<CR>
nnoremap sk :call MaximumWindow("k")<CR>
nnoremap sl :call MaximumWindow("l")<CR>
nnoremap K gt
nnoremap J gT

" ウインドウリサイズ
nnoremap s> <C-w>>
nnoremap s< <C-w><
nnoremap s- <C-w>_

function! MaximumWindow(key)
  call execute(":wincmd ".a:key)

  if 1 == winheight(0)
    if a:key == "j" || a:key == "k"
      call feedkeys("\<C-w>_")
    else
      call feedkeys("\<C-w>|")
    endif
  endif
endfunction

" ウインドウ操作
nnoremap sq <C-w>q
" -----------------------------------------------------

" dein設定
" -----------------------------------------------------
let s:dein_dir = expand('~/.cache/dein')
let s:dein_repo_dir = s:dein_dir . '/repos/github.com/Shougo/dein.vim'

if &runtimepath !~# '/dein.vim'
  if !isdirectory(s:dein_repo_dir)
    execute '!git clone https://github.com/Shougo/dein.vim' s:dein_repo_dir
  endif
  execute 'set runtimepath^=' . fnamemodify(s:dein_repo_dir, ':p')
endif

if dein#load_state(s:dein_dir)
  call dein#begin(s:dein_dir)

  let g:rc_dir    = expand('~/.config/nvim')
  let s:toml      = g:rc_dir . '/dein.toml'
  let s:lazy_toml = g:rc_dir . '/dein_lazy.toml'

  call dein#load_toml(s:toml,      {'lazy': 0})
  call dein#load_toml(s:lazy_toml, {'lazy': 1})

  call dein#end()
  call dein#save_state()
endif

if dein#check_install()
  call dein#install()
endif
" -----------------------------------------------------

" 汎用設定
" -----------------------------------------------------
syntax on
filetype plugin indent on
" -----------------------------------------------------
"
"
"自分の設定
" -----------------------------------------------------
let g:neosnippet#snippets_directory='~/.config/nvim/'
"表示関係
set relativenumber
set number
set background=dark
""行番号の色を400(白)に変更(でふぉの色だと何も見えない)
autocmd ColorScheme * highlight LineNr ctermfg=400
""背景色を半透明(ターミナルと同じ)に設定
autocmd BufRead,BufNew,BufEnter,BufNewFile * highlight Normal ctermbg=none
colorscheme hybrid

"tab
set expandtab tabstop=2 shiftwidth=2

"異常終了した時の対策
set noswapfile nobackup undofile 
execute 'set undodir=~/.config/nvim/tmp'

"キーバインド
"" inoremap jj <ESC>
""もらいもの
"inoremap " ""<Left>
"inoremap ' ''<Left>
"inoremap ( ()<Left>
"inoremap (; ();<Left><Left>
"inoremap () ()
"inoremap (<CR> (<CR><CR>)<Up><ESC>S
inoremap { {}<Left>
inoremap {; {};<Left><Left>
inoremap {} {}
inoremap {<CR> {<CR><CR>}<Up><ESC>S
"inoremap [ []<Left>
"inoremap [; [];<Left><Left>
"inoremap [] []
"inoremap [<CR> [<CR><CR>]<Up><ESC>S

"やんくしたものを他のブラウザに貼り付けられる
set clipboard+=unnamedplus

"clang-format
let g:clang_format#style_options = {
            \ "BasedOnStyle" : "Google",
            \ "UseTab" : "Never",
            \ "IndentWidth" : 2,
            \ "ConstructorInitializerIndentWidth" : 2,
            \ "ContinuationIndentWidth" : 2,
            \ "IndentCaseLabels" : "true",
            \ "PointerAlignment" : "Right",
            \ "AllowShortIfStatementsOnASingleLine" : "false",
            \ "AllowShortLoopsOnASingleLine" : "false", 
            \ "AlignTrailingComments" : "true",
            \ "AlwaysBreakBeforeMultilineStrings" : "true",
            \ "AlwaysBreakTemplateDeclarations" : "true",
            \ "BreakBeforeBraces" : "Allman",
            \ }

let g:python3_host_prog = '/home/nozomi/.pyenv/versions/anaconda3-5.3.0/envs/py36/bin/python'
let g:python_host_prog = '/home/nozomi/.pyenv/versions/anaconda3-5.3.0/envs/py27/bin/python'
