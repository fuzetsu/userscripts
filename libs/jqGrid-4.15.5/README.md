# free fork of jqGrid
[![npm version](https://img.shields.io/npm/v/free-jqgrid.svg?style=flat)](https://www.npmjs.com/package/free-jqgrid)![downloadspermonth](https://img.shields.io/npm/dm/free-jqgrid.svg?style=flat-square)&nbsp;[![Bower](https://img.shields.io/bower/v/free-jqgrid.svg?style=flat-square)](http://bower.io/search/?q=free-jqgrid)&nbsp;[![NuGet](https://img.shields.io/nuget/v/free-jqgrid.svg?style=flat-square)](https://www.nuget.org/packages/free-jqGrid/)![downloadstotal](https://img.shields.io/nuget/dt/free-jqgrid.svg?style=flat-square)&nbsp;[![Maven Central](https://img.shields.io/maven-central/v/org.webjars.npm/free-jqgrid.svg?style=flat-square)](http://search.maven.org/#search%7Cga%7C1%7Cfree-jqgrid)<br>[![CDNJS](https://img.shields.io/cdnjs/v/free-jqgrid.svg)](https://cdnjs.com/libraries/free-jqgrid/)&nbsp;[![jsDelivr CDN](https://img.shields.io/badge/jsDelivr%20CDN-v4.15.5-blue.svg)](https://www.jsdelivr.com/projects/free-jqgrid) [![](https://data.jsdelivr.com/v1/package/npm/free-jqgrid/badge?style=rounded)](https://www.jsdelivr.com/package/npm/free-jqgrid)&nbsp;<br>[![GitHub commits](https://img.shields.io/github/commits-since/free-jqgrid/jqgrid/v4.7.0.svg)](https://github.com/free-jqgrid/jqGrid/compare/v4.7.0...master)&nbsp;[![GitHub watchers](https://img.shields.io/github/watchers/free-jqgrid/jqGrid.svg)](https://github.com/free-jqgrid/jqGrid/watchers)[![GitHub forks](https://img.shields.io/github/forks/free-jqgrid/jqGrid.svg)](https://github.com/free-jqgrid/jqGrid/network)[![GitHub stars](https://img.shields.io/github/stars/free-jqgrid/jqGrid.svg)](https://github.com/free-jqgrid/jqGrid/stargazers)&nbsp;![devDependency status](https://david-dm.org/free-jqgrid/jqgrid/dev-status.svg)&nbsp;[![GitHub license](https://img.shields.io/badge/license-MIT%20or%20GNU%20GPLv2-blue.svg)](https://github.com/free-jqgrid/jqGrid/blob/master/LICENSE.md)
---
jqGrid is a popular jQuery Plugin for displaying and editing data in tabular form. It has some other more sophisticated features, like subgrids, TreeGrids, grouping and so on.

jqGrid was developed originally by [Tony Tomov](https://github.com/tonytomov) and it was available under MIT/GPL-licenses till the version 4.7.0 published Dec 8, 2014 (see [here](https://github.com/tonytomov/jqGrid/tree/v4.7.0)). Short time after that the license agreement was changed (see <a href="https://github.com/tonytomov/jqGrid/commit/1b2cb55c93ee8b279f15a3faf5a2f82a98da3b4c">here</a>) and new 4.7.1 version was <a href="https://github.com/tonytomov/jqGrid/tree/v4.7.1">published</a>.

The code from the GitHib repository is the fork of jqGrid 4.7.0 - the latest version available under MIT/GPL-licenses. It will be provided under MIT/GPL-licenses.

Below you can find short description of the bug fixes implemented in free jqGrid 4.15.5 (compared with version 4.15.4). The version is developed by [Oleg Kiriljuk](https://github.com/OlegKi), alias [Oleg](https://stackoverflow.com/users/315935/oleg) on the stackoverflow and [OlegK](http://www.trirand.com/blog/?page_id=393) on trirand forum.

Read [Wiki](https://github.com/free-jqgrid/jqGrid/wiki) for more detailed information about the features of free-jqGrid. The preliminary version of the documentation can be found [here](https://free-jqgrid.github.io/).

Free jqGrid can be used *for free*. We still ask to contribute the development by donating via PayPal, if one have the possibility for it. One can donate by clicking on the following button [![PayPayl donate button](https://www.paypalobjects.com/webstatic/en_US/btn/btn_donate_pp_142x27.png)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=JGTCBLQM2BYHG "Donate once-off to free jqGrid project using PayPal") or by sending money via PayPal to oleg.kiriljuk@ok-soft-gmbh.com with the comment "free jqGrid". Bank transfer based on the invoice from OK soft GmbH is another option of donating. Just send the email with the information about the amount of donation and you will get the corresponding invoice with the full information about our bank account and our VAT number.

One can install the package with respect of [npm](https://www.npmjs.com/package/free-jqgrid) by using "npm install free-jqgrid", with respect of [bower](https://bower.io/search/?q=free-jqgrid) by using "bower install free-jqgrid" or from [NuGet](https://www.nuget.org/packages/free-jqGrid) by using "Install-Package free-jqGrid".

The package is published on [WebJars](http://www.webjars.org/) too and it's deployed to [Maven Central](https://search.maven.org/#search%7Cga%7C1%7Cfree-jqgrid).

Free jqGrid is is available from [jsDelivr CDN](https://www.jsdelivr.com/projects/free-jqgrid) and [cdnjs](https://cdnjs.com/libraries/free-jqgrid). Thus one can use it directly from Internet by including for example the URLs like
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/free-jqgrid@4.15.5/css/ui.jqgrid.min.css">
<script src="https://cdn.jsdelivr.net/npm/free-jqgrid@4.15.5/js/jquery.jqgrid.min.js"></script>
```
or
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.15.5/css/ui.jqgrid.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.15.5/jquery.jqgrid.min.js"></script>
```
**The locale file is optional**. One can, but one don't need to include `grid.locale-en.min.js`, because the same information is already included in the `jquery.jqgrid.min.js` (or `jquery.jqgrid.src.js`).

If somebody want to test the *latest* version of free jqGrid, one can load it directly from GitHib using [RawGit](https://rawgit.com/) service:
```html
<link rel="stylesheet" href="https://rawgit.com/free-jqgrid/jqGrid/master/css/ui.jqgrid.css">
<script src="https://rawgit.com/free-jqgrid/jqGrid/master/js/jquery.jqgrid.src.js"></script>
```
All other language files and plugins are available from CDN too. See [the wiki article](https://github.com/free-jqgrid/jqGrid/wiki/Access-free-jqGrid-from-different-CDNs) for more details about the usage of free jqGrid from CDNs and RawGit.

Remark: the above URLs will be available **after publishing** the release of the version of 4.15.5.

### New main features implemented in the version 4.15.5 compared with 4.15.4:

* Add support of free Font Awesome 5.x. To use the feature one need to include Font Awesome 5.x either as CSS (by including `https://use.fontawesome.com/releases/v5.2.0/css/all.css` for example) or as SVG file (by including `https://use.fontawesome.com/releases/v5.2.0/js/all.js`). More examples of the usage will be published later [here](https://free-jqgrid.github.io/getting-started/index.html). Additionally, one has to use `iconSet: "fontAwesomeSolid"` or `iconSet: "fontAwesomeSVG"` instead of `iconSet: "fontAwesome"`, which means Font Awesome 4.x.
* Add 3 new option: `sortingDuringEditing`, `pagingDuringEditing`, `reloadingDuringEditing` with values `"prevent"`, `"cancel"` or `"save"`. The default behavior in previous versions of jqGrid: preventing sorting if the grid is in inline or in cell editing. Including new option `sortingDuringEditing: "cancel"` or `sortingDuringEditing: "save"` will allows sorting. The currently editing data will be discarded or saved depend on the value of `sortingDuringEditing` option. The same problem exists in case of paging or reloading the grid. The options `pagingDuringEditing`, `reloadingDuringEditing` helps to specify the desired behavior.

### Below one can see the full list of changes in the version 4.15.5 compared with 4.15.4:

* Bug fix in initializing checkbox with `stype: "checkbox"` in searching dialog
* Add new property `states.hoverTh` in `$.jgrid.icons.bootstrap4` to have hover effect on column headers
* Fix the names of 2 subGrid callbacks in `free-jqgrid.d.ts` file
* Bug fix in form editing of `edittype: "checkbox"`, `formatter: "checkbox"`
* Bug fix in resizing of dialogs in Bootrtrap 4
* Bug fix in header grouping in Bootstrap
* Add `labelswidth` option to Add/Edit form
* Small fixes in the code of `inlineNav` to make the code more safe
* Add 3 new option: `sortingDuringEditing`, `pagingDuringEditing`, `reloadingDuringEditing` with values `"prevent"`, `"cancel"` or `"save"`. The default behavior in previous versions of jqGrid: preventing sorting if the grid is in inline or in cell editing. Including new option `sortingDuringEditing: "cancel"` or `sortingDuringEditing: "save"` will allows sorting. The currently editing data will be discarded or saved depend on the value of `sortingDuringEditing` option. The same problem exists in case of paging or reloading the grid. The options `pagingDuringEditing`, `reloadingDuringEditing` helps to specify the desired behavior.
* Add support of Font Awesome 5 as SVG with JS. See [the commit](https://github.com/free-jqgrid/jqGrid/commit/3d701bcb8ecec7002abd13a6edee558a819c4e40) and [another one](https://github.com/free-jqgrid/jqGrid/commit/0ca99884529c2c3c8602909e3c51ad48cc82d9ae) for more details.
* Bug fix in `formatter:"actions"` to support frozen columns
* Add `title: false` property of `colModel` in `template: "actions"`
* Small fixes in parsing of dates to reduce NaNs in results
* Fixes in legacy subgrid to allow to use dot-separated names and callbacks in `subGridModel`
* Add formatted value as additional parameter of `cellattr` callback to simplify using of `cellattr` together with formatters
* Bug fix of button size in case of usage Bootstrap 4.x

Other old readmes contain the list of the features and bug fixed implemented in previous versions of free jqGrid:

* [README4.15.4.md](https://github.com/free-jqgrid/jqGrid/blob/master/README4.15.4.md) contains the readme of free jqGrid 4.15.4.
* [README4.15.3.md](https://github.com/free-jqgrid/jqGrid/blob/master/README4.15.3.md) contains the readme of free jqGrid 4.15.3.
* [README4.15.2.md](https://github.com/free-jqgrid/jqGrid/blob/master/README4.15.2.md) contains the readme of free jqGrid 4.15.2.
* [README4.15.1.md](https://github.com/free-jqgrid/jqGrid/blob/master/README4.15.1.md) contains the readme of free jqGrid 4.15.1.
* [README4.15.0.md](https://github.com/free-jqgrid/jqGrid/blob/master/README4.15.0.md) contains the readme of free jqGrid 4.15.0.
* [README4.14.1.md](https://github.com/free-jqgrid/jqGrid/blob/master/README4.14.1.md) contains the readme of free jqGrid 4.14.1.
* [README4.14.0.md](https://github.com/free-jqgrid/jqGrid/blob/master/README4.14.0.md) contains the readme of free jqGrid 4.14.0.
* [README4.13.6.md](https://github.com/free-jqgrid/jqGrid/blob/master/README4.13.6.md) contains the readme of free jqGrid 4.13.6.
* [README4.13.5.md](https://github.com/free-jqgrid/jqGrid/blob/master/README4.13.5.md) contains the readme of free jqGrid 4.13.5.
* [README4.13.4.md](https://github.com/free-jqgrid/jqGrid/blob/master/README4.13.4.md) contains the readme of free jqGrid 4.13.4.
* [README4.13.3.md](https://github.com/free-jqgrid/jqGrid/blob/master/README4.13.3.md) contains the readme of free jqGrid 4.13.3.
* [README4.13.2.md](https://github.com/free-jqgrid/jqGrid/blob/master/README4.13.2.md) contains the readme of free jqGrid 4.13.2.
* [README4.13.1.md](https://github.com/free-jqgrid/jqGrid/blob/master/README4.13.1.md) contains the readme of free jqGrid 4.13.1.
* [README4.13.0.md](https://github.com/free-jqgrid/jqGrid/blob/master/README4.13.0.md) contains the readme of free jqGrid 4.13.0.
* [README4.12.1.md](https://github.com/free-jqgrid/jqGrid/blob/master/README4.12.1.md) contains the readme of free jqGrid 4.12.1.
* [README4.12.0.md](https://github.com/free-jqgrid/jqGrid/blob/master/README4.12.0.md) contains the readme of free jqGrid 4.12.0.
* [README4.11.1.md](https://github.com/free-jqgrid/jqGrid/blob/master/README4.11.1.md) contains the readme of free jqGrid 4.11.1.
* [README4.11.0.md](https://github.com/free-jqgrid/jqGrid/blob/master/README4.11.0.md) contains the readme of free jqGrid 4.11.0.
* [README4.10.0.md](https://github.com/free-jqgrid/jqGrid/blob/master/README4.10.0.md) contains the readme of free jqGrid 4.10.0.
* [README492.md](https://github.com/free-jqgrid/jqGrid/blob/master/README492.md) contains the readme of free jqGrid 4.9.2.
* [README491.md](https://github.com/free-jqgrid/jqGrid/blob/master/README491.md) contains the readme of free jqGrid 4.9.1.
* [README49.md](https://github.com/free-jqgrid/jqGrid/blob/master/README49.md) contains the readme of free jqGrid 4.9.0.
* [README48.md](https://github.com/free-jqgrid/jqGrid/blob/master/README48.md) contains the readme of free jqGrid 4.8.0.

**Many thanks to all, who sent bug reports and suggestions to improve free jqGrid!**
