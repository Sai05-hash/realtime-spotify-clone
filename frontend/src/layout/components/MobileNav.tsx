import { useMusicStore } from "@/stores/useMusicStore";
import { SignedIn } from "@clerk/clerk-react";
import { HomeIcon, Library, MessageCircle, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import FriendsActivity from "./FriendsActivity";

type Sheet = "library" | "friends" | null;

const MobileNav = () => {
	const { albums, fetchAlbums } = useMusicStore();
	const { pathname } = useLocation();
	const [sheet, setSheet] = useState<Sheet>(null);

	useEffect(() => {
		fetchAlbums();
	}, [fetchAlbums]);

	const tab = "flex-1 flex flex-col items-center gap-0.5 py-2 text-[11px] active:bg-zinc-900";
	const color = (active: boolean) => (active ? "text-white" : "text-zinc-400");

	return (
		<>
			{/* bottom sheet */}
			{sheet && (
				<div className='fixed inset-0 z-[45] bg-black/60' onClick={() => setSheet(null)}>
					<div
						className='absolute inset-x-0 bottom-0 h-[75dvh] bg-zinc-900 rounded-t-2xl flex flex-col'
						onClick={(e) => e.stopPropagation()}
					>
						<div className='flex items-center justify-between px-4 py-3 border-b border-zinc-800'>
							<h2 className='font-semibold'>{sheet === "library" ? "Your Library" : "Friends"}</h2>
							<button className='p-2 -mr-2 text-zinc-400' onClick={() => setSheet(null)}>
								<X className='size-5' />
							</button>
						</div>

						<div className='flex-1 min-h-0 overflow-y-auto'>
							{sheet === "library" ? (
								<div className='p-2 space-y-1'>
									{albums.length === 0 && (
										<p className='text-sm text-zinc-400 p-4'>No albums yet.</p>
									)}
									{albums.map((album) => (
										<Link
											key={album._id}
											to={`/albums/${album._id}`}
											onClick={() => setSheet(null)}
											className='flex items-center gap-3 p-2 rounded-md active:bg-zinc-800'
										>
											<img
												src={album.imageUrl}
												alt={album.title}
												className='size-14 rounded-md object-cover flex-shrink-0'
											/>
											<div className='min-w-0'>
												<p className='font-medium truncate'>{album.title}</p>
												<p className='text-sm text-zinc-400 truncate'>Album • {album.artist}</p>
											</div>
										</Link>
									))}
								</div>
							) : (
								<div className='h-full'>
									<FriendsActivity />
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* tab bar */}
			<nav className='flex bg-black border-t border-zinc-800 pb-[env(safe-area-inset-bottom)]'>
				<Link to='/' onClick={() => setSheet(null)} className={`${tab} ${color(pathname === "/" && !sheet)}`}>
					<HomeIcon className='size-6' />
					Home
				</Link>

				<button
					className={`${tab} ${color(sheet === "library")}`}
					onClick={() => setSheet(sheet === "library" ? null : "library")}
				>
					<Library className='size-6' />
					Library
				</button>

				<SignedIn>
					<Link
						to='/chat'
						onClick={() => setSheet(null)}
						className={`${tab} ${color(pathname.startsWith("/chat") && !sheet)}`}
					>
						<MessageCircle className='size-6' />
						Chat
					</Link>
				</SignedIn>

				<button
					className={`${tab} ${color(sheet === "friends")}`}
					onClick={() => setSheet(sheet === "friends" ? null : "friends")}
				>
					<Users className='size-6' />
					Friends
				</button>
			</nav>
		</>
	);
};
export default MobileNav;