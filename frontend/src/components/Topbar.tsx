import { SignedOut, UserButton } from "@clerk/clerk-react";
import { LayoutDashboardIcon } from "lucide-react";
import { Link } from "react-router-dom";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";

const Topbar = () => {
	const { isAdmin } = useAuthStore();

	return (
		<div
			className='flex items-center justify-between p-3 sm:p-4 sticky top-0 bg-zinc-900/75 
      backdrop-blur-md z-10 pt-[max(0.75rem,env(safe-area-inset-top))]
    '
		>
			<div className='flex gap-2 items-center'>
				<img src='/spotify.png' className='size-8' alt='Spotify logo' />
				<span className='font-medium'>Spotify</span>
			</div>
			<div className='flex items-center gap-2 sm:gap-4'>
				{isAdmin && (
					<Link to={"/admin"} className={cn(buttonVariants({ variant: "outline" }))}>
						<LayoutDashboardIcon className='size-4 sm:mr-2' />
						<span className='hidden sm:inline'>Admin Dashboard</span>
					</Link>
				)}

				<SignedOut>
					<SignInOAuthButtons />
				</SignedOut>

				<UserButton />
			</div>
		</div>
	);
};
export default Topbar;