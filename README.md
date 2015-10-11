# Autorefresh

Automatically refresh styles when files are updated - allowing you to optionally execute a compile step.

## Installation

```bash
npm install autorefresh -g
```

## Usage

1. Start up an autorefresh server

```
autorefresh -c [command] -p [port] [files...]
```

Where:

* -c \[command\] is the command to execute when one of the [files] change
* -p \[port\] is the port to run on, defaults to 2886
* -d \[delay\] is the time in milliseconds to wait before notifying the client that a command has finished
* -q \[boolean\] if we want to be quiet and not output anything
* \[files\] is a list of files or a glob pattern - just be sure to not match the files you generate, as this can cause an infinte loop

2. Add a script tag in your html page in the head before the /html tag:

```html
<script>document.write("<script src='//"+(location.host||"localhost").split(":")[0]+":2886/refresh.js'><"+"/script>");</script>
```

### Example

Note: an example that uses `LESS` is available in the `/example` folder - be sure to install LESS: `npm install less -g` first.

Say you have a HTML file (test01.htm), add the Autorefresh script tag like so:

```html
<html>
	<link rel="stylesheet" type="text/css" href="style.css">
	<script>document.write("<script src='//"+(location.host||"localhost").split(":")[0]+":2886/refresh.js'><"+"/script>");</script>
</html>
```

And where a LESS file (style.less) generates the style.css file like so:

```less
@color-main: #007;
body { background: @color-main; }
```

Using a compile.sh file to compile the LESS file like so:

```bash
lessc --source-map=style.less.map style.less>style.css
```

You simply run this command:

```bash
autorefresh -c ./compile.sh style.less
```

Now open `test01.htm` in a browser, then edit `style.less` and change the @color-main to "#0a0" and save - you should see the page instantly refresh the background style to a lovely green colour.

## Parameters

Note: you can add the following parameters to the refresh script:

```
socketurl=[socketurl]
specify=[boolean]
```

Where

* `socketurl` is the URL for the socket you want to connect to, eg: "socketurl=http%3A%2F%2Flocalhost%3A2886%2Fautorefresh"
* `specify` is a boolean that allows you to specify which style tags are refreshed - by default we will refresh all style tags. Add a `data-autorefresh="true` to the links you do want refreshed, eg:

```html
<html>
	<link rel="stylesheet" type="text/css" href="base.css">
	<link rel="stylesheet" type="text/css" data-autorefresh="true" href="style.css">
	<script>document.write("<script src='//"+(location.host||"localhost").split(":")[0]+":2886/refresh.js?specify=true'><"+"/script>");</script>
</html>
```

Will only auto refresh the style.css file, and leave the base.css file alone.

## Why yet another one of these?

There are [quite](http://livereload.com/) a [few](http://livestyle.emmet.io/) [good](http://www.browsersync.io/) tools that do similar things to autorefresh, but I found that my use case wasn't easily implemented, or had issues such as timing and other compilation problems that just got in the way. The use case is this:

* Using LESS with source maps
* Integrating within an existing project using a particular IDE, (though we prefer the solution to be independent from the IDE)
* Reloading the whole page can take a while, so want to just refresh the CSS
* Minimal effort setup, allowing a compilation step
