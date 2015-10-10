/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function TextViewObserver(parent) {
    this.textViews = [];
    this.parent = parent;
}

TextViewObserver.prototype = {
    constructor : TextViewObserver,
    
    addTextView : function(id, name, data, position, color) {
        var textView = new Text2D(data, this.parent);
        var tagid = name + id;
        this.textViews[tagid] = textView;
        textView.setPosition(position.x, position.y);
        textView.setColor(color);
        this.parent.appendChild(textView.div);
    },
    
    updateTextView : function(id, name, data, position){
        var tagid = name + id;
        var textView = this.textViews[tagid];
        if(textView) {
            textView.setText(data);
            textView.setPosition(position.x, position.y);
        }
    },
    
    setVisible: function(id, name, bVisible) {
        var tagid = name + id;
        var textView = this.textViews[tagid];
        if(textView) {
            textView.setVisible(bVisible);
        }
    },
    
    setText: function(id, name, text) {
        var tagid = name + id;
        var textView = this.textViews[tagid];
        if(textView) {
            textView.setText(text);
        }
    }
};
