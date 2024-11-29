const   $byId   = (id)                          => document.getElementById(id);
const   $ID     = $byId;

const   $byQs   = (selector, element=document)  => element.querySelector(selector);
const   $qs     = $byQs;
const   $sel    = $byQs;

const   $node   = (idOrSelector)                => $byId(idOrSelector) || $byQs(idOrSelector);
const   $       = $node;

const   $new    = (tag)                         => document.createElement(tag);


export { $byId, $ID, $byQs, $qs, $sel, $node, $, $new };
