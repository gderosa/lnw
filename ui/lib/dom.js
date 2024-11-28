const   $node   = (selector, element=document)  => element.querySelector(selector);
const   $new    = (tag)                         => document.createElement(tag);

const   $       = $node;                        // alias


export {
        $node,
        $new,

        $
};
