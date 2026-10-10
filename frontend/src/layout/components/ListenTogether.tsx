import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/useChatStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { Check, Copy, LogOut, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const makeRoomId = () => Math.random().toString(36).slice(2, 8);

export const ListenTogether = () => {
	const socket = useChatStore.getState().socket;

	const [roomId, setRoomId] = useState<string | null>(null);
	const [isHost, setIsHost] = useState(false);
	const [invite, setInvite] = useState<string | null>(null);
	const [copied, setCopied] = useState(false);
	const roomRef = useRef<{ roomId: string | null; isHost: boolean }>({ roomId: null, isHost: false });

	// remember the ?room= from the link (survives the sign-in redirect)
	useEffect(() => {
		const param = new URLSearchParams(window.location.search).get("room");
		if (param) sessionStorage.setItem("pendingRoom", param);
		setInvite(sessionStorage.getItem("pendingRoom"));
	}, []);

	// host: send current state to the room
	const sendUpdate = (positionOverride?: number) => {
		const { roomId, isHost } = roomRef.current;
		if (!roomId || !isHost) return;
		const player = usePlayerStore.getState();
		const audio = document.querySelector("audio");
		socket.emit("host_update", {
			roomId,
			userId: socket.auth?.userId,
			song: player.currentSong,
			isPlaying: player.isPlaying,
			position: positionOverride ?? audio?.currentTime ?? 0,
		});
	};

	// listener: copy the host's state
	const applyState = (state: any) => {
		if (!state || !state.song) return;
		const player = usePlayerStore.getState();
		const songChanged = player.currentSong?._id !== state.song._id;
		const idx = player.queue.findIndex((s) => s._id === state.song._id);

		usePlayerStore.setState({
			currentSong: state.song,
			isPlaying: state.isPlaying,
			currentIndex: idx !== -1 ? idx : player.currentIndex,
		});

		const seek = () => {
			const audio = document.querySelector("audio");
			if (!audio) return;
			const doSeek = () => {
				if (Math.abs(audio.currentTime - state.position) > 1.5) audio.currentTime = state.position;
			};
			if (audio.readyState >= 1) doSeek();
			else audio.addEventListener("loadedmetadata", doSeek, { once: true });
		};
		setTimeout(seek, songChanged ? 500 : 0);
	};

	useEffect(() => {
		const onJoined = ({ roomId, isHost, state }: any) => {
			roomRef.current = { roomId, isHost };
			setRoomId(roomId);
			setIsHost(isHost);
			if (isHost) sendUpdate();
			else applyState(state);
		};
		const onState = (state: any) => {
			if (!roomRef.current.isHost) applyState(state);
		};

		socket.on("room_joined", onJoined);
		socket.on("room_state", onState);

		// host: song or play/pause changed
		const unsub = usePlayerStore.subscribe((state, prev) => {
			if (state.currentSong?._id !== prev.currentSong?._id) sendUpdate(0);
			else if (state.isPlaying !== prev.isPlaying) sendUpdate();
		});

		// host: seeked (media events don't bubble, so use capture)
		const onSeeked = () => sendUpdate();
		document.addEventListener("seeked", onSeeked, true);

		// host: heartbeat to fix drift
		const interval = setInterval(() => sendUpdate(), 5000);

		return () => {
			socket.off("room_joined", onJoined);
			socket.off("room_state", onState);
			unsub();
			document.removeEventListener("seeked", onSeeked, true);
			clearInterval(interval);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const joinRoom = (id: string) => {
		const userId = socket.auth?.userId;
		if (!userId) {
			alert("Please sign in first, then try again.");
			return;
		}
		socket.emit("join_room", { roomId: id, userId });
	};

	const leaveRoom = () => {
		if (roomRef.current.roomId) socket.emit("leave_room", { roomId: roomRef.current.roomId });
		roomRef.current = { roomId: null, isHost: false };
		setRoomId(null);
		setIsHost(false);
	};

	const copyLink = async () => {
		const link = `${window.location.origin}/?room=${roomId}`;
		try {
			await navigator.clipboard.writeText(link);
		} catch {
			// browsers block the clipboard on plain http addresses, so show the link instead
			window.prompt("Copy this link:", link);
		}
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const acceptInvite = () => {
		if (!invite) return;
		joinRoom(invite);
		sessionStorage.removeItem("pendingRoom");
		window.history.replaceState({}, "", window.location.pathname);
		setInvite(null);
	};

	return (
		<>
			{/* invite popup for people who opened a room link */}
			{invite && !roomId && (
				<div className='fixed inset-0 z-[60] bg-black/70 flex items-center justify-center p-4'>
					<div className='bg-zinc-900 border border-zinc-700 rounded-xl p-6 max-w-sm w-full text-center'>
						<Users className='h-10 w-10 text-emerald-500 mx-auto mb-3' />
						<h3 className='text-xl font-bold'>Listen together</h3>
						<p className='text-zinc-400 text-sm mt-2'>
							You were invited to a listening room. Join to hear the same song, in sync.
						</p>
						<div className='flex gap-3 mt-5 justify-center'>
							<Button
								variant='ghost'
								onClick={() => {
									sessionStorage.removeItem("pendingRoom");
									setInvite(null);
								}}
							>
								No thanks
							</Button>
							<Button className='bg-emerald-500 hover:bg-emerald-600 text-black' onClick={acceptInvite}>
								Join and listen
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* floating button / status */}
<div className='fixed bottom-44 sm:bottom-28 right-4 z-40'>
					{!roomId ? (
					<Button
						className='bg-zinc-800 hover:bg-zinc-700 text-white rounded-full gap-2'
						onClick={() => joinRoom(makeRoomId())}
					>
						<Users className='h-4 w-4' />
						Listen together
					</Button>
				) : (
					<div className='flex items-center gap-2 bg-emerald-600 text-black rounded-full pl-4 pr-1 py-1 text-sm font-medium'>
						<Users className='h-4 w-4' />
						<span>{isHost ? "Hosting" : "Listening"} · {roomId}</span>
						<Button size='icon' variant='ghost' className='h-8 w-8 hover:bg-black/10' onClick={copyLink}>
							{copied ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
						</Button>
						<Button size='icon' variant='ghost' className='h-8 w-8 hover:bg-black/10' onClick={leaveRoom}>
							<LogOut className='h-4 w-4' />
						</Button>
					</div>
				)}
			</div>
		</>
	);
};