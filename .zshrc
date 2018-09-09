export HISTFILE=$HOME/.zsh_history
export HISTSIZE=10000
export SAVEHIST=20000
# eval $(dircolors $HOME/.colorrc)

COLOR_PALETTE=''
for i in $(seq 0 255); do
  COLOR_PALETTE="${COLOR_PALETTE}[38;5;${i}m${i};"
done

autoload -Uz vcs_info
setopt prompt_subst
zstyle ':vcs_info:git:*' check-for-changes true
zstyle ':vcs_info:git:*' stagedstr "%F{yellow}!"
zstyle ':vcs_info:git:*' unstagedstr "%F{red}+"
zstyle ':vcs_info:*' formats "%F{green}%c%u[%b]%f"
zstyle ':vcs_info:*' actionformats '[%b|%a]'
precmd () { vcs_info }

# PROMPT="%{[38;5;85m%}%n%f: %~%(!.#.%%) %{[0m%}"
PROMPT="%{[01;32m%}%n@%m%f%{[0m%}:%f%{[01;34m%}~%f%{[0m%}%(!.#.$) "
RPROMPT=$RPROMPT'${vcs_info_msg_0_}'

export LANG=ja_JP.UTF-8

autoload -U compinit; compinit
zstyle ':completion:*:default' menu select=1
zstyle ':completion:*' matcher-list 'm:{a-z}={A-Z}'
zstyle ':completion:*' ignore-parents parent pwd ..
zstyle ':completion:*:processes' command 'ps x -o pid,s,args'

setopt auto_cd
setopt auto_pushd
setopt pushd_ignore_dups
setopt hist_ignore_all_dups
setopt hist_ignore_space
setopt EXTENDED_HISTORY
setopt correct
setopt print_eight_bit
setopt magic_equal_subst
setopt share_history
WORDCHARS='*?_-.[]~=&;!#$%^(){}<>'
fignore=(CVS .class)

alias dir='dir --color=auto'
alias vdir='vdir --color=auto'
alias ls='ls --color'
alias la='ls -a'
alias ll='ls -la'
alias l='ls'

alias clip='xsel --clipboard --input'
# alias clip='pbcopy'

alias grep='grep --color=auto'
alias fgrep='fgrep --color=auto'
alias egrep='egrep --color=auto'

alias vir='vi ~/.vim/init.vim'
alias vipl='vi ~/.vim/rc/dein.toml'
alias vipll='vi ~/.vim/rc/dein_lazy.toml'
alias vi='nvim'
alias vim='~/my/python/vim/nvim_hook.py'
alias nyao='nyaovim'
alias nir='vi ~/.config/nyaovim/nyaovimrc.html'
alias ni='nyaovim'
alias bar='vi ~/.zshrc'
alias zar='vi ~/.zshrc'
alias :q='exit'
alias res='exec $SHELL'
alias shut='sudo shutdown -h 0'
alias inia='a=`pwd`'
alias inib='b=`pwd`'
alias cda='cd $a'
alias cdb='cd $b'
alias weather='curl wttr.in/Tokyo'

#git hub
alias g='git'
alias gbr='git branch'
alias gcd='git checkout'
alias gcl='git remote prune origin'
alias gst='git status'
alias glo='git log'
alias gad='git add'
alias gnad='git reset HEAD'
alias gmit='git commit'
alias gull='git pull'
alias gish='git push'

# envs
PYENV_ROOT=${HOME}/.pyenv
export PATH=$PATH:$PYENV_ROOT/bin
eval "$(pyenv init -)"
# eval "$(pyenv virtualenv-init -)"

# my funcs
function mkcd(){
	mkdir -p $1; cd $1
}

export XDG_CONFIG_HOME=${HOME}/.config/

### Added by the Heroku Toolbelt
export PATH="/usr/local/heroku/bin:$PATH"
export CPLUS_INCLUDE_PATH="$CPLUS_INCLUDE_PATH:/usr/include/python3.4m/"
export PATH="$HOME/my/bin:$PATH"
export PATH="$PATH:/usr/local/go/bin"

export GOPATH="$HOME/my/go"
export PATH="$PATH:$GOROOT/bin"

#peco
alias -g H='`curl -sL https://api.github.com/users/ctare/repos | jq -r ".[].full_name" | peco --prompt "GITHUB REPOS>" | head -n 1`'
alias -g B='`git branch -a | peco --prompt "GIT BRANCH>" | head -n 1 | sed -e "s/^\*\s*//g"`'   
function getvalue(){
  a=($(cat -))
  echo ${a[${1}]}
}
alias -g GHQ='$(ghq list -p | peco --prompt "GHQ LIST>")'
alias -g PS='$(ps | peco --prompt "PS LIST>" | getvalue 1)'
alias -g PSA='$(ps aux | peco --prompt "PS LIST>" | getvalue 2)'
alias -g DIM='$(docker images | peco --prompt "DOCKER IMAGES LIST>" | getvalue 3)'
alias -g DPS='$(docker ps -a | peco --prompt "DOCKER PS LIST>" | getvalue 1)'

export CUDA_HOME="/usr/local/cuda"
export PATH="/usr/local/cuda/bin:$PATH"
export LD_LIBRARY_PATH="$CUDA_HOME/lib64:$LD_LIBRARY_PATH"

export PATH=/usr/local:$PATH

function tut() {
  sudo nmcli con $1 id TUT
  # sudo ifconfig ppp0 mtu 1156
}

export PATH="$PATH:${HOME}/tools/depot_tools"
alias chrome="chromium-browser"
