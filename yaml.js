let myRe = /([ ]+)?((\w+|[^\w\s\r\n])([ ]*))?(?:\r)?(\n)?/gm;
let str = `title: Triangle Inequality
author: sg
`;
let myArray;
if ((myArray = myRe.exec(str)) !== null) {
  let msg = 'Found ' + myArray.join(',') + '. ';
  msg += 'Next match starts at ' + myRe.lastIndex;
  console.log(msg);
}
