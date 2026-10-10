import { useMusicStore } from "@/stores/useMusicStore";
import { usePlayerStore } from "@/stores/usePlayerStore";
import FeaturedGridSkeleton from "@/components/skeletons/FeaturedGridSkeleton";
import PlayButton from "./PlayButton";

const FeaturedSection = () => {
	const { isLoading, featuredSongs, error } = useMusicStore();
	const { currentSong, setCurrentSong, togglePlay } = usePlayerStore();

	if (isLoading) return <FeaturedGridSkeleton />;

	if (error) return <p className='text-red-500 mb-4 text-lg'>{error}</p>;

	return (
		<div className='grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-8'>
			{featuredSongs.map((song) => (
				<div
					key={song._id}
					// tap anywhere on the card to play (phones have no hover button)
					onClick={(e) => {
						if ((e.target as HTMLElement).closest("button")) return;
						if (currentSong?._id === song._id) togglePlay();
						else setCurrentSong(song);
					}}
					className='flex items-center bg-zinc-800/50 rounded-md overflow-hidden
         hover:bg-zinc-700/50 transition-colors group cursor-pointer relative'
				>
					<img
						src={song.imageUrl}
						alt={song.title}
						className='w-14 sm:w-20 h-14 sm:h-20 object-cover flex-shrink-0'
					/>
					<div className='flex-1 min-w-0 p-2 sm:p-4'>
						<p className='font-medium truncate text-sm sm:text-base'>{song.title}</p>
						<p className='text-xs sm:text-sm text-zinc-400 truncate'>{song.artist}</p>
					</div>
					<PlayButton song={song} />
				</div>
			))}
		</div>
	);
};
export default FeaturedSection;