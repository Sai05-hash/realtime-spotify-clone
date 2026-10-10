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
import { useMusicStore } from "@/stores/useMusicStore";
import { Album } from "@/types";
import { Pencil } from "lucide-react";
import { useRef, useState } from "react";

const EditAlbumDialog = ({ album }: { album: Album }) => {
	const { updateAlbum } = useMusicStore();
	const [open, setOpen] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const [form, setForm] = useState({
		title: album.title,
		artist: album.artist,
		releaseYear: String(album.releaseYear),
	});
	const [imageFile, setImageFile] = useState<File | null>(null);
	const imageInputRef = useRef<HTMLInputElement>(null);

	const handleOpenChange = (value: boolean) => {
		if (value) {
			setForm({
				title: album.title,
				artist: album.artist,
				releaseYear: String(album.releaseYear),
			});
			setImageFile(null);
		}
		setOpen(value);
	};

	const handleSubmit = async () => {
		setIsLoading(true);
		const formData = new FormData();
		formData.append("title", form.title);
		formData.append("artist", form.artist);
		formData.append("releaseYear", form.releaseYear);
		if (imageFile) formData.append("imageFile", imageFile);

		const ok = await updateAlbum(album._id, formData);
		setIsLoading(false);
		if (ok) setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<Button
				variant={"ghost"}
				size={"sm"}
				className='text-violet-400 hover:text-violet-300 hover:bg-violet-400/10'
				onClick={() => handleOpenChange(true)}
			>
				<Pencil className='size-4' />
			</Button>

			<DialogContent className='bg-zinc-900 border-zinc-700'>
				<DialogHeader>
					<DialogTitle>Edit Album</DialogTitle>
					<DialogDescription>Change the details. Leave the image empty to keep the old one.</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-4'>
					<input
						type='file'
						accept='image/*'
						ref={imageInputRef}
						className='hidden'
						onChange={(e) => setImageFile(e.target.files?.[0] || null)}
					/>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Artwork</label>
						<div className='flex items-center gap-3'>
							<img
								src={imageFile ? URL.createObjectURL(imageFile) : album.imageUrl}
								alt={album.title}
								className='size-16 rounded object-cover'
							/>
							<Button variant='outline' onClick={() => imageInputRef.current?.click()} className='flex-1'>
								{imageFile ? imageFile.name.slice(0, 25) : "Replace image"}
							</Button>
						</div>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Album Title</label>
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
						<label className='text-sm font-medium'>Release Year</label>
						<Input
							type='number'
							value={form.releaseYear}
							onChange={(e) => setForm({ ...form, releaseYear: e.target.value })}
							className='bg-zinc-800 border-zinc-700'
							min={1900}
							max={new Date().getFullYear()}
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => setOpen(false)} disabled={isLoading}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isLoading || !form.title || !form.artist}
						className='bg-violet-500 hover:bg-violet-600'
					>
						{isLoading ? "Saving..." : "Save Changes"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
export default EditAlbumDialog;