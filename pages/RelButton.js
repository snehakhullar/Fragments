var relbuttonclicked=false;
var RelationType=null;

function RelButton (x, y, type, title) {
	this.x=x;
	this.y=y;

	this.input = document.createElement("input");

    this.input.type = "button";
    this.input.id = type;

    this.input.title = title;


    this.input.style.position='absolute';
    this.input.style.left=x+"px";
    this.input.style.top=y+"px";

    this.input.style.color="#ffffff";
        

    $("#candiv").append(this.input);
    $(this.input).button();
    $(this.input).tooltip({ tooltipClass: "custom-tooltip-styling" , position: { my: "left+8 center", at: "right center" }});
    $(this.input).click(function() {
        relbuttonclicked=true;
        RelationType=type;
        //clickedbuttontype=this.input;
        $(".custom-tooltip-styling").hide();
        $(this).button('disable').addClass('ui-state-active').removeClass('ui-state-disabled');
    });
}