$(document).ready(function () {
    var xTile = '<span class="fa fa-close"></span>';
    var oTile = '<span class="fa fa-circle-o"></span>';

    var tttArr = [];
    var adjArr = [{ h: 0, v: 0, d: [0] }, { h: 0, v: 1 }, { h: 0, v: 2, d: [1] },
        { h: 1, v: 0 }, { h: 1, v: 1, d: [0, 1] }, { h: 1, v: 2 },
        { h: 2, v: 0, d: [1] }, { h: 2, v: 1 }, { h: 2, v: 2, d: [0] }];

    var userTile, aiTile;

    $('#choose-tile-modal').modal({ show: true });
    $("#modal-x-btn").click(function (ev) {
        userTile = xTile;
        aiTile = oTile;
        $('#choose-tile-modal').modal('hide');
    });
    $("#modal-o-btn").click(function (ev) {
        userTile = oTile;
        aiTile = xTile;
        $('#choose-tile-modal').modal('hide');
    });

    $(".square-sm").click(function (ev) {
        if ($(this).has("span").length == 0) {
            $(this).append(userTile);
            var id = parseInt($(this).attr('id').split("-")[1]);
            tttArr[id] = 1;
            if (!isWinner("user", id)) {
                if (!isFilled()) {
                    setTimeout(function () {
                        id = getAiMove(id);
                        if (id != -1) {
                            $("#sq-" + id).append(aiTile);
                            tttArr[id] = 0;
                        }
                        setTimeout(function () {
                            if (isWinner("ai", id)) {
                                alert("you loose!!!");
                                resetGame();
                            }
                        }, 200);
                    }, 500);
                } else {
                    setTimeout(function () {
                        alert("draw");
                        resetGame();
                    }, 200);
                }
            } else {
                setTimeout(function () {
                    alert("you win!!!");
                    resetGame();
                }, 200);
            }
        }

    });

    function isWinner(player, id) {
        var winner;
        var check;
        if (player == "user") {
            check = 3
        } else {
            check = 0;
        }

        winner = (getRowSum(id) == check) ||
            (getColSum(id) == check);

        var diagSum = getDiagSum(id);
        if (diagSum) {
            $.each(diagSum, function (i, val) {
                winner = winner || (val == check);
            });
        }

        return winner;
    }

    function isFilled() {
        return (tttArr.filter(function (val) { return val >= 0; }).length == 9);
    }

    function resetGame() {
        $(".square-sm").empty();
        tttArr = [];
    }

    function getRowSum(id, rmUndef) {
        var retVal = 0;
        var i = adjArr[id].h;
        var min = i * 3;
        var max = min + 3;
        for (var k = min; k < max; k++) {
            if (rmUndef) {
                retVal += tttArr[k] || 0;
            } else {
                retVal += tttArr[k];
            }
        }
        return retVal;
    }

    function getColSum(id, rmUndef) {
        var retVal = 0;
        var i = adjArr[id].v;
        var min = i;
        var max = 3 * 2 + i;
        for (var k = min; k <= max; k += 3) {
            if (rmUndef) {
                retVal += tttArr[k] || 0;
            } else {
                retVal += tttArr[k];
            }
        }
        return retVal;
    }

    function getDiagSum(id, rmUndef) {
        var retArr = [];
        var arr = adjArr[id].d;
        if (!arr) return retArr;
        $.each(arr, function (i, item) {
            var min;
            var max;
            var inc;
            var retVal = 0;
            if (item == 0) {
                min = 0;
                max = 8;
                inc = 4;
            } else {
                min = 2;
                max = 6;
                inc = 2;
            }
            for (var k = min; k <= max; k += inc) {
                if (rmUndef) {
                    retVal += tttArr[k] || 0;
                } else {
                    retVal += tttArr[k];
                }
            }
            retArr.push(retVal);
        });

        return retArr;
    }

    function getFreeRow(id) {
        var retVal = 0;
        var i = adjArr[id].h;
        var min = i * 3;
        var max = min + 3;

        var freeArr = [];
        for (var k = min; k < max; k++) {
            if (k != id && typeof (tttArr[k]) == "undefined")
                freeArr.push(k);
        }
        if (freeArr.length > 0) {
            return freeArr[Math.floor(Math.random() * freeArr.length)];
        }
        return getFreeRandom();
    }

    function getFreeCol(id) {
        var retVal = 0;
        var i = adjArr[id].v;
        var min = i;
        var max = 3 * 2 + i;

        var freeArr = [];
        for (var k = min; k < max; k += 3) {
            if (k != id && typeof (tttArr[k]) == "undefined")
                freeArr.push(k);
        }
        if (freeArr.length > 0) {
            return freeArr[Math.floor(Math.random() * freeArr.length)];
        }
        return getFreeRandom();
    }

    function getFreeDiag(id) {
        var diag = getDiagSum(id, true);
        var min, max, inc;
        var retId = -1;

        $.each(diag, function (i, val) {
            if (val == 0) {
                min = 0;
                max = 8;
                inc = 4;
            } else {
                min = 2;
                max = 6;
                inc = 2;
            }

            for (var k = min; k < max; k += inc) {
                if (k != id && typeof (tttArr[k]) == "undefined")
                    retId = k;
            }
        });
        if (retId != -1) {
            return retId;
        } else {
            return getFreeRandom();
        }
    }

    function getFreeRandom() {
        var id = Math.floor(Math.random() * 9);
        while (typeof (tttArr[id]) != "undefined") {
            id = Math.floor(Math.random() * 9);
        }
        return id;
    }

    function getAiMove(id) {
        if (!isFilled()) {
            if (Math.floor(Math.random() * 5) > 1) {
                return blockPlayer(id);
            } else {
                return getFreeRandom();
            }

        }
        return -1;
    }

    function blockPlayer(id) {
        var sumArr = [];
        var dSum;
        sumArr[0] = getRowSum(id, true);
        sumArr[1] = getColSum(id, true);
        dSum = getDiagSum(id, true);
        if (dSum) {
            sumArr[2] = 0;
            $.each(dSum, function (i, val) {
                if (typeof (val) == "number") sumArr[2] += val;
            });
        }

        var blkType = sumArr.indexOf(Math.max.apply(null, sumArr));

        switch (blkType) {
            case 0:
                return getFreeRow(id);
            case 1:
                return getFreeCol(id);
            case 2:
                return getFreeDiag(id);
            default:
                return getFreeRandom();
        }
    }
});