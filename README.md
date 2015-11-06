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

3) Installing Selenium for end to end test
------------------------------

```
npm install selenium-standalone@latest -g
selenium-standalone install
```

* Configuration for Tests
Create protractor config file for admin and publisher test similar to .dist files in the same directory tagcade-ui/test


Then run end to end test

```
grunt e2e
```

4) Custom page title and logo
------------------------------

* Run grunt task `build-prod-white-label-custom` with parameters

    ```
    grunt build-prod-white-label-custom:"{Page title}":"{path to logo}":"{path to header logo}"
    ```


* For example

    ```
    grunt build-prod-white-label-custom:"Test Platform":"build/images/whitelabel/logo.png":"build/images/whitelabel/logo-header.png"
    ```