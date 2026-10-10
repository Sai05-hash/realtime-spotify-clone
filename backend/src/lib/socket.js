import { Server } from "socket.io";
import { Message } from "../models/message.model.js";

// roomId -> { hostId, song, isPlaying, position, updatedAt }
const rooms = new Map();

const getRoomState = (roomId) => {
	const room = rooms.get(roomId);
	if (!room) return null;
	const elapsed = room.isPlaying ? (Date.now() - room.updatedAt) / 1000 : 0;
	return { song: room.song, isPlaying: room.isPlaying, position: room.position + elapsed };
};

export const initializeSocket = (server) => {
	const io = new Server(server, {
		cors: {
			origin: true, // allow phones and laptops on the same Wi-Fi
			credentials: true,
		},
	});

	const userSockets = new Map(); // { userId: socketId}
	const userActivities = new Map(); // {userId: activity}

	io.on("connection", (socket) => {
		socket.on("user_connected", (userId) => {
			userSockets.set(userId, socket.id);
			userActivities.set(userId, "Idle");

			// broadcast to all connected sockets that this user just logged in
			io.emit("user_connected", userId);

			socket.emit("users_online", Array.from(userSockets.keys()));

			io.emit("activities", Array.from(userActivities.entries()));
		});

		socket.on("update_activity", ({ userId, activity }) => {
			console.log("activity updated", userId, activity);
			userActivities.set(userId, activity);
			io.emit("activity_updated", { userId, activity });
		});

		// ---------- listen together ----------
		socket.on("join_room", ({ roomId, userId }) => {
			if (!roomId || !userId) return;
			socket.join(roomId);
			socket.data.roomId = roomId;

			let room = rooms.get(roomId);
			if (!room) {
				// first person in becomes the host
				room = { hostId: userId, song: null, isPlaying: false, position: 0, updatedAt: Date.now() };
				rooms.set(roomId, room);
			}

			socket.emit("room_joined", {
				roomId,
				isHost: room.hostId === userId,
				state: getRoomState(roomId),
			});
		});

		socket.on("host_update", ({ roomId, userId, song, isPlaying, position }) => {
			const room = rooms.get(roomId);
			if (!room || room.hostId !== userId) return; // only the host controls the room

			room.song = song;
			room.isPlaying = isPlaying;
			room.position = position;
			room.updatedAt = Date.now();

			socket.to(roomId).emit("room_state", getRoomState(roomId));
		});

		socket.on("leave_room", ({ roomId }) => {
			socket.leave(roomId);
			socket.data.roomId = null;
			if (!io.sockets.adapter.rooms.get(roomId)) rooms.delete(roomId);
		});
		// -------------------------------------

		socket.on("send_message", async (data) => {
			try {
				const { senderId, receiverId, content } = data;

				const message = await Message.create({
					senderId,
					receiverId,
					content,
				});

				// send to receiver in realtime, if they're online
				const receiverSocketId = userSockets.get(receiverId);
				if (receiverSocketId) {
					io.to(receiverSocketId).emit("receive_message", message);
				}

				socket.emit("message_sent", message);
			} catch (error) {
				console.error("Message error:", error);
				socket.emit("message_error", error.message);
			}
		});

		socket.on("disconnect", () => {
			let disconnectedUserId;
			for (const [userId, socketId] of userSockets.entries()) {
				// find disconnected user
				if (socketId === socket.id) {
					disconnectedUserId = userId;
					userSockets.delete(userId);
					userActivities.delete(userId);
					break;
				}
			}
			if (disconnectedUserId) {
				io.emit("user_disconnected", disconnectedUserId);
			}

			// clean up empty rooms
			const roomId = socket.data.roomId;
			if (roomId && !io.sockets.adapter.rooms.get(roomId)) rooms.delete(roomId);
		});
	});
};