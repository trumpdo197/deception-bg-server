const { mongoose } = require('../index');

const RoomSchema = new mongoose.Schema({
    hostId: {
        type: String,
        required: true,
    },
    password: {
        type: String,
    },
    players: {
        type: Array,
    },
    gameSessionId: {
        type: String,
    }
});

const Room = new mongoose.model('Room', RoomSchema);

module.exports = Room;