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
    
    addTextView : function(name, data, position, color) {
        var textView = new Text2D(data, this.parent);
        this.textViews[name] = textView;
        textView.setPosition(position.x, position.y);
        textView.setColor(color);
        document.body.appendChild(textView.div);
    },
    
    updateTextView : function(name, data, position){
        var textView = this.textViews[name];
        if(textView) {
            textView.setText(data);
            textView.setPosition(position.x, position.y);
        }
    }
};
