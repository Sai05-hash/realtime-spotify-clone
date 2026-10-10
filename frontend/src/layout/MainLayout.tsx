import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Outlet } from "react-router-dom";
import LeftSidebar from "./components/LeftSidebar";
import FriendsActivity from "./components/FriendsActivity";
import AudioPlayer from "./components/AudioPlayer";
import { PlaybackControls } from "./components/PlaybackControls";
import MobileNav from "./components/MobileNav";
import { useEffect, useState } from "react";

const MainLayout = () => {
	const [width, setWidth] = useState(window.innerWidth);

	useEffect(() => {
		const onResize = () => setWidth(window.innerWidth);
		window.addEventListener("resize", onResize);
		return () => window.removeEventListener("resize", onResize);
	}, []);

	const isPhone = width < 640;
	const isMobile = width < 768;

	// ---------- phone layout: one screen + mini player + bottom tabs ----------
	if (isPhone) {
		return (
			<div className='h-[100dvh] bg-black text-white flex flex-col'>
				<AudioPlayer />
				<div className='flex-1 min-h-0 overflow-hidden p-1'>
					<Outlet />
				</div>
				<PlaybackControls />
				<MobileNav />
			</div>
		);
	}

	// ---------- tablet / desktop layout (unchanged) ----------
	return (
		<div className='h-[100dvh] bg-black text-white flex flex-col'>
			<ResizablePanelGroup direction='horizontal' className='flex-1 flex h-full overflow-hidden p-2'>
				<AudioPlayer />
				{/* left sidebar */}
				<ResizablePanel defaultSize={20} minSize={isMobile ? 0 : 10} maxSize={30}>
					<LeftSidebar />
				</ResizablePanel>

				<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />

				{/* Main content */}
				<ResizablePanel defaultSize={isMobile ? 80 : 60}>
					<Outlet />
				</ResizablePanel>

				{!isMobile && (
					<>
						<ResizableHandle className='w-2 bg-black rounded-lg transition-colors' />

						{/* right sidebar */}
						<ResizablePanel defaultSize={20} minSize={0} maxSize={25} collapsedSize={0}>
							<FriendsActivity />
						</ResizablePanel>
					</>
				)}
			</ResizablePanelGroup>

			<PlaybackControls />
		</div>
	);
};
export default MainLayout;