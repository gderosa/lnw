const   $byId   = (id)                          => document.getElementById(id);
const   $qs     = (selector, element=document)  => element.querySelector(selector);
const   $qsAll  = (selector, element=document)  => element.querySelectorAll(selector);

const   $ID     = $byId;
const   $sel    = $qs;

const   $node   = (idOrSelector, element)       => $qs(idOrSelector, element) || $byId(idOrSelector);
const   $       = $node;

const   $nodes  = $qsAll;
const   $$      = $nodes;

const   $new    = (tag)                         => document.createElement(tag);


export { $byId, $qs, $qsAll, $ID, $sel, $node, $nodes, $, $$, $new };
