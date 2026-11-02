#!/bin/zsh
# usage: render_art.sh <svgdir> <pngdir> name...
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; src=$1; dst=$2; shift 2; mkdir -p $dst
for n in "$@"; do
  sz=$(/usr/bin/grep -oE 'width="[0-9]+" height="[0-9]+"' $src/$n.svg | head -1); w=${${sz#width=\"}%%\"*}; h=${${sz##*height=\"}%\"}
  print "<!doctype html><style>html,body{margin:0;background:transparent}svg{display:block}</style>$(<$src/$n.svg)" > $dst/$n.html
  "$CH" --headless=new --disable-gpu --hide-scrollbars --user-data-dir=$dst/.prof --default-background-color=00000000 --window-size=$w,$h --screenshot=$dst/$n.png file://$dst/$n.html >/dev/null 2>&1
done
