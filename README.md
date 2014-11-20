Tagcade UI
===========

1) Installing and running the UI
---------------------------------

Clone or download the repository:

```
git clone git@github.com:tagcade/tagcade-ui.git
```

Open a terminal and change directory to the tagcade-ui directory and run:

```
npm install
```

```
bower install
```

This will install all dependencies in package.json and bower.json.

Go to `build/config` and create a `userConfig.js` file. You can create it from the `userConfig.js.dist` file, by default it uses `chromium-browser` on Linux.

The gruntfile defines tasks, simply run the `grunt` command in the tagcade-ui directory and the project will automatically be built and it will refresh on changes.

2) Installing Compass and Sass
------------------------------

The styles for this project are built with compass/sass. The easiest way is with a ruby gem.

If you're on OS X or Linux you probably already have Ruby installed; test with ruby -v in your terminal. When you've confirmed you have Ruby installed, run `sudo gem update --system && sudo gem install compass` and `sudo gem install sass` to install Compass and Sass.