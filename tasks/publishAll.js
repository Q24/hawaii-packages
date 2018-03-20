var glob = require("glob");
var exec = require('child_process').exec;

// Set the glob and options
var pattern = "packages/**/package.json",
    options = {
      dot:    true,
      ignore: '**/node_modules/**/package.json'
    };

glob(pattern, options, function (er, files) {

  // Loop through the files
  files.forEach(function (file) {
    // Get the dir for the package
    var packageDir = file.split('/package.json')[0];

    // Execute the build command
    exec('cd ' + packageDir + ' && npm publish')
        .stdout
        .pipe(process.stdout);
  });
});

