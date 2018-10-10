#!/bin/bash

rm ~/.bashrc
rm -r ~/.config

ln -sf ~/dotfiles/.bashrc ~/.bashrc
ln -sf ~/dotfiles/.zshrc ~/.zshrc
ln -sf ~/dotfiles/.zplug ~/.zplug
ln -sf ~/dotfiles/.config ~/.config
ln -sf ~/dotfiles/.vim ~/.vim
ln -sf ~/dotfiles/.bash_profile ~/.bash_profile
ln -sf ~/dotfiles/.gitconfig ~/.gitconfig
ln -sf ~/dotfiles/.conky ~/.conky
