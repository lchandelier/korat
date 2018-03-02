# Korat
This package contains a base structure to start a front-end project.

It's called Korat because I'm a crazycat lady and a Korat cat is as small as this starterkit :)

It uses Gulp and Sass.

The gulpfile tasks allow you to:

- Compress and concatenate SCSS
- Compress and concatenate JS
- Generate sourcemaps for each CSS/JS files
- Optimize images and create Webp format
- Create an SVG sprite usable inline
- Include HTML parts (like header/footer...)
- Add [Fabricator](http://fbrctr.github.io/) in order to create styleguide
- Reload your browser at each code update
- Check for accessibility issues
- Create a clean delivery zip of your project

## Installation
1. Install [Python 2.7](https://www.python.org/downloads/release/python-2711/)
2. Extract this package at the root of your project
3. Install Gulp globally with `npm install -g gulp` command
4. Run the `npm install` command to install all required node modules
5. Run `gulp` command.
6. Enjoy !

## Usage
You have to edit the gulpfile to change the **urlSync variable** and the other paths if you want to.

### HTML
The editable HTML (your page template like home.html, contact.html) are in **site/html**  
The included HTML parts (header, footer, everything common to all pages) are in **site/inc**  
The HTML template you create have to be placed in **site/html**.  
A mix will be made with the included files and the result will be generated at the root of the project.

You can refer to **site/html/index.html** as an example

More doc here: [https://www.npmjs.com/package/gulp-file-include](https://www.npmjs.com/package/gulp-file-include)

### Sprites

1. Put your SVG icons in the "sprites" folder
2. Run `gulp sprites` command (if you're not already use `gulp` command).
3. The sprite file is generated in **site/img/global** folder and the CSS is generated in the CSS folder
4. Call your icon like this: ```<svg role="img" class="unicorn" aria-label="Pink fluffy unicorn dancing on rainbow"><use xlink:href="#unicorn"></use></svg>```

More doc :

- [https://www.npmjs.com/package/gulp-svg-symbols](https://www.npmjs.com/package/gulp-svg-symbols)
- [https://www.npmjs.com/package/gulp-cheerio](https://www.npmjs.com/package/gulp-cheerio)
- [https://www.npmjs.com/package/gulp-if](https://www.npmjs.com/package/gulp-if)


### Styleguide/Fabricator
If you are on Windows, you may need to install Python 2.7.

If you want to add a styleguide to your project, just use the `gulp styleguide` command.  
It will untar Fabricator in the **styleguide** folder.  
To install it, you just have to be in the styleguide folder and launch the command `npm start`  
Every time you will update CSS/JS in your project, it'll be updated in the styleguide folder (by default in **styleguide/src/assets/toolkit**).  
Follow the doc for more informations [http://fbrctr.github.io/docs/] (http://fbrctr.github.io/docs/)

### Accessibility check
Just run the `gulp axe` command. It will report all accessibility issues in your console and in the a11yResult.json file.
This file will be located in the aXeReports directory.

More doc :

- [https://www.npmjs.com/package/gulp-axe-webdriver](https://www.npmjs.com/package/gulp-axe-webdriver)

### List of modules used ###

- [https://www.npmjs.com/package/gulp-axe-webdriver](https://www.npmjs.com/package/gulp-axe-webdriver)
- [http://www.browsersync.io/docs/gulp/](http://www.browsersync.io/docs/gulp/)
- [https://www.npmjs.com/package/gulp-cache](https://www.npmjs.com/package/gulp-cache)
- [https://www.npmjs.com/package/gulp-changed](https://www.npmjs.com/package/gulp-changed)
- [https://www.npmjs.com/package/gulp-cheerio](https://www.npmjs.com/package/gulp-cheerio)
- [https://www.npmjs.com/package/gulp-clean-css](https://www.npmjs.com/package/gulp-clean-css)
- [https://www.npmjs.com/package/gulp-clone](https://www.npmjs.com/package/gulp-clone)
- [https://www.npmjs.com/package/gulp-concat](https://www.npmjs.com/package/gulp-concat)
- [https://www.npmjs.com/package/gulp-file-include](https://www.npmjs.com/package/gulp-file-include)
- [https://www.npmjs.com/package/gulp-filter](https://www.npmjs.com/package/gulp-filter)
- [https://www.npmjs.com/package/gulp-iconfont](https://www.npmjs.com/package/gulp-iconfont)
- [https://www.npmjs.com/package/gulp-if](https://www.npmjs.com/package/gulp-if)
- [https://www.npmjs.com/package/gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin)
- [https://www.npmjs.com/package/merge-stream](https://www.npmjs.com/package/merge-stream)
- [https://www.npmjs.com/package/gulp-notify](https://www.npmjs.com/package/gulp-notify)
- [https://www.npmjs.com/package/gulp-plumber](https://www.npmjs.com/package/gulp-plumber)
- [https://www.npmjs.com/package/gulp-rename](https://www.npmjs.com/package/gulp-rename)
- [https://www.npmjs.com/package/gulp-sass](https://www.npmjs.com/package/gulp-sass)
- [https://www.npmjs.com/package/gulp-shell](https://www.npmjs.com/package/gulp-shell)
- [https://www.npmjs.com/package/gulp-sourcemaps](https://www.npmjs.com/package/gulp-sourcemaps)
- [https://www.npmjs.com/package/gulp-svg-symbols](https://www.npmjs.com/package/gulp-svg-symbols)
- [https://www.npmjs.com/package/gulp-uglify](https://www.npmjs.com/package/gulp-uglify)
- [https://www.npmjs.com/package/gulp-webp](https://www.npmjs.com/package/gulp-webp)
- [https://www.npmjs.com/package/gulp-zip](https://www.npmjs.com/package/gulp-zip)


## History
First version

### 1.1.0 ###
- Add package.json

### 1.1.1 ###
- Modules upgrade

### 1.2.0 ###
- Update npm version to use nodejs version 6.9.1
- Remove rem breakpoints
- Better a11y on skip links and a11y_hidden class

### 1.2.1 ###
- Better a11y on main regions (tabindex)
- Use gulp-sass instead of gulp-compass
- Remove config.rb file-include

### 1.3.0 ###
- Modules upgrade
- Remove useless sourcemap file
- Add accessibility check with axe-webdriver
- Remove REM calculation for sprites

### current version - 2.0.0 ###
- Modules upgrade
- Moved fonts declarations in _setup.scss
- Remove icon-fonts management
- Sprites as inline svg
- Remove rem convertion and sprites mixins
- New media queries system using [sass-mq](https://github.com/sass-mq/sass-mq)
- Add gulp-changed module to optimize only changed or new images
- Add gulp-svg-symbols
- Add gulp-if to choose where to put svg sprite and its css
- Add cheerio to cleanup svg attributes
- Add webp and gulp-clone to convert jpg/png/... to webp
- Update HTML files


## Credits
Author: Mylène Chandelier
## License
Copyright © 2016 Mylène Chandelier <chandelier.mylene@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
