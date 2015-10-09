# npm install chokidar-cli -g
# npm install less -g
# chokidar --verbose *.less -c compile.sh
lessc --source-map=style.less.map public/style.less>public/style.css
cp public/style.css public/style.min.css
mv style.less.map public/.