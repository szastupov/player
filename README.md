Player is a web app to stream music from [music bot](https://github.com/szastupov/musicbot).

It designed mostly for phones but works just as well on desktops and tablets.

![Mobile](http://i.imgur.com/VtJK1pO.png)
![Desktop](http://i.imgur.com/JhMNnSJ.jpg)

## Getting started
You need a running instance of the music bot, refer to its [readme](https://github.com/szastupov/musicbot/blob/master/README.md) to get it up and running.

Thn fire up your console and run:

```
$ npm install
$ BOT_URL=http://localhost npm run dev
```

To run it without webpack:
```
$ npm run dist
$ npm start
```

## Browsers support

### Safari
The app looks best on Safari because of CSS backdrop filters but mobile Safari has one major issue:
it doesn't jump to the next track when the screen is locked.

### Chrome & Firefox
These browsers don't support CSS backdrops nor CSS sticky flag, thats why the panel will move with the list. Otherwise should work fine.
