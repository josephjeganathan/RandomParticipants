var RandomParticipants = function () {
    var orderedParticipantsKey = "OrderedParticipants";
    var nextParticipantKey = "NextParticipant";
    var myId = null;
    var overlay = null;


    var dh = {
        Initialise: function () {
            $("#next").hide();
            
            myId = gapi.hangout.getLocalParticipantId();

            this.GenerateOverlay();

            var orderedParticipants = [];

            var participants = gapi.hangout.getParticipants();
            for (var i = 0; i < participants.length; i++) {
                orderedParticipants.push(participants[i].id);
            }
            orderedParticipants = orderedParticipants.sort(function () { return Math.random() });

            gapi.hangout.data.setValue(orderedParticipantsKey, JSON.stringify(orderedParticipants));

            this.SetNextParticipant(orderedParticipants[0]);
        },
        Next: function(){
            var participants = JSON.parse(gapi.hangout.data.getValue(orderedParticipantsKey));
            for (var i = 0; i < participants.length; i++) {
                if (participants[i] == myId && participants.length != i + 1) {
                    gapi.hangout.data.setValue(nextParticipantKey, participants[i + 1]);
                }
            }
            $("#next").hide();
        },
        SetNextParticipant: function (id) {
            return gapi.hangout.data.setValue(nextParticipantKey, id);
        },
        ParticipantChanged: function (eventObj) {
            var nextParticipantId = gapi.hangout.data.getValue(nextParticipantKey);
            if (nextParticipantId) {
                if (nextParticipantId == myId) {
                    $("#next").show();
                    overlay.setVisible(true);
                } else {
                    $("#next").hide();
                    overlay.setVisible(false);
                }
                var nextParticipant = gapi.hangout.getParticipantById(nextParticipantId);
                $("#participant-img").attr("src", nextParticipant.person.image.url);
            }
        },
        GenerateOverlay: function () {
            var url = "https://raw.github.com/josephjeganathan/RandomParticipants/master/images/" + Math.floor(Math.random() * 18) + ".png";

            var topHat = gapi.hangout.av.effects.createImageResource(url);
            overlay = topHat.createFaceTrackingOverlay({
                'trackingFeature': gapi.hangout.av.effects.FaceTrackingFeature.NOSE_ROOT,
                'offset': {x: 0,y: -0.8},
                'scaleWithFace': true,
                'rotateWithFace': true
            });
        }
    };

    return dh;
}();

$(document).ready(function () {
    gapi.hangout.data.onStateChanged.add(RandomParticipants.ParticipantChanged);
    
    gapi.hangout.onApiReady.add(function() {
        RandomParticipants.Initialise();
    });
});