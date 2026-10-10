import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMusicStore } from "@/stores/useMusicStore";
import { Song } from "@/types";
import { Pencil } from "lucide-react";
import { useRef, useState } from "react";

const EditSongDialog = ({ song }: { song: Song }) => {
	const { albums, updateSong } = useMusicStore();
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [form, setForm] = useState({
		title: song.title,
		artist: song.artist,
		duration: String(song.duration),
		album: song.albumId || "none",
	});
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [audioFile, setAudioFile] = useState<File | null>(null);

	const imageInputRef = useRef<HTMLInputElement>(null);
	const audioInputRef = useRef<HTMLInputElement>(null);

	const handleOpenChange = (value: boolean) => {
		if (value) {
			// reset the form with the latest song data every time it opens
			setForm({
				title: song.title,
				artist: song.artist,
				duration: String(song.duration),
				album: song.albumId || "none",
			});
			setImageFile(null);
			setAudioFile(null);
		}
		setOpen(value);
	};

	const handleSubmit = async () => {
		setIsLoading(true);
		const formData = new FormData();
		formData.append("title", form.title);
		formData.append("artist", form.artist);
		formData.append("duration", form.duration || "0");
		formData.append("albumId", form.album);
		if (imageFile) formData.append("imageFile", imageFile);
		if (audioFile) formData.append("audioFile", audioFile);

		const ok = await updateSong(song._id, formData);
		setIsLoading(false);
		if (ok) setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<Button
				variant={"ghost"}
				size={"sm"}
				className='text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10'
				onClick={() => handleOpenChange(true)}
			>
				<Pencil className='size-4' />
			</Button>

			<DialogContent className='bg-zinc-900 border-zinc-700 max-h-[80vh] overflow-auto'>
				<DialogHeader>
					<DialogTitle>Edit Song</DialogTitle>
					<DialogDescription>Change the details. Leave files empty to keep the old ones.</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					<input
						type='file'
						accept='image/*'
						ref={imageInputRef}
						className='hidden'
						onChange={(e) => setImageFile(e.target.files?.[0] || null)}
					/>
					<input
						type='file'
						accept='audio/*'
						ref={audioInputRef}
						className='hidden'
						onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
					/>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Image</label>
						<div className='flex items-center gap-3'>
							<img
								src={imageFile ? URL.createObjectURL(imageFile) : song.imageUrl}
								alt={song.title}
								className='size-16 rounded object-cover'
							/>
							<Button variant='outline' onClick={() => imageInputRef.current?.click()} className='flex-1'>
								{imageFile ? imageFile.name.slice(0, 25) : "Replace image"}
							</Button>
						</div>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Audio</label>
						<Button variant='outline' onClick={() => audioInputRef.current?.click()} className='w-full'>
							{audioFile ? audioFile.name.slice(0, 25) : "Replace audio (optional)"}
						</Button>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Title</label>
						<Input
							value={form.title}
							onChange={(e) => setForm({ ...form, title: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Artist</label>
						<Input
							value={form.artist}
							onChange={(e) => setForm({ ...form, artist: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Duration (seconds)</label>
						<Input
							type='number'
							min='0'
							value={form.duration}
							onChange={(e) => setForm({ ...form, duration: e.target.value || "0" })}
							className='bg-zinc-800 border-zinc-700'
						/>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Album (Optional)</label>
						<Select value={form.album} onValueChange={(value) => setForm({ ...form, album: value })}>
							<SelectTrigger className='bg-zinc-800 border-zinc-700'>
								<SelectValue placeholder='Select album' />
							</SelectTrigger>
							<SelectContent className='bg-zinc-800 border-zinc-700'>
								<SelectItem value='none'>No Album (Single)</SelectItem>
								{albums.map((album) => (
									<SelectItem key={album._id} value={album._id}>
										{album.title}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => setOpen(false)} disabled={isLoading}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isLoading || !form.title || !form.artist}
						className='bg-emerald-500 hover:bg-emerald-600 text-black'
					>
						{isLoading ? "Saving..." : "Save Changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
export default EditSongDialog;