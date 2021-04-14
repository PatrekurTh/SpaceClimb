// ===================== COLLISION CHECK ÚTREIKNINGUR =====================

function colCheck(shapeA, shapeB) {
    // nær í vektora til að bera saman
    var vX = (shapeA.x + (shapeA.width / 2)) - (shapeB.x + (shapeB.width / 2)),
        vY = (shapeA.y + (shapeA.height / 2)) - (shapeB.y + (shapeB.height / 2)),
        // bætir við hálfri vídd og breidd hlutsins
        hWidths = (shapeA.width / 2) + (shapeB.width / 2),
        hHeights = (shapeA.height / 2) + (shapeB.height / 2),
        colDir = null;


    // ef vektor x og y eru minna en helmingur af vídd eða breidd hljóta þeir að vera inní hlutnum, sem triggerar collision
    if (Math.abs(vX) < hWidths && Math.abs(vY) < hHeights) {
        // finnur út hvaða hlið collision á sér stað og skilar
        var oX = hWidths - Math.abs(vX),
            oY = hHeights - Math.abs(vY);

        if (oX >= oY) {
            if (vY > 0) {
                colDir = "t";
                if (boxes.indexOf(shapeB) > 0) {
                    shapeA.y += oY;
                }
            } else {
                if (shapeA.velY > 0) {
                    colDir = "b";
                    shapeA.y -= oY;
                }
            }
        } else {
            // bara athugað collision hægri/vinstri við veggi ekki platforms
            if (vX > 0) {
                //indexOf skilar -1 ef hlutur finnst ekki í array
                // af eitthverjum ástæðum vildi þetta ekki virka fyrir index 0
                if (boxes.indexOf(shapeB) !== -1) {
                    colDir = "l";
                    shapeA.x += oX;
                }
            } else {
                if (boxes.indexOf(shapeB) > 0) {
                    colDir = "r";
                    shapeA.x -= oX;
                }
            }
        }
    }
    return colDir;
}