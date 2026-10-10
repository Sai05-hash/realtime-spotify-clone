import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { usePlayerStore } from "@/stores/usePlayerStore";
import { ChevronDown, Pause, Play, Repeat, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { useEffect } from "react";

const formatTime = (seconds: number) => {
	if (!seconds || isNaN(seconds)) return "0:00";
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = Math.floor(seconds % 60);
	return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

interface FullScreenPlayerProps {
	open: boolean;
	onClose: () => void;
	currentTime: number;
	duration: number;
	onSeek: (value: number[]) => void;
}

export const FullScreenPlayer = ({ open, onClose, currentTime, duration, onSeek }: FullScreenPlayerProps) => {
	const { currentSong, isPlaying, togglePlay, playNext, playPrevious } = usePlayerStore();

	// close with the Esc key
	useEffect(() => {
		if (!open) return;
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", handleKey);
		return () => window.removeEventListener("keydown", handleKey);
	}, [open, onClose]);

	return (
		<div
className={`fixed inset-x-0 top-0 h-[100dvh] z-50 bg-zinc-950 text-white overflow-hidden transition-transform duration-500 ease-in-out ${
					open ? "translate-y-0" : "translate-y-full pointer-events-none"
			}`}
		>
			{/* blurred background from the cover */}
			{currentSong && (
				<img
					src={currentSong.imageUrl}
					alt=''
					className='absolute inset-0 w-full h-full object-cover blur-3xl scale-125 opacity-40'
				/>
			)}
			<div className='absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/90' />

<div className='relative z-10 h-full flex flex-col px-6 sm:px-12 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))]'>
					{/* top bar */}
				<div className='flex items-center justify-between'>
					<Button
						size='icon'
						variant='ghost'
						className='hover:bg-white/10 text-white rounded-full'
						onClick={onClose}
					>
						<ChevronDown className='h-7 w-7' />
					</Button>
					<div className='text-xs sm:text-sm uppercase tracking-widest text-zinc-300'>Now Playing</div>
					<div className='w-10' />
				</div>

				{/* cover + info */}
				<div className='flex-1 flex flex-col items-center justify-center gap-4 sm:gap-6 min-h-0 pb-4'>
					{currentSong ? (
						<>
							{/* full photo, never cropped */}
							<img
								src={currentSong.imageUrl}
								alt={currentSong.title}
								className='w-auto h-auto max-w-full max-h-[34vh] sm:max-h-[40vh] object-contain rounded-lg shadow-2xl shadow-black/60'
							/>
							<div className='w-full max-w-[420px] sm:max-w-[520px]'>
								{/* full title, wraps up to 2 lines */}
								<h2 className='text-2xl sm:text-4xl font-bold line-clamp-2'>{currentSong.title}</h2>
								<p className='text-base sm:text-lg text-zinc-300 truncate mt-1'>{currentSong.artist}</p>
							</div>
						</>
					) : (
						<p className='text-zinc-400'>No song playing</p>
					)}

					{/* progress */}
					<div className='w-full max-w-[420px] sm:max-w-[520px]'>
						<Slider
							value={[currentTime]}
							max={duration || 100}
							step={1}
							className='w-full hover:cursor-grab active:cursor-grabbing'
							onValueChange={onSeek}
						/>
						<div className='flex justify-between text-xs text-zinc-300 mt-2 select-none'>
							<span>{formatTime(currentTime)}</span>
							<span>{formatTime(duration)}</span>
						</div>
					</div>

					{/* controls */}
					<div className='flex items-center gap-5 sm:gap-8'>
						<Button size='icon' variant='ghost' className='text-zinc-300 hover:text-white'>
							<Shuffle className='h-5 w-5' />
						</Button>
						<Button
							size='icon'
							variant='ghost'
							className='text-white hover:bg-white/10'
							onClick={playPrevious}
							disabled={!currentSong}
						>
							<SkipBack className='h-7 w-7' />
						</Button>
						<Button
							size='icon'
							className='bg-white hover:bg-white/80 text-black rounded-full h-14 w-14'
							onClick={togglePlay}
							disabled={!currentSong}
						>
							{isPlaying ? <Pause className='h-7 w-7' /> : <Play className='h-7 w-7' />}
						</Button>
						<Button
							size='icon'
							variant='ghost'
							className='text-white hover:bg-white/10'
							onClick={playNext}
							disabled={!currentSong}
						>
							<SkipForward className='h-7 w-7' />
						</Button>
						<Button size='icon' variant='ghost' className='text-zinc-300 hover:text-white'>
							<Repeat className='h-5 w-5' />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};