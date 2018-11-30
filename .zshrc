# zplug
# ------------------------------------------------------------ #
# zplugが無ければgitからclone
if [[ ! -d ~/.zplug ]];then
  git clone https://github.com/zplug/zplug ~/.zplug
fi

# zplugを使う
source ~/.zplug/init.zsh

# プラグイン
# -------------------------------------------------- #
# zplug "ユーザー名/リポジトリ名", タグ

# 補完を更に強化する
# pacman や yaourt のパッケージリストも補完するようになる
zplug "zsh-users/zsh-completions"

# git の補完を効かせる
# 補完＆エイリアスが追加される
zplug "plugins/git",   from:oh-my-zsh
zplug "peterhurford/git-aliases.zsh"

# あいまい入力補完
zplug "tarruda/zsh-fuzzy-match"

# 入力途中に候補をうっすら表示
zplug "zsh-users/zsh-autosuggestions"

# 入力補完 次の候補を予測する
# ctl-u が効かなくなる
# zplug "oknowton/zsh-dwim"
 
# コマンドを種類ごとに色付け
zplug "zsh-users/zsh-syntax-highlighting", defer:2
 
# ヒストリの補完を強化する
zplug "zsh-users/zsh-history-substring-search", defer:3

# 本体（連携前提のパーツ）
zplug "junegunn/fzf-bin", as:command, from:gh-r, rename-to:fzf
zplug "junegunn/fzf", as:command, use:bin/fzf-tmux

# fzf でよく使う関数の詰め合わせ
zplug "mollifier/anyframe"

# ディレクトリ移動を高速化（fzf であいまい検索）
zplug "b4b4r07/enhancd", use:init.sh

# git のローカルリポジトリを一括管理（fzf でリポジトリへジャンプ）
zplug "motemen/ghq", as:command, from:gh-r

zplug "mollifier/cd-gitroot"
# antigen bundle mollifier/cd-gitroot
# zgen load mollifier/cd-gitroot

# zplug "stedolan/jq", from:gh-r, as:command | zplug "b5b4r07/emoji-cli", if:"which jq"

# # antigen/zgen では別途 jq をインストールする必要あり
# antigen bundle b4b4r07/emoji-cli
# zgen load b4b4r07/emoji-cli

# zplug "b4b4r07/enhancd", of:enhancd.sh
# antigen bundle b4b4r07/enhancd zsh
# zgen load b4b4r07/enhancd zsh

# zplug "zsh-users/zsh-history-substring-search", do:"__zsh_version 4.3"
# antigen bundle zsh-users/zsh-history-substring-search
# zgen load zsh-users/zsh-history-substring-search

# compinit 以降に読み込むようにロードの優先度を変更する
zplug "zsh-users/zsh-syntax-highlighting", defer:2

# antigen bundle zsh-users/zsh-syntax-highlighting
# zgen load zsh-users/zsh-syntax-highlighting

# zplug "zsh-users/zsh-completions"
# antigen bundle zsh-users/zsh-completions
# zgen load zsh-users/zsh-completions

zplug "mrowa44/emojify", as:command

# テーマ
# zplug "bhilburn/powerlevel9k", use:"powerlevel9k.zsh-theme", as:theme
zplug "caiogondim/bullet-train.zsh", use:bullet-train.zsh-theme, defer:3 # defer until other plugins like oh-my-zsh is loaded

# -------------------------------------------------- #


# 自分自身をプラグインとして管理
zplug "zplug/zplug", hook-build:'zplug --self-manage'

# インストールしてないプラグインはインストール
if ! zplug check --verbose; then
    printf "Install? [y/N]: "
    if read -q; then
        echo; zplug install
    fi
fi

# コマンドをリンクして、PATH に追加し、プラグインは読み込む
zplug load
# ------------------------------------------------------------ #


autoload -U compinit
compinit



# alias
# ------------------------------------------------------------ #
export  HISTFILE=${HOME}/.zsh_history
# メモリに保存される履歴の件数
export  HISTSIZE=1000

# 履歴ファイルに保存される履歴の件数
export SAVEHIST=10000000

# 重複を記録しない
setopt hist_ignore_dups

# 開始と終了を記録
setopt EXTENDED_HISTORY

alias alert='notify-send --urgency=low -i "$([ $? = 0 ] && echo terminal || echo error)" "$(history|tail -n1|sed -e '\''s/^\s*[0-9]\+\s*//;s/[;&|]\s*alert$//'\'')"'

# cd && mkdir
function mkcd(){
  mkdir -p $1; cd $1
}

# some more ls aliases
alias sl='ls -CF'
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

alias dir='dir --color=auto'
alias vdir='vdir --color=auto'

alias ls='ls --color'
alias la='ls -a'
alias ll='ls -la'
alias l='ls'

alias atp='apt'

# nvim
alias XDG_CONFIG_HOME=$HOME/.config/nvim/init/vim
alias v='nvim'
alias vi='nvim'
alias emacs='nvim'
alias a='atom'
alias aotm='atom'

alias py='python3'

# cd
alias c='cd ../'
alias cdd='cd /home/nozomi/Documents'
alias cddw='cd /home/nozomi/Downloads'

alias open='xdg-open ./'

alias minit='cpull'

# javac -cp
alias robo='javac -cp ~/robocode/libs/robocode.jar'
alias gf='javac -cp /usr/share/greenfoot/extensions/greenfoot.jar'

# exec
alias res='exec $SHELL'

# golang
export PATH=$PATH:/usr/local/go/bin
export GOPATH=$HOME/go
export PATH=$PATH:$GOROOT/bin

# ssh
alias cos='ssh -p 59022 non@ctare.cloudapp.net'
alias conoha='ssh zomi@118.27.11.179'
alias ubuntu='ssh nozomi@192.168.100.121'

#rbenv
alias colors='for i in $(seq 0 255); do echo -e "\033[38;5;${i}m${i}\033[0m"; done'
# export PATH="$HOME/.rbenv/bin:$PATH"
# eval "$(rbenv init -)"
# export PATH="$HOME/.cargo/bin:$PATH"


# pyenv
export PYENV_ROOT="$HOME/.pyenv"
export PATH="$PYENV_ROOT/bin:$PATH"
eval "$(pyenv init -)"
# eval "$(pyenv virtualenv-init -)"

# rustc
export PATH=$PATH:$HOME/.cargo/bin

# exec fish

alias pjavac='javac -cp ~/project/processiong/core/library/core.jar'
alias pjava='java -cp ~/project/processiong/core/library/core.jar:.'

export PATH="$PATH:"/opt/microchip/xc16/v1.35/bin""
export CXX='g++-7'
export CC='gcc-7'

eval $(colter --init)

setopt auto_cd
# ------------------------------------------------------------ #
setopt prompt_subst # Make sure prompt is able to be generated properly.
