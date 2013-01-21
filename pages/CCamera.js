/*
* Copyright (c) 2012 Panagiotis Michalatos [www.sawapan.eu]
*
* This software is provided 'as-is', without any express or implied
* warranty. In no event will the authors be held liable for any damages
* arising from the use of this software.
*
* Permission is granted to anyone to use this software for any purpose,
* including commercial applications, and to alter it and redistribute it
* freely, subject to the following restrictions:
*
*    1. The origin of this software must not be misrepresented; you must not
*    claim that you wrote the original software. If you use this software
*    in a product, an acknowledgment in the product documentation would be
*    appreciated but is not required.
*
*    2. Altered source versions must be plainly marked as such, and must not
*    be misrepresented as being the original software.
*
*    3. This notice may not be removed or altered from any source
*    distribution.
*/


function CCamera() {
    this.VPoint = vec3.create();
    this.TPoint = vec3.createXYZ(0.0, 0.0, 3.0);
    this.Up = vec3.createXYZ(0.0, 0.0, 1.0);
    this.TPointtarget = vec3.createXYZ(0.0, 0.0, 3.0);

    this.CaptureMouse = false;

    this.AngleXY = 0.0;
    this.AngleZ = 0.0;
    this.Distance = 30.0;

    this.AngleXYtarget = 0.0;
    this.AngleZtarget = 0.0;
    this.Distancetarget = 30.0;
}



CCamera.prototype.Update = function () {

    if (this.Distancetarget < 1.0)
        this.Distancetarget = 1.0;
    else if (this.Distancetarget > 80.0)
        this.Distancetarget = 80.0;

    var it = 0.95;
    var itt = 1.0 - it;

    
    this.TPoint[0] = this.TPoint[0] * it + this.TPointtarget[0] * itt;
    this.TPoint[1] = this.TPoint[1] * it + this.TPointtarget[1] * itt;
    this.TPoint[2] = this.TPoint[2] * it + this.TPointtarget[2] * itt;


    this.AngleXY = this.AngleXY * it + this.AngleXYtarget * itt;
    this.AngleZ = this.AngleZ * it + this.AngleZtarget * itt;
    this.Distance = this.Distance * it + this.Distancetarget * itt;

    this.VPoint[0] = this.TPoint[0] + this.Distance * Math.cos(this.AngleXY) * Math.cos(this.AngleZ);
    this.VPoint[1] = this.TPoint[1] + this.Distance * Math.sin(this.AngleXY) * Math.cos(this.AngleZ);
    this.VPoint[2] = this.TPoint[2] + this.Distance * Math.sin(this.AngleZ);

}


CCamera.prototype.OnMouseDown = function () {
    this.CaptureMouse = true;
    return true;
}

CCamera.prototype.OnMouseUp = function () {
    if (this.CaptureMouse) {
        this.CaptureMouse = false;
        return true;
    }

    return false;
}

CCamera.prototype.OnMouseMove = function () {
    if (!this.CaptureMouse) return false;

    this.AngleXYtarget-= mouse.Dx * 0.01;
    this.AngleZtarget+= mouse.Dy * 0.01;

    return true;
}

CCamera.prototype.SetTargetPointXYZ = function (_x, _y, _z) {
    this.TPointtarget[0] = _x;
    this.TPointtarget[1] = _y;
    this.TPointtarget[2] = _z;
}

CCamera.prototype.SetDistance = function (_d) {
    this.Distancetarget = _d;
    this.Distance = _d;
}

CCamera.prototype.SetTargetPoint = function (_p) {
    this.SetTargetPointXYZ(_p[0], _p[1], _p[2]);
}
