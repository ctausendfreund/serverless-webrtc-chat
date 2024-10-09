function replaceCandidateHostnamesWithLocalhost(sdpObject) {
    sdpObject.sdp = sdpObject.sdp.split('\n').map(line => {
        if (line.startsWith('a=candidate')) {
            const parts = line.split(' ');
            if (parts.length > 4) {
                parts[4] = '127.0.0.1';
            }
            return parts.join(' ');
        }
        return line;
    }).join('\n');

    return sdpObject;
}

function addMSG(msg, who) {
    const wrap = $("<div>").addClass("wrap").appendTo($("#chat-screen"));
    const div  = $("<div>").addClass(who).appendTo(wrap);
    $("<span>").html(who).addClass("who").appendTo(div);
    $("<span>").html(msg).addClass("msg").appendTo(div);
    $("#chat-screen-wp").scrollTop($("#chat-screen").height());
}

function sendMSG(dc) {
    const value = $("#msg").val();
    if (value) {
        dc.send(value);
        addMSG(value, "me");
        $("#msg").val('');
    }
}
