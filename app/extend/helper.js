'use strict';


exports.tabName = function(tab) {
  const pair = this.app.config.tabs.find(pair => {
    return pair[0] === tab;
  });
  if (pair) {
    return pair[1];
  }
};
