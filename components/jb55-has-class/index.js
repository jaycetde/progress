/* credits to jQuery for this one */

var rclass = /[\t\r\n]/g;

function space(s) {
  return " " + s + " ";
}

module.exports = function hasClass(el, selector){
  var className = space(selector);

  if (el.nodeType === 1 && space(el.className).replace(rclass, " ").indexOf(className) >= 0)
    return true;

  return false;
};
