document.body.onkeydown = function( e ) {
    var keys = {
        37: 'left',
        39: 'right',
        40: 'down',
        38: 'rotate',
        32: 'drop',
        65: 'left',    // Tecla A
        68: 'right',   // Tecla D
        83: 'down',    // Tecla S
        87: 'rotate'   // Tecla W
    };
    if ( typeof keys[ e.keyCode ] != 'undefined' ) {
        keyPress( keys[ e.keyCode ] );
        render();
    }
};
