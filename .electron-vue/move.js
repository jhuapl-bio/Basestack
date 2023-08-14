const path = require('path');
const fs = require('fs-extra');

const sourceDir = path.join(__dirname, '..', 'dist', 'electron');
const targetDir = path.join(__dirname, '..', 'build');

fs.move(sourceDir, targetDir, { overwrite: true }, err => {
  if (err) {
    console.error(err);
  } else {
    fs.remove(sourceDir, err => {
      if (err) {
        console.error(err);
      }
    });
  }
});