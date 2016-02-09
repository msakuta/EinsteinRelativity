Relativity = new (function(){
'use strict';
var canvas;
var width;
var height;


/// Vector 2D addition
function vecadd(v1,v2){
	return [v1[0] + v2[0], v1[1] + v2[1]];
}

/// Vector 2D scale
function vecscale(v1,s2){
	return [v1[0] * s2, v1[1] * s2];
}

/// Vector 2D distance
function vecdist(v1,v2){
	var dx = v1[0] - v2[0], dy = v1[1] - v2[1];
	return Math.sqrt(dx * dx + dy * dy);
}

/// @brief Product of a augmented 2-D matrix and a 2-D vector
///
/// @param ma The matrix
/// @param vb The vector
///
/// The function name stands for MATrix Vector Product
function matvp(ma,vb){
	return [ma[0] * vb[0] + ma[1] * vb[1] + ma[2], ma[3] * vb[0] + ma[4] * vb[1] + ma[5]];
}

/// @brief Product of a augmented 2-D matrix and a 2-D vector, ignoring offset term
///
/// The function name stands for MATrix Delta Vector Product
function matdvp(ma,vb){
	return [ma[0] * vb[0] + ma[1] * vb[1], ma[3] * vb[0] + ma[4] * vb[1]];
}

/// \brief Calculates product of matrices
///
/// Note that this function assumes arguments augmented matrices, see http://en.wikipedia.org/wiki/Augmented_matrix
/// The least significant suffix is rows.
/// To put it simply, array of coefficients as the same order as parameters to canvas.setTransform().
function matmp(a,b){
	var ret = new Array(6);
	for(var i = 0; i < 3; i++){
		for(var j = 0; j < 2; j++){
			var val = 0;
			for(var k = 0; k < 2; k++)
				val += a[k * 2 + j] * b[i * 2 + k];
			if(i === 2)
				val += a[2 * 2 + j];
			ret[i * 2 + j] = val;
		}
	}
	return ret;
}

window.addEventListener('load', function() {
	canvas = document.getElementById("scratch");
	if ( ! canvas || ! canvas.getContext ) {
		return false;
	}
	width = parseInt(canvas.style.width);
	height = parseInt(canvas.style.height);

	draw();
});

var lightSpeed = 0.3;
var relativity = false;
var rotation = false;

this.submitC = function(){

	var check = document.getElementById("RotationCheck");
	if(check === undefined)
		return;
	rotation = check.checked;

	check = document.getElementById("RelativeCheck");
	if(check === undefined)
		return;
	relativity = check.checked;

	var edit = document.getElementById("CEdit");
	if(edit === undefined)
		return;
	var val = parseFloat(edit.value);
	if(isNaN(val))
		return;
	lightSpeed = val;

	draw();
};

function draw() {
	var ctx = canvas.getContext('2d');

	function drawLine(pos1, pos2){
		ctx.beginPath();
		ctx.moveTo(offset + pos1[0], height - offset - pos1[1]);
		ctx.lineTo(offset + pos2[0], height - offset - pos2[1]);
		ctx.stroke();
	}

	function drawGrid(xhat, yhat){
		for(var y = 1; y < 10; y++){
			var vec = vecscale(yhat, y / 10);
			drawLine(vec, vecadd(vec, xhat));
		}
		for(var x = 1; x < 10; x++){
			var vec = vecscale(xhat, x / 10);
			drawLine(vec, vecadd(vec, yhat));
		}
	}

	var offset = 100;
	var arrowSize = 10;

	var xhat0 = [width - 2 * offset, 0];
	var yhat0 = [0, height - 2 * offset];

	ctx.clearRect(0,0,width,height);

	ctx.strokeStyle = '#000000';
	ctx.lineWidth = 2;

	ctx.beginPath();
	ctx.moveTo(offset, height);
	ctx.lineTo(offset, offset);
	ctx.lineTo(offset - arrowSize, offset + arrowSize);
	ctx.moveTo(offset, offset);
	ctx.lineTo(offset + arrowSize, offset + arrowSize);

	ctx.moveTo(0, height - offset);
	ctx.lineTo(width - offset, height - offset);
	ctx.lineTo(width - (offset + arrowSize), height - (offset - arrowSize));
	ctx.moveTo(width - offset, height - offset);
	ctx.lineTo(width - (offset + arrowSize), height - (offset + arrowSize));
	ctx.stroke();

	ctx.font = "20px Arial";
	ctx.fillStyle = "black";
	ctx.fillText("t", offset, offset - 10);
	ctx.fillText("x", width - offset + 10, height - offset + 10);

	ctx.strokeStyle = '#bfbfbf';
	ctx.lineWidth = 1;
	drawGrid(xhat0, yhat0);

	var mat;
	if(rotation){
		var angle = 0.1 * Math.PI;
		mat = [Math.cos(angle), Math.sin(angle), 0, -Math.sin(angle), Math.cos(angle), 0];
	}
	else if(relativity){
		var beta = 1 / Math.sqrt(1 - lightSpeed * lightSpeed);
		mat = [beta, lightSpeed, 0, beta * lightSpeed, beta, 0];
	}
	else
		mat = [1, lightSpeed, 0, 0, 1, 0];

	var yhat = matvp(mat, yhat0);
	var xhat = matvp(mat, xhat0);

	ctx.font = "20px Arial";
	ctx.fillStyle = "blue";
	ctx.fillText("t'", yhat[0] + offset, height - offset - yhat[1] - 10);
	ctx.fillText("x'", xhat[0] + offset + 10, height - offset - xhat[1] - 10);

	ctx.strokeStyle = '#0000ff';
	ctx.lineWidth = 2;

	drawLine([0,0], yhat);
	drawLine(yhat, vecadd(yhat, matdvp(mat, [-arrowSize, -arrowSize])));
	drawLine(yhat, vecadd(yhat, matdvp(mat, [arrowSize, -arrowSize])));

	drawLine([0,0], xhat);
	drawLine(xhat, vecadd(xhat, matdvp(mat, [-arrowSize, -arrowSize])));
	drawLine(xhat, vecadd(xhat, matdvp(mat, [-arrowSize, arrowSize])));

	ctx.strokeStyle = '#bfbfff';
	ctx.lineWidth = 1;
	drawGrid(xhat, yhat);
}
})();
