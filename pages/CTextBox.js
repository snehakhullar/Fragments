function CTextBox(x, y, w, h){
	this.div = document.createElement("div");
	this.div.id="TextBox";

    this.div.style.width=w+"px";
    this.div.style.height=h+"px";

    this.div.style.position='absolute';
    this.div.style.left=x+"px";
    this.div.style.top=y+"px";

	this.div.style.background = "rgba(179, 179, 179, 0.2)";//"#ffffff";
	 //this.div.style.border = "1px solid #000"; 
	//this.div.style.color="#000000";

	this.div.style.fontSize="10px";
   	this.div.style.textAlign="left";
   	//this.div.style.fontFamily="Verdana";

	this.text="-";

    $("#candiv").append(this.div);
}

CTextBox.prototype.SetText=function(s) {
	this.text=s;
	$(this.div).html(this.text);
}

CTextBox.prototype.AddText=function(s) {
	this.text+="<br />"+s;
	$(this.div).html(this.text);
}