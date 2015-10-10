/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function Text2D(text) {
    this.div = document.createElement('div');
    this.div.innerHTML = text;
    this.div.style.position = 'absolute';
    this.div.style.overflow = 'hidden';
    this.div.style.width = 100;
    this.div.style.height = 100;
    this.setColor("black");
}

Text2D.prototype = {
    constructor: Text2D,
    
    setText: function(text) {
        this.div.innerHTML = text;
    },
    
    setPosition: function(x, y) {
        this.div.style.left = x + 'px';
        this.div.style.top = y + 'px';
    },
    
    setColor: function(color) {
        this.div.style.color = color;
    },
    
    setVisible: function(bVisible) {
        this.div.style.visibility = bVisible ? 'visible' : 'hidden';
    }
};