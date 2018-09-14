# some more ls aliases
alias sl='ls -CF'
alias ll='ls -alF'
alias la='ls -A'
alias l='ls -CF'

alias vi='nvim'

# nvim
alias XDG_CONFIG_HOME=$HOME/.config/nvim/init/vim
alias v='nvim'
alias vi='nvim'
alias emacs='nvim'
alias a='atom'
alias aotm='atom'

alias python='python3'
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
alias res='fish'

# ssh
alias cos='ssh -p 59022 non@ctare.cloudapp.net'
alias conoha='ssh zomi@118.27.11.179'
alias ubuntu='ssh nozomi@192.168.100.121'

# pyenv
set -x PYENV_ROOT $HOME/.pyenv
set -x PATH $PYENV_ROOT/ $PATH
eval (pyenv init - | source)
eval (pyenv virtualenv-init - | source)
