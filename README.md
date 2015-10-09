# Autorefresh

Automatically refresh styles when files are updated

```bash
npm install autorefresh
```

Example usage:

```bash
node app.js public/compile.sh public/style.less
```

Now open `http://localhost:2886/test01.htm`, then edit `public/style.less`, change the body background to "#0a0" and save - you should see the page instantly refresh the background style to a lovely green colour.