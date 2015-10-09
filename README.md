# Autorefresh

Automatically refresh styles when files are updated

## Insttallation

```bash
npm install autorefresh -g
```

## Usage

Note: this example is available in the `/example/less` folder

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
.but {color: contrast(@color-button); background: @color-button; padding: 1rem 3rem; border-radius: 20px; border: 4px solid #fff; font-size: 2rem; }
```

Using a compile.sh file to compile the LESS file like so:

```bash
lessc --source-map=style.less.map style.less>style.css
```

You simply run this command:

```bash
autorefresh ./compile.sh style.less
```

Now open `test01.htm`, then edit `style.less`, change the body background to "#0a0" and save - you should see the page instantly refresh the background style to a lovely green colour.

Note: by default autorefresh will refresh all style link tags - to disable that, pass "?specify=true" as a parameter to the refresh.js file, and add a `data-autorefresh="true` to the links you do want refreshed, eg:

```markup
<html>
	<link rel="stylesheet" type="text/css" data-autorefresh="true" href="style.css">
	<button class="but" type="button">Button</button>
	<script type="text/javascript" src="http://localhost:2886/refresh.js?specify=true"></script>
</html>
```
