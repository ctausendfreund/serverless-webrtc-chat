
function addMSG(msg, who) {
  const wrap = $("<div>").addClass("wrap").appendTo($("#chat-screen"));
  const div = $("<div>").addClass(who).appendTo(wrap);
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

function replaceCandidateHostnamesWithLocalhost(sdpObject) {
  const modifiedSdp = sdpObject.sdp.split('\n').map(line => {
    if (line.startsWith('a=candidate')) {
      const parts = line.split(' ');
      if (parts.length > 4) {
        parts[4] = '127.0.0.1';
      }
      return parts.join(' ');
    }
    return line;
  }).join('\n');

  return new RTCSessionDescription({type: sdpObject.type, sdp: modifiedSdp});
}

function replaceCandidateAddressesCrossMultiplied(sdp, newAddresses) {
  const originalSdpLine = sdp.split('\n');
  const newSdpLine = [];

  for (const line of originalSdpLine) {
    if (line.startsWith('a=candidate')) {
      const parts = line.split(' ');
      if (parts.length <= 4) {
        continue;
      }
      // for each new address we create a new candidate line and replace the existing address
      for (const addr of newAddresses) {
        parts[4] = addr;
        newSdpLine.push(parts.join(' '));
      }
    } else {
      newSdpLine.push(line);
    }
  }

  return newSdpLine.join('\n');
}

async function findLocalAddresses() {
  const rtc = new RTCPeerConnection();
  const dc = rtc.createDataChannel('');
  await rtc.setLocalDescription();

  await new Promise(resolve => {
    // TODO: add timeout with reject
    rtc.onicecandidate = (e) => {
      if (e.candidate === null) {
        // all candidates have been gathered
        resolve();
      }
    };
  });

  const localAddresses = extractDistinctCandidateAddresses(rtc.localDescription.sdp);
  // dc.close();
  // rtc.close();
  return localAddresses;

  function extractDistinctCandidateAddresses(sdp) {
    const hosts = new Set();
    sdp.split('\r\n').forEach(function (line) { // http://tools.ietf.org/html/rfc4566#page-39 - CRLF
      if (line.includes("a=candidate")) {     // http://tools.ietf.org/html/rfc4566#section-5.13
        const parts = line.split(' ');        // http://tools.ietf.org/html/rfc5245#section-15.1 - "SP" in the rfc document means one space character
        const addr = parts[4];
        const type = parts[7];
        if (type === 'host') {
          hosts.add(addr)
        }
      }
    });
    return hosts;
  }
}
