/*
 Require and initialise PhantomCSS module
 Paths are relative to CasperJs directory

 This JS file reads testConfig.json, and runs the tests mentioned in that file.
 */

var fs = require('fs');
var path = fs.absolute(fs.workingDirectory + '/phantomcss.js');
var phantomcss = require(path);
require(fs.absolute(fs.workingDirectory + '/libs/jquery'));
var configs = require(fs.absolute(fs.workingDirectory + '/testConfig.json'));
var baseImageFolder = configs['global']['screenShotDirectoryPath'] + '/base_images';
var resultImageFolder = configs['global']['screenShotDirectoryPath'] + '/diff_images';
var failedImageFolder = configs['global']['screenShotDirectoryPath'] + '/failures';

casper.test.begin('Visual Regression Testing using PhantomCSS', function (test) {
  var screenShotFolder = configs['global']['screenShotDirectoryPath'];
  phantomcss.init({
    rebase: casper.cli.get("rebase"),
    casper: casper,
    libraryRoot: fs.absolute(fs.workingDirectory + ''),
    screenshotRoot: fs.absolute(fs.workingDirectory + baseImageFolder),
    comparisonResultRoot: fs.absolute(fs.workingDirectory + resultImageFolder),
    failedComparisonsRoot: fs.absolute(fs.workingDirectory + failedImageFolder),
    addLabelToFailedImage: false,
    mismatchTolerance: 0,
    errorType: 'flat'
  });

  casper.on('remote.message', function (msg) {
    this.echo(msg);
  });

  casper.on('error', function (err) {
    this.die("PhantomJS has errored: " + err);
  });

  casper.on('resource.error', function (err) {
    casper.log('Resource load error: ' + err, 'warning');
  });

  var viewportWidth = configs['global']['viewports'][0]['width'];
  var viewportHeight = configs['global']['viewports'][0]['height'];

  casper.start(configs['global']['baseUrl'], function () {
    this.echo('BASE URL for testing: ' + this.getCurrentUrl(), 'info');
    this.echo('---------------------------------------------------------------');
  });

  casper.viewport(viewportWidth, viewportHeight);

  casper.eachThen(configs['tests'], function (testData) {

    var testObj = testData.data;

    var baseURL = configs['global']['subdomain'] + testObj['domain'] + ":" + configs['global']['port'];
    var url = baseURL + testObj['relativeUrl'];
    var waitTime = testObj['waitTime'] || configs['global']['waitTime'];
    var cssSelector = testObj['cssSelector'];
    var actionBased = testObj['actionBased'];
    var actionSelector = testObj['actionSelector'];
    var moduleName = testObj['moduleName'];

    casper.echo("Url: " + url + "  (ModuleName=" + moduleName + ")");

    casper.thenOpen(url, function () {
      casper.viewport(viewportWidth, casper.getElementsBounds('body')[0]['height'],
        casper.wait(waitTime, function () {
          var documentHeight = casper.getElementsBounds('body')[0]['height'];

          if (actionBased && actionSelector.length > 0) {
            casper.click(actionSelector);
          }

          if (cssSelector) {
            phantomcss.screenshot(cssSelector, moduleName)
          } else {
            phantomcss.screenshot({
              top: 0,
              left: 0,
              width: viewportWidth,
              height: documentHeight
            }, moduleName);
          }
        })
      );
    });
  });

  casper.then(function now_check_the_screenshots() {
    // compare screenshots
    phantomcss.compareAll();
  });

  //casper.then (function clean_diff_img_folder(){
  //	var diff_files = phantomcss.getCreatedDiffFiles();
  //	casper.eachThen(diff_files,function(response){
  //		this.echo(response.name);
  //	});
  //	//fs.move(diff_files,blah);
  //	//fs.remove(resultImageFolder)
  //
  //});

  function generateRandomString() {
    return ( Math.random() + 1 ).toString(36).substring(7);
  }

  /*
   Casper runs tests
   */
  casper.run(function () {
    console.log('\nExit Status: ' + phantomcss.getExitStatus())
    console.log('\nTHE END.');
    casper.test.done();
  });
});
