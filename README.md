# Autorefresh

Automatically refresh styles when files are updated - allowing you to optionally execute a compile step.

## Installation

```bash
npm install autorefresh -g
```

## Usage

```
autorefresh -c [command] -p [port] [files...]
```

Where:

* -c [command] is the command to execute when one of the [files] change
* -p [port] (optional) is the port to run on, defaults to 2886
* -q [boolean] (optional), if we want to be quiet and not output anything
* [files] is a list of files or a glob pattern - just be sure to not match the files you generate, as this can cause an infinte loop

### Example

Note: an example that uses `LESS` is available in the `/example` folder - be sure to install LESS: `npm install less -g` first.

Say you have a HTML file (test01.htm) like so:

```markup
<html>
	<link rel="stylesheet" type="text/css" href="style.css">
	<button class="but" type="button">Button</button>
</html>
```

Add a script tag like so before the /html tag:

```markup
<script type="text/javascript" src="http://localhost:2886/refresh.js"></script>
```

And where a LESS file (style.less) generates the style.css file like so:

```less
@color-main: #007;
@color-button: lighten(@color-main, 20%);
body { background: @color-main; text-align: center; }
.but {
	color: contrast(@color-button);
	background: @color-button;
	padding: 1rem 3rem;
	border-radius: 20px;
	border: 4px solid #fff;
	font-size: 2rem;
}
```

Using a compile.sh file to compile the LESS file like so:

```bash
lessc --source-map=style.less.map style.less>style.css
```

You simply run this command:

```bash
autorefresh -c ./compile.sh style.less
```

Now open `test01.htm`, then edit `style.less`, change the @color-main to "#0a0" and save - you should see the page instantly refresh the background style to a lovely green colour.

## Parameters

Note: you can add the following parameters to the refresh script:

```
socketurl=[socketurl]
specify=[boolean]
```

Where

* `socketurl` is the URL for the socket you want to connect to, eg: "socketurl=http%3A%2F%2Flocalhost%3A2886%2Fautorefresh"
* `specify` is a boolean that allows you to specify which style tags are refreshed - by default we will refresh all style tags. Add a `data-autorefresh="true` to the links you do want refreshed, eg:

```markup
<html>
	<link rel="stylesheet" type="text/css" href="base.css">
	<link rel="stylesheet" type="text/css" data-autorefresh="true" href="style.css">
	<button class="but" type="button">Button</button>
	<script type="text/javascript" src="http://localhost:2886/refresh.js?specify=true"></script>
</html>
```

Will only auto refresh the style.css file, and leave the base.css file alone.

