const   $byId   = (id)                          => document.getElementById(id);
const   $qs     = (selector, element=document)  => element.querySelector(selector);

const   $ID     = $byId;
const   $sel    = $qs;

const   $node   = (idOrSelector, element)       => $qs(idOrSelector, element) || $byId(idOrSelector);
const   $       = $node;

const   $new    = (tag)                         => document.createElement(tag);


export { $byId, $qs, $ID, $sel, $node, $, $new };
